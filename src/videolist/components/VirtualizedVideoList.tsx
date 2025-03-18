/**
 * 虚拟滚动视频列表组件
 * 负责使用虚拟滚动技术高效渲染大量视频卡片
 */
import React, { useRef, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Video, VideoCardData } from '../api/videoListApi';

interface VirtualizedVideoListProps {
  videos: VideoCardData[];
  hasMore: boolean;
  isItemLoaded: (index: number) => boolean;
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
  renderItem: ({ index, style }: { index: number; style: React.CSSProperties }) => JSX.Element;
}

/**
 * 虚拟滚动视频列表组件
 */
const VirtualizedVideoList: React.FC<VirtualizedVideoListProps> = ({
  videos,
  hasMore,
  isItemLoaded,
  loadMoreItems,
  renderItem,
}) => {
  // 引用List组件实例
  const listRef = useRef<List>(null);

  // 计算项目总数
  const itemCount = hasMore ? videos.length + 1 : videos.length;

  // 创建一个内部容器组件，可以自定义样式
  const ListContainer = useCallback(({ children, ...rest }: any) => {
    return (
      <div className="video-list-container" {...rest}>
        {children}
      </div>
    );
  }, []);

  return (
    <div className="virtualized-list-wrapper" style={{ height: 'calc(100vh - 44px)', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
            threshold={5}
          >
            {({ onItemsRendered, ref }) => (
              <List
                className="video-list"
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={500}  // 增加高度，确保有足够空间容纳卡片内容
                onItemsRendered={onItemsRendered}
                ref={(list) => {
                  ref(list);
                  listRef.current = list;
                }}
                innerElementType={ListContainer}
              >
                {renderItem}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedVideoList; 