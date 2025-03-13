import { useState, useEffect } from 'react';
import { HomeApiService } from '../../services/api/home/homeApi';
import { HomeData } from '../../services/api/home/homeApiModel';

export interface UseHomeDataResult {
  homeData: HomeData | null;
  loading: boolean;
  error: string | null;
}

export const useHomeData = (): UseHomeDataResult => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await HomeApiService.getHomeData({ topbar: 'recommend' });
        
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
    };

    fetchHomeData();
  }, []);

  return { homeData, loading, error };
}; 