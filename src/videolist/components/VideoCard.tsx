/**
 * 视频卡片组件
 * 负责显示单个视频的详细信息，包括标题、状态、文本内容、标签和操作按钮
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, VideoCardData } from '../api/videoListApi';
import VideoCardSlider from './VideoCardSlider';
import LoadingFooter from './LoadingFooter';
import Toast, { toast } from '../../components/Toast';
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
    lastAttemptedRange: {start: number, end: number} | null;
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
  const { videos, hasMore, loadingMore, loadMoreError, onEdit, onRegenerate, onRetry, lastAttemptedRange } = data;
  const navigate = useNavigate();
  
  // console.log(`VideoCard渲染: index=${index}, hasMore=${hasMore}, loadMoreError=${loadMoreError}, videos.length=${videos.length}`);
  
  // 是否为加载更多的底部项
  const isLoadMoreItem = index === videos.length && hasMore;
  
  // 如果是底部项，显示加载更多或错误状态
  if (isLoadMoreItem || index === videos.length) {
    console.log(`VideoCard render footer: loadingMore=${loadingMore}, loadMoreError=${loadMoreError}`);
    
    return (
      <div style={style} className="footer-container">
        <LoadingFooter 
          isLoading={loadingMore && !loadMoreError && hasMore}
          error={loadMoreError}
          onRetry={() => {
            console.log('触发重试事件: index =', index);
            onRetry(index);
          }}
        />
      </div>
    );
  }
  
  // 当发生加载错误时，不显示未加载项的加载中状态
  if (!videos[index]) {
    if (loadMoreError && lastAttemptedRange) {
      if (index >= lastAttemptedRange.start && index <= lastAttemptedRange.end) {
        console.log(`因加载错误不显示loading: index=${index}, lastAttemptedRange=${JSON.stringify(lastAttemptedRange)}`);
        return <div style={style}></div>;
      }
    }
    
    console.log(`VideoCard render list-loading: index=${index}`);
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
  
  /**
   * 处理卡片点击，根据视频状态显示不同的提示或跳转
   */
  const handleCardClick = () => {
    // 根据视频状态处理点击事件
    switch (video.status) {
      case 'generating':
        toast.info('视频生成中，请稍后查看');
        return;
      case 'failed':
        toast.error('视频生成错误');
        return;
      case 'generated':
        // 使用 URL 参数控制模态层显示，同时传递视频数据
        const newSearch = new URLSearchParams(location.search);
        newSearch.set('videoId', video.id);
        newSearch.set('initialIndex', '0');
        if (!newSearch.has('tab')) {
          newSearch.set('tab', 'videolist');
        }

        console.log('handleCardClick: ', video);
        navigate(`/?${newSearch.toString()}`, {
          state: { 
            videoData: {
              generateId: video.id,
              title: video.title,
              text: video.content,
              createTime: new Date(video.createTime).toISOString(),
              status: video.status === 'generated' ? 'done' : video.status,
              ratio: video.tags[0] || '16:9',
              materialName: video.tags[1] || '',
              videolist: video.videos
            }
          }
        });
        return;
      default:
        return;
    }
  };
  
  /**
   * 处理视频点击，根据视频状态显示不同的提示或跳转
   */
  const handleVideoClick = (videoIndex: number) => {
    // 根据视频状态处理点击事件
    switch (video.status) {
      case 'generating':
        toast.info('视频生成中，请稍后查看');
        return;
      case 'failed':
        toast.error('视频生成错误');
        return;
      case 'generated':
        // 使用 URL 参数控制模态层显示，同时传递视频数据
        const newSearch = new URLSearchParams(location.search);
        newSearch.set('videoId', video.id);
        newSearch.set('initialIndex', videoIndex.toString());
        if (!newSearch.has('tab')) {
          newSearch.set('tab', 'videolist');
        }
        navigate(`/?${newSearch.toString()}`, {
          state: { 
            videoData: {
              generateId: video.id,
              title: video.title,
              text: video.content,
              createTime: new Date(video.createTime).toISOString(),
              status: video.status === 'generated' ? 'done' : video.status,
              ratio: video.tags[0] || '16:9',
              materialName: video.tags[1] || '',
              videolist: video.videos
            }
          }
        });
        return;
      default:
        return;
    }
  };
  
  // 处理编辑按钮点击
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    onEdit(video.id);
  };
  
  // 处理重新生成按钮点击
  const handleRegenerateClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
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
      <div className="video-card" onClick={handleCardClick}>
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
          {/* 展示视频显示比例标签 */}
          {videoCard.videoShowRatio && (
            <span className="video-card-tag">{videoCard.videoShowRatio}</span>
          )}
          {/* 展示素材名称标签 */}
          {videoCard.materialName && (
            <span className="video-card-tag">{videoCard.materialName}</span>
          )}
        </div>
        
        {/* 视频预览区域 */}
        <div className="video-preview-area" onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}>
          {video.videos && video.videos.length > 0 ? (
            <VideoCardSlider 
              videos={video.videos} 
              onVideoClick={handleVideoClick}
              isGenerating={isGenerating}
            />
          ) : (
            <div className="empty-preview-area">
              {video.status === 'generating' && (
                <div className="generating-text">视频生成中...</div>
              )}
              {video.status === 'failed' && (
                <div className="failed-text">视频生成失败</div>
              )}
            </div>
          )}
        </div>
        
        {/* 底部操作按钮 */}
        <div className="video-card-buttons" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </div>
  );
};

// 使用React.memo包装组件，避免不必要的重新渲染
export default React.memo(VideoCard); 