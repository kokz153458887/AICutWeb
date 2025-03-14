/**
 * 视频播放页组件
 * 负责展示视频内容、封面、点赞数和"做同款"按钮
 */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './VideoDetail.css';
import { getVideoDetail, VideoDetailData } from './api';

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
      <div className="video-top-bar">
        <div className="back-button" onClick={handleBackClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="share-button" onClick={handleShareClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08261 9.84066C7.54305 9.32015 6.80891 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15C6.80891 15 7.54305 14.6798 8.08261 14.1593L15.0227 18.6294C15.0077 18.7508 15 18.8745 15 19C15 20.6569 16.3431 22 18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C17.1911 16 16.457 16.3202 15.9174 16.8407L8.97733 12.3706C8.99229 12.2492 9 12.1255 9 12C9 11.8745 8.99229 11.7508 8.97733 11.6294L15.9174 7.15934C16.457 7.67985 17.1911 8 18 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
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
      <div className="video-bottom-bar">
        <div className="like-button">
          <div className="like-icon-container">
            <svg className="like-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z" fill="#FF4757"/>
            </svg>
          </div>
          <span className="like-count">{data.content.stars}</span>
        </div>
        <button className="make-same-button" onClick={handleNavClick}>
          做同款
        </button>
      </div>
    </div>
  );
};

export default VideoDetail; 