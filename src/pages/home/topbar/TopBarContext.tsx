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
  
  const [items] = useState<TopBarItem[]>(initialItems);
  const [currentItem, setCurrentItem] = useState<TopBarItem>(
    items.find(item => item.id === homebarId) || items[0]
  );

  // 当URL参数变化时更新currentItem
  useEffect(() => {
    const newCurrentItem = items.find(item => item.id === homebarId) || items[0];
    setCurrentItem(newCurrentItem);
  }, [homebarId, items]);

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