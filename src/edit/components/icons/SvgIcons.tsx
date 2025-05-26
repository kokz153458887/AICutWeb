/**
 * SVG图标组件
 * 负责集中管理应用中使用的SVG图标，保持组件职责单一
 */
import React from 'react';

/**
 * 喇叭图标组件
 */
export const SpeakerIcon: React.FC<{ width?: number; height?: number }> = ({ 
  width = 20, 
  height = 20 
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/**
 * 箭头图标组件
 */
export const ArrowIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/**
 * 预览图标组件
 */
export const PreviewIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 16,
  height = 16
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5C7.45455 5 3.57273 7.90909 2 12C3.57273 16.0909 7.45455 19 12 19C16.5455 19 20.4273 16.0909 22 12C20.4273 7.90909 16.5455 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/**
 * 播放(试听)图标组件
 * 用于表示音频播放功能
 */
export const PlayIcon: React.FC<{width?: number, height?: number, isPlaying?: boolean}> = ({
  width = 16, 
  height = 16,
  isPlaying = false
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={isPlaying ? "play-icon-animated" : ""}
  >
    <circle cx="12" cy="12" r="10" />
    {isPlaying ? (
      <>
        <line x1="10" y1="15" x2="10" y2="9" strokeWidth="2" />
        <line x1="14" y1="15" x2="14" y2="9" strokeWidth="2" />
      </>
    ) : (
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    )}
  </svg>
);

/**
 * 视频预览图标组件
 * 用于表示视频预览功能
 */
export const VideoPreviewIcon: React.FC<{width?: number, height?: number}> = ({width = 16, height = 16}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <path d="M10 8L16 12 10 16 10 8Z" fill="currentColor" />
  </svg>
);

// 图标属性接口
export interface IconProps {
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

/**
 * 关闭图标组件
 */
export const CloseIcon: React.FC<IconProps> = ({ width = 24, height = 24, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M17 7L7 17M7 7L17 17"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 编辑图标组件
 */
export const EditIcon: React.FC<{width?: number, height?: number}> = ({width = 24, height = 24}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * 收藏星星图标组件
 */
export const FavoriteIcon: React.FC<{
  width?: number;
  height?: number;
  active?: boolean;
}> = ({
  width = 16,
  height = 16,
  active = false
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {active ? (
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="#ff4757"/>
    ) : (
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    )}
  </svg>
);

/**
 * 设置图标组件
 */
export const SettingsIcon: React.FC<{
  width?: number;
  height?: number;
}> = ({
  width = 20,
  height = 20
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="white"/>
    <path d="M18.7273 14.5454C18.6063 14.8144 18.5702 15.1114 18.6236 15.4013C18.677 15.6912 18.8177 15.9622 19.0295 16.1772L19.0909 16.2363C19.2627 16.4081 19.3988 16.6127 19.4914 16.8382C19.5839 17.0637 19.6315 17.306 19.6315 17.5509C19.6315 17.7958 19.5839 18.0381 19.4914 18.2636C19.3988 18.4891 19.2627 18.6937 19.0909 18.8654C18.9192 19.0372 18.7146 19.1733 18.4891 19.2659C18.2635 19.3584 18.0213 19.406 17.7764 19.406C17.5314 19.406 17.2892 19.3584 17.0637 19.2659C16.8382 19.1733 16.6336 19.0372 16.4618 18.8654L16.4027 18.804C16.1878 18.5922 15.9168 18.4515 15.6269 18.3981C15.337 18.3447 15.04 18.3808 14.7709 18.5018C14.5069 18.6181 14.2764 18.8125 14.1081 19.0659C13.9399 19.3194 13.8407 19.62 13.8236 19.9309L13.8182 20.0454C13.8182 20.5407 13.6208 21.0159 13.2708 21.3659C12.9207 21.7159 12.4455 21.9134 11.9502 21.9134C11.4549 21.9134 10.9797 21.7159 10.6297 21.3659C10.2796 21.0159 10.0822 20.5407 10.0822 20.0454L10.0767 19.92C10.0552 19.6059 9.95 19.3034 9.77392 19.0508C9.59784 18.7981 9.35743 18.6066 9.08727 18.4954C8.81823 18.3744 8.52125 18.3383 8.23135 18.3917C7.94146 18.4451 7.67043 18.5858 7.45545 18.7977L7.39636 18.8568C7.22461 19.0286 7.01999 19.1647 6.7945 19.2572C6.56901 19.3498 6.32671 19.3974 6.08182 19.3974C5.83693 19.3974 5.59463 19.3498 5.36914 19.2572C5.14365 19.1647 4.93903 19.0286 4.76727 18.8568C4.59548 18.6851 4.45934 18.4804 4.36681 18.2549C4.27428 18.0295 4.2267 17.7872 4.2267 17.5423C4.2267 17.2974 4.27428 17.0551 4.36681 16.8296C4.45934 16.6041 4.59548 16.3995 4.76727 16.2277L4.82636 16.1686C5.03824 15.9536 5.17889 15.6826 5.23229 15.3927C5.28568 15.1028 5.24961 14.8058 5.12864 14.5368C5.01236 14.2728 4.818 14.0423 4.56454 13.874C4.31109 13.7058 4.01054 13.6066 3.69954 13.5895L3.58507 13.584C3.08978 13.584 2.61461 13.3866 2.26456 13.0366C1.91451 12.6865 1.71707 12.2113 1.71707 11.716C1.71707 11.2208 1.91451 10.7456 2.26456 10.3955C2.61461 10.0455 3.08978 9.84805 3.58507 9.84805L3.71007 9.84261C4.02417 9.82114 4.32669 9.71592 4.57935 9.53984C4.83201 9.36375 5.02347 9.12333 5.13469 8.85316C5.25566 8.58413 5.29173 8.28716 5.23834 8.00026C5.18496 7.71036 5.0443 7.43933 4.83242 7.22434L4.77333 7.16525C4.60155 6.9935 4.46541 6.78888 4.37288 6.56339C4.28035 6.3379 4.23276 6.0956 4.23276 5.85071C4.23276 5.60582 4.28035 5.36352 4.37288 5.13803C4.46541 4.91254 4.60155 4.70792 4.77333 4.53616C4.94509 4.36438 5.14971 4.22823 5.3752 4.1357C5.60069 4.04317 5.84299 3.99559 6.08788 3.99559C6.33277 3.99559 6.57507 4.04317 6.80056 4.1357C7.02605 4.22823 7.23067 4.36438 7.40242 4.53616L7.46151 4.59525C7.6765 4.80713 7.94753 4.94778 8.23743 5.00117C8.52732 5.05456 8.8243 5.01849 9.09333 4.89752H9.1009C9.36488 4.78124 9.5954 4.58688 9.76362 4.33342C9.93185 4.07997 10.031 3.77941 10.0482 3.46843L10.0536 3.35395C10.0536 2.85866 10.251 2.38349 10.6011 2.03344C10.9511 1.68339 11.4263 1.48596 11.9216 1.48596C12.4169 1.48596 12.8921 1.68339 13.2421 2.03344C13.5922 2.38349 13.7896 2.85866 13.7896 3.35395V3.47895C13.8067 3.78994 13.9059 4.0905 14.0741 4.34396C14.2424 4.59741 14.4729 4.79178 14.7369 4.90807C15.0059 5.02903 15.3029 5.0651 15.5928 5.01171C15.8827 4.95833 16.1537 4.81767 16.3687 4.60579L16.4278 4.5467C16.5996 4.37492 16.8042 4.23878 17.0297 4.14625C17.2551 4.05372 17.4974 4.00613 17.7423 4.00613C17.9872 4.00613 18.2295 4.05372 18.455 4.14625C18.6805 4.23878 18.8851 4.37492 19.0569 4.5467C19.2287 4.71846 19.3648 4.92308 19.4573 5.14857C19.5499 5.37406 19.5974 5.61636 19.5974 5.86125C19.5974 6.10614 19.5499 6.34844 19.4573 6.57393C19.3648 6.79942 19.2287 7.00404 19.0569 7.1758L18.9978 7.23489C18.7859 7.44987 18.6453 7.7209 18.5919 8.0108C18.5385 8.30069 18.5746 8.59767 18.6956 8.8667V8.87427C18.8118 9.13826 19.0062 9.36878 19.2597 9.537C19.5131 9.70523 19.8137 9.80445 20.1246 9.82157L20.2391 9.82703C20.7344 9.82703 21.2096 10.0245 21.5596 10.3745C21.9097 10.7246 22.1071 11.1997 22.1071 11.695C22.1071 12.1903 21.9097 12.6655 21.5596 13.0156C21.2096 13.3656 20.7344 13.563 20.2391 13.563H20.1141C19.8031 13.5802 19.5026 13.6794 19.2491 13.8476C18.9957 14.0159 18.8013 14.2464 18.685 14.5104L18.7273 14.5454Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * 筛选图标组件
 */
export const FilterIcon: React.FC<IconProps> = ({ width = 24, height = 24, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10.5 18V12.2L4.5 5.5H19.5L13.5 12.2V18H10.5Z"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 确认勾号图标组件
 */
export const CheckmarkIcon: React.FC<IconProps> = ({ width = 44, height = 44, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5 13L9 17L19 7"
      stroke="white"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 空状态图标组件
 */
export const EmptyStateIcon: React.FC<{
  width?: number;
  height?: number;
}> = ({
  width = 48,
  height = 48
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-8h10v2H7v-2zm0-5h10v2H7V7z" fill="currentColor"/>
  </svg>
);

/**
 * 参数调整按钮图标
 */
export const ParamsIcon: React.FC<{
  width?: number;
  height?: number;
}> = ({
  width = 20,
  height = 20
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5H21M3 12H21M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/**
 * 加载中图标组件
 */
export const LoadingIcon: React.FC<IconProps> = ({ width = 24, height = 24 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 不喜欢图标组件 - 简洁的X符号
 */
export const DislikeIcon: React.FC<IconProps> = ({ width = 14, height = 14, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 下拉箭头图标组件
 */
export const DropdownArrowIcon: React.FC<IconProps> = ({ width = 12, height = 12, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 清空文本图标组件 - X符号
 */
export const ClearTextIcon: React.FC<IconProps> = ({ width = 16, height = 16, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
); 