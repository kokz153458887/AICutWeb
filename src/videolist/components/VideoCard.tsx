/**
 * 视频卡片组件
 * 负责显示单个视频的详细信息，包括标题、状态、文本内容、标签和操作按钮
 */
import React, { useState } from 'react';
import { Video } from '../api/videoListApi';
import VideoCardSlider from './VideoCardSlider';
import VideoPreview from './VideoPreview';
import '../styles/VideoCard.css';

interface VideoCardProps {
  video: Video;
  onEdit: (videoId: string) => void;
  onRegenerate: (videoId: string) => Promise<void>;
}

/**
 * 视频卡片组件
 */
const VideoCard: React.FC<VideoCardProps> = ({ video, onEdit, onRegenerate }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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
        {video.tags && video.tags.map((tag: string, index: number) => (
          <span key={index} className="video-card-tag">{tag}</span>
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
  );
};

export default VideoCard; 