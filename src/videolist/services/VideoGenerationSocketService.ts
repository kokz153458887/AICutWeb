/**
 * 视频生成状态Socket服务
 * 负责管理与服务器的WebSocket连接，处理视频生成状态的实时更新
 */
import { Socket, io } from 'socket.io-client';
import { VideoCardData } from '../api/videoListApi';
import { API_CONFIG } from '../../config/api';

interface VideoGenerationStatus {
  generateId: string;
  status: VideoCardData['status'];
  taskData?: VideoCardData;
}

type StatusUpdateCallback = (generateId: string, status: VideoCardData['status'], taskData?: VideoCardData) => void;

/**
 * 视频生成状态Socket服务类
 */
export class VideoGenerationSocketService {
  private socket: Socket | null = null;
  private subscribedTasks: Set<string> = new Set();
  private pendingTasks: Set<string> = new Set();
  private statusUpdateCallback: StatusUpdateCallback;
  private isReconnecting: boolean = false;
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;
  private subscriptionRetryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 构造函数
   * @param statusUpdateCallback 状态更新回调函数
   */
  constructor(statusUpdateCallback: StatusUpdateCallback) {
    this.statusUpdateCallback = statusUpdateCallback;
  }

  /**
   * 检查socket连接状态
   */
  private isSocketHealthy(): boolean {
    return this.socket?.connected === true && !this.isReconnecting;
  }

  /**
   * 清理现有socket连接
   */
  public cleanup(): void {
    // 清理所有重试定时器
    this.subscriptionRetryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.subscriptionRetryTimeouts.clear();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscribedTasks.clear();
    this.pendingTasks.clear();
    this.isReconnecting = false;
    this.retryCount = 0;
  }

  /**
   * 重试订阅
   */
  private retrySubscription(taskId: string): void {
    if (this.subscriptionRetryTimeouts.has(taskId)) {
      clearTimeout(this.subscriptionRetryTimeouts.get(taskId));
    }

    if (this.retryCount >= this.maxRetries) {
      console.error(`订阅任务 ${taskId} 失败，已达到最大重试次数`);
      this.pendingTasks.delete(taskId);
      return;
    }

    const timeout = setTimeout(() => {
      if (this.pendingTasks.has(taskId)) {
        console.log(`重试订阅任务 ${taskId}`);
        this.processPendingTasks();
        this.retryCount++;
      }
    }, 1000 * Math.pow(2, this.retryCount));

    this.subscriptionRetryTimeouts.set(taskId, timeout);
  }

  /**
   * 发送订阅请求
   */
  private emitSubscribe(taskIds: string[]): boolean {
    if (!this.socket?.connected || taskIds.length === 0) {
      console.log('发送订阅请求失败:', taskIds);
      return false;
    }

    try {
      console.log('发送订阅请求:', taskIds);
      this.socket.emit('subscribeTasks', { taskIds }, (response: { success: boolean, error?: string }) => {
        if (response.success) {
          // 订阅成功
          console.log('订阅成功:', taskIds);

          taskIds.forEach(id => {
            this.subscribedTasks.add(id);
            this.pendingTasks.delete(id);
            if (this.subscriptionRetryTimeouts.has(id)) {
              clearTimeout(this.subscriptionRetryTimeouts.get(id));
              this.subscriptionRetryTimeouts.delete(id);
            }
          });
          this.retryCount = 0;
        } else {
          // 订阅失败，进入重试逻辑
          console.error('订阅请求失败:', response.error);
          taskIds.forEach(id => this.retrySubscription(id));
        }
      });
      return true;
    } catch (error) {
      console.error('发送订阅请求失败:', error);
      taskIds.forEach(id => this.retrySubscription(id));
      return false;
    }
  }

  /**
   * 处理待处理的订阅
   */
  private processPendingTasks(): void {
    if (this.pendingTasks.size === 0) {
      return;
    }

    const pendingTasks = Array.from(this.pendingTasks);
    this.emitSubscribe(pendingTasks);
  }

  /**
   * 订阅任务状态更新
   */
  public subscribeTasks(taskIds: string[]): void {
    console.log('订阅任务:', taskIds);
    if (taskIds.length === 0) {
      return;
    }

    // 过滤掉已经订阅的任务
    const newTaskIds = taskIds.filter(id => 
      !this.subscribedTasks.has(id) && 
      !this.pendingTasks.has(id)
    );
    
    if (newTaskIds.length === 0) {
      return;
    }

    console.log('添加订阅任务:', newTaskIds);
    newTaskIds.forEach(id => this.pendingTasks.add(id));

    // 如果没有socket或socket未连接，则初始化
    if (!this.socket || !this.socket.connected) {
      console.log('Socket未连接，开始初始化');
      this.initSocket();
    } else if (this.isSocketHealthy()) {
      console.log('Socket健康，处理待处理任务');
      this.processPendingTasks();
    }
  }

  /**
   * 取消订阅任务
   * 只在任务完成或失败时调用
   */
  public unsubscribeTasks(taskIds: string[]): void {
    if (!this.isSocketHealthy() || taskIds.length === 0) {
      return;
    }

    // 过滤出已完成或失败的任务
    const tasksToUnsubscribe = taskIds.filter(id => {
      const isSubscribed = this.subscribedTasks.has(id);
      // 由于我们只在状态更新为 done 或 failed 时才调用此方法
      // 所以这里可以直接返回是否已订阅
      return isSubscribed;
    });

    if (tasksToUnsubscribe.length > 0) {
      this.socket!.emit('unsubscribeTasks', { taskIds: tasksToUnsubscribe }, (response: { success: boolean }) => {
        if (response.success) {
          tasksToUnsubscribe.forEach(id => {
            this.subscribedTasks.delete(id);
            console.log(`成功取消订阅任务: ${id}`);
          });
        }
      });
    }
  }

  /**
   * 获取已订阅的任务列表
   */
  public getSubscribedTasks(): string[] {
    return Array.from(this.subscribedTasks);
  }

  /**
   * 获取待处理的任务列表
   */
  public getPendingTasks(): string[] {
    return Array.from(this.pendingTasks);
  }

  /**
   * 获取已订阅任务数量
   */
  public getSubscribedTasksCount(): number {
    return this.subscribedTasks.size;
  }

  /**
   * 获取待处理任务数量
   */
  public getPendingTasksCount(): number {
    return this.pendingTasks.size;
  }

  /**
   * 更新状态回调函数
   */
  public updateCallback(callback: StatusUpdateCallback): void {
    this.statusUpdateCallback = callback;
  }

  /**
   * 处理任务状态更新
   */
  private handleTaskStatusUpdate(update: any): void {
    try {
      console.log('handleTaskStatusUpdate 处理任务状态更新:', JSON.stringify(update));
      // 验证更新数据
      if (!update.generateId || !update.status) {
        console.error('无效的状态更新数据:', update);
        return;
      }

      // 检查是否是已订阅的任务
      if (!this.subscribedTasks.has(update.generateId)) {
        console.warn('收到未订阅任务的状态更新:', update.generateId);
        return;
      }

      // 调用状态更新回调，使用 videoCardData 而不是 taskData
      try {
        this.statusUpdateCallback(update.generateId, update.status, update.videoCardData);
      } catch (error) {
        console.error('状态更新回调执行失败:', error);
      }

      // 只有在任务完成或失败时才取消订阅
      if (update.status === 'done' || update.status === 'failed') {
        this.subscribedTasks.delete(update.generateId);
        this.pendingTasks.delete(update.generateId);

        // 如果没有任何订阅的任务，清理连接
        if (this.subscribedTasks.size === 0 && this.pendingTasks.size === 0) {
          console.log('没有需要监听的任务，断开连接');
          this.cleanup();
        }
      }
    } catch (error) {
      console.error('处理状态更新失败:', error);
    }
  }

  /**
   * 处理连接错误
   */
  private handleConnectionError(): void {
    this.isReconnecting = true;
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`连接失败，${this.retryCount}秒后重试...`);
      setTimeout(() => this.initSocket(), this.retryCount * 1000);
    } else {
      console.error('连接重试次数已达上限，停止重试');
    }
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect(): void {
    this.isReconnecting = true;
    // 断开连接时，所有任务重新进入待处理状态
    this.subscribedTasks.forEach(taskId => this.pendingTasks.add(taskId));
    this.subscribedTasks.clear();
  }

  /**
   * 初始化Socket连接
   */
  private initSocket(): void {
    console.log('开始初始化Socket, 当前状态:', {
      socketExists: !!this.socket,
      connected: this.socket?.connected,
      isReconnecting: this.isReconnecting
    });

    // 如果已经有socket实例，先清理掉
    if (this.socket) {
      console.log('清理现有Socket连接');
      this.cleanup();
    }

    try {
      console.log('初始化Socket连接 url:', API_CONFIG.baseURL);
      
      // 直接连接到命名空间
      this.socket = io(`${API_CONFIG.baseURL}/video-generation_status`, {
        // 使用默认的 socket.io 路径
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: false,
        randomizationFactor: 0.5,
        timeout: 5000,
        autoConnect: true
      });

      if (!this.socket) {
        throw new Error('Failed to create socket instance');
      }

      // 添加连接事件处理
      this.socket.on('connect', () => {
        console.log('Socket连接成功，socket id:', this.socket?.id);
        this.isReconnecting = false;
        this.retryCount = 0;
        // 连接成功后立即处理待处理任务
        if (this.pendingTasks.size > 0) {
          console.log('处理待处理任务，数量:', this.pendingTasks.size);
          this.processPendingTasks();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket连接错误:', error);
        this.handleConnectionError();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket断开连接, 原因:', reason);
        this.handleDisconnect();
      });

      this.socket.on('error', (error) => {
        console.error('Socket错误:', error);
        this.handleConnectionError();
      });

      this.socket.on('taskStatusUpdate', this.handleTaskStatusUpdate.bind(this));

      // 确保连接
      if (!this.socket.connected) {
        console.log('Socket未连接，尝试连接');
        this.socket.connect();
      }

    } catch (error) {
      console.error('初始化Socket失败:', error);
      this.handleConnectionError();
    }
  }
} 