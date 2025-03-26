/**
 * 视频顶部栏组件
 * 负责展示返回按钮和分享按钮
 */
import React from 'react';
import './VideoTopBar.css';
import { BackIcon, ShareIcon } from '../icons';

interface VideoTopBarProps {
  onBackClick: () => void;
  onShareClick: () => void;
  onShareTemplateClick?: () => void;
  title?: string;
}

const VideoTopBar: React.FC<VideoTopBarProps> = ({ 
  onBackClick, 
  onShareClick, 
  onShareTemplateClick,
  title 
}) => {
  return (
    <div className="video-top-bar">
      <div className="back-button" onClick={onBackClick}>
        <BackIcon />
      </div>
      
      {title && <div className="title">{title}</div>}
      
      <div className="right-buttons">
        {onShareTemplateClick && (
          <button className="share-template-button" onClick={onShareTemplateClick}>
            分享模版
          </button>
        )}
        <div className="share-button" onClick={onShareClick}>
          <ShareIcon />
        </div>
      </div>
    </div>
  );
};

export default VideoTopBar; 