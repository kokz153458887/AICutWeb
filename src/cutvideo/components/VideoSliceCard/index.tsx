/**
 * 视频切片卡片组件
 * 展示单个视频切片，包含封面图、文案和状态标签
 */
import React, { useState } from 'react';
import { VideoSliceItem, VideoSliceStatusLabels } from '../../types';
import './styles.css';

interface VideoSliceCardProps {
  item: VideoSliceItem;
  onClick?: (item: VideoSliceItem) => void;
}

/**
 * 视频切片卡片组件
 * 显示视频切片的基本信息和状态
 */
const VideoSliceCard: React.FC<VideoSliceCardProps> = ({ item, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * 处理图片加载完成
   */
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  /**
   * 处理图片加载失败
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * 处理卡片点击
   */
  const handleCardClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  /**
   * 获取状态标签的样式类名
   */
  const getStatusClassName = () => {
    switch (item.status) {
      case 'parsing':
        return 'status-parsing';
      case 'parse_failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      case 'recorded':
        return 'status-recorded';
      case 'abandoned':
        return 'status-abandoned';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="video-slice-card" onClick={handleCardClick}>
      {/* 封面图片容器 */}
      <div className="card-image-container">
        {/* 图片加载前的占位图 */}
        {!imageLoaded && !imageError && (
          <div className="image-placeholder"></div>
        )}
        
        {/* 图片加载失败显示错误图 */}
        {imageError ? (
          <div className="image-error">
            <span className="error-icon">!</span>
            <span className="error-text">加载失败</span>
          </div>
        ) : (
          /* 封面图片 */
          <img
            src={item.cover}
            alt="视频封面"
            className={`card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* 状态标签 */}
        <div className={`status-label ${getStatusClassName()}`}>
          {VideoSliceStatusLabels[item.status]}
        </div>
      </div>
      
      {/* 文案内容 */}
      <div className="card-content">
        <p className="content-text">{item.text}</p>
      </div>
    </div>
  );
};

export default VideoSliceCard; 