/**
 * 视频播放页组件
 * 负责展示视频内容、封面、点赞数和"做同款"按钮
 */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './VideoDetail.css';
import { getVideoDetail, VideoDetailData } from './api';
import VideoTopBar from '../components/VideoTopBar/VideoTopBar';
import VideoBottomBar from './VideoBottomBar/VideoBottomBar';
import { BackIcon, ShareIcon } from '../components/icons';

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
  const cardData = location.state?.cardData;
  
  // 从URL参数中获取标题、文案、视频比例和封面图片
  const searchParams = new URLSearchParams(location.search);
  const urlTitle = searchParams.get('title') || '视频标题';
  const urlText = searchParams.get('text') || '视频文案加载中...';
  const urlRatio = searchParams.get('ratio');
  const urlCover = searchParams.get('cover') || '';

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
        // 如果有卡片数据，直接使用
        if (cardData) {
          setData({
            content: {
              ...cardData,
              videoUrl: cardData.videoUrl || ''
            },
            template: {
              styleId: cardData.styleId,
              styleName: cardData.styleName || '',
              styles: {}
            }
          });
          setLoading(false);
          return;
        }
        
        // 否则从API获取数据
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
  }, [id, location.pathname, cardData]);

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
      videoRef.current.volume = 0.5;
      videoRef.current.play().catch(error => {
        console.log('自动播放失败:', error);
        // 自动播放失败时保留封面
        setShowCover(true);
      });
    }
  };

  // 处理"做同款"按钮点击
  const handleNavClick = () => {
    // 获取当前视频的 styleId
    const styleId = cardData?.styleId || data?.template.styleId;
    
    // 构建编辑页URL参数
    const editParams = new URLSearchParams();
    
    // 必要的参数
    if (styleId) {
      editParams.append('styleId', styleId);
    }
    
    // 构建完整的编辑页URL
    const editUrl = `/edit?${editParams.toString()}`;
    console.log('跳转到编辑页:', editUrl);
    
    // 使用 navigate 跳转到编辑页
    navigate(editUrl);
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
    // 优先使用API返回的ratio，然后是URL参数中的ratio，最后是默认值
    const ratioToUse = data?.content.ratio || urlRatio || '16:9';
    
    console.log(`[VideoDetail] 计算视频容器高度, data: ${JSON.stringify(data)}`);
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
    // 优先使用卡片数据或API返回的title
    return cardData?.title || data?.content.title || null;
  };

  const getDisplayText = () => {
    return cardData?.text || data?.content.text || urlText;
  };

  // 获取要显示的点赞数
  const getDisplayStars = () => {
    return cardData?.stars || data?.content.stars || '';
  };

  // 获取要显示的封面图片
  const getDisplayCover = () => {
    // 优先使用卡片数据，然后是URL参数，最后是API返回的封面
    return cardData?.cover || urlCover || (data?.content.cover || '');
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
      <VideoTopBar 
        onBackClick={handleBackClick}
        onShareClick={handleShareClick}
      />
      <div className="content-wrapper">
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

          {/* 视频文案区域 */}
          <div className="video-text">
            {getDisplayTitle() && (
              <div className="video-title">{getDisplayTitle()}</div>
            )}
            <div className="video-description">{getDisplayText()}</div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>
      <VideoBottomBar 
        stars={getDisplayStars()} 
        onNavClick={handleNavClick}
      />
    </div>
  );
};

export default VideoDetail; 