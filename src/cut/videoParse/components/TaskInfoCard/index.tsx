/**
 * 任务信息卡片组件
 * 展示解析任务的基本信息，包含文本、视频信息、预览图等
 */
import React, { useState, useRef, useEffect } from 'react';
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
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  /**
   * 检测文本是否超出2行
   */
  useEffect(() => {
    const checkTextOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        // 临时移除line-clamp限制来检测实际高度
        const originalStyle = element.style.cssText;
        element.style.cssText = 'display: block !important; -webkit-line-clamp: unset !important; max-height: none !important; overflow: visible !important;';
        
        const fullHeight = element.scrollHeight;
        
        // 恢复原始样式
        element.style.cssText = originalStyle;
        
        // 计算2行的高度（1.6 * 14px * 2 ≈ 44.8px）
        const twoLineHeight = 45;
        
        setShowExpandButton(fullHeight > twoLineHeight);
      }
    };

    // 延迟检测，确保文本已渲染
    const timer = setTimeout(checkTextOverflow, 100);
    return () => clearTimeout(timer);
  }, [taskData.text]);

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
   * 处理预览图片点击 - 直接全屏播放视频
   */
  const handlePreviewClick = () => {
    if (taskData.video_url) {
      // 创建全屏视频播放器
      const video = document.createElement('video');
      video.src = taskData.video_url;
      video.controls = true;
      video.autoplay = true;
      video.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        z-index: 10000;
        object-fit: contain;
      `;
      
      // 添加到页面
      document.body.appendChild(video);
      
      // 进入全屏
      video.requestFullscreen?.() || 
      (video as any).webkitRequestFullscreen?.() || 
      (video as any).mozRequestFullScreen?.();
      
      // 监听全屏退出事件
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && 
            !(document as any).webkitFullscreenElement && 
            !(document as any).mozFullScreenElement) {
          // 退出全屏时移除视频元素
          if (video.parentNode) {
            video.parentNode.removeChild(video);
          }
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
          document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        }
      };
      
      // 绑定全屏变化事件
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      
      // 视频结束时也移除元素
      video.addEventListener('ended', () => {
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      });
      
      // 点击视频外区域退出
      video.addEventListener('click', (e) => {
        if (e.target === video) {
          document.exitFullscreen?.() || 
          (document as any).webkitExitFullscreen?.() || 
          (document as any).mozCancelFullScreen?.();
        }
      });
    }
  };

  /**
   * 处理文本展开/收起
   */
  const handleTextToggle = () => {
    setIsTextExpanded(!isTextExpanded);
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
    <div className="video-parse-task-info-card">
      {/* 第一行：文本内容 */}
      <div className="video-parse-task-text">
        <p 
          ref={textRef}
          className={`video-parse-task-text-content ${isTextExpanded ? 'expanded' : ''}`}
        >
          {taskData.text}
        </p>
        {showExpandButton && (
          <div className="video-parse-task-text-expand-container">
            <button className="video-parse-task-text-expand-btn" onClick={handleTextToggle}>
              {isTextExpanded ? '收起' : '展开'}
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                className={`video-parse-task-expand-icon ${isTextExpanded ? 'expanded' : ''}`}
              >
                <path 
                  d="M7 10l5 5 5-5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 第二行：视频信息 */}
      <div className="video-parse-task-video-info">
        <div className="video-parse-video-info-tags">
          {getVideoInfoTags().map((tag, index) => (
            <span key={index} className="video-parse-info-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* 第三行：视频类型信息 */}
      <div className="video-parse-task-type-info">
        <div className="video-parse-video-type-tags">
          {getVideoTypeTags().map((tag, index) => (
            <span key={index} className="video-parse-type-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* 第四行：预览图 */}
      <div className="video-parse-task-preview-container" onClick={handlePreviewClick}>
        {!imageError && taskData.preview_image ? (
          <>
            {!imageLoaded && (
              <div className="video-parse-image-placeholder">
                <div className="video-parse-loading-spinner"></div>
                <span className="video-parse-loading-text">加载中...</span>
              </div>
            )}
            <img
              src={taskData.preview_image}
              alt="视频预览"
              className={`video-parse-preview-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="video-parse-preview-fallback">
            <div className="video-parse-fallback-icon">📹</div>
            <div className="video-parse-fallback-text">暂无预览图</div>
          </div>
        )}
        
        {/* 播放按钮覆盖层 */}
        <div className="video-parse-play-overlay">
          <div className="video-parse-play-button">
            <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.6)"/>
              <path d="M32 24L20 32V16L32 24Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 操作按钮区 */}
      <div className="video-parse-task-actions">
        <button className="video-parse-action-btn primary" onClick={onOriginalLinkClick}>
          原链接
        </button>
        
        <div className="video-parse-video-address-wrapper">
          <button 
            className="video-parse-action-btn secondary" 
            onClick={handleVideoAddressClick}
          >
            视频地址
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`video-parse-dropdown-icon ${showFileUrls ? 'expanded' : ''}`}>
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 文件URL下拉框 */}
          {showFileUrls && (
            <div className="video-parse-file-urls-dropdown">
              {taskData.file_urls && taskData.file_urls.length > 0 ? (
                taskData.file_urls.map((url, index) => (
                  <div 
                    key={index} 
                    className="video-parse-file-url-item"
                    onClick={() => handleFileUrlClick(url)}
                  >
                    <span className="video-parse-url-label">视频链接 {index + 1}</span>
                    <span className="video-parse-url-text">{url.length > 50 ? `${url.slice(0, 50)}...` : url}</span>
                  </div>
                ))
              ) : (
                <div className="video-parse-no-urls">暂无视频地址</div>
              )}
            </div>
          )}
        </div>
        
        <button className="video-parse-action-btn material" onClick={onMaterialLibraryClick}>
          {taskData.materialName || '素材库'}
        </button>
      </div>
    </div>
  );
};

export default TaskInfoCard; 