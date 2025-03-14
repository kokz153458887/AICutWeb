import * as React from 'react';
import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import TabBar from './components/TabBar'
import Home from './pages/home/Home'
import Mine from './pages/mine/Mine'
import DebugConsole from './components/DebugConsole'
import { VideoDetail } from './detail'
import { initDeviceInfo } from './utils/deviceInfo'
import { debugConfig } from './config/debug'

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
        display: currentTab === 'add' ? 'flex' : 'none', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%'
      }}>
        添加新内容
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
        <Route path="*" element={<Navigate to="/?tab=home" replace />} />
      </Routes>
      {debugConfig.showDebugConsole && <DebugConsole />}
    </div>
  );
};

function App() {
  return <AppContainer />;
}

export default App
