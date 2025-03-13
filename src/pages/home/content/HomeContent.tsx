import * as React from 'react';
import { useHomeData } from '../useHomeData';
import { useTopBar } from '../topbar';
import { TopBarItem } from '../topbar';

// 单个Tab的内容组件
const TabContent: React.FC<{ id: string, isActive: boolean }> = ({ id, isActive }) => {
  const { homeData, loading, error, refetch } = useHomeData();
  const loadedRef = React.useRef(false);
  
  // 只在组件首次渲染时加载数据
  React.useEffect(() => {
    if (!loadedRef.current) {
      refetch(id);
      loadedRef.current = true;
    }
  }, [refetch, id]);

  // 检查是否有内容可显示
  const hasContent = !loading && !error && homeData?.content && homeData.content.length > 0;
  
  return (
    <div className="tab-content" style={{ display: isActive ? 'block' : 'none' }}>
      {loading && <p className="loading-text">加载中...</p>}
      {error && <p className="error-text">{error}</p>}
      {hasContent ? (
        <div className="content-list">
          {homeData!.content.map((item, index) => (
            <div key={item.styleId || index} className="content-item">
              <p className="content-text">{item.text}</p>
              {item.cover && <img src={item.cover} alt={item.text} className="content-image" />}
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && <p className="empty-text">暂无内容</p>
      )}
    </div>
  );
};

// 内容容器组件类的属性
interface HomeContentProps {
  items: TopBarItem[];
  currentItem: TopBarItem;
}

// 内容容器组件类
class HomeContentClass extends React.Component<HomeContentProps> {
  render() {
    const { items, currentItem } = this.props;
    
    return (
      <div className="home-content">
        {items.map(item => (
          <TabContent 
            key={item.id}
            id={item.id}
            isActive={currentItem.id === item.id}
          />
        ))}
      </div>
    );
  }
}

// 函数组件包装类组件，提供Context
const HomeContent: React.FC = () => {
  const { items, currentItem } = useTopBar();
  return <HomeContentClass items={items} currentItem={currentItem} />;
};

export default HomeContent; 