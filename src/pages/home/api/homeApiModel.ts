// 定义首页接口返回的数据类型
export interface HomeApiResponse {
  status: string;
  msg: string;
  data: HomeData;
}

export interface HomeData {
  topbar: TopbarItem[]; // 修改为正确的命名
  content: ContentItem[];
  pages?: PaginationInfo; // 添加分页信息
}

export interface TopbarItem {
  id: string;
  text: string;
}

export interface ContentItem {
  _id: string;
  styleId: string;
  styleName: string;
  title: string;
  text: string;
  cover: string;
  stars: number;
  ratio?: string;
  coverRatio?: string;
  createdAt?: string;
  updatedAt?: string;
  videoUrl?: string;
}

// 分页信息
export interface PaginationInfo {
  pageNum: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// 定义首页接口请求参数类型
export interface HomeApiParams {
  tab?: string;
  pageNum?: number;
  pageSize?: number;
}

// 分页请求参数
export interface PaginationParams {
  pageNum: number;    // 当前页码，从1开始
  pageSize: number;   // 每页数据条数
  tabId: string;      // 当前标签ID
} 