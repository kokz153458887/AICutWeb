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
import { VideoSliceFilter, VideoSliceItem, VideoSliceStatus } from '../../types';
import { toast } from '../../../components/Toast';
import './styles.css';

/**
 * 视频切片页面组件
 * 提供视频解析输入和结果查看功能
 */
const VideoSlicePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [activeFilter, setActiveFilter] = useState<VideoSliceFilter>(VideoSliceFilter.ALL);
  const [videoSlices, setVideoSlices] = useState<VideoSliceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);

  // 模拟数据生成函数
  const generateMockData = useCallback((count: number, startId: number = 0): VideoSliceItem[] => {
    const statuses = [
      VideoSliceStatus.PARSING,
      VideoSliceStatus.PARSE_FAILED,
      VideoSliceStatus.PENDING,
      VideoSliceStatus.RECORDED,
      VideoSliceStatus.ABANDONED
    ];
    
    const mockTexts = [
      '这是一个非常有趣的短视频内容，展示了最新的科技产品和创新理念，值得大家关注和学习。',
      '美食制作教程：如何制作美味的家常菜，简单易学，营养丰富，适合全家人享用。',
      '旅行vlog分享：探索美丽的自然风光，体验不同的文化，记录精彩的旅行瞬间。',
      '健身训练指南：专业的运动指导，科学的训练方法，帮助你保持健康的身体状态。',
      '学习技巧分享：高效的学习方法，实用的学习工具，提升学习效率和质量。',
      '生活小贴士：实用的生活技巧，让日常生活更加便利和有趣，提升生活品质。'
    ];

    return Array.from({ length: count }, (_, index) => {
      const id = startId + index + 1;
      return {
        id: `slice_${id}`,
        cover: `https://picsum.photos/300/400?random=${id}`,
        text: mockTexts[index % mockTexts.length],
        status: statuses[index % statuses.length],
        createTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date().toISOString()
      };
    });
  }, []);

  // 初始化数据加载
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(false);
      
      try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData = generateMockData(10);
        setVideoSlices(mockData);
        setHasMore(true);
      } catch (err) {
        console.error('加载初始数据失败:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [generateMockData]);

  /**
   * 处理返回按钮点击
   */
  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * 处理解析按钮点击
   */
  const handleParseContent = useCallback((content: string) => {
    console.log('解析内容:', content);
    // 这里可以添加实际的解析逻辑
  }, []);

  /**
   * 处理筛选器变化
   */
  const handleFilterChange = useCallback((filter: VideoSliceFilter) => {
    setActiveFilter(filter);
    console.log('筛选器变化:', filter);
    // 这里可以添加实际的筛选逻辑
  }, []);

  /**
   * 处理加载更多
   */
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newData = generateMockData(5, videoSlices.length);
      setVideoSlices(prev => [...prev, ...newData]);
      
      // 模拟数据加载完毕
      if (videoSlices.length + newData.length >= 25) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('加载更多数据失败:', err);
      setLoadMoreError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, videoSlices.length, generateMockData]);

  /**
   * 处理重试
   */
  const handleRetry = useCallback(() => {
    if (videoSlices.length === 0) {
      // 重新加载初始数据
      window.location.reload();
    } else {
      // 重试加载更多
      handleLoadMore();
    }
  }, [videoSlices.length, handleLoadMore]);

  /**
   * 处理视频切片项点击
   */
  const handleItemClick = useCallback((item: VideoSliceItem) => {
    console.log('点击视频切片:', item);
    toast.info(`点击了 ${item.id}`);
  }, []);

  // 根据筛选条件过滤数据
  const filteredItems = React.useMemo(() => {
    if (activeFilter === VideoSliceFilter.ALL) {
      return videoSlices;
    }
    
    return videoSlices.filter(item => {
      switch (activeFilter) {
        case VideoSliceFilter.PENDING:
          return item.status === VideoSliceStatus.PENDING;
        case VideoSliceFilter.PARSE_FAILED:
          return item.status === VideoSliceStatus.PARSE_FAILED;
        case VideoSliceFilter.RECORDED:
          return item.status === VideoSliceStatus.RECORDED;
        default:
          return true;
      }
    });
  }, [videoSlices, activeFilter]);

  // 计算筛选器计数
  const filterCounts = React.useMemo(() => {
    const counts = {
      [VideoSliceFilter.ALL]: videoSlices.length,
      [VideoSliceFilter.PENDING]: 0,
      [VideoSliceFilter.PARSE_FAILED]: 0,
      [VideoSliceFilter.RECORDED]: 0
    };

    videoSlices.forEach(item => {
      if (item.status === VideoSliceStatus.PENDING) {
        counts[VideoSliceFilter.PENDING]++;
      } else if (item.status === VideoSliceStatus.PARSE_FAILED) {
        counts[VideoSliceFilter.PARSE_FAILED]++;
      } else if (item.status === VideoSliceStatus.RECORDED) {
        counts[VideoSliceFilter.RECORDED]++;
      }
    });

    return counts;
  }, [videoSlices]);

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
        counts={filterCounts}
      />

      {/* 视频切片列表 */}
      <div className="list-container">
        <VideoSliceList
          items={filteredItems}
          loading={loading}
          error={error}
          hasMore={hasMore && activeFilter === VideoSliceFilter.ALL} // 只有在"全部"筛选时才显示加载更多
          isLoadingMore={isLoadingMore}
          loadMoreError={loadMoreError}
          onLoadMore={handleLoadMore}
          onRetry={handleRetry}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
};

export default VideoSlicePage; 