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
  
  // 从URL参数中获取标题、文案、视频比例和封面图片
  const searchParams = new URLSearchParams(location.search);
  const urlTitle = searchParams.get('title') || '视频标题';
  const urlText = searchParams.get('text') || '视频文案加载中...';
  const urlRatio = searchParams.get('ratio') || '16:9'; // 默认16:9比例
  const urlCover = searchParams.get('cover') || ''; // 从URL参数中获取封面图片

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
        
        // 检查文案是否有变化，只有在文案有变化时才更新数据
        const hasTextChanged = !data || data.content.text !== videoData.content.text;
        
        if (hasTextChanged) {
          console.log('文案有变化，更新数据');
          setData(videoData);
        } else {
          console.log('文案无变化，保持当前UI状态');
        }
        
        setError(null);
      } catch (err) {
        console.error('获取视频数据失败:', err);
        setError('获取视频数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.pathname]);

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
      // 使用navigate跳转替代直接修改location
      if (data.content.navUrl.startsWith('/edit')) {
        // 跳转到编辑页面，确保styleId被传递
        const styleId = data.template.styleId;
        navigate(`/edit?styleId=${styleId}`);
      } else {
        // 对于外部链接，继续使用原来的方式
        window.location.href = data.content.navUrl;
      }
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
    // 优先使用URL参数中的ratio
    const ratioToUse = urlRatio || (data?.content.ratio || '16:9');
    
    console.log(`使用视频比例: ${ratioToUse}`);
    
    const [width, height] = ratioToUse.split(':').map(Number);
    if (width && height) {
      // 根据屏幕宽度和视频比例计算高度
      const screenWidth = window.innerWidth;
      return `${(screenWidth * height) / width}px`;
    }
    
    // 默认16:9比例
    const screenWidth = window.innerWidth;
    return `${(screenWidth * 9) / 16}px`;
  };

  // 获取要显示的标题和文案
  const getDisplayTitle = () => {
    // 优先使用API返回的title
    return data?.content.title || null;
  };

  const getDisplayText = () => {
    return data?.content.text || urlText;
  };

  // 获取要显示的点赞数
  const getDisplayStars = () => {
    return data?.content.stars || '';
  };

  // 获取要显示的封面图片
  const getDisplayCover = () => {
    // 优先使用URL参数中的封面，如果没有则使用API返回的封面
    return urlCover || (data?.content.cover || '');
  };

  // 渲染视频内容
  const renderVideoContent = () => {
    if (data) {
      return (
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
              <img src={getDisplayCover()} alt="视频封面" />
            </div>
          )}
        </div>
      );
    }
    
    // 数据未加载时显示占位区域
    return (
      <div 
        className="video-container placeholder" 
        style={{ height: calculateVideoHeight() }}
      >
        <div className="video-placeholder">视频加载中...</div>
      </div>
    );
  };

  // 即使在加载中或出错时，也渲染基本UI结构
  return (
    <div className="video-detail-container">
      {/* 顶部操作区 - 只保留返回和分享按钮 */}
      <VideoTopBar 
        onBackClick={handleBackClick} 
        onShareClick={handleShareClick} 
      />
      
      {/* 视频播放区域 */}
      {renderVideoContent()}

      {/* 视频内容区域 */}
      <div className="video-content">
        {/* 用户信息区域 */}
        <div className="user-info">
          <div className="user-avatar">
            <img src="https://picsum.photos/50/50" alt="用户头像" />
          </div>
          <div className="user-name">吾明亮</div>
          <button className="follow-button">关注</button>
        </div>

        {/* 视频文案区域 - 只在有标题时显示标题 */}
        <div className="video-text">
          {getDisplayTitle() && (
            <div className="video-title">{getDisplayTitle()}</div>
          )}
          <div className="video-description">{getDisplayText()}</div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      {/* 底部操作栏 */}
      <VideoBottomBar 
        stars={getDisplayStars()} 
        onNavClick={handleNavClick} 
      />
    </div>
  );
};

export default VideoDetail; 