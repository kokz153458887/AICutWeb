/**
 * 底部操作按钮组件
 * 负责显示发布和下载按钮
 */
import React from 'react';
import '../styles/OperateButtons.css';

interface OperateButtonsProps {
  onPublish?: () => void;
  onDownload?: () => void;
}

/**
 * 底部操作按钮组件
 */
const OperateButtons: React.FC<OperateButtonsProps> = ({
  onPublish,
  onDownload
}) => {
  /**
   * 处理发布按钮点击
   */
  const handlePublish = () => {
    if (onPublish) {
      onPublish();
    } else {
      alert('发布功能开发中');
    }
  };

  /**
   * 处理下载按钮点击
   */
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      alert('下载功能开发中');
    }
  };

  return (
    <div className="operate-buttons">
      <button className="operate-button publish-button" onClick={handlePublish}>
        发布
      </button>
      <button className="operate-button download-button" onClick={handleDownload}>
        下载
      </button>
    </div>
  );
};

export default OperateButtons; 