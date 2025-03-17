/**
 * 视频生成配置编辑页组件
 * 负责整合各个配置项，提供用户编辑视频生成参数的界面
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EditPage.css';
import TextInputSection from './components/TextInputSection';
import TitleInputSection from './components/TitleInputSection';
import ConfigItem from './components/ConfigItem';
import SliderItem from './components/SliderItem';
import { generateTitle } from './utils/titleGenerator';
import { volumeConfig } from './config/volumeConfig';
import LoadingView from '../components/LoadingView';
import { EditService, EditConfigResponse, VideoEditConfig } from './api';

// 素材库预览图片示例URL
const materialPreviewImage = 'http://gips0.baidu.com/it/u=3602773692,1512483864&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280';

// 背景图片预览示例URL
const backgroundImagePreview = 'http://gips0.baidu.com/it/u=3602773692,1512483864&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280';

// 视频风格预览视频示例URL
const stylePreviewVideoUrl = 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4';

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
  const [volume, setVolume] = useState<number>(volumeConfig.defaultPercent / volumeConfig.displayFactor);
  const [voiceVolume, setVoiceVolume] = useState<number>(volumeConfig.defaultPercent / volumeConfig.displayFactor);
  const [backupCount, setBackupCount] = useState<number>(3);
  const [styleId, setStyleId] = useState<string>('');
  const [autoGenerateTitle, setAutoGenerateTitle] = useState<boolean>(true);
  const [speaker, setSpeaker] = useState({ name: '龙小明', tag: '温柔' });
  
  // 数据源状态
  const [configData, setConfigData] = useState<VideoEditConfig | null>(null);
  const [styleList, setStyleList] = useState<Array<{ id: string; name: string; previewUrl: string }>>([]);
  const [musicList, setMusicList] = useState<Array<{ id: string; name: string; url: string; duration: string }>>([]);
  const [backgroundList, setBackgroundList] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [materialList, setMaterialList] = useState<Array<{ id: string; name: string; previewUrl: string }>>([]);
  
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
          const { config, styleList, musicList, backgroundList, materialList } = response.data;
          
          console.log('API请求成功，更新状态数据');
          
          // 更新状态
          setConfigData(config);
          setStyleList(styleList || []);
          setMusicList(musicList || []);
          setBackgroundList(backgroundList || []);
          setMaterialList(materialList || []);
          
          // 更新UI状态 - 统一处理音量为内部表示(0-100)
          setText(config.content.text || '');
          setTitle(config.title || '');
          
          // 语音音量处理
          // API中语音音量已经是0-100范围，直接使用
          const voiceVol = config.content.volume || volumeConfig.defaultPercent / volumeConfig.displayFactor;
          console.log('设置语音音量:', voiceVol, '(0-100范围)');
          setVoiceVolume(voiceVol);
          
          // 背景音乐音量处理
          // API中背景音乐音量是0-1范围，转换为内部0-100范围
          const musicVol = (config.backgroundMusic.volume * 100) || volumeConfig.defaultPercent / volumeConfig.displayFactor;
          console.log('设置背景音乐音量:', config.backgroundMusic.volume, '(0-1范围) =>', musicVol, '(0-100范围)');
          setVolume(musicVol);
          
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
   * 处理备用视频数量变化
   */
  const handleBackupCountChange = (newCount: number) => {
    setBackupCount(newCount);
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
   * 处理发表按钮点击事件
   */
  const handleSubmit = async () => {
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
      
      // 准备提交数据
      // 注意：提交时需要将内部音量值(0-100)转换回API音量值(0-1)
      const submitData = {
        ...configData,
        title: title,
        content: {
          ...configData.content,
          text: text,
          volume: voiceVolume // 语音音量(内部已是0-100范围)
        },
        backgroundMusic: {
          ...configData.backgroundMusic,
          volume: volume / 100 // 背景音乐音量转换为API表示(0-1范围)
        }
      };
      
      console.log('准备提交数据，背景音乐音量:', volume, '(0-100范围) =>', volume / 100, '(0-1范围)');
      console.log('提交数据:', JSON.stringify(submitData).substring(0, 200) + '...');
      
      // 发起提交请求
      const response = await EditService.submitEditConfig(submitData);
      
      if (response.code === 0 && response.data) {
        console.log('提交成功，视频ID:', response.data.videoId);
        // 跳转到结果页面或首页
        alert('视频生成请求已提交，视频ID: ' + response.data.videoId);
        navigate('/'); // 使用React Router导航
      } else {
        throw new Error(response.message || '提交失败');
      }
    } catch (err) {
      console.error('提交配置失败:', err);
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
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
   * 处理音频试听事件
   */
  const handleMusicPlayback = () => {
    console.log('开始试听背景音乐');
    // 这里可以添加实际的音频播放逻辑
    alert('音乐试听功能待接入');
  };

  /**
   * 处理视频风格预览点击事件
   */
  const handleStyleVideoPreviewClick = () => {
    console.log('视频风格预览被点击');
  };

  /**
   * 处理背景图片预览点击事件
   */
  const handleBackgroundImagePreviewClick = () => {
    console.log('背景图片预览被点击');
  };

  // 获取当前选中的风格预览URL
  const getStylePreviewUrl = () => {
    if (styleId && styleList.length > 0) {
      const style = styleList.find(s => s.id === styleId);
      return style ? style.previewUrl : styleList[0].previewUrl;
    }
    return configData?.style ? "https://media.w3.org/2010/05/sintel/trailer_hd.mp4" : "";
  };

  // 获取当前背景图片URL
  const getBackgroundImageUrl = () => {
    if (configData?.backgroundImage) {
      return configData.backgroundImage.url;
    }
    return backgroundList.length > 0 ? backgroundList[0].url : "";
  };

  // 获取当前素材库预览图片
  const getMaterialPreviewUrl = () => {
    if (configData?.material) {
      return configData.material.previewImage;
    }
    return materialList.length > 0 ? materialList[0].previewUrl : "";
  };

  return (
    <div className="edit-page">
      {/* 顶部导航栏 */}
      <div className="edit-header">
        <div className="cancel-button" onClick={handleCancel}>取消</div>
        <div className="page-title">创建视频</div>
        <div className="submit-button" onClick={handleSubmit}>发表</div>
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

        {/* 视频风格选择 - 带视频预览 */}
        <ConfigItem
          title="视频风格"
          value={configData?.style?.styleName || ""}
          onClick={() => handleConfigClick('style')}
          hasVideoPreview={true}
          previewVideoUrl={getStylePreviewUrl()}
          onVideoPreviewClick={handleStyleVideoPreviewClick}
        />

        {/* 背景音乐选择 - 带音量控制和试听功能 */}
        <ConfigItem
          title="背景音乐"
          value={configData?.backgroundMusic.name || ""}
          onClick={() => handleConfigClick('music')}
          hasVolumeControl={true}
          volume={volume}
          onVolumeChange={handleMusicVolumeChange}
          hasAudioPlayback={true}
          onPlayClick={handleMusicPlayback}
        />

        {/* 背景图片选择 - 带预览功能 */}
        <ConfigItem
          title="背景图片"
          value={configData?.backgroundImage?.backgroundImageName || ""}
          onClick={() => handleConfigClick('background')}
          hasPreview={true}
          previewImage={getBackgroundImageUrl()}
          onPreviewClick={handleBackgroundImagePreviewClick}
        />

        {/* 素材库选择 */}
        <ConfigItem
          title="素材库"
          value={configData?.material.name || ""}
          onClick={() => handleConfigClick('material')}
          hasPreview={true}
          previewImage={getMaterialPreviewUrl()}
          onPreviewClick={handleMaterialPreviewClick}
        />

        {/* 备用视频数量 */}
        <SliderItem
          title="备用视频数量"
          min={1}
          max={5}
          value={backupCount}
          onChange={handleBackupCountChange}
          showValue={true}
          step={1}
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