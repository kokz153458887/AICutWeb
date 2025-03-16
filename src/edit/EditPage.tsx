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

/**
 * 编辑页主组件
 */
const EditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50);
  const [voiceVolume, setVoiceVolume] = useState<number>(50);
  const [backupCount, setBackupCount] = useState<number>(3);
  const [styleId, setStyleId] = useState<string>('');
  const [autoGenerateTitle, setAutoGenerateTitle] = useState<boolean>(true);
  
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
        />

        {/* 标题输入区域 */}
        <TitleInputSection
          value={title}
          onChange={handleTitleChange}
          placeholder="标题"
        />

        {/* 语音音量调节 */}
        <SliderItem
          title="语音音量"
          min={1}
          max={100}
          value={voiceVolume}
          onChange={setVoiceVolume}
          showValue
        />

        {/* 视频风格选择 */}
        <ConfigItem
          title="视频风格"
          value="video_cut_style"
          subValue="ID: 1234"
          onClick={() => handleConfigClick('style')}
        />

        {/* 说话人选择 */}
        <ConfigItem
          title="说话人"
          value="龙小明"
          tag="温柔"
          onClick={() => handleConfigClick('speaker')}
        />

        {/* 背景音乐选择 */}
        <ConfigItem
          title="背景音乐"
          value="三生三世——高潮部分"
          onClick={() => handleConfigClick('music')}
        />

        {/* 音量调节 */}
        <SliderItem
          title="音量"
          min={1}
          max={100}
          value={volume}
          onChange={setVolume}
          showValue
        />

        {/* 素材库选择 */}
        <ConfigItem
          title="素材库"
          value="pungge治愈系"
          subValue="ID: 1244"
          onClick={() => handleConfigClick('material')}
        />

        {/* 备用视频数量 */}
        <SliderItem
          title="备用视频数量"
          min={1}
          max={5}
          value={backupCount}
          onChange={setBackupCount}
          showValue
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