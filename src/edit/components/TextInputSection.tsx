/**
 * 文本输入区域组件
 * 负责处理用户输入的文案内容
 */
import React, { useState, useRef, useEffect } from 'react';
import '../styles/TextInputSection.css';
import { SpeakerIcon, LoadingIcon, ClearTextIcon, DropdownArrowIcon } from './icons/SvgIcons';
import { titleConfig } from '../config/titleConfig';
import { toast } from '../../components/Toast';
import { VoiceInfo } from '../api/VoiceService';
import { VoiceService } from '../api/VoiceService';
import VoiceSelectModal from './voiceSelect/VoiceSelectModal';
import AudioPlayer from '../utils/AudioPlayer';
import AudioCacheManager from '../utils/AudioCacheManager';
import { getApiBaseUrl } from '../../config/api';
import { EditService } from '../api/service';
import { AutoGenerateTextRequest, SplitModel } from '../api/types';

interface TextInputSectionProps {
  text: string;
  onTextChange: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  voiceVolume?: number;
  onVoiceVolumeChange?: (volume: number) => void;
  onVoiceSelect?: (voice: VoiceInfo) => void;
  selectedVoice?: VoiceInfo | null;
  defaultVoice?: VoiceInfo;
  splitModel?: SplitModel;
  onSplitModelChange?: (splitModel: SplitModel) => void;
  onClearText?: () => void;
}

/**
 * 文本输入区域组件
 */
// 分句模式选项
const SPLIT_MODE_OPTIONS = [
  { value: 'strict', label: '标点' },
  { value: 'smart', label: '智能' }
];

const TextInputSection: React.FC<TextInputSectionProps> = ({
  text,
  onTextChange,
  disabled = false,
  placeholder = '请输入需要配音的文字，精彩文案由你创作...',
  voiceVolume = 1, // 默认为1 (100%)
  onVoiceVolumeChange,
  onVoiceSelect,
  selectedVoice,
  defaultVoice,
  splitModel = { splitType: 'strict', splitParams: { min_length: 20, max_length: 30 } },
  onSplitModelChange,
  onClearText
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [inputSectionPosition, setInputSectionPosition] = useState({ top: 0, left: 0, width: 0 });
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const currentPlayingUrl = useRef<string | null>(null);
  const [showSplitDropdown, setShowSplitDropdown] = useState(false);
  const splitDropdownRef = useRef<HTMLDivElement>(null);
  
  // 从配置文件获取最大行数
  const maxRows = titleConfig.textareaMaxRows || 12;

  // 组件加载时清理过期缓存
  useEffect(() => {
    AudioCacheManager.cleanExpiredCache();
  }, []);

  /**
   * 处理文本变化事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };

  /**
   * 处理清空文本按钮点击事件
   */
  const handleClearText = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClearText) {
      onClearText();
    }
  };

  /**
   * 处理分句模式选择
   */
  const handleSplitModeSelect = (splitType: string) => {
    if (onSplitModelChange) {
      onSplitModelChange({
        ...splitModel,
        splitType
      });
    }
    setShowSplitDropdown(false);
  };

  /**
   * 获取当前分句模式标签
   */
  const getCurrentSplitModeLabel = () => {
    const option = SPLIT_MODE_OPTIONS.find(opt => opt.value === splitModel.splitType);
    return option ? option.label : '分句';
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
  const handleSpeakerClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('喇叭被点击');

    if (!selectedVoice) {
      toast.error('请先选择音色');
      return;
    }

    if (!text.trim()) {
      toast.error('请输入要试听的文本');
      return;
    }

    if (isGenerating) {
      toast.info('试听音频生成中，请稍后');
      return;
    }

    try {
      // 构建语音参数
      const voiceParams = {
        voice_code: selectedVoice.voiceCode,
        voice_name: selectedVoice.voiceName || selectedVoice.voicer,
        voice_server: selectedVoice.voiceServer,
        speed: selectedVoice.settings?.speed,
        pitch: selectedVoice.settings?.pitch,
        volume: selectedVoice.settings?.volume,
        emotion: selectedVoice.settings?.emotion,
        emotion_intensity: selectedVoice.settings?.intensity
      };

      // 生成缓存key
      const cacheKey = generateCacheKey(text, voiceParams);
      const cachedAudio = AudioCacheManager.getCache(cacheKey);

      let audioPath: string;
      if (cachedAudio) {
        audioPath = cachedAudio.url;
      } else {
        setIsGenerating(true);
        console.log('生成新的音频:', cacheKey);
        try {
          const response = await VoiceService.generateVoice({
            text: text,
            ...voiceParams
          });

          // 从完整URL中提取路径部分
          audioPath = new URL(response.audio_url).pathname;

          // 缓存音频
          AudioCacheManager.setCache(cacheKey, {
            url: audioPath,
            text: text,
            voiceParams
          });
        } catch (error) {
          console.error('生成音频失败:', error);
          toast.error('生成音频失败，请重试');
          setIsGenerating(false);
          currentPlayingUrl.current = null;
          return;
        }
        setIsGenerating(false);
      }

      console.log(cacheKey);

      // 构建完整的音频URL
      const fullAudioUrl = `${getApiBaseUrl()}${audioPath}`;

      // 如果点击的是当前正在播放的音频，则停止播放
      if (currentPlayingUrl.current === fullAudioUrl) {
        console.log('停止当前音频播放');
        AudioPlayer.getInstance().stop();
        currentPlayingUrl.current = null;
        return;
      }

      // 播放新的音频，传入当前设置的音量值
      console.log('播放音频:', fullAudioUrl, '音量:', voiceVolume);
      currentPlayingUrl.current = fullAudioUrl;
      const audioPlayer = AudioPlayer.getInstance();
      audioPlayer.play(fullAudioUrl, () => {
        console.log('音频播放结束');
        currentPlayingUrl.current = null;
      }, voiceVolume); // 传入当前音量值

    } catch (error) {
      // 处理其他可能的错误
      console.error('音频处理失败:', error);
      toast.error('音频处理失败，请重试');
      // 重置所有状态
      setIsGenerating(false);
      currentPlayingUrl.current = null;
      // 停止当前可能正在播放的音频
      AudioPlayer.getInstance().stop();
    }
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
    if (e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const textInputSection = (e.currentTarget as HTMLElement).closest('.text-input-section');
      let sliderWidth = textInputSection ? textInputSection.getBoundingClientRect().width : 320;
      
      setInputSectionPosition({
        top: rect.bottom + window.scrollY + 5,
        left: textInputSection ? textInputSection.getBoundingClientRect().left : rect.left,
        width: sliderWidth
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
    if (onVoiceVolumeChange) {
      onVoiceVolumeChange(Number(e.target.value));
    }

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
   * 点击外部时隐藏音量控制条和分句下拉框
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
      if (splitDropdownRef.current && !splitDropdownRef.current.contains(event.target as Node)) {
        setShowSplitDropdown(false);
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
   * 组件卸载时清除定时器和停止音频播放
   */
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
      // 停止正在播放的音频
      AudioPlayer.getInstance().stop();
      currentPlayingUrl.current = null;
    };
  }, []);

  /**
   * 处理音量滑动条点击事件，防止事件穿透
   */
  const handleVolumeSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  /**
   * 处理滑块触摸移动事件，阻止页面滚动
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
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

  /**
   * 生成缓存key
   */
  const generateCacheKey = (text: string, voiceParams: any): string => {
    const params = {
      text,
      voice_code: voiceParams.voice_code,
      voice_name: voiceParams.voice_name,
      voice_server: voiceParams.voice_server,
      speed: voiceParams.speed,
      pitch: voiceParams.pitch,
      volume: voiceParams.volume,
      emotion: voiceParams.emotion,
      emotion_intensity: voiceParams.emotion_intensity
    };
    return JSON.stringify(params);
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
          {/* 左侧控制按钮组 */}
          <div className="left-controls">
            {/* 清空文本按钮 */}
            <div className="clear-text-btn" onClick={handleClearText} title="清空文本">
              <ClearTextIcon width={14} height={14} />
            </div>

            {/* 分句模式按钮 */}
            <div className="split-mode-container" ref={splitDropdownRef}>
              <div 
                className="split-mode-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSplitDropdown(!showSplitDropdown);
                }}
                title="选择分句模式"
              >
                <span className="split-mode-text">{getCurrentSplitModeLabel()}</span>
                <DropdownArrowIcon width={10} height={10} />
              </div>
              
              {/* 分句模式下拉菜单 */}
              {showSplitDropdown && (
                <div className="split-mode-dropdown">
                  {SPLIT_MODE_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`split-mode-item ${splitModel.splitType === option.value ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSplitModeSelect(option.value);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧控制按钮组 */}
          <div className="right-controls">
            {/* 音量文字按钮 - 显示当前音量值 */}
            <div className="volume-text" onClick={handleVolumeTextClick}>
              音量 <span className="volume-badge">{getDisplayVolume()}%</span>
            </div>

            {/* 说话人按钮 */}
            <div className="speaker-button" onClick={handleSpeakerButtonClick}>
              <span className="speaker-name">{selectedVoice ? selectedVoice.voicer : '选择音色'}</span>
            </div>
            
            {/* 喇叭图标 */}
            <div className={`speaker-icon ${isGenerating ? 'loading' : ''}`} onClick={handleSpeakerClick}>
              {isGenerating ? <LoadingIcon /> : <SpeakerIcon />}
            </div>
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
                max={5}
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
        initialSelectedVoiceId={selectedVoice?.voiceCode}
        defaultVoice={defaultVoice}
      />
    </>
  );
};

export default TextInputSection; 