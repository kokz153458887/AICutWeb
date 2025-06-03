/**
 * 解析加载中对话框组件
 * 在视频解析过程中显示等待状态
 */
import React from 'react';
import './styles.css';

interface ParseLoadingDialogProps {
  visible: boolean;
  onCancel?: () => void;
}

/**
 * 解析加载中对话框组件
 * 提供解析中的反馈和取消功能
 */
const ParseLoadingDialog: React.FC<ParseLoadingDialogProps> = ({
  visible,
  onCancel
}) => {
  if (!visible) return null;

  return (
    <div className="parse-loading-overlay">
      <div className="parse-loading-dialog">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div className="loading-text">视频解析中...</div>
          <div className="loading-subtitle">请稍等，这可能需要一些时间</div>
        </div>
        {onCancel && (
          <div className="loading-actions">
            <button className="cancel-button" onClick={onCancel}>
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParseLoadingDialog; 