/**
 * 文本输入区域组件
 * 负责处理用户输入的文案内容
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/TextInputSection.css';

interface TextInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  voiceVolume?: number;
  onVoiceVolumeChange?: (volume: number) => void;
}

/**
 * 文本输入区域组件
 */
const TextInputSection: React.FC<TextInputSectionProps> = ({
  value,
  onChange,
  placeholder = '这一刻的想法...',
  voiceVolume = 50,
  onVoiceVolumeChange
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);

  /**
   * 处理文本变化事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  /**
   * 处理喇叭点击事件
   */
  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    console.log('喇叭被点击');
    // 这里可以添加语音输入或文本朗读等功能
    alert('语音功能待实现');
  };

  /**
   * 处理音量文字点击事件
   */
  const handleVolumeTextClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
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
    if (onVoiceVolumeChange) {
      onVoiceVolumeChange(Number(e.target.value));
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
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <div className="text-input-section" ref={inputSectionRef}>
      <textarea
        className="text-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
      />
      
      <div className="input-controls">
        {/* 音量文字按钮 - 显示当前音量值 */}
        <div className="volume-text" onClick={handleVolumeTextClick}>
          音量 <span className="volume-badge">{voiceVolume}</span>
        </div>
        
        {/* 喇叭图标 */}
        <div className="speaker-icon" onClick={handleSpeakerClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* 音量滑动控制条 */}
        {showVolumeSlider && (
          <div className="volume-slider-container" ref={sliderRef}>
            <input
              type="range"
              min="0"
              max="100"
              value={voiceVolume}
              onChange={handleVolumeChange}
              onMouseUp={handleVolumeMouseUp}
              onTouchEnd={handleVolumeMouseUp}
              className="volume-slider"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInputSection; 