/**
 * 音色参数调整面板组件
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from '../icons/SvgIcons';
import '../../styles/VoiceSettingPanel.css';

interface VoiceSettingPanelProps {
  voice: {
    voiceCode: string;
    voicer: string;
    supportVoiceParam: string[];
    emotion?: Array<{ id: string; name: string }>;
    settings?: {
      speed: number;
      pitch: number;
      intensity: number;
    };
  };
  onClose: () => void;
  onSettingsChange: (voiceCode: string, settings: { speed: number; pitch: number; intensity: number }) => void;
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
    intensity: 0
  });
  const [isClosing, setIsClosing] = useState(false);

  // 加载初始设置
  useEffect(() => {
    if (voice.settings) {
      setSettings({
        speed: voice.settings.speed || 0,
        pitch: voice.settings.pitch || 0,
        intensity: voice.settings.intensity || 0
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
  const handleSettingChange = useCallback((param: 'speed' | 'pitch' | 'intensity', value: number) => {
    const newSettings = {
      ...settings,
      [param]: value
    };
    setSettings(newSettings);
    onSettingsChange(voice.voiceCode, newSettings);
  }, [voice.voiceCode, settings, onSettingsChange]);

  // 格式化值显示
  const formatValueDisplay = useCallback((value: number) => {
    return value.toFixed(1);
  }, []);

  // 获取滑块百分比位置
  const getSliderPercent = useCallback((value: number) => {
    return `${((value + 10) / 20) * 100}%`;
  }, []);
  
  // 阻止触摸滑动事件的默认行为(防止页面被拖动)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="voice-setting-backdrop" onClick={handleClose}>
      <div 
        className={`voice-setting-panel ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="voice-setting-header">
          <div className="voice-setting-title">调整参数</div>
          <div className="voice-setting-close" onClick={handleClose}>
            <CloseIcon width={20} height={20} />
          </div>
        </div>

        <div className="voice-setting-content">
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

          {/* 语调调整 */}
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

          {/* 情感强度调整 */}
          {voice.emotion && voice.emotion.length > 0 && (
            <div className="voice-setting-item">
              <div className="voice-setting-label">
                <span className="voice-setting-label-text">情感强度</span>
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
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingPanel; 