/**
 * 视频播放器组件
 * 支持进度控制、拖拽和时间显示，以及视频缓存功能
 */
import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { videoCacheManager, CacheStatus } from '../../utils/videoCacheManager';
import './styles.css';

// 格式化时间工具函数
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

interface VideoPlayerProps {
  videoUrl: string;
  coverUrl?: string;
  onTimeUpdate?: (currentTime: number, source?: string) => void;
  onSeekStart?: () => void;
  onSeekEnd?: (time: number) => void;
  onDragging?: (time: number) => void; // 拖拽过程中的回调
  onPlayStateChange?: (isPlaying: boolean) => void; // 播放状态变化回调
  seekToTime?: number;
  showProgressBar?: boolean;
  isLocationMode?: boolean; // 是否处于定位模式
  autoPlay?: boolean; // 是否自动播放
  width?: string | number; // 自定义宽度
  height?: string | number; // 自定义高度
  className?: string; // 自定义类名
  enableCache?: boolean; // 是否启用缓存功能
  onCacheStatusChange?: (status: CacheStatus, progress?: number) => void; // 缓存状态变化回调
}

export interface VideoPlayerRef {
  pauseVideo: () => void;
  playVideo: () => void;
  getVideoElement: () => HTMLVideoElement | null;
  startCaching: () => Promise<void>; // 开始缓存视频
  getCacheStatus: () => CacheStatus; // 获取缓存状态
}

/**
 * 视频播放器组件
 * 提供视频播放、进度控制和拖拽功能，支持视频缓存
 */
const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  videoUrl,
  coverUrl,
  onTimeUpdate,
  onSeekStart,
  onSeekEnd,
  onDragging,
  onPlayStateChange,
  seekToTime,
  showProgressBar = true,
  isLocationMode = false,
  autoPlay = false,
  width,
  height,
  className,
  enableCache = false,
  onCacheStatusChange
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const [showPauseButton, setShowPauseButton] = useState(false);
  
  // 缓存相关状态
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>(CacheStatus.NOT_CACHED);
  const [cacheProgress, setCacheProgress] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);

  /**
   * 初始化缓存状态
   */
  useEffect(() => {
    if (enableCache && videoUrl) {
      const status = videoCacheManager.getCacheStatus(videoUrl);
      setCacheStatus(status);
      onCacheStatusChange?.(status);
      
      // 如果已经缓存，使用缓存的URL
      if (status === CacheStatus.CACHED) {
        const cachedUrl = videoCacheManager.getCachedUrl(videoUrl);
        setCurrentVideoUrl(cachedUrl);
      } else {
        setCurrentVideoUrl(videoUrl);
      }
    } else {
      setCurrentVideoUrl(videoUrl);
    }
  }, [videoUrl, enableCache, onCacheStatusChange]);

  /**
   * 开始缓存视频
   */
  const startCaching = useCallback(async (): Promise<void> => {
    if (!enableCache || !videoUrl) return;
    
    const currentStatus = videoCacheManager.getCacheStatus(videoUrl);
    if (currentStatus === CacheStatus.CACHED || currentStatus === CacheStatus.CACHING) {
      return;
    }

    try {
      setCacheStatus(CacheStatus.CACHING);
      setCacheProgress(0);
      onCacheStatusChange?.(CacheStatus.CACHING, 0);

      const cachedUrl = await videoCacheManager.cacheVideo(videoUrl, (progress) => {
        setCacheProgress(progress);
        onCacheStatusChange?.(CacheStatus.CACHING, progress);
      });

      setCacheStatus(CacheStatus.CACHED);
      setCacheProgress(100);
      setCurrentVideoUrl(cachedUrl);
      onCacheStatusChange?.(CacheStatus.CACHED, 100);

      console.log('视频缓存完成，切换到本地播放');
      
    } catch (error) {
      console.error('视频缓存失败:', error);
      setCacheStatus(CacheStatus.CACHE_FAILED);
      setCacheProgress(0);
      onCacheStatusChange?.(CacheStatus.CACHE_FAILED, 0);
    }
  }, [enableCache, videoUrl, onCacheStatusChange]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    pauseVideo: () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    },
    playVideo: () => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play();
      }
    },
    getVideoElement: () => {
      return videoRef.current;
    },
    startCaching,
    getCacheStatus: () => cacheStatus
  }), [startCaching, cacheStatus]);

  /**
   * 处理视频播放 - 无依赖，无需useCallback
   */
  const handlePlay = () => {
    setIsPlaying(true);
    onPlayStateChange?.(true);
  };

  /**
   * 处理视频暂停 - 无依赖，无需useCallback
   */
  const handlePause = () => {
    setIsPlaying(false);
    onPlayStateChange?.(false);
  };

  /**
   * 处理视频时间更新 - 优化，在定位模式下仍需更新进度条
   */
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      
      // 在定位模式下，仅在非拖拽状态下通知时间更新，避免冲突
      // if (isLocationMode) {
        onTimeUpdate?.(current, 'video-native');
      // }
    }
  }, [isDragging, isLocationMode, onTimeUpdate]);

  /**
   * 处理视频元数据加载完成 - 无依赖，无需useCallback
   */
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // 播放器完成初始化后，移除封面图
      setShowCover(false);
      // seek到第一帧
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setShowPauseButton(true);

      // 如果需要自动播放，则播放视频
      if (autoPlay) {
        try {
          videoRef.current.play();
        } catch (error) {
          console.warn('自动播放失败:', error);
        }
      }

       // Safari兼容性：强制渲染第一帧
       const userAgent = navigator.userAgent;
       const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
       
       if (isSafari && videoRef.current.currentTime === 0) {
         // 短暂播放然后暂停，强制Safari渲染第一帧
         const forceRender = async () => {
           try {
             if (videoRef.current) {
               videoRef.current.currentTime = 0.1;
               await videoRef.current.play();
               setTimeout(() => {
                 if (videoRef.current) {
                   videoRef.current.pause();
                   videoRef.current.currentTime = 0;
                   // 如果需要自动播放，重新播放
                   if (autoPlay) {
                     videoRef.current.play();
                   }
                 }
               }, 50);
             }
           } catch (error) {
             console.warn('Safari first frame render failed:', error);
           }
         };
         
         forceRender();
       }
    }
  };

  /**
   * 处理视频点击播放/暂停 - 无依赖，无需useCallback
   */
  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  /**
   * 处理暂停按钮点击 - 无依赖，无需useCallback
   */
  const handlePauseButtonClick = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
    }
  };

  /**
   * 处理进度条拖拽 - 优化依赖项，添加移动端支持
   */
  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // 阻止默认行为
    if (!progressRef.current || !videoRef.current) return;
    
    setIsDragging(true);
    onSeekStart?.();
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    setDragTime(time);
    
    // 实时seek视频到拖拽位置
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    
    // 在定位模式下不暂停视频，但通知拖拽开始
    if (!isLocationMode) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
    
    // 实时通知拖拽时间
    onDragging?.(time);
  }, [duration, isLocationMode]);

  /**
   * 处理触摸开始 - 移动端拖拽支持
   */
  const handleProgressTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // 阻止默认滚动行为
    if (!progressRef.current || !videoRef.current) return;
    
    setIsDragging(true);
    onSeekStart?.();
    
    const touch = e.touches[0];
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (touch.clientX - rect.left) / rect.width;
    const time = percent * duration;
    setDragTime(time);
    
    // 实时seek视频到拖拽位置
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    
    // 在定位模式下不暂停视频，但通知拖拽开始
    if (!isLocationMode) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
    
    // 实时通知拖拽时间
    onDragging?.(time);
  }, [duration, isLocationMode]);

  /**
   * 处理拖拽移动 - 简化依赖项，添加移动端支持
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressRef.current || !videoRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;
    setDragTime(time);
    
    // 实时seek视频到拖拽位置
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    
    // 实时通知拖拽时间
    onDragging?.(time);
  }, [isDragging, duration]);

  /**
   * 处理触摸移动 - 移动端拖拽支持
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !progressRef.current || !videoRef.current) return;
    e.preventDefault(); // 阻止页面滚动
    
    const touch = e.touches[0];
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const time = percent * duration;
    setDragTime(time);
    
    // 实时seek视频到拖拽位置
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    
    // 实时通知拖拽时间
    onDragging?.(time);
  }, [isDragging, duration]);

  /**
   * 处理拖拽结束 - 简化依赖项，添加移动端支持
   */
  const handleMouseUp = useCallback(() => {
    if (isDragging && videoRef.current) {
      setIsDragging(false);
      
      // 确保最终位置正确
      videoRef.current.currentTime = dragTime;
      setCurrentTime(dragTime);
      
      onSeekEnd?.(dragTime);
    }
  }, [isDragging, dragTime]);

  /**
   * 处理触摸结束 - 移动端拖拽支持
   */
  const handleTouchEnd = useCallback(() => {
    if (isDragging && videoRef.current) {
      setIsDragging(false);
      
      // 确保最终位置正确
      videoRef.current.currentTime = dragTime;
      setCurrentTime(dragTime);
      
      onSeekEnd?.(dragTime);
    }
  }, [isDragging, dragTime]);

  /**
   * 处理外部时间跳转 - 合并定位模式逻辑，避免重复
   */
  useEffect(() => {
    if (seekToTime !== undefined && videoRef.current) {
      if (videoRef.current) {
        videoRef.current.currentTime = seekToTime;
        setCurrentTime(seekToTime);
        
        // 在定位模式下通知时间更新，标记来源为外部输入
        if (isLocationMode) {
          onTimeUpdate?.(seekToTime, 'external-input');
        }
      }
    }
  }, [seekToTime, isLocationMode]);

  /**
   * 定位模式下自动移除封面图 - 优化条件
   */
  useEffect(() => {
    if (isLocationMode) {
      setShowCover(false);
    }
  }, [isLocationMode]); // 移除showCover依赖，避免循环更新

  /**
   * 绑定全局拖拽事件 - 添加触摸事件支持
   */
  useEffect(() => {
    if (isDragging) {
      // 鼠标事件
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // 触摸事件
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // 计算进度百分比
  const progressPercent = duration > 0 ? (isDragging ? dragTime : currentTime) / duration * 100 : 0;

  // 计算容器样式
  const containerStyle: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div className={`video-player-container ${className || ''}`} style={containerStyle}>
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="edit-video-element"
          src={currentVideoUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handleVideoClick}
          playsInline={true}
          webkit-playsinline="true"
        />
        
        {/* 封面图 - 在定位模式下自动隐藏 */}
        {showCover && coverUrl && !isLocationMode && (
          <div className="edit-video-cover" onClick={handleVideoClick}>
            <img src={coverUrl} alt="视频封面" />
            <div className="play-button">
              <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.5)"/>
                <path d="M32 24L20 32V16L32 24Z" fill="white"/>
              </svg>
            </div>
          </div>
        )}
        
        {/* 暂停时的播放按钮 */}
        {!showCover && showPauseButton && !isPlaying && (
          <div className="pause-overlay" onClick={handlePauseButtonClick}>
            <div className="pause-play-button">
              <svg width="80" height="80" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.4)"/>
                <path d="M32 24L20 32V16L32 24Z" fill="white"/>
              </svg>
            </div>
          </div>
        )}
        
        {/* 拖拽时的时间显示 */}
        {isDragging && (
          <div className="drag-time-overlay">
            <div className="drag-time-display">
              {formatTime(dragTime)}
            </div>
          </div>
        )}
        
        {/* 缓存状态指示器 */}
        {enableCache && cacheStatus !== CacheStatus.NOT_CACHED && (
          <div className="cache-status-indicator">
            {cacheStatus === CacheStatus.CACHING && (
              <div className="cache-progress-indicator">
                <div className="cache-icon caching">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12L6 12M18 12L22 12M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="cache-progress-text">
                  缓存中 {Math.round(cacheProgress)}%
                </div>
                <div className="cache-progress-bar">
                  <div 
                    className="cache-progress-fill"
                    style={{ width: `${cacheProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {cacheStatus === CacheStatus.CACHED && (
              <div className="cache-status-display cached">
                <div className="cache-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>已缓存</span>
              </div>
            )}
            
            {cacheStatus === CacheStatus.CACHE_FAILED && (
              <div className="cache-status-display failed">
                <div className="cache-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>缓存失败</span>
              </div>
            )}
          </div>
        )}
        
        {/* 定位模式指示 */}
        {isLocationMode && (
          <div className="location-mode-indicator">
            <div className="location-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
              <span>定位模式</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 进度控制条 */}
      {showProgressBar && (
        <div className={`progress-controls ${isLocationMode ? 'location-mode' : ''}`}>
          <div className="current-time">
            {formatTime(isDragging ? dragTime : currentTime)}
          </div>
          <div 
            ref={progressRef}
            className="progress-bar"
            onMouseDown={handleProgressMouseDown}
            onTouchStart={handleProgressTouchStart}
          >
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
              <div 
                className="progress-thumb"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="total-time">
            {formatTime(duration)}
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer; 