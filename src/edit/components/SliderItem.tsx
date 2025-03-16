/**
 * 滑动条配置项组件
 * 负责展示可调节的数值配置项，如音量、备用视频数量等
 */
import React from 'react';
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
  /**
   * 处理滑动条变化事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="slider-item">
      <div className="slider-header">
        <div className="slider-title">{title}</div>
        {showValue && <div className="slider-value">{value}</div>}
      </div>
      <div className="slider-container">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={handleChange}
          className="slider-input"
        />
      </div>
    </div>
  );
};

export default SliderItem; 