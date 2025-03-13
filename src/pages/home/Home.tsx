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
    // 首先，优先使用API返回的数据
    if (homeData && homeData.topbar && homeData.topbar.length > 0) {
      console.log('[Home] 使用API返回的顶部导航栏数据');
      // 将API返回的topbar数据转换为TopBarItem格式
      const apiTopBarItems = homeData.topbar.map((item: { id?: string; key?: string; text?: string; name?: string }) => ({
        id: item.id || item.key || '',
        text: item.text || item.name || ''
      }));
      
      // API数据加载成功后，替换本地存储
      if (apiTopBarItems.length > 0) {
        console.log('[Home] 用API数据更新localStorage缓存');
        localStorage.setItem('topBarItems', JSON.stringify(apiTopBarItems));
      }
      
      return apiTopBarItems;
    }
    
    // 其次，当API没有返回数据时，尝试从localStorage获取缓存
    const cachedItems = localStorage.getItem('topBarItems');
    if (cachedItems) {
      try {
        console.log('[Home] API无数据，使用缓存的顶部导航项');
        return JSON.parse(cachedItems);
      } catch (e) {
        console.error('[Home] 解析缓存的顶部导航项失败:', e);
      }
    }
    
    // 最后，如果API和缓存都没有数据，返回默认值
    console.log('[Home] 使用默认顶部导航项');
    return DEFAULT_TOPBAR_ITEMS;
  }, [homeData]);

  // 记录上一次的topBarItems以检测变化
  const prevTopBarItemsRef = React.useRef<typeof topBarItems | null>(null);
  
  // 当API数据更新时，强制更新Provider以刷新UI
  React.useEffect(() => {
    // 避免首次渲染时的不必要判断
    if (prevTopBarItemsRef.current === null) {
      prevTopBarItemsRef.current = topBarItems;
      return;
    }
    
    // 检查数据是否有变化
    const prevItems = prevTopBarItemsRef.current;
    const hasChanged = topBarItems.length !== prevItems.length || 
      topBarItems.some((item: { id: string; text: string }, index: number) => {
        return item.id !== prevItems[index]?.id || item.text !== prevItems[index]?.text;
      });
    
    if (hasChanged) {
      console.log('[Home] 顶部导航项数据已更新，强制刷新UI');
      // 更新引用以便下次比较
      prevTopBarItemsRef.current = topBarItems;
    }
  }, [topBarItems]);

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