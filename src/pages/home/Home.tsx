import * as React from 'react';
import { HomeTopBar, TopBarProvider, useTopBar, DEFAULT_TOPBAR_ITEMS } from './topbar';
import HomeContent from './content/HomeContent';
import './Home.css';

// 顶部导航栏组件
const TopBarContainer: React.FC = () => {
  const { items } = useTopBar();
  return <HomeTopBar items={items} />;
};

// 主页组件
const Home: React.FC = () => {
  return (
    <TopBarProvider initialItems={DEFAULT_TOPBAR_ITEMS}>
      <div className="home-container">
        <TopBarContainer />
        <HomeContent />
      </div>
    </TopBarProvider>
  );
};

export default Home;