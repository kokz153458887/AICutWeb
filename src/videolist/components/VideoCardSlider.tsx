/**
 * 视频卡片滑动组件
 * 负责显示可横向滑动的视频封面
 */
import React, { useRef, useState, useEffect } from 'react';
import { VideoItem } from '../api/videoListApi';
import { PlayIcon, ArrowLeftIcon, ArrowRightIcon } from '../icons/SvgIcons';

interface VideoCardSliderProps {
  videos: VideoItem[];
  onVideoClick: (videoUrl: string) => void;
  isGenerating?: boolean;
}

/**
 * 视频卡片滑动组件
 */
const VideoCardSlider: React.FC<VideoCardSliderProps> = ({ 
  videos, 
  onVideoClick,
  isGenerating = false
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
  
  // 检查滚动按钮是否需要显示
  const checkScrollButtons = () => {
    if (!sliderRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    
    // 如果滚动位置大于0，显示左箭头
    setShowLeftArrow(scrollLeft > 0);
    
    // 如果滚动位置小于最大滚动距离，显示右箭头
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  // 监听滚动事件
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollButtons);
      
      // 初始检查
      checkScrollButtons();
      
      return () => {
        slider.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, []);
  
  // 窗口尺寸变化时重新检查
  useEffect(() => {
    window.addEventListener('resize', checkScrollButtons);
    
    return () => {
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, []);
  
  // 向左滚动
  const scrollLeft = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth / 2;
      sliderRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // 向右滚动
  const scrollRight = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth / 2;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // 处理视频点击
  const handleVideoClick = (videoUrl: string) => {
    if (videoUrl) {
      onVideoClick(videoUrl);
    }
  };

  return (
    <div className={`video-slider-container ${isGenerating ? 'generating' : ''}`}>
      {/* 左滚动按钮 */}
      {showLeftArrow && videos.length > 1 && (
        <div className="slider-control left" onClick={scrollLeft}>
          <ArrowLeftIcon />
        </div>
      )}
      
      {/* 视频滑动容器 */}
      <div className="video-slider-wrapper" ref={sliderRef}>
        {videos.map((video, index) => (
          <div 
            key={index} 
            className="video-slide"
            onClick={() => handleVideoClick(video.videoUrl)}
          >
            <img src={video.coverImg} alt={`视频封面 ${index + 1}`} />
            
            {video.videoUrl ? (
              <div className="video-slide-overlay">
                <div className="video-slide-play">
                  <PlayIcon width={20} height={20} />
                </div>
              </div>
            ) : (
              <div className="video-slide-unavailable">
                生成中...
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 右滚动按钮 */}
      {showRightArrow && videos.length > 1 && (
        <div className="slider-control right" onClick={scrollRight}>
          <ArrowRightIcon />
        </div>
      )}
    </div>
  );
};

export default VideoCardSlider; 