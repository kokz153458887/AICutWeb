/**
 * 素材库选择组件
 * 负责展示和选择素材库，包含视频预览功能
 */
import React, { useState } from 'react';
import ConfigItem from './ConfigItem';
import MaterialSelectModal from './select/MaterialSelectModal';
import { MaterialModel } from '../api/types';

interface MaterialSectionProps {
  materialName: string;
  materialId?: string;
  previewUrl: string;
  url?: string;
  onMaterialClick: () => void;
  onPreviewClick: () => void;
  onMaterialSelect?: (material: MaterialModel) => void;
}

/**
 * 素材库选择组件
 */
const MaterialSection: React.FC<MaterialSectionProps> = ({
  materialName,
  materialId,
  previewUrl,
  url,
  onMaterialClick,
  onPreviewClick,
  onMaterialSelect
}) => {
  // 是否显示素材选择弹窗
  const [showModal, setShowModal] = useState<boolean>(false);

  /**
   * 处理素材点击事件
   */
  const handleMaterialClick = () => {
    if (onMaterialSelect) {
      // 如果有选择回调，显示选择弹窗
      setShowModal(true);
    } else {
      // 否则执行原有的点击回调
      onMaterialClick();
    }
  };

  /**
   * 处理素材选择事件
   */
  const handleMaterialSelect = (material: MaterialModel) => {
    if (onMaterialSelect) {
      // 确保所有必要的字段都被正确传递
      onMaterialSelect({
        name: material.name,
        materialID: material.materialID,
        previewUrl: material.previewUrl,
        url: material.url
      });
    }
    setShowModal(false);
  };

  /**
   * 关闭弹窗
   */
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <ConfigItem
        title="素材库"
        value={materialName || ""}
        onClick={handleMaterialClick}
        hasVideoPreview={true}
        previewVideoUrl={previewUrl}
        onVideoPreviewClick={onPreviewClick}
      />

      {/* 素材选择弹窗 */}
      {showModal && (
        <MaterialSelectModal
          onClose={handleCloseModal}
          onSelect={handleMaterialSelect}
          currentMaterialId={materialId}
        />
      )}
    </>
  );
};

export default MaterialSection;