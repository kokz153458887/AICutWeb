import React, { useState, useRef, useEffect } from 'react';
import ConfigItem from './ConfigItem';

interface BackupVideoSectionProps {
  backupCount: number;
  onConfigClick: () => void;
  onBackupCountChange: (newCount: number) => void;
}

/**
 * 备用视频数量组件
 * 负责展示和设置备用视频数量
 */
const BackupVideoSection: React.FC<BackupVideoSectionProps> = ({
  backupCount,
  onConfigClick,
  onBackupCountChange
}) => {
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sliderPosition, setSliderPosition] = useState({ top: 0, left: 0, width: 0 });

  /**
   * 处理数量文字点击事件
   */
  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 获取按钮位置信息
    if (e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const configItem = (e.currentTarget as HTMLElement).closest('.config-item');
      let sliderWidth = configItem ? configItem.getBoundingClientRect().width : 320;
      
      setSliderPosition({
        top: rect.bottom + window.scrollY + 5, // 按钮底部位置加5px间距
        left: configItem ? configItem.getBoundingClientRect().left : rect.left,
        width: sliderWidth
      });
    }
    
    setShowSlider(prev => !prev);
    
    // 清除之前的定时器
    if (sliderTimeoutRef.current) {
      clearTimeout(sliderTimeoutRef.current);
      sliderTimeoutRef.current = null;
    }
  };

  /**
   * 处理滑动条变化
   */
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBackupCountChange(Number(e.target.value));
    
    // 清除之前的定时器
    if (sliderTimeoutRef.current) {
      clearTimeout(sliderTimeoutRef.current);
      sliderTimeoutRef.current = null;
    }
  };

  /**
   * 处理鼠标抬起事件，延迟隐藏滑动条
   */
  const handleMouseUp = () => {
    sliderTimeoutRef.current = setTimeout(() => {
      setShowSlider(false);
    }, 1000);
  };

  /**
   * 处理滑动条点击事件，防止事件穿透
   */
  const handleSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发整个配置项的点击
  };

  /**
   * 处理滑块触摸移动事件，阻止页面滚动
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // 阻止默认的触摸行为（页面滚动）
    e.stopPropagation();
  };

  /**
   * 点击外部时隐藏滑动条
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setShowSlider(false);
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
      if (sliderTimeoutRef.current) {
        clearTimeout(sliderTimeoutRef.current);
      }
    };
  }, []);

  /**
   * 自定义渲染值区域，显示带有点击事件的数量文本
   */
  const renderCustomValue = () => (
    <div 
      className="volume-text"
      onClick={handleCountClick}
      onContextMenu={(e) => e.preventDefault()}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 'auto', 
        padding: '4px 8px',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <span 
        className="volume-badge"
        style={{ 
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {backupCount}
      </span>
    </div>
  );

  return (
    <>
      <ConfigItem
        title="备用视频数量"
        value={`${backupCount}`}
        onClick={handleCountClick}
        renderCustomValue={renderCustomValue}
      />
      
      {/* 滑动控制条 */}
      {showSlider && (
        <div 
          className="volume-slider-container" 
          ref={sliderRef}
          onClick={handleSliderClick}
          onTouchMove={handleTouchMove}
          style={{
            top: `${sliderPosition.top}px`,
            left: `${sliderPosition.left}px`,
            position: 'fixed',
            width: `${sliderPosition.width}px`,
            zIndex: 1000
          }}
        >
          <input
            type="range"
            min={1}
            max={10}
            value={backupCount}
            step={1}
            onChange={handleSliderChange}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleTouchMove}
            className="volume-slider"
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1 }}
          />
        </div>
      )}
    </>
  );
};

export default BackupVideoSection; 