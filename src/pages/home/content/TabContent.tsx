import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeDataContext } from '../context';
import LoadingView from '../../../components/LoadingView';
import ErrorView from '../../../components/ErrorView';
import { WaterfallList } from './waterfall';
import './TabContent.css';

/**
 * 单个Tab的内容组件，负责展示特定标签页的内容
 * 使用React.memo减少不必要的重渲染
 * @param id 标签ID
 */
const TabContent: React.FC<{ id: string }> = React.memo(({ id }) => {
  // 使用共享的HomeDataContext
  const { homeData, loading, error, refetch } = useHomeDataContext();
  const navigate = useNavigate();
  
  // 处理重试
  const handleRetry = useCallback(async () => {
    console.log(`[TabContent] ${id} 开始重试`);
    try {
      await refetch(id);
    } catch (err) {
      console.error(`[TabContent] ${id} 重试失败:`, err);
    }
  }, [id, refetch]);

  // 处理内容项点击，跳转到视频播放页
  const handleContentClick = useCallback((itemId: string) => {
    console.log(`[TabContent] 点击内容项，跳转到视频播放页: ${itemId}`);
    navigate(`/video/${itemId}`);
  }, [navigate]);
  
  // 检查是否有内容可显示
  const hasContent = !loading && !error && homeData?.content && homeData.content.length > 0;
  
  return (
    <div className="tab-content">
      {loading && <LoadingView />}
      
      {error && !loading && (
        <ErrorView onRetry={handleRetry} />
      )}
      
      {hasContent && (
        <WaterfallList 
          items={homeData!.content}
          onItemClick={handleContentClick}
        />
      )}
      
      {!loading && !error && !hasContent && (
        <div className="empty-content">
          <p>暂无内容</p>
        </div>
      )}
    </div>
  );
});

export default TabContent;