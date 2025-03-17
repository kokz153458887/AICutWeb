/**
 * SVG图标组件
 * 提供列表页所需的各种图标组件
 */
import React from 'react';

interface IconProps {
  className?: string;
  fill?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

/**
 * 编辑图标组件
 */
export const EditIcon: React.FC<IconProps> = ({ 
  className, 
  fill = '#FFFFFF', 
  width = 24, 
  height = 24,
  onClick
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path 
        d="M16.862 4.487L18.549 2.799C18.9497 2.39835 19.4924 2.17393 20.0574 2.17393C20.6224 2.17393 21.1651 2.39835 21.5658 2.799C21.9664 3.19965 22.1909 3.74237 22.1909 4.3073C22.1909 4.87224 21.9664 5.41496 21.5658 5.8156L10.5 16.8814L6.75 17.6314L7.5 13.8814L16.862 4.487Z" 
        stroke={fill} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M3 20.25H21" 
        stroke={fill} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 重新生成图标组件
 */
export const RegenerateIcon: React.FC<IconProps> = ({ 
  className, 
  fill = '#FFFFFF', 
  width = 24, 
  height = 24,
  onClick
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path 
        d="M4 12C4 7.58172 7.58172 4 12 4C15.3661 4 18.2085 6.00069 19.4249 8.8535" 
        stroke={fill} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16.5 8.5H20V5" 
        stroke={fill} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M20 12C20 16.4183 16.4183 20 12 20C8.63395 20 5.79154 17.9993 4.57512 15.1465" 
        stroke={fill} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M7.5 15.5H4V19" 
        stroke={fill} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 播放图标组件
 */
export const PlayIcon: React.FC<IconProps> = ({ 
  className, 
  fill = '#FFFFFF', 
  width = 24, 
  height = 24,
  onClick
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path 
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
        stroke={fill} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M10 8L16 12L10 16V8Z" 
        fill={fill} 
        stroke={fill} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 关闭图标组件
 */
export const CloseIcon: React.FC<IconProps> = ({ 
  className, 
  fill = '#FFFFFF', 
  width = 24, 
  height = 24,
  onClick
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path 
        d="M18 6L6 18" 
        stroke={fill} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M6 6L18 18" 
        stroke={fill} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 生成中图标组件（旋转动画）
 */
export const GeneratingIcon: React.FC<IconProps> = ({ 
  className, 
  fill = '#00e676', 
  width = 24, 
  height = 24,
  onClick
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} generating-icon-spin`}
      onClick={onClick}
    >
      <path 
        d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12" 
        stroke={fill} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M22 12C22 13.3132 21.7413 14.6136 21.2388 15.8268C20.7362 17.0401 19.9997 18.1425 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22" 
        stroke="#A0A0A0" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C4.00035 18.1425 3.26375 17.0401 2.7612 15.8268C2.25866 14.6136 2 13.3132 2 12" 
        stroke="#A0A0A0" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M2 12C2 10.6868 2.25866 9.38642 2.7612 8.17317C3.26375 6.95991 4.00035 5.85752 4.92893 4.92893C5.85752 4.00035 6.95991 3.26375 8.17317 2.7612C9.38642 2.25866 10.6868 2 12 2" 
        stroke="#A0A0A0" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 向左滑动图标
 */
export const ArrowLeftIcon: React.FC<IconProps> = ({ 
  className, 
  fill = '#FFFFFF', 
  width = 24, 
  height = 24,
  onClick
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path 
        d="M15 6L9 12L15 18" 
        stroke={fill} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 向右滑动图标
 */
export const ArrowRightIcon: React.FC<IconProps> = ({ 
  className, 
  fill = '#FFFFFF', 
  width = 24, 
  height = 24,
  onClick
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path 
        d="M9 6L15 12L9 18" 
        stroke={fill} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}; 