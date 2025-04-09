/**
 * 文本输入区域组件
 * 负责处理用户输入的文案内容
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/TextInputSection.css';
import { SpeakerIcon } from './icons/SvgIcons';
import { titleConfig } from '../config/titleConfig';
import { toast } from '../../components/Toast';
import { VoiceInfo } from '../api/VoiceService';
import VoiceSelectModal from './voiceSelect/VoiceSelectModal';

interface TextInputSectionProps {
  text: string;
  onTextChange: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onVoiceSelect?: (voice: VoiceInfo) => void;
  selectedVoice?: VoiceInfo | null;
  defaultVoice?: VoiceInfo;
}

/**
 * 文本输入区域组件
 */
const TextInputSection: React.FC<TextInputSectionProps> = ({
  text,
  onTextChange,
  disabled = false,
  placeholder = '请输入需要配音的文字，精彩文案由你创作...',
  onVoiceSelect,
  selectedVoice,
  defaultVoice
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  // 从配置文件获取最大行数
  const maxRows = titleConfig.textareaMaxRows || 12;

  /**
   * 处理文本变化事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };

  /**
   * 自动调整文本区域高度
   */
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // 重置高度以获取正确的scrollHeight
    textarea.style.height = 'auto';
    
    // 计算内容的实际高度
    const scrollHeight = textarea.scrollHeight;
    
    // 计算单行高度（以像素为单位）
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    
    // 计算最大高度（以像素为单位）
    const maxHeight = lineHeight * maxRows;
    
    // 如果内容高度超过最大高度，则使用最大高度并允许滚动
    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    } else {
      // 否则，使用实际内容高度并禁用滚动
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    }
  };

  /**
   * 当文本内容变化时，调整文本区域高度
   */
  useEffect(() => {
    adjustTextareaHeight();
  }, [text, maxRows]);

  /**
   * 处理喇叭点击事件
   */
  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('喇叭被点击');
    toast.info('语音功能待实现');
  };

  /**
   * 处理说话人按钮点击事件
   */
  const handleSpeakerButtonClick = () => {
    setShowVoiceModal(true);
  };

  /**
   * 组件初始化时，调整文本区域高度
   */
  useEffect(() => {
    // 初始化时调整高度
    adjustTextareaHeight();
    
    // 添加窗口调整大小事件监听器，调整高度
    window.addEventListener('resize', adjustTextareaHeight);
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', adjustTextareaHeight);
    };
  }, []);

  const handleVoiceModalClose = () => {
    setShowVoiceModal(false);
  };

  /**
   * 处理音色选择
   */
  const handleVoiceSelect = (selectedVoice: VoiceInfo | null) => {
    if (selectedVoice && onVoiceSelect) {
      onVoiceSelect(selectedVoice);
      toast.success(`已选择音色: ${selectedVoice.voicer}`);
    }
    setShowVoiceModal(false);
  };

  return (
    <>
      <div className="text-input-section" ref={inputSectionRef}>
        <textarea
          ref={textareaRef}
          className="text-input"
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          style={{ resize: 'none' }}
          disabled={disabled}
        />
        
        <div className="input-controls">
          {/* 说话人按钮 */}
          <div className="speaker-button" onClick={handleSpeakerButtonClick}>
            <span className="speaker-name">{selectedVoice ? selectedVoice.voicer : '选择音色'}</span>
          </div>
          
          {/* 喇叭图标 */}
          <div className="speaker-icon" onClick={handleSpeakerClick}>
            <SpeakerIcon />
          </div>
        </div>
      </div>
      
      <VoiceSelectModal 
        show={showVoiceModal}
        onClose={handleVoiceModalClose}
        onSelect={handleVoiceSelect}
        initialSelectedVoiceId={selectedVoice?.voiceCode}
        defaultVoice={defaultVoice}
      />
    </>
  );
};

export default TextInputSection; 