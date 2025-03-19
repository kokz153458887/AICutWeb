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
import { initDeviceInfo } from './utils/deviceInfo'
import { debugConfig } from './config/debug'
import Toast from './components/Toast'

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

// 主应用容器组件
const AppContainer: React.FC = () => {
  useEffect(() => {
    // 初始化设备信息收集
    initDeviceInfo();
  }, []);

  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<>
          <ContentContainer />
          <TabBar />
        </>} />
        {/* 视频播放页路由 */}
        <Route path="/video/:id" element={<VideoDetail />} />
        {/* 视频编辑页路由 */}
        <Route path="/edit" element={<EditPage />} />
        {/* 视频列表页路由 */}
        <Route path="/videolist" element={<VideoListPage />} />
        {/* 视频操作页路由 */}
        <Route path="/operate/:id" element={<VideoOperatePage />} />
        <Route path="*" element={<Navigate to="/?tab=home" replace />} />
      </Routes>
      {debugConfig.showDebugConsole && <DebugConsole />}
      <Toast />
    </div>
  );
};

function App() {
  return <AppContainer />;
}

export default App
