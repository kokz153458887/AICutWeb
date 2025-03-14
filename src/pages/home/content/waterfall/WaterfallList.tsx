/**
 * 瀑布流列表组件
 * 负责渲染双列瀑布流布局，使用react-virtualized实现虚拟列表
 */
import React, { useState, useEffect, useRef } from 'react';
import { List, AutoSizer, WindowScroller, ListRowProps } from 'react-virtualized';
import ContentCard from './ContentCard';
import './WaterfallList.css';
import { HomeContentItem } from '../../../../types/home';

interface WaterfallListProps {
  items: HomeContentItem[];
  onItemClick: (itemId: string) => void;
}

/**
 * 瀑布流列表组件
 * 实现真正的瀑布流布局，让每列独立计算高度
 */
const WaterfallList: React.FC<WaterfallListProps> = ({ items, onItemClick }) => {
  // 用于存储左右两列的卡片
  const [leftColumnItems, setLeftColumnItems] = useState<HomeContentItem[]>([]);
  const [rightColumnItems, setRightColumnItems] = useState<HomeContentItem[]>([]);
  
  // 用于存储左右两列的高度
  const [leftColumnHeight, setLeftColumnHeight] = useState(0);
  const [rightColumnHeight, setRightColumnHeight] = useState(0);
  
  // 在组件挂载和items变化时，重新分配卡片到左右两列
  useEffect(() => {
    // 重置列高度
    setLeftColumnHeight(0);
    setRightColumnHeight(0);
    
    // 重置列内容
    setLeftColumnItems([]);
    setRightColumnItems([]);
    
    // 分配卡片到左右两列
    distributeItems(items);
  }, [items]);
  
  /**
   * 根据卡片高度分配到左右两列，保持两列高度尽量平衡
   */
  const distributeItems = (itemsToDistribute: HomeContentItem[]) => {
    const leftItems: HomeContentItem[] = [];
    const rightItems: HomeContentItem[] = [];
    let leftHeight = 0;
    let rightHeight = 0;
    
    // 遍历所有卡片，将每个卡片分配到高度较小的列
    itemsToDistribute.forEach(item => {
      // 估算卡片高度（简化计算，实际应考虑屏幕宽度）
      const imgRatio = item.coverRatio || item.ratio || '1:1';
      const [width, height] = imgRatio.split(':').map(Number);
      const aspectRatio = height / width;
      const estimatedHeight = 150 * aspectRatio + 85; // 假设列宽为150px
      
      // 将卡片分配到高度较小的列
      if (leftHeight <= rightHeight) {
        leftItems.push(item);
        leftHeight += estimatedHeight + 12; // 加上margin-bottom 12px
      } else {
        rightItems.push(item);
        rightHeight += estimatedHeight + 12; // 加上margin-bottom 12px
      }
    });
    
    setLeftColumnItems(leftItems);
    setRightColumnItems(rightItems);
    setLeftColumnHeight(leftHeight);
    setRightColumnHeight(rightHeight);
  };
  
  return (
    <div className="waterfall-container">
      <div className="waterfall-columns">
        <div className="waterfall-column">
          {leftColumnItems.map(item => (
            <ContentCard 
              key={item.styleId}
              item={item} 
              onClick={() => onItemClick(item.styleId)}
            />
          ))}
        </div>
        <div className="waterfall-column">
          {rightColumnItems.map(item => (
            <ContentCard 
              key={item.styleId}
              item={item} 
              onClick={() => onItemClick(item.styleId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaterfallList; 