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
  refetch: (id?: string, isLoadMore?: boolean) => Promise<void>;
  // 分页相关属性
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: boolean;
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
  // 分页相关状态
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadMoreError, setLoadMoreError] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  
  // 引用定义
  const isMountedRef = useRef<boolean>(true);
  const currentTabIdRef = useRef<string | null>(null);
  const requestIdRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);
  const currentPageRef = useRef<number>(1);
  
  // 创建数据管理器实例
  const managerRef = useRef<HomeDataManager | null>(null);
  
  // 确保只创建一个管理器实例
  if (!managerRef.current) {
    managerRef.current = new HomeDataManager(
      { 
        setHomeData,
        setLoading,
        setError,
        // 添加分页相关状态设置函数
        setHasMore,
        setIsLoadingMore,
        setLoadMoreError
      },
      { isMountedRef, currentTabIdRef, requestIdRef, currentPageRef },
      searchParams
    );
  }
  
  // 获取数据管理器实例
  const manager = managerRef.current;
  
  // 包装fetchHomeData方法以确保引用稳定性
  const fetchHomeData = useCallback(async (id?: string, isLoadMore: boolean = false): Promise<void> => {
    if (manager) {
      const tabId = id || searchParams.get('homebar') || 'recommend';
      
      // 更新当前tab ID
      currentTabIdRef.current = tabId;
      
      if (isLoadMore) {
        // 加载更多数据
        setIsLoadingMore(true);
        setLoadMoreError(false);
        
        // 增加页码
        currentPageRef.current += 1;
        
        console.log(`[useHomeData] 加载更多数据: ${tabId}, 页码: ${currentPageRef.current}, hasMore: ${hasMore}`);
        try {
          await manager.fetchHomeData(tabId, true, currentPageRef.current);
        } catch (err) {
          setLoadMoreError(true);
          console.error(`[useHomeData] 加载更多数据失败: ${tabId}`, err);
        } finally {
          setIsLoadingMore(false);
        }
      } else {
        // 重置页码
        currentPageRef.current = 1;
        
        // 发起新的数据请求
        console.log(`[useHomeData] 请求数据: ${tabId}, 重置页码: ${currentPageRef.current}`);
        await manager.fetchHomeData(tabId, false, currentPageRef.current);
      }
    }
  }, [manager, searchParams, hasMore]);
  
  // 监听homeData变化，更新hasMore状态
  useEffect(() => {
    if (homeData && homeData.pages) {
      const newHasMore = homeData.pages.hasMore;
      console.log(`[useHomeData] 更新hasMore状态: ${hasMore} -> ${newHasMore}, 当前页码: ${homeData.pages.pageNum}, 总数据: ${homeData.pages.total}`);
      setHasMore(newHasMore);
    }
  }, [homeData]);
  
  // 统一处理数据加载
  useEffect(() => {
    const tabId = searchParams.get('homebar') || 'recommend';
    // 只在组件首次加载或URL参数变化时加载数据
    if (!initializedRef.current || currentTabIdRef.current !== tabId) {
      initializedRef.current = true;
      // 重置分页状态
      setHasMore(true);
      setIsLoadingMore(false);
      setLoadMoreError(false);
      currentPageRef.current = 1;
      
      console.log(`[useHomeData] 初始化加载或URL参数变化: ${tabId}, 当前tabId: ${currentTabIdRef.current}, 初始化状态: ${initializedRef.current}`);
      fetchHomeData(tabId);
    }
  }, [searchParams, fetchHomeData]);
  
  // 组件卸载清理
  useEffect(() => {
    return () => {
      if (manager) {
        manager.cleanup();
      }
      console.log(`[useHomeData] 组件卸载，清理资源`);
      initializedRef.current = false;
      isMountedRef.current = false;
    };
  }, [manager]);
  
  return {
    homeData,
    loading,
    error,
    refetch: fetchHomeData,
    // 返回分页相关状态
    hasMore,
    isLoadingMore,
    loadMoreError
  };
};