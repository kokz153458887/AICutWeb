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
  const loadedTabsRef = useRef<Map<string, { version: number; data: HomeData }>>(new Map());
  
  // 创建数据管理器实例
  const managerRef = useRef<HomeDataManager | null>(null);
  
  // 确保只创建一个管理器实例
  if (!managerRef.current) {
    managerRef.current = new HomeDataManager(
      { 
        setHomeData: (data: HomeData | null) => {
          if (data) {
            const tabId = searchParams.get('homebar') || 'recommend';
            
            // 如果是初始加载或强制刷新，直接使用新数据
            if (!initializedRef.current) {
              console.log('[useHomeData] 初始加载，直接使用新数据');
              setHomeData(data);
              loadedTabsRef.current.set(tabId, {
                version: Date.now(), // 使用时间戳作为版本号
                data: data
              });
              return;
            }
            
            const cachedData = loadedTabsRef.current.get(tabId);
            const newVersion = JSON.stringify(data.topbar || []);
            const oldVersion = cachedData ? JSON.stringify(cachedData.data.topbar || []) : '';
            
            // 比较数据是否有变化
            if (!cachedData || newVersion !== oldVersion) {
              console.log(`[useHomeData] 检测到数据变化，更新缓存和UI: ${tabId}`);
              loadedTabsRef.current.set(tabId, {
                version: Date.now(),
                data: data
              });
              setHomeData(data);
            } else {
              console.log(`[useHomeData] 数据未变化，使用缓存: ${tabId}`);
              setHomeData(cachedData.data);
            }
          } else {
            setHomeData(null);
          }
        },
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
      
      // 如果是初始加载，清除所有缓存
      if (!initializedRef.current) {
        console.log('[useHomeData] 初始加载，清除所有缓存');
        localStorage.removeItem('topBarItems');
        HomeDataManager.resetCache();
        loadedTabsRef.current.clear();
        initializedRef.current = true;
        await manager.fetchHomeData(id);
        return;
      }
      
      // 如果该tab已经加载过，使用缓存数据
      const cachedData = loadedTabsRef.current.get(tabId);
      if (cachedData) {
        console.log(`[useHomeData] 使用缓存数据: ${tabId}`);
        setHomeData(cachedData.data);
        return;
      }
      
      // 新的tab或强制刷新，发起请求
      console.log(`[useHomeData] 请求新数据: ${tabId}`);
      await manager.fetchHomeData(id);
    }
  }, [manager, searchParams]);
  
  // 统一处理数据加载
  useEffect(() => {
    fetchHomeData();
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