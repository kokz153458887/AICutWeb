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
  
  // 处理点击事件 - 负责选中该项和播放音频
  const handleClick = useCallback((e: React.MouseEvent) => {
    // 检查是否点击了设置按钮
    const target = e.target as HTMLElement;
    const isSettingsButton = target.closest('.voice-item-settings');
    const isSettingsVisible = showSettings || isSelected;

    console.log("handleClick", id,"speechUrl:", speechUrl);
    // 如果点击了可见状态的设置按钮，不播放音频
    if (isSettingsButton && isSettingsVisible) {
      return;
    }

    // 选中该项
    onClick(id);

    // 播放音频
    if (speechUrl) {
      console.log("播放音频:", id, "speechUrl:", speechUrl);
      AudioPlayer.getInstance().play(speechUrl);
    }
  }, [id, onClick, speechUrl, showSettings, isSelected]);
  
  // 处理收藏切换
  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发音频播放
    onFavoriteToggle(id, !isFavorite);
  }, [id, isFavorite, onFavoriteToggle]);
  
  // 处理设置按钮点击
  const handleSettingsClick = useCallback((e: React.MouseEvent) => {
    // 只有在按钮可见时才处理点击事件
    if (showSettings || isSelected) {
      console.log("handleSettingsClick onSettingsClick", id, "showSettings:", showSettings, "isSelected:", isSelected);
      e.stopPropagation(); // 阻止冒泡，避免触发音频播放
      onSettingsClick(id);
      
      if (! isSelected) {
        if (speechUrl) {
          console.log("播放音频:", id, "speechUrl:", speechUrl);
          AudioPlayer.getInstance().play(speechUrl);
        }
      }
    } 
  }, [id, showSettings, isSelected, onSettingsClick]);
  
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
            <div 
              className={`voice-item-settings ${(showSettings || isSelected) ? 'visible' : ''}`}
              onClick={handleSettingsClick}
              style={{ pointerEvents: (showSettings || isSelected) ? 'auto' : 'none' }}
            >
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