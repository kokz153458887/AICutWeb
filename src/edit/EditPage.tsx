/**
 * 视频生成配置编辑页组件
 * 负责整合各个配置项，提供用户编辑视频生成参数的界面
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EditPage.css';
import TextInputSection from './components/TextInputSection';
import TitleInputSection from './components/TitleInputSection';
import VideoStyleSection from './components/VideoStyleSection';
import BackgroundMusicSection from './components/BackgroundMusicSection';
import BackgroundImageSection from './components/BackgroundImageSection';
import MaterialSection from './components/MaterialSection';
import BackupVideoSection from './components/BackupVideoSection';
import { generateTitle } from './utils/titleGenerator';
import LoadingView from '../components/LoadingView';
import { EditService, VideoEditConfig } from './api';

/**
 * 编辑页主组件
 */
const EditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 基本状态
  const [text, setText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true); // 数据加载状态
  const [error, setError] = useState<string>(''); // 错误信息
  const [volume, setVolume] = useState<number>(1); // 默认音量为1 (100%)
  const [voiceVolume, setVoiceVolume] = useState<number>(1); // 默认音量为1 (100%)
  const [backupCount, setBackupCount] = useState<number>(1);
  const [styleId, setStyleId] = useState<string>('');
  const [autoGenerateTitle, setAutoGenerateTitle] = useState<boolean>(true);
  const [speaker, setSpeaker] = useState({ name: '龙小明', tag: '温柔' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 防止重复提交
  
  // 数据源状态
  const [configData, setConfigData] = useState<VideoEditConfig | null>(null);
  
  // 获取URL参数中的styleId
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlStyleId = searchParams.get('styleId');
    if (urlStyleId) {
      setStyleId(urlStyleId);
      console.log('从URL获取到styleId:', urlStyleId);
    }
  }, [location.search]);

  // 加载初始配置数据
  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        setLoadingData(true);
        setError('');
        
        console.log('开始获取编辑页配置数据，styleId:', styleId || '无');
        
        // 发起API请求
        const response = await EditService.getEditConfig(styleId);
        
        if (response.code === 0 && response.data) {
          const { config } = response.data;
          
          console.log('API请求成功，更新状态数据');
          
          // 更新状态
          setConfigData(config);
          
          // 更新UI状态
          setText(config.content.text || '');
          setTitle(config.title || '');
          
          // 语音音量处理 - API 字段为 0-5 范围
          const voiceVol = config.content.volume !== undefined ? config.content.volume : 1;
          console.log('设置语音音量:', voiceVol, '(0-5范围)');
          setVoiceVolume(voiceVol);
          
          // 背景音乐音量处理 - API 字段为 0-5 范围
          const musicVol = config.backgroundMusic.volume !== undefined ? config.backgroundMusic.volume : 1;
          console.log('设置背景音乐音量:', musicVol, '(0-5范围)');
          setVolume(musicVol);
          
          // 设置备用视频数量
          if (config.backupVideoNum !== undefined) {
            setBackupCount(config.backupVideoNum);
          }
          
          console.log('配置数据加载成功', config);
        } else {
          throw new Error(response.message || '加载失败');
        }
      } catch (err) {
        console.error('加载配置数据失败:', err);
        setError('加载数据失败，请重试');
        // 显示错误提示
        alert('加载数据失败，请重试');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchConfigData();
  }, [styleId]);

  // 当文案变化时，自动生成标题
  useEffect(() => {
    if (autoGenerateTitle && text) {
      const newTitle = generateTitle(text);
      setTitle(newTitle);
    }
  }, [text, autoGenerateTitle]);

  /**
   * 处理文案变化
   */
  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  /**
   * 处理语音音量变化
   */
  const handleVoiceVolumeChange = (newVolume: number) => {
    setVoiceVolume(newVolume);
  };

  /**
   * 处理背景音乐音量变化
   */
  const handleMusicVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  /**
   * 处理标题变化
   */
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // 当用户手动修改标题时，禁用自动生成
    if (newTitle !== generateTitle(text)) {
      setAutoGenerateTitle(false);
    }
  };

  /**
   * 处理说话人点击事件
   */
  const handleSpeakerClick = () => {
    // 弹出toast提示
    alert('说话人选择功能待开发');
  };

  /**
   * 处理取消按钮点击事件
   */
  const handleCancel = () => {
    navigate(-1);
  };

  /**
   * 处理视频生成按钮点击事件
   */
  const handleGenerate = async () => {
    // 防止重复提交
    if (isSubmitting) {
      console.log('已有请求正在进行中，忽略本次点击');
      return;
    }
    
    if (!text.trim()) {
      alert('请输入文案内容');
      return;
    }
    
    if (!configData) {
      alert('配置数据不完整，请重试');
      return;
    }
    
    try {
      setLoading(true);
      setIsSubmitting(true); // 标记正在提交
      
      // 准备提交数据
      const submitData: VideoEditConfig = {
        ...configData,
        title: title,
        content: {
          ...configData.content,
          text: text,
          volume: voiceVolume // 语音音量(0-5范围)
        },
        backgroundMusic: {
          ...configData.backgroundMusic,
          volume: volume // 背景音乐音量(0-5范围)
        },
        backupVideoNum: backupCount // 添加备用视频数量
      };
      
      console.log('准备提交数据，音量值:', voiceVolume, volume, '(0-5范围)');
      console.log('提交数据:', JSON.stringify(submitData).substring(0, 200) + '...');
      
      // 发起提交请求
      const response = await EditService.generateVideo(submitData);
      
      if (response.code === 0 && response.data) {
        console.log('提交成功，生成任务ID:', response.data.generateId);
        
        // 如果有成功跳转URL，则跳转到该URL
        if (response.data.successUrl) {
          window.location.href = response.data.successUrl; // 使用原生跳转以便完全关闭当前页面
        } else {
          alert('视频生成请求已提交，视频生成ID: ' + response.data.generateId);
          navigate('/'); // 如果没有跳转URL，则回到首页
        }
      } else {
        throw new Error(response.message || '提交失败');
      }
    } catch (err) {
      console.error('提交配置失败:', err);
      alert('视频生成失败，请重试');
      setIsSubmitting(false); // 重置提交状态，允许用户再次尝试
    } finally {
      setLoading(false);
      setIsSubmitting(false); // 确保无论成功还是失败都重置提交状态
    }
  };

  /**
   * 配置项点击处理
   * @param type 配置项类型
   */
  const handleConfigClick = (type: string) => {
    // 根据类型打开对应选择器
    alert(`${type}选择器待开发`);
  };

  /**
   * 处理素材库预览点击事件
   */
  const handleMaterialPreviewClick = () => {
    console.log('素材库预览被点击');
  };

  /**
   * 处理背景图片预览点击事件
   */
  const handleBackgroundImagePreviewClick = () => {
    console.log('背景图片预览被点击');
  };

  /**
   * 处理视频风格预览点击事件
   */
  const handleStyleVideoPreviewClick = () => {
    console.log('视频风格预览被点击');
  };

  /**
   * 处理备用视频数量变化
   */
  const handleBackupCountChange = (newCount: number) => {
    setBackupCount(newCount);
  };

  return (
    <div className="edit-page">
      {/* 顶部导航栏 */}
      <div className="edit-header">
        <div className="cancel-button" onClick={handleCancel}>取消</div>
        <div className="page-title">创建视频</div>
        <div className="submit-button" onClick={handleGenerate}>生成</div>
      </div>

      {/* 主要内容区域 */}
      <div className="edit-content">
        {/* 文案输入区域 */}
        <TextInputSection 
          value={text} 
          onChange={handleTextChange}
          placeholder="这一刻的想法..."
          voiceVolume={voiceVolume}
          onVoiceVolumeChange={handleVoiceVolumeChange}
          speaker={speaker}
          onSpeakerClick={handleSpeakerClick}
        />

        {/* 标题输入区域 */}
        <TitleInputSection
          value={title}
          onChange={handleTitleChange}
          placeholder="标题"
        />

        {/* 视频风格选择 */}
        <VideoStyleSection
          styleName={configData?.style?.styleName || ""}
          stylePreviewUrl={configData?.style?.stylePreviewUrl || ""}
          onStyleClick={() => handleConfigClick('style')}
          onVideoPreviewClick={handleStyleVideoPreviewClick}
        />

        {/* 背景音乐选择 */}
        <BackgroundMusicSection
          musicName={configData?.backgroundMusic?.name || ""}
          musicUrl={configData?.backgroundMusic?.url || ""}
          startTime={configData?.backgroundMusic?.start_time || ""}
          endTime={configData?.backgroundMusic?.end_time || ""}
          volume={volume}
          onMusicClick={() => handleConfigClick('music')}
          onVolumeChange={handleMusicVolumeChange}
        />

        {/* 背景图片选择 */}
        <BackgroundImageSection
          imageName={configData?.backgroundImage?.name || ""}
          imageUrl={configData?.backgroundImage?.url || ""}
          onImageClick={() => handleConfigClick('background')}
          onPreviewClick={handleBackgroundImagePreviewClick}
        />

        {/* 素材库选择 */}
        <MaterialSection
          materialName={configData?.material?.name || ""}
          previewUrl={configData?.material?.previewUrl || ""}
          onMaterialClick={() => handleConfigClick('material')}
          onPreviewClick={handleMaterialPreviewClick}
        />

        {/* 备用视频数量 */}
        <BackupVideoSection
          backupCount={backupCount}
          onConfigClick={() => handleConfigClick('backup')}
          onBackupCountChange={handleBackupCountChange}
        />
      </div>

      {/* 数据加载状态 */}
      {loadingData && (
        <div className="loading-overlay">
          <LoadingView />
        </div>
      )}

      {/* 提交加载状态弹窗 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">视频生成中...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPage; 