import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTopBar } from './useTopBar';
import { TopBarItem } from './types';
import './HomeTopBar.css';

interface HomeTopBarProps {
  items: TopBarItem[];
  defaultSelected?: string;
  onChange?: (item: TopBarItem) => void;
}

const HomeTopBar: React.FC<HomeTopBarProps> = ({ 
  items = [], 
  defaultSelected = 'recommend',
  onChange 
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentBar = searchParams.get('homebar') || defaultSelected;
  const { setCurrentItem } = useTopBar(); // 添加 TopBarContext 的引用
  
  const handleTabClick = (item: TopBarItem) => {
    // 更新URL参数
    searchParams.set('homebar', item.id);
    setSearchParams(searchParams);
    
    // 同步更新 TopBarContext
    setCurrentItem(item);
    
    // 调用回调函数
    if (onChange) {
      onChange(item);
    }
  };

  return (
    <div className="home-top-bar">
      {items.map((item) => (
        <div 
          key={item.id}
          className={`top-bar-item ${currentBar === item.id ? 'active' : ''}`}
          onClick={() => handleTabClick(item)}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default HomeTopBar; 