/**
 * 视频播放器组件
 * 用于播放素材库中的视频文件
 */
import React, { useRef, useEffect } from 'react';
import './styles/VideoPlayer.css';

interface VideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
}

/**
 * 视频播放器组件
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * 处理ESC键关闭
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /**
   * 处理背景点击关闭
   */
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * 处理视频加载错误
   */
  const handleVideoError = () => {
    console.error('视频加载失败:', videoUrl);
  };

  return (
    <div className="video-player-overlay" onClick={handleBackgroundClick}>
      <div className="video-player-container">
        {/* 关闭按钮 */}
        <div className="close-button" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>

        {/* 视频播放器 */}
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          className="video-element"
          onError={handleVideoError}
        >
          您的浏览器不支持视频播放
        </video>

        {/* 视频信息 */}
        <div className="video-info">
          <div className="video-url" title={videoUrl}>
            {videoUrl.split('/').pop()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 