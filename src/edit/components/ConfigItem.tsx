/**
 * 配置项组件
 * 负责展示可点击的配置选项，如视频风格、说话人等
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/ConfigItem.css';
import { ArrowIcon, PreviewIcon, PlayIcon, VideoPreviewIcon } from './icons/SvgIcons';
import { toast } from '../../components/Toast';

interface ConfigItemProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  onClick?: (e: React.MouseEvent) => void;
  // 自定义渲染函数
  renderCustomValue?: () => React.ReactNode;
  // 音量控制相关属性
  hasVolumeControl?: boolean;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  maxVolume?: number; // 最大音量值
  volumeStep?: number; // 音量调节步长
  // 预览相关属性
  hasPreview?: boolean;
  previewImage?: string;
  onPreviewClick?: () => void;
  // 试听相关属性
  hasAudioPlayback?: boolean;
  onPlayClick?: () => void;
  isPlaying?: boolean;
  // 视频预览相关属性
  hasVideoPreview?: boolean;
  previewVideoUrl?: string;
  onVideoPreviewClick?: () => void;
  onVolumeClick?: () => void;
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
  volume = 1, // 默认为1 (100%)
  onVolumeChange,
  maxVolume = 5, // 默认最大值为5 (500%)
  volumeStep = 0.1, // 默认调节步长为0.1 (10%)
  hasPreview = false,
  previewImage = '',
  onPreviewClick,
  hasAudioPlayback = false,
  onPlayClick,
  isPlaying = false,
  hasVideoPreview = false,
  previewVideoUrl = '',
  onVideoPreviewClick,
  renderCustomValue
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showVideoPreview, setShowVideoPreview] = useState<boolean>(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const videoPreviewRef = useRef<HTMLDivElement>(null);
  const configItemRef = useRef<HTMLDivElement>(null);
  const [volumeBtnPosition, setVolumeBtnPosition] = useState({ top: 0, left: 0, width: 0 });

  /**
   * 获取显示用的音量值（百分比形式）
   */
  const getDisplayVolume = () => {
    return Math.round(volume * 100);
  };

  /**
   * 处理音量按钮点击事件，记录按钮位置
   */
  const handleVolumeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 获取按钮位置信息
    if (e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const configItem = configItemRef.current;
      let sliderWidth = configItem ? configItem.getBoundingClientRect().width : 320;
      
      setVolumeBtnPosition({
        top: rect.bottom + window.scrollY + 5, // 按钮底部位置加5px间距
        left: configItem ? configItem.getBoundingClientRect().left : rect.left,
        width: sliderWidth
      });
    }
    
    setShowVolumeSlider(prev => !prev);
    
    // 清除之前的定时器
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
    }
  };

  /**
   * 处理预览图标点击事件
   */
  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewImage) {
      toast.info('暂无预览图片');
      return;
    }
    setShowPreview(true);
    if (onPreviewClick) {
      onPreviewClick();
    }
  };

  /**
   * 处理关闭预览事件
   */
  const handleClosePreview = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    setShowPreview(false);
  };

  /**
   * 处理视频预览图标点击事件
   */
  const handleVideoPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewVideoUrl) {
      toast.info('暂无预览视频');
      return;
    }
    setShowVideoPreview(true);
    if (onVideoPreviewClick) {
      onVideoPreviewClick();
    }
  };

  /**
   * 处理关闭视频预览事件
   */
  const handleCloseVideoPreview = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    setShowVideoPreview(false);
  };

  /**
   * 处理试听按钮点击事件
   */
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayClick) {
      onPlayClick();
    } else {
      toast.info('试听功能待实现');
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
    }, 1000);
  };

  /**
   * 处理音量滑动条点击事件，防止事件穿透
   */
  const handleVolumeSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发整个配置项的点击
    e.preventDefault(); // 阻止默认行为
  };

  /**
   * 处理滑块触摸移动事件，阻止页面滚动
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // 阻止默认的触摸行为（页面滚动）
    e.stopPropagation();
  };

  /**
   * 处理滑块触摸开始事件
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * 点击外部时隐藏控制项
   */
  useEffect(() => {    
    const handleClickOutside = (event: MouseEvent) => {
      // 音量滑块的点击外部处理
      if (hasVolumeControl && sliderRef.current && 
          !sliderRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
      
      // 预览的点击外部处理
      if (hasPreview && previewRef.current && 
          !previewRef.current.contains(event.target as Node) && 
          !event.composedPath().some(el => (el as HTMLElement).classList?.contains('preview-icon-button'))) {
        setShowPreview(false);
      }

      // 视频预览的点击外部处理
      if (hasVideoPreview && videoPreviewRef.current && 
          !videoPreviewRef.current.contains(event.target as Node) && 
          !event.composedPath().some(el => (el as HTMLElement).classList?.contains('video-preview-icon-button'))) {
        setShowVideoPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hasVolumeControl, hasPreview, hasVideoPreview]);

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
    <div className="config-item" onClick={(e: React.MouseEvent) => onClick?.(e)} ref={configItemRef}>
      <div className="config-title" style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>{title}</div>
      <div className="config-value-container" style={{ position: 'relative' }}>
        <div className="config-value-wrapper">
          <div className="config-value-row">
            <div className="config-value" title={value} style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>
              {renderCustomValue ? renderCustomValue() : value}
              {tag && <span className="config-tag" style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>{tag}</span>}
            </div>
            
            {/* 添加预览按钮 */}
            {hasPreview && (
              <div className="preview-icon-button" onClick={handlePreviewClick}>
                <PreviewIcon />
              </div>
            )}
            
            {/* 添加视频预览按钮 */}
            {hasVideoPreview && (
              <div className="video-preview-icon-button" onClick={handleVideoPreviewClick}>
                <VideoPreviewIcon />
              </div>
            )}
          </div>
          {subValue && <div className="config-sub-value" title={subValue} style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>{subValue}</div>}
        </div>
        
        {/* 音量控制按钮 */}
        {hasVolumeControl && (
          <div className="config-volume-control">
            <div
              className="volume-text"
              onClick={handleVolumeClick}
            >
              <span className="volume-badge">{getDisplayVolume()}%</span>
            </div>
            
            {/* 音量滑动控制条 */}
            {showVolumeSlider && (
              <div 
                className="volume-slider-container" 
                ref={sliderRef}
                onClick={handleVolumeSliderClick}
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchStart}
                style={{
                  position: 'fixed',
                  top: `${volumeBtnPosition.top}px`,
                  left: `${volumeBtnPosition.left}px`,
                  width: `${volumeBtnPosition.width}px`,
                  zIndex: 1000
                }}
              >
                <input
                  type="range"
                  min={0}
                  max={maxVolume}
                  value={volume}
                  step={volumeStep}
                  onChange={handleVolumeChange}
                  onMouseUp={handleVolumeMouseUp}
                  onTouchEnd={handleVolumeMouseUp}
                  onTouchMove={handleTouchMove}
                  onTouchStart={handleTouchStart}
                  className="volume-slider"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  style={{ flex: 1 }}
                />
              </div>
            )}
          </div>
        )}
        
        {/* 试听按钮 */}
        {hasAudioPlayback && (
          <div className="play-icon-button" onClick={handlePlayClick}>
            <PlayIcon isPlaying={isPlaying} />
          </div>
        )}
        
        <div className="config-arrow">
          <ArrowIcon />
        </div>
      </div>
      
      {/* 预览浮层 */}
      {showPreview && previewImage && (
        <div className="preview-overlay" onClick={handleClosePreview}>
          <div className="preview-container" ref={previewRef}>
            <div className="preview-close" onClick={handleClosePreview}>×</div>
            <img src={previewImage} alt={`${title} 预览`} className="preview-image" />
          </div>
        </div>
      )}
      
      {/* 视频预览浮层 */}
      {showVideoPreview && previewVideoUrl && (
        <div className="preview-overlay" onClick={handleCloseVideoPreview}>
          <div className="video-preview-container" ref={videoPreviewRef}>
            <div className="preview-close" onClick={handleCloseVideoPreview}>×</div>
            <video 
              src={previewVideoUrl} 
              className="preview-video" 
              controls 
              autoPlay 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigItem; 