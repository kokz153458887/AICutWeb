/**
 * 音乐项组件
 * 负责展示单个音乐的信息，包括标题、时长和描述
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../../styles/MusicItem.css';
import { formatDuration } from '../../../utils/timeUtils';
import { MusicLibItem } from '../../api/types';

interface MusicItemProps {
  item: MusicLibItem;
  selected: boolean;
  playing: boolean;
  onClick: (item: MusicLibItem) => void;
  onPlayClick: (item: MusicLibItem) => void;
}

/**
 * 音乐项组件
 */
const MusicItem: React.FC<MusicItemProps> = ({ 
  item, 
  selected, 
  playing,
  onClick, 
  onPlayClick 
}) => {
  // 音频元素引用
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 音频错误状态
  const [audioError, setAudioError] = useState<string>('');
  // 用于跟踪音频检查定时器
  const timeCheckRef = useRef<number>();

  /**
   * 处理点击事件
   */
  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  /**
   * 处理播放按钮点击事件
   */
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioError) {
      // 如果有错误，尝试重新加载
      if (audioRef.current) {
        audioRef.current.load();
        setAudioError('');
      }
    } else {
      onPlayClick(item);
    }
  }, [audioError, item, onPlayClick]);

  /**
   * 将时间字符串转换为秒数
   * 支持 "HH:mm:ss" 或 "mm:ss" 格式
   */
  const timeToSeconds = useCallback((timeStr: string): number => {
    try {
      const parts = timeStr.split(':').map(Number);
      
      if (parts.length === 3) {
        // HH:mm:ss 格式
        const [hours, minutes, seconds] = parts;
        if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
          return hours * 3600 + minutes * 60 + seconds;
        }
      } else if (parts.length === 2) {
        // mm:ss 格式
        const [minutes, seconds] = parts;
        if (!isNaN(minutes) && !isNaN(seconds)) {
          return minutes * 60 + seconds;
        }
      }
      
      console.error('无效的时间格式:', timeStr);
      return 0;
    } catch (err) {
      console.error('时间格式转换失败:', err);
      return 0;
    }
  }, []);

  /**
   * 设置音频时间并开始监听
   */
  const setAudioTime = useCallback(() => {
    if (!audioRef.current || !item.start_time) return;

    try {
      const startSeconds = timeToSeconds(item.start_time);
      const endSeconds = item.end_time ? timeToSeconds(item.end_time) : null;
      
      console.log('设置音频时间:', {
        startTime: item.start_time,
        endTime: item.end_time,
        startSeconds,
        endSeconds,
        duration: audioRef.current.duration
      });

      audioRef.current.currentTime = startSeconds;

      // 清除之前的定时器
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }

      // 如果设置了结束时间，启动检查
      if (endSeconds !== null) {
        timeCheckRef.current = window.setInterval(() => {
          if (audioRef.current && audioRef.current.currentTime >= endSeconds) {
            console.log('到达结束时间，停止播放');
            onPlayClick(item); // 停止播放
            clearInterval(timeCheckRef.current);
          }
        }, 100);
      }
    } catch (err) {
      console.error('设置音频时间失败:', err);
      setAudioError('设置播放时间失败');
    }
  }, [item, timeToSeconds, onPlayClick]);

  // 监听播放状态变化
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      console.log('音频加载完成，duration:', audio.duration);
      setAudioError('');
      if (playing) {
        setAudioTime();
        audio.play().catch(err => {
          console.error('播放音频失败:', err);
          setAudioError('播放失败，请重试');
        });
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error('音频加载错误:', e);
      setAudioError('音频加载失败');
    };

    const handleEnded = () => {
      console.log('音频播放结束');
      onPlayClick(item);
    };

    // 设置事件监听
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    // 控制播放状态
    if (playing) {
      audio.load(); // 重新加载以确保从正确的时间点开始播放
    } else {
      audio.pause();
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }
    }

    // 清理函数
    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }
    };
  }, [playing, item, onPlayClick, setAudioTime]);

  return (
    <div 
      className={`music-item ${selected ? 'selected' : ''} ${playing ? 'playing' : ''}`} 
      onClick={handleClick}
    >
      <div className="music-item-info">
        <div className="music-item-title">{item.name}</div>
        <div className="music-item-desc">{item.discription}</div>
      </div>
      
      <div className="music-item-duration">
        {formatDuration(item.duration)}
      </div>
      
      <div 
        className={`music-item-play ${audioError ? 'error' : ''}`}
        onClick={handlePlayClick}
        title={audioError || undefined}
      >
        {audioError ? '⟳' : playing ? '■' : '▶'}
      </div>

      {/* 隐藏的音频元素 */}
      <audio 
        ref={audioRef}
        src={item.url}
        preload="metadata"
      />
    </div>
  );
};

export default MusicItem; 