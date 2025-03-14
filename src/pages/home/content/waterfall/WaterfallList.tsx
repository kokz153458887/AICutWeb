/**
 * 瀑布流列表组件
 * 负责渲染双列瀑布流布局，使用masonic实现高性能瀑布流
 */
import React, { useCallback, useState, useEffect } from 'react';
import { Masonry } from 'masonic';
import ContentCard from './ContentCard';
import './WaterfallList.css';
import { HomeContentItem } from '../../../../types/home';

interface WaterfallListProps {
  items: HomeContentItem[];
  onItemClick: (itemId: string) => void;
}

/**
 * 瀑布流列表组件
 * 使用masonic库实现高性能的瀑布流布局，支持卡片复用
 */
const WaterfallList: React.FC<WaterfallListProps> = ({ items, onItemClick }) => {
  console.log(`[WaterfallList] 渲染瀑布流，数据项数量: ${items?.length}`);
  
  // 计算列宽和容器宽度
  const [columnWidth, setColumnWidth] = useState(150);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight);
  
  // 监听窗口大小变化，更新列宽和容器高度
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const containerPadding = width <= 480 ? 8 : 12;
      const columnGap = width <= 480 ? 6 : 8; // 减小列间距
      const newColumnWidth = (width - containerPadding * 2 - columnGap) / 2;
      
      console.log(`[WaterfallList] 更新尺寸 - 窗口宽度: ${width}, 列宽: ${newColumnWidth}, 窗口高度: ${height}`);
      
      setColumnWidth(newColumnWidth);
      setContainerWidth(width);
      // 设置容器高度为窗口高度的1.5倍，确保有足够空间加载更多内容
      setContainerHeight(height * 1.5);
    };
    
    // 初始计算
    updateDimensions();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // 渲染每个卡片
  const renderCard = useCallback(({ data, index, width }: { data: HomeContentItem; index: number; width: number }) => {
    if (!data) return null;
    
    console.log(`[WaterfallList] 渲染卡片 - 索引: ${index}, ID: ${data.styleId}, 文本: ${data.text.substring(0, 20)}...`);
    
    return (
      <ContentCard 
        item={data} 
        onClick={() => onItemClick(data.styleId)}
      />
    );
  }, [onItemClick]);
  
  // 如果没有数据，显示空状态
  if (!items || items.length === 0) {
    console.log('[WaterfallList] 没有数据，显示空状态');
    return (
      <div className="waterfall-empty">
        <p>暂无内容</p>
      </div>
    );
  }
  
  return (
    <div className="waterfall-container">
      <Masonry
        items={items}
        columnCount={2}
        columnGutter={8}
        columnWidth={columnWidth}
        overscanBy={5} // 增加预加载行数
        height={containerHeight} // 设置容器高度
        render={renderCard}
      />
    </div>
  );
};

export default WaterfallList; 