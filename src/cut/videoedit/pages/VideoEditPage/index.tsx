/**
 * 视频剪辑页面
 * 整合视频播放器和切片列表
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackIcon } from '../../../../components/icons';
import VideoPlayer, { VideoPlayerRef } from '../../../../components/VideoPlayer';
import VideoClipItemComponent, { VideoClipItemRef } from '../../../videoedit/components/VideoClipItem';
import MaterialSelectModal from '../../../../edit/components/meterialSelect/MaterialSelectModal';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import VideoCropModal from '../../components/VideoCropModal';
import TimeOffsetModal from '../../components/TimeOffsetModal';
import { getParseTaskDetail, addMaterialVideo, translateText, CropParams } from '../../api';
import { deleteTask } from '../../../../cut/videoSlice/api';
import { ParseTaskDetail, VideoClipItem, VideoEditState, SegmentInfo, MaterialFileItem, MaterialFileStore } from '../..';
import { MaterialLibItem, MaterialModel } from '../../../../edit/api/types';
import { formatTime, parseTime, findPreciseTimeRangeByText, generateId, saveVideoEditState, loadVideoEditState, convertSpacedPositionToPurePosition, removePunctuationAndSpaces } from '../../../videoedit/utils';
import { toast } from '../../../../components/Toast';
import { CacheStatus, videoCacheManager } from '../../../../utils/videoCacheManager';
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
  const [translatedText, setTranslatedText] = useState<string | null>(null);
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
  
  // 素材库文件信息状态
  const [materialFileStore, setMaterialFileStore] = useState<MaterialFileStore>({
    files: {},
    directories: []
  });
  
  // 定位状态
  const [locationActiveClipId, setLocationActiveClipId] = useState<string | null>(null);
  const [locationActiveField, setLocationActiveField] = useState<'start' | 'end' | null>(null);
  const [locationActiveIndex, setLocationActiveIndex] = useState<number>(-1);

  // 去字幕选项状态
  const [needRemoveSubtitle, setNeedRemoveSubtitle] = useState<boolean>(false);
  
  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 删除确认弹窗状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // 翻译状态
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);

  // 裁剪相关状态
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [cropParams, setCropParams] = useState<CropParams | null>(null);

  // 时间偏移相关状态
  const [showTimeOffsetModal, setShowTimeOffsetModal] = useState<boolean>(false);
  const [timeOffset, setTimeOffset] = useState<number>(0.0);

  // 视频缓存相关状态
  const [enableVideoCache, setEnableVideoCache] = useState<boolean>(true); // 默认启用缓存
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>(CacheStatus.NOT_CACHED);
  const [cacheProgress, setCacheProgress] = useState<number>(0);
  const [showCacheButton, setShowCacheButton] = useState<boolean>(true);

  // 素材库记忆键
  const getMaterialStorageKey = (taskId: string) => `selected_material_${taskId}`;

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
        console.log('initData language:', data.video_info?.language);
        
        // 检查视频缓存状态（默认启用缓存功能）
        if (data.video_url) {
          const initialCacheStatus = videoCacheManager.getCacheStatus(data.video_url);
          setCacheStatus(initialCacheStatus);
          console.log('初始缓存状态:', initialCacheStatus);
          
          // 如果已经缓存过，隐藏缓存按钮并显示提示
          if (initialCacheStatus === CacheStatus.CACHED) {
            setShowCacheButton(false);
            toast.info('检测到视频已缓存，将使用本地播放');
          } else if (initialCacheStatus === CacheStatus.CACHE_FAILED) {
            // 如果之前缓存失败，重置为未缓存状态，允许重新缓存
            setCacheStatus(CacheStatus.NOT_CACHED);
          }
        }
        
        if (savedState) {
          // 使用保存的状态
          setClips(savedState.clips);
          setMode(savedState.mode);
          // 恢复时间偏移设置
          if (savedState.timeOffset !== undefined) {
            setTimeOffset(savedState.timeOffset);
          }
          // 恢复裁剪参数
          if (savedState.cropParams) {
            setCropParams(savedState.cropParams);
          }
        } else {
          // 初始化默认状态 - 直接使用获取的data创建默认切片
          const text = data.text || '';
          if (text && data.video_info) {
            // 设置默认标题为text内容的前20个字符
            const defaultTitle = text.length > 20 ? text.substring(0, 20) + '...' : text;
            
            const defaultClip: VideoClipItem = {
              id: generateId(),
              title: defaultTitle,
              text: text,
              startTime: 0,
              endTime: data.video_info.file_duration,
              isDefault: true
            };
            setClips([defaultClip]);
          }
        }
        
        // 恢复素材库选择
        await loadMaterialSelection();
        
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
        cursorPosition: 0, // 不再需要光标位置
        timeOffset,
        cropParams: cropParams || undefined
      };
      saveVideoEditState(id, state);
    }, 500); // 500ms防抖
    
    return () => clearTimeout(timer);
  }, [id, clips, mode, timeOffset, cropParams]);

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
   * 清理切片名称中的非法字符
   */
  const cleanClipName = (name: string): string => {
    return name.replace(/[\r\n\s\t\u00A0\u2000-\u200B\u2028\u2029]+/g, '').trim();
  };

  /**
   * 检查切片名称是否有冲突
   */
  const checkClipNameConflicts = useCallback((clips: VideoClipItem[]): string[] => {
    const conflicts: string[] = [];
    const usedNames = new Set<string>();
    
    // 获取素材库中的文件名（去掉扩展名）
    const materialFileNames = new Set<string>();
    Object.keys(materialFileStore.files).forEach(fileName => {
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, ''); // 去掉扩展名
      const cleanedName = cleanClipName(nameWithoutExt);
      if (cleanedName) {
        materialFileNames.add(cleanedName);
      }
    });
    
    clips.forEach(clip => {
      const originalName = clip.title || '';
      const cleanedName = cleanClipName(originalName);
      
      if (cleanedName) {
        // 检查与素材库文件名的冲突
        if (materialFileNames.has(cleanedName)) {
          conflicts.push(`"${originalName}" 与素材库文件冲突`);
        }
        
        // 检查与已使用的切片名称的冲突
        if (usedNames.has(cleanedName)) {
          conflicts.push(`"${originalName}" 与其他切片重复`);
        } else {
          usedNames.add(cleanedName);
        }
      }
    });
    
    return conflicts;
  }, [materialFileStore.files]);

  /**
   * 处理文本切片 - 在指定切片上进行切片操作
   */
  const handleTextClip = (clipId: string, position: number) => {
    if (!taskData?.segments) return;

    stopPlay();
    
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
    
    // 获取当前切片在clips数组中的索引
    const currentClipIndex = clips.findIndex(clip => clip.id === clipId);
    
    //处理 SegmentInfo.words为空的情况，切片的 startTime 和 endTime为0
    let timeRange = { startTime: 0, endTime: taskData?.video_info?.file_duration || 0};
    if (taskData.segments.length > 0 && taskData.segments[0].words && taskData.segments[0].words.length > 0) {
      // 使用精确的时间算法
      timeRange = findPreciseTimeRangeByText(
        fullOriginalText,
        textBeforeCursor,
        clipStartInFullText,
        taskData.segments
      );
      
      // 应用时间偏移修正
      timeRange.startTime = Math.max(0, timeRange.startTime + timeOffset); // 开始时间向后偏移
      timeRange.endTime = Math.max(timeRange.startTime, timeRange.endTime - timeOffset); // 结束时间向前偏移
    }
    
    // 特殊处理：如果当前选中要切割的Item的开始时间为0，则使用上一个Item的结束时间作为起始时间
    if (currentClip.startTime === 0 && currentClipIndex > 0) {
      const previousClip = clips[currentClipIndex - 1];
      if (previousClip && previousClip.endTime > 0) {
        timeRange.startTime = previousClip.endTime;
        console.log(`当前切片开始时间为0，使用上一个切片的结束时间作为起始时间: ${previousClip.endTime}`);
      }
    }
    
    // 创建新切片
    const newClip: VideoClipItem = {
      id: generateId(),
      title: textBeforeCursor.length > 20 ? textBeforeCursor.substring(0, 20) + '...' : textBeforeCursor,
      text: textBeforeCursor,
      startTime: timeRange.startTime,
      endTime: timeRange.endTime,
      folder: currentClip.folder
    };
    
    // 计算剩余文本的开始时间
    let remainingStartTime = 0;
    if (taskData.segments.length > 0 && taskData.segments[0].words && taskData.segments[0].words.length > 0) {
      remainingStartTime = findPreciseTimeRangeByText(
      fullOriginalText,
      textAfterCursor,
      clipStartInFullText + textBeforeCursor.length,
      taskData.segments
      ).startTime;
      
      // 应用时间偏移修正 - 剩余文本的开始时间向后偏移
      remainingStartTime = Math.max(0, remainingStartTime + timeOffset);
    }
    
    // 为剩余文本设置新的标题
    const remainingTitle = textAfterCursor.length > 20 
      ? textAfterCursor.substring(0, 20) 
      : textAfterCursor;
    
    // 更新切片列表
    setClips(prevClips => {
      const newClips = [...prevClips];
      const currentIndex = newClips.findIndex(clip => clip.id === clipId);
      
      if (currentIndex !== -1) {
        // 更新当前切片为剩余文本，重新设置标题
        const updatedCurrentClip: VideoClipItem = {
          ...currentClip,
          title: remainingTitle,
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
  const handleSubmitClick = async () => {
    if (!taskData || !selectedMaterial) {
      toast.error('请先选择素材库');
      return;
    }
    
    if (clips.length === 0) {
      toast.error('请至少添加一个切片');
      return;
    }
    
    // 检查是否有空的切片标题
    const hasEmptyTitle = clips.some(clip => !clip.title || !clip.title.trim());
    if (hasEmptyTitle) {
      toast.error('请为所有切片设置名称');
      return;
    }
    
    // 检查切片名称是否有冲突
    const conflicts = checkClipNameConflicts(clips);
    if (conflicts.length > 0) {
      toast.error(conflicts.join('\n'));
      return;
    }

    stopPlay();
    
    setIsSubmitting(true);
    
    try {
      const result = await addMaterialVideo({
        taskData,
        clips,
        selectedMaterial,
        needRemoveSubtitle,
        cropParams: cropParams || undefined
      });
      
      toast.success('提交成功！' + (result.message || ''));
      
      // 成功后回到上一页
      navigate(-1);
      
      // 通知上一页刷新数据（通过广播事件）
      window.dispatchEvent(new CustomEvent('refreshVideoSliceList'));
      
    } catch (error: any) {
      console.error('提交失败:', error);
      toast.error(error.message || '提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 处理重置按钮点击
   */
  const handleResetClick = () => {
    if (!id) return;

    stopPlay();
    
    // 清空本地存储
    try {
      const key = `video_edit_state_${id}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('清空本地存储失败:', error);
    }
    
    if (taskData?.video_info) {
      let text = taskData.text || '';
      if (translatedText) {
        text = translatedText;
      }
      // 设置默认标题为text内容的前20个字符
      const defaultTitle = text?.length && text.length > 20 ? text?.substring(0, 20) + '...' : text;
      
      const defaultClip: VideoClipItem = {
        id: generateId(),
        title: defaultTitle || '',
        text: text || '',
        startTime: 0,
        endTime: taskData.video_info.file_duration,
        isDefault: true
      };
      setClips([defaultClip]);
    }
    
    // 重置其他状态
    setLocationActiveClipId(null);
    setLocationActiveField(null);
    setLocationActiveIndex(-1);
    setVideoSeekTime(0);
    setHasTranslated(false);
    
    toast.success('已重置到初始状态');
  };

  /**
   * 处理标题变化 - 保留useCallback，因为会传递给子组件
   */
  const handleTitleChange = useCallback((clipId: string, title: string) => {
    // 清理标题中的非法字符
    const cleanedTitle = cleanClipName(title);
    
    setClips(prevClips => 
      prevClips.map(clip => 
        clip.id === clipId ? { ...clip, title: cleanedTitle } : clip
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
   * 处理切片时间输入提交（专门用于处理定位模式）
   */
  const handleTimeInputCommit = useCallback((clipId: string, field: 'start' | 'end', value: string) => {
    try {
      stopPlay();

      const newTime = parseTime(value);
      
      setClips(prevClips => 
        prevClips.map(clip => 
          clip.id === clipId 
            ? { ...clip, [field === 'start' ? 'startTime' : 'endTime']: newTime }
            : clip
        )
      );
      
      // 如果处于定位模式，并且是当前激活的切片，则跳转到视频对应时间
      if (locationActiveClipId === clipId && locationActiveField === field) {
        setVideoSeekTime(newTime);
      }
    } catch (error) {
      console.error('时间解析失败:', error);
    }
  }, [locationActiveClipId, locationActiveField]);

  /**
   * 处理时间微调
   */
  const handleTimeAdjust = useCallback((clipId: string, field: 'start' | 'end', delta: number) => {
    stopPlay();
    setClips(prevClips => 
      prevClips.map(clip => {
        if (clip.id === clipId) {
          
          const currentTime = field === 'start' ? Math.round(clip.startTime * 10) / 10 : Math.round(clip.endTime * 10) / 10;
          //四舍五入
          const newTime = Math.round(Math.max(0, currentTime + delta) * 10) / 10;

          
          // 如果处于定位模式，并且是当前激活的切片，则跳转到视频对应时间
          // if (locationActiveClipId === clipId && locationActiveField === field) {
            setVideoSeekTime(newTime);
          // }
          
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
    stopPlay();
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
    stopPlay();
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
    stopPlay();
   
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
    stopPlay();
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
    stopPlay();
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

  const stopPlay = () => {
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }

    if (videoPlayerRef.current) {
      videoPlayerRef.current.pauseVideo();
    }
    setCurrentPlayingClipId(null);
  }

  let delayTimer: NodeJS.Timeout | null = null;
  /**
   * 处理播放切片
   */
  const handlePlayClip = useCallback((clipId: string, startTime: number, endTime: number) => {
    // 如果当前正在播放，直接暂停
    if (isVideoPlaying) {
      stopPlay();
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
    delayTimer = setTimeout(() => {
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
   * 从素材库JSON文件中递归提取文件和文件夹信息
   */
  const extractFileInfo = (item: MaterialFileItem, parentPath: string = ''): void => {
    if (item.type === 'file') {
      // 存储文件信息
      setMaterialFileStore(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [item.name]: item
        }
      }));
    } else if (item.type === 'directory') {
      // 存储文件夹信息
      const dirPath = parentPath ? `${parentPath}/${item.name}` : item.name;
      setMaterialFileStore(prev => ({
        ...prev,
        directories: prev.directories.includes(dirPath) ? prev.directories : [...prev.directories, dirPath]
      }));
      
      // 递归处理子项
      if (item.children) {
        item.children.forEach(child => extractFileInfo(child, dirPath));
      }
    }
  };

  /**
   * 读取素材库文件信息
   */
  const loadMaterialFiles = async (materialUrl: string) => {
    try {
      const response = await fetch(materialUrl);
      if (!response.ok) {
        throw new Error('无法获取素材库文件信息');
      }
      
      const materialData: MaterialFileItem = await response.json();
      
      // 重置文件存储
      setMaterialFileStore({
        files: {},
        directories: []
      });
      
      // 递归提取文件和文件夹信息
      extractFileInfo(materialData);
      
      console.log('素材库文件信息加载完成:', materialData);
    } catch (error) {
      console.error('加载素材库文件信息失败:', error);
      toast.error('加载素材库文件信息失败');
    }
  };

  /**
   * 处理素材库选择
   */
  const handleMaterialSelect = useCallback(async (material: MaterialModel) => {
    // 根据material中的materialID找到对应的MaterialLibItem
    // 这里需要从本地缓存或API获取完整的MaterialLibItem信息
    const materialLibItem: MaterialLibItem = {
      _id: material.materialID,
      name: material.name,
      coverUrl: material.previewUrl || '',
      url: material.url || '',
      type: material.type,
      nums: material.nums || 0,
      contentType: material.contentType,
      contentSubtype: material.contentSubtype
    };
    
    setSelectedMaterial(materialLibItem);
    setShowMaterialModal(false);
    toast.success(`已选择素材：${material.name}`);
    
    // 保存素材库选择
    saveMaterialSelection(materialLibItem);
    
    // 读取素材库文件信息
    if (materialLibItem.url) {
      await loadMaterialFiles(materialLibItem.url);
    }
  }, []);

  /**
   * 处理素材库弹窗关闭
   */
  const handleMaterialModalClose = useCallback(() => {
    setShowMaterialModal(false);
  }, []);

  /**
   * 处理切片文件夹变化
   */
  const handleFolderChange = useCallback((id: string, folder: string) => {
    setClips(prevClips => {
      const newClips = prevClips.map(clip => 
        clip.id === id ? { ...clip, folder } : clip
      );
      // 立即保存状态，确保文件夹变化不会被覆盖
      if (taskData?.id) {
        const state: VideoEditState = {
          text: '',
          clips: newClips,
          mode,
          cursorPosition: 0,
          timeOffset,
          cropParams: cropParams || undefined
        };
        saveVideoEditState(taskData.id, state);
      }
      return newClips;
    });
  }, [taskData?.id, mode]);

  /**
   * 保存选中的素材库到本地存储
   */
  const saveMaterialSelection = (material: MaterialLibItem) => {
    if (id) {
      localStorage.setItem(getMaterialStorageKey(id), JSON.stringify(material));
    }
  };

  /**
   * 从本地存储恢复素材库选择
   */
  const loadMaterialSelection = async () => {
    if (!id) return;
    
    try {
      const savedMaterial = localStorage.getItem(getMaterialStorageKey(id));
      if (savedMaterial) {
        const material: MaterialLibItem = JSON.parse(savedMaterial);
        setSelectedMaterial(material);
        
        // 重新加载文件信息
        if (material.url) {
          await loadMaterialFiles(material.url);
        }
      }
    } catch (error) {
      console.error('恢复素材库选择失败:', error);
    }
  };

  /**
   * 处理删除按钮点击
   */
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  /**
   * 确认删除任务
   */
  const handleConfirmDelete = async () => {
    if (!taskData) return;
    
    setShowDeleteConfirm(false);
    
    try {
      await deleteTask(taskData.id);
      toast.success('删除成功');
      
      // 清理本地存储
      if (id) {
        try {
          const key = `video_edit_state_${id}`;
          localStorage.removeItem(key);
          localStorage.removeItem(getMaterialStorageKey(id));
        } catch (error) {
          console.error('清理本地存储失败:', error);
        }
      }
      
      // 回到上一页
      navigate(-1);
      
      // 通知上一页刷新数据
      window.dispatchEvent(new CustomEvent('refreshVideoSliceList'));
      
    } catch (error: any) {
      console.error('删除失败:', error);
      toast.error(error.message || '删除失败，请重试');
    }
  };

  /**
   * 取消删除
   */
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * 处理翻译功能
   */
  const handleTranslate = async () => {
    if (!taskData?.text || isTranslating) {
      return;
    }

    setIsTranslating(true);

    try {
      const result = await translateText(taskData.text);
      const translatedText = result.text;
      setTranslatedText(translatedText);
      console.log('handleTranslate translatedText', translatedText);

      // 翻译成功，更新第一个切片的文本
      if (clips.length > 0) {
        setClips(prevClips => 
          prevClips.map((clip, index) => 
            index === 0 
              ? { 
                  ...clip, 
                  text: translatedText,
                  title: translatedText.length > 20 ? translatedText.substring(0, 20) + '...' : translatedText
                } 
              : clip
          )
        );
        
        setHasTranslated(true);
        toast.success('翻译成功');
      }
    } catch (error: any) {
      console.error('翻译请求失败:', error);
      toast.error(error.message || '翻译失败，请稍后重试');
    } finally {
      setIsTranslating(false);
    }
  };

  /**
   * 处理裁剪按钮点击
   */
  const handleCropClick = useCallback(() => {
    setShowCropModal(true);
  }, []);

  /**
   * 处理裁剪浮层关闭
   */
  const handleCropModalClose = useCallback(() => {
    setShowCropModal(false);
  }, []);

  /**
   * 处理裁剪确认
   */
  const handleCropConfirm = useCallback((params: CropParams) => {
    setCropParams(params);
    setShowCropModal(false);
    toast.success('裁剪范围已设置');
  }, []);

  /**
   * 处理时间偏移按钮点击
   */
  const handleTimeOffsetClick = useCallback(() => {
    setShowTimeOffsetModal(true);
  }, []);

  /**
   * 处理时间偏移浮层关闭
   */
  const handleTimeOffsetModalClose = useCallback(() => {
    setShowTimeOffsetModal(false);
  }, []);

  /**
   * 处理时间偏移确认
   */
  const handleTimeOffsetConfirm = useCallback((offset: number) => {
    setTimeOffset(offset);
    setShowTimeOffsetModal(false);
    toast.success(`时间偏移已设置为 ${offset} 秒`);
  }, []);

  /**
   * 处理视频缓存状态变化
   */
  const handleCacheStatusChange = useCallback((status: CacheStatus, progress?: number) => {
    setCacheStatus(status);
    if (progress !== undefined) {
      setCacheProgress(progress);
    }

    // 根据状态显示不同的提示
    switch (status) {
      case CacheStatus.CACHING:
        if (progress === 0) {
          toast.info('开始缓存视频...');
        }
        break;
      case CacheStatus.CACHED:
        toast.success('视频缓存完成，已切换到本地播放');
        setShowCacheButton(false); // 缓存完成后隐藏缓存按钮
        break;
      case CacheStatus.CACHE_FAILED:
        toast.error('视频缓存失败，将继续使用在线播放');
        break;
    }
  }, []);

  /**
   * 开始缓存视频
   */
  const handleStartCaching = useCallback(async () => {
    if (videoPlayerRef.current) {
      try {
        await videoPlayerRef.current.startCaching();
      } catch (error) {
        console.error('启动视频缓存失败:', error);
        toast.error('启动视频缓存失败');
      }
    }
  }, []);

  /**
   * 切换缓存模式
   */
  const handleToggleCacheMode = useCallback(() => {
    setEnableVideoCache(prev => {
      const newValue = !prev;
      if (newValue) {
        toast.info('已启用视频缓存功能');
        // 启用缓存时，检查当前视频是否已缓存
        if (taskData?.video_url) {
          const currentStatus = videoCacheManager.getCacheStatus(taskData.video_url);
          setCacheStatus(currentStatus);
          if (currentStatus === CacheStatus.CACHED) {
            setShowCacheButton(false);
            toast.info('视频已缓存，将使用本地播放');
          } else {
            setShowCacheButton(true);
          }
        } else {
          setShowCacheButton(true);
        }
      } else {
        toast.info('已关闭视频缓存功能');
        setShowCacheButton(false);
        setCacheStatus(CacheStatus.NOT_CACHED);
      }
      return newValue;
    });
  }, [taskData]);

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
        <div className="video-back-button" onClick={handleBackClick}>
          <BackIcon />
        </div>
        <span className="page-title">视频剪辑</span>
        <div className="header-actions">
          <div className="page-delete-button" onClick={handleDeleteClick}>
            删除
          </div>
          <div 
            className={`submit-button ${isSubmitting ? 'submitting' : ''}`} 
            onClick={isSubmitting ? undefined : handleSubmitClick}
          >
            {isSubmitting ? '提交中...' : '提交'}
          </div>
        </div>
      </div>
      
      {/* 视频播放器区域 - 固定位置 */}
      <div className="video-section">
        <div className="video-player-wrapper">
          <VideoPlayer
            videoUrl={taskData.video_url || ''}
            coverUrl={taskData.preview_image}
            seekToTime={videoSeekTime}
            showProgressBar={showProgressBar}
            isLocationMode={isLocationMode}
            enableCache={enableVideoCache}
            onTimeUpdate={handleVideoTimeUpdate}
            onDragging={handleDragging}
            onSeekEnd={() => {
              // 拖拽结束后重置视频跳转时间（但保持定位模式）
              if (!isLocationMode) {
                setVideoSeekTime(undefined);
              }
            }}
            onPlayStateChange={handleVideoPlayStateChange}
            onCacheStatusChange={handleCacheStatusChange}
            ref={videoPlayerRef}
          />
          
          {/* 裁剪控制区域 */}
          <div className="video-crop-controls">
            {cropParams && (
              <div className="crop-status-text">已选定裁剪范围</div>
            )}
            <div className="crop-button" onClick={handleCropClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* 时间偏移控制区域 - 只有当segments[0].words不为空时才显示 */}
          {taskData?.segments && taskData.segments.length > 0 && taskData.segments[0].words && taskData.segments[0].words.length > 0 && (
            <div className="video-time-offset-controls">
              {timeOffset !== 0 && (
                <div className="time-offset-status-text">
                  时间偏移: {timeOffset.toFixed(1)}s
                </div>
              )}
              <div className="time-offset-button" onClick={handleTimeOffsetClick}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 18L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          )}

          {/* 视频缓存控制区域 */}
          <div className="video-cache-controls">
            {/* 缓存状态显示 */}
            {cacheStatus !== CacheStatus.NOT_CACHED && (
              <div className={`cache-status-display ${cacheStatus.toLowerCase().replace('_', '-')}`}>
                {cacheStatus === CacheStatus.CACHING && (
                  <span className="cache-progress-text">缓存中 {Math.round(cacheProgress)}%</span>
                )}
                {cacheStatus === CacheStatus.CACHED && (
                  <span className="cache-status-text">已缓存</span>
                )}
                {cacheStatus === CacheStatus.CACHE_FAILED && (
                  <span className="cache-status-text">缓存失败</span>
                )}
              </div>
            )}

            {/* 缓存模式切换按钮 */}
            <div 
              className={`cache-mode-toggle ${enableVideoCache ? 'enabled' : 'disabled'}`}
              onClick={handleToggleCacheMode}
              title={enableVideoCache ? '点击关闭缓存模式' : '点击开启缓存模式'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="7.5,4.21 12,6.81 16.5,4.21" stroke="currentColor" strokeWidth="2"/>
                <polyline points="7.5,19.79 7.5,14.6 3,12" stroke="currentColor" strokeWidth="2"/>
                <polyline points="21,12 16.5,14.6 16.5,19.79" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,22.81 12,17" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="6.81" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>

            {/* 缓存按钮 - 只在启用缓存且未缓存时显示 */}
            {enableVideoCache && showCacheButton && cacheStatus === CacheStatus.NOT_CACHED && (
              <div 
                className="cache-button"
                onClick={handleStartCaching}
                title="开始缓存视频到本地"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
        </div>
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
          
          {/* 是否去字幕选项 */}
          <div className="subtitle-remove-option">
            <label className="subtitle-checkbox">
              <input
                type="checkbox"
                checked={needRemoveSubtitle}
                onChange={(e) => setNeedRemoveSubtitle(e.target.checked)}
              />
              <span className="checkbox-label">去字幕</span>
            </label>
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
        
        {/* 翻译功能区域 - 只在非中文语言且未翻译时显示 */}
        {taskData?.video_info?.language && taskData.video_info.language !== 'zh' && !hasTranslated && (
          <div className="translate-section">
            <span 
              className={`translate-label ${isTranslating ? 'translating' : ''}`}
              onClick={isTranslating ? undefined : handleTranslate}
            >
              {isTranslating && (
                <span className="translate-loading">
                  <span className="loading-spinner"></span>
                </span>
              )}
              {isTranslating ? '翻译中...' : '翻译'}
            </span>
          </div>
        )}
        
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
              hasMaterial={!!selectedMaterial}
              materialFileStore={materialFileStore}
              onTitleChange={handleTitleChange}
              onTextChange={handleTextChange}
              onFolderChange={handleFolderChange}
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

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="确认删除"
        message="确定要删除这个任务吗？删除后无法恢复，请谨慎操作。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* 视频裁剪浮层 */}
      {showCropModal && (
        <VideoCropModal
          taskData={taskData}
          visible={showCropModal} 
          onClose={handleCropModalClose}
          onConfirm={handleCropConfirm}
          initialCropParams={cropParams || undefined}
        />
      )}

      {/* 时间偏移设置浮层 */}
      <TimeOffsetModal
        visible={showTimeOffsetModal}
        initialOffset={timeOffset}
        onClose={handleTimeOffsetModalClose}
        onConfirm={handleTimeOffsetConfirm}
      />
    </div>
  );
};

export default VideoEditPage; 