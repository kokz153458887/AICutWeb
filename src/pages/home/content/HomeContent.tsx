import * as React from 'react';
import { useTopBar } from '../topbar';
import { TopBarItem } from '../topbar';
import TabContent from './TabContent';

/**
 * 内容容器组件类的属性接口
 */
interface HomeContentProps {
  items: TopBarItem[];
  currentItem: TopBarItem;
}

/**
 * 组件状态类型定义，包含已渲染标签集合
 */
interface HomeContentState {
  renderedTabs: Set<string>;
}

/**
 * 内容容器组件类，负责管理Tab的渲染和切换
 */
class HomeContentClass extends React.Component<HomeContentProps, HomeContentState> {
  // 初始化状态
  state: HomeContentState = {
    renderedTabs: new Set<string>()
  };
  
  // 缓存TabContent组件实例的引用映射
  private tabComponentRefs: Map<string, React.ReactNode> = new Map();

  // 当选项卡变化时，将其加入已渲染集合
  componentDidUpdate(prevProps: HomeContentProps) {
    const { currentItem } = this.props;
    if (prevProps.currentItem.id !== currentItem.id) {
      const isNewTab = !this.state.renderedTabs.has(currentItem.id);
      
      if (isNewTab) {
        console.log(`[HomeContent] 添加新Tab到渲染集合: ${currentItem.id}, 文本: ${currentItem.text}`);
        // 为新标签创建组件实例并缓存
        this.createTabComponentIfNeeded(currentItem.id);
      } else {
        console.log(`[HomeContent] 切换到已渲染Tab: ${currentItem.id}, 文本: ${currentItem.text}, 组件实例已存在:`, !!this.tabComponentRefs.get(currentItem.id));
      }
      
      this.setState(prevState => ({
        renderedTabs: new Set(prevState.renderedTabs).add(currentItem.id)
      }));
    }
  }

  // 组件挂载时添加当前选项卡到渲染集合
  componentDidMount() {
    const { currentItem } = this.props;
    console.log(`[HomeContent] 初始添加Tab到渲染集合: ${currentItem.id}, 文本: ${currentItem.text}`);
    
    // 为初始标签创建组件实例并缓存
    this.createTabComponentIfNeeded(currentItem.id);
    
    this.setState({
      renderedTabs: new Set([currentItem.id])
    });
  }

  /**
   * 为指定ID的标签创建组件实例并缓存
   * @param tabId 标签ID
   */
  createTabComponentIfNeeded(tabId: string): void {
    // 如果该标签的组件实例已存在，则不重复创建
    if (!this.tabComponentRefs.has(tabId)) {
      console.log(`[HomeContent] 创建新的组件实例: ${tabId}`);
      const tabComponent = (
        <div key={tabId} className="tab-content-wrapper">
          <TabContent id={tabId} />
        </div>
      );
      this.tabComponentRefs.set(tabId, tabComponent);
    } else {
      console.log(`[HomeContent] 组件实例已存在，不重复创建: ${tabId}`);
    }
  }

  render() {
    const { currentItem } = this.props;
    const { renderedTabs } = this.state;
    
    console.log(`[HomeContent] 渲染, 当前tab: ${currentItem.id}, 已渲染tabs数量: ${renderedTabs.size}`);
    
    // 创建一个内容的缓存映射
    const tabContents: React.ReactNode[] = [];
    
    // 遍历已渲染的标签，从缓存中获取组件实例
    renderedTabs.forEach(tabId => {
      // 检查组件是否已在缓存中
      if (!this.tabComponentRefs.has(tabId)) {
        this.createTabComponentIfNeeded(tabId);
      }
      
      // 从缓存中获取组件实例
      const tabComponent = this.tabComponentRefs.get(tabId);
      if (tabComponent) {
        const isActive = currentItem.id === tabId;
        console.log(`[HomeContent] 添加tab组件到渲染列表: ${tabId}, 是否显示: ${isActive}`);
        
        tabContents.push(
          <div 
            key={tabId} 
            style={{ 
              display: isActive ? 'block' : 'none',
              width: '100%',
              height: '100%',
              flex: 1,
              overflow: 'hidden'
            }}
          >
            {tabComponent}
          </div>
        );
      }
    });
    
    return (
      <div className="home-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 50px)' }}>
        {tabContents}
      </div>
    );
  }
}

/**
 * 函数组件包装类组件，提供Context
 */
const HomeContent: React.FC = () => {
  const { items, currentItem } = useTopBar();
  return <HomeContentClass items={items} currentItem={currentItem} />;
};

export default HomeContent; 