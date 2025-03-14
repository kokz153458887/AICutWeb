/**
 * 视频播放页组件
 * 负责展示视频内容、封面、点赞数和"做同款"按钮
 */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './VideoDetail.css';
import { getVideoDetail, VideoDetailData } from './api';
import VideoTopBar from '../components/VideoTopBar';
import VideoBottomBar from './VideoBottomBar';

const VideoDetail: React.FC = () => {
  // 状态管理
  const [data, setData] = useState<VideoDetailData | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 获取视频数据
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('视频ID不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const videoData = await getVideoDetail(id);
        setData(videoData);
        setError(null);
      } catch (err) {
        console.error('获取视频数据失败:', err);
        setError('获取视频数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location]);

  // 处理视频播放事件
  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    // 视频开始播放后0.1秒移除封面
    setTimeout(() => {
      setShowCover(false);
    }, 100);
  };

  // 处理视频加载完成事件
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('自动播放失败:', error);
        // 自动播放失败时保留封面
        setShowCover(true);
      });
    }
  };

  // 处理"做同款"按钮点击
  const handleNavClick = () => {
    if (data?.content.navUrl) {
      window.location.href = data.content.navUrl;
    }
  };

  // 处理返回按钮点击
  const handleBackClick = () => {
    navigate(-1); // 返回上一页
  };

  // 处理分享按钮点击
  const handleShareClick = () => {
    // 分享功能实现
    console.log('分享功能');
    // 这里可以实现分享逻辑，如调用原生分享API或显示分享弹窗
  };

  // 计算视频容器高度
  const calculateVideoHeight = (): string => {
    if (!data?.content.ratio) return 'auto';
    
    const [width, height] = data.content.ratio.split(':').map(Number);
    if (!width || !height) return 'auto';
    
    // 根据屏幕宽度和视频比例计算高度
    const screenWidth = window.innerWidth;
    return `${(screenWidth * height) / width}px`;
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="loading">{error}</div>;
  }

  if (!data) {
    return <div className="loading">视频数据不存在</div>;
  }

  return (
    <div className="video-detail-container">
      {/* 顶部操作区 */}
      <VideoTopBar 
        onBackClick={handleBackClick} 
        onShareClick={handleShareClick} 
      />
      
      {/* 视频播放区域 */}
      <div 
        className="video-container" 
        style={{ height: calculateVideoHeight() }}
      >
        <video
          ref={videoRef}
          className="video-player"
          src={data.content.videoUrl}
          onPlay={handleVideoPlay}
          onLoadedData={handleVideoLoaded}
          playsInline
          muted // 移动端自动播放通常需要静音
        />
        
        {/* 视频封面 */}
        {showCover && (
          <div className="video-cover">
            <img src={data.content.cover} alt="视频封面" />
          </div>
        )}
      </div>

      {/* 用户信息区域 */}
      <div className="user-info">
        <div className="user-avatar">
          <img src="https://picsum.photos/50/50" alt="用户头像" />
        </div>
        <div className="user-name">吾明亮</div>
        <button className="follow-button">关注</button>
      </div>

      {/* 视频文案区域 */}
      <div className="video-text">
        <div className="video-question">你的名字?</div>
        {data.content.text}
      </div>

      {/* 底部操作栏 */}
      <VideoBottomBar 
        stars={data.content.stars} 
        onNavClick={handleNavClick} 
      />
    </div>
  );
};

export default VideoDetail; 