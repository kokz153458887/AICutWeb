import React, { useState } from 'react';
import ConfigItem from './ConfigItem';
import ImageSelectModal from './imageSelect/ImageSelectModal';

interface BackgroundImageModel {
  url: string;
  backgroundId: string;
  scaleType: string;
  name?: string;
}

interface BackgroundImageSectionProps {
  imageName: string;
  imageUrl: string;
  onImageChange: (image: BackgroundImageModel) => void;
  onPreviewClick: () => void;
}

/**
 * 背景图片选择组件
 * 负责展示和选择背景图片，包含预览功能
 */
const BackgroundImageSection: React.FC<BackgroundImageSectionProps> = ({
  imageName,
  imageUrl,
  onImageChange,
  onPreviewClick
}) => {
  const [showModal, setShowModal] = useState(false);

  /**
   * 处理图片选择
   */
  const handleImageSelect = (image: any) => {
    // 从文件URL中提取文件名
    const name = image.url.split('/').pop()?.split('.')[0] || '';
    
    onImageChange({
      url: image.url,
      backgroundId: '', // 保持原有值不变
      scaleType: '', // 保持原有值不变
      name: name
    });
    
    setShowModal(false);
  };

  return (
    <>
      <ConfigItem
        title="背景图片"
        value={imageName || ""}
        onClick={() => setShowModal(true)}
        hasPreview={true}
        previewImage={imageUrl}
        onPreviewClick={onPreviewClick}
      />

      <ImageSelectModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleImageSelect}
      />
    </>
  );
};

export default BackgroundImageSection; 