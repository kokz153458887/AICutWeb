/**
 * 滑动条配置项组件
 * 负责展示可调节的数值配置项，如音量、备用视频数量等
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/SliderItem.css';

interface SliderItemProps {
  title: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  showValue?: boolean;
}

/**
 * 滑动条配置项组件
 */
const SliderItem: React.FC<SliderItemProps> = ({
  title,
  min,
  max,
  value,
  onChange,
  step = 1,
  showValue = false
}) => {
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const sliderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderItemRef = useRef<HTMLDivElement>(null);
  const [sliderItemPosition, setSliderItemPosition] = useState({ top: 0, left: 0, width: 0 });

  /**
   * 处理数值按钮点击事件
   */
  const handleValueClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 获取滑块项的位置和尺寸
    if (sliderItemRef.current) {
      const rect = sliderItemRef.current.getBoundingClientRect();
      setSliderItemPosition({
        top: rect.bottom + window.scrollY + 5, // 底部位置加5px间距
        left: rect.left, // 左对齐
        width: rect.width // 使用区块宽度
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
   * 处理滑动条变化事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
    
    // 清除之前的定时器
    if (sliderTimeoutRef.current) {
      clearTimeout(sliderTimeoutRef.current);
      sliderTimeoutRef.current = null;
    }
  };

  /**
   * 处理鼠标抬起事件，延迟隐藏滑动条
   */
  const handleSliderMouseUp = () => {
    sliderTimeoutRef.current = setTimeout(() => {
      setShowSlider(false);
    }, 1000); // 与背景音乐控制一致，改为1000ms
  };
  
  /**
   * 处理滑块点击事件，防止事件穿透
   */
  const handleSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
  };
  
  /**
   * 处理触摸移动事件，阻止页面滚动
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

  return (
    <div className="slider-item" ref={sliderItemRef}>
      <div className="slider-header">
        <div className="slider-title">{title}</div>
        <div className="slider-value-control">
          <div className="slider-value-button" onClick={handleValueClick}>
            <span className="slider-value-text">数量</span> <span className="slider-value-badge">{value}</span>
          </div>
          
          {/* 滑动控制条浮层 */}
          {showSlider && (
            <div 
              className="slider-control-container" 
              ref={sliderRef}
              onClick={handleSliderClick}
              onTouchMove={handleTouchMove}
              style={{
                top: `${sliderItemPosition.top}px`,
                left: `${sliderItemPosition.left}px`,
                position: 'fixed',
                width: `${sliderItemPosition.width}px`
              }}
            >
              <input
                type="range"
                min={min}
                max={max}
                value={value}
                step={step}
                onChange={handleChange}
                onMouseUp={handleSliderMouseUp}
                onTouchEnd={handleSliderMouseUp}
                onTouchMove={handleTouchMove}
                className="slider-control-input"
                onClick={(e) => e.stopPropagation()}
                style={{ flex: 1 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SliderItem; 