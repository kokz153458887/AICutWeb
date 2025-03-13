import { useState, useEffect, useCallback } from 'react';
import { HomeApiService } from '../../services/api/home/homeApi';
import { HomeData } from '../../services/api/home/homeApiModel';
import { useSearchParams } from 'react-router-dom';

export interface UseHomeDataResult {
  homeData: HomeData | null;
  loading: boolean;
  error: string | null;
  refetch: (id?: string) => Promise<void>;
}

export const useHomeData = (): UseHomeDataResult => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const fetchHomeData = useCallback(async (id?: string) => {
    try {
      setLoading(true);
      // 获取URL参数中的homebar值，默认为recommend
      const homebarParam = searchParams.get('homebar') || 'recommend';
      // 使用传入的id或从URL获取的值
      const topbar = id || homebarParam;
      
      const response = await HomeApiService.getHomeData({ topbar });
      
      if (response && response.data) {
        setHomeData(response.data);
        setError(null);
      } else {
        throw new Error('返回数据格式不正确');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取首页数据失败';
      setError(errorMessage);
      console.error('获取首页数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]); // 当fetchHomeData变化时重新获取数据

  return { homeData, loading, error, refetch: fetchHomeData };
}; 