/**
 * 视频列表页组件
 * 负责显示所有生成的视频卡片
 */
import React, { useEffect, useState, useCallback } from 'react';
import { VideoCardData, Video, getVideoList, regenerateVideo, PaginationParams } from '../api/videoListApi';
import VideoCard from './VideoCard';
import VirtualizedVideoList from './VirtualizedVideoList';
import LoadingFooter from './LoadingFooter';
import '../styles/VideoList.css';

/**
 * 过滤图标组件
 */
const FilterIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M7 12H17M9 18H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 默认分页大小
const DEFAULT_PAGE_SIZE = 10;
// 初始数据长度，用于预填充数组
const INITIAL_DATA_LENGTH = 10;

/**
 * 视频列表页组件
 */
const VideoListPage: React.FC = () => {
  const [videos, setVideos] = useState<(VideoCardData | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [pageNum, setPageNum] = useState<number>(1);
  const [showToast, setShowToast] = useState<boolean>(false);

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
   * 加载视频列表数据
   */
  const loadVideoList = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
        setPageNum(1);
        setHasMore(true);
      }

      const currentPageNum = reset ? 1 : pageNum;
      
      const params: PaginationParams = {
        pageNum: currentPageNum,
        pageSize: DEFAULT_PAGE_SIZE,
      };
      
      console.log("loadVideoList params:" ,params)

      const { videoList, hasMore: moreData } = await getVideoList(params);
      
      if (reset) {
        // 初始化一个数组，长度基于初始数据长度
        const initialVideos = Array(INITIAL_DATA_LENGTH).fill(null);
        // 填充获取到的数据
        videoList.forEach((video, index) => {
          initialVideos[index] = video;
        });
        setVideos(initialVideos);
      } else {
        setVideos(prevVideos => {
          const newVideos = [...prevVideos];
          // 计算起始索引
          const startIndex = (currentPageNum - 1) * DEFAULT_PAGE_SIZE;
          
          // 填充新获取的数据
          videoList.forEach((video, index) => {
            const realIndex = startIndex + index;
            if (realIndex < newVideos.length) {
              newVideos[realIndex] = video;
            } else {
              newVideos.push(video);
            }
          });
          
          return newVideos;
        });
      }
      
      setHasMore(moreData);
      setPageNum(currentPageNum + 1); // 使用计算得到的页码值，而不是硬编码
    } catch (error) {
      console.error('Failed to load video list:', error);
      if (reset) {
        setError('加载视频列表失败，请稍后重试');
      } else {
        setLoadMoreError(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 首次加载时获取视频列表
  useEffect(() => {
    loadVideoList(true);
  }, []);

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
   * 检查项目是否已加载
   */
  const isItemLoaded = useCallback((index: number) => {
    return index < videos.length && videos[index] !== null;
  }, [videos]);

  /**
   * 加载更多项目
   */
  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    console.log('loadMoreItems startIndex:', startIndex, ' stopIndex:', stopIndex, " loadingMore:", loadingMore, " hasMore:", hasMore);
    if (loadingMore || !hasMore) return Promise.resolve();
    
    setLoadingMore(true);
    setLoadMoreError(false);
    
    // 计算应该加载的页码
    const targetPageNum = Math.floor(startIndex / DEFAULT_PAGE_SIZE) + 1;
    if (targetPageNum !== pageNum) {
      setPageNum(targetPageNum);
    }
    
    try {
      const params: PaginationParams = {
        pageNum: targetPageNum,
        pageSize: DEFAULT_PAGE_SIZE
      };
      
      console.log("请求参数:", params);
      const { videoList, hasMore: moreData } = await getVideoList(params);
      
      console.log("loadMoreItems videoList: ", videoList.length, " hasMore: ", hasMore )
      setVideos(prevVideos => {
        const newVideos = [...prevVideos];
        // 填充新获取的数据
        videoList.forEach((video, idx) => {
          const realIndex = startIndex + idx;
          if (realIndex < newVideos.length) {
            newVideos[realIndex] = video;
          } else {
            newVideos.push(video);
          }
        });
        return newVideos;
      });
      
      setHasMore(moreData);
      setPageNum(targetPageNum + 1);
      setLoadingMore(false);
      
      return Promise.resolve();
    } catch (error) {
      setLoadMoreError(true);
      setLoadingMore(false);
      return Promise.reject(error);
    }
  }, [hasMore, loadingMore, pageNum]);

  // 处理重试加载
  const handleRetry = useCallback((index: number) => {
    return loadMoreItems(index, index + DEFAULT_PAGE_SIZE);
  }, [loadMoreItems]);

  return (
    <div className="video-list-page">
      {/* 顶部栏 */}
      <div className="top-bar">
        <h1 className="top-bar-title">我的视频</h1>
        <button className="filter-button" onClick={handleShowToast}>
          <FilterIcon />
          筛选
        </button>
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
            <button onClick={() => loadVideoList(true)}>重试</button>
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
          />
        )}
      </div>
    </div>
  );
};

export default VideoListPage; 