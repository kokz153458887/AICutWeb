/**
 * 音色参数调整面板组件
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from '../icons/SvgIcons';
import { VoiceInfo } from '../../mock/voiceData';
import '../../styles/VoiceSettingPanel.css';

interface VoiceSettingPanelProps {
  voice: VoiceInfo;
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
  const [speed, setSpeed] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // 加载初始设置
  useEffect(() => {
    if (voice.settings) {
      setSpeed(voice.settings.speed || 0);
      setPitch(voice.settings.pitch || 0);
      setIntensity(voice.settings.intensity || 0);
    }
  }, [voice]);

  // 处理关闭
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // 处理语速变化
  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSpeed(value);
    onSettingsChange(voice.voiceCode, { 
      speed: value, 
      pitch, 
      intensity 
    });
  }, [voice.voiceCode, pitch, intensity, onSettingsChange]);

  // 处理语调变化
  const handlePitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPitch(value);
    onSettingsChange(voice.voiceCode, { 
      speed, 
      pitch: value, 
      intensity 
    });
  }, [voice.voiceCode, speed, intensity, onSettingsChange]);

  // 处理情感强度变化
  const handleIntensityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setIntensity(value);
    onSettingsChange(voice.voiceCode, { 
      speed, 
      pitch, 
      intensity: value 
    });
  }, [voice.voiceCode, speed, pitch, onSettingsChange]);

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
              <span className="voice-setting-value">{formatValueDisplay(speed)}</span>
            </div>
            <div className="voice-setting-slider-container">
              <input
                type="range"
                className="voice-setting-slider"
                min="-10"
                max="10"
                step="0.1"
                value={speed}
                onChange={handleSpeedChange}
                onTouchMove={handleTouchMove}
                style={{ '--slider-percent': getSliderPercent(speed) } as React.CSSProperties}
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
              <span className="voice-setting-value">{formatValueDisplay(pitch)}</span>
            </div>
            <div className="voice-setting-slider-container">
              <input
                type="range"
                className="voice-setting-slider"
                min="-10"
                max="10"
                step="0.1"
                value={pitch}
                onChange={handlePitchChange}
                onTouchMove={handleTouchMove}
                style={{ '--slider-percent': getSliderPercent(pitch) } as React.CSSProperties}
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
                <span className="voice-setting-value">{formatValueDisplay(intensity)}</span>
              </div>
              <div className="voice-setting-slider-container">
                <input
                  type="range"
                  className="voice-setting-slider"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={intensity}
                  onChange={handleIntensityChange}
                  onTouchMove={handleTouchMove}
                  style={{ '--slider-percent': getSliderPercent(intensity) } as React.CSSProperties}
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