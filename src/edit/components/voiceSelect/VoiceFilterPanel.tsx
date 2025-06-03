/**
 * 音色筛选面板组件
 * 负责音色的性别和年龄筛选
 */
import React, { useState, useCallback } from 'react';
import { CloseIcon } from '../icons/SvgIcons';
import '../../styles/VoiceFilterPanel.css';

interface VoiceFilterPanelProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (filters: { gender?: string; age?: string }) => void;
  initialFilters?: {
    gender?: string;
    age?: string;
  };
}

// 性别选项映射
const GENDER_OPTIONS = [
  { value: undefined, label: '全部' },
  { value: '男', label: '男性' },
  { value: '女', label: '女性' },
  { value: '未知', label: '未知' }
] as const;

// 年龄选项映射
const AGE_OPTIONS = [
  { value: undefined, label: '全部' },
  { value: '成年', label: '成年' },
  { value: '儿童', label: '儿童' }
] as const;

/**
 * 音色筛选面板组件
 */
const VoiceFilterPanel: React.FC<VoiceFilterPanelProps> = ({
  show,
  onClose,
  onConfirm,
  initialFilters = {}
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | undefined>(initialFilters.gender);
  const [selectedAge, setSelectedAge] = useState<string | undefined>(initialFilters.age);

  // 处理关闭
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  // 处理确认
  const handleConfirm = useCallback(() => {
    const filters = {
      gender: selectedGender,
      age: selectedAge
    };
    console.log('确认筛选条件:', filters);
    onConfirm(filters);
  }, [selectedGender, selectedAge, onConfirm]);

  // 处理取消
  const handleCancel = useCallback(() => {
    console.log('取消筛选');
    handleClose();
  }, [handleClose]);

  if (!show) {
    return null;
  }

  return (
    <div className="voice-filter-backdrop" onClick={handleClose}>
      <div 
        className={`voice-filter-panel ${show ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="voice-filter-header">
          <div className="voice-filter-title">筛选音色</div>
          <div className="voice-filter-close" onClick={handleClose}>
            <CloseIcon width={20} height={20} />
          </div>
        </div>

        {/* 内容区 */}
        <div className="voice-filter-content">
          {/* 性别筛选 */}
          <div className="voice-filter-section">
            <div className="voice-filter-section-title">性别</div>
            <div className="voice-filter-options">
              {GENDER_OPTIONS.map(option => (
                <div 
                  key={option.label}
                  className={`voice-filter-option ${selectedGender === option.value ? 'active' : ''}`}
                  onClick={() => setSelectedGender(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          {/* 年龄筛选 */}
          <div className="voice-filter-section">
            <div className="voice-filter-section-title">年龄</div>
            <div className="voice-filter-options">
              {AGE_OPTIONS.map(option => (
                <div 
                  key={option.label}
                  className={`voice-filter-option ${selectedAge === option.value ? 'active' : ''}`}
                  onClick={() => setSelectedAge(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="voice-filter-footer">
          <div className="voice-filter-footer-buttons">
            <button className="voice-filter-cancel" onClick={handleCancel}>
              取消
            </button>
            <button className="voice-filter-confirm" onClick={handleConfirm}>
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceFilterPanel; 