/**
 * 视频风格选择弹窗组件
 * 负责展示视频风格列表，支持选择功能
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../../styles/StyleSelectModal.css';
import '../../styles/MeterialCommon.css';
import StyleItem from './StyleItem';
import { VideoStyleItem, StyleModel } from '../../api/types';
import { EditSelectAPI } from '../../api/EditSelectAPI';
import { ApiResponse } from '../../../types/api';
import StyleEditor from './StyleEditor';

interface StyleSelectModalProps {
  onClose: () => void;
  onSelect: (style: StyleModel) => void;
  currentStyleId?: string;
}

/**
 * 视频风格选择弹窗组件
 */
const StyleSelectModal: React.FC<StyleSelectModalProps> = ({
  onClose,
  onSelect,
  currentStyleId
}) => {
  // 视频风格列表数据
  const [styleList, setStyleList] = useState<VideoStyleItem[]>([]);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(true);
  // 错误信息
  const [error, setError] = useState<string>('');
  // 用于跟踪组件是否已卸载
  const mountedRef = useRef(true);
  // 用于取消重试的定时器
  const retryTimerRef = useRef<number>();
  // 编辑器状态
  const [showEditor, setShowEditor] = useState<boolean>(false);
  // 当前编辑的风格
  const [editingStyle, setEditingStyle] = useState<VideoStyleItem | null>(null);
  // 编辑模式：create 或 update
  const [editorMode, setEditorMode] = useState<'create' | 'update'>('create');

  /**
   * 加载视频风格列表数据
   */
  const loadStyleList = useCallback(async () => {
    // 如果组件已卸载，不执行加载
    if (!mountedRef.current) return;

    try {
      setError('');
      setLoading(true);

      // 添加超时处理
      const response = await Promise.race([
        EditSelectAPI.getStyleList(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('请求超时')), 10000)
        )
      ]) as ApiResponse<VideoStyleItem[]>;
      
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      if (response.code === 0 && response.data) {
        console.log('加载视频风格列表成功，数据条数:', response.data.length);
        setStyleList(response.data);
      } else {
        throw new Error(response.message || '获取视频风格列表失败');
      }
    } catch (err) {
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      console.error('加载视频风格列表失败:', err);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      setLoading(false);
    }
  }, []);

  /**
   * 重试加载
   */
  const handleRetry = useCallback(() => {
    loadStyleList();
  }, [loadStyleList]);

  /**
   * 处理风格选择
   */
  const handleStyleSelect = (style: VideoStyleItem) => {
    onSelect({
      _id: style._id,
      ratio: style.ratio,
      resolution: style.resolution,
      styleName: style.styleName,
      stylePreviewUrl: style.previewUrl,
      videoShowRatio: style.videoShowRatio,
      font: style.font
    });
  };

  /**
   * 打开创建风格编辑器
   */
  const handleOpenCreateEditor = () => {
    setEditorMode('create');
    setEditingStyle(null);
    setShowEditor(true);
  };

  /**
   * 打开更新风格编辑器
   */
  const handleOpenUpdateEditor = (style: VideoStyleItem) => {
    setEditorMode('update');
    setEditingStyle(style);
    setShowEditor(true);
  };

  /**
   * 处理风格创建或更新成功事件
   */
  const handleStyleSaved = () => {
    setShowEditor(false);
    loadStyleList(); // 重新加载列表以获取最新数据
  };

  // 初始加载
  useEffect(() => {
    // 重置mounted状态
    mountedRef.current = true;
    loadStyleList();

    // 清理函数
    return () => {
      mountedRef.current = false;
      // 清除可能存在的重试定时器
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [loadStyleList]);

  /**
   * 处理背景点击事件（关闭弹窗）
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    // 仅当点击的是背景元素时关闭
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="style-select-overlay" onClick={handleBackdropClick}>
      <div className="style-select-container" onClick={e => e.stopPropagation()}>
        {/* 顶部标题栏 */}
        <div className="style-select-header">
          <div className="style-select-title">
            选择视频风格
          </div>
          <div className="style-select-actions">
            <div className="style-create-button" onClick={handleOpenCreateEditor}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="style-select-close" onClick={onClose}>✕</div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="style-select-content">
          {loading ? (
            <div className="material-loading">
              <div className="material-loading-spinner" />
              <div className="material-loading-text">加载中...</div>
            </div>
          ) : error ? (
            <div className="style-error-message">
              <div className="error-text">{error}</div>
              <div className="error-retry" onClick={handleRetry}>重试</div>
            </div>
          ) : (
            <div className="style-grid">
              {styleList.map(item => (
                <StyleItem
                  key={item._id}
                  item={item}
                  selected={currentStyleId === item._id}
                  onClick={handleStyleSelect}
                  onEdit={() => handleOpenUpdateEditor(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 风格编辑器弹窗 */}
      {showEditor && (
        <StyleEditor
          mode={editorMode}
          style={editingStyle}
          onClose={() => setShowEditor(false)}
          onSave={handleStyleSaved}
        />
      )}
    </div>
  );
};

export default StyleSelectModal; 