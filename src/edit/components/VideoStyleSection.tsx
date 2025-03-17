import React from 'react';
import ConfigItem from './ConfigItem';

interface VideoStyleSectionProps {
  styleName: string;
  stylePreviewUrl: string;
  onStyleClick: () => void;
  onVideoPreviewClick: () => void;
}

/**
 * 视频风格选择组件
 * 负责展示和选择视频风格，包含视频预览功能
 */
const VideoStyleSection: React.FC<VideoStyleSectionProps> = ({
  styleName,
  stylePreviewUrl,
  onStyleClick,
  onVideoPreviewClick
}) => {
  return (
    <ConfigItem
      title="视频风格"
      value={styleName || ""}
      onClick={onStyleClick}
      hasVideoPreview={true}
      previewVideoUrl={stylePreviewUrl}
      onVideoPreviewClick={onVideoPreviewClick}
    />
  );
};

export default VideoStyleSection; 