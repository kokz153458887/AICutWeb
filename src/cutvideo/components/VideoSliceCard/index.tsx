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
  onRetry?: (item: VideoSliceItem) => void;
}

/**
 * 视频切片卡片组件
 * 显示视频切片的基本信息和状态
 */
const VideoSliceCard: React.FC<VideoSliceCardProps> = ({ item, onClick, onRetry }) => {
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
   * 处理重试按钮点击
   */
  const handleRetryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    if (onRetry) {
      onRetry(item);
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

  /**
   * 判断是否显示图片
   */
  const shouldShowImage = item.cover && !imageError;

  /**
   * 渲染图片内容
   */
  const renderImageContent = () => {
    // 解析中状态
    if (item.status === 'parsing') {
      return (
        <div className="status-image parsing-image">
          <div className="status-text">解析中，稍后刷新查看解析结果</div>
        </div>
      );
    }

    // 解析失败状态
    if (item.status === 'parse_failed') {
      return (
        <div className="status-image failed-image">
          <div className="status-text">解析失败</div>
        </div>
      );
    }

    // 有封面图且未加载错误
    if (shouldShowImage) {
      return (
        <>
          {/* 图片加载前的占位图 */}
          {!imageLoaded && (
            <div className="image-placeholder"></div>
          )}
          
          {/* 封面图片 */}
          <img
            src={item.cover}
            alt="视频封面"
            className={`card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      );
    }

    // 默认兜底图片
    return (
      <div className="status-image default-image">
        <div className="default-icon">📹</div>
        <div className="status-text">暂无封面</div>
      </div>
    );
  };

  return (
    <div className="video-slice-card" onClick={handleCardClick}>
      {/* 封面图片容器 */}
      <div className="card-image-container">
        {renderImageContent()}
        
        {/* 状态标签 */}
        <div className={`status-label ${getStatusClassName()}`}>
          {VideoSliceStatusLabels[item.status]}
        </div>

        {/* 分辨率信息 - 仅在pending状态且有video_info时显示 */}
        {item.status === 'pending' && item.videoInfo?.resolution && (
          <div className="resolution-info">
            {item.videoInfo.resolution}
          </div>
        )}

        {/* 重试按钮 - 仅在解析失败时显示 */}
        {item.status === 'parse_failed' && onRetry && (
          <div className="retry-button" onClick={handleRetryClick}>
            重试
          </div>
        )}
      </div>
      
      {/* 文案内容 */}
      <div className="card-content">
        <p className="content-text">{item.text}</p>
      </div>
    </div>
  );
};

export default VideoSliceCard; 