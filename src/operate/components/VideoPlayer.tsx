/**
 * 视频播放器组件
 * 负责视频播放、暂停、自动播放等功能
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import '../styles/VideoPlayer.css';

interface VideoPlayerProps {
  videoUrl: string;
  coverImg: string;
  ratio: string;
  autoPlay?: boolean;
  onVideoEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * 播放图标组件
 */
const PlayIcon: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.5)"/>
    <path d="M32 24L20 32V16L32 24Z" fill="white"/>
  </svg>
);

/**
 * 视频播放器组件
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  coverImg,
  ratio,
  autoPlay = true,
  onVideoEnd,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 检测iOS设备
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // 打印调试信息
  const logDebug = useCallback((message: string, data?: any) => {
    console.log(`[VideoPlayer] ${message}`, data || '');
  }, []);

  /**
   * 计算视频容器样式
   */
  const getContainerStyle = () => {
    const width = window.innerWidth;
    let height: number;

    // 解析比例字符串，例如 "16:9" => { width: 16, height: 9 }
    const [w, h] = ratio.split(':').map(Number);
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      height = width * (h / w);
    } else {
      // 默认使用16:9
      height = width * (9 / 16);
      console.warn('Invalid ratio format, using 16:9 as default');
    }

    return {
      width: '100%',
      height: `${height}px`
    };
  };

  /**
   * 处理视频播放
   */
  const handlePlay = useCallback(async () => {
    if (!videoRef.current) return;
    
    logDebug('用户点击播放按钮');
    setShowPlayIcon(false);

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowPlayIcon(true);
        logDebug('视频已暂停');
      } else {
        // 确保视频已加载
        if (videoRef.current.readyState === 0) {
          setIsLoading(true);
          logDebug('视频尚未加载，尝试加载');
          // 确保已经加载了视频
          videoRef.current.load();
        }
        
        logDebug('尝试播放视频');
        await videoRef.current.play();
        setIsPlaying(true);
        setShowCover(false);
        logDebug('视频开始播放');
      }
    } catch (err) {
      console.error('视频播放失败:', err);
      setShowPlayIcon(true);
      const errorMessage = '视频播放失败，请点击重试';
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [isPlaying, onError, logDebug]);

  /**
   * 延迟隐藏封面
   * 在iOS设备上，可能需要延迟隐藏封面以避免闪烁
   */
  const delayedHideCover = useCallback(() => {
    setTimeout(() => {
      setShowCover(false);
    }, 50);
  }, []);

  /**
   * 处理视频加载完成
   */
  const handleLoadedData = useCallback(() => {
    logDebug('视频数据已加载');
    setIsLoading(false);
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    
    if (autoPlay && videoRef.current && !isPlaying) {
      logDebug('尝试自动播放视频');
      
      // 在iOS上，必须将视频静音才能自动播放
      if (isIOS) {
        videoRef.current.muted = true;
      }
      
      videoRef.current.play()
        .then(() => {
          logDebug('自动播放成功');
          setIsPlaying(true);
          delayedHideCover();
        })
        .catch(err => {
          logDebug('自动播放失败', err);
          // 在iOS上，自动播放通常会失败，需要用户交互
          setShowPlayIcon(true);
          setIsLoading(false);
        });
    }
  }, [autoPlay, isPlaying, isIOS, delayedHideCover, logDebug]);

  /**
   * 处理视频等待数据
   */
  const handleWaiting = useCallback(() => {
    logDebug('视频等待数据');
    setIsLoading(true);
  }, [logDebug]);

  /**
   * 处理视频正在播放
   */
  const handlePlaying = useCallback(() => {
    logDebug('视频正在播放');
    setIsLoading(false);
    setShowPlayIcon(false);
    
    if (isPlaying) {
      delayedHideCover();
    }
  }, [isPlaying, delayedHideCover, logDebug]);

  /**
   * 处理视频结束
   */
  const handleEnded = useCallback(() => {
    logDebug('视频播放结束');
    if (onVideoEnd) {
      onVideoEnd();
    }
  }, [onVideoEnd, logDebug]);

  /**
   * 处理视频错误
   */
  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    const errorCode = videoElement.error?.code;
    const errorMessage = videoElement.error?.message;
    
    console.error('视频错误:', { 
      code: errorCode, 
      message: errorMessage,
      videoUrl
    });
    
    setIsLoading(false);
    setError('视频加载失败，请重试');
    
    if (onError) {
      onError(`视频加载失败(${errorCode}): ${errorMessage || '未知错误'}`);
    }
  }, [videoUrl, onError]);

  /**
   * 确保在iOS设备上添加特殊处理
   */
  useEffect(() => {
    if (isIOS && videoRef.current) {
      logDebug('应用iOS特定设置');
      
      // 设置iOS特定属性
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('webkit-playsinline', 'true');
      
      // 添加加载超时处理
      if (!loadTimeoutRef.current) {
        loadTimeoutRef.current = setTimeout(() => {
          if (isLoading && !isPlaying) {
            logDebug('视频加载超时');
            setIsLoading(false);
            setShowPlayIcon(true);
          }
        }, 3000); // 3秒后如果仍在加载，显示播放按钮
      }
    }
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isIOS, isLoading, isPlaying, logDebug]);
  
  // 自动处理视频预加载策略 - iOS上使用metadata以快速加载
  const preloadStrategy = isIOS ? 'metadata' : 'auto';
  
  // 在iOS上直接使用静音以支持自动播放
  const mutedVideo = isIOS ? true : false;

  /**
   * 处理可以播放事件 - 特别优化iOS设备自动播放
   */
  const handleCanPlay = useCallback(() => {
    logDebug('视频可以播放');
    
    // 强制尝试自动播放，特别是在iOS设备上
    if (autoPlay && videoRef.current && !isPlaying) {
      try {
        // 在iOS上静音播放
        if (isIOS) {
          videoRef.current.muted = true;
        }
        
        videoRef.current.play()
          .then(() => {
            logDebug('自动播放成功(canPlay)');
            setIsPlaying(true);
            setShowCover(false);
          })
          .catch(err => {
            logDebug('自动播放失败(canPlay)', err);
            setShowPlayIcon(true);
          });
      } catch (err) {
        logDebug('播放尝试失败(canPlay)', err);
      }
    }
  }, [autoPlay, isPlaying, isIOS, logDebug]);

  return (
    <div className="video-player-container" style={getContainerStyle()}>
      <video
        ref={videoRef}
        className="video-player"
        src={videoUrl}
        playsInline={true}
        webkit-playsinline="true"
        muted={mutedVideo}
        autoPlay={true}
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        preload={preloadStrategy}
        loop
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onEnded={handleEnded}
        onError={handleError}
      />
      
      {/* 封面图 - 可点击播放 */}
      {showCover && (
        <img 
          src={coverImg} 
          className="video-cover" 
          alt="视频封面"
          onClick={handlePlay}
        />
      )}
      
      {/* 播放按钮 */}
      {showPlayIcon && (
        <div className="play-icon-container" onClick={handlePlay}>
          <PlayIcon />
        </div>
      )}
      
      {/* 加载状态 */}
      {isLoading && !error && !showPlayIcon && (
        <div className="video-loading">
          <LoadingView />
        </div>
      )}
      
      {/* 错误状态 */}
      {error && (
        <div className="video-error">
          <ErrorView onRetry={() => {
            setError(null);
            setIsLoading(true);
            if (videoRef.current) {
              videoRef.current.load();
              handlePlay();
            }
          }} />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 