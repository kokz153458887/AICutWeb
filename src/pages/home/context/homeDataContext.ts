import * as React from 'react';
import { HomeData } from '../api/homeApiModel';

/**
 * 首页数据上下文接口
 */
export interface HomeDataContextType {
  homeData: HomeData | null;
  loading: boolean;
  error: string | null;
  refetch: (id?: string) => Promise<void>;
}

/**
 * 创建首页数据上下文
 */
export const HomeDataContext = React.createContext<HomeDataContextType>({
  homeData: null,
  loading: false,
  error: null,
  refetch: async () => {}
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