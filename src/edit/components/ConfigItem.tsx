/**
 * 配置项组件
 * 负责展示可点击的配置选项，如视频风格、说话人等
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/ConfigItem.css';
import { ArrowIcon } from './icons/SvgIcons';

interface ConfigItemProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  onClick: () => void;
  // 音量控制相关属性
  hasVolumeControl?: boolean;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

/**
 * 配置项组件
 */
const ConfigItem: React.FC<ConfigItemProps> = ({
  title,
  value,
  subValue,
  tag,
  onClick,
  hasVolumeControl = false,
  volume = 50,
  onVolumeChange
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  /**
   * 处理音量文字点击事件
   */
  const handleVolumeTextClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发整个配置项的点击
    setShowVolumeSlider(prev => !prev);
    
    // 清除之前的定时器
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
    }
  };

  /**
   * 处理音量滑动条变化
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onVolumeChange) {
      onVolumeChange(Number(e.target.value));
    }
    
    // 清除之前的定时器
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
    }
  };

  /**
   * 处理鼠标抬起事件，延迟隐藏音量控制条
   */
  const handleVolumeMouseUp = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 500);
  };

  /**
   * 点击外部时隐藏音量控制条
   */
  useEffect(() => {
    if (!hasVolumeControl) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hasVolumeControl]);

  /**
   * 组件卸载时清除定时器
   */
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="config-item" onClick={onClick}>
      <div className="config-title">{title}</div>
      <div className="config-value-container">
        <div className="config-value-wrapper">
          <div className="config-value-row">
            <div className="config-value">{value}</div>
            {tag && <div className="config-tag">{tag}</div>}
          </div>
          {subValue && <div className="config-sub-value">{subValue}</div>}
        </div>
        
        {/* 音量控制按钮 */}
        {hasVolumeControl && (
          <div className="config-volume-control">
            <div className="volume-text" onClick={handleVolumeTextClick}>
              音量 <span className="volume-badge">{volume}</span>
            </div>
            
            {/* 音量滑动控制条 */}
            {showVolumeSlider && (
              <div className="volume-slider-container" ref={sliderRef}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  onMouseUp={handleVolumeMouseUp}
                  onTouchEnd={handleVolumeMouseUp}
                  className="volume-slider"
                />
              </div>
            )}
          </div>
        )}
        
        <div className="config-arrow">
          <ArrowIcon />
        </div>
      </div>
    </div>
  );
};

export default ConfigItem; 