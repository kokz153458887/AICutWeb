/**
 * 文本输入区域组件
 * 负责处理用户输入的文案内容
 */
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
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
import { SplitModel } from '../api/types';
import AutoSuggestionOverlay from './AutoSuggestionOverlay';
import { MaterialService, SuggestionItem } from '../services/MaterialService';

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
  materialUrl?: string; // 材料URL，用于自动联想
}

/**
 * TextInputSection组件实例方法接口
 */
export interface TextInputSectionRef {
  resetCursor: () => void; // 重置光标到顶部
  processSelectedLineForRewrite: () => { processedText: string; selectedLineIndex: number } | null; // 处理选中行用于AI补齐
  selectLineByIndex: (lineIndex: number) => void; // 选择指定行
}

/**
 * 文本输入区域组件
 */
// 分句模式选项
const SPLIT_MODE_OPTIONS = [
  { value: 'strict', label: '标点' },
  { value: 'smart', label: '智能' }
];

const TextInputSection = forwardRef<TextInputSectionRef, TextInputSectionProps>(({
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
  onClearText,
  materialUrl = ''
}, ref) => {
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
  
  // 自动联想相关状态
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0, width: 0 });
  const [currentTagInfo, setCurrentTagInfo] = useState<{
    type: 'directory' | 'file' | null;
    startPos: number;
    endPos: number;
    input: string;
  }>({ type: null, startPos: 0, endPos: 0, input: '' });
  
  // 从配置文件获取最大行数
  const maxRows = titleConfig.textareaMaxRows || 12;

  // 暴露重置光标方法给父组件
  useImperativeHandle(ref, () => ({
    resetCursor: () => {
      const textarea = textareaRef.current;
      if (textarea) {
        // 重置滚动位置到顶部
        textarea.scrollTop = 0;
        // 设置光标位置到文本开头
        textarea.setSelectionRange(0, 0);
        // 聚焦到文本框
        textarea.focus();
        console.log('文本光标已重置到顶部');
      }
    },
    processSelectedLineForRewrite: () => {
      const textarea = textareaRef.current;
      if (!textarea) return null;

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      
      // 如果没有选中文本，返回null
      if (selectionStart === selectionEnd) {
        return null;
      }

      const lines = text.split('\n');
      let currentPos = 0;
      let selectedLineIndex = -1;

      // 找到选中文本所在的行
      for (let i = 0; i < lines.length; i++) {
        const lineStart = currentPos;
        const lineEnd = currentPos + lines[i].length;
        
        // 检查选中区域是否与当前行有重叠
        if (selectionStart <= lineEnd && selectionEnd >= lineStart) {
          selectedLineIndex = i;
          break;
        }
        
        currentPos = lineEnd + 1; // +1 for newline character
      }

      if (selectedLineIndex === -1) return null;

      // 处理选中行，保留标签，删除标签后的内容
      const selectedLine = lines[selectedLineIndex];
      const tagMatch = selectedLine.match(/^(\[[%@][^\]]*\])/);
      
      if (tagMatch) {
        // 如果有标签，保留标签，删除后面的内容
        const processedLine = tagMatch[1];
        const newLines = [...lines];
        newLines[selectedLineIndex] = processedLine;
        const processedText = newLines.join('\n');
        
        return {
          processedText,
          selectedLineIndex
        };
      } else {
        // 如果没有标签，直接清空这一行
        const newLines = [...lines];
        newLines[selectedLineIndex] = '';
        const processedText = newLines.join('\n');
        
        return {
          processedText,
          selectedLineIndex
        };
      }
    },
    selectLineByIndex: (lineIndex: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const lines = text.split('\n');
      if (lineIndex < 0 || lineIndex >= lines.length) return;

      let currentPos = 0;
      for (let i = 0; i < lineIndex; i++) {
        currentPos += lines[i].length + 1; // +1 for newline
      }

      const lineStart = currentPos;
      const lineEnd = currentPos + lines[lineIndex].length;

      // 选中整行
      textarea.setSelectionRange(lineStart, lineEnd);
      textarea.focus();
      
      console.log(`已选中第${lineIndex + 1}行文本`);
    }
  }), [text]);

  // 组件加载时清理过期缓存
  useEffect(() => {
    AudioCacheManager.cleanExpiredCache();
  }, []);

  // 加载材料数据
  useEffect(() => {
    const loadMaterialData = async () => {
      if (materialUrl) {
        try {
          console.log('开始加载材料数据:', materialUrl);
          // 当materialUrl变化时，重新加载数据（不检查hasData）
          await MaterialService.fetchMaterialData(materialUrl);
          console.log('材料数据加载完成');
        } catch (error) {
          console.error('加载材料数据失败:', error);
        }
      }
    };
    
    loadMaterialData();
  }, [materialUrl]);

  /**
   * 检测标签输入并触发自动联想
   */
  const detectTagInput = (text: string, cursorPos: number) => {
    // 检查光标前的文字，寻找 [%...] 或 [@...] 模式
    const beforeCursor = text.substring(0, cursorPos);
    const afterCursor = text.substring(cursorPos);
    
    // 查找最近的 [% 或 [@
    const directoryMatch = beforeCursor.match(/\[%([^\]]*)$/);
    const fileMatch = beforeCursor.match(/\[@([^\]]*)$/);
    
    // 检查光标是否在标签内（光标后面是否有对应的 ] 符号）
    const isInCompleteTag = (tagType: 'directory' | 'file') => {
      const tagStart = tagType === 'directory' ? '[%' : '[@';
      const tagStartIndex = beforeCursor.lastIndexOf(tagStart);
      if (tagStartIndex === -1) return false;
      
      // 检查从标签开始到光标之间是否没有 ]
      const betweenTagAndCursor = beforeCursor.substring(tagStartIndex);
      if (betweenTagAndCursor.includes(']')) return false;
      
      // 检查光标后面是否有 ]
      const hasClosingBracket = afterCursor.indexOf(']') !== -1;
      return hasClosingBracket;
    };
    
    if (directoryMatch) {
      const input = directoryMatch[1];
      const startPos = beforeCursor.lastIndexOf('[%') + 2;
      setCurrentTagInfo({
        type: 'directory',
        startPos,
        endPos: cursorPos,
        input
      });
      
      // 获取目录建议（空输入时也显示所有目录）
      const dirSuggestions = MaterialService.getDirectorySuggestions(input);
      setSuggestions(dirSuggestions);
      
      // 只要在目录标签内就显示建议
      updateSuggestionPosition();
      setShowSuggestions(true);
      
      return true;
    } else if (fileMatch) {
      const input = fileMatch[1];
      const startPos = beforeCursor.lastIndexOf('[@') + 2;
      setCurrentTagInfo({
        type: 'file',
        startPos,
        endPos: cursorPos,
        input
      });
      
      // 获取文件建议（空输入时也显示所有文件）
      const fileSuggestions = MaterialService.getFileSuggestions(input);
      setSuggestions(fileSuggestions);
      
      // 只要在文件标签内就显示建议
      updateSuggestionPosition();
      setShowSuggestions(true);
      
      return true;
    } else {
      // 检查光标是否在完整的标签内（[%...] 或 [@...]）
      const inDirectoryTag = isInCompleteTag('directory');
      const inFileTag = isInCompleteTag('file');
      
      if (inDirectoryTag) {
        const tagStartIndex = beforeCursor.lastIndexOf('[%');
        const input = beforeCursor.substring(tagStartIndex + 2);
        const startPos = tagStartIndex + 2;
        
        setCurrentTagInfo({
          type: 'directory',
          startPos,
          endPos: cursorPos,
          input
        });
        
        const dirSuggestions = MaterialService.getDirectorySuggestions(input);
        setSuggestions(dirSuggestions);
        updateSuggestionPosition();
        setShowSuggestions(true);
        return true;
      } else if (inFileTag) {
        const tagStartIndex = beforeCursor.lastIndexOf('[@');
        const input = beforeCursor.substring(tagStartIndex + 2);
        const startPos = tagStartIndex + 2;
        
        setCurrentTagInfo({
          type: 'file',
          startPos,
          endPos: cursorPos,
          input
        });
        
        const fileSuggestions = MaterialService.getFileSuggestions(input);
        setSuggestions(fileSuggestions);
        updateSuggestionPosition();
        setShowSuggestions(true);
        return true;
      }
    }
    
    // 如果没有匹配到标签，隐藏建议
    setShowSuggestions(false);
    setCurrentTagInfo({ type: null, startPos: 0, endPos: 0, input: '' });
    return false;
  };

  /**
   * 更新建议浮层位置
   */
  const updateSuggestionPosition = () => {
    const textarea = textareaRef.current;
    const inputSection = inputSectionRef.current;
    
    if (textarea && inputSection) {
      const textareaRect = textarea.getBoundingClientRect();
      const inputSectionRect = inputSection.getBoundingClientRect();
      
      setSuggestionPosition({
        top: textareaRect.bottom + window.scrollY + 5,
        left: inputSectionRect.left + window.scrollX,
        width: inputSectionRect.width
      });
    }
  };

  /**
   * 处理建议选择
   */
  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    const textarea = textareaRef.current;
    if (!textarea || currentTagInfo.type === null) return;
    
    // 构建新文本
    const beforeTag = text.substring(0, currentTagInfo.startPos - 2); // -2 是为了包含 [% 或 [@
    const afterCursor = text.substring(currentTagInfo.endPos);
    const tagPrefix = currentTagInfo.type === 'directory' ? '[%' : '[@';
    
    // 检查是否需要添加闭合括号
    let needsCloseBracket = true;
    if (afterCursor.startsWith(']')) {
      needsCloseBracket = false;
    }
    
    const newText = needsCloseBracket 
      ? `${beforeTag}${tagPrefix}${suggestion.name}]${afterCursor}`
      : `${beforeTag}${tagPrefix}${suggestion.name}${afterCursor}`;
    
    // 更新文本
    onTextChange(newText);
    
    // 设置光标位置到标签后面
    setTimeout(() => {
      const bracketLength = needsCloseBracket ? 1 : 0;
      const newCursorPos = beforeTag.length + tagPrefix.length + suggestion.name.length + bracketLength;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
    
    // 隐藏建议
    setShowSuggestions(false);
    setCurrentTagInfo({ type: null, startPos: 0, endPos: 0, input: '' });
  };

  /**
   * 处理文本变化事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onTextChange(newText);
    
    // 检测标签输入
    setTimeout(() => {
      detectTagInput(newText, cursorPos);
    }, 0);
  };

  /**
   * 处理键盘事件
   */
  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const cursorPos = target.selectionStart;
    
    // 检测标签输入
    detectTagInput(text, cursorPos);
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

  /**
   * 处理建议浮层关闭
   */
  const handleSuggestionClose = () => {
    setShowSuggestions(false);
    setCurrentTagInfo({ type: null, startPos: 0, endPos: 0, input: '' });
  };

  return (
    <>
      <div className="text-input-section" ref={inputSectionRef}>
        <textarea
          ref={textareaRef}
          className="text-input"
          value={text}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
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

      {/* 自动联想浮层 */}
      <AutoSuggestionOverlay
        visible={showSuggestions}
        suggestions={suggestions}
        position={suggestionPosition}
        onSelect={handleSuggestionSelect}
        onClose={handleSuggestionClose}
      />
    </>
  );
});

export default TextInputSection; 