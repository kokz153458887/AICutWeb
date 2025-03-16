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

// 素材库预览图片示例URL
const materialPreviewImage = 'http://gips0.baidu.com/it/u=3602773692,1512483864&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280';

// 视频风格预览视频示例URL
const stylePreviewVideoUrl = 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4';

/**
 * 编辑页主组件
 */
const EditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(volumeConfig.defaultPercent / volumeConfig.displayFactor);
  const [voiceVolume, setVoiceVolume] = useState<number>(volumeConfig.defaultPercent / volumeConfig.displayFactor);
  const [backupCount, setBackupCount] = useState<number>(3);
  const [styleId, setStyleId] = useState<string>('');
  const [autoGenerateTitle, setAutoGenerateTitle] = useState<boolean>(true);
  const [speaker, setSpeaker] = useState({ name: '龙小明', tag: '温柔' });
  
  // 获取URL参数中的styleId
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlStyleId = searchParams.get('styleId');
    if (urlStyleId) {
      setStyleId(urlStyleId);
      console.log('从URL获取到styleId:', urlStyleId);
    }
  }, [location.search]);

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
  const handleSubmit = () => {
    setLoading(true);
    // 模拟发表请求
    setTimeout(() => {
      setLoading(false);
      // 跳转到百度（根据需求临时设置）
      window.location.href = 'https://www.baidu.com';
    }, 3000);
  };

  /**
   * 配置项点击处理
   * @param type 配置项类型
   */
  const handleConfigClick = (type: string) => {
    // 弹出toast提示
    alert('待开发');
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
          value="video_cut_style"
          onClick={() => handleConfigClick('style')}
          hasVideoPreview={true}
          previewVideoUrl={stylePreviewVideoUrl}
          onVideoPreviewClick={handleStyleVideoPreviewClick}
        />

        {/* 背景音乐选择 - 带音量控制和试听功能 */}
        <ConfigItem
          title="背景音乐"
          value="三生三世——高潮部分-测试长度测试长度测试长度测试长度测试长度测试长度"
          onClick={() => handleConfigClick('music')}
          hasVolumeControl={true}
          volume={volume}
          onVolumeChange={handleMusicVolumeChange}
          hasAudioPlayback={true}
          onPlayClick={handleMusicPlayback}
        />

        {/* 素材库选择 */}
        <ConfigItem
          title="素材库"
          value="pungge治愈系"
          onClick={() => handleConfigClick('material')}
          hasPreview={true}
          previewImage={materialPreviewImage}
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

      {/* 加载状态弹窗 */}
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