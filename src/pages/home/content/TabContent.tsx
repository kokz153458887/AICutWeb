import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeDataContext } from '../context';
import LoadingView from '../../../components/LoadingView';
import ErrorView from '../../../components/ErrorView';
import { WaterfallList } from './waterfall';
import './TabContent.css';
import { HomeContentItem } from '../../../types/home';

/**
 * 单个Tab的内容组件，负责展示特定标签页的内容
 * 使用React.memo减少不必要的重渲染
 * @param id 标签ID
 */
const TabContent: React.FC<{ id: string }> = React.memo(({ id }) => {
  // 使用共享的HomeDataContext
  const { homeData, loading, error, refetch, hasMore, isLoadingMore, loadMoreError } = useHomeDataContext();
  const navigate = useNavigate();
  
  // 保存当前内容项的引用
  const contentItemsRef = useRef<HomeContentItem[]>([]);
  
  // 记录渲染时的滚动位置
  console.log(`[TabContent] ${id} 渲染开始 - 当前滚动位置: ${window.scrollY}`);
  
  // 处理重试
  const handleRetry = useCallback(async () => {
    console.log(`[TabContent] ${id} 开始重试`);
    try {
      await refetch(id);
    } catch (err) {
      console.error(`[TabContent] ${id} 重试失败:`, err);
    }
  }, [id, refetch]);
  
  // 转换数据，确保类型匹配
  const contentItems = useMemo(() => {
    if (!homeData?.content || homeData.content.length === 0) {
      console.log(`[TabContent] ${id} 没有内容数据`);
      return [];
    }
    
    console.log(`[TabContent] ${id} 转换数据 - 数据长度: ${homeData.content.length}`);
    
    // 将数据转换为符合HomeContentItem类型的格式
    const items = homeData.content.map(item => ({
      ...item,
      // 确保stars是字符串类型
      stars: typeof item.stars === 'number' ? String(item.stars) : item.stars
    })) as HomeContentItem[];
    
    console.log(`[TabContent] ${id} 数据转换完成 - 前5项ID: ${items.slice(0, 5).map(item => item.styleId).join(', ')}`);
    
    // 更新引用
    contentItemsRef.current = items;
    
    return items;
  }, [homeData?.content, id]);
  
  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    console.log(`[TabContent] ${id} 加载更多内容`);
    refetch(id, true);
  }, [id, refetch]);
  
  // 检查是否有内容可显示
  const hasContent = !loading && !error && contentItems.length > 0;
  
  return (
    <div className="tab-content">
      {loading && contentItems.length === 0 && <LoadingView />}
      
      {error && !loading && contentItems.length === 0 && (
        <ErrorView onRetry={handleRetry} />
      )}
      
      {hasContent && (
        <>
          <WaterfallList 
            items={contentItems}
            onRetry={handleRetry}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            loadMoreError={loadMoreError}
            onLoadMore={handleLoadMore}
          />
          {/* 底部空白区域，避免内容被TabBar遮挡 */}
          <div className="bottom-space"></div>
        </>
      )}
      
      {!loading && !error && !hasContent && (
        <div className="empty-content">
          <p>暂无内容</p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 优化重新渲染逻辑，只有当id变化时才重新渲染
  return prevProps.id === nextProps.id;
});

export default TabContent;