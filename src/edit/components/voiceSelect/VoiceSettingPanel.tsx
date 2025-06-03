/**
 * 音色参数调整面板组件
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, PlayIcon } from '../icons/SvgIcons';
import { VoiceService, VoiceGenerateParams, VoiceInfo } from '../../api/VoiceService';
import '../../styles/VoiceSettingPanel.css';
import AudioPlayer from '../../utils/AudioPlayer';

// 全局音频缓存 Map，用于存储不同参数组合对应的音频 URL
// 键为参数组合的字符串表示，值为音频 URL
const audioCacheMap = new Map<string, string>();

// 生成缓存键
const generateCacheKey = (params: {
  voice_name: string;
  voice_server: string;
  text: string;
  speed: number;
  volume: number;
  pitch: number;
  emotion?: string;
  emotion_intensity: number;
}): string => {
  return JSON.stringify({
    voice_name: params.voice_name,
    voice_server: params.voice_server,
    text: params.text,
    speed: params.speed,
    volume: params.volume,
    pitch: params.pitch,
    emotion: params.emotion,
    emotion_intensity: params.emotion_intensity
  });
};

interface VoiceSettingPanelProps {
  voice: VoiceInfo;
  onClose: () => void;
  onSettingsChange: (voiceCode: string, settings: { 
    speed: number; 
    pitch: number; 
    intensity: number;
    volume: number;
    emotion?: string;
  }) => void;
}

/**
 * 音色参数调整面板组件
 */
const VoiceSettingPanel: React.FC<VoiceSettingPanelProps> = ({
  voice,
  onClose,
  onSettingsChange
}) => {
  // 状态管理
  const [settings, setSettings] = useState({
    speed: 0,
    pitch: 0,
    intensity: 0,
    volume: voice.settings?.volume !== undefined ? voice.settings.volume : 5.0,
    emotion: voice.settings?.emotion || undefined
  });
  const [isClosing, setIsClosing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 加载初始设置
  useEffect(() => {
    if (voice.settings) {
      setSettings({
        speed: voice.settings.speed ?? 0,
        pitch: voice.settings.pitch ?? 0,
        intensity: voice.settings.intensity ?? 0,
        volume: voice.settings.volume !== undefined ? voice.settings.volume : 5.0,
        emotion: voice.settings.emotion || undefined
      });
    }
  }, [voice]);

  // 处理关闭
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // 处理参数变化
  const handleSettingChange = useCallback((param: 'speed' | 'pitch' | 'intensity' | 'volume', value: number) => {
    const newSettings = {
      ...settings,
      [param]: value
    };
    setSettings(newSettings);
    console.log('音色参数更新:', {
      voiceCode: voice.voiceCode,
      param,
      value,
      settings: newSettings
    });
    onSettingsChange(voice.voiceCode, newSettings);
  }, [voice.voiceCode, settings, onSettingsChange]);

  // 处理情绪标签点击
  const handleEmotionClick = useCallback((emotion: { id: string; name: string; speech: { url: string } }) => {
    // 使用统一的 AudioPlayer 播放音频
    AudioPlayer.getInstance().play(emotion.speech.url);
    
    // 更新设置
    const newSettings = {
      ...settings,
      emotion: emotion.id
    };
    setSettings(newSettings);
    console.log('情绪选择更新:', {
      voiceCode: voice.voiceCode,
      emotionId: emotion.id,
      settings: newSettings
    });
    onSettingsChange(voice.voiceCode, newSettings);
  }, [voice.voiceCode, settings, onSettingsChange]);

  // 处理播放按钮点击
  const handlePlayClick = useCallback(async () => {
    try {
      // 如果正在生成中，不执行操作
      if (isGenerating) return;
      
      // 获取当前应该使用的文本
      let textToUse = voice.speech.text;
      
      // 如果是多情感角色且已选择情感，使用情感的文本
      if (voice.emotion && voice.emotion.length > 0 && settings.emotion) {
        const selectedEmotionObj = voice.emotion.find(e => e.id === settings.emotion);
        if (selectedEmotionObj) {
          textToUse = selectedEmotionObj.speech.text;
        }
      }
      
      // 准备生成参数
      const generateParams: VoiceGenerateParams = {
        text: textToUse,
        voice_name: voice.voiceName || "",
        voice_code: voice.voiceCode,
        voice_server: voice.voiceServer || "",
        speed: settings.speed,
        volume: settings.volume,
        pitch: settings.pitch,
        emotion: settings.emotion || undefined,
        emotion_intensity: settings.intensity
      };
      
      // 生成缓存键
      const cacheKey = generateCacheKey({
        voice_name: generateParams.voice_name,
        voice_server: generateParams.voice_server || "",
        text: generateParams.text,
        speed: generateParams.speed || 0,
        volume: generateParams.volume || 0,
        pitch: generateParams.pitch || 0,
        emotion: generateParams.emotion,
        emotion_intensity: generateParams.emotion_intensity || 0
      });
      
      // 检查缓存中是否已有对应的音频 URL
      const cachedAudioUrl = audioCacheMap.get(cacheKey);
      
      if (cachedAudioUrl) {
        console.log('使用缓存的音频 URL:', cachedAudioUrl);
        AudioPlayer.getInstance().play(cachedAudioUrl);
        return;
      }
      
      // 否则生成新的音频
      setIsGenerating(true);
      
      console.log('生成语音，参数:', generateParams);
      
      // 调用生成接口
      const response = await VoiceService.generateVoice(generateParams);
      
      // 保存音频 URL 到缓存
      audioCacheMap.set(cacheKey, response.audio_url);
      
      // 播放音频
      AudioPlayer.getInstance().play(response.audio_url);
      
    } catch (error) {
      console.error('生成或播放语音失败:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [voice, settings, isGenerating]);

  // 格式化值显示
  const formatValueDisplay = useCallback((value: number) => {
    return value.toFixed(1);
  }, []);

  // 获取滑块百分比位置
  const getSliderPercent = useCallback((value: number, isVolume: boolean = false) => {
    if (isVolume) {
      return `${(value / 10) * 100}%`;
    }
    return `${((value + 10) / 20) * 100}%`;
  }, []);
  
  // 阻止触摸滑动事件的默认行为(防止页面被拖动)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      AudioPlayer.getInstance().stop();
    };
  }, []);

  return (
    <div className="voice-setting-backdrop" onClick={handleClose}>
      <div 
        className={`voice-setting-panel ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="voice-setting-header">
          <div className="voice-setting-title">音色设置</div>
          <div className="voice-setting-actions">
            <button 
              className={`voice-setting-play ${isGenerating ? 'generating' : ''}`}
              onClick={handlePlayClick}
              disabled={isGenerating}
            >
              <PlayIcon width={20} height={20} />
            </button>
            <button className="voice-setting-close" onClick={handleClose}>
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        </div>

        <div className="voice-setting-content">
          {/* 情绪标签区域 */}
          {voice.emotion && voice.emotion.length > 0 && (
            <>
              <div className="voice-setting-emotions">
                {voice.emotion.map(emotion => (
                  <div
                    key={emotion.id}
                    className={`voice-emotion-tag ${settings.emotion === emotion.id ? 'active' : ''}`}
                    onClick={() => handleEmotionClick(emotion)}
                  >
                    {emotion.name}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 情绪强度调整 */}
          {voice.supportVoiceParam && voice.supportVoiceParam.includes('emotion_intensity') && (
            <div className="voice-setting-item">
              <div className="voice-setting-label">
                <span className="voice-setting-label-text">情绪强度</span>
                <span className="voice-setting-value">{formatValueDisplay(settings.intensity)}</span>
              </div>
              <div className="voice-setting-slider-container">
                <input
                  type="range"
                  className="voice-setting-slider"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={settings.intensity}
                  onChange={(e) => handleSettingChange('intensity', parseFloat(e.target.value))}
                  onTouchMove={handleTouchMove}
                  style={{ '--slider-percent': getSliderPercent(settings.intensity) } as React.CSSProperties}
                />
                <div className="voice-setting-marks">
                  <span className="voice-setting-mark">-10</span>
                  <span className="voice-setting-mark active">0</span>
                  <span className="voice-setting-mark">10</span>
                </div>
              </div>
            </div>
          )}

          {/* 语调调整 */}
          {voice.supportVoiceParam && voice.supportVoiceParam.includes('pitch') && (
            <div className="voice-setting-item">
              <div className="voice-setting-label">
                <span className="voice-setting-label-text">语调</span>
                <span className="voice-setting-value">{formatValueDisplay(settings.pitch)}</span>
              </div>
              <div className="voice-setting-slider-container">
                <input
                  type="range"
                  className="voice-setting-slider"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={settings.pitch}
                  onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                  onTouchMove={handleTouchMove}
                  style={{ '--slider-percent': getSliderPercent(settings.pitch) } as React.CSSProperties}
                />
                <div className="voice-setting-marks">
                  <span className="voice-setting-mark">-10</span>
                  <span className="voice-setting-mark active">0</span>
                  <span className="voice-setting-mark">10</span>
                </div>
              </div>
            </div>
          )}

          {/* 语速调整 */}
          <div className="voice-setting-item">
            <div className="voice-setting-label">
              <span className="voice-setting-label-text">语速</span>
              <span className="voice-setting-value">{formatValueDisplay(settings.speed)}</span>
            </div>
            <div className="voice-setting-slider-container">
              <input
                type="range"
                className="voice-setting-slider"
                min="-10"
                max="10"
                step="0.1"
                value={settings.speed}
                onChange={(e) => handleSettingChange('speed', parseFloat(e.target.value))}
                onTouchMove={handleTouchMove}
                style={{ '--slider-percent': getSliderPercent(settings.speed) } as React.CSSProperties}
              />
              <div className="voice-setting-marks">
                <span className="voice-setting-mark">-10</span>
                <span className="voice-setting-mark active">0</span>
                <span className="voice-setting-mark">10</span>
              </div>
            </div>
          </div>

          {/* 音量调整 */}
          <div className="voice-setting-item">
            <div className="voice-setting-label">
              <span className="voice-setting-label-text">音量</span>
              <span className="voice-setting-value">{formatValueDisplay(settings.volume)}</span>
            </div>
            <div className="voice-setting-slider-container">
              <input
                type="range"
                className="voice-setting-slider"
                min="0"
                max="10"
                step="0.1"
                value={settings.volume}
                onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                onTouchMove={handleTouchMove}
                style={{ '--slider-percent': getSliderPercent(settings.volume, true) } as React.CSSProperties}
              />
              <div className="voice-setting-marks">
                <span className="voice-setting-mark">0</span>
                <span className="voice-setting-mark active">5.0</span>
                <span className="voice-setting-mark">10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingPanel; 