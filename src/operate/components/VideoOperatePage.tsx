/**
 * 视频操作页主组件
 * 负责整合所有子组件并管理状态
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VideoTopBar from '../../components/VideoTopBar';
import VideoPlayer from './VideoPlayer';
import VideoGallery from './VideoGallery';
import OperateButtons from './OperateButtons';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import Toast, { toast } from '../../components/Toast';
import { VideoOperateData } from '../api/types';
import { createFromVideoTask } from '../api/operateApi';
import '../styles/VideoOperatePage.css';

interface VideoOperatePageProps {
  videoId: string;
  initialIndex?: number;
  videoData?: VideoOperateData;
}

/**
 * 验证视频比例格式是否正确
 */
const isValidRatio = (ratio?: string): boolean => {
  if (!ratio) return false;
  const [w, h] = ratio.split(':').map(Number);
  return !isNaN(w) && !isNaN(h) && w > 0 && h > 0;
};

/**
 * 视频操作页主组件
 */
const VideoOperatePage: React.FC<VideoOperatePageProps> = ({ videoId, initialIndex = 0, videoData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  console.log('VideoOperatePage render:', { 
    videoData, 
    currentIndex, 
    error,
    videolistLength: videoData?.videolist?.length 
  });

  // 在 useEffect 中进行数据验证
  useEffect(() => {
    console.log('VideoOperatePage useEffect - data validation');
    if (!videoData) {
      setError('视频数据不存在');
      return;
    }

    if (!videoData.videolist || videoData.videolist.length === 0) {
      if (videoData.status === 'generating') {
        console.log('Video is generating, clearing error');
        setError(null);
      } else {
        console.log('No videos available, setting error');
        setError('没有可用的视频');
      }
      return;
    }

    if (!isValidRatio(videoData.ratio)) {
      setError('视频格式错误');
      return;
    }

    setError(null);
  }, [videoData]);

  /**
   * 处理视频选择
   */
  const handleVideoSelect = useCallback((index: number) => {
    if (!videoData || index >= videoData.videolist.length) return;
    setCurrentIndex(index);
  }, [videoData]);

  /**
   * 处理视频结束
   */
  const handleVideoEnd = useCallback(() => {
    if (!videoData) return;
    // 自动播放下一个视频
    if (currentIndex < videoData.videolist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [videoData, currentIndex]);

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
   * 处理分享模版按钮点击
   */
  const handleShareTemplate = useCallback(async () => {
    if (!videoData) {
      toast.error('视频数据不存在');
      return;
    }

    if (isSharing) {
      return;
    }

    try {
      setIsSharing(true);
      toast.loading('分享中...');

      const response = await createFromVideoTask(videoData.generateId, currentIndex);
      
      toast.dismiss();
      
      if (response.code === 0) {
        toast.success('成功分享出去啦~~');
      } else {
        toast.error(response.message || '分享失败');
      }
    } catch (error) {
      console.error('分享模版失败:', error);
      toast.dismiss();
      toast.error('分享失败，请稍后重试');
    } finally {
      setIsSharing(false);
    }
  }, [videoData, currentIndex, isSharing]);

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
   * 处理返回按钮点击
   */
  const handleBack = useCallback(() => {
    console.log('handleBack clicked');
    // 保持 tab=videolist 参数，移除 videoId 和 initialIndex 参数
    const newSearch = new URLSearchParams(location.search);
    newSearch.delete('videoId');
    newSearch.delete('initialIndex');
    if (!newSearch.has('tab')) {
      newSearch.set('tab', 'videolist');
    }
    navigate(`/?${newSearch.toString()}`);
  }, [location.search, navigate]);

  // 错误状态
  if (error || !videoData) {
    console.log('Rendering error state:', { error });
    return (
      <div className="video-operate-page">
        <VideoTopBar 
          onBackClick={handleBack}
          onShareClick={handleShare}
          onShareTemplateClick={handleShareTemplate}
          title="视频操作"
        />
        <ErrorView onRetry={() => setError(null)} />
      </div>
    );
  }

  // 生成中状态
  if (videoData.status === 'generating') {
    console.log('Rendering generating state');
    return (
      <div className="video-operate-page">
        <VideoTopBar 
          onBackClick={handleBack}
          onShareClick={handleShare}
          onShareTemplateClick={handleShareTemplate}
          title={videoData.title || "视频操作"}
        />
        <div className="video-main-content">
          <div className="loading-container">
            <LoadingView />
            <div className="loading-text">视频生成中，请稍候...</div>
          </div>
          <div className="video-info-container">
            <div className="video-title">{videoData.title}</div>
            <div className="video-text">{videoData.text}</div>
          </div>
        </div>
      </div>
    );
  }

  // 检查当前索引是否有效
  if (currentIndex >= videoData.videolist.length) {
    console.log('Invalid index, returning error view');
    return (
      <div className="video-operate-page">
        <VideoTopBar 
          onBackClick={handleBack}
          onShareClick={handleShare}
          onShareTemplateClick={handleShareTemplate}
          title={videoData.title || "视频操作"}
        />
        <div className="error-container">
          <ErrorView onRetry={() => setError(null)} />
          <div className="error-text">暂无可用视频</div>
        </div>
      </div>
    );
  }

  console.log('Rendering normal state');

  return (
    <div className="video-operate-page">
      {/* 顶部导航栏 */}
      <VideoTopBar 
        onBackClick={handleBack}
        onShareClick={handleShare}
        onShareTemplateClick={isSharing ? undefined : handleShareTemplate}
        title={videoData.title || "视频操作"}
      />

      {/* 可滚动的主内容区域 */}
      <div className="video-main-content">
        {/* 视频播放器 */}
        <VideoPlayer
          videoUrl={videoData.videolist[currentIndex].videoUrl}
          coverImg={videoData.videolist[currentIndex].coverImg}
          ratio={videoData.ratio}
          onVideoEnd={handleVideoEnd}
          onError={handleVideoError}
        />

        {/* 视频文案区域 */}
        <div className="video-info-container">
          <div className="video-title">{videoData.title}</div>
          <div className="video-text">{videoData.text}</div>
        </div>
      </div>

      {/* 底部视频预览列表 */}
      <div className="bottom-container">
        <VideoGallery
          videos={videoData.videolist}
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