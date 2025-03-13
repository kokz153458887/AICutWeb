import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import TabBar from './components/TabBar'
import Home from './pages/Home'
import Mine from './pages/Mine'

// 内容容器组件，根据URL参数显示不同页面
const ContentContainer: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'home';

  return (
    <div className="content">
      {currentTab === 'home' && <Home />}
      {currentTab === 'mine' && <Mine />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<>
            <ContentContainer />
            <TabBar />
          </>} />
          <Route path="*" element={<Navigate to="/?tab=home" replace />} />
        </Routes>
      </div>
    </Router>
  )
}



export default App
