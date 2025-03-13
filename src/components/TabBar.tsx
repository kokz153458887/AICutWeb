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
        <span className={`icon-home ${currentTab === 'home' ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className={`label ${currentTab === 'home' ? 'active' : ''}`}>首页</span>
      </div>
      
      <div className="tabbar-item-center">
        <div className="add-button" onClick={() => handleTabChange('add')}>
          <span className="plus-icon">+</span>
        </div>
      </div>
      
      <div 
        onClick={() => handleTabChange('mine')}
        className="tabbar-item"
      >
        <span className={`icon-user ${currentTab === 'mine' ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className={`label ${currentTab === 'mine' ? 'active' : ''}`}>我的</span>
      </div>
    </div>
  );
};

export default TabBar;