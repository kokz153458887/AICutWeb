import React from 'react';
import ConfigItem from './ConfigItem';

interface MaterialSectionProps {
  materialName: string;
  previewUrl: string;
  onMaterialClick: () => void;
  onPreviewClick: () => void;
}

/**
 * 素材库选择组件
 * 负责展示和选择素材库，包含视频预览功能
 */
const MaterialSection: React.FC<MaterialSectionProps> = ({
  materialName,
  previewUrl,
  onMaterialClick,
  onPreviewClick
}) => {
  return (
    <ConfigItem
      title="素材库"
      value={materialName || ""}
      onClick={onMaterialClick}
      hasVideoPreview={true}
      previewVideoUrl={previewUrl}
      onVideoPreviewClick={onPreviewClick}
    />
  );
};

export default MaterialSection; 