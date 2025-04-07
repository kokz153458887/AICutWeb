/**
 * 虚拟化音色网格组件
 * 使用react-window实现高性能的网格布局
 */
import React, { memo, useEffect, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { VoiceInfo } from '../../api/VoiceQueryAPI';
import VoiceItem from './VoiceItem';
import '../../styles/VirtualizedVoiceGrid.css';

// 网格项之间的间距
const GAP = 5;
// 最小列宽
const MIN_COLUMN_WIDTH = 20;

interface VirtualizedVoiceGridProps {
  voices: VoiceInfo[];
  selectedVoiceId: string | null;
  containerWidth: number;
  containerHeight: number;
  onVoiceSelect: (id: string) => void;
  onFavoriteToggle: (id: string, isFavorite: boolean) => void;
  onSettingsClick: (id: string) => void;
  hasMore: boolean;
  isItemLoaded: (index: number) => boolean;
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
}

interface RowProps {
  data: {
    voices: VoiceInfo[];
    selectedVoiceId: string | null;
    columns: number;
    itemWidth: number;
    onVoiceSelect: (id: string) => void;
    onFavoriteToggle: (id: string, isFavorite: boolean) => void;
    onSettingsClick: (id: string) => void;
  };
  index: number;
  style: React.CSSProperties;
}

/**
 * 网格行组件，渲染一行的音色项
 */
const Row = memo(({ data, index, style }: RowProps) => {
  const { voices, selectedVoiceId, columns, itemWidth, onVoiceSelect, onFavoriteToggle, onSettingsClick } = data;
  const fromIndex = index * columns;
  
  return (
    <div className="voice-grid-row" style={style}>
      {Array.from({ length: columns }).map((_, columnIndex) => {
        const voiceIndex = fromIndex + columnIndex;
        if (voiceIndex >= voices.length) return <div key={`empty-${columnIndex}`} style={{ width: `${itemWidth}px` }} />;
        
        const voice = voices[voiceIndex];
        return (
          <div 
            key={voice.voiceCode} 
            className="voice-grid-item"
            style={{ width: `${itemWidth}px` }}
          >
            <VoiceItem
              id={voice.voiceCode}
              name={voice.voicer}
              avatar={voice.avatar}
              emotion={voice.emotion?.map(e => e.name) || []}
              isFavorite={voice.isFav}
              isSelected={selectedVoiceId === voice.voiceCode}
              speechUrl={voice.speech?.url}
              onClick={onVoiceSelect}
              onFavoriteToggle={onFavoriteToggle}
              onSettingsClick={onSettingsClick}
            />
          </div>
        );
      })}
    </div>
  );
});

/**
 * 虚拟化音色网格组件
 */
const VirtualizedVoiceGrid: React.FC<VirtualizedVoiceGridProps> = ({
  voices,
  selectedVoiceId,
  containerWidth,
  containerHeight,
  onVoiceSelect,
  onFavoriteToggle,
  onSettingsClick,
  hasMore,
  isItemLoaded,
  loadMoreItems
}) => {
  // 根据容器宽度计算可以显示的列数
  const columns = useMemo(() => {
    // 固定为4列
    return 4;
  }, []);
  
  // 根据列数计算每项宽度
  const itemWidth = useMemo(() => {
    const padding = GAP * 2;
    const availableWidth = containerWidth - padding;
    const calculatedWidth = Math.floor((availableWidth - (columns - 1) * GAP) / columns);
    return Math.max(calculatedWidth, MIN_COLUMN_WIDTH);
  }, [containerWidth, columns]);
  
  // 每行高度
  const rowHeight = useMemo(() => {
    // 在小屏幕上减小行高
    if (containerWidth <= 320) return 120;
    if (containerWidth <= 480) return 130;
    if (containerWidth <= 768) return 140;
    return 150;
  }, [containerWidth]);
  
  // 计算行数
  const rowCount = Math.ceil((voices.length + (hasMore ? 1 : 0)) / columns);
  
  // 行渲染函数数据
  const itemData = {
    voices,
    selectedVoiceId,
    columns,
    itemWidth,
    onVoiceSelect,
    onFavoriteToggle,
    onSettingsClick
  };
  
  // 记录日志，帮助调试
  useEffect(() => {
    console.log('VirtualizedVoiceGrid渲染:', {
      containerWidth,
      containerHeight,
      voicesCount: voices.length,
      columns,
      itemWidth,
      rowHeight,
      rowCount,
      hasMore
    });
  }, [containerWidth, containerHeight, voices.length, columns, itemWidth, rowHeight, rowCount, hasMore]);
  
  if (containerWidth === 0 || containerHeight === 0) {
    console.warn('VirtualizedVoiceGrid: 容器尺寸为0，无法渲染');
    return null;
  }
  
  return (
    <div className="virtualized-voice-grid">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={rowCount}
        loadMoreItems={loadMoreItems}
        threshold={2}
      >
        {({ onItemsRendered, ref }: { 
          onItemsRendered: (params: {
            overscanStartIndex: number;
            overscanStopIndex: number;
            visibleStartIndex: number;
            visibleStopIndex: number;
          }) => void;
          ref: (node: any) => void;
        }) => (
          <FixedSizeList
            className="voice-grid-list"
            height={containerHeight}
            width={containerWidth}
            itemCount={rowCount}
            itemSize={rowHeight}
            itemData={itemData}
            onItemsRendered={onItemsRendered}
            ref={ref}
            overscanCount={2}
            style={{
              position: 'relative',
              outline: 'none',
              height: '100%'
            }}
          >
            {Row}
          </FixedSizeList>
        )}
      </InfiniteLoader>
    </div>
  );
};

export default memo(VirtualizedVoiceGrid); 