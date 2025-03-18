/**
 * 视频卡片组件
 * 负责显示单个视频的详细信息，包括标题、状态、文本内容、标签和操作按钮
 */
import React, { useState } from 'react';
import { Video, VideoCardData } from '../api/videoListApi';
import VideoCardSlider from './VideoCardSlider';
import VideoPreview from './VideoPreview';
import LoadingFooter from './LoadingFooter';
import '../styles/VideoCard.css';

interface VideoCardProps {
  index: number; 
  style: React.CSSProperties;
  data: {
    videos: (VideoCardData | null)[];
    hasMore: boolean;
    loadingMore: boolean;
    loadMoreError: boolean;
    onEdit: (videoId: string) => void;
    onRegenerate: (videoId: string) => Promise<void>;
    onRetry: (index: number) => void;
  };
}

/**
 * 转换VideoCardData为Video类型
 */
const convertToVideo = (videoCard: VideoCardData): Video => {
  return {
    id: videoCard.generateId,
    title: videoCard.title,
    content: videoCard.text,
    createTime: new Date(videoCard.createTime).getTime(),
    status: videoCard.status === 'done' ? 'generated' : videoCard.status,
    tags: [videoCard.ratio, videoCard.materialName].filter(Boolean),
    videos: videoCard.videolist
  };
};

/**
 * 视频卡片组件 - 使用react-window标准格式
 */
const VideoCard: React.FC<VideoCardProps> = ({ index, style, data }) => {
  const { videos, hasMore, loadingMore, loadMoreError, onEdit, onRegenerate, onRetry } = data;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  console.log("VideoCard index:", index); // 用于调试
  
  // 如果是最后一项且有更多数据，显示加载更多
  if (index === videos.length && hasMore) {
    return (
      <div style={style} className="footer-container">
        <LoadingFooter 
          isLoading={loadingMore} 
          error={loadMoreError} 
          onRetry={() => onRetry(index)}
        />
      </div>
    );
  }

  // 如果数据还未加载，显示加载中的状态
  if (!videos[index]) {
    return (
      <div style={style} className="list-loading-item">
        <div className="loading-spinner-small"></div>
        <span>加载中...</span>
      </div>
    );
  }
  
  const videoCard = videos[index];
  const video = convertToVideo(videoCard);
  
  // 格式化创建时间
  const formatCreateTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  // 处理视频点击预览
  const handleVideoClick = (videoUrl: string) => {
    if (videoUrl) {
      setPreviewUrl(videoUrl);
    }
  };
  
  // 关闭视频预览
  const closePreview = () => {
    setPreviewUrl(null);
  };
  
  // 处理编辑按钮点击
  const handleEditClick = () => {
    onEdit(video.id);
  };
  
  // 处理重新生成按钮点击
  const handleRegenerateClick = async () => {
    try {
      await onRegenerate(video.id);
    } catch (error) {
      console.error('Failed to regenerate video:', error);
    }
  };

  // 判断视频是否正在生成中
  const isGenerating = video.status === 'generating';
  
  // 根据状态返回适当的状态标签样式和文本
  const getStatusClass = (): string => {
    switch (video.status) {
      case 'generating':
        return 'status-generating';
      case 'generated':
        return 'status-done';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-done';
    }
  };
  
  // 根据状态返回显示文本
  const getStatusText = (): string => {
    switch (video.status) {
      case 'generating':
        return '生成中';
      case 'generated':
        return '已生成';
      case 'failed':
        return '生成失败';
      default:
        return '已生成';
    }
  };

  return (
    <div style={style} className="video-card-wrapper">
      <div className="video-card">
        <div className="video-card-header">
          <h3 className="video-card-title">{video.title}</h3>
          <div className={`video-card-status ${getStatusClass()}`}>
            {getStatusText()}
          </div>
        </div>
        
        {/* 创建时间 */}
        <div className="video-card-time">创建时间: {formatCreateTime(video.createTime)}</div>
        
        {/* 视频文本内容 */}
        <div className="video-card-text">{video.content}</div>
        
        {/* 标签列表 */}
        <div className="video-card-tags">
          {video.tags && video.tags.map((tag: string, idx: number) => (
            <span key={idx} className="video-card-tag">{tag}</span>
          ))}
        </div>
        
        {/* 视频预览滑动器 */}
        <VideoCardSlider 
          videos={video.videos} 
          onVideoClick={handleVideoClick}
          isGenerating={isGenerating}
        />
        
        {/* 操作按钮 */}
        <div className="video-card-buttons">
          <button 
            className="video-card-button button-edit" 
            onClick={handleEditClick}
          >
            再次编辑
          </button>
          <button 
            className="video-card-button button-regenerate"
            onClick={handleRegenerateClick}
            disabled={isGenerating}
          >
            再次生成
          </button>
        </div>
        
        {/* 视频预览弹窗 */}
        {previewUrl && (
          <VideoPreview videoUrl={previewUrl} onClose={closePreview} />
        )}
      </div>
    </div>
  );
};

// 使用React.memo包装组件，避免不必要的重新渲染
export default React.memo(VideoCard); 