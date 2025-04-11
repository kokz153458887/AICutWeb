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
import { createFromVideoTask, queryVideoTask } from '../api/operateApi';
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
const VideoOperatePage: React.FC<VideoOperatePageProps> = ({ videoId, initialIndex = 0, videoData: propsVideoData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoOperateData | undefined>(propsVideoData);

  console.log('VideoOperatePage render:', { 
    propsVideoData,
    videoData, 
    videoId,
    currentIndex, 
    error,
    videolistLength: videoData?.videolist?.length 
  });

  // 如果没有通过props传入videoData，则通过API获取
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) {
        setError('视频ID不存在');
        return;
      }

      if (propsVideoData) {
        setVideoData(propsVideoData);
        return; // 如果已经从props获取到数据，则不需要请求API
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('通过API获取视频数据, videoId:', videoId);
        
        const data = await queryVideoTask(videoId);
        console.log('API数据获取成功:', data);
        
        // 检查数据是否有效
        if (!data || !data.videolist || data.videolist.length === 0) {
          if (data.status !== 'generating') {
            setError('没有可用的视频');
          }
        } else if (!isValidRatio(data.ratio)) {
          setError('视频格式错误');
        } else {
          setError(null);
        }
        
        setVideoData(data);
      } catch (err) {
        console.error('获取视频数据失败:', err);
        setError('获取视频数据失败，请重试');
        toast.error('获取视频数据失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId, propsVideoData]);

  // 在 useEffect 中进行数据验证
  useEffect(() => {
    console.log('VideoOperatePage useEffect - data validation');
    if (!videoData) {
      if (isLoading) {
        console.log('Data is loading, not setting error');
        return;
      }
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
  }, [videoData, isLoading]);

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
    if (!videoData || !videoData.videolist[currentIndex]) {
      toast.error('视频数据不存在');
      return;
    }

    const videoUrl = videoData.videolist[currentIndex].videoUrl;
    if (!videoUrl) {
      toast.error('视频地址不存在');
      return;
    }

    try {
      // 检测是否是iOS设备
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      if (isIOS) {
        // iOS处理方式：在Safari中打开视频链接，用户可以长按保存
        toast.info('在iOS设备上，请在打开的页面中长按视频选择"下载视频"或"添加到相册"');
        
        // 创建一个临时链接，并设置download属性
        const link = document.createElement('a');
        link.href = videoUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('download', `${videoData.title || '视频'}.mp4`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // 非iOS设备：在新窗口中打开下载链接
        window.open(videoUrl, '_blank');
        toast.success('正在打开下载窗口');
      }
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请稍后重试');
    }
  }, [videoData, currentIndex]);

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

  /**
   * 处理复制按钮点击
   */
  const handleCopy = useCallback(() => {
    if (!videoData) {
      toast.error('视频数据不存在');
      return;
    }

    try {
      const textToCopy = videoData.text || '';
      
      // 创建临时文本区域
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      
      // 设置样式使其不可见
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      
      // 选择文本
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);
      
      // 执行复制
      const successful = document.execCommand('copy');
      
      // 清理
      document.body.removeChild(textArea);
      
      if (successful) {
        toast.success('文案已复制到剪贴板');
      } else {
        throw new Error('复制失败');
      }
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败，请重试');
    }
  }, [videoData]);

  // 加载状态
  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <div className="video-operate-page">
        <VideoTopBar 
          onBackClick={handleBack}
          onShareClick={handleShare}
          onShareTemplateClick={handleShareTemplate}
          title="视频操作"
        />
        <div className="video-main-content">
          <div className="loading-container">
            <LoadingView />
            <div className="loading-text">加载中...</div>
          </div>
        </div>
      </div>
    );
  }

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
          autoPlay={true}
        />

        {/* 视频文案区域 */}
        <div className="video-info-container">
          <div className="video-title-container">
            <div className="video-title">{videoData.title}</div>
            <button className="copy-button" onClick={handleCopy}>
              复制
            </button>
          </div>
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