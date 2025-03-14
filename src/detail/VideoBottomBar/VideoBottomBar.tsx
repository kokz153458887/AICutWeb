/**
 * 视频底部栏组件
 * 负责展示点赞按钮和"做同款"按钮
 */
import React from 'react';
import './VideoBottomBar.css';
import { HeartIcon } from '../../components/icons';

interface VideoBottomBarProps {
  stars: string;
  onNavClick: () => void;
}

const VideoBottomBar: React.FC<VideoBottomBarProps> = ({ stars, onNavClick }) => {
  return (
    <div className="video-bottom-bar">
      <div className="like-button">
        <div className="like-icon-container">
          <HeartIcon />
        </div>
        <span className="like-count">{stars || '加载中...'}</span>
      </div>
      <button className="make-same-button" onClick={onNavClick}>
        做同款
      </button>
    </div>
  );
};

export default VideoBottomBar; 