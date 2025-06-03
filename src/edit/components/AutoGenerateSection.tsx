/**
 * 自动生成文案区域组件
 * 负责提供自动生成生活小妙招文案的功能
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/AutoGenerateSection.css';
import { toast } from '../../components/Toast';
import { EditService } from '../api/service';
import { AutoGenerateTextRequest, UnlikeTextRequest } from '../api/types';
import { DropdownArrowIcon } from './icons/SvgIcons';
import { TEXT_TYPE_CONFIG, getTypeAndSubType } from '../config/textTypeConfig';

interface AutoGenerateSectionProps {
  onTextGenerated: (text: string) => void;
  defaultTextType?: string;
  onTextTypeChange?: (textType: string) => void;
}

/**
 * 自动生成文案区域组件
 */
const AutoGenerateSection: React.FC<AutoGenerateSectionProps> = ({
  onTextGenerated,
  defaultTextType,
  onTextTypeChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(() => {
    // 在初始化时就确定默认值，避免后续的useEffect循环
    return defaultTextType || 'lifehacks_text';
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastGeneratedTextId, setLastGeneratedTextId] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 当defaultTextType变化时更新selectedType（仅在值真正不同时）
  useEffect(() => {
    if (defaultTextType && defaultTextType !== selectedType) {
      setSelectedType(defaultTextType);
    }
  }, [defaultTextType]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * 获取当前选中类型的标签
   */
  const getSelectedTypeLabel = () => {
    const type = TEXT_TYPE_CONFIG.find(t => t.value === selectedType);
    return type ? type.label : '选择类型';
  };

  /**
   * 处理类型选择
   */
  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setShowDropdown(false);
    
    // 通知父组件更新preferences
    if (onTextTypeChange) {
      onTextTypeChange(type);
    }
  };

  /**
   * 处理自动生成按钮点击事件
   */
  const handleAutoGenerateClick = async () => {
    if (isGenerating || !selectedType) {
      if (!selectedType) {
        toast.error('请先选择文案类型');
      }
      return;
    }

    try {
      setIsGenerating(true);
      
      // 根据选择的类型获取type和subType
      const { type, subType } = getTypeAndSubType(selectedType);
      
      const params: AutoGenerateTextRequest = {
        type: type,
        subType: subType,
        generate_size: 1,
        allow_used: false
      };

      console.log('开始自动生成文本，参数:', params);
      const response = await EditService.autoGenerateText(params);
      
      if (response.code === 0 && response.data && response.data.text && response.data.text.length > 0) {
        const generatedText = response.data.text[0].text_content;
        const textId = response.data.text[0].text_id;
        console.log('自动生成文本成功:', generatedText);
        
        setLastGeneratedTextId(textId);
        onTextGenerated(generatedText);
        toast.success('文案生成成功！');
      } else {
        throw new Error(response.message || '生成失败');
      }
    } catch (error) {
      console.error('自动生成文本失败:', error);
      toast.error('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 处理不喜欢按钮点击事件
   */
  const handleDislikeClick = async () => {
    if (!lastGeneratedTextId || !selectedType) {
      toast.error('没有可标记的文案');
      return;
    }

    try {
      // 根据选择的类型获取type和subType
      const { type, subType } = getTypeAndSubType(selectedType);
      
      const params: UnlikeTextRequest = {
        type: type,
        subType: subType,
        text_id: lastGeneratedTextId
      };

      console.log('标记文案为不喜欢，参数:', params);
      const response = await EditService.unlikeText(params);
      
      if (response.code === 0) {
        toast.success('已标记为不喜欢');
        setLastGeneratedTextId(''); // 清除已标记的文案ID
      } else {
        throw new Error(response.message || '标记失败');
      }
    } catch (error) {
      console.error('标记不喜欢失败:', error);
      toast.error('标记失败，请重试');
    }
  };

  return (
    <div className="auto-generate-section">
      <div className="auto-generate-container">
       

        {/* 类型选择和生成按钮 */}
        <button 
          className={`auto-generate-btn ${isGenerating ? 'loading' : ''} ${!selectedType ? 'disabled' : ''}`}
          onClick={handleAutoGenerateClick}
          disabled={isGenerating || !selectedType}
        >
          {/* 类型选择标签 */}
          <div className="type-selector" ref={dropdownRef}>
            <span 
              className="auto-generate-label"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              {getSelectedTypeLabel()}
              <DropdownArrowIcon width={8} height={8} />
            </span>
            
            {/* 下拉选项 */}
            {showDropdown && (
              <div className="dropdown-menu">
                {TEXT_TYPE_CONFIG.map((type) => (
                  <div
                    key={type.value}
                    className={`dropdown-item ${selectedType === type.value ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeSelect(type.value);
                    }}
                  >
                    {type.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 生成按钮文字 */}
          <span className="auto-generate-text">
            {isGenerating ? (
              <>
                <div className="auto-generate-spinner"></div>
                生成中
              </>
            ) : (
              '自动生成'
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AutoGenerateSection; 