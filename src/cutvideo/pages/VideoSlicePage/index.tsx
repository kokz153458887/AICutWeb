/**
 * 视频切片页面
 * 整合输入区域、筛选标签和视频切片列表
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackIcon } from '../../../components/icons';
import InputArea from '../../components/InputArea';
import FilterTabs from '../../components/FilterTabs';
import VideoSliceList from '../../components/VideoSliceList';
import ParseLoadingDialog from '../../components/ParseLoadingDialog';
import { VideoSliceFilter, VideoSliceItem, VideoSliceStatus } from '../../types';
import { getParseList, parseVideo, deleteTask } from '../../api';
import { extractUrlsFromText, transformTaskToSliceItem, filterToStatus } from '../../api/utils';
import { toast } from '../../../components/Toast';
import './styles.css';

// 每页数据量
const PAGE_SIZE = 20;

/**
 * 视频切片页面组件
 * 提供视频解析输入和结果查看功能
 */
const VideoSlicePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [activeFilter, setActiveFilter] = useState<VideoSliceFilter>(VideoSliceFilter.PENDING);
  const [items, setItems] = useState<VideoSliceItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [isParsingVideo, setIsParsingVideo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * 加载数据
   * @param page 页码，默认为1（第一页）
   * @param isLoadMore 是否为加载更多
   */
  const loadData = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
      setLoadMoreError(false);
    } else {
      setLoading(true);
      setError(false);
    }

    try {
      let allItems: any[] = [];
      let totalCount = 0;
      let totalPages = 1;

      if (activeFilter === VideoSliceFilter.ALL) {
        // "全部"tab不传status参数，后端返回所有状态的数据
        const response = await getParseList({
          page_size: PAGE_SIZE,
          page_num: page
        });
        allItems = response.result;
        totalCount = response.total;
        totalPages = response.totalPages;
      } else {
        // 其他tab按原逻辑处理
        const status = filterToStatus(activeFilter);
        const response = await getParseList({
          status,
          page_size: PAGE_SIZE,
          page_num: page
        });

        // 对于"待录入"tab，同时获取解析中的任务
        allItems = response.result;
        if (activeFilter === VideoSliceFilter.PENDING) {
          try {
            const parsingResponse = await getParseList({
              status: 'parsing',
              page_size: PAGE_SIZE,
              page_num: page
            });
            // 将解析中的任务排在最前面
            allItems = [...parsingResponse.result, ...response.result];
          } catch (err) {
            console.error('获取解析中任务失败:', err);
          }
        }
        
        totalCount = response.total;
        totalPages = response.totalPages;
      }

      const newItems = allItems.map(transformTaskToSliceItem);
      const hasMore = page < totalPages;

      if (isLoadMore) {
        // 加载更多：追加数据
        setItems(prevItems => [...prevItems, ...newItems]);
        setCurrentPage(page);
        setHasMore(hasMore);
        setTotal(totalCount);
      } else {
        // 首次加载：替换数据
        setItems(newItems);
        setCurrentPage(page);
        setHasMore(hasMore);
        setTotal(totalCount);
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      if (isLoadMore) {
        setLoadMoreError(true);
      } else {
        setError(true);
      }
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [activeFilter]);

  /**
   * 刷新当前tab数据
   */
  const refreshCurrentTab = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 不要提前清除当前缓存，保持显示当前数据
      // 重新加载数据
      let allItems: any[] = [];
      let totalCount = 0;
      let totalPages = 1;

      if (activeFilter === VideoSliceFilter.ALL) {
        // "全部"tab不传status参数，后端返回所有状态的数据
        const response = await getParseList({
          page_size: PAGE_SIZE,
          page_num: 1
        });
        allItems = response.result;
        totalCount = response.total;
        totalPages = response.totalPages;
      } else {
        // 其他tab按原逻辑处理
        const status = filterToStatus(activeFilter);
        const response = await getParseList({
          status,
          page_size: PAGE_SIZE,
          page_num: 1
        });

        // 对于"待录入"tab，同时获取解析中的任务
        allItems = response.result;
        if (activeFilter === VideoSliceFilter.PENDING) {
          try {
            const parsingResponse = await getParseList({
              status: 'parsing',
              page_size: PAGE_SIZE,
              page_num: 1
            });
            // 将解析中的任务排在最前面
            allItems = [...parsingResponse.result, ...response.result];
          } catch (err) {
            console.error('获取解析中任务失败:', err);
          }
        }
        
        totalCount = response.total;
        totalPages = response.totalPages;
      }

      const newItems = allItems.map(transformTaskToSliceItem);
      const hasMore = 1 < totalPages;

      // 数据请求成功后，清除缓存并更新新数据
      setItems(newItems);
      setCurrentPage(1);
      setHasMore(hasMore);
      setTotal(totalCount);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeFilter]);

  // 初始化数据加载
  useEffect(() => {
    // 每次切换tab都重新加载数据
    loadData(1, false);
  }, [activeFilter, loadData]);

  /**
   * 处理返回按钮点击
   */
  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * 处理解析按钮点击
   */
  const handleParseContent = useCallback(async (content: string) => {
    const urls = extractUrlsFromText(content);
    
    if (urls.length === 0) {
      toast.error('未找到有效的视频链接');
      return;
    }

    // 取第一个URL进行解析
    const targetUrl = urls[0];
    setIsParsingVideo(true);

    try {
      await parseVideo(targetUrl);
      toast.success('视频解析成功');
      
      // 切换到"待录入"tab（如果不在的话）
      if (activeFilter !== VideoSliceFilter.PENDING) {
        setActiveFilter(VideoSliceFilter.PENDING);
      }
      
      // 延迟一下再刷新，给后端处理时间
      setTimeout(() => {
        refreshCurrentTab();
      }, 1000);
      
    } catch (err: any) {
      console.error('视频解析失败:', err);
      toast.error(err.message || '视频解析失败');
    } finally {
      setIsParsingVideo(false);
    }
  }, [activeFilter, refreshCurrentTab]);

  /**
   * 处理筛选器变化
   */
  const handleFilterChange = useCallback((filter: VideoSliceFilter) => {
    setActiveFilter(filter);
    // 清空当前数据，准备加载新tab的数据
    setItems([]);
    setCurrentPage(0);
    setHasMore(true);
    setTotal(0);
  }, []);

  /**
   * 处理加载更多
   */
  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    
    const nextPage = currentPage + 1;
    loadData(nextPage, true);
  }, [currentPage, hasMore, isLoadingMore, loadData]);

  /**
   * 处理重试
   */
  const handleRetry = useCallback(() => {
    if (items.length === 0) {
      // 重新加载初始数据
      loadData(1, false);
    } else {
      // 重试加载更多
      handleLoadMore();
    }
  }, [items, loadData, handleLoadMore]);

  /**
   * 处理视频切片项点击
   */
  const handleItemClick = useCallback((item: VideoSliceItem) => {
    console.log('点击视频切片:', item);
    // 移除刷新逻辑，只记录点击
  }, []);

  /**
   * 处理单个项目重试
   */
  const handleItemRetry = useCallback(async (item: VideoSliceItem) => {
    if (!item.parseUrl) {
      toast.error('解析URL不存在');
      return;
    }

    try {
      setIsParsingVideo(true);
      await parseVideo(item.parseUrl);
      
      // 重试成功后，调用删除接口删除原任务
      try {
        await deleteTask(item.id);
        console.log('删除原任务成功:', item.id);
      } catch (deleteError) {
        console.error('删除原任务失败:', deleteError);
        // 删除失败不影响重试成功的提示
      }
      
      toast.success('重试解析成功');
      
      // 切换到"待录入"tab（如果不在的话）
      if (activeFilter !== VideoSliceFilter.PENDING) {
        setActiveFilter(VideoSliceFilter.PENDING);
      }
      
      // 延迟刷新数据
      setTimeout(() => {
        refreshCurrentTab();
      }, 1000);
      
    } catch (err: any) {
      console.error('重试失败:', err);
      toast.error(err.message || '重试失败');
    } finally {
      setIsParsingVideo(false);
    }
  }, [activeFilter, refreshCurrentTab]);

  // 计算筛选器计数
  const filterCounts = React.useMemo(() => {
    const counts = {
      [VideoSliceFilter.ALL]: 0,
      [VideoSliceFilter.PENDING]: 0,
      [VideoSliceFilter.PARSE_FAILED]: 0,
      [VideoSliceFilter.RECORDED]: 0
    };

    // 简化计数逻辑，只统计当前显示的数据
    if (activeFilter === VideoSliceFilter.ALL) {
      counts[VideoSliceFilter.ALL] = total;
    } else {
      counts[activeFilter] = total;
    }

    return counts;
  }, [activeFilter, total]);

  return (
    <div className="video-slice-page">
      {/* 顶部导航栏 */}
      <div className="page-header">
        <div className="back-button" onClick={handleBackClick}>
             <BackIcon />
        </div>
        <span className="page-title">视频切片</span>
      </div>
      

      {/* 输入区域 */}
      <InputArea onParse={handleParseContent} />

      {/* 筛选标签 */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onRefresh={refreshCurrentTab}
        counts={filterCounts}
      />

      {/* 视频切片列表 */}
      <div className="list-container">
        {/* 刷新蒙版 */}
        {isRefreshing && (
          <div className="refresh-overlay">
            <div className="refresh-spinner"></div>
            <div className="refresh-text">刷新中...</div>
          </div>
        )}
        <VideoSliceList
          items={items}
          loading={loading}
          error={error}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          loadMoreError={loadMoreError}
          onLoadMore={handleLoadMore}
          onRetry={handleRetry}
          onItemClick={handleItemClick}
          onItemRetry={handleItemRetry}
        />
      </div>

      {/* 解析加载对话框 */}
      <ParseLoadingDialog
        visible={isParsingVideo}
        onCancel={() => setIsParsingVideo(false)}
      />
    </div>
  );
};

export default VideoSlicePage; 