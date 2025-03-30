import React, { useState } from 'react';
import ConfigItem from './ConfigItem';
import { StyleSelectModal } from './styleSelect';
import { StyleModel } from '../api/types';

interface VideoStyleSectionProps {
  styleName: string;
  stylePreviewUrl: string;
  onStyleClick: () => void;
  onVideoPreviewClick: () => void;
  onStyleSelect?: (style: StyleModel) => void;
  styleId?: string;
}

/**
 * 视频风格选择组件
 * 负责展示和选择视频风格，包含视频预览功能
 */
const VideoStyleSection: React.FC<VideoStyleSectionProps> = ({
  styleName,
  stylePreviewUrl,
  onStyleClick,
  onVideoPreviewClick,
  onStyleSelect,
  styleId
}) => {
  // 是否显示视频风格选择弹窗
  const [showModal, setShowModal] = useState<boolean>(false);

  /**
   * 处理视频风格点击事件
   */
  const handleStyleClick = () => {
    if (onStyleSelect) {
      // 如果有选择回调，显示选择弹窗
      setShowModal(true);
    } else {
      // 否则执行原有的点击回调
      onStyleClick();
    }
  };

  /**
   * 处理视频风格选择事件
   */
  const handleStyleSelect = (style: StyleModel) => {
    if (onStyleSelect) {
      onStyleSelect(style);
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
        title="视频风格"
        value={styleName || ""}
        onClick={handleStyleClick}
        hasVideoPreview={true}
        previewVideoUrl={stylePreviewUrl}
        onVideoPreviewClick={onVideoPreviewClick}
      />

      {/* 视频风格选择弹窗 */}
      {showModal && (
        <StyleSelectModal
          onClose={handleCloseModal}
          onSelect={handleStyleSelect}
          currentStyleId={styleId}
        />
      )}
    </>
  );
};

export default VideoStyleSection; 