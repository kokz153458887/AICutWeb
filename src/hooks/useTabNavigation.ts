import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Tab导航Hook
 * 用于管理标签页的导航状态和逻辑
 */
export interface TabNavigationOptions {
  /** 默认选中的标签页 */
  defaultTab?: string;
  /** 是否保存homebar状态 */
  preserveHomebar?: boolean;
}

/**
 * 处理标签页导航的自定义Hook
 * @param options - 导航配置选项
 */
export const useTabNavigation = (options: TabNavigationOptions = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // 获取当前选中的tab
  const currentTab = searchParams.get('tab') || options.defaultTab || 'home';
  
  /**
   * 处理标签页切换
   * @param tab - 目标标签页
   */
  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', tab);
    
    if (options.preserveHomebar && tab === 'home' && !newParams.has('homebar')) {
      const savedHomebar = localStorage.getItem('lastHomebar');
      if (savedHomebar) {
        newParams.set('homebar', savedHomebar);
      }
    }
    
    navigate(`/?${newParams.toString()}`, { replace: true });
  };
  
  return {
    currentTab,
    handleTabChange,
  };
};