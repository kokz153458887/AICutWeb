import * as React from 'react';
import { useHomeData } from '../api';
import { HomeDataContext } from './homeDataContext';

/**
 * 首页数据提供者组件，负责获取和提供数据
 * @param children 子组件
 */
const HomeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用useHomeData钩子获取数据，这里是唯一调用该钩子的地方
  const { homeData, loading, error, refetch } = useHomeData();
  
  // 包装refetch函数，添加错误处理
  const handleRefetch = React.useCallback(async (id?: string) => {
    console.log('[HomeDataProvider] 开始重新获取数据:', { id });
    try {
      await refetch(id);
    } catch (err) {
      console.error('[HomeDataProvider] 重新获取数据失败:', err);
      throw err; // 向上传递错误，让UI组件处理
    }
  }, [refetch]);
  
  // 将所有数据和方法提供给子组件
  const contextValue = React.useMemo(() => ({
    homeData,
    loading,
    error,
    refetch: handleRefetch
  }), [homeData, loading, error, handleRefetch]);
  
  return (
    <HomeDataContext.Provider value={contextValue}>
      {children}
    </HomeDataContext.Provider>
  );
};

export default HomeDataProvider;