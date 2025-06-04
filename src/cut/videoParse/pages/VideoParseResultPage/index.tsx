/**
 * 视频解析结果页面
 * 展示解析任务的详细信息和视频片段列表
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackIcon } from '../../../../components/icons';
import TaskInfoCard from '../../components/TaskInfoCard';
import VideoClipCard from '../../components/VideoClipCard';
import LoadingView from '../../../../components/LoadingView';
import ErrorView from '../../../../components/ErrorView';
import VideoPlayer from '../../../videoedit/components/VideoPlayer';
import { getParseResultDetail, ParseResultDetail } from '../../api';
import { toast } from '../../../../components/Toast';
import './styles.css';

/**
 * 视频解析结果页面组件
 * 提供任务详情查看和视频片段播放功能
 */
const VideoParseResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 状态管理
  const [taskData, setTaskData] = useState<ParseResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlayingMainVideo, setIsPlayingMainVideo] = useState(false);
  const [fullScreenVideoUrl, setFullScreenVideoUrl] = useState<string | null>(null);

  /**
   * 加载解析结果详情
   */
  const loadTaskDetail = useCallback(async () => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      
      const data = await getParseResultDetail(id);
      setTaskData(data);
    } catch (err) {
      console.error('加载解析结果失败:', err);
      setError(true);
      toast.error('加载解析结果失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 初始化数据加载
  useEffect(() => {
    loadTaskDetail();
  }, [loadTaskDetail]);

  /**
   * 处理返回按钮点击
   */
  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * 处理删除按钮点击
   */
  const handleDeleteClick = useCallback(() => {
    toast.info('功能待开发');
  }, []);

  /**
   * 处理主视频播放
   */
  const handleMainVideoPlay = useCallback(() => {
    setIsPlayingMainVideo(true);
  }, []);

  /**
   * 处理原链接点击
   */
  const handleOriginalLinkClick = useCallback(() => {
    if (taskData?.parse_url) {
      window.open(taskData.parse_url, '_blank');
    }
  }, [taskData]);

  /**
   * 处理素材库点击
   */
  const handleMaterialLibraryClick = useCallback(() => {
    if (taskData?.materialId) {
      navigate(`/material-library/${taskData.materialId}`);
    }
  }, [taskData, navigate]);

  /**
   * 处理视频片段全屏播放
   */
  const handleFullScreenPlay = useCallback((videoUrl: string) => {
    setFullScreenVideoUrl(videoUrl);
  }, []);

  /**
   * 关闭全屏播放
   */
  const handleCloseFullScreen = useCallback(() => {
    setFullScreenVideoUrl(null);
  }, []);

  /**
   * 处理重试
   */
  const handleRetry = useCallback(() => {
    loadTaskDetail();
  }, [loadTaskDetail]);

  // 加载状态
  if (loading) {
    return <LoadingView />;
  }

  // 错误状态
  if (error || !taskData) {
    return <ErrorView onRetry={handleRetry} />;
  }

  return (
    <div className="video-parse-result-page">
      {/* 顶部导航栏 */}
      <div className="page-header">
        <div className="back-button" onClick={handleBackClick}>
          <BackIcon />
        </div>
        <span className="page-title">视频切片录入结果</span>
        <div className="delete-button" onClick={handleDeleteClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h2m4 5v6m4-6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* 页面内容 */}
      <div className="page-content">
        {/* 任务信息展示区 */}
        <div className="task-info-section">
          {!isPlayingMainVideo ? (
            <TaskInfoCard
              taskData={taskData}
              onVideoPlay={handleMainVideoPlay}
              onOriginalLinkClick={handleOriginalLinkClick}
              onMaterialLibraryClick={handleMaterialLibraryClick}
            />
          ) : (
            <div className="main-video-player">
              <VideoPlayer
                videoUrl={taskData.video_url}
                showProgressBar={true}
                autoPlay={true}
                onPlayStateChange={(playing) => {
                  if (!playing) {
                    // 当视频暂停时，可以选择返回预览图状态
                    // setIsPlayingMainVideo(false);
                  }
                }}
              />
              <button 
                className="close-video-btn"
                onClick={() => setIsPlayingMainVideo(false)}
              >
                返回预览
              </button>
            </div>
          )}
        </div>

        {/* 视频片段区域 */}
        <div className="clips-section">
          <div className="clips-header">
            <h3 className="clips-title">视频片段 ({taskData.clips?.length || 0})</h3>
          </div>
          
          <div className="clips-list">
            {taskData.clips && taskData.clips.length > 0 ? (
              taskData.clips.map((clip, index) => (
                <VideoClipCard
                  key={index}
                  clip={clip}
                  onFullScreenPlay={handleFullScreenPlay}
                />
              ))
            ) : (
              <div className="empty-clips">
                <div className="empty-icon">📹</div>
                <div className="empty-text">暂无视频片段</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 全屏视频播放器 */}
      {fullScreenVideoUrl && (
        <div className="fullscreen-video-overlay">
          <div className="fullscreen-header">
            <button className="close-fullscreen-btn" onClick={handleCloseFullScreen}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="fullscreen-video-container">
            <VideoPlayer
              videoUrl={fullScreenVideoUrl}
              showProgressBar={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoParseResultPage; 