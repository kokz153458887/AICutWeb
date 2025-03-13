import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从URL中获取当前选中的tab
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'home';
  
  const handleTabChange = (tab: string) => {
    navigate(`/?tab=${tab}`, { replace: true });
  };
  
  return (
    <div className="tabbar">
      <div 
        onClick={() => handleTabChange('home')}
        className="tabbar-item"
      >
        <span className={`emoji ${currentTab === 'home' ? 'active' : ''}`}>🏠</span>
        <span className={`label ${currentTab === 'home' ? 'active' : ''}`}>首页</span>
      </div>
      <div 
        onClick={() => handleTabChange('mine')}
        className="tabbar-item"
      >
        <span className={`emoji ${currentTab === 'mine' ? 'active' : ''}`}>👤</span>
        <span className={`label ${currentTab === 'mine' ? 'active' : ''}`}>我的</span>
      </div>
    </div>
  );
};



export default TabBar;