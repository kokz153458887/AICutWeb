import React from 'react';

/**
 * 剪切板图标组件
 * 用于视频切片页面的粘贴剪切板内容功能
 */
const ClipboardIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = 16, 
  color = '#00d6c9' 
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="8"
        y="2"
        width="8"
        height="4"
        rx="1"
        ry="1"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

export default ClipboardIcon; 