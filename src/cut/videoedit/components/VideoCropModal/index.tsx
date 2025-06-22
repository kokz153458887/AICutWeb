/**
 * 视频裁剪浮层组件
 * 支持选择裁剪范围、调整比例和拖动定位
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPlayer, { VideoPlayerRef } from '../../../../components/VideoPlayer';
import { CropParams } from '../../api';
import { ParseTaskDetail } from '../..';
import './styles.css';

// 裁剪比例选项
const CROP_RATIOS = [
  { label: '1:1', ratio: 1 },
  { label: '4:3', ratio: 4/3 },
  { label: '3:4', ratio: 3/4 },
  { label: '16:9', ratio: 16/9 },
  { label: '9:16', ratio: 9/16 },
  { label: '自定义', ratio: -1 } // 特殊标记用于自定义比例
];

// 本地存储键名
const LAST_CROP_RATIO_KEY = 'video_crop_last_ratio';

interface VideoCropModalProps {
  taskData: ParseTaskDetail;
  visible: boolean;
  onClose: () => void;
  onConfirm: (cropParams: CropParams) => void;
  initialCropParams?: CropParams;
}

/**
 * 视频裁剪浮层组件
 * 提供可视化的视频裁剪范围选择功能
 */
const VideoCropModal: React.FC<VideoCropModalProps> = ({
  taskData,
  visible,
  onClose,
  onConfirm,
  initialCropParams
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  
  const [selectedRatio, setSelectedRatio] = useState<number>(1); // 默认1:1
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0, displayWidth: 0, displayHeight: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 新增状态用于控制拖拽模式
  const [dragMode, setDragMode] = useState<'move' | 'resize-width' | 'resize-height' | null>(null);
  const [isCustomRatio, setIsCustomRatio] = useState(false); // 是否为自定义比例

  /**
   * 保存上次选择的比例到本地存储
   */
  const saveLastRatio = useCallback((ratio: number) => {
    try {
      localStorage.setItem(LAST_CROP_RATIO_KEY, ratio.toString());
    } catch (error) {
      console.warn('保存裁剪比例失败:', error);
    }
  }, []);

  /**
   * 从本地存储读取上次选择的比例
   */
  const getLastRatio = useCallback((): number => {
    try {
      const saved = localStorage.getItem(LAST_CROP_RATIO_KEY);
      if (saved) {
        const ratio = parseFloat(saved);
        // 检查是否为有效的预设比例
        const isPresetRatio = CROP_RATIOS.some(r => r.ratio === ratio && r.ratio !== -1);
        return isPresetRatio ? ratio : 1; // 如果不是预设比例，使用默认1:1
      }
    } catch (error) {
      console.warn('读取裁剪比例失败:', error);
    }
    return 1; // 默认1:1
  }, []);

  /**
   * 解析视频分辨率
   */
  const parseResolution = useCallback((resolution: string) => {
    const [width, height] = resolution.split('x').map(Number);
    return { width: width || 640, height: height || 360 };
  }, []);

  /**
   * 获取视频尺寸信息
   */
  const getVideoSize = useCallback(() => {
    // 优先使用传入的分辨率信息，因为更准确
    const resolution = parseResolution(taskData.video_info?.resolution || '640x360');
    const videoWidth = resolution.width;
    const videoHeight = resolution.height;

    console.log('视频分辨率信息:', { resolution: taskData.video_info?.resolution, videoWidth, videoHeight });

    // 防止尺寸为0的情况
    if (videoWidth === 0 || videoHeight === 0) {
      console.warn('视频尺寸为0，使用默认尺寸');
      return { width: 640, height: 360 };
    }

    return { width: videoWidth, height: videoHeight };
  }, [taskData.video_info?.resolution, parseResolution]);

  /**
   * 计算视频显示尺寸和位置
   */
  const calculateVideoDisplay = useCallback((originalWidth: number, originalHeight: number) => {
    if (!containerRef.current) return { width: 0, height: 0, displayWidth: 0, displayHeight: 0 };

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40; // 减少边距
    const containerHeight = container.clientHeight; // 留出底部控制区域

    // 计算缩放比例，保持宽高比
    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY, 0.9); // 适当缩小以留出空间

    const displayWidth = originalWidth * scale;
    const displayHeight = originalHeight * scale;

    console.log('视频显示尺寸计算:', {
      原始尺寸: { originalWidth, originalHeight },
      容器尺寸: { containerWidth, containerHeight },
      缩放比例: scale,
      显示尺寸: { displayWidth, displayHeight }
    });

    return {
      width: originalWidth,
      height: originalHeight,
      displayWidth,
      displayHeight
    };
  }, []);

  /**
   * 初始化裁剪框
   */
  const initializeCropBox = useCallback((displayWidth: number, displayHeight: number) => {
    if (initialCropParams && 
        typeof initialCropParams.cropStartXRatio === 'number' &&
        typeof initialCropParams.cropStartYRatio === 'number' &&
        typeof initialCropParams.cropEndXRatio === 'number' &&
        typeof initialCropParams.cropEndYRatio === 'number') {
      // 使用传入的初始参数
      const { cropStartXRatio: cropStartX, cropStartYRatio: cropStartY, cropEndXRatio: cropEndX, cropEndYRatio: cropEndY } = initialCropParams;
      const width = cropEndX - cropStartX;
      const height = cropEndY - cropStartY;
      
      setCropBox({
        x: cropStartX * displayWidth,
        y: cropStartY * displayHeight,
        width: width * displayWidth,
        height: height * displayHeight
      });
      
      // 根据初始参数计算比例
      if (width > 0 && height > 0) {
        setSelectedRatio(width / height);
      }
    } else {
      // 默认创建完全覆盖视频的裁剪框
      setCropBox({
        x: 0,
        y: 0,
        width: displayWidth,
        height: displayHeight
      });
      
      // 从本地存储读取上次选择的比例
      const lastRatio = getLastRatio();
      setSelectedRatio(lastRatio);
    }
  }, [initialCropParams, getLastRatio]);

  /**
   * 更新裁剪框比例 - 以视频宽度为基准计算高度
   */
  const updateCropBoxRatio = useCallback((ratio: number, displayWidth: number, displayHeight: number) => {
    setCropBox(prev => {
      // 以视频宽度的80%为基准
      const baseWidth = displayWidth;
      let newWidth = baseWidth;
      let newHeight = baseWidth / ratio;

      // 如果计算出的高度超出视频高度，则以高度为准重新计算宽度
      if (newHeight > displayHeight) {
        newHeight = displayHeight ;
        newWidth = newHeight * ratio;
      }

      // 居中显示
      const newX = (displayWidth - newWidth) / 2;
      const newY = (displayHeight - newHeight) / 2;

      console.log('更新裁剪框比例:', {
        ratio,
        displaySize: { displayWidth, displayHeight },
        cropSize: { newWidth, newHeight },
        position: { newX, newY }
      });

      return {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        width: newWidth,
        height: newHeight
      };
    });
  }, []);

  /**
   * 处理比例选择
   */
  const handleRatioSelect = useCallback((ratio: number) => {
    if (ratio === -1) {
      // 选择自定义比例，不更新裁剪框
      setIsCustomRatio(true);
      return;
    }
    
    setSelectedRatio(ratio);
    setIsCustomRatio(false);
    updateCropBoxRatio(ratio, videoSize.displayWidth, videoSize.displayHeight);
    saveLastRatio(ratio); // 保存选择的比例
  }, [videoSize.displayWidth, videoSize.displayHeight, updateCropBoxRatio, saveLastRatio]);

  /**
   * 处理X轴边框拖拽开始（调整高度）
   */
  const handleXBorderMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode('resize-height');
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  /**
   * 处理Y轴边框拖拽开始（调整宽度）
   */
  const handleYBorderMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode('resize-width');
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  /**
   * 处理X轴边框拖拽开始 - 移动端支持（调整高度）
   */
  const handleXBorderTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode('resize-height');
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  /**
   * 处理Y轴边框拖拽开始 - 移动端支持（调整宽度）
   */
  const handleYBorderTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode('resize-width');
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  /**
   * 处理裁剪框拖拽开始（移动位置）
   */
  const handleCropBoxMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode('move');
    setDragStart({ 
      x: e.clientX - cropBox.x, 
      y: e.clientY - cropBox.y 
    });
  }, [cropBox]);

  /**
   * 处理裁剪框拖拽开始 - 移动端支持
   */
  const handleCropBoxTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode('move');
    const touch = e.touches[0];
    setDragStart({ 
      x: touch.clientX - cropBox.x, 
      y: touch.clientY - cropBox.y 
    });
  }, [cropBox]);

  /**
   * 处理拖拽移动
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragMode) return;

    if (dragMode === 'move') {
      // 移动裁剪框
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // 计算边界限制
      const maxX = videoSize.displayWidth - cropBox.width;
      const maxY = videoSize.displayHeight - cropBox.height;

      setCropBox(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      }));
    } else if (dragMode === 'resize-width') {
      // 调整宽度
      const deltaX = e.clientX - dragStart.x;
      const newWidth = Math.max(50, Math.min(videoSize.displayWidth - cropBox.x, cropBox.width + deltaX));
      
      setCropBox(prev => ({
        ...prev,
        width: newWidth
      }));
      
      // 标记为自定义比例
      if (!isCustomRatio) {
        setIsCustomRatio(true);
        setSelectedRatio(-1);
      }
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (dragMode === 'resize-height') {
      // 调整高度
      const deltaY = e.clientY - dragStart.y;
      const newHeight = Math.max(50, Math.min(videoSize.displayHeight - cropBox.y, cropBox.height + deltaY));
      
      setCropBox(prev => ({
        ...prev,
        height: newHeight
      }));
      
      // 标记为自定义比例
      if (!isCustomRatio) {
        setIsCustomRatio(true);
        setSelectedRatio(-1);
      }
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragMode, dragStart, videoSize.displayWidth, videoSize.displayHeight, cropBox, isCustomRatio]);

  /**
   * 处理触摸拖拽移动
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragMode) return;
    e.preventDefault();

    const touch = e.touches[0];

    if (dragMode === 'move') {
      // 移动裁剪框
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      // 计算边界限制
      const maxX = videoSize.displayWidth - cropBox.width;
      const maxY = videoSize.displayHeight - cropBox.height;

      setCropBox(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      }));
    } else if (dragMode === 'resize-width') {
      // 调整宽度
      const deltaX = touch.clientX - dragStart.x;
      const newWidth = Math.max(50, Math.min(videoSize.displayWidth - cropBox.x, cropBox.width + deltaX));
      
      setCropBox(prev => ({
        ...prev,
        width: newWidth
      }));
      
      // 标记为自定义比例
      if (!isCustomRatio) {
        setIsCustomRatio(true);
        setSelectedRatio(-1);
      }
      
      setDragStart({ x: touch.clientX, y: touch.clientY });
    } else if (dragMode === 'resize-height') {
      // 调整高度
      const deltaY = touch.clientY - dragStart.y;
      const newHeight = Math.max(50, Math.min(videoSize.displayHeight - cropBox.y, cropBox.height + deltaY));
      
      setCropBox(prev => ({
        ...prev,
        height: newHeight
      }));
      
      // 标记为自定义比例
      if (!isCustomRatio) {
        setIsCustomRatio(true);
        setSelectedRatio(-1);
      }
      
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  }, [isDragging, dragMode, dragStart, videoSize.displayWidth, videoSize.displayHeight, cropBox, isCustomRatio]);

  /**
   * 处理拖拽结束
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
  }, []);

  /**
   * 计算最终的裁剪参数 - 返回基于视频实际分辨率的像素坐标
   */
  const calculateCropParams = useCallback((): CropParams => {
    const { displayWidth, displayHeight, width: originalWidth, height: originalHeight } = videoSize;
    
    // 转换为原始视频坐标系的比例
    const cropStartX = Math.max(0, cropBox.x / displayWidth);
    const cropStartY = Math.max(0, cropBox.y / displayHeight);  
    const cropEndX = Math.min(1, (cropBox.x + cropBox.width) / displayWidth);
    const cropEndY = Math.min(1, (cropBox.y + cropBox.height) / displayHeight);

    // 计算实际像素位置（基于原始视频分辨率）
    const actualStartX = Math.round(cropStartX * originalWidth);
    const actualStartY = Math.round(cropStartY * originalHeight);
    const actualEndX = Math.round(cropEndX * originalWidth);
    const actualEndY = Math.round(cropEndY * originalHeight);

    console.log('裁剪参数计算:', {
      显示尺寸: { displayWidth, displayHeight },
      原始尺寸: { originalWidth, originalHeight },
      裁剪框: cropBox,
      比例坐标: { cropStartX, cropStartY, cropEndX, cropEndY },
      像素坐标: { actualStartX, actualStartY, actualEndX, actualEndY }
    });

    return {
      cropStartXRatio: cropStartX,
      cropStartYRatio: cropStartY,
      cropEndXRatio: cropEndX,
      cropEndYRatio: cropEndY,
      // 添加实际像素坐标信息
      cropStartX: actualStartX,
      cropStartY: actualStartY,
      cropEndX: actualEndX,
      cropEndY: actualEndY,
      originalWidth,
      originalHeight
    };
  }, [cropBox, videoSize]);

  /**
   * 处理确认按钮
   */
  const handleConfirm = useCallback(() => {
    // 保存当前选择的比例
    if (!isCustomRatio && selectedRatio !== -1) {
      saveLastRatio(selectedRatio);
    }
    
    const cropParams = calculateCropParams();
    console.log('裁剪参数:', cropParams);
    console.log('当前裁剪框状态:', cropBox);
    console.log('视频尺寸:', videoSize);
    onConfirm(cropParams);
  }, [calculateCropParams, onConfirm, cropBox, videoSize, isCustomRatio, selectedRatio, saveLastRatio]);

  // 初始化视频预览和布局
  useEffect(() => {
    if (visible && taskData) {
      setIsLoading(true);
      setError(null);
      
      // 重置状态

      if (initialCropParams && initialCropParams.cropEndXRatio && initialCropParams.cropStartXRatio && initialCropParams.cropEndYRatio && initialCropParams.cropStartYRatio) {
        console.log('初始化裁剪参数:', initialCropParams);
        const ratio = ((initialCropParams.cropEndXRatio - initialCropParams.cropStartXRatio) / (initialCropParams.cropEndYRatio - initialCropParams.cropStartYRatio)) || 1; 
        console.log('初始化裁剪比例:', ratio);
        
        // 检查是否为预设比例
        const matchedRatio = CROP_RATIOS.find(r => r.ratio !== -1 && Math.abs(r.ratio - ratio) < 0.01);
        if (matchedRatio) {
          setSelectedRatio(matchedRatio.ratio);
          setIsCustomRatio(false);
        } else {
          setSelectedRatio(-1);
          setIsCustomRatio(true);
        }
      } else {
        // 使用上次保存的比例
        const lastRatio = getLastRatio();
        console.log('恢复上次保存的比例:', lastRatio);
        setSelectedRatio(lastRatio);
        setIsCustomRatio(lastRatio === -1);
      }
      
      try {
        const sizeInfo = getVideoSize();
        if (sizeInfo) {
          const displaySize = calculateVideoDisplay(sizeInfo.width, sizeInfo.height);
          setVideoSize(displaySize);
          
          // 延迟初始化裁剪框，确保尺寸计算完成
          setTimeout(() => {
            initializeCropBox(displaySize.displayWidth, displaySize.displayHeight);
            setIsLoading(false);
          }, 100);
        } else {
          setError('无法获取视频信息');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('初始化裁剪浮层失败:', error);
        setError('初始化失败，请重试');
        setIsLoading(false);
      }
    }
  }, [visible, taskData, getVideoSize, calculateVideoDisplay, initializeCropBox, initialCropParams]);

  // 绑定全局拖拽事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // 键盘事件处理
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose, handleConfirm]);

  if (!visible) return null;

  return (
    <div className="video-crop-modal">
      <div className="crop-modal-overlay" onClick={onClose} />
      
      <div className="crop-modal-content">
        {/* 头部 */}
        <div className="crop-modal-header">
          <div className="crop-modal-title">选择裁剪范围</div>
          <div className="crop-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* 视频预览区域 */}
        <div ref={containerRef} className="crop-preview-container">
          {isLoading && (
            <div className="crop-loading">
              <div className="crop-loading-spinner"></div>
              <div className="crop-loading-text">正在初始化视频预览...</div>
            </div>
          )}
          
          {error && (
            <div className="crop-error">
              <div className="crop-error-icon">⚠️</div>
              <div className="crop-error-text">{error}</div>
              <div className="crop-error-retry" onClick={() => window.location.reload()}>
                重试
              </div>
            </div>
          )}
          
          {!isLoading && !error && videoSize.displayWidth > 0 && (
            <div className="crop-video-wrapper">
              {/* 视频播放器 */}
              <div 
                className="crop-video-container"
                style={{
                  width: `${videoSize.displayWidth}px`,
                  height: `${videoSize.displayHeight}px`
                }}
              >
                <VideoPlayer
                  ref={videoPlayerRef}
                  videoUrl={taskData.video_url || ''}
                  coverUrl={taskData.preview_image}
                  autoPlay={true}
                  showProgressBar={false}
                  width={videoSize.displayWidth}
                  height={videoSize.displayHeight}
                  className="crop-video-player"
                />
              </div>
              
              {/* 裁剪框容器 */}
              <div 
                className={`crop-box-container ${isDragging ? 'dragging' : ''}`}
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`
                }}
              >
                {/* 裁剪框主体 */}
                <div className="crop-box">
                  {/* 裁剪框拖拽区域 */}
                  <div 
                    className="crop-box-drag-area"
                    onMouseDown={handleCropBoxMouseDown}
                    onTouchStart={handleCropBoxTouchStart}
                  />
                  
                  {/* 裁剪框中心指示器 */}
                  <div className="crop-box-center">
                    <div className="crop-box-center-dot"></div>
                  </div>
                </div>
                
                {/* 边框和调整控制点 */}
                {/* 顶部边框 */}
                <div className="crop-border crop-border-top">
                  <div 
                    className="crop-resize-handle crop-resize-handle-top"
                    onMouseDown={handleXBorderMouseDown}
                    onTouchStart={handleXBorderTouchStart}
                    title="拖拽调整高度"
                  >
                    <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                      <path d="M2 6L8 2L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* 底部边框 */}
                <div className="crop-border crop-border-bottom">
                  <div 
                    className="crop-resize-handle crop-resize-handle-bottom"
                    onMouseDown={handleXBorderMouseDown}
                    onTouchStart={handleXBorderTouchStart}
                    title="拖拽调整高度"
                  >
                    <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                      <path d="M2 2L8 6L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* 左侧边框 */}
                <div className="crop-border crop-border-left">
                  <div 
                    className="crop-resize-handle crop-resize-handle-left"
                    onMouseDown={handleYBorderMouseDown}
                    onTouchStart={handleYBorderTouchStart}
                    title="拖拽调整宽度"
                  >
                    <svg width="8" height="16" viewBox="0 0 8 16" fill="none">
                      <path d="M6 2L2 8L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* 右侧边框 */}
                <div className="crop-border crop-border-right">
                  <div 
                    className="crop-resize-handle crop-resize-handle-right"
                    onMouseDown={handleYBorderMouseDown}
                    onTouchStart={handleYBorderTouchStart}
                    title="拖拽调整宽度"
                  >
                    <svg width="8" height="16" viewBox="0 0 8 16" fill="none">
                      <path d="M2 2L6 8L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* 遮罩层 */}
              <div className="crop-overlay">
                <div 
                  className="crop-overlay-part crop-overlay-top"
                  style={{ height: `${cropBox.y}px` }}
                />
                <div 
                  className="crop-overlay-middle"
                  style={{ 
                    top: `${cropBox.y}px`,
                    height: `${cropBox.height}px`
                  }}
                >
                  <div 
                    className="crop-overlay-part crop-overlay-left"
                    style={{ width: `${cropBox.x}px` }}
                  />
                  <div 
                    className="crop-overlay-part crop-overlay-right"
                    style={{ 
                      left: `${cropBox.x + cropBox.width}px`,
                      width: `${videoSize.displayWidth - cropBox.x - cropBox.width}px`
                    }}
                  />
                </div>
                <div 
                  className="crop-overlay-part crop-overlay-bottom"
                  style={{ 
                    top: `${cropBox.y + cropBox.height}px`,
                    height: `${videoSize.displayHeight - cropBox.y - cropBox.height}px`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 控制区域 */}
        <div className="crop-controls">
          {/* 比例选择 */}
          <div className="crop-ratios">
            {CROP_RATIOS.map((item) => (
              <div
                key={item.label}
                className={`crop-ratio-btn ${
                  (isCustomRatio && item.ratio === -1) || (!isCustomRatio && selectedRatio === item.ratio) 
                    ? 'active' : ''
                }`}
                onClick={() => handleRatioSelect(item.ratio)}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="crop-actions">
            <div className="crop-btn crop-btn-cancel" onClick={onClose}>
              取消
            </div>
            <div 
              className={`crop-btn crop-btn-confirm ${isLoading || error ? 'disabled' : ''}`} 
              onClick={!isLoading && !error ? handleConfirm : undefined}
            >
              确认
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCropModal; 