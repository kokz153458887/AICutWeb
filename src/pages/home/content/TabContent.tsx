import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeDataContext } from '../context';

/**
 * 单个Tab的内容组件，负责展示特定标签页的内容
 * 使用React.memo减少不必要的重渲染
 * @param id 标签ID
 */
const TabContent: React.FC<{ id: string }> = React.memo(({ id }) => {
  // 使用共享的HomeDataContext，而不是直接调用useHomeData
  const { homeData, loading, error, refetch } = useHomeDataContext();
  const prevLoadingRef = React.useRef(loading);
  // 使用navigate进行路由跳转
  const navigate = useNavigate();
  
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
    console.log(`[TabContent] 手动触发数据刷新: ${id}`);
    refetch(id);
  }, [id, refetch]);
  
  // 处理内容项点击，跳转到视频播放页
  const handleContentClick = React.useCallback((itemId: string) => {
    console.log(`[TabContent] 点击内容项，跳转到视频播放页: ${itemId}`);
    navigate(`/video/${itemId}`);
  }, [navigate]);
  
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
            <div 
              key={item.styleId || index} 
              className="content-item"
              onClick={() => handleContentClick(item.styleId || `${index}`)}
              style={{ cursor: 'pointer' }}
            >
              <p className="content-text">{item.text}</p>
              {item.cover && <img src={item.cover} alt={item.text} className="content-image" />}
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && <p className="empty-text">暂无内容</p>
      )}
      {/* 添加手动刷新按钮，用于需要时手动刷新数据 */}
      <button 
        onClick={stableRefetch} 
        className="refresh-button"
        style={{ display: 'none' }} // 默认隐藏，需要时可以显示
      >
        刷新数据
      </button>
    </div>
  );
});

export default TabContent; 