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
   * 清理当前材料数据
   */
  static clearData(): void {
    this.materialData = null;
    this.directories = [];
    this.files = [];
    this.baseUrl = '';
    console.log('材料数据已清理');
  }

  /**
   * 获取材料目录数据
   * @param url 材料URL
   */
  static async fetchMaterialData(url: string): Promise<MaterialNode> {
    try {
      console.log('获取材料数据:', url);
      
      // 清理之前的数据
      this.clearData();
      
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
   * @param existingTags 已存在的标签列表，用于过滤重复
   */
  static getDirectorySuggestions(input: string, existingTags: string[] = []): SuggestionItem[] {
    const trimmedInput = input.trim();
    
    // 过滤掉已存在的目录标签
    const availableDirectories = this.directories.filter(dir => 
      !existingTags.includes(dir)
    );
    
    // 调试信息：显示过滤结果
    if (existingTags.length > 0) {
      console.log('目录联想过滤结果:', {
        totalDirectories: this.directories.length,
        existingTags,
        availableDirectories: availableDirectories.length,
        filteredOut: this.directories.length - availableDirectories.length
      });
    }
    
    // 如果输入为空，返回所有未使用的目录
    if (!trimmedInput) {
      return availableDirectories.map(dir => ({
        name: dir,
        type: 'directory' as const,
        matchType: 'startWith' as const
      }));
    }

    const lowerInput = trimmedInput.toLowerCase();

    // startWith 匹配
    const startWithMatches = availableDirectories.filter(dir => 
      dir.toLowerCase().startsWith(lowerInput)
    ).map(dir => ({
      name: dir,
      type: 'directory' as const,
      matchType: 'startWith' as const
    }));

    // contains 模糊匹配
    const containsMatches = availableDirectories.filter(dir => 
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
   * @param existingTags 已存在的标签列表，用于过滤重复
   */
  static getFileSuggestions(input: string, existingTags: string[] = []): SuggestionItem[] {
    const trimmedInput = input.trim();
    
    // 过滤掉已存在的文件标签
    const availableFiles = this.files.filter(file => 
      !existingTags.includes(file.name)
    );
    
    // 调试信息：显示过滤结果
    if (existingTags.length > 0) {
      console.log('文件联想过滤结果:', {
        totalFiles: this.files.length,
        existingTags,
        availableFiles: availableFiles.length,
        filteredOut: this.files.length - availableFiles.length
      });
    }
    
    // 如果输入为空，返回所有未使用的文件（已按创建时间排序）
    if (!trimmedInput) {
      return availableFiles.map(file => {
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
    const startWithMatches = availableFiles.filter(file => 
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
    const containsMatches = availableFiles.filter(file => 
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

  /**
   * 从文本中提取已存在的标签
   * 算法优化：用于过滤联想词中的重复标签，避免用户重复输入相同的标签
   * 
   * 实现原理：
   * 1. 使用正则表达式匹配文本中所有完整的标签（[%...] 和 [@...]）
   * 2. 提取标签内容并去重，分别存储目录标签和文件标签
   * 3. 在获取联想建议时，过滤掉这些已存在的标签
   * 
   * 支持的标签格式：
   * - 目录标签：[%目录名]
   * - 文件标签：[@文件名]
   * 
   * @param text 要解析的文本
   * @returns 包含目录和文件标签的对象
   */
  static extractExistingTags(text: string): { directories: string[], files: string[] } {
    const directories: string[] = [];
    const files: string[] = [];
    
    // 匹配所有目录标签 [%...] 
    const directoryMatches = text.match(/\[%([^\]]+)\]/g);
    if (directoryMatches) {
      directoryMatches.forEach(match => {
        const tagContent = match.substring(2, match.length - 1); // 去掉 [% 和 ]
        if (tagContent && !directories.includes(tagContent)) {
          directories.push(tagContent);
        }
      });
    }
    
    // 匹配所有文件标签 [@...]
    const fileMatches = text.match(/\[@([^\]]+)\]/g);
    if (fileMatches) {
      fileMatches.forEach(match => {
        const tagContent = match.substring(2, match.length - 1); // 去掉 [@ 和 ]
        if (tagContent && !files.includes(tagContent)) {
          files.push(tagContent);
        }
      });
    }
    
    return { directories, files };
  }
} 