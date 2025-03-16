import * as React from 'react';
import { useHomeData } from '../api';
import { HomeDataContext } from './homeDataContext';

/**
 * 首页数据提供者组件，负责获取和提供数据
 * @param children 子组件
 */
const HomeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用useHomeData钩子获取数据，这里是唯一调用该钩子的地方
  const { homeData, loading, error, refetch, hasMore, isLoadingMore, loadMoreError } = useHomeData();
  
  // 监听数据变化，用于调试
  React.useEffect(() => {
    if (homeData) {
      const prevLength = homeData.content?.length - 30 || 0;
      const currentLength = homeData.content?.length || 0;
      console.log(`[HomeDataProvider] 数据长度变化: ${prevLength} -> ${currentLength}`);
      
      // 打印新增数据的ID，用于调试
      if (homeData.content && homeData.content.length > 30) {
        const newItems = homeData.content.slice(Math.max(0, homeData.content.length - 30), homeData.content.length);
        const newItemIds = newItems.slice(0, 5).map(item => item.styleId).join(', ');
        console.log(`[HomeDataProvider] 新增数据ID: ${newItemIds}`);
      }
    }
  }, [homeData?.content?.length]);
  
  // 包装refetch函数，添加错误处理
  const handleRefetch = React.useCallback(async (id?: string, isLoadMore?: boolean) => {
    console.log('[HomeDataProvider] 开始重新获取数据:', { id, isLoadMore });
    try {
      await refetch(id, isLoadMore);
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
    refetch: handleRefetch,
    hasMore,
    isLoadingMore,
    loadMoreError
  }), [homeData, loading, error, handleRefetch, hasMore, isLoadingMore, loadMoreError]);
  
  return (
    <HomeDataContext.Provider value={contextValue}>
      {children}
    </HomeDataContext.Provider>
  );
};

export default HomeDataProvider;