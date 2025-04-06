/**
 * 文本输入区域组件
 * 负责处理用户输入的文案内容
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/TextInputSection.css';
import { SpeakerIcon } from './icons/SvgIcons';
import { titleConfig } from '../config/titleConfig';
import { toast } from '../../components/Toast';
import { VoiceInfo } from '../mock/voiceData';
import VoiceSelectModal from './voiceSelect/VoiceSelectModal';

interface TextInputSectionProps {
  text: string;
  onTextChange: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onVoiceSelect?: (voice: VoiceInfo) => void;
}

/**
 * 文本输入区域组件
 */
const TextInputSection: React.FC<TextInputSectionProps> = ({
  text,
  onTextChange,
  disabled = false,
  placeholder = '请输入需要配音的文字，精彩文案由你创作...',
  onVoiceSelect
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const [voiceVolume, setVoiceVolume] = useState<number>(0.8); // 默认音量80%
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [inputSectionPosition, setInputSectionPosition] = useState({ top: 0, left: 0, width: 0 });
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
   * 处理音量文字点击事件
   */
  const handleVolumeTextClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 获取输入区域元素的位置和宽度信息
    if (inputSectionRef.current) {
      const rect = inputSectionRef.current.getBoundingClientRect();
      setInputSectionPosition({
        top: rect.bottom + window.scrollY + 5, // 输入区域底部位置加5px间距
        left: rect.left, // 与输入区域左侧对齐
        width: rect.width // 使用输入区域的宽度
      });
    }
    
    setShowVolumeSlider(prev => !prev);
    
    // 清除之前的定时器
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
    }
  };

  /**
   * 获取显示用的音量值（百分比形式）
   */
  const getDisplayVolume = () => {
    return Math.round(voiceVolume * 100);
  };

  /**
   * 处理音量滑动条变化
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceVolume(Number(e.target.value));
    
    // 清除之前的定时器
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
    }
  };

  /**
   * 处理鼠标抬起事件，延迟隐藏音量控制条
   */
  const handleVolumeMouseUp = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 500);
  };

  /**
   * 点击外部时隐藏音量控制条
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  /**
   * 组件卸载时清除定时器
   */
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  /**
   * 处理音量滑动条点击事件，防止事件穿透
   */
  const handleVolumeSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发整个输入区域的点击
  };

  /**
   * 处理滑块触摸移动事件，阻止页面滚动
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // 阻止默认的触摸行为（页面滚动）
    e.stopPropagation();
  };

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
          {/* 音量文字按钮 - 显示当前音量值 */}
          <div className="volume-text" onClick={handleVolumeTextClick}>
            音量 <span className="volume-badge">{getDisplayVolume()}%</span>
          </div>
          
          {/* 说话人按钮 */}
          <div className="speaker-button" onClick={handleSpeakerButtonClick}>
            <span className="speaker-name">选择音色</span>
            <span className="speaker-tag">推荐</span>
          </div>
          
          {/* 喇叭图标 */}
          <div className="speaker-icon" onClick={handleSpeakerClick}>
            <SpeakerIcon />
          </div>
          
          {/* 音量滑动控制条 */}
          {showVolumeSlider && (
            <div 
              className="volume-slider-container" 
              ref={sliderRef}
              onClick={handleVolumeSliderClick}
              onTouchMove={handleTouchMove}
              style={{
                top: `${inputSectionPosition.top}px`,
                left: `${inputSectionPosition.left}px`,
                position: 'fixed',
                width: `${inputSectionPosition.width}px`
              }}
            >
              <input
                type="range"
                min={0}
                max={1}
                value={voiceVolume}
                step={0.01}
                onChange={handleVolumeChange}
                onMouseUp={handleVolumeMouseUp}
                onTouchEnd={handleVolumeMouseUp}
                onTouchMove={handleTouchMove}
                className="volume-slider"
                onClick={(e) => e.stopPropagation()}
                style={{ flex: 1 }}
              />
            </div>
          )}
        </div>
      </div>
      
      <VoiceSelectModal 
        show={showVoiceModal}
        onClose={handleVoiceModalClose}
        onSelect={handleVoiceSelect}
      />
    </>
  );
};

export default TextInputSection; 