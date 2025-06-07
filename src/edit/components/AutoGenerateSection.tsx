/**
 * 自动生成文案区域组件
 * 负责提供自动生成生活小妙招文案的功能
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/AutoGenerateSection.css';
import { toast } from '../../components/Toast';
import { EditService } from '../api/service';
import { AutoGenerateTextRequest } from '../api/types';
import { DropdownArrowIcon } from './icons/SvgIcons';
import { TEXT_TYPE_CONFIG, getTypeAndSubType } from '../config/textTypeConfig';

// AI模型配置
const AI_MODELS = [
  { value: 'qwen-turbo', label: 'Qwen Turbo' },
  { value: 'qwen-plus', label: 'Qwen Plus' },
  { value: 'deepseek-r1', label: 'DeepSeek R1' },
  { value: 'deepseek-v3', label: 'DeepSeek V3' },
  { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill Llama 70B' },
  { value: 'llama3.3-70b-instruct', label: 'Llama3.3 70B Instruct' }
];

interface AutoGenerateSectionProps {
  onTextGenerated: (text: string) => void;
  defaultTextType?: string;
  onTextTypeChange?: (textType: string) => void;
  currentText?: string; // 当前文本内容，用于AI补齐
  materialId?: string; // 素材ID
  onTextResetCursor?: () => void; // 重置文本光标回调
  onProcessSelectedLine?: () => { processedText: string; selectedLineIndex: number } | null; // 处理选中行回调
  onSelectLineByIndex?: (lineIndex: number) => void; // 选择指定行回调
}

/**
 * 自动生成文案区域组件
 */
const AutoGenerateSection: React.FC<AutoGenerateSectionProps> = ({
  onTextGenerated,
  defaultTextType,
  onTextTypeChange,
  currentText = '',
  materialId = '',
  onTextResetCursor,
  onProcessSelectedLine,
  onSelectLineByIndex
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(() => {
    // 在初始化时就确定默认值，避免后续的useEffect循环
    return defaultTextType || 'lifehacks_text';
  });
  const [selectedAiModel, setSelectedAiModel] = useState<string>('qwen-turbo');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAiModelDropdown, setShowAiModelDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const aiModelDropdownRef = useRef<HTMLDivElement>(null);

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
      if (aiModelDropdownRef.current && !aiModelDropdownRef.current.contains(event.target as Node)) {
        setShowAiModelDropdown(false);
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
   * 获取当前选中AI模型的标签
   */
  const getSelectedAiModelLabel = () => {
    const aiModel = AI_MODELS.find(m => m.value === selectedAiModel);
    return aiModel ? aiModel.label : '选择模型';
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
   * 处理AI模型选择
   */
  const handleAiModelSelect = (model: string) => {
    setSelectedAiModel(model);
    setShowAiModelDropdown(false);
  };

  /**
   * 处理AI生成按钮点击事件
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
        allow_used: false,
        ai_model: selectedAiModel,
        materialId: materialId
      };

      console.log('开始AI生成文本，参数:', params);
      const response = await EditService.autoGenerateText(params);
      
      if (response.code === 0 && response.data && response.data.text && response.data.text.length > 0) {
        const generatedText = response.data.text[0].text_content;
        console.log('AI生成文本成功:', generatedText);
        
        onTextGenerated(generatedText);
        
        // 重置文本光标到顶部
        if (onTextResetCursor) {
          onTextResetCursor();
        }
        
        toast.success('文案生成成功！');
      } else {
        throw new Error(response.message || '生成失败');
      }
    } catch (error) {
      console.error('AI生成文本失败:', error);
      toast.error('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 处理AI补齐按钮点击事件
   */
  const handleAiRewriteClick = async () => {
    if (isRewriting || !selectedType) {
      if (!selectedType) {
        toast.error('请先选择文案类型');
        return;
      }
      return;
    }

    // 处理选中的行
    let processedTextForRewrite = currentText;
    let selectedLineIndex = -1;
    
    if (onProcessSelectedLine) {
      const result = onProcessSelectedLine();
      if (result) {
        processedTextForRewrite = result.processedText;
        selectedLineIndex = result.selectedLineIndex;
        console.log('处理选中行，删除标签后内容:', result);
        
        // 先更新文本到处理后的状态
        onTextGenerated(processedTextForRewrite);
      } else {
        // 如果没有选中文本，检查是否有文本内容
        if (!currentText.trim()) {
          toast.error('请先选中需要补齐的文案行或输入文本');
          return;
        }
      }
    }

    try {
      setIsRewriting(true);
      
      // 根据选择的类型获取type和subType
      const { type, subType } = getTypeAndSubType(selectedType);
      
      const params: AutoGenerateTextRequest = {
        type: type,
        subType: subType,
        generate_size: 1,
        allow_used: false,
        ai_model: selectedAiModel,
        rewrite_text: processedTextForRewrite,
        materialId: materialId
      };

      console.log('开始AI补齐文本，参数:', params);
      const response = await EditService.autoGenerateText(params);
      
      if (response.code === 0 && response.data && response.data.text && response.data.text.length > 0) {
        const rewrittenText = response.data.text[0].text_content;
        console.log('AI补齐文本成功:', rewrittenText);
        
        onTextGenerated(rewrittenText);
        
        // 如果处理了选中行，则自动选择新生成的该行
        if (selectedLineIndex >= 0 && onSelectLineByIndex) {
          setTimeout(() => {
            onSelectLineByIndex(selectedLineIndex);
          }, 100); // 延迟一点确保文本已更新
        }
        
        toast.success('文案补齐成功！');
      } else {
        throw new Error(response.message || '补齐失败');
      }
    } catch (error) {
      console.error('AI补齐文本失败:', error);
      toast.error('补齐失败，请重试');
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="auto-generate-section">
      <div className="auto-generate-container">
        {/* AI模型选择器 */}
        <div className="ai-model-selector" ref={aiModelDropdownRef}>
          <span 
            className="ai-model-label"
            onClick={() => setShowAiModelDropdown(!showAiModelDropdown)}
          >
            {getSelectedAiModelLabel()}
            <DropdownArrowIcon width={8} height={8} />
          </span>
          
          {/* AI模型下拉选项 */}
          {showAiModelDropdown && (
            <div className="dropdown-menu ai-model-dropdown">
              {AI_MODELS.map((model) => (
                <div
                  key={model.value}
                  className={`dropdown-item ${selectedAiModel === model.value ? 'selected' : ''}`}
                  onClick={() => handleAiModelSelect(model.value)}
                >
                  {model.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 类型选择和AI生成按钮 */}
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

          {/* AI生成按钮文字 */}
          <span className="auto-generate-text">
            {isGenerating ? (
              <>
                <div className="auto-generate-spinner"></div>
                生成中
              </>
            ) : (
              'AI生成'
            )}
          </span>
        </button>

        {/* AI补齐按钮 */}
        <button 
          className={`ai-rewrite-btn ${isRewriting ? 'loading' : ''} ${!selectedType ? 'disabled' : ''}`}
          onClick={handleAiRewriteClick}
          disabled={isRewriting || !selectedType}
        >
          <span className="ai-rewrite-text">
            {isRewriting ? (
              <>
                <div className="auto-generate-spinner"></div>
                补齐中
              </>
            ) : (
              'AI补齐'
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AutoGenerateSection; 