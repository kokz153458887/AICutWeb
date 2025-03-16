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

  /**
   * 处理数值按钮点击事件
   */
  const handleValueClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
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
    }, 500);
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
    <div className="slider-item">
      <div className="slider-header">
        <div className="slider-title">{title}</div>
        <div className="slider-value-control">
          <div className="slider-value-button" onClick={handleValueClick}>
            <span className="slider-value-text">数量</span> <span className="slider-value-badge">{value}</span>
          </div>
          
          {/* 滑动控制条浮层 */}
          {showSlider && (
            <div className="slider-control-container" ref={sliderRef}>
              <input
                type="range"
                min={min}
                max={max}
                value={value}
                step={step}
                onChange={handleChange}
                onMouseUp={handleSliderMouseUp}
                onTouchEnd={handleSliderMouseUp}
                className="slider-control-input"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SliderItem; 