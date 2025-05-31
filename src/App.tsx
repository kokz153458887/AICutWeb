import * as React from 'react';
import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import TabBar from './components/TabBar'
import Home from './pages/home/Home'
import Mine from './pages/mine/Mine'
import DebugConsole from './components/DebugConsole'
import { VideoDetail } from './detail'
import EditPage from './edit'
import VideoListPage from './videolist'
import VideoOperatePage from './operate/components/VideoOperatePage'
import VideoSlicePage from './cutvideo/pages/VideoSlicePage'
import VideoEditPage from './videoedit/pages/VideoEditPage'
import { initDeviceInfo } from './utils/deviceInfo'
import { debugConfig } from './config/debug'
import Toast from './components/Toast'
import { VideoOperateData } from './operate/api/types'

// 内容容器组件，根据URL参数显示不同页面
const ContentContainer: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'home';

  return (
    <div className="content">
      <div style={{ display: currentTab === 'home' ? 'block' : 'none', height: '100%' }}>
        <Home />
      </div>
      <div style={{ display: currentTab === 'mine' ? 'block' : 'none', height: '100%' }}>
        <Mine />
      </div>
      <div style={{ 
        display: currentTab === 'videolist' ? 'block' : 'none', 
        height: '100%'
      }}>
        <VideoListPage />
      </div>
    </div>
  );
};

/**
 * 应用程序主容器组件
 * 负责管理整体布局结构和路由配置
 */
const AppContainer: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isVideoOperateVisible = Boolean(searchParams.get('videoId'));
  const state = location.state as { videoData?: VideoOperateData };

  useEffect(() => {
    // 初始化设备信息收集
    initDeviceInfo();

    // 调试信息输出 - 方便测试断点
    console.log('App 组件已挂载，开始调试测试');
    
    // 打印环境配置信息
    const envConfig = {
      NODE_ENV: import.meta.env.VITE_NODE_ENV,
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      API_MOCK: import.meta.env.VITE_API_MOCK
    };
    
    console.log('当前环境配置：', envConfig);
    
    // 添加调试断点测试点
    // debugger; // 这里会触发断点，方便测试调试功能
    
    // 测试调试日志
    console.group('🔍 调试信息');
    console.log('当前路由信息：', location);
    console.log('当前时间戳：', new Date().toISOString());
    console.groupEnd();
  }, []);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<>
          <ContentContainer />
          {!isVideoOperateVisible && <TabBar />}
        </>} />
        {/* 视频播放页路由 */}
        <Route path="/video/:id" element={<VideoDetail />} />
        {/* 视频编辑页路由 */}
        <Route path="/edit" element={<EditPage />} />
        {/* 视频切片页路由 */}
        <Route path="/video-slice" element={<VideoSlicePage />} />
        {/* 视频剪辑页路由 */}
        <Route path="/video-edit/:id" element={<VideoEditPage />} />
        {/* 将 /videolist 路由移除，统一使用 tab 参数 */}
      </Routes>
      {debugConfig.showDebugConsole && <DebugConsole />}
      <Toast />
      {/* 视频操作页作为模态层 */}
      {isVideoOperateVisible && (
        <VideoOperatePage 
          videoId={searchParams.get('videoId')!}
          initialIndex={parseInt(searchParams.get('initialIndex') || '0', 10)}
          videoData={state?.videoData}
        />
      )}
    </div>
  );
};

export default AppContainer;

