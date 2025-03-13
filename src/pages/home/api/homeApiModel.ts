// 定义首页接口返回的数据类型
export interface HomeApiResponse {
  status: string;
  msg: string;
  data: HomeData;
}

export interface HomeData {
  topbar: TopbarItem[]; // 修改为正确的命名
  content: ContentItem[];
}

export interface TopbarItem {
  id: string;
  text: string;
}

export interface ContentItem {
  styleId: string;
  styleName: string;
  text: string;
  cover: string;
  stars: string;
}

// 定义首页接口请求参数类型
export interface HomeApiParams {
  topbar: string;
} 