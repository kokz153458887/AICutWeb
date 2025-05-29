import React from 'react';

/**
 * 清除图标组件（X叉）
 * 用于视频切片页面的清除输入框内容功能
 */
const ClearIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = 16, 
  color = '#ff4757' 
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 6L6 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6l12 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ClearIcon; 