# 视频生成状态实时更新接口文档

## 1. 概述

本文档描述了视频生成状态实时更新功能的 WebSocket 接口实现细节。该功能用于在视频生成过程中，实时向前端推送视频生成状态的变更。

## 2. 技术栈

- 后端：Node.js
- WebSocket 实现：Socket.IO
- 协议：WebSocket

## 3. 连接配置

### 3.1 连接地址
```javascript
const socket = io(API_CONFIG.fullBaseURL, {
  path: '/video-generation_status',  // WebSocket 路径
  transports: ['websocket'],         // 仅使用 WebSocket 传输
  reconnection: true,                // 启用自动重连
  reconnectionAttempts: 2,           // 最大重连次数
  reconnectionDelay: 1000,           // 重连延迟（毫秒）
  reconnectionDelayMax: 5000,        // 最大重连延迟（毫秒）
  timeout: 5000                      // 连接超时时间（毫秒）
});
```

## 4. 事件定义

### 4.1 客户端发送的事件

#### subscribeTasks
- 说明：订阅指定任务的状态更新
- 参数：
  ```typescript
  {
    taskIds: string[]  // 要订阅的任务ID数组
  }
  ```
- 响应：
  ```typescript
  {
    success: boolean,  // 订阅是否成功
    error?: string     // 错误信息（如果失败）
  }
  ```

#### unsubscribeTasks
- 说明：取消订阅指定任务的状态更新
- 参数：
  ```typescript
  taskIds: string[]  // 要取消订阅的任务ID数组
  ```
- 响应：
  ```typescript
  {
    success: boolean  // 取消订阅是否成功
  }
  ```

### 4.2 服务器发送的事件

#### taskStatusUpdate
- 说明：推送任务状态更新
- 数据格式：
  ```typescript
  {
    generateId: string,           // 视频生成任务ID
    status: 'generating' | 'done' | 'failed',  // 任务状态
    videoCardData?: {            // 视频卡片完整数据（在各个状态下都需要提供）
      generateId: string,        // 视频生成任务ID
      status: string,           // 视频状态
      title: string,           // 视频标题
      description: string,     // 视频描述
      thumbnailUrl: string,    // 缩略图URL
      videoUrl: string,        // 视频URL
      createTime: string,      // 创建时间
      updateTime: string,      // 更新时间
      // ... 其他视频相关字段
    }
  }
  ```

## 5. 状态流转

视频状态的流转过程如下：
1. generating：视频正在生成中
2. done：视频生成完成
3. failed：视频生成失败

## 6. 实现要求

### 6.1 连接管理
- 服务端需要维护活跃连接的列表
- 支持客户端的自动重连机制
- 在连接断开时，清理相关的订阅信息

### 6.2 订阅管理
- 为每个连接维护其订阅的任务列表
- 支持批量订阅和取消订阅
- 在任务完成或失败后自动清理订阅

### 6.3 状态更新
- 当视频状态发生变化时，主动推送更新
- 在视频生成完成时，提供完整的视频卡片数据
- 确保消息的可靠传递

### 6.4 错误处理
- 对无效的任务ID进行校验
- 处理订阅/取消订阅失败的情况
- 提供清晰的错误信息

### 6.5 性能考虑
- 合理控制单个连接的订阅数量
- 及时清理不再需要的订阅
- 避免无效的状态更新推送

## 7. 示例代码

### 7.1 服务端实现示例

```javascript
const io = require('socket.io')(server);

// 设置 Socket.IO 路径
io.path('/video-generation_status');

// 存储订阅关系
const subscriptions = new Map();

io.on('connection', (socket) => {
  console.log('新的客户端连接');

  // 处理订阅请求
  socket.on('subscribeTasks', async ({ taskIds }, callback) => {
    try {
      // 验证任务ID
      const validTaskIds = await validateTaskIds(taskIds);
      
      // 保存订阅关系
      if (!subscriptions.has(socket.id)) {
        subscriptions.set(socket.id, new Set());
      }
      validTaskIds.forEach(id => subscriptions.get(socket.id).add(id));

      callback({ success: true });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // 处理取消订阅请求
  socket.on('unsubscribeTasks', (taskIds, callback) => {
    if (subscriptions.has(socket.id)) {
      taskIds.forEach(id => subscriptions.get(socket.id).delete(id));
    }
    callback({ success: true });
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    subscriptions.delete(socket.id);
  });
});

// 发送状态更新
function sendStatusUpdate(taskId, status, videoData = null) {
  // 查找订阅了该任务的所有连接
  for (const [socketId, tasks] of subscriptions.entries()) {
    if (tasks.has(taskId)) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('taskStatusUpdate', {
          generateId: taskId,
          status,
          videoCardData: videoData
        });
      }
    }
  }
}
```

## 8. 注意事项

1. 确保服务端能够处理大量并发连接
2. 实现适当的错误处理和日志记录
3. 考虑添加连接认证机制
4. 实现服务端的负载均衡策略
5. 定期清理过期的订阅关系
6. 监控 WebSocket 连接的健康状态
