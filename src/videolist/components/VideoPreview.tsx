/**
 * 视频预览浮层组件
 * 负责显示视频预览的全屏浮层
 */
import React, { useEffect, useRef } from 'react';
import { CloseIcon } from '../icons/SvgIcons';

interface VideoPreviewProps {
  videoUrl: string;
  onClose: () => void;
}

/**
 * 视频预览浮层组件
 */
const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 点击遮罩层时关闭预览
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // 组件挂载时自动播放视频
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('自动播放失败:', error);
      });
    }
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
    
    // 组件卸载时恢复背景滚动
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // 处理关闭按钮点击
  const handleCloseClick = () => {
    onClose();
  };
  
  // 处理键盘按下事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="video-preview-overlay" onClick={handleOverlayClick}>
      <div className="video-preview-container">
        <div className="video-preview-close" onClick={handleCloseClick}>
          <CloseIcon />
        </div>
        <video 
          ref={videoRef}
          className="video-preview-player"
          src={videoUrl}
          controls
          controlsList="nodownload"
          playsInline
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default VideoPreview; 