import * as React from 'react';
import { useHomeDataContext } from '../context';

/**
 * 单个Tab的内容组件，负责展示特定标签页的内容
 * 使用React.memo减少不必要的重渲染
 * @param id 标签ID
 */
const TabContent: React.FC<{ id: string }> = React.memo(({ id }) => {
  // 使用共享的HomeDataContext，而不是直接调用useHomeData
  const { homeData, loading, error, refetch } = useHomeDataContext();
  const loadedRef = React.useRef(false);
  const prevLoadingRef = React.useRef(loading);
  
  // 组件初次渲染时输出日志
  React.useEffect(() => {
    console.log(`[TabContent] 渲染新的Tab: ${id}`);
  }, [id]);
  
  // 跟踪loading状态变化
  React.useEffect(() => {
    if (prevLoadingRef.current !== loading) {
      console.log(`[TabContent] ${id} loading状态变化: ${prevLoadingRef.current} -> ${loading}`);
      prevLoadingRef.current = loading;
    }
  }, [loading, id]);
  
  // 跟踪数据变化
  React.useEffect(() => {
    if (homeData) {
      console.log(`[TabContent] ${id} 接收到数据:`, homeData);
    }
  }, [homeData, id]);
  
  // 使用useCallback包装refetch函数，确保引用稳定性
  const stableRefetch = React.useCallback(() => {
    console.log(`[TabContent] 开始加载数据: ${id}`);
    refetch(id);
  }, [id, refetch]);
  
  // 只在组件首次渲染时加载数据，移除refetch依赖，防止重复加载
  React.useEffect(() => {
    if (!loadedRef.current) {
      console.log(`[TabContent] ${id} 首次加载数据，loadedRef = ${loadedRef.current}`);
      stableRefetch();
      loadedRef.current = true;
    } else {
      console.log(`[TabContent] ${id} 已经加载过数据，跳过加载，loadedRef = ${loadedRef.current}`);
    }
  }, [id, stableRefetch]); // 只依赖id变化，避免因refetch引用变化导致重新执行

  // 检查是否有内容可显示
  const hasContent = !loading && !error && homeData?.content && homeData.content.length > 0;
  
  React.useEffect(() => {
    console.log(`[TabContent] ${id} 渲染状态: loading=${loading}, error=${!!error}, hasContent=${hasContent}`);
  }, [loading, error, hasContent, id]);
  
  return (
    <div className="tab-content">
      {loading && <p className="loading-text">加载中...</p>}
      {error && <p className="error-text">{error}</p>}
      {hasContent ? (
        <div className="content-list">
          {homeData!.content.map((item, index) => (
            <div key={item.styleId || index} className="content-item">
              <p className="content-text">{item.text}</p>
              {item.cover && <img src={item.cover} alt={item.text} className="content-image" />}
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && <p className="empty-text">暂无内容</p>
      )}
    </div>
  );
});

export default TabContent; 