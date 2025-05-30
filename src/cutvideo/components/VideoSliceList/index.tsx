/**
 * 视频切片列表组件
 * 采用双列瀑布流布局，展示视频切片列表，支持加载更多
 */
import React, { useCallback } from 'react';
import VideoSliceCard from '../VideoSliceCard';
import LoadingView from '../../../components/LoadingView';
import ErrorView from '../../../components/ErrorView';
import { VideoSliceItem } from '../../types';
import { toast } from '../../../components/Toast';
import './styles.css';

interface VideoSliceListProps {
  items: VideoSliceItem[];
  loading?: boolean;
  error?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  loadMoreError?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  onItemClick?: (item: VideoSliceItem) => void;
  onItemRetry?: (item: VideoSliceItem) => void;
}

/**
 * 加载更多按钮组件
 */
const LoadMoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="load-more-container">
    <button className="load-more-button" onClick={onClick}>
      加载更多...
    </button>
  </div>
);

/**
 * 加载中状态组件
 */
const LoadingMoreItem: React.FC = () => (
  <div className="load-more-container">
    <div className="loading-more">
      <div className="loading-spinner"></div>
      <span>加载中...</span>
    </div>
  </div>
);

/**
 * 加载错误状态组件
 */
const LoadMoreError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="load-more-container">
    <div className="load-more-error">
      <span>加载失败</span>
      {onRetry && (
        <button onClick={onRetry}>重试</button>
      )}
    </div>
  </div>
);

/**
 * 没有更多数据组件
 */
const NoMoreData: React.FC = () => (
  <div className="load-more-container">
    <div className="no-more-data">
      没有更多数据了
    </div>
  </div>
);

/**
 * 视频切片列表组件
 * 提供双列瀑布流布局和无限滚动功能
 */
const VideoSliceList: React.FC<VideoSliceListProps> = ({
  items,
  loading = false,
  error = false,
  hasMore = false,
  isLoadingMore = false,
  loadMoreError = false,
  onLoadMore,
  onRetry,
  onItemClick,
  onItemRetry
}) => {
  /**
   * 处理加载更多点击
   */
  const handleLoadMoreClick = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
    } else {
      toast.info('加载功能开发中...');
    }
  }, [onLoadMore]);

  /**
   * 处理重试点击
   */
  const handleRetryClick = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  /**
   * 处理卡片点击
   */
  const handleItemClick = useCallback((item: VideoSliceItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  }, [onItemClick]);

  /**
   * 渲染底部状态
   */
  const renderFooter = () => {
    if (items.length === 0) {
      return null;
    }

    if (isLoadingMore) {
      return <LoadingMoreItem />;
    }

    if (loadMoreError) {
      return <LoadMoreError onRetry={handleRetryClick} />;
    }

    if (hasMore) {
      return <LoadMoreButton onClick={handleLoadMoreClick} />;
    }

    return <NoMoreData />;
  };

  // 初始加载状态
  if (loading && items.length === 0) {
    return <LoadingView />;
  }

  // 错误状态
  if (error && items.length === 0) {
    return <ErrorView onRetry={handleRetryClick} />;
  }

  // 空数据状态
  if (!loading && !error && items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-content">
          <div className="empty-text">暂无视频切片</div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-slice-list">
      <div className="masonry-grid">
        {items.map((item) => (
          <div key={item.id} className="masonry-item">
            <VideoSliceCard 
              item={item} 
              onClick={handleItemClick}
              onRetry={onItemRetry}
            />
          </div>
        ))}
      </div>
      {renderFooter()}
    </div>
  );
};

export default VideoSliceList; 