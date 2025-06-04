/**
 * 任务信息卡片组件
 * 展示解析任务的基本信息，包含文本、视频信息、预览图等
 */
import React, { useState } from 'react';
import { ParseResultDetail } from '../../api';
import { formatFileSize, formatDuration } from '../../utils';
import './styles.css';

interface TaskInfoCardProps {
  taskData: ParseResultDetail;
  onVideoPlay?: () => void;
  onOriginalLinkClick?: () => void;
  onMaterialLibraryClick?: () => void;
}

/**
 * 任务信息卡片组件
 * 显示任务的详细信息和操作按钮
 */
const TaskInfoCard: React.FC<TaskInfoCardProps> = ({
  taskData,
  onVideoPlay,
  onOriginalLinkClick,
  onMaterialLibraryClick
}) => {
  const [showFileUrls, setShowFileUrls] = useState(false);
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
   * 处理视频地址按钮点击
   */
  const handleVideoAddressClick = () => {
    setShowFileUrls(!showFileUrls);
  };

  /**
   * 处理文件URL点击
   */
  const handleFileUrlClick = (url: string) => {
    window.open(url, '_blank');
    setShowFileUrls(false);
  };

  /**
   * 处理预览图片点击
   */
  const handlePreviewClick = () => {
    if (onVideoPlay) {
      onVideoPlay();
    }
  };

  /**
   * 获取视频信息标签
   */
  const getVideoInfoTags = () => {
    if (!taskData.video_info) return [];
    const { resolution, file_size_bytes, file_duration } = taskData.video_info;
    return [
      resolution,
      formatFileSize(file_size_bytes),
      formatDuration(file_duration)
    ].filter(Boolean);
  };

  /**
   * 获取视频类型标签
   */
  const getVideoTypeTags = () => {
    const tags = [];
    if (taskData.video_type) tags.push(taskData.video_type);
    if (taskData.video_subtype) tags.push(taskData.video_subtype);
    if (taskData.video_info?.language) tags.push(taskData.video_info.language);
    if (taskData.video_info?.platform) tags.push(taskData.video_info.platform);
    return tags.filter(Boolean);
  };

  return (
    <div className="task-info-card">
      {/* 第一行：文本内容 */}
      <div className="task-text">
        <p className="text-content">{taskData.text}</p>
      </div>

      {/* 第二行：视频信息 */}
      <div className="task-video-info">
        <div className="video-info-tags">
          {getVideoInfoTags().map((tag, index) => (
            <span key={index} className="info-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* 第三行：视频类型信息 */}
      <div className="task-type-info">
        <div className="video-type-tags">
          {getVideoTypeTags().map((tag, index) => (
            <span key={index} className="type-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* 第四行：预览图 */}
      <div className="task-preview-container" onClick={handlePreviewClick}>
        {!imageError && taskData.preview_image ? (
          <>
            {!imageLoaded && (
              <div className="image-placeholder">
                <div className="loading-spinner"></div>
                <span className="loading-text">加载中...</span>
              </div>
            )}
            <img
              src={taskData.preview_image}
              alt="视频预览"
              className={`preview-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="preview-fallback">
            <div className="fallback-icon">📹</div>
            <div className="fallback-text">暂无预览图</div>
          </div>
        )}
        
        {/* 播放按钮覆盖层 */}
        <div className="play-overlay">
          <div className="play-button">
            <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.6)"/>
              <path d="M32 24L20 32V16L32 24Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 操作按钮区 */}
      <div className="task-actions">
        <button className="action-btn primary" onClick={onOriginalLinkClick}>
          原链接
        </button>
        
        <div className="video-address-wrapper">
          <button 
            className="action-btn secondary" 
            onClick={handleVideoAddressClick}
          >
            视频地址
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`dropdown-icon ${showFileUrls ? 'expanded' : ''}`}>
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 文件URL下拉框 */}
          {showFileUrls && (
            <div className="file-urls-dropdown">
              {taskData.file_urls && taskData.file_urls.length > 0 ? (
                taskData.file_urls.map((url, index) => (
                  <div 
                    key={index} 
                    className="file-url-item"
                    onClick={() => handleFileUrlClick(url)}
                  >
                    <span className="url-label">视频链接 {index + 1}</span>
                    <span className="url-text">{url.length > 50 ? `${url.slice(0, 50)}...` : url}</span>
                  </div>
                ))
              ) : (
                <div className="no-urls">暂无视频地址</div>
              )}
            </div>
          )}
        </div>
        
        <button className="action-btn material" onClick={onMaterialLibraryClick}>
          {taskData.materialName || '素材库'}
        </button>
      </div>
    </div>
  );
};

export default TaskInfoCard; 