/**
 * 视频切片项组件
 * 支持文本编辑、时间调整和视频定位功能
 */
import React, { useCallback, useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { VideoClipItem } from '../../types';
import { formatTime, parseTime } from '../../utils';
import './styles.css';

export interface VideoClipItemRef {
  focusTextarea: () => void;
  scrollToBottom: () => void;
}

interface VideoClipItemProps {
  clip: VideoClipItem;
  index: number;
  isLocationActive: boolean;
  activeLocationField: 'start' | 'end' | null;
  isPlaying?: boolean; // 是否正在播放此切片
  onTitleChange: (id: string, title: string) => void;
  onTextChange: (id: string, text: string) => void;
  onTimeChange: (id: string, field: 'start' | 'end', value: string) => void;
  onTimeInputCommit: (id: string, field: 'start' | 'end', value: string) => void;
  onTimeAdjust: (id: string, field: 'start' | 'end', delta: number) => void;
  onLocationClick: (id: string, field: 'start' | 'end') => void;
  onTimeFocus: (time: number) => void;
  onEnterClip: (id: string, textarea: HTMLTextAreaElement) => void;
  onPlayClip: (id: string, startTime: number, endTime: number) => void;
  onDeleteClip: (id: string) => void;
}

/**
 * 视频切片项组件
 * 提供单个切片的完整编辑功能
 */
const VideoClipItemComponent = forwardRef<VideoClipItemRef, VideoClipItemProps>(({
  clip,
  index,
  isLocationActive,
  activeLocationField,
  isPlaying,
  onTitleChange,
  onTextChange,
  onTimeChange,
  onTimeInputCommit,
  onTimeAdjust,
  onLocationClick,
  onTimeFocus,
  onEnterClip,
  onPlayClip,
  onDeleteClip
}, ref) => {
  // 时间输入框的本地状态
  const [startTimeInput, setStartTimeInput] = useState(formatTime(clip.startTime));
  const [endTimeInput, setEndTimeInput] = useState(formatTime(clip.endTime));
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [isEditingEnd, setIsEditingEnd] = useState(false);
  
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 当clip的时间发生变化时，更新本地输入状态（仅在非编辑状态下）- 防抖优化
  useEffect(() => {
    if (!isEditingStart) {
      const timer = setTimeout(() => {
        setStartTimeInput(formatTime(clip.startTime));
      }, 50); // 50ms防抖
      return () => clearTimeout(timer);
    }
  }, [clip.startTime, isEditingStart]);

  useEffect(() => {
    if (!isEditingEnd) {
      const timer = setTimeout(() => {
        setEndTimeInput(formatTime(clip.endTime));
      }, 50); // 50ms防抖
      return () => clearTimeout(timer);
    }
  }, [clip.endTime, isEditingEnd]);

  /**
   * 处理标题变化 - 优化，减少不必要的重新创建
   */
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(clip.id, e.target.value);
  }, [clip.id, onTitleChange]);

  /**
   * 处理文本变化 - 优化，减少不必要的重新创建
   */
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(clip.id, e.target.value);
  }, [clip.id, onTextChange]);

  /**
   * 处理回车键切片 - 优化，减少不必要的重新创建
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnterClip(clip.id, e.currentTarget);
    }
  }, [clip.id, onEnterClip]);

  /**
   * 处理时间输入框的本地变化 - 简化，避免useCallback滥用
   */
  const handleStartTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTimeInput(e.target.value);
  };

  const handleEndTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTimeInput(e.target.value);
  };

  /**
   * 处理时间输入框聚焦 - 简化，并添加移动端优化
   */
  const handleStartTimeFocus = () => {
    setIsEditingStart(true);
    onTimeFocus(clip.startTime);
    
    // 移动端优化：延迟滚动到输入框位置，避免键盘遮挡
    setTimeout(() => {
      if (startInputRef.current) {
        startInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 300); // 等待键盘弹出动画完成
  };

  const handleEndTimeFocus = () => {
    setIsEditingEnd(true);
    onTimeFocus(clip.endTime);
    
    // 移动端优化：延迟滚动到输入框位置，避免键盘遮挡
    setTimeout(() => {
      if (endInputRef.current) {
        endInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 300); // 等待键盘弹出动画完成
  };

  /**
   * 验证和提交时间变化 - 优化，减少重复代码
   */
  const commitTimeChange = (field: 'start' | 'end') => {
    const inputValue = field === 'start' ? startTimeInput : endTimeInput;
    const originalTime = field === 'start' ? clip.startTime : clip.endTime;
    
    try {
      // 尝试解析时间
      const parsedTime = parseTime(inputValue);
      // 如果解析成功，使用专门的提交方法来处理定位模式下的同步
      onTimeInputCommit(clip.id, field, inputValue);
    } catch (error) {
      // 如果解析失败，恢复到原来的值
      if (field === 'start') {
        setStartTimeInput(formatTime(originalTime));
      } else {
        setEndTimeInput(formatTime(originalTime));
      }
    } finally {
      // 结束编辑状态
      if (field === 'start') {
        setIsEditingStart(false);
      } else {
        setIsEditingEnd(false);
      }
    }
  };

  /**
   * 处理时间输入框失焦 - 简化
   */
  const handleStartTimeBlur = () => {
    commitTimeChange('start');
  };

  const handleEndTimeBlur = () => {
    commitTimeChange('end');
  };

  /**
   * 处理时间输入框回车 - 简化
   */
  const handleStartTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTimeChange('start');
      startInputRef.current?.blur();
    }
  };

  const handleEndTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTimeChange('end');
      endInputRef.current?.blur();
    }
  };

  /**
   * 处理时间微调 - 优化，减少不必要的重新创建
   */
  const handleStartTimeAdjustBack = useCallback(() => {
    onTimeAdjust(clip.id, 'start', -0.1);
  }, [clip.id, onTimeAdjust]);

  const handleStartTimeAdjustForward = useCallback(() => {
    onTimeAdjust(clip.id, 'start', 0.1);
  }, [clip.id, onTimeAdjust]);

  const handleEndTimeAdjustBack = useCallback(() => {
    onTimeAdjust(clip.id, 'end', -0.1);
  }, [clip.id, onTimeAdjust]);

  const handleEndTimeAdjustForward = useCallback(() => {
    onTimeAdjust(clip.id, 'end', 0.1);
  }, [clip.id, onTimeAdjust]);

  /**
   * 处理定位按钮点击 - 优化，减少不必要的重新创建
   */
  const handleStartLocationClick = useCallback(() => {
    onLocationClick(clip.id, 'start');
  }, [clip.id, onLocationClick]);

  const handleEndLocationClick = useCallback(() => {
    onLocationClick(clip.id, 'end');
  }, [clip.id, onLocationClick]);

  /**
   * 处理播放按钮点击
   */
  const handlePlayClick = useCallback(() => {
    onPlayClip(clip.id, clip.startTime, clip.endTime);
  }, [clip.id, clip.startTime, clip.endTime, onPlayClip]);

  /**
   * 处理删除按钮点击
   */
  const handleDeleteClick = useCallback(() => {
    onDeleteClip(clip.id);
  }, [clip.id, onDeleteClip]);

  useImperativeHandle(ref, () => ({
    focusTextarea: () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // 将光标移到文本末尾
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    },
    scrollToBottom: () => {
      if (textareaRef.current) {
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }));

  return (
    <div className={`video-clip-item ${clip.isDefault ? 'default-clip' : ''}`}>
      {/* 标题输入区域 */}
      <div className="clip-title">
        <div className="title-row">
          <div className="play-clip-btn" onClick={handlePlayClick}>
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
              </svg>
            )}
          </div>
          <input
            type="text"
            value={clip.title || ''}
            onChange={handleTitleChange}
            placeholder={clip.isDefault ? "默认切片" : `切片 ${index + 1}`}
            className="title-input"
          />
          <div className="delete-clip-btn" onClick={handleDeleteClick}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 文本编辑区域 */}
      <div className="clip-text">
        <textarea
          ref={textareaRef}
          value={clip.text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={clip.isDefault ? "请输入文本内容，按回车键进行切片..." : "请输入切片文本..."}
        />
      </div>
      
      {/* 时间控制区域 - 单行布局 */}
      <div className="clip-times-row">
        {/* 开始时间 */}
        <div className="time-group">
          <div className="time-label-and-controls">
            <label>开始</label>
            <div className="time-input-group">
              <div 
                className="time-adjust-btn"
                onClick={handleStartTimeAdjustBack}
                onMouseDown={(e) => e.preventDefault()}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <input
                ref={startInputRef}
                type="text"
                value={startTimeInput}
                onChange={handleStartTimeInputChange}
                onFocus={handleStartTimeFocus}
                onBlur={handleStartTimeBlur}
                onKeyDown={handleStartTimeKeyDown}
              />
              <div 
                className="time-adjust-btn"
                onClick={handleStartTimeAdjustForward}
                onMouseDown={(e) => e.preventDefault()}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div 
                className={`location-btn ${isLocationActive && activeLocationField === 'start' ? 'active' : ''}`}
                onClick={handleStartLocationClick}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* 结束时间 */}
        <div className="time-group">
          <div className="time-label-and-controls">
            <label>结束</label>
            <div className="time-input-group">
              <div 
                className="time-adjust-btn"
                onClick={handleEndTimeAdjustBack}
                onMouseDown={(e) => e.preventDefault()}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <input
                ref={endInputRef}
                type="text"
                value={endTimeInput}
                onChange={handleEndTimeInputChange}
                onFocus={handleEndTimeFocus}
                onBlur={handleEndTimeBlur}
                onKeyDown={handleEndTimeKeyDown}
              />
              <div 
                className="time-adjust-btn"
                onClick={handleEndTimeAdjustForward}
                onMouseDown={(e) => e.preventDefault()}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div 
                className={`location-btn ${isLocationActive && activeLocationField === 'end' ? 'active' : ''}`}
                onClick={handleEndLocationClick}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoClipItemComponent; 