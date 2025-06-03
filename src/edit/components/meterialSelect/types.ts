/**
 * 素材库文件相关类型定义
 */

/**
 * 素材库文件项接口
 */
export interface MaterialFileItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  size_formatted?: string;
  duration?: number;
  duration_formatted?: string;
  width?: number;
  height?: number;
  codec?: string;
  absolute_path?: string;
  relative_path?: string;
  preview_image?: string;
  create_time?: string;
  children?: MaterialFileItem[];
}

/**
 * 素材库根目录结构
 */
export interface MaterialRoot {
  name: string;
  type: 'directory';
  path: string;
  children: MaterialFileItem[];
}

/**
 * 面包屑导航项
 */
export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * 选中的文件项
 */
export interface SelectedItem extends MaterialFileItem {
  fullPath: string; // 完整的相对路径
} 