import { useState, useEffect, useCallback, useRef } from 'react';
import { HomeApiService } from '../../services/api/home/homeApi';
import { HomeData } from '../../services/api/home/homeApiModel';
import { useSearchParams } from 'react-router-dom';

export interface UseHomeDataResult {
  homeData: HomeData | null;
  loading: boolean;
  error: string | null;
  refetch: (id?: string) => Promise<void>;
}

// 数据缓存对象，在组件外部定义确保全局共享
const dataCache: Record<string, HomeData> = {};

export const useHomeData = (): UseHomeDataResult => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  // 当前加载的tab ID
  const currentTabIdRef = useRef<string | null>(null);

  const fetchHomeData = useCallback(async (id?: string) => {
    try {
      // 获取URL参数中的homebar值，默认为recommend
      const homebarParam = searchParams.get('homebar') || 'recommend';
      // 使用传入的id或从URL获取的值
      const topbar = id || homebarParam;
      
      // 更新当前加载的tab ID
      currentTabIdRef.current = topbar;
      
      // 检查缓存中是否已有此数据
      if (dataCache[topbar]) {
        console.log(`[useHomeData] 使用缓存数据: ${topbar}`);
        setHomeData(dataCache[topbar]);
        setError(null);
        setLoading(false);
        return;
      }
      
      // 如果没有缓存数据，则显示加载状态并发起请求
      console.log(`[useHomeData] 开始加载新数据: ${topbar}`);
      setLoading(true);
      
      const response = await HomeApiService.getHomeData({ topbar });
      
      // 确保回调时仍然是当前ID，避免竞态条件
      if (currentTabIdRef.current !== topbar) {
        console.log(`[useHomeData] 丢弃过期数据: ${topbar}, 当前ID: ${currentTabIdRef.current}`);
        return;
      }
      
      if (response && response.data) {
        // 保存数据到缓存
        dataCache[topbar] = response.data;
        console.log(`[useHomeData] 数据已缓存: ${topbar}`);
        
        setHomeData(response.data);
        setError(null);
      } else {
        throw new Error('返回数据格式不正确');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取首页数据失败';
      setError(errorMessage);
      console.error('[useHomeData] 获取首页数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]); // 当fetchHomeData变化时重新获取数据

  return { homeData, loading, error, refetch: fetchHomeData };
}; 