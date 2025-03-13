import * as React from 'react';
import { HomeTopBar, TopBarProvider, useTopBar } from './topbar';
import HomeContent from './content/HomeContent';
import { HomeDataProvider, useHomeDataContext, DEFAULT_TOPBAR_ITEMS } from './context';
import './Home.css';

/**
 * 顶部导航栏容器组件
 */
const TopBarContainer: React.FC = () => {
  const { items } = useTopBar();
  return <HomeTopBar items={items} />;
};

/**
 * 内容区域组件，使用HomeDataContext获取数据
 */
const HomeWithTopBar: React.FC = () => {
  // 使用HomeDataContext获取数据，而不是直接调用useHomeData
  const { homeData, loading } = useHomeDataContext();
  
  // 从homeData中提取顶部导航栏数据，如果没有则使用默认值
  const topBarItems = React.useMemo(() => {
    // 首先尝试从localStorage获取缓存的顶部导航项
    const cachedItems = localStorage.getItem('topBarItems');
    if (cachedItems) {
      try {
        return JSON.parse(cachedItems);
      } catch (e) {
        console.error('[Home] 解析缓存的顶部导航项失败:', e);
      }
    }
    
    // 如果有homeData并且包含topbar数据，使用API返回的数据
    if (homeData && homeData.topbar && homeData.topbar.length > 0) {
      // 将API返回的topbar数据转换为TopBarItem格式
      const apiTopBarItems = homeData.topbar.map((item: { id?: string; key?: string; text?: string; name?: string }) => ({
        id: item.id || item.key || '',
        text: item.text || item.name || ''
      }));
      
      // 缓存顶部导航项到localStorage
      if (apiTopBarItems.length > 0) {
        localStorage.setItem('topBarItems', JSON.stringify(apiTopBarItems));
      }
      
      return apiTopBarItems;
    }
    
    // 如果没有数据，返回默认值
    return DEFAULT_TOPBAR_ITEMS;
  }, [homeData]);

  // 如果正在加载且没有缓存数据，显示加载状态
  if (loading && !localStorage.getItem('topBarItems')) {
    return <div className="home-loading">加载中...</div>;
  }

  return (
    <TopBarProvider initialItems={topBarItems}>
      <div className="home-container">
        <TopBarContainer />
        <HomeContent />
      </div>
    </TopBarProvider>
  );
};

/**
 * 主页组件，作为数据提供者
 */
const Home: React.FC = () => {
  // 使用HomeDataProvider包装整个应用，这里是唯一调用useHomeData的地方
  return (
    <HomeDataProvider>
      <HomeWithTopBar />
    </HomeDataProvider>
  );
};

export default Home;