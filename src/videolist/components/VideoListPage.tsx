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

/**
 * 视频列表页组件
 */
const VideoListPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoCardData[]>([]);
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

      const params: PaginationParams = {
        pageNum: reset ? 1 : pageNum,
        pageSize: DEFAULT_PAGE_SIZE,
      };
      
      const { videoList, hasMore: moreData } = await getVideoList(params);
      
      if (reset) {
        setVideos(videoList);
      } else {
        setVideos(prevVideos => [...prevVideos, ...videoList]);
      }
      
      setHasMore(moreData);
      setPageNum(prev => (reset ? 2 : prev + 1));
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
  const handleEdit = (videoId: string) => {
    console.log('Edit video:', videoId);
    // 跳转到编辑页面
    alert(`编辑视频: ${videoId}`);
  };

  /**
   * 处理重新生成视频
   */
  const handleRegenerate = async (videoId: string) => {
    try {
      // 查找对应的VideoCardData
      const videoCard = videos.find(v => v.generateId === videoId);
      if (!videoCard) {
        console.error('无法找到ID为', videoId, '的视频');
        return Promise.reject('视频未找到');
      }
      
      // 更新本地状态为生成中
      const updatedVideos = videos.map(video => {
        if (video.generateId === videoId) {
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
            if (video.generateId === videoId) {
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
  };

  /**
   * 转换VideoCardData为Video类型
   */
  const convertToVideo = (videoCard: VideoCardData): Video => {
    return {
      id: videoCard.generateId,
      title: videoCard.title,
      content: videoCard.text,
      createTime: new Date(videoCard.createTime).getTime(),
      status: videoCard.status === 'done' ? 'generated' : videoCard.status,
      tags: [videoCard.ratio, videoCard.materialName].filter(Boolean),
      videos: videoCard.videolist
    };
  };

  /**
   * 检查项目是否已加载
   */
  const isItemLoaded = (index: number) => {
    return !hasMore || index < videos.length;
  };

  /**
   * 加载更多项目
   */
  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    if (loadingMore || !hasMore) return Promise.resolve();
    
    setLoadingMore(true);
    setLoadMoreError(false);
    
    try {
      await loadVideoList();
      return Promise.resolve();
    } catch (error) {
      setLoadMoreError(true);
      return Promise.reject(error);
    }
  };

  /**
   * 渲染列表项
   */
  const renderItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    // 如果是最后一项且有更多数据，显示加载更多
    if (index === videos.length) {
      return (
          <LoadingFooter 
            isLoading={loadingMore} 
            error={loadMoreError} 
            onRetry={() => loadMoreItems(index, index + DEFAULT_PAGE_SIZE)}
          />
      );
    }

    // 渲染视频卡片
    const videoCard = videos[index];
    return (
        <VideoCard
          key={videoCard.generateId}
          video={convertToVideo(videoCard)}
          onEdit={handleEdit}
          onRegenerate={handleRegenerate}
        />
    );
  };

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
            renderItem={renderItem}
          />
        )}
      </div>
    </div>
  );
};

export default VideoListPage; 