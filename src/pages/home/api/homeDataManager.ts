import { HomeData } from './homeApiModel';
import { HomeApiService } from './homeApi';

/**
 * 首页数据管理器类
 * 负责获取、缓存和管理首页数据的所有逻辑
 */
export class HomeDataManager {
  // 数据缓存，存储已获取的数据，使用Map以支持更好的缓存管理
  private static dataCache: Map<string, HomeData> = new Map();
  
  // 进行中的请求记录
  private static pendingRequests: Map<string, Promise<{data: HomeData}>> = new Map();
  
  // 全局请求计数器
  private static globalRequestCount: number = 0;
  
  // 组件是否已挂载的引用
  private isMountedRef: React.MutableRefObject<boolean>;
  
  // 当前加载的tab ID的引用
  private currentTabIdRef: React.MutableRefObject<string | null>;
  
  // 本地请求ID，用于防止竞态条件
  private requestIdRef: React.MutableRefObject<number>;
  
  // 状态更新函数
  private setHomeData: (data: HomeData | null) => void;
  private setLoading: (loading: boolean) => void;
  private setError: (error: string | null) => void;
  
  // 当前搜索参数
  private searchParams: URLSearchParams;
  
  /**
   * 构造函数
   * @param setters 状态更新函数集合
   * @param refs 引用集合
   * @param searchParams URL搜索参数
   */
  constructor(
    setters: {
      setHomeData: (data: HomeData | null) => void;
      setLoading: (loading: boolean) => void;
      setError: (error: string | null) => void;
    },
    refs: {
      isMountedRef: React.MutableRefObject<boolean>;
      currentTabIdRef: React.MutableRefObject<string | null>;
      requestIdRef: React.MutableRefObject<number>;
    },
    searchParams: URLSearchParams
  ) {
    this.setHomeData = setters.setHomeData;
    this.setLoading = setters.setLoading;
    this.setError = setters.setError;
    
    this.isMountedRef = refs.isMountedRef;
    this.currentTabIdRef = refs.currentTabIdRef;
    this.requestIdRef = refs.requestIdRef;
    
    this.searchParams = searchParams;
  }
  
  /**
   * 创建缓存键
   * @param topbar 标签ID
   * @returns 唯一的缓存键
   */
  private createCacheKey(topbar: string): string {
    return `home_data_${topbar}`;
  }
  
  /**
   * 安全设置组件状态
   * 确保只在组件挂载时更新状态
   */
  private safeSetState(
    data: HomeData | null = null, 
    isLoading: boolean = false, 
    errorMsg: string | null = null
  ): void {
    if (!this.isMountedRef.current) return;
    
    if (data !== null) this.setHomeData(data);
    this.setLoading(isLoading);
    this.setError(errorMsg);
  }
  
  /**
   * 尝试复用正在进行的请求
   * @param cacheKey 缓存键
   * @param topbar 标签ID
   * @param requestId 请求ID
   * @returns 如果成功复用请求则返回true，否则返回false
   */
  private async tryReuseExistingRequest(cacheKey: string, topbar: string, requestId: number): Promise<boolean> {
    const existingRequest = HomeDataManager.pendingRequests.get(cacheKey);
    if (!existingRequest) return false;

    console.log(`[HomeDataManager] 复用正在进行的请求: ${topbar}`);
    try {
      // 标记正在加载
      this.safeSetState(null, true, null);
      
      const response = await existingRequest;
      
      // 检查请求ID是否仍然是当前请求
      if (requestId !== this.requestIdRef.current) {
        console.log(`[HomeDataManager] 丢弃过时的请求结果: ${requestId} vs ${this.requestIdRef.current}`);
        return true;
      }
      
      // 检查响应有效性
      if (response && response.data) {
        this.safeSetState(response.data, false, null);
      }
    } catch (err) {
      console.warn(`[HomeDataManager] 复用请求出错:`, err);
      // 请求失败但仍算作已处理
    } finally {
      this.safeSetState(null, false, null);
    }
    return true;
  }
  
  /**
   * 发送新的数据请求
   * @param cacheKey 缓存键
   * @param topbar 标签ID
   * @param requestId 请求ID
   */
  private async sendNewRequest(cacheKey: string, topbar: string, requestId: number): Promise<void> {
    // 增加全局请求计数
    HomeDataManager.globalRequestCount++;
    console.log(`[HomeDataManager] 开始加载新数据: ${topbar}, 全局请求计数: ${HomeDataManager.globalRequestCount}`);
    
    // 标记正在加载
    this.safeSetState(null, true, null);
    
    // 创建请求并存储到pendingRequests
    const request = HomeApiService.getHomeData({ topbar });
    HomeDataManager.pendingRequests.set(cacheKey, request);
    
    try {
      const response = await request;
      
      // 请求完成后从pendingRequests中删除
      HomeDataManager.pendingRequests.delete(cacheKey);
      
      // 检查请求ID是否仍然是当前请求
      if (requestId !== this.requestIdRef.current) {
        console.log(`[HomeDataManager] 丢弃过时的请求结果 (ID不匹配): ${requestId} vs ${this.requestIdRef.current}`);
        return;
      }
      
      // 确保回调时仍然是当前tab ID，避免竞态条件
      if (this.currentTabIdRef.current !== topbar) {
        console.log(`[HomeDataManager] 丢弃过期数据 (Tab变化): ${topbar}, 当前ID: ${this.currentTabIdRef.current}`);
        return;
      }
      
      if (response && response.data) {
        // 更新缓存
        HomeDataManager.dataCache.set(cacheKey, response.data);
        this.safeSetState(response.data, false, null);
      } else {
        throw new Error('返回数据格式不正确');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取首页数据失败';
      this.safeSetState(null, false, errorMessage);
      console.error('[HomeDataManager] 获取首页数据失败:', err);
      
      // 出错时也要从pendingRequests中删除
      HomeDataManager.pendingRequests.delete(cacheKey);
    }
  }
  
  /**
   * 获取首页数据
   * @param id 可选的标签ID，如果不提供则使用URL中的参数
   */
  public async fetchHomeData(id?: string): Promise<void> {
    try {
      // 递增请求ID，用于防止竞态条件
      this.requestIdRef.current = (this.requestIdRef.current || 0) + 1;
      const currentRequestId = this.requestIdRef.current;
      
      // 使用传入的id作为topbar参数
      const topbar = id || this.searchParams.get('homebar') || 'recommend';
      
      // 更新当前加载的tab ID
      this.currentTabIdRef.current = topbar;
      
      // 创建缓存键
      const cacheKey = this.createCacheKey(topbar);
      
      // 检查缓存
      const cachedData = HomeDataManager.dataCache.get(cacheKey);
      if (cachedData) {
        console.log(`[HomeDataManager] 使用缓存数据: ${topbar}`);
        this.safeSetState(cachedData, false, null);
        return;
      }
      
      // 尝试复用正在进行的请求
      const hasReusedRequest = await this.tryReuseExistingRequest(cacheKey, topbar, currentRequestId);
      if (hasReusedRequest) return;
      
      // 发送新请求
      await this.sendNewRequest(cacheKey, topbar, currentRequestId);
    } catch (err) {
      console.error('[HomeDataManager] fetchHomeData出错:', err);
      this.safeSetState(null, false, '获取数据失败');
    }
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    this.isMountedRef.current = false;
  }
  
  /**
   * 重置缓存
   * 用于测试或强制刷新时
   */
  public static resetCache(): void {
    HomeDataManager.dataCache.clear();
    HomeDataManager.pendingRequests.clear();
    console.log('[HomeDataManager] 已重置缓存');
  }
}
