/**
 * 底部视频预览列表组件
 * 负责显示视频缩略图列表，支持滑动切换
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VideoItem } from '../api/types';
import '../styles/VideoGallery.css';

interface VideoGalleryProps {
  videos: VideoItem[];
  currentIndex: number;
  onVideoSelect: (index: number) => void;
}

/**
 * 底部视频预览列表组件
 */
const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  currentIndex,
  onVideoSelect
}) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  /**
   * 检查是否需要显示渐变遮罩
   */
  const checkGradients = useCallback(() => {
    if (!galleryRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = galleryRef.current;
    setShowLeftGradient(scrollLeft > 0);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  /**
   * 处理滚动事件
   */
  useEffect(() => {
    const gallery = galleryRef.current;
    if (gallery) {
      gallery.addEventListener('scroll', checkGradients);
      return () => {
        gallery.removeEventListener('scroll', checkGradients);
      };
    }
  }, [checkGradients]);

  /**
   * 监听窗口尺寸变化
   */
  useEffect(() => {
    window.addEventListener('resize', checkGradients);
    return () => {
      window.removeEventListener('resize', checkGradients);
    };
  }, [checkGradients]);

  /**
   * 当前播放视频改变时，自动滚动到对应位置
   */
  useEffect(() => {
    if (!galleryRef.current) return;

    const gallery = galleryRef.current;
    const thumbnailWidth = 60; // 缩略图宽度
    const gap = 8; // 缩略图间距
    const containerPadding = 15; // 容器左右padding
    
    // 计算目标滚动位置
    const targetPosition = (thumbnailWidth + gap) * currentIndex;
    
    // 计算当前可视区域的中心位置
    const containerWidth = gallery.clientWidth;
    const centerOffset = (containerWidth - thumbnailWidth) / 2;
    
    // 最终滚动位置 = 目标位置 - 中心偏移
    const scrollPosition = Math.max(0, targetPosition - centerOffset + containerPadding);

    gallery.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    checkGradients();
  }, [currentIndex, checkGradients]);

  /**
   * 处理触摸开始事件
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  }, []);

  /**
   * 处理触摸移动事件
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  }, []);

  /**
   * 处理触摸结束事件
   */
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // 最小滑动距离

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0 && currentIndex < videos.length - 1) {
      // 向左滑动，播放下一个视频
      onVideoSelect(currentIndex + 1);
    } else if (distance < 0 && currentIndex > 0) {
      // 向右滑动，播放上一个视频
      onVideoSelect(currentIndex - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentIndex, videos.length, onVideoSelect]);

  /**
   * 处理缩略图点击
   */
  const handleThumbnailClick = useCallback((index: number) => {
    onVideoSelect(index);
  }, [onVideoSelect]);

  return (
    <div 
      className="video-gallery-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 左侧渐变遮罩 */}
      {showLeftGradient && <div className="gallery-gradient left" />}

      {/* 视频缩略图列表 */}
      <div className="video-gallery" ref={galleryRef}>
        {videos.map((video, index) => (
          <div
            key={index}
            className={`gallery-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleThumbnailClick(index)}
          >
            <img
              src={video.coverImg}
              alt={`视频预览 ${index + 1}`}
              className="gallery-thumbnail"
            />
          </div>
        ))}
      </div>

      {/* 右侧渐变遮罩 */}
      {showRightGradient && <div className="gallery-gradient right" />}
    </div>
  );
};

export default VideoGallery; 