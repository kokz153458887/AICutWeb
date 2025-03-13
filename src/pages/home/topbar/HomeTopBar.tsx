import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTopBar } from './useTopBar';
import { TopBarItem } from './types';
import './HomeTopBar.css';

/**
 * 自定义Hook：管理顶部导航栏的本地存储操作
 */
const useTabStorage = () => {
  const getStoredTabId = React.useCallback(() => {
    return localStorage.getItem('lastHomebar');
  }, []);

  const storeTabId = React.useCallback((tabId: string) => {
    localStorage.setItem('lastHomebar', tabId);
    console.log(`[HomeTopBar] 保存homebar到本地存储: ${tabId}`);
  }, []);

  return { getStoredTabId, storeTabId };
};

/**
 * 首页顶部导航栏组件
 * 负责显示并处理顶部导航栏的交互
 */
const HomeTopBar: React.FC<HomeTopBarProps> = ({ 
  items = [], 
  defaultSelected = 'recommend',
  onChange 
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setCurrentItem } = useTopBar();
  const { getStoredTabId, storeTabId } = useTabStorage();
  
  // 记录items变化，用于监测API返回新数据
  const prevItemsRef = React.useRef<TopBarItem[]>([]);
  
  // 当items变化时记录日志，便于排查
  React.useEffect(() => {
    if (items.length > 0 && prevItemsRef.current.length > 0) {
      const hasChanged = items.length !== prevItemsRef.current.length || 
        items.some((item, i) => {
          const prevItem = prevItemsRef.current[i];
          return !prevItem || item.id !== prevItem.id || item.text !== prevItem.text;
        });
      
      if (hasChanged) {
        console.log(`[HomeTopBar] 检测到顶部栏项目更新，新数据:`, 
          items.map(i => `${i.id}:${i.text}`).join(', '));
      }
    }
    prevItemsRef.current = [...items];
  }, [items]);
  
  // 确定当前选中的标签ID
  const currentTabId = React.useMemo(() => {
    // 优先使用URL参数
    if (searchParams.has('homebar')) {
      return searchParams.get('homebar') || defaultSelected;
    }
    
    // 其次使用localStorage存储的值
    const storedTabId = getStoredTabId();
    if (storedTabId && items.some(item => item.id === storedTabId)) {
      return storedTabId;
    }
    
    // 最后使用默认值
    return defaultSelected;
  }, [searchParams, defaultSelected, items, getStoredTabId]);
  
  // 当前选中的标签对象
  const currentTab = React.useMemo(() => {
    return items.find(item => item.id === currentTabId) || (items.length > 0 ? items[0] : null);
  }, [items, currentTabId]);
  
  // 切换标签的处理函数
  const handleTabClick = React.useCallback((item: TopBarItem) => {
    // 1. 更新URL参数（作为主数据源）
    searchParams.set('homebar', item.id);
    setSearchParams(searchParams);
    
    // 2. 同步更新Context
    setCurrentItem(item);
    
    // 3. 存储到localStorage（作为备份）
    storeTabId(item.id);
    
    // 4. 触发回调
    if (onChange) {
      onChange(item);
    }
  }, [searchParams, setSearchParams, setCurrentItem, storeTabId, onChange]);
  
  // 统一的初始化和同步逻辑
  React.useEffect(() => {
    if (!items.length) return;
    
    // 如果URL中有参数但在items中找不到对应项，或者没有URL参数但有localStorage值
    if (currentTab) {
      // 确保Context状态与当前选中标签一致
      setCurrentItem(currentTab);
      
      // 如果是从localStorage恢复的值且不在URL中，更新URL
      if (!searchParams.has('homebar') && currentTabId === getStoredTabId()) {
        searchParams.set('homebar', currentTabId);
        setSearchParams(searchParams);
      }
    } else {
      // 当前选中项无效，使用第一个选项
      console.log(`[HomeTopBar] 当前选中的选项 "${currentTabId}" 不存在于导航项中，使用第一个选项`);
      if (items.length > 0) {
        handleTabClick(items[0]);
      }
    }
  }, [items, currentTab, currentTabId, searchParams, setSearchParams, handleTabClick, setCurrentItem, getStoredTabId]);
  
  // 初始加载时保存URL中的homebar到localStorage
  React.useEffect(() => {
    if (searchParams.has('homebar')) {
      storeTabId(currentTabId);
    }
  }, [searchParams, currentTabId, storeTabId]);

  return (
    <div className="home-top-bar">
      {items.map((item) => (
        <div 
          key={item.id}
          className={`top-bar-item ${currentTabId === item.id ? 'active' : ''}`}
          onClick={() => handleTabClick(item)}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

interface HomeTopBarProps {
  items: TopBarItem[];
  defaultSelected?: string;
  onChange?: (item: TopBarItem) => void;
}

export default HomeTopBar; 