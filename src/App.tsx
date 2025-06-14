import * as React from 'react';
import { useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import TabBar from './components/TabBar'
import DebugConsole from './components/DebugConsole'
import { initDeviceInfo } from './utils/deviceInfo'
import { debugConfig } from './config/debug'
import Toast from './components/Toast'
import LoadingView from './components/LoadingView'
import { VideoOperateData } from './operate/api/types'
import { LoginPage, useAuth } from './user'

// 只导入首页需要的组件
const Home = React.lazy(() => import('./pages/home/Home'));
const Mine = React.lazy(() => import('./pages/mine/Mine'));
const VideoListPage = React.lazy(() => import('./videolist'));

// 内容容器组件，根据URL参数显示不同页面
const ContentContainer: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'home';
  
  // 使用权限控制Hook
  const { isAuthenticated, requireLogin } = useAuth();
  
  // 检查VideoList页面权限
  React.useEffect(() => {
    if (currentTab === 'videolist' && !isAuthenticated) {
      console.log('[ContentContainer] VideoList需要登录，跳转到登录页');
      requireLogin();
    }
  }, [currentTab, isAuthenticated, requireLogin]);

  return (
    <div className="content">
      {/* Home页面 - 始终渲染，通过CSS控制显示 */}
      <div style={{ display: currentTab === 'home' ? 'block' : 'none', height: '100%' }}>
        <Suspense fallback={<LoadingView />}>
          <Home />
        </Suspense>
      </div>
      
      {/* Mine页面 - 始终渲染，通过CSS控制显示 */}
      <div style={{ display: currentTab === 'mine' ? 'block' : 'none', height: '100%' }}>
        <Suspense fallback={<LoadingView />}>
          <Mine />
        </Suspense>
      </div>
      
      {/* VideoList页面 - 登录后始终渲染，通过CSS控制显示 */}
      <div style={{ 
        display: currentTab === 'videolist' ? 'block' : 'none', 
        height: '100%'
      }}>
        {isAuthenticated ? (
          <Suspense fallback={<LoadingView />}>
            <VideoListPage />
          </Suspense>
        ) : currentTab === 'videolist' ? (
          <LoadingView />
        ) : null}
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
  
  // 使用权限控制Hook
  const { isLoading } = useAuth();

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

  // 如果权限检查中，显示加载界面
  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <div className="app-container">
      <Suspense fallback={<LoadingView />}>
        <Routes>
          {/* 登录页面路由 */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 首页路由 - 无需登录 */}
          <Route path="/" element={<>
            <ContentContainer />
            {!isVideoOperateVisible && <TabBar />}
          </>} />
          
          {/* 视频播放页路由 - 无需登录，按需加载 */}
          <Route path="/video/:id" element={
            <Suspense fallback={<LoadingView />}>
              {React.createElement(React.lazy(() => import('./detail').then(module => ({ default: module.VideoDetail }))))}
            </Suspense>
          } />
          
          {/* 视频编辑页路由 - 需要登录，按需加载 */}
          <Route path="/edit" element={
            <Suspense fallback={<LoadingView />}>
              {React.createElement(React.lazy(() => import('./edit')))}
            </Suspense>
          } />
          
          {/* 视频切片页路由 - 需要登录，按需加载 */}
          <Route path="/video-slice" element={
            <Suspense fallback={<LoadingView />}>
              {React.createElement(React.lazy(() => import('./cut/videoSlice/page')))}
            </Suspense>
          } />
          
          {/* 视频剪辑页路由 - 需要登录，按需加载 */}
          <Route path="/video-edit/:id" element={
            <Suspense fallback={<LoadingView />}>
              {React.createElement(React.lazy(() => import('./cut/videoedit/pages/VideoEditPage')))}
            </Suspense>
          } />
          
          {/* 视频解析结果页路由 - 需要登录，按需加载 */}
          <Route path="/video-parse-result/:id" element={
            <Suspense fallback={<LoadingView />}>
              {React.createElement(React.lazy(() => import('./cut/videoParse/pages/VideoParseResultPage')))}
            </Suspense>
          } />
          
          {/* 素材库详情页路由 - 需要登录，按需加载 */}
          <Route path="/material-library/:materialId" element={
            <Suspense fallback={<LoadingView />}>
              {React.createElement(React.lazy(() => import('./edit/components/meterialSelect/MaterialLibraryPage')))}
            </Suspense>
          } />
        </Routes>
      </Suspense>
      {debugConfig.showDebugConsole && <DebugConsole />}
      <Toast />
      {/* 视频操作页作为模态层 - 按需加载 */}
      {isVideoOperateVisible && (
        <Suspense fallback={<LoadingView />}>
          {React.createElement(React.lazy(() => import('./operate/components/VideoOperatePage')), {
            videoId: searchParams.get('videoId')!,
            initialIndex: parseInt(searchParams.get('initialIndex') || '0', 10),
            videoData: state?.videoData
          })}
        </Suspense>
      )}
    </div>
  );
};

export default AppContainer;

