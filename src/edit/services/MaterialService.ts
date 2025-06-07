/**
 * 材料服务
 * 负责处理材料目录数据的解析和自动联想功能
 */
import axios from 'axios';

// 文件/目录节点接口
export interface MaterialNode {
  name: string;
  type: 'file' | 'directory';
  path?: string;
  children?: MaterialNode[];
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
}

// 自动联想结果接口
export interface SuggestionItem {
  name: string;
  type: 'directory' | 'file';
  matchType: 'startWith' | 'contains';
  createTime?: string; // 文件创建时间
  videoUrl?: string; // 视频播放地址
  isVideo?: boolean; // 是否为视频文件
}

/**
 * 材料服务类
 */
export class MaterialService {
  private static materialData: MaterialNode | null = null;
  private static directories: string[] = [];
  private static files: { name: string; createTime: string; originalName: string; relativePath: string }[] = []; // 修改为包含更多信息的对象数组
  private static baseUrl: string = ''; // 保存原始URL的基础地址

  /**
   * 获取材料目录数据
   * @param url 材料URL
   */
  static async fetchMaterialData(url: string): Promise<MaterialNode> {
    try {
      console.log('获取材料数据:', url);
      // 保存基础URL
      const urlObj = new URL(url);
      this.baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      
      const response = await axios.get(url);
      this.materialData = response.data;
      if (!this.materialData) {
        throw new Error('材料数据为空');
      }
      this.parseMaterialData(this.materialData);
      return this.materialData;
    } catch (error) {
      console.error('获取材料数据失败:', error);
      throw error;
    }
  }

  /**
   * 解析材料数据，提取一级子目录和文件名
   * @param data 材料数据
   */
  private static parseMaterialData(data: MaterialNode | null) {
    if (!data || !data.children) {
      this.directories = [];
      this.files = [];
      return;
    }

    this.directories = [];
    this.files = [];

    // 遍历一级子节点
    data.children.forEach(child => {
      if (child.type === 'directory') {
        // 添加一级子目录名
        this.directories.push(child.name);
      } else if (child.type === 'file') {
        // 添加文件名（去除后缀）和创建时间
        const fileName = this.removeFileExtension(child.name);
        this.files.push({
          name: fileName,
          createTime: child.create_time || '',
          originalName: child.name,
          relativePath: child.relative_path || child.name
        });
      }
    });

    // 递归遍历所有子目录中的文件
    this.extractFilesFromChildren(data.children);

    // 按创建时间排序，最新创建的排在最上面
    this.files.sort((a, b) => {
      if (!a.createTime || !b.createTime) return 0;
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
    });

    console.log('解析材料数据完成，目录:', this.directories, '文件:', this.files.map(f => f.name));
  }

  /**
   * 递归提取所有子目录中的文件
   * @param children 子节点数组
   */
  private static extractFilesFromChildren(children: MaterialNode[]) {
    children.forEach(child => {
      if (child.type === 'directory' && child.children) {
        // 遍历子目录中的文件
        child.children.forEach(subChild => {
          if (subChild.type === 'file') {
            const fileName = this.removeFileExtension(subChild.name);
            const existingFile = this.files.find(f => f.name === fileName);
            if (!existingFile) {
              this.files.push({
                name: fileName,
                createTime: subChild.create_time || '',
                originalName: subChild.name,
                relativePath: subChild.relative_path || subChild.name
              });
            }
          }
        });
        // 继续递归遍历更深层的目录
        this.extractFilesFromChildren(child.children);
      }
    });
  }

  /**
   * 移除文件扩展名
   * @param fileName 文件名
   */
  private static removeFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex > 0) {
      return fileName.substring(0, lastDotIndex);
    }
    return fileName;
  }

  /**
   * 判断是否为视频文件
   * @param fileName 文件名
   */
  private static isVideoFile(fileName: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'];
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return videoExtensions.includes(ext);
  }

  /**
   * 生成视频播放URL
   * @param relativePath 相对路径
   */
  private static generateVideoUrl(relativePath: string): string {
    if (!this.baseUrl || !this.materialData) return '';
    
    // 将反斜杠替换为正斜杠，并确保路径以正斜杠分隔
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    // 构建完整的视频URL: baseUrl + /material + /根目录名 + /文件相对路径
    return `${this.baseUrl}/material/${this.materialData.name}/${normalizedPath}`;
  }

  /**
   * 获取目录自动联想建议
   * @param input 输入的字符串，空字符串时返回所有目录
   */
  static getDirectorySuggestions(input: string): SuggestionItem[] {
    const trimmedInput = input.trim();
    
    // 如果输入为空，返回所有目录
    if (!trimmedInput) {
      return this.directories.map(dir => ({
        name: dir,
        type: 'directory' as const,
        matchType: 'startWith' as const
      }));
    }

    const lowerInput = trimmedInput.toLowerCase();

    // startWith 匹配
    const startWithMatches = this.directories.filter(dir => 
      dir.toLowerCase().startsWith(lowerInput)
    ).map(dir => ({
      name: dir,
      type: 'directory' as const,
      matchType: 'startWith' as const
    }));

    // contains 模糊匹配
    const containsMatches = this.directories.filter(dir => 
      !dir.toLowerCase().startsWith(lowerInput) && 
      dir.toLowerCase().includes(lowerInput)
    ).map(dir => ({
      name: dir,
      type: 'directory' as const,
      matchType: 'contains' as const
    }));

    return [...startWithMatches, ...containsMatches];
  }

  /**
   * 获取文件自动联想建议
   * @param input 输入的字符串，空字符串时返回所有文件（按创建时间排序）
   */
  static getFileSuggestions(input: string): SuggestionItem[] {
    const trimmedInput = input.trim();
    
    // 如果输入为空，返回所有文件（已按创建时间排序）
    if (!trimmedInput) {
      return this.files.map(file => {
        const isVideo = this.isVideoFile(file.originalName);
        return {
          name: file.name,
          type: 'file' as const,
          matchType: 'startWith' as const,
          createTime: file.createTime,
          isVideo,
          videoUrl: isVideo ? this.generateVideoUrl(file.relativePath) : undefined
        };
      });
    }

    const lowerInput = trimmedInput.toLowerCase();

    // startWith 匹配（保持创建时间排序）
    const startWithMatches = this.files.filter(file => 
      file.name.toLowerCase().startsWith(lowerInput)
    ).map(file => {
      const isVideo = this.isVideoFile(file.originalName);
      return {
        name: file.name,
        type: 'file' as const,
        matchType: 'startWith' as const,
        createTime: file.createTime,
        isVideo,
        videoUrl: isVideo ? this.generateVideoUrl(file.relativePath) : undefined
      };
    });

    // contains 模糊匹配（保持创建时间排序）
    const containsMatches = this.files.filter(file => 
      !file.name.toLowerCase().startsWith(lowerInput) && 
      file.name.toLowerCase().includes(lowerInput)
    ).map(file => {
      const isVideo = this.isVideoFile(file.originalName);
      return {
        name: file.name,
        type: 'file' as const,
        matchType: 'contains' as const,
        createTime: file.createTime,
        isVideo,
        videoUrl: isVideo ? this.generateVideoUrl(file.relativePath) : undefined
      };
    });

    return [...startWithMatches, ...containsMatches];
  }

  /**
   * 检查是否已加载材料数据
   */
  static hasData(): boolean {
    return this.materialData !== null;
  }

  /**
   * 获取当前材料数据
   */
  static getCurrentData(): MaterialNode | null {
    return this.materialData;
  }
} 