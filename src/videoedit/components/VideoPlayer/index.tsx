/**
 * 视频播放器组件
 * 支持进度控制、拖拽和时间显示
 */
import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { formatTime } from '../../utils';
import './styles.css';

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
}

export interface VideoPlayerRef {
  pauseVideo: () => void;
  playVideo: () => void;
}

/**
 * 视频播放器组件
 * 提供视频播放、进度控制和拖拽功能
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
  isLocationMode = false
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
    }
  }), []);

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
      // seek到第一帧并暂停
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setShowPauseButton(true);
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
  }, [seekToTime, isLocationMode]); // 合并逻辑，移除onTimeUpdate依赖

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

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="video-element"
          src={videoUrl}
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
          <div className="video-cover" onClick={handleVideoClick}>
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