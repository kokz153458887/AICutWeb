/**
 * 视频生成状态Socket Hook
 * 负责处理视频生成状态的实时更新
 */
import { useEffect, useMemo, useRef } from 'react';
import { VideoCardData } from '../api/videoListApi';
import { VideoGenerationSocketService } from '../services/VideoGenerationSocketService';

/**
 * 视频生成状态Socket Hook
 * @param videos 当前视频列表
 * @param onStatusUpdate 状态更新回调
 */
export const useVideoGenerationSocket = (
  videos: (VideoCardData | null)[],
  onStatusUpdate: (generateId: string, status: VideoCardData['status'], videoCardData?: VideoCardData) => void
) => {
  // 使用 ref 保存 socket 服务实例
  const serviceRef = useRef<VideoGenerationSocketService | null>(null);

  // 确保服务实例存在
  if (!serviceRef.current) {
    try {
      serviceRef.current = new VideoGenerationSocketService(onStatusUpdate);
    } catch (error) {
      console.error('创建Socket服务实例失败:', error);
    }
  }

  // 更新回调函数
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    try {
      service.updateCallback(onStatusUpdate);
    } catch (error) {
      console.error('更新回调函数失败:', error);
    }
  }, [onStatusUpdate]);

  // 提取生成中的视频ID
  const generatingVideoIds = useMemo(() => {
    const generatingVideos = videos.filter(v => v?.status === 'generating');
    console.log('useVideoGenerationSocket generatingVideoIds:', generatingVideos);
    return generatingVideos.map(v => v!.generateId);
  }, [videos]);

  // 处理视频状态变化的订阅
  useEffect(() => {
    console.log('useVideoGenerationSocket useEffect');
    const service = serviceRef.current;
    if (!service) return;

    try {
      console.log('useVideoGenerationSocket useEffect 2');
      // 获取当前已订阅的任务
      const subscribedTasks = service.getSubscribedTasks();
      const pendingTasks = service.getPendingTasks();
      
      // 找出需要新订阅的任务
      const newTasksToSubscribe = generatingVideoIds.filter(id => 
        !subscribedTasks.includes(id) && !pendingTasks.includes(id)
      );

      // 找出需要取消订阅的任务
      const tasksToUnsubscribe = subscribedTasks
        .filter(id => !generatingVideoIds.includes(id));

      console.log('useVideoGenerationSocket newTasksToSubscribe.length:', newTasksToSubscribe.length, 'tasksToUnsubscribe.length:', tasksToUnsubscribe.length);
      
      // 有需要订阅的任务时才进行订阅
      if (newTasksToSubscribe.length > 0) {
        console.log('useVideoGenerationSocket useEffect 3');
        service.subscribeTasks(newTasksToSubscribe);
      }

      // 有需要取消订阅的任务时才取消订阅
      if (tasksToUnsubscribe.length > 0) {
        service.unsubscribeTasks(tasksToUnsubscribe);
      }
    } catch (error) {
      console.error('处理视频状态变化失败:', error);
    }
  }, [generatingVideoIds]);

  // 组件卸载时清理连接
  useEffect(() => {
    return () => {
      try {
        if (serviceRef.current) {
          console.log('useVideoGenerationSocket 组件卸载，清理Socket连接');
          serviceRef.current.cleanup();
          serviceRef.current = null;
        }
      } catch (error) {
        console.error('清理Socket连接失败:', error);
      }
    };
  }, []); // 空依赖数组，只在组件卸载时执行

  // 返回服务状态信息（可选）
  return {
    subscribedTasksCount: serviceRef.current?.getSubscribedTasksCount() ?? 0,
    pendingTasksCount: serviceRef.current?.getPendingTasksCount() ?? 0
  };
}; 