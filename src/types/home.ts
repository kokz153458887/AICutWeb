/**
 * 首页数据类型定义
 */

// 顶部标签项
export interface HomeTabItem {
  id: string;
  text: string;
}

// 内容项
export interface HomeContentItem {
  _id: string;
  styleId: string;
  styleName?: string;
  title?: string;
  text: string;
  cover: string;
  stars: number;
  ratio?: string;
  coverRatio?: string;
  createdAt?: string;
  updatedAt?: string;
  videoUrl?: string;
  navUrl?: string;
}

// 首页数据
export interface HomeData {
  topbar: HomeTabItem[];
  content: HomeContentItem[];
}

// 首页API响应
export interface HomeApiResponse {
  status: string;
  msg: string;
  data: HomeData;
} 