/**
 * 时间偏移设置浮层组件
 * 用于设置文本剪切时的时间修正偏移量
 */
import React, { useState, useEffect } from 'react';
import './styles.css';

interface TimeOffsetModalProps {
  visible: boolean;
  initialOffset: number;
  onClose: () => void;
  onConfirm: (offset: number) => void;
}

/**
 * 时间偏移设置浮层组件
 * 提供时间偏移量的输入和调整功能
 */
const TimeOffsetModal: React.FC<TimeOffsetModalProps> = ({
  visible,
  initialOffset,
  onClose,
  onConfirm
}) => {
  const [offset, setOffset] = useState<number>(initialOffset);
  const [inputValue, setInputValue] = useState<string>(initialOffset.toString());

  useEffect(() => {
    if (visible) {
      setOffset(initialOffset);
      setInputValue(initialOffset.toString());
    }
  }, [visible, initialOffset]);

  /**
   * 处理输入值变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 实时更新数值，格式0.1，取小数点后一位
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setOffset(numValue);
    }
  };

  /**
   * 处理输入框失焦
   */
  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0 || numValue > 10) {
      // 如果输入无效，恢复到当前offset值
      const offsetStr = offset.toFixed(1);
      setInputValue(offsetStr);
    } else {
      // 如果输入有效，更新offset值，小数点后一位
      const newOffset = numValue.toFixed(1);
      setOffset(parseFloat(newOffset));
    }
  };

  /**
   * 处理步长调整
   */
  const handleStepAdjust = (delta: number) => {
    // 取小数点后一位
    const newOffset = Math.max(0, Math.min(10, offset + delta));
    const newOffsetStr = newOffset.toFixed(1);
    setOffset(parseFloat(newOffsetStr));
    setInputValue(newOffsetStr);
  };

  /**
   * 处理确认
   */
  const handleConfirm = () => {
    onConfirm(offset);
  };

  /**
   * 处理取消
   */
  const handleCancel = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="time-offset-modal">
      <div className="time-offset-modal-overlay" onClick={handleCancel}></div>
      <div className="time-offset-modal-content">
        <div className="time-offset-modal-header">
          <h3 className="time-offset-modal-title">时间修正设置</h3>
          <div className="time-offset-modal-close" onClick={handleCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <div className="time-offset-modal-body">
          <div className="time-offset-description">
            文本剪切时，新切片的开始时间向后偏移，结束时间向前偏移，以避免切片边界处的内容丢失。
          </div>
          
          <div className="time-offset-input-group">
            <label className="time-offset-label">偏移时间（秒）</label>
            <div className="time-offset-input-wrapper">
              <button 
                className="time-offset-step-btn"
                onClick={() => handleStepAdjust(-0.1)}
                disabled={offset <= 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <input
                type="number"
                className="time-offset-input"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                min="0"
                max="10"
                step="0.1"
                placeholder="0.3"
              />
              
              <button 
                className="time-offset-step-btn"
                onClick={() => handleStepAdjust(0.1)}
                disabled={offset >= 10}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="time-offset-unit">秒</div>
          </div>

          <div className="time-offset-preview">
            <div className="time-offset-preview-item">
              <span className="time-offset-preview-label">开始时间：</span>
              <span className="time-offset-preview-value">向后偏移 {offset.toFixed(1)} 秒</span>
            </div>
            <div className="time-offset-preview-item">
              <span className="time-offset-preview-label">结束时间：</span>
              <span className="time-offset-preview-value">向前偏移 {offset.toFixed(1)} 秒</span>
            </div>
          </div>
        </div>
        
        <div className="time-offset-modal-footer">
          <button className="time-offset-btn time-offset-btn-cancel" onClick={handleCancel}>
            取消
          </button>
          <button className="time-offset-btn time-offset-btn-confirm" onClick={handleConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeOffsetModal; 