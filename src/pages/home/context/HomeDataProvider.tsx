import * as React from 'react';
import { useHomeData } from '../useHomeData';
import { HomeDataContext } from './homeDataContext';

/**
 * 首页数据提供者组件，负责获取和提供数据
 * @param children 子组件
 */
const HomeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用useHomeData钩子获取数据，这里是唯一调用该钩子的地方
  const homeDataResult = useHomeData();
  
  // 将所有数据和方法提供给子组件
  return (
    <HomeDataContext.Provider value={homeDataResult}>
      {children}
    </HomeDataContext.Provider>
  );
};

export default HomeDataProvider; 