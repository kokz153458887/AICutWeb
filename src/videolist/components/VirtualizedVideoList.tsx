/**
 * 虚拟滚动视频列表组件
 * 负责使用虚拟滚动技术高效渲染大量视频卡片
 */
import React, { useRef, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VideoCardData } from '../api/videoListApi';
import VideoCard from './VideoCard';

interface VirtualizedVideoListProps {
  videos: (VideoCardData | null)[];
  hasMore: boolean;
  isItemLoaded: (index: number) => boolean;
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
  onEdit: (videoId: string) => void;
  onRegenerate: (videoId: string) => Promise<void>;
  onRetry: (index: number) => void;
  loadingMore: boolean;
  loadMoreError: boolean;
  lastAttemptedRange: {start: number, end: number} | null;
}

/**
 * 虚拟滚动视频列表组件
 */
const VirtualizedVideoList: React.FC<VirtualizedVideoListProps> = ({
  videos,
  hasMore,
  isItemLoaded,
  loadMoreItems,
  onEdit,
  onRegenerate,
  onRetry,
  loadingMore,
  loadMoreError,
  lastAttemptedRange
}) => {
  // 引用列表实例
  const listRef = useRef<any>(null);
  
  // 计算项目总数 - 当有更多数据时，需要增加一个条目用于显示加载更多
  const itemCount = useMemo(() => {
    return hasMore ? videos.length + 1 : videos.length;
  }, [videos.length, hasMore]);

  // 创建一个内部容器组件，可以自定义样式
  const ListContainer = useCallback(({ children, ...rest }: any) => {
    return (
      <div className="video-list-container" {...rest}>
        {children}
      </div>
    );
  }, []);

  // 准备传递给List的数据
  const itemData = useMemo(() => ({
    videos,
    hasMore,
    loadingMore,
    loadMoreError,
    onEdit,
    onRegenerate,
    onRetry,
    lastAttemptedRange
  }), [videos, hasMore, loadingMore, loadMoreError, onEdit, onRegenerate, onRetry, lastAttemptedRange]);

  return (
    <div className="virtualized-list-wrapper" style={{ height: 'calc(100vh - 44px)', width: '100%' }}>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            threshold={3}
            loadMoreItems={loadMoreItems}
            minimumBatchSize={10}
          >
            {({ onItemsRendered, ref }: { onItemsRendered: any; ref: any }) => (
              <List
                className="video-list"
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={430}
                itemData={itemData}
                onItemsRendered={onItemsRendered}
                ref={(listInstance: any) => {
                  // 同时设置InfiniteLoader的ref和本地ref
                  if (ref) ref(listInstance);
                  listRef.current = listInstance;
                }}
                innerElementType={ListContainer}
                overscanCount={3}
                useIsScrolling={false}
              >
                {VideoCard}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
};

// 使用React.memo包装组件，避免整个列表的不必要重渲染
export default React.memo(VirtualizedVideoList);