/**
 * ConfigItem 组件类型声明文件
 */
import React from 'react';

export interface ConfigItemProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  onClick: () => void;
  // 音量控制相关属性
  hasVolumeControl?: boolean;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  // 预览相关属性
  hasPreview?: boolean;
  previewImage?: string;
  onPreviewClick?: () => void;
  // 试听相关属性
  hasAudioPlayback?: boolean;
  onPlayClick?: () => void;
  // 视频预览相关属性
  hasVideoPreview?: boolean;
  previewVideoUrl?: string;
  onVideoPreviewClick?: () => void;
}

declare const ConfigItem: React.FC<ConfigItemProps>;

export default ConfigItem; 