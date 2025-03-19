/**
 * 视频播放器组件
 * 负责视频播放、暂停、自动播放等功能
 */
import React, { useRef, useEffect, useState } from 'react';
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
  const handlePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setShowPlayIcon(true);
      } else {
        await videoRef.current.play();
        setShowPlayIcon(false);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('视频播放失败:', error);
      const errorMessage = '视频播放失败，请重试';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  /**
   * 处理视频加载完成
   */
  const handleLoadedData = () => {
    setIsLoading(false);
    if (autoPlay && videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          // 视频开始播放0.1秒后移除封面
          setTimeout(() => {
            setShowCover(false);
          }, 100);
        })
        .catch(error => {
          console.error('自动播放失败:', error);
          setShowPlayIcon(true);
        });
    }
  };

  /**
   * 处理视频结束
   */
  const handleEnded = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
    // 循环播放
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  /**
   * 处理视频错误
   */
  const handleError = () => {
    const errorMessage = '视频加载失败，请重试';
    setError(errorMessage);
    setIsLoading(false);
    if (onError) {
      onError(errorMessage);
    }
  };

  /**
   * 监听窗口尺寸变化，重新计算视频容器大小
   */
  useEffect(() => {
    const handleResize = () => {
      if (videoRef.current) {
        const style = getContainerStyle();
        videoRef.current.style.height = style.height;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ratio]);

  return (
    <div className="video-player-container" style={getContainerStyle()}>
      <video
        ref={videoRef}
        className="video-player"
        src={videoUrl}
        playsInline
        webkit-playsinline="true"
        loop
        onLoadedData={handleLoadedData}
        onEnded={handleEnded}
        onError={handleError}
        onClick={handlePlay}
      />
      
      {/* 封面图 */}
      {showCover && (
        <img 
          src={coverImg} 
          className="video-cover" 
          alt="视频封面"
        />
      )}
      
      {/* 播放按钮 */}
      {showPlayIcon && (
        <div className="play-icon-container" onClick={handlePlay}>
          <PlayIcon />
        </div>
      )}
      
      {/* 加载状态 */}
      {isLoading && !error && (
        <div className="video-loading">
          <LoadingView />
        </div>
      )}
      
      {/* 错误状态 */}
      {error && (
        <div className="video-error">
          <ErrorView onRetry={() => window.location.reload()} />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 