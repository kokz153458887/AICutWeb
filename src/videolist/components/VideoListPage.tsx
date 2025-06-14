/**
 * 视频列表页组件
 * 负责显示所有生成的视频卡片
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { VideoCardData, getVideoList, regenerateVideo, PaginationParams } from '../api/videoListApi';
import { useVideoGenerationSocket } from '../hooks/useVideoGenerationSocket';
import VirtualizedVideoList from './VirtualizedVideoList';
import Toast from '../../components/Toast';
import '../styles/VideoList.css';

/**
 * 过滤图标组件
 */
const FilterIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M7 12H17M9 18H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 刷新图标组件
 */
const RefreshIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V9M3 9H9M3 9L6 6C7.5 4.5 9.5 4 12 4C16.5 4 20 7.5 20 12S16.5 20 12 20C9.5 20 7.5 19 6 17.5L8 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 默认分页大小
const DEFAULT_PAGE_SIZE = 10;

/**
 * 视频列表页组件
 */
const VideoListPage: React.FC = () => {
  const location = useLocation();
  const savedState = location.state as { 
    videos?: (VideoCardData | null)[], 
    pageNum?: number,
    hasMore?: boolean 
  } | null;

  // 使用location.state中的数据初始化状态
  const [videos, setVideos] = useState<(VideoCardData | null)[]>(savedState?.videos || []);
  const [loading, setLoading] = useState<boolean>(!savedState?.videos);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(savedState?.hasMore ?? true);
  const [pageNum, setPageNum] = useState<number>(savedState?.pageNum || 1);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [lastAttemptedRange, setLastAttemptedRange] = useState<{start: number, end: number} | null>(null);
  
  // 添加数据缓存标记
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  // 使用 Set 来跟踪正在加载的页码
  const loadingPages = useRef<Set<number>>(new Set());

  /**
   * 统一的数据加载方法
   */
  const loadData = useCallback(async ({
    pageNum,
    reset = false,
    startIndex,
    stopIndex,
    forceReload = false
  }: {
    pageNum: number;
    reset?: boolean;
    startIndex?: number;
    stopIndex?: number;
    forceReload?: boolean;
  }) => {
    // 检查是否需要跳过加载（已有缓存数据且不是强制重新加载）
    if (reset && !forceReload && isDataLoaded && videos.length > 0) {
      const timeSinceLastLoad = Date.now() - lastLoadTime;
      // 如果距离上次加载不超过5分钟，使用缓存数据
      if (timeSinceLastLoad < 5 * 60 * 1000) {
        console.log('[VideoListPage] 使用缓存数据，跳过重新加载');
        setLoading(false);
        return;
      }
    }

    // 如果该页面正在加载中，则跳过
    if (loadingPages.current.has(pageNum)) {
      console.log(`页码 ${pageNum} 正在加载中，跳过重复请求`);
      return;
    }

    // 记录正在加载的页码
    loadingPages.current.add(pageNum);

    try {
      if (reset) {
        setLoading(true);
        setError(null);
        setHasMore(true);
        setLoadMoreError(false);
      } else {
        setLoadingMore(true);
        setLoadMoreError(false);
      }

      if (startIndex !== undefined && stopIndex !== undefined) {
        setLastAttemptedRange({ start: startIndex, end: stopIndex });
      }

      const params: PaginationParams = {
        pageNum,
        pageSize: DEFAULT_PAGE_SIZE,
      };

      console.log(`加载数据: pageNum=${pageNum}, reset=${reset}, forceReload=${forceReload}`);
      const { videoList, hasMore: moreData } = await getVideoList(params);

      if (!videoList || videoList.length === 0) {
        setHasMore(false);
        return;
      }

      setVideos(prevVideos => {
        if (reset) {
          return [...videoList];
        }

        const newVideos = [...prevVideos];
        const startIdx = (pageNum - 1) * DEFAULT_PAGE_SIZE;
        
        videoList.forEach((video, idx) => {
          const realIndex = startIdx + idx;
          if (realIndex < newVideos.length) {
            newVideos[realIndex] = video;
          } else {
            newVideos.push(video);
          }
        });
        
        return newVideos;
      });

      setHasMore(moreData);
      setPageNum(pageNum + 1);
      setLastAttemptedRange(null);
      setLoadMoreError(false);
      
      // 标记数据已加载
      if (reset) {
        setIsDataLoaded(true);
        setLastLoadTime(Date.now());
      }

    } catch (error) {
      console.error('加载数据失败:', error);
      const errorMessage = (error instanceof Error) 
        ? `加载失败: ${error.message}` 
        : '加载失败，请检查网络连接';

      if (reset) {
        setError(errorMessage);
      } else {
        setLoadMoreError(true);
        setHasMore(true);
      }
    } finally {
      // 从加载集合中移除页码
      loadingPages.current.delete(pageNum);
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isDataLoaded, videos.length, lastLoadTime]);

  // 首次加载 - 检查是否需要加载数据
  useEffect(() => {
    if (!savedState?.videos && !isDataLoaded) {
      console.log('[VideoListPage] 首次加载数据');
      loadData({ pageNum: 1, reset: true });
    } else if (savedState?.videos) {
      // 如果有savedState数据，标记为已加载
      setIsDataLoaded(true);
      setLastLoadTime(Date.now());
    }
  }, []); // 保持空依赖数组，避免重复加载

  /**
   * 强制刷新数据的方法
   */
  const forceRefresh = useCallback(() => {
    console.log('[VideoListPage] 强制刷新数据');
    setIsDataLoaded(false);
    loadData({ pageNum: 1, reset: true, forceReload: true });
  }, [loadData]);

  /**
   * 检查项目是否已加载
   */
  const isItemLoaded = useCallback((index: number) => {
    // console.log(`isItemLoaded检查: index=${index}, videos.length=${videos.length}`);
    return index < videos.length && videos[index] !== null;
  }, [videos]);

  /**
   * 加载更多项目
   */
  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    if (loadingMore || !hasMore) return Promise.resolve();

    const targetPageNum = Math.floor(startIndex / DEFAULT_PAGE_SIZE) + 1;
    return loadData({
      pageNum: targetPageNum,
      startIndex,
      stopIndex
    });
  }, [hasMore, loadingMore, loadData]);

  /**
   * 处理重试加载
   */
  const handleRetry = useCallback((index: number) => {
    if (loadingMore) return;

    const startIndex = Math.floor(index / DEFAULT_PAGE_SIZE) * DEFAULT_PAGE_SIZE;
    const stopIndex = startIndex + DEFAULT_PAGE_SIZE - 1;
    const targetPageNum = Math.floor(startIndex / DEFAULT_PAGE_SIZE) + 1;

    loadData({
      pageNum: targetPageNum,
      startIndex,
      stopIndex
    });
  }, [loadingMore, loadData]);

  /**
   * 显示Toast提示
   */
  const handleShowToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  /**
   * 处理编辑视频
   */
  const handleEdit = useCallback((videoId: string) => {
    console.log('Edit video:', videoId);
    // 跳转到编辑页面
    alert(`编辑视频: ${videoId}`);
  }, []);

  /**
   * 处理重新生成视频
   */
  const handleRegenerate = useCallback(async (videoId: string) => {
    try {
      // 查找对应的VideoCardData
      const videoCard = videos.find(v => v && v.generateId === videoId);
      if (!videoCard) {
        console.error('无法找到ID为', videoId, '的视频');
        return Promise.reject('视频未找到');
      }
      
      // 更新本地状态为生成中
      const updatedVideos = videos.map(video => {
        if (video && video.generateId === videoId) {
          return { ...video, status: 'generating' as const };
        }
        return video;
      });
      
      setVideos(updatedVideos);
      
      // 调用API重新生成视频
      try {
        const response = await regenerateVideo(videoId);
        console.log('重新生成视频成功:', response);
      } catch (apiError) {
        console.error('API调用失败:', apiError);
        // 即使API调用失败，我们也保持生成中状态，因为这只是演示
      }
      
      // 模拟API调用延迟，显示生成完成状态
      setTimeout(() => {
        setVideos(prevVideos => 
          prevVideos.map(video => {
            if (video && video.generateId === videoId) {
              return { ...video, status: 'done' as const };
            }
            return video;
          })
        );
      }, 3000);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to regenerate video:', error);
      return Promise.reject(error);
    }
  }, [videos]);

  /**
   * 处理视频状态更新
   */
  const handleVideoStatusUpdate = useCallback((
    generateId: string, 
    status: VideoCardData['status'],
    videoCardData?: VideoCardData
  ) => {
    console.log('handleVideoStatusUpdate 处理视频状态更新:', generateId, "status:", status, "videoCardData:", videoCardData);
    setVideos(prevVideos => {
      // 找到需要更新的视频索引
      const videoIndex = prevVideos.findIndex(v => v?.generateId === generateId);
      
      if (videoIndex === -1) return prevVideos;
      
      // 创建新的视频数组
      const newVideos = [...prevVideos];
      if (newVideos[videoIndex]) {
        if (videoCardData) {
          // 如果有完整的视频数据，更新整个对象
          newVideos[videoIndex] = videoCardData;
        } else {
          // 否则只更新状态
          newVideos[videoIndex] = {
            ...newVideos[videoIndex]!,
            status
          };
        }
      }
      
      return newVideos;
    });
  }, []);

  // 使用Socket Hook监听视频状态更新
  useVideoGenerationSocket(videos, handleVideoStatusUpdate);

  return (
    <div className="video-list-page">
      {/* 顶部栏 */}
      <div className="top-bar">
        <h1 className="top-bar-title">我的视频</h1>
        <div className="top-bar-actions">
          <button className="refresh-button" onClick={forceRefresh} disabled={loading}>
            <RefreshIcon />
            刷新
          </button>
          <button className="filter-button" onClick={handleShowToast}>
            <FilterIcon />
            筛选
          </button>
        </div>
      </div>
      
      {/* Toast提示 */}
      {showToast && (
        <div className="toast-message">
          正在开发中
        </div>
      )}
      
      {/* 页面内容 */}
      <div className="video-content">
        {loading ? (
          <div className="video-list-loading">
            <div className="loading-spinner"></div>
            <p>正在加载视频列表...</p>
          </div>
        ) : error ? (
          <div className="video-list-error">
            <p>{error}</p>
            <button onClick={() => loadData({ pageNum: 1, reset: true })}>重试</button>
          </div>
        ) : videos.length === 0 ? (
          <div className="video-list-empty">
            <p>暂无视频，请先创建新视频</p>
          </div>
        ) : (
          <VirtualizedVideoList
            videos={videos}
            hasMore={hasMore}
            isItemLoaded={isItemLoaded}
            loadMoreItems={loadMoreItems}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
            onRetry={handleRetry}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            lastAttemptedRange={lastAttemptedRange}
          />
        )}
      </div>
      <Toast />
    </div>
  );
};

export default VideoListPage; 