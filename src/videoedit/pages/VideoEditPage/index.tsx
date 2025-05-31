/**
 * 视频剪辑页面
 * 整合视频播放器和切片列表
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackIcon } from '../../../components/icons';
import VideoPlayer, { VideoPlayerRef } from '../../components/VideoPlayer';
import VideoClipItemComponent, { VideoClipItemRef } from '../../components/VideoClipItem';
import MaterialSelectModal from '../../../edit/components/select/MaterialSelectModal';
import { getParseTaskDetail } from '../../api';
import { ParseTaskDetail, VideoClipItem, VideoEditState, SegmentInfo } from '../../types';
import { MaterialLibItem, MaterialModel } from '../../../edit/api/types';
import { formatTime, parseTime, findPreciseTimeRangeByText, generateId, saveVideoEditState, loadVideoEditState, convertSpacedPositionToPurePosition, removePunctuationAndSpaces } from '../../utils';
import { toast } from '../../../components/Toast';
import './styles.css';

/**
 * 视频剪辑页面组件
 * 提供视频剪辑和切片功能
 */
const VideoEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // VideoPlayer的引用
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  
  // 切片组件的引用
  const clipRefs = useRef<Map<string, VideoClipItemRef>>(new Map());
  
  // 基础数据状态
  const [taskData, setTaskData] = useState<ParseTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 编辑状态
  const [clips, setClips] = useState<VideoClipItem[]>([]);
  const [mode, setMode] = useState<'clip' | 'edit'>('clip');
  
  // 视频控制状态
  const [videoSeekTime, setVideoSeekTime] = useState<number | undefined>(undefined);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [currentPlayingClipId, setCurrentPlayingClipId] = useState<string | null>(null);
  
  // 素材库状态
  const [showMaterialModal, setShowMaterialModal] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialLibItem | null>(null);
  
  // 定位状态
  const [locationActiveClipId, setLocationActiveClipId] = useState<string | null>(null);
  const [locationActiveField, setLocationActiveField] = useState<'start' | 'end' | null>(null);
  const [locationActiveIndex, setLocationActiveIndex] = useState<number>(-1);

  /**
   * 创建默认切片 - 使用useMemo优化，只有taskData变化时才重新计算
   */
  const createDefaultClip = useMemo(() => {
    if (!taskData) return null;
    
    const text = taskData.text || '';
    if (text && taskData.video_info) {
      return {
        id: generateId(),
        title: '默认切片',
        text: text,
        startTime: 0,
        endTime: taskData.video_info.file_duration,
        isDefault: true
      };
    }
    return null;
  }, [taskData]);

  /**
   * 初始化页面数据
   */
  useEffect(() => {
    const initData = async () => {
      if (!id) {
        setError('任务ID不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 先尝试从本地存储加载状态
        const savedState = loadVideoEditState(id);
        
        // 获取任务详情
        const data = await getParseTaskDetail(id, true);
        setTaskData(data);
        console.log('initData taskData:', data); // 修复：使用获取的data而不是状态中的taskData
        
        if (savedState) {
          // 使用保存的状态
          setClips(savedState.clips);
          setMode(savedState.mode);
        } else {
          // 初始化默认状态 - 直接使用获取的data创建默认切片
          const text = data.text || '';
          if (text && data.video_info) {
            const defaultClip: VideoClipItem = {
              id: generateId(),
              title: '默认切片',
              text: text,
              startTime: 0,
              endTime: data.video_info.file_duration,
              isDefault: true
            };
            setClips([defaultClip]);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('获取任务详情失败:', err);
        setError('获取任务详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id]);

  /**
   * 自动保存状态 - 使用防抖避免频繁保存
   */
  useEffect(() => {
    if (!id || clips.length === 0) return;
    
    const timer = setTimeout(() => {
      const state: VideoEditState = {
        text: '', // 不再使用主文本框
        clips,
        mode,
        cursorPosition: 0 // 不再需要光标位置
      };
      saveVideoEditState(id, state);
    }, 500); // 500ms防抖
    
    return () => clearTimeout(timer);
  }, [id, clips, mode]);

  /**
   * 计算切片在完整文本中的位置 - 无外部依赖，不需要useCallback
   */
  const calculateClipPositionInFullText = (clipId: string, clips: VideoClipItem[]) => {
    let position = 0;
    for (const clip of clips) {
      if (clip.id === clipId) {
        return position;
      }
      position += clip.text.length;
    }
    return position;
  };

  /**
   * 获取完整的原始文本 - 简单计算，不需要useCallback
   */
  const getFullOriginalText = () => {
    return taskData?.text || '';
  };

  /**
   * 处理文本切片 - 在指定切片上进行切片操作
   */
  const handleTextClip = (clipId: string, position: number) => {
    if (!taskData?.segments) return;
    
    // 如果有激活的定位模式，先退出
    if (locationActiveClipId) {
      exitLocationMode();
    }
    
    const currentClip = clips.find(clip => clip.id === clipId);
    if (!currentClip) return;
    
    const textBeforeCursor = currentClip.text.substring(0, position);
    const textAfterCursor = currentClip.text.substring(position);
    
    if (!textBeforeCursor.trim()) return; // 防止创建空切片
    
    // 计算切片在完整文本中的位置（基于带空格的原始文本）
    const clipStartInFullText = calculateClipPositionInFullText(clipId, clips);
    const fullOriginalText = getFullOriginalText();
    
    // 使用精确的时间算法
    const timeRange = findPreciseTimeRangeByText(
      fullOriginalText,
      textBeforeCursor,
      clipStartInFullText,
      taskData.segments
    );
    
    // 创建新切片
    const newClip: VideoClipItem = {
      id: generateId(),
      title: '',
      text: textBeforeCursor,
      startTime: timeRange.startTime,
      endTime: timeRange.endTime
    };
    
    // 计算剩余文本的开始时间
    const remainingStartTime = findPreciseTimeRangeByText(
      fullOriginalText,
      textAfterCursor,
      clipStartInFullText + textBeforeCursor.length,
      taskData.segments
    ).startTime;
    
    // 更新切片列表
    setClips(prevClips => {
      const newClips = [...prevClips];
      const currentIndex = newClips.findIndex(clip => clip.id === clipId);
      
      if (currentIndex !== -1) {
        // 更新当前切片为剩余文本
        const updatedCurrentClip: VideoClipItem = {
          ...currentClip,
          text: textAfterCursor,
          startTime: remainingStartTime
        };
        newClips[currentIndex] = updatedCurrentClip;
        
        // 在当前位置前插入新切片
        newClips.splice(currentIndex, 0, newClip);
      }
      
      return newClips;
    });
    
    // 跳转到新切片的开始位置
    setVideoSeekTime(remainingStartTime);
    
    // 延迟执行焦点和滚动操作，确保DOM更新完成
    setTimeout(() => {
      // 找到默认切片（剩余的切片）
      const defaultClipId = currentClip.id; // 当前切片会被更新为剩余文本
      const defaultClipRef = clipRefs.current.get(defaultClipId);
      if (defaultClipRef) {
        defaultClipRef.focusTextarea();
        defaultClipRef.scrollToBottom();
      }
    }, 100);
    
    console.log('切片创建成功 seek:', remainingStartTime);
  };

  /**
   * 处理Enter键切片 - 保留useCallback，因为会传递给子组件
   */
  const handleEnterClip = useCallback((clipId: string, textarea: HTMLTextAreaElement) => {
    const position = textarea.selectionStart;
    handleTextClip(clipId, position);
  }, [clips, taskData]); // 明确依赖项

  /**
   * 处理返回按钮点击 - 保留useCallback，因为navigate不会变化
   */
  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * 处理提交按钮点击 - 无依赖，不需要useCallback
   */
  const handleSubmitClick = () => {
    toast.info('功能待开发');
  };

  /**
   * 处理重置按钮点击
   */
  const handleResetClick = () => {
    if (!id) return;
    
    // 清空本地存储
    try {
      const key = `video_edit_state_${id}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('清空本地存储失败:', error);
    }
    
    // 重置到默认状态 - 使用当前的taskData
    if (createDefaultClip) {
      setClips([createDefaultClip]);
    }
    
    // 重置其他状态
    setLocationActiveClipId(null);
    setLocationActiveField(null);
    setLocationActiveIndex(-1);
    setVideoSeekTime(0);
    
    toast.success('已重置到初始状态');
  };

  /**
   * 处理标题变化 - 保留useCallback，因为会传递给子组件
   */
  const handleTitleChange = useCallback((clipId: string, title: string) => {
    setClips(prevClips => 
      prevClips.map(clip => 
        clip.id === clipId ? { ...clip, title } : clip
      )
    );
  }, []);

  /**
   * 处理文本变化 - 保留useCallback，因为会传递给子组件
   */
  const handleTextChange = useCallback((clipId: string, text: string) => {
    setClips(prevClips => 
      prevClips.map(clip => 
        clip.id === clipId ? { ...clip, text } : clip
      )
    );
  }, []);

  /**
   * 处理时间编辑 - 仅验证和更新时间，不立即跳转
   */
  const handleTimeChange = useCallback((clipId: string, field: 'start' | 'end', value: string) => {
    // 尝试解析时间，如果无效则不更新
    try {
      const time = parseTime(value);
      setClips(prevClips => 
        prevClips.map(clip => 
          clip.id === clipId 
            ? { ...clip, [field === 'start' ? 'startTime' : 'endTime']: time }
            : clip
        )
      );
      
      // 仅在非定位模式下跳转到对应时间
      if (!locationActiveClipId) {
        setVideoSeekTime(time);
      }
    } catch (error) {
      // 解析失败时不做任何操作，保持输入框的当前值
      console.warn('时间格式无效，等待用户完成输入:', value);
    }
  }, [locationActiveClipId]);

  /**
   * 处理切片手动输入时间完成 - 专门用于处理定位模式下的手动输入时间提交
   */
  const handleTimeInputCommit = useCallback((clipId: string, field: 'start' | 'end', value: string) => {
    try {
      const time = parseTime(value);
      
      // 更新切片时间
      setClips(prevClips => 
        prevClips.map(clip => 
          clip.id === clipId 
            ? { ...clip, [field === 'start' ? 'startTime' : 'endTime']: time }
            : clip
        )
      );
      
      // 如果是当前定位中的切片和字段，同步更新播放器时间
      if (locationActiveClipId === clipId && locationActiveField === field) {
        setVideoSeekTime(time);
      } else if (!locationActiveClipId) {
        // 非定位模式下直接跳转
        setVideoSeekTime(time);
      }
      
    } catch (error) {
      console.warn('时间格式无效:', value);
    }
  }, [locationActiveClipId, locationActiveField]);

  /**
   * 处理时间微调 - 保留useCallback，因为会传递给子组件
   */
  const handleTimeAdjust = useCallback((clipId: string, field: 'start' | 'end', delta: number) => {
    setClips(prevClips => 
      prevClips.map(clip => {
        if (clip.id === clipId) {
          const currentTime = field === 'start' ? clip.startTime : clip.endTime;
          const newTime = Math.max(0, currentTime + delta);
          
          setVideoSeekTime(newTime);
          
          return { ...clip, [field === 'start' ? 'startTime' : 'endTime']: newTime };
        }
        return clip;
      })
    );
  }, [locationActiveClipId, locationActiveField]);

  /**
   * 处理视频时间更新 - 在定位模式下同步到输入框，增加防循环机制
   */
  const handleVideoTimeUpdate = useCallback((currentTime: number, source: string = 'video-native') => {
    setCurrentVideoTime(currentTime);
    
    if (locationActiveClipId && locationActiveField) {
      // 只有当时间更新来源不是外部输入时才同步，避免循环调用
      if (source !== 'external-input') {
        setClips(prevClips => 
          prevClips.map(clip => 
            clip.id === locationActiveClipId 
              ? { ...clip, [locationActiveField === 'start' ? 'startTime' : 'endTime']: currentTime }
              : clip
          )
        );
      }
    }
  }, [locationActiveClipId, locationActiveField]);

  /**
   * 处理拖拽过程中的时间更新
   */
  const handleDragging = useCallback((time: number) => {
    if (locationActiveClipId && locationActiveField) {
      // 拖拽过程中实时更新时间
      setClips(prevClips => 
        prevClips.map(clip => 
          clip.id === locationActiveClipId 
            ? { ...clip, [locationActiveField === 'start' ? 'startTime' : 'endTime']: time }
            : clip
        )
      );
    }
  }, [locationActiveClipId, locationActiveField]);

  /**
   * 离开定位模式
   */
  const exitLocationMode = useCallback(() => {
    if (locationActiveClipId) {
      setLocationActiveClipId(null);
      setLocationActiveField(null);
      setLocationActiveIndex(-1);
      setVideoSeekTime(undefined);
      
      // 定位模式结束后暂停播放
      videoPlayerRef.current?.pauseVideo();
    }
  }, [locationActiveClipId]);

  /**
   * 处理定位按钮点击
   */
  const handleLocationClick = useCallback((clipId: string, field: 'start' | 'end') => {
    const isCurrentlyActive = locationActiveClipId === clipId && locationActiveField === field;
    
    if (isCurrentlyActive) {
      exitLocationMode();
    } else {
      // 激活定位状态
      setLocationActiveClipId(clipId);
      setLocationActiveField(field);
      
      // 找到切片索引
      const clipIndex = clips.findIndex(clip => clip.id === clipId);
      setLocationActiveIndex(clipIndex);
      
      // 立即跳转到对应时间
      const clip = clips.find(c => c.id === clipId);
      if (clip) {
        const time = field === 'start' ? clip.startTime : clip.endTime;
        setVideoSeekTime(time);
      }
      
      toast.info('拖动视频进度更新时间');
    }
  }, [locationActiveClipId, locationActiveField, clips, exitLocationMode]);

  /**
   * 处理时间输入框聚焦
   */
  const handleTimeFocus = useCallback((time: number) => {
    // if (!locationActiveClipId) {
      setVideoSeekTime(time);
    // }
  }, [locationActiveClipId]);

  /**
   * 处理删除切片
   */
  const handleDeleteClip = useCallback((clipId: string) => {
    // 防止删除最后一个切片
    if (clips.length <= 1) {
      toast.error('至少需要保留一个切片');
      return;
    }
    
    setClips(prevClips => prevClips.filter(clip => clip.id !== clipId));
    
    // 如果删除的是正在播放的切片，停止播放
    if (currentPlayingClipId === clipId) {
      setCurrentPlayingClipId(null);
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pauseVideo();
      }
    }
    
    toast.success('切片已删除');
  }, [clips.length, currentPlayingClipId]);

  /**
   * 处理播放切片
   */
  const handlePlayClip = useCallback((clipId: string, startTime: number, endTime: number) => {
    // 如果当前正在播放，直接暂停
    if (isVideoPlaying) {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pauseVideo();
      }
      setCurrentPlayingClipId(null);
      return;
    }
    
    // 检查当前时间是否在切片范围内
    const isInRange = currentVideoTime >= startTime && currentVideoTime < endTime;
    
    let playFromTime = startTime;
    
    if (isInRange) {
      // 在范围内，从当前时间继续播放
      playFromTime = currentVideoTime;
    } else {
      // 超出范围，从开始时间播放
      playFromTime = startTime;
      setVideoSeekTime(startTime);
    }
    
    // 设置当前播放的切片
    setCurrentPlayingClipId(clipId);
    
    // 延迟一点时间确保视频跳转完成（如果有跳转的话）
    const delay = isInRange ? 0 : 200;
    setTimeout(() => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.playVideo();
      }
      
      // 设置定时器在结束时间暂停
      const remainingDuration = (endTime - playFromTime) * 1000; // 转换为毫秒
      if (remainingDuration > 0) {
        setTimeout(() => {
          if (videoPlayerRef.current) {
            videoPlayerRef.current.pauseVideo();
          }
          setVideoSeekTime(endTime);
          setCurrentPlayingClipId(null);
        }, remainingDuration);
      }
    }, delay);
  }, [isVideoPlaying, currentVideoTime]);

  /**
   * 处理视频播放状态变化
   */
  const handleVideoPlayStateChange = useCallback((isPlaying: boolean) => {
    setIsVideoPlaying(isPlaying);
  }, []);

  // 判断是否有激活的定位状态
  const isLocationMode = locationActiveClipId !== null;

  /**
   * 重置seekToTime以支持重复触发
   */
  useEffect(() => {
    if (videoSeekTime !== undefined) {
      const timer = setTimeout(() => {
        setVideoSeekTime(undefined);
      }, 500); // 500ms后重置
      return () => clearTimeout(timer);
    }
  }, [videoSeekTime]);

  /**
   * 处理素材库选择按钮点击
   */
  const handleMaterialSelectClick = useCallback(() => {
    setShowMaterialModal(true);
  }, []);

  /**
   * 处理素材库选择
   */
  const handleMaterialSelect = useCallback((material: MaterialModel) => {
    // 根据material中的materialID找到对应的MaterialLibItem
    // 这里需要从本地缓存或API获取完整的MaterialLibItem信息
    const materialLibItem: MaterialLibItem = {
      _id: material.materialID,
      name: material.name,
      coverUrl: material.previewUrl || '',
      url: material.url || '',
      type: 'only', // 默认类型
      nums: 0 // 默认数量
    };
    
    setSelectedMaterial(materialLibItem);
    setShowMaterialModal(false);
    toast.success(`已选择素材：${material.name}`);
  }, []);

  /**
   * 处理素材库弹窗关闭
   */
  const handleMaterialModalClose = useCallback(() => {
    setShowMaterialModal(false);
  }, []);

  if (loading) {
    return (
      <div className="video-edit-page">
        <div className="loading-container">
          <div className="loading-text">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !taskData) {
    return (
      <div className="video-edit-page">
        <div className="error-container">
          <div className="error-text">{error || '数据加载失败'}</div>
          <div className="retry-button" onClick={() => window.location.reload()}>
            重试
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-edit-page">
      {/* 顶部导航栏 - 固定位置 */}
      <div className="page-header">
        <div className="back-button" onClick={handleBackClick}>
          <BackIcon />
        </div>
        <span className="page-title">视频剪辑</span>
        <div className="submit-button" onClick={handleSubmitClick}>
          提交
        </div>
      </div>
      
      {/* 视频播放器区域 - 固定位置 */}
      <div className="video-section">
        <VideoPlayer
          videoUrl={taskData.video_url || ''}
          coverUrl={taskData.preview_image}
          seekToTime={videoSeekTime}
          showProgressBar={showProgressBar}
          isLocationMode={isLocationMode}
          onTimeUpdate={handleVideoTimeUpdate}
          onDragging={handleDragging}
          onSeekEnd={() => {
            // 拖拽结束后重置视频跳转时间（但保持定位模式）
            if (!isLocationMode) {
              setVideoSeekTime(undefined);
            }
          }}
          onPlayStateChange={handleVideoPlayStateChange}
          ref={videoPlayerRef}
        />
      </div>
      
      {/* 视频切片列表 - 可滚动区域 */}
      <div className="clips-section">
        <div className="clips-header">
          <div className="material-select-entry" onClick={handleMaterialSelectClick}>
            <div className="material-select-title">
              {selectedMaterial ? selectedMaterial.name : '选择素材库'}
            </div>
            <div className="material-select-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="clips-header-right">
            <span className="clips-count">{clips.length} 个切片</span>
            <div className="reset-button" onClick={handleResetClick}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C10.39 21 8.88 20.57 7.58 19.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 16V12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              重置
            </div>
          </div>
        </div>
        
        <div className="clips-list">
          {clips.map((clip, index) => (
            <VideoClipItemComponent
              key={clip.id}
              ref={(ref) => {
                if (ref) {
                  clipRefs.current.set(clip.id, ref);
                } else {
                  clipRefs.current.delete(clip.id);
                }
              }}
              clip={clip}
              index={index}
              isLocationActive={locationActiveClipId === clip.id}
              activeLocationField={locationActiveClipId === clip.id ? locationActiveField : null}
              isPlaying={currentPlayingClipId === clip.id}
              onTitleChange={handleTitleChange}
              onTextChange={handleTextChange}
              onTimeChange={handleTimeChange}
              onTimeInputCommit={handleTimeInputCommit}
              onTimeAdjust={handleTimeAdjust}
              onLocationClick={handleLocationClick}
              onTimeFocus={handleTimeFocus}
              onEnterClip={handleEnterClip}
              onPlayClip={handlePlayClip}
              onDeleteClip={handleDeleteClip}
            />
          ))}
        </div>
      </div>
      
      {/* 素材库选择弹窗 */}
      {showMaterialModal && (
        <MaterialSelectModal
          onClose={handleMaterialModalClose}
          onSelect={handleMaterialSelect}
          currentMaterialId={selectedMaterial?._id}
        />
      )}
    </div>
  );
};

export default VideoEditPage; 