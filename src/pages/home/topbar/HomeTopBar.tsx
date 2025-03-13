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
  
  // 组件挂载时检查并恢复保存的homebar状态
  React.useEffect(() => {
    // 如果URL中没有homebar参数，但localStorage中有保存的值
    if (!searchParams.has('homebar')) {
      const savedHomebar = localStorage.getItem('lastHomebar');
      if (savedHomebar) {
        // 找到对应的item
        const savedItem = items.find(item => item.id === savedHomebar);
        if (savedItem) {
          // 更新URL和状态
          handleTabClick(savedItem, false);
        }
      }
    } else {
      // 将当前URL中的homebar值保存到localStorage
      localStorage.setItem('lastHomebar', currentBar);
    }
  }, []);

  const handleTabClick = (item: TopBarItem, saveToStorage = true) => {
    // 更新URL参数
    searchParams.set('homebar', item.id);
    setSearchParams(searchParams);
    
    // 同步更新 TopBarContext
    setCurrentItem(item);
    
    // 保存当前选择的homebar值到localStorage
    if (saveToStorage) {
      localStorage.setItem('lastHomebar', item.id);
      console.log(`[HomeTopBar] 保存homebar到本地存储: ${item.id}`);
    }
    
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