/**
 * SVG图标组件
 * 负责集中管理应用中使用的SVG图标，保持组件职责单一
 */
import React from 'react';

/**
 * 喇叭图标组件
 */
export const SpeakerIcon: React.FC<{ width?: number; height?: number }> = ({ 
  width = 20, 
  height = 20 
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/**
 * 箭头图标组件
 */
export const ArrowIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/**
 * 预览图标组件
 */
export const PreviewIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5C7.45455 5 3.57273 7.90909 2 12C3.57273 16.0909 7.45455 19 12 19C16.5455 19 20.4273 16.0909 22 12C20.4273 7.90909 16.5455 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/**
 * 播放(试听)图标组件
 * 用于表示音频播放功能
 */
export const PlayIcon: React.FC<{width?: number, height?: number, isPlaying?: boolean}> = ({
  width = 16, 
  height = 16,
  isPlaying = false
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={isPlaying ? "play-icon-animated" : ""}
  >
    <circle cx="12" cy="12" r="10" />
    {isPlaying ? (
      <>
        <line x1="10" y1="15" x2="10" y2="9" strokeWidth="2" />
        <line x1="14" y1="15" x2="14" y2="9" strokeWidth="2" />
      </>
    ) : (
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    )}
  </svg>
);

/**
 * 视频预览图标组件
 * 用于表示视频预览功能
 */
export const VideoPreviewIcon: React.FC<{width?: number, height?: number}> = ({width = 16, height = 16}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <path d="M10 8L16 12 10 16 10 8Z" fill="currentColor" />
  </svg>
);

/**
 * 关闭图标组件
 */
export const CloseIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
); 