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
  
  // 引用定义 - 使用MutableRefObject而不是RefObject
  const isMountedRef = useRef<boolean>(true);
  const currentTabIdRef = useRef<string | null>(null);
  const requestIdRef = useRef<number>(0);
  
  // 初始化标志，用于避免初始渲染时发送重复请求
  const initializedRef = useRef<boolean>(false);
  
  // 创建数据管理器实例
  const managerRef = useRef<HomeDataManager | null>(null);
  
  // 确保只创建一个管理器实例
  if (!managerRef.current) {
    managerRef.current = new HomeDataManager(
      { setHomeData, setLoading, setError },
      { isMountedRef, currentTabIdRef, requestIdRef },
      searchParams
    );
  }
  
  // 获取数据管理器实例
  const manager = managerRef.current;
  
  // 包装fetchHomeData方法以确保引用稳定性
  const fetchHomeData = useCallback(async (id?: string): Promise<void> => {
    if (manager) {
      await manager.fetchHomeData(id);
    }
  }, [manager]);
  
  // 统一处理数据加载，结合初始加载和参数变化时的加载
  useEffect(() => {
    // 如果是初始加载
    if (!initializedRef.current) {
      console.log('[useHomeData] 初始化加载数据');
      initializedRef.current = true;
    } else {
      // 如果是由于searchParams变化触发的，记录日志
      console.log('[useHomeData] 参数变化重新加载数据');
    }
    
    // 无论是初始加载还是参数变化，都只调用一次fetchHomeData
    fetchHomeData();
  }, [searchParams, fetchHomeData]);
  
  // 组件卸载清理
  useEffect(() => {
    return () => {
      if (manager) {
        manager.cleanup();
      }
    };
  }, [manager]);
  
  // 提供稳定的接口
  return {
    homeData,
    loading,
    error,
    refetch: fetchHomeData
  };
}; 