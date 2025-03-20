/**
 * 视频操作页主组件
 * 负责整合所有子组件并管理状态
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import VideoTopBar from '../../components/VideoTopBar';
import VideoPlayer from './VideoPlayer';
import VideoGallery from './VideoGallery';
import OperateButtons from './OperateButtons';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import Toast, { toast } from '../../components/Toast';
import { VideoOperateData } from '../api/types';
import { mockVideoData } from '../api/mockData';
import '../styles/VideoOperatePage.css';

/**
 * 验证视频比例格式是否正确
 */
const isValidRatio = (ratio: string): boolean => {
  const [w, h] = ratio.split(':').map(Number);
  return !isNaN(w) && !isNaN(h) && w > 0 && h > 0;
};

/**
 * 视频操作页主组件
 */
const VideoOperatePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VideoOperateData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载数据的函数
   */
  const loadData = useCallback(async (mounted: boolean = true) => {
    if (!mounted) return;
    setIsLoading(true);
    setError(null);

    try {
      // 从路由状态中获取初始索引
      const state = location.state as { initialIndex?: number };
      if (state?.initialIndex !== undefined && mounted) {
        setCurrentIndex(state.initialIndex);
      }

      // 根据ID加载数据
      // TODO: 这里应该根据ID从API获取数据
      // 目前使用mock数据，实际开发时需要替换为真实API调用
      console.log('Loading video data for ID:', id);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mounted) return;

      const videoData = {
        ...mockVideoData,
        generateId: id || mockVideoData.generateId
      };

      // 验证数据
      if (!videoData.videolist || videoData.videolist.length === 0) {
        throw new Error('没有可用的视频');
      }

      if (!isValidRatio(videoData.ratio)) {
        throw new Error('视频格式错误');
      }

      setData(videoData);
    } catch (error) {
      console.error('Failed to load video data:', error);
      if (mounted) {
        setError(error instanceof Error ? error.message : '加载失败');
      }
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
  }, [id, location]);

  /**
   * 初始加载数据
   */
  useEffect(() => {
    let mounted = true;
    loadData(mounted);
    return () => {
      mounted = false;
    };
  }, [loadData]);

  /**
   * 处理视频选择
   */
  const handleVideoSelect = useCallback((index: number) => {
    if (!data || index >= data.videolist.length) return;
    setCurrentIndex(index);
  }, [data]);

  /**
   * 处理视频结束
   */
  const handleVideoEnd = useCallback(() => {
    if (!data) return;
    // 自动播放下一个视频
    if (currentIndex < data.videolist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [data, currentIndex]);

  /**
   * 处理视频错误
   */
  const handleVideoError = useCallback((error: string) => {
    console.error('视频播放错误:', error);
    toast.error(error);
  }, []);

  /**
   * 处理分享按钮点击
   */
  const handleShare = useCallback(() => {
    toast.info('分享功能开发中');
  }, []);

  /**
   * 处理发布按钮点击
   */
  const handlePublish = useCallback(() => {
    toast.info('发布功能开发中');
  }, []);

  /**
   * 处理下载按钮点击
   */
  const handleDownload = useCallback(() => {
    toast.info('下载功能开发中');
  }, []);

  /**
   * 处理重试
   */
  const handleRetry = useCallback(() => {
    loadData();
  }, [loadData]);

  /**
   * 处理返回按钮点击
   */
  const handleBack = useCallback(() => {
    const state = location.state as { listState?: any };
    navigate('/videolist', { 
      state: state?.listState || undefined,
      replace: true 
    });
  }, [navigate, location.state]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="video-operate-page">
        <VideoTopBar 
          onBackClick={handleBack}
          onShareClick={handleShare}
        />
        <LoadingView />
      </div>
    );
  }

  // 错误状态
  if (error || !data) {
    return (
      <div className="video-operate-page">
        <VideoTopBar 
          onBackClick={handleBack}
          onShareClick={handleShare}
        />
        <ErrorView onRetry={handleRetry} />
      </div>
    );
  }

  // 检查当前索引是否有效
  if (currentIndex >= data.videolist.length) {
    setCurrentIndex(0);
    return null;
  }

  return (
    <div className="video-operate-page">
      {/* 顶部导航栏 */}
      <VideoTopBar 
        onBackClick={handleBack}
        onShareClick={handleShare}
      />

      {/* 视频播放器 */}
      <VideoPlayer
        videoUrl={data.videolist[currentIndex].videoUrl}
        coverImg={data.videolist[currentIndex].coverImg}
        ratio={data.ratio}
        onVideoEnd={handleVideoEnd}
        onError={handleVideoError}
      />

      {/* 底部视频预览列表 */}
      <div className="bottom-container">
        <VideoGallery
          videos={data.videolist}
          currentIndex={currentIndex}
          onVideoSelect={handleVideoSelect}
        />
        
        {/* 底部操作按钮 */}
        <OperateButtons
          onPublish={handlePublish}
          onDownload={handleDownload}
        />
      </div>

      {/* Toast组件 */}
      <Toast />
    </div>
  );
};

export default VideoOperatePage; 