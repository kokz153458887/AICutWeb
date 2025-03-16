/**
 * 瀑布流列表组件
 * 使用纯CSS实现瀑布流布局，简化实现，避免虚拟滚动带来的复杂性
 */
import React, { useCallback, useEffect, useRef } from 'react';
import ContentCard from './ContentCard';
import './WaterfallList.css';
import { HomeContentItem } from '../../../../types/home';

interface WaterfallListProps {
  items: HomeContentItem[];
  onItemClick: (itemId: string) => void;
  onRetry?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  loadMoreError?: boolean;
  onLoadMore?: () => void;
}

/**
 * 加载中状态组件
 */
const LoadingItem: React.FC = () => (
  <div className="loading-more">
    <div className="loading-spinner"></div>
    <span>加载中...</span>
  </div>
);

/**
 * 加载错误状态组件
 */
const ErrorItem: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="load-more-error">
    <p>加载失败，请点击重试</p>
    {onRetry && (
      <button onClick={onRetry}>重试</button>
    )}
  </div>
);

/**
 * 没有更多数据状态组件
 */
const NoMoreItem: React.FC = () => (
  <div className="no-more-data">
    <p>已全部加载</p>
  </div>
);

/**
 * 加载更多按钮组件
 */
const LoadMoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="load-more-button">
    <button onClick={onClick}>加载更多</button>
  </div>
);

/**
 * 瀑布流列表组件
 * 使用纯CSS实现双列瀑布流布局，支持加载更多
 */
const WaterfallList: React.FC<WaterfallListProps> = ({ 
  items, 
  onItemClick, 
  onRetry,
  hasMore = false,
  isLoadingMore = false,
  loadMoreError = false,
  onLoadMore
}) => {
  console.log(`[WaterfallList] 渲染瀑布流，数据项数量: ${items?.length}`);
  console.log(`[WaterfallList] 当前状态: hasMore=${hasMore}, isLoadingMore=${isLoadingMore}, loadMoreError=${loadMoreError}`);
  
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 处理卡片点击
  const handleCardClick = useCallback((item: HomeContentItem) => {
    // 优先使用navUrl，如果没有则使用styleId构建路径
    const url = item.navUrl || `/video/${item.styleId}`;
    console.log(`[WaterfallList] 点击卡片: ${item.styleId}, 跳转到: ${url}`);
    onItemClick(item.styleId);
  }, [onItemClick]);
  
  // 处理加载更多点击
  const handleLoadMoreClick = useCallback(() => {
    if (onLoadMore && !isLoadingMore) {
      console.log(`[WaterfallList] 用户点击加载更多按钮 - 当前数据量: ${items.length}`);
      onLoadMore();
    }
  }, [onLoadMore, isLoadingMore, items.length]);
  
  // 如果没有数据，显示空状态
  if (!items || items.length === 0) {
    console.log('[WaterfallList] 没有数据，显示空状态');
    return (
      <div className="waterfall-empty">
        <p>暂无内容</p>
      </div>
    );
  }
  
  // 渲染底部状态
  const renderFooter = () => {
    if (isLoadingMore) {
      console.log('[WaterfallList] 渲染加载中状态');
      return <LoadingItem />;
    }
    
    if (loadMoreError) {
      console.log('[WaterfallList] 渲染加载错误状态');
      return <ErrorItem onRetry={onRetry} />;
    }
    
    if (!hasMore && items.length > 0) {
      console.log('[WaterfallList] 渲染无更多数据状态');
      return <NoMoreItem />;
    }
    
    if (hasMore && items.length > 0) {
      console.log('[WaterfallList] 渲染加载更多按钮');
      return <LoadMoreButton onClick={handleLoadMoreClick} />;
    }
    
    return null;
  };
  
  return (
    <div className="waterfall-container" ref={containerRef}>
      <div className="masonry-grid">
        {/* 渲染内容卡片 */}
        {items.map((item, index) => (
          <div className="masonry-item" key={`${item.styleId}-${index}`}>
            <ContentCard 
              item={item} 
              onClick={() => handleCardClick(item)}
            />
          </div>
        ))}
        
        {/* 渲染底部状态 */}
        {renderFooter()}
      </div>
    </div>
  );
};

export default WaterfallList; 