/**
 * 音色选项组件
 * 展示单个音色选项，包括头像、名称和交互功能
 */
import React, { useState, useCallback } from 'react';
import { SettingOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import AudioPlayer from '../../utils/AudioPlayer';
import '../../styles/VoiceItem.css';

interface VoiceItemProps {
  id: string;
  name: string;
  avatar: string;
  emotion?: string[];
  isFavorite: boolean;
  isSelected: boolean;
  speechUrl?: string;  // 新增：音频URL
  onClick: (id: string) => void;
  onFavoriteToggle: (id: string, isFavorite: boolean) => void;
  onSettingsClick: (id: string) => void;
}

/**
 * 音色选项组件
 */
const VoiceItem: React.FC<VoiceItemProps> = ({
  id,
  name,
  avatar,
  emotion = [],
  isFavorite,
  isSelected,
  speechUrl,  // 新增：音频URL
  onClick,
  onFavoriteToggle,
  onSettingsClick
}) => {
  // 是否显示设置图标
  const [showSettings, setShowSettings] = useState(false);
  
  // 处理点击事件 - 只负责选中该项
  const handleClick = useCallback(() => {
    onClick(id);
    console.log("handleClick", id,"speechUrl:", speechUrl);
    // 如果有音频URL，播放音频
    if (speechUrl) {
      AudioPlayer.getInstance().play(speechUrl);
    }
  }, [id, onClick, speechUrl]);
  
  // 处理收藏切换
  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(id, !isFavorite);
  }, [id, isFavorite, onFavoriteToggle]);
  
  // 处理设置点击 - 专门负责弹出设置面板
  const handleSettingsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSettingsClick(id);
  }, [id, onSettingsClick]);
  
  // 鼠标进入事件
  const handleMouseEnter = useCallback(() => {
    setShowSettings(true);
  }, []);
  
  // 鼠标离开事件
  const handleMouseLeave = useCallback(() => {
    setShowSettings(false);
  }, []);
  
  return (
    <div 
      className={`voice-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="voice-item-avatar-container">
        <img 
          className="voice-item-avatar"
          src={avatar} 
          alt={name}
          onError={(e) => {
            // 图片加载失败时使用默认头像
            (e.target as HTMLImageElement).src = '/assets/images/default-avatar.png';
          }}
        />
        
        {/* 多情绪标签 */}
        {emotion.length > 1 && (
          <div className="voice-item-emotion-tag">多情绪</div>
        )}
        
        {/* 收藏按钮 */}
        <div className="voice-item-favorite" onClick={handleFavoriteToggle}>
          {isFavorite ? (
            <StarFilled style={{ fontSize: '16px', color: 'var(--voice-favorite-color)' }} />
          ) : (
            <StarOutlined style={{ fontSize: '16px', color: 'white' }} />
          )}
        </div>
        
        {/* 选中状态的遮罩和设置按钮 */}
        {(isSelected || showSettings) && (
          <div className="voice-item-overlay">
            <div className="voice-item-settings" onClick={handleSettingsClick}>
              <SettingOutlined style={{ fontSize: '22px', color: 'white' }} />
            </div>
          </div>
        )}
      </div>
      
      {/* 名称 */}
      <div className="voice-item-name">{name}</div>
    </div>
  );
};

export default React.memo(VoiceItem); 