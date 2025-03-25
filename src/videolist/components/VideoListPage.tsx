/**
 * 视频列表页组件
 * 负责显示所有生成的视频卡片
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
  // 新增：记录正在加载的页码集合
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());

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
    // 如果有缓存数据且不是重置，则不重新加载
    if (savedState?.videos && !reset) {
      return;
    }

    try {
      if (reset) {
        setLoading(true);
        setError(null);
        setPageNum(1);
        setHasMore(true);
        setLoadMoreError(false);
        // 重置时清空正在加载的页码集合
        setLoadingPages(new Set());
      }

      const currentPageNum = reset ? 1 : pageNum;
      
      // 检查该页是否正在加载
      if (loadingPages.has(currentPageNum)) {
        console.log(`页码 ${currentPageNum} 正在加载中，跳过重复请求`);
        return;
      }

      console.log(`加载视频列表: pageNum=${currentPageNum}, reset=${reset}`);
      
      // 添加到正在加载的页码集合
      setLoadingPages(prev => new Set(prev).add(currentPageNum));
      
      const params: PaginationParams = {
        pageNum: currentPageNum,
        pageSize: DEFAULT_PAGE_SIZE,
      };
      
      const { videoList, hasMore: moreData } = await getVideoList(params);
      console.log(`获取数据成功: 数据长度=${videoList.length}, 还有更多=${moreData}`);
      
      if (reset) {
        setVideos([...videoList]);
        console.log(`初始加载后，强制设置hasMore=true，以支持错误状态显示`);
        setHasMore(true);
      } else {
        setVideos(prevVideos => {
          const newVideos = [...prevVideos];
          
          // 使用 Map 存储现有数据，以 generateId 为键
          const existingVideosMap = new Map(
            newVideos.filter(v => v !== null).map(v => [v!.generateId, v])
          );
          
          // 处理新数据
          videoList.forEach(video => {
            if (existingVideosMap.has(video.generateId)) {
              // 如果存在相同 generateId 的数据，更新它
              const index = newVideos.findIndex(v => v?.generateId === video.generateId);
              if (index !== -1) {
                newVideos[index] = video;
              }
            } else {
              // 如果是新数据，添加到列表末尾
              newVideos.push(video);
            }
          });
          
          return newVideos;
        });
        
        setHasMore(moreData);
      }
      
      setPageNum(currentPageNum + 1);
      setLoadMoreError(false);
    } catch (error) {
      console.error('加载视频列表失败:', error);
      const errorMessage = (error instanceof Error) 
        ? `加载视频列表失败: ${error.message}` 
        : '加载视频列表失败，请检查网络连接';
        
      if (reset) {
        setError(errorMessage);
      } else {
        console.log('设置loadMoreError为true');
        setLoadMoreError(true);
        setHasMore(true);
      }
    } finally {
      // 从正在加载的页码集合中移除
      setLoadingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageNum);
        return newSet;
      });
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 首次加载时获取视频列表
  useEffect(() => {
    loadVideoList(!savedState?.videos);
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
    // 记录日志以便调试
    console.log(`isItemLoaded检查: index=${index}, videos.length=${videos.length}, loadMoreError=${loadMoreError}`);
    
    // 如果索引超出数组范围，这是底部加载项，不需要考虑它是否加载
    if (index >= videos.length) {
      console.log(`索引 ${index} 超出数组范围，视为特殊底部项`);
      return false; // 返回false会触发loadMoreItems调用
    }
    
    // 正常检查索引是否小于数组长度且对应项不为null
    const result = videos[index] !== null;
    console.log(`索引 ${index} 的加载状态: ${result}`);
    return result;
  }, [videos]);

  /**
   * 加载更多项目
   */
  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    // 如果正在加载或没有更多数据，则直接返回
    if (loadingMore || !hasMore) return Promise.resolve();
    
    console.log(`加载更多项目: ${startIndex} - ${stopIndex}`);
    
    // 设置加载状态
    setLoadingMore(true);
    setLoadMoreError(false);
    
    // 记录尝试加载的范围
    setLastAttemptedRange({start: startIndex, end: stopIndex});
    
    // 计算应该加载的页码
    const targetPageNum = Math.floor(startIndex / DEFAULT_PAGE_SIZE) + 1;

    // 检查该页是否正在加载
    if (loadingPages.has(targetPageNum)) {
      console.log(`页码 ${targetPageNum} 正在加载中，跳过重复请求`);
      setLoadingMore(false);
      return Promise.resolve();
    }
    
    if (targetPageNum !== pageNum) {
      setPageNum(targetPageNum);
    }
    
    try {
      // 添加到正在加载的页码集合
      setLoadingPages(prev => new Set(prev).add(targetPageNum));

      const params: PaginationParams = {
        pageNum: targetPageNum,
        pageSize: DEFAULT_PAGE_SIZE
      };
      
      console.log(`发起API请求，页码: ${targetPageNum}, 每页数量: ${DEFAULT_PAGE_SIZE}`);
      
      const { videoList, hasMore: moreData } = await getVideoList(params);
      
      // 如果返回的数据为空，说明没有更多数据了
      if (!videoList || videoList.length === 0) {
        console.log('返回数据为空，设置hasMore=false');
        setHasMore(false);
        setLoadingMore(false);
        return Promise.resolve();
      }
      
      setVideos(prevVideos => {
        const newVideos = [...prevVideos];
        
        // 使用 Map 存储现有数据，以 generateId 为键
        const existingVideosMap = new Map(
          newVideos.filter(v => v !== null).map(v => [v!.generateId, v])
        );
        
        // 处理新数据
        videoList.forEach(video => {
          if (existingVideosMap.has(video.generateId)) {
            // 如果存在相同 generateId 的数据，更新它
            const index = newVideos.findIndex(v => v?.generateId === video.generateId);
            if (index !== -1) {
              newVideos[index] = video;
            }
          } else {
            // 如果是新数据，添加到列表末尾
            newVideos.push(video);
          }
        });
        
        return newVideos;
      });
      
      setHasMore(moreData && videoList.length > 0);
      setPageNum(targetPageNum + 1);
      
      console.log(`数据加载成功，新数据长度: ${videoList.length}，还有更多: ${moreData}`);
      
      // 成功加载后清除上次尝试加载的范围
      setLastAttemptedRange(null);
      
    } catch (error) {
      console.error('加载更多视频失败:', error);
      setLoadMoreError(true);
      setHasMore(true);
    } finally {
      // 从正在加载的页码集合中移除
      setLoadingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetPageNum);
        return newSet;
      });
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, pageNum, loadingPages]);

  // 处理重试加载，确保传入正确的索引范围
  const handleRetry = useCallback((index: number) => {
    // 如果正在加载，则不重复发起请求
    if (loadingMore) return;
    
    console.log(`handleRetry 被调用: index=${index}`);
    
    // 设置加载状态为true，错误状态为false
    setLoadingMore(true);
    setLoadMoreError(false);
    // 清除上次尝试范围，以便重新显示加载中状态
    setLastAttemptedRange(null);
    
    // 计算加载的起始和结束索引
    const startIndex = Math.floor(index / DEFAULT_PAGE_SIZE) * DEFAULT_PAGE_SIZE;
    const stopIndex = startIndex + DEFAULT_PAGE_SIZE - 1;
    
    console.log(`重试加载区间: startIndex=${startIndex}, stopIndex=${stopIndex}`);
    
    // 执行加载操作
    loadMoreItems(startIndex, stopIndex).catch((error) => {
      // 确保错误状态被正确设置
      console.error('重试加载失败:', error);
      setLoadingMore(false);
      setLoadMoreError(true);
    });
  }, [loadingMore, loadMoreItems]);

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
            lastAttemptedRange={lastAttemptedRange}
          />
        )}
      </div>
    </div>
  );
};

export default VideoListPage; 