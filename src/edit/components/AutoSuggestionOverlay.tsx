/**
 * 自动联想浮层组件
 * 用于展示目录和文件名的联想结果
 */
import React, { useState } from 'react';
import '../styles/AutoSuggestionOverlay.css';
import { SuggestionItem } from '../services/MaterialService';
import VideoPlayer from '../../components/VideoPlayer';

interface AutoSuggestionOverlayProps {
  visible: boolean;
  suggestions: SuggestionItem[];
  position: { top: number; left: number; width: number };
  onSelect: (suggestion: SuggestionItem) => void;
  onClose: () => void;
}

/**
 * 自动联想浮层组件
 */
const AutoSuggestionOverlay: React.FC<AutoSuggestionOverlayProps> = ({
  visible,
  suggestions,
  position,
  onSelect,
  onClose
}) => {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  if (!visible || suggestions.length === 0) {
    return null;
  }

  /**
   * 处理建议项点击事件
   */
  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    onSelect(suggestion);
    onClose();
  };

  /**
   * 处理视频播放按钮点击事件
   */
  const handleVideoPlay = (e: React.MouseEvent, videoUrl: string) => {
    e.stopPropagation(); // 阻止事件冒泡
    setCurrentVideoUrl(videoUrl);
    setShowVideoPlayer(true);
  };

  /**
   * 关闭视频播放器
   */
  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
    setCurrentVideoUrl('');
  };

  /**
   * 获取建议项的样式类名
   */
  const getSuggestionClassName = (matchType: 'startWith' | 'contains') => {
    return `suggestion-item ${matchType === 'startWith' ? 'exact-match' : 'fuzzy-match'}`;
  };

  return (
    <>
      <div 
        className="auto-suggestion-overlay"
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          width: position.width,
          zIndex: 10000
        }}
      >
        <div className="suggestion-container">
          <div className="suggestion-header">
            <span className="suggestion-title">自动联想</span>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="suggestion-list">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.name}-${index}`}
                className={getSuggestionClassName(suggestion.matchType)}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-content">
                  <span className="suggestion-name">{suggestion.name}</span>
                  <span className="suggestion-type">
                    {suggestion.type === 'directory' ? '主题' : '素材'}
                  </span>
                </div>
                {suggestion.isVideo && suggestion.videoUrl && (
                  <button
                    className="video-play-btn"
                    onClick={(e) => handleVideoPlay(e, suggestion.videoUrl!)}
                    title="播放视频"
                  >
                    ▶
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 视频播放器模态框 */}
      {showVideoPlayer && currentVideoUrl && (
        <div className="video-player-modal">
          <div className="video-player-backdrop" onClick={handleCloseVideoPlayer}></div>
          <div className="video-player-content">
            <div className="video-player-header">
              <span className="video-player-title">视频预览</span>
              <button className="video-player-close" onClick={handleCloseVideoPlayer}>×</button>
            </div>
            <VideoPlayer
              videoUrl={currentVideoUrl}
              autoPlay={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AutoSuggestionOverlay; 