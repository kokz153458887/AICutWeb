/**
 * 编辑页数据模型
 * 定义视频编辑页所需的数据结构
 */

// 分句模式参数
export interface SplitParams {
  min_length: number;
  max_length: number;
}

// 分句模式模型
export interface SplitModel {
  splitType: string; // "strict" 标点断句, "smart" 智能断句
  splitParams: SplitParams;
}

// 文本内容模型
export interface ContentModel {
  text: string;
  splitType: string;
  splitModel: SplitModel;
  volume: number;
  speakerID?: string;
  voiceService?: string;
  voiceInfo?: any;
  voiceParams?: {
    speed: number;
    pitch: number;
    intensity: number;
    emotion?: string;
  };
}

// 音乐库项模型
export interface MusicLibItem {
  id: string;
  _id: string; // 保留原始 _id
  name: string;
  url: string;
  duration: number;
  start_time?: string;
  end_time?: string;
  discription: string;
  createdAt?: string;
  updatedAt?: string;
}

// 背景音乐模型
export interface BackgroundMusicModel {
  musicId: string;
  name: string;
  url: string;
  start_time?: string;
  end_time?: string;
  discription: string;
  volume: number;
  isloop: boolean;
}

// 背景图片模型
export interface BackgroundImageModel {
  url: string;
  backgroundId: string;
  scaleType: string;
  name?: string; // 背景图片名称
}

// 视频比例模型
export interface VideoRatioModel {
  ratio: string;
  cut_style: string;
}

// 字体样式模型
export interface FontStyleModel {
  font_size: number;
  min_font_size: number;
  max_line: number;
  max_line_chars: number;
  auto_scale: boolean;
  color: string;
  stroke_color: string;
  font_weight: string;
  stroke_width: number;
  y_position: number;
  margin_left: number;
  margin_right: number;
  alignParent: string;
  overflow_char?: string;
}

// 字体设置模型
export interface FontModel {
  voice_font_style: FontStyleModel;
  title_font_style: FontStyleModel;
}

// 视频风格模型
export interface StyleModel {
  ratio: string;
  resolution: string;
  styleName?: string; // 风格名称
  stylePreviewUrl?: string; // 风格预览视频URL
  videoShowRatio: VideoRatioModel;
  font: FontModel;
  _id?: string; // 风格ID
}

// 视频风格库项模型
export interface VideoStyleItem {
  _id: string;
  styleName: string;
  ratio: string;
  resolution: string;
  videoShowRatio: VideoRatioModel;
  font: FontModel;
  previewUrl: string;
  updateTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 素材模型
export interface MaterialModel {
  name: string;
  materialID: string;
  previewUrl: string; // 视频预览URL
  previewImage?: string; // 保留旧属性以保持兼容性
  url?: string; // 素材URL
}

// 用户偏好设置
export interface PreferencesModel {
  auto_select_text_type?: string;
}

// 视频编辑配置模型
export interface VideoEditConfig {
  title: string;
  content: ContentModel;
  backgroundMusic: BackgroundMusicModel;
  backgroundImage: BackgroundImageModel;
  style: StyleModel;
  material: MaterialModel;
  preferences: PreferencesModel;
  backupVideoNum?: number; // 备用视频数量
}

// 接口响应基础模型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 视频生成提交响应模型
export interface VideoGenerateResponse {
  generateId: string;  // 视频生成任务ID
  successUrl: string;  // 成功跳转链接
}

// 编辑页配置响应模型
export interface EditConfigResponse {
  config: VideoEditConfig;
  styleList: Array<{
    id: string;
    name: string;
    previewUrl: string;
  }>;
  musicList: Array<{
    id: string;
    name: string;
    url: string;
    duration: string;
  }>;
  backgroundList: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  materialList: Array<{
    id: string;
    name: string;
    previewUrl: string;
  }>;
}

// 素材库数据项模型
export interface MaterialLibItem {
  _id: string;
  name: string;
  url: string;
  fileName?: string;
  type?: string;
  previewUrl?: string;
  coverUrl?: string;
  nums?: number;
  diskSize?: number;
  diskSizeMB?: number;
  updateTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 素材库列表响应模型
export interface MaterialListResponse {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  data: MaterialLibItem[];
}

// 视频风格库列表响应模型 - 不再使用，保留为文档
export interface StyleListResponse {
  data: VideoStyleItem[];
}

/**
 * 背景图片项类型
 */
export interface ImageLibItem {
  url: string;
  resolutionWidth: number;
  resolutionHeight: number;
  ratio: string;
  size: number;
}

/**
 * 自动生成文本请求参数
 */
export interface AutoGenerateTextRequest {
  type: string;
  subType?: string;
  generate_size: number;
  allow_used: boolean;
}

/**
 * 自动生成文本响应数据项
 */
export interface AutoGenerateTextItem {
  text_id: string;
  text_content: string;
}

/**
 * 自动生成文本响应数据
 */
export interface AutoGenerateTextData {
  type: string;
  text: AutoGenerateTextItem[];
}

/**
 * 自动生成文本响应
 */
export interface AutoGenerateTextResponse {
  code: number;
  message: string;
  data: AutoGenerateTextData;
}

/**
 * 不喜欢文案请求参数
 */
export interface UnlikeTextRequest {
  type: string;
  subType?: string;
  text_id: string;
}

/**
 * 不喜欢文案响应
 */
export interface UnlikeTextResponse {
  code: number;
  message: string;
} 