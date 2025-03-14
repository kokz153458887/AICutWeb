import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeDataContext } from '../context';
import LoadingView from '../../../components/LoadingView';
import ErrorView from '../../../components/ErrorView';

/**
 * 单个Tab的内容组件，负责展示特定标签页的内容
 * 使用React.memo减少不必要的重渲染
 * @param id 标签ID
 */
const TabContent: React.FC<{ id: string }> = React.memo(({ id }) => {
  // 使用共享的HomeDataContext，而不是直接调用useHomeData
  const { homeData, loading, error, refetch } = useHomeDataContext();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const prevLoadingRef = React.useRef(loading);
  // 使用navigate进行路由跳转
  const navigate = useNavigate();
  
  // 组件初次渲染时输出日志
  React.useEffect(() => {
    console.log(`[TabContent] 渲染新的Tab: ${id}`);
  }, [id]);
  
  // 跟踪loading状态变化
  React.useEffect(() => {
    if (loading) {
      console.log(`[TabContent] ${id} 正在加载数据`);
    } else {
      console.log(`[TabContent] ${id} 数据加载完成`);
      setIsRetrying(false); // 加载完成时重置重试状态
    }
  }, [loading, id]);
  
  // 跟踪数据变化
  React.useEffect(() => {
    if (homeData) {
      console.log(`[TabContent] ${id} 接收到数据:`, homeData);
    }
  }, [homeData, id]);
  
  // 使用useCallback包装refetch函数，确保引用稳定性
  const handleRetry = React.useCallback(async () => {
    console.log(`[TabContent] ${id} 开始重试`);
    setIsRetrying(true);
    try {
      await refetch(id);
    } catch (err) {
      console.error(`[TabContent] ${id} 重试失败:`, err);
      setIsRetrying(false);
    }
  }, [id, refetch]);

  
  // 处理内容项点击，跳转到视频播放页
  const handleContentClick = React.useCallback((itemId: string) => {
    console.log(`[TabContent] 点击内容项，跳转到视频播放页: ${itemId}`);
    navigate(`/video/${itemId}`);
  }, [navigate]);
  
  // 检查是否有内容可显示
  const hasContent = !loading && !error && homeData?.content && homeData.content.length > 0;
  
  React.useEffect(() => {
    console.log(`[TabContent] ${id} 渲染状态: loading=${loading}, error=${!!error}, hasContent=${hasContent}, isRetrying=${isRetrying}`);
  }, [loading, error, hasContent, id, isRetrying]);
  
  return (
    <div className="tab-content">
      {loading && <LoadingView />}
      {error && !loading && (
        <ErrorView 
          onRetry={handleRetry}
        />
      )}
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
    </div>
  );
});

export default TabContent;