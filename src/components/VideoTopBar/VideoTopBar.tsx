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
}

const VideoTopBar: React.FC<VideoTopBarProps> = ({ onBackClick, onShareClick }) => {
  return (
    <div className="video-top-bar">
      <div className="back-button" onClick={onBackClick}>
        <BackIcon />
      </div>
      <div className="share-button" onClick={onShareClick}>
        <ShareIcon />
      </div>
    </div>
  );
};

export default VideoTopBar; 