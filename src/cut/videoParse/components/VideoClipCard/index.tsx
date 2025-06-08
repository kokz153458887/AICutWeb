/**
 * 视频片段卡片组件
 * 展示单个视频片段，包含名称、时间范围、文本和预览图
 */
import React, { useState } from 'react';
import { VideoClip, ParseResultDetail, deleteClip } from '../../api';
import VideoPlayer from '../../../../components/VideoPlayer';
import { EditSelectAPI } from '../../../../edit/api/EditSelectAPI';
import { toast } from '../../../../components/Toast';
import './styles.css';

interface VideoClipCardProps {
  clip: VideoClip;
  taskData: ParseResultDetail;
  onFullScreenPlay?: (videoUrl: string) => void;
  onDeleted?: () => void; // 删除成功后的回调
}

/**
 * 视频片段卡片组件
 * 显示视频片段的基本信息和播放功能
 */
const VideoClipCard: React.FC<VideoClipCardProps> = ({ clip, taskData, onFullScreenPlay, onDeleted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExpandedText, setShowExpandedText] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * 处理删除按钮点击
   */
  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!taskData?.materialId) {
      toast.error('素材信息不存在');
      return;
    }
    
    // 确认删除
    if (!window.confirm(`确定要删除片段"${clip.name}"吗？删除后无法恢复。`)) {
      return;
    }

    let loadingToastId: number | null = null;
    
    try {
      // 显示loading提示
      loadingToastId = toast.loading('正在删除片段...');

      // 调用删除API
      const result = await deleteClip(taskData.id, clip.folder, clip.name);
      
      // 关闭loading
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      if (result.code === 0) {
        toast.success('删除成功');
        // 调用删除成功回调，刷新页面数据
        if (onDeleted) {
          onDeleted();
        }
      } else {
        toast.error(result.message || '删除失败');
      }
    } catch (error) {
      console.error('删除片段失败:', error);
      
      // 关闭loading
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      toast.error('删除失败，请稍后重试');
    }
  };

  /**
   * 处理文本展开/收起
   */
  const handleTextToggle = () => {
    setShowExpandedText(!showExpandedText);
  };

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
   * 处理预览图片点击播放
   */
  const handlePreviewClick = () => {
    setIsPlaying(true);
  };

  /**
   * 处理视频播放状态变化
   */
  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  /**
   * 处理全屏播放按钮点击
   */
  const handleFullScreenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFullScreenPlay) {
      onFullScreenPlay(clip.video_path);
    }
  };

  /**
   * 渲染文本内容
   */
  const renderText = () => {
    const isLongText = clip.text.length > 60; // 假设超过60字符需要展开
    const displayText = showExpandedText || !isLongText ? clip.text : clip.text.slice(0, 60);

    return (
      <div className="clip-text">
        <span className="text-content">{displayText}</span>
        {isLongText && !showExpandedText && (
          <span className="text-expand-btn" onClick={handleTextToggle}>
            ...展开
          </span>
        )}
        {isLongText && showExpandedText && (
          <span className="text-collapse-btn" onClick={handleTextToggle}>
            收起
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="video-clip-card">
      {/* 第一行：名称、标签、删除按钮 */}
      <div className="clip-header">
        <div className="clip-info">
          <span className="clip-name">{clip.name}</span>
          <div className="clip-tags">
            {clip.folder && <span className="folder-tag">{clip.folder}</span>}
            <span className="time-tag">{clip.beginTime}-{clip.endTime}</span>
          </div>
        </div>
        <button className="clip-delete-btn" onClick={handleDeleteClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h2m4 5v6m4-6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 第二行：文本内容 */}
      {renderText()}

      {/* 第三行：预览图片/视频播放器 */}
      <div className="clip-media-container">
        {!isPlaying ? (
          // 预览图片状态
          <div className="clip-preview" onClick={handlePreviewClick}>
            {!imageError && clip.preview_image ? (
              <>
                {!imageLoaded && (
                  <div className="image-placeholder">
                    <div className="loading-spinner"></div>
                  </div>
                )}
                <img
                  src={clip.preview_image}
                  alt="视频预览"
                  className={`preview-image ${imageLoaded ? 'loaded' : ''}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </>
            ) : (
              <div className="preview-fallback">
                <div className="fallback-icon">📹</div>
                <div className="fallback-text">暂无预览</div>
              </div>
            )}
            
            {/* 播放按钮 */}
            <div className="play-overlay">
              <div className="play-button">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.6)"/>
                  <path d="M32 24L20 32V16L32 24Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          // 视频播放器状态
          <div className="clip-video-player">
            <VideoPlayer
              videoUrl={clip.video_path}
              onPlayStateChange={handlePlayStateChange}
              autoPlay={true}
              showProgressBar={true}
            />
            
            {/* 全屏播放按钮 */}
            <div className="fullscreen-btn" onClick={handleFullScreenClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoClipCard;