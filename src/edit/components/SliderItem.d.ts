/**
 * SliderItem 组件类型声明文件
 */
import React from 'react';

export interface SliderItemProps {
  title: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  showValue?: boolean;
}

declare const SliderItem: React.FC<SliderItemProps>;

export default SliderItem; 