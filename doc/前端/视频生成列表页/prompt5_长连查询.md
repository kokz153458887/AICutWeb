# 视频生成状态长连接设计

## 1. 需求
在视频列表页面，当发现有视频处于生成中状态时，需要实时获取视频生成的状态更新。

## 2. 技术方案
使用 Socket.IO 建立长连接，采用简单的发布-订阅模式。

### 2.1 前端实现
```typescript
// 状态定义
interface VideoGenerationStatus {
  generateId: string;
  status: 'generating' | 'done' | 'faile d';
}

// Socket 连接配置
const socket = io(api.getApiBaseUrl, {
  path: '/video-generation_status',
  transports: ['websocket']
});

// 事件监听
socket.on('taskStatusUpdate', (update: VideoGenerationStatus) => {
  // 更新视频状态, 查找当前页面数据 videos 中，与该任务ID（VideoCardData.generateId）相同的 video，仅更新它的数据，不要触发全页刷新

```

### 2.2 事件设计
1. 客户端发送事件：
```typescript
// 订阅任务状态
socket.emit('subscribeTasks', {
  taskIds: ['task1', 'task2']  // 生成中的视频ID列表
});
```

2. 服务端推送事件：
```typescript
// 状态更新推送
socket.emit('taskStatusUpdate', {
  generateId: 'task1',
  status: 'done'
});
```

## 3. 实现步骤

### 3.1 初始化时机
1. 检查是否有生成中的视频，VideoCardData.status == generating
2. 订阅这些视频的状态更新

### 3.2 状态更新处理
更新视频状态, 查找当前页面数据 videos 中，与该任务ID（VideoCardData.generateId）相同的 video，仅更新它的数据，不要触发全页刷新

## 5. 注意事项
1. 只在有生成中视频时建立连接
2. 页面卸载时断开连接
3. 保持简单的状态同步，不需要复杂的重试机制
4. 使用 websocket 传输方式，避免轮询
5. 错误时在控制台打印日志即可

## 6. 接口约定

### 6.1 客户端事件
- 事件名：subscribeTasks
- 参数：
  ```typescript
  {
    taskIds: string[]  // 需要订阅的任务ID列表
  }
  ```

### 6.2 服务端事件
- 事件名：taskStatusUpdate
- 参数：
  ```typescript
  {
    generateId: string,
    videoCardData: VideoCardData,
    status: 'generating' | 'done' | 'failed'
  }
  ```

这个设计保持了简单性，只关注核心功能：
1. 建立连接
2. 订阅状态
3. 处理更新
4. 断开连接

不包含的复杂功能：
1. 重连机制
2. 消息队列
3. 心跳检测
4. 房间管理
5. 状态恢复
