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

  // 在 useEffect 中进行数据验证
  useEffect(() => {
    if (!videoData) {
      setError('视频数据不存在');
      return;
    }

    if (!videoData.videolist || videoData.videolist.length === 0) {
      setError('没有可用的视频');
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
    // 只移除 videoId 和 initialIndex 参数，保持其他参数不变
    const newSearch = new URLSearchParams(location.search);
    newSearch.delete('videoId');
    newSearch.delete('initialIndex');
    navigate(`/?${newSearch.toString()}`);
  }, [location.search, navigate]);

  // 检查当前索引是否有效
  if (videoData && currentIndex >= videoData.videolist.length) {
    setCurrentIndex(0);
    return null;
  }

  // 错误状态
  if (error || !videoData) {
    return (
      <div className="video-operate-page">
        <VideoTopBar 
          onBackClick={handleBack}
          onShareClick={handleShare}
        />
        <ErrorView onRetry={() => setError(null)} />
      </div>
    );
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
        videoUrl={videoData.videolist[currentIndex].videoUrl}
        coverImg={videoData.videolist[currentIndex].coverImg}
        ratio={videoData.ratio}
        onVideoEnd={handleVideoEnd}
        onError={handleVideoError}
      />

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