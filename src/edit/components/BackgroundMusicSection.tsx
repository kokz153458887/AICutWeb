import React, { useState, useRef, useEffect } from 'react';
import ConfigItem from './ConfigItem';
import { toast } from '../../components/Toast';

interface BackgroundMusicSectionProps {
  musicName: string;
  musicUrl: string;
  startTime: string;
  endTime: string;
  volume: number;
  onMusicClick: () => void;
  onVolumeChange: (newVolume: number) => void;
}

/**
 * 背景音乐选择组件
 * 负责展示和选择背景音乐，包含音量控制和试听功能
 */
const BackgroundMusicSection: React.FC<BackgroundMusicSectionProps> = ({
  musicName,
  musicUrl,
  startTime,
  endTime,
  volume,
  onMusicClick,
  onVolumeChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    
    // 更新音频源和音量
    if (audioRef.current) {
      audioRef.current.src = musicUrl;
      audioRef.current.volume = Math.min(volume, 1);
    }
    
    // 清理函数
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [musicUrl]);

  // 监听音量变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(volume, 1);
    }
  }, [volume]);

  /**
   * 处理音频播放点击事件
   */
  const handlePlayClick = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      toast.info('停止播放');
    } else {
      if (!musicUrl) {
        toast.error('暂无音乐可播放');
        return;
      }

      // 解析开始时间
      if (startTime) {
        try {
          const timeParts = startTime.split(':');
          let totalSeconds = 0;
          
          if (timeParts.length === 3) {
            const [hours, minutes, secondsWithMs] = timeParts;
            const [seconds, ms] = secondsWithMs.split('.').map(Number);
            
            totalSeconds = 
              Number(hours) * 3600 + 
              Number(minutes) * 60 + 
              (seconds || 0) + 
              (ms ? Number(ms) / 1000 : 0);
          }
          
          audioRef.current.currentTime = totalSeconds;
        } catch (error) {
          console.error('解析开始时间失败:', error);
          audioRef.current.currentTime = 0;
        }
      }

      audioRef.current.play().catch(error => {
        console.error('播放失败:', error);
        toast.error('播放失败，请重试');
        setIsPlaying(false);
      });
      setIsPlaying(true);
      toast.info('开始播放');

      // 如果有设置结束时间，则在适当的时间停止播放
      if (endTime && startTime) {
        try {
          const startParts = startTime.split(':');
          const endParts = endTime.split(':');
          
          let startSeconds = 0;
          let endSeconds = 0;
          
          if (startParts.length === 3 && endParts.length === 3) {
            // 计算开始时间（秒）
            const [startHours, startMinutes, startSecondsWithMs] = startParts;
            const [startSecs, startMs] = startSecondsWithMs.split('.').map(Number);
            
            startSeconds = 
              Number(startHours) * 3600 + 
              Number(startMinutes) * 60 + 
              (startSecs || 0) + 
              (startMs ? Number(startMs) / 1000 : 0);
              
            // 计算结束时间（秒）
            const [endHours, endMinutes, endSecondsWithMs] = endParts;
            const [endSecs, endMs] = endSecondsWithMs.split('.').map(Number);
            
            endSeconds = 
              Number(endHours) * 3600 + 
              Number(endMinutes) * 60 + 
              (endSecs || 0) + 
              (endMs ? Number(endMs) / 1000 : 0);
              
            // 计算播放时长
            const duration = endSeconds - startSeconds;
            
            if (duration > 0) {
              // 设置定时器在到达结束时间时停止
              setTimeout(() => {
                if (audioRef.current && isPlaying) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                  toast.info('播放结束');
                }
              }, duration * 1000);
            }
          }
        } catch (error) {
          console.error('处理结束时间失败:', error);
        }
      }
    }
  };

  return (
    <ConfigItem
      title="背景音乐"
      value={musicName || ""}
      onClick={onMusicClick}
      hasVolumeControl={true}
      volume={volume}
      onVolumeChange={onVolumeChange}
      hasAudioPlayback={true}
      onPlayClick={handlePlayClick}
      isPlaying={isPlaying}
      maxVolume={5}
      volumeStep={0.1}
    />
  );
};

export default BackgroundMusicSection; 