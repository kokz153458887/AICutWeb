/**
 * 视频生成配置编辑页组件
 * 负责整合各个配置项，提供用户编辑视频生成参数的界面
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EditPage.css';
import TextInputSection from './components/TextInputSection';
import TitleInputSection from './components/TitleInputSection';
import VideoStyleSection from './components/VideoStyleSection';
import BackgroundMusicSection from './components/BackgroundMusicSection';
import BackgroundImageSection from './components/BackgroundImageSection';
import MaterialSection from './components/MaterialSection';
import BackupVideoSection from './components/BackupVideoSection';
import MusicSelectModal from './components/musicSelect/MusicSelectModal';
import { generateTitle } from './utils/titleGenerator';
import LoadingView from '../components/LoadingView';
import Toast, { toast } from '../components/Toast';
import { EditService, VideoEditConfig, BackgroundMusicModel, BackgroundImageModel } from './api';
import { MusicLibItem, StyleModel } from './api/types';
import { VoiceInfo } from './api/VoiceService';
import { cleanTitle, cleanContent } from '../utils/textUtils';

/**
 * 编辑页主组件
 */
const EditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 获取所有URL参数
  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [location.search]);
  
  // 基本状态
  const [text, setText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true); // 数据加载状态
  const [error, setError] = useState<string>(''); // 错误信息
  const [volume, setVolume] = useState<number>(5); // 默认音量为5 (100%)
  const [backupCount, setBackupCount] = useState<number>(1);
  const [styleId, setStyleId] = useState<string>('');
  const [autoGenerateTitle, setAutoGenerateTitle] = useState<boolean>(true);
  const [speaker, setSpeaker] = useState<{ name: string; tag: string }>({ name: '选择说话人', tag: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 防止重复提交
  const [showMusicModal, setShowMusicModal] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceInfo | null>(null);
  
  // 数据源状态
  const [configData, setConfigData] = useState<VideoEditConfig | null>(null);
  
  // 获取URL参数中的styleId并加载初始配置数据
  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        setLoadingData(true);
        setError('');
        
        console.log('开始获取编辑页配置数据，URL参数:', urlParams);
        
        // 发起API请求，传递所有URL参数
        const response = await EditService.getEditConfig(urlParams);
        
        if (response.code === 0 && response.data) {
          const { config } = response.data;
          
          console.log('API请求成功，更新状态数据');
          
          // 更新状态
          setConfigData(config);
          
          // 更新UI状态
          setText(config.content.text || '');
          setTitle(config.title || '');
          // 背景音乐音量处理 - API 字段为 0-5 范围
          const musicVol = config.backgroundMusic.volume !== undefined ? config.backgroundMusic.volume : 1;
          console.log('设置背景音乐音量:', musicVol, '(0-5范围)');
          setVolume(musicVol);
          
          // 设置备用视频数量
          if (config.backupVideoNum !== undefined) {
            setBackupCount(config.backupVideoNum);
          }
          
          // 设置styleId
          if (config.style._id) {
            setStyleId(config.style._id);
          } else if (urlParams.styleId) {
            setStyleId(urlParams.styleId);
          }
          
          console.log('配置数据加载成功', config);
        } else {
          throw new Error(response.message || '加载失败');
        }
      } catch (err) {
        console.error('加载配置数据失败:', err);
        setError('加载数据失败，请重试');
        toast.error('加载数据失败，请重试');
      } finally {
        setLoadingData(false);
      }
    };
    
    // 发起请求
    fetchConfigData();
  }, [urlParams]); // 依赖 urlParams

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
   * 处理音色选择事件
   */
  const handleVoiceSelect = (voice: VoiceInfo) => {
    if (!configData) return;

    console.log('处理音色选择:', {
      voiceCode: voice.voiceCode,
      voiceName: voice.voiceName,
      voiceServer: voice.voiceServer,
      settings: voice.settings,
    });

    setSelectedVoice(voice);
    setSpeaker({
      name: voice.voicer,
      tag: ''
    });

    // 更新配置数据
    const newConfig = {
      ...configData,
      content: {
        ...configData.content,
        speakerID: voice.voiceName, 
        voiceService: voice.voiceServer,
        voiceInfo: voice,
        voiceParams: {
          speed: voice.settings?.speed ?? 0,
          pitch: voice.settings?.pitch ?? 0,
          intensity: voice.settings?.intensity ?? 0,
          volume: voice.settings?.volume !== undefined ? voice.settings.volume : 5.0,
          emotion: voice.settings?.emotion
        }
      }
    };

    setConfigData(newConfig);
    console.log('更新配置数据:', newConfig);
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
    
    // 根据 apimodel 参数判断是否需要验证文案
    const apiModel = urlParams.apimodel || 'generate';
    if (apiModel === 'generate' && !text.trim()) {
      toast.error('请输入文案内容');
      return;
    }
    
    if (!configData) {
      toast.error('配置数据不完整，请重试');
      return;
    }
    
    try {
      setLoading(true);
      setIsSubmitting(true);
      
      // 清洗标题和内容文本，去除特殊字符
      const cleanedTitle = cleanTitle(title);
      const cleanedText = cleanContent(text);
      
      console.log('文本清洗前:', { title, text: text.substring(0, 50) + '...' });
      console.log('文本清洗后:', { cleanedTitle, cleanedText: cleanedText.substring(0, 50) + '...' });
      
      // 准备提交数据
      const submitData: VideoEditConfig = {
        ...configData,
        title: cleanedTitle,
        content: {
          ...configData.content,
          text: cleanedText
        },
        backgroundMusic: {
          ...configData.backgroundMusic,
          volume: volume
        },
        backupVideoNum: backupCount
      };
      
      console.log('准备提交数据，音量值:', volume, '(0-5范围)');
      console.log('提交数据:', JSON.stringify(submitData).substring(0, 200) + '...');
      console.log('URL参数:', urlParams);
      
      // 根据 apimodel 参数选择不同的接口
      let response;
      if (apiModel === 'generate') {
        console.log('使用 generateVideo 接口');
        response = await EditService.generateVideo(submitData, urlParams);
      } else if (apiModel === 'update') {
        console.log('使用 updateConfig 接口');
        response = await EditService.updateConfig(submitData, urlParams);
      } else {
        console.log('使用 createConfig 接口');
        response = await EditService.createConfig(submitData, urlParams);
      }
      
      if (response.code === 0 && response.data) {
        console.log('提交成功，生成任务ID:', response.data.generateId);
        
        // 如果有成功跳转URL，则跳转到该URL
        if (response.data.successUrl) {
          window.location.href = response.data.successUrl;
        } else {
          const actionText = apiModel === 'generate' ? '视频生成' : 
                            apiModel === 'update' ? '模板更新' : '模板生成';
          toast.success(`${actionText}请求已提交，ID: ${response.data.generateId}`);
          // 跳转到主页的视频列表tab
          navigate('/?tab=videolist');
        }
      } else {
        throw new Error(response.message || '提交失败');
      }
    } catch (err) {
      console.error('提交配置失败:', err);
      toast.error('生成失败，请重试');
      setIsSubmitting(false);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  /**
   * 配置项点击处理
   * @param type 配置项类型
   */
  const handleConfigClick = (type: string) => {
    toast.info(`${type}选择器待开发`);
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
   * 处理视频风格选择事件
   */
  const handleStyleSelect = (style: StyleModel) => {
    if (configData) {
      console.log('选择视频风格:', style);
      setStyleId(style._id || '');
      setConfigData({
        ...configData,
        style: style
      });
    }
  };

  /**
   * 处理备用视频数量变化
   */
  const handleBackupCountChange = (newCount: number) => {
    setBackupCount(newCount);
  };

  /**
   * 处理背景图片选择
   */
  const handleBackgroundImageChange = (image: BackgroundImageModel) => {
    if (configData) {
      console.log('选择背景图片:', image);
      setConfigData({
        ...configData,
        backgroundImage: {
          ...configData.backgroundImage,
          ...image
        }
      });
    }
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
          text={text} 
          onTextChange={handleTextChange}
          onVoiceSelect={handleVoiceSelect}
          selectedVoice={selectedVoice}
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
          onStyleSelect={handleStyleSelect}
          styleId={styleId}
        />

        {/* 背景音乐选择 */}
        <BackgroundMusicSection
          musicName={configData?.backgroundMusic?.name || ""}
          musicUrl={configData?.backgroundMusic?.url || ""}
          startTime={configData?.backgroundMusic?.start_time || ""}
          endTime={configData?.backgroundMusic?.end_time || ""}
          volume={volume}
          onMusicClick={() => {
            if (configData) {
              setShowMusicModal(true);
            }
          }}
          onVolumeChange={handleMusicVolumeChange}
        />

        {/* 音乐选择弹窗 */}
        {showMusicModal && configData && (
          <MusicSelectModal
            visible={showMusicModal}
            currentMusicId={configData.backgroundMusic.musicId}
            onClose={() => setShowMusicModal(false)}
            onSelect={(music: MusicLibItem) => {
              setConfigData({
                ...configData,
                backgroundMusic: {
                  ...configData.backgroundMusic,
                  musicId: music._id,
                  name: music.name,
                  url: music.url,
                  start_time: music.start_time || "00:00:00",
                  end_time: music.end_time || "00:00:00",
                  discription: music.discription,
                  volume: configData.backgroundMusic.volume,
                  isloop: configData.backgroundMusic.isloop
                }
              });
              setShowMusicModal(false);
            }}
          />
        )}

        {/* 背景图片选择 */}
        <BackgroundImageSection
          imageName={configData?.backgroundImage?.name || ""}
          imageUrl={configData?.backgroundImage?.url || ""}
          onImageChange={handleBackgroundImageChange}
          onPreviewClick={handleBackgroundImagePreviewClick}
        />

        {/* 素材库选择 */}
        <MaterialSection
          materialName={configData?.material?.name || ""}
          materialId={configData?.material?.materialID || ""}
          previewUrl={configData?.material?.previewUrl || ""}
          url={configData?.material?.url || ""}
          onMaterialClick={() => handleConfigClick('material')}
          onPreviewClick={handleMaterialPreviewClick}
          onMaterialSelect={(material) => {
            if (configData) {
              console.log('选择素材:', material);
              setConfigData({
                ...configData,
                material: {
                  name: material.name,
                  materialID: material.materialID,
                  previewUrl: material.previewUrl,
                  url: material.url
                }
              });
            }
          }}
        />

        {/* 备用视频数量 */}
        <BackupVideoSection
          backupCount={backupCount}
          onConfigClick={() => {}}
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

      {/* Toast组件 */}
      <Toast />
    </div>
  );
};

export default EditPage;