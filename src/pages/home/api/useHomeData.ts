import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HomeData } from './homeApiModel';
import { HomeDataManager } from './homeDataManager';

/**
 * useHomeData钩子返回结果接口
 */
export interface UseHomeDataResult {
  homeData: HomeData | null;
  loading: boolean;
  error: string | null;
  refetch: (id?: string) => Promise<void>;
}

/**
 * 首页数据获取钩子
 * 负责获取、缓存和管理首页数据
 */
export const useHomeData = (): UseHomeDataResult => {
  // 状态定义
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  // 引用定义
  const isMountedRef = useRef<boolean>(true);
  const currentTabIdRef = useRef<string | null>(null);
  const requestIdRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);
  
  // 创建数据管理器实例
  const managerRef = useRef<HomeDataManager | null>(null);
  
  // 确保只创建一个管理器实例
  if (!managerRef.current) {
    managerRef.current = new HomeDataManager(
      { 
        setHomeData,
        setLoading,
        setError
      },
      { isMountedRef, currentTabIdRef, requestIdRef },
      searchParams
    );
  }
  
  // 获取数据管理器实例
  const manager = managerRef.current;
  
  // 包装fetchHomeData方法以确保引用稳定性
  const fetchHomeData = useCallback(async (id?: string): Promise<void> => {
    if (manager) {
      const tabId = id || searchParams.get('homebar') || 'recommend';
      
      // 更新当前tab ID
      currentTabIdRef.current = tabId;
      
      // 发起新的数据请求
      console.log(`[useHomeData] 请求数据: ${tabId}`);
      await manager.fetchHomeData(tabId);
    }
  }, [manager, searchParams]);
  
  // 统一处理数据加载
  useEffect(() => {
    const tabId = searchParams.get('homebar') || 'recommend';
    // 只在组件首次加载或URL参数变化时加载数据
    if (!initializedRef.current || currentTabIdRef.current !== tabId) {
      initializedRef.current = true;
      fetchHomeData(tabId);
    }
  }, [searchParams, fetchHomeData]);
  
  // 组件卸载清理
  useEffect(() => {
    return () => {
      if (manager) {
        manager.cleanup();
      }
      initializedRef.current = false;
    };
  }, [manager]);
  
  return {
    homeData,
    loading,
    error,
    refetch: fetchHomeData
  };
};