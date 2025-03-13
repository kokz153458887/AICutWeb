import * as React from 'react';
import { useState, ReactNode, useEffect } from 'react';
import { TopBarItem } from './types';
import { DEFAULT_TOPBAR_ITEMS } from '../context/constants';
import { useSearchParams } from 'react-router-dom';
import { TopBarContext } from './context';

interface TopBarProviderProps {
  children: ReactNode;
  initialItems?: TopBarItem[];
}

export const TopBarProvider: React.FC<TopBarProviderProps> = ({ 
  children, 
  initialItems = DEFAULT_TOPBAR_ITEMS 
}) => {
  const [searchParams] = useSearchParams();
  const homebarId = searchParams.get('homebar') || 'recommend';
  
  // 将items也变成状态，这样可以响应initialItems的变化
  const [items, setItems] = useState<TopBarItem[]>(initialItems);
  const [currentItem, setCurrentItem] = useState<TopBarItem>(
    items.find(item => item.id === homebarId) || items[0]
  );

  // 当initialItems变化时更新items状态
  useEffect(() => {
    console.log('[TopBarProvider] 收到新的导航项数据:', initialItems);
    setItems(initialItems);
  }, [initialItems]);

  // 当URL参数或items变化时更新currentItem
  useEffect(() => {
    const newCurrentItem = items.find(item => item.id === homebarId) || items[0];
    if (newCurrentItem.id !== currentItem.id || newCurrentItem.text !== currentItem.text) {
      console.log('[TopBarProvider] 更新当前选中项:', newCurrentItem);
      setCurrentItem(newCurrentItem);
    }
  }, [homebarId, items, currentItem.id, currentItem.text]);

  const value = {
    items,
    currentItem,
    setCurrentItem
  };

  return (
    <TopBarContext.Provider value={value}>
      {children}
    </TopBarContext.Provider>
  );
}; 