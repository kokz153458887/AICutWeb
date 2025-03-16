import * as React from 'react';
import { HomeData } from '../api/homeApiModel';

/**
 * 首页数据上下文接口
 */
export interface HomeDataContextType {
  homeData: HomeData | null;
  loading: boolean;
  error: string | null;
  refetch: (id?: string, isLoadMore?: boolean) => Promise<void>;
  // 分页相关属性
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: boolean;
}

/**
 * 创建首页数据上下文
 */
export const HomeDataContext = React.createContext<HomeDataContextType>({
  homeData: null,
  loading: false,
  error: null,
  refetch: async () => {},
  // 分页相关属性默认值
  hasMore: false,
  isLoadingMore: false,
  loadMoreError: false
});

/**
 * 自定义钩子，用于在组件中访问首页数据
 * @returns 首页数据上下文
 */
export const useHomeDataContext = (): HomeDataContextType => {
  const context = React.useContext(HomeDataContext);
  if (context === undefined) {
    throw new Error('useHomeDataContext必须在HomeDataProvider内部使用');
  }
  return context;
}; 