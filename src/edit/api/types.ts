/**
 * 编辑页数据模型
 * 定义视频编辑页所需的数据结构
 */

// 文本内容模型
export interface ContentModel {
  text: string;
  splitType: string;
  volume: number;
}

// 背景音乐模型
export interface BackgroundMusicModel {
  name: string;
  musicId: string;
  url: string;
  start_time: string;
  end_time: string;
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
}

// 素材模型
export interface MaterialModel {
  name: string;
  materialID: string;
  previewUrl: string; // 视频预览URL
  previewImage?: string; // 保留旧属性以保持兼容性
}

// 视频编辑配置模型
export interface VideoEditConfig {
  title: string;
  content: ContentModel;
  backgroundMusic: BackgroundMusicModel;
  backgroundImage: BackgroundImageModel;
  style: StyleModel;
  material: MaterialModel;
  backupVideoNum?: number; // 备用视频数量
}

// 接口响应基础模型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
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