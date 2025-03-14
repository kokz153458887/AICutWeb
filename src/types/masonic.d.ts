/**
 * masonic库的TypeScript类型声明
 * 为masonic库提供类型支持，解决TypeScript类型错误
 */
declare module 'masonic' {
  import * as React from 'react';

  export interface MasonryProps<T> {
    /**
     * 要渲染的数据项数组
     */
    items: T[];
    
    /**
     * 列数
     */
    columnCount?: number;
    
    /**
     * 列宽
     */
    columnWidth?: number;
    
    /**
     * 列间距
     */
    columnGutter?: number;
    
    /**
     * 渲染单个项的函数
     */
    render: React.ComponentType<{
      index: number;
      data: T;
      width: number;
    }>;
    
    /**
     * 预加载的行数
     */
    overscanBy?: number;
    
    /**
     * 容器高度
     */
    height?: number;
    
    /**
     * 是否自动调整大小
     */
    autoResize?: boolean;
  }

  /**
   * Masonry组件
   */
  export function Masonry<T>(props: MasonryProps<T>): JSX.Element;
} 