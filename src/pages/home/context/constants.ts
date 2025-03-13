import { TopBarItem } from '../topbar/types';

/**
 * 默认顶部导航项配置
 * 在数据加载前或加载失败时使用
 */
export const DEFAULT_TOPBAR_ITEMS: TopBarItem[] = [
  {
    id: 'recommend',
    text: '推荐'
  },
  {
    id: 'useful',
    text: '常用'
  }
]; 