import React from 'react';
import ConfigItem from './ConfigItem';

interface BackgroundImageSectionProps {
  imageName: string;
  imageUrl: string;
  onImageClick: () => void;
  onPreviewClick: () => void;
}

/**
 * 背景图片选择组件
 * 负责展示和选择背景图片，包含预览功能
 */
const BackgroundImageSection: React.FC<BackgroundImageSectionProps> = ({
  imageName,
  imageUrl,
  onImageClick,
  onPreviewClick
}) => {
  return (
    <ConfigItem
      title="背景图片"
      value={imageName || ""}
      onClick={onImageClick}
      hasPreview={true}
      previewImage={imageUrl}
      onPreviewClick={onPreviewClick}
    />
  );
};

export default BackgroundImageSection; 