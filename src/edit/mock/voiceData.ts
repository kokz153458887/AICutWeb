/**
 * 音色数据模拟
 * 提供测试用的音色选择数据
 */

// 表情数据类型
export interface Emotion {
  name: string; // 情感名称
  level?: number; // 情感等级
}

// 语音示例信息
export interface SpeechInfo {
  text: string; // 示例文本
  url: string;  // 示例音频URL
}

// 额外信息
export interface ExtraInfo {
  [key: string]: any;
}

// 使用量信息
export interface UsageInfo {
  count: number; // 使用次数
  lastUsed?: Date; // 最后使用时间
}

/**
 * 音色信息模型
 */
export interface VoiceInfo {
  id: string;          // 内部ID
  voiceCode: string;   // 唯一标识符
  voiceServer: string; // 云服务名称
  voiceName: string;   // 语音名称ID
  voicer: string;      // 配音员名称
  category?: string[]; // 分类
  gender?: string;     // 性别
  age?: string;        // 年龄
  tag?: string[];      // 标签
  scene?: string[];    // 场景
  language?: string;   // 语言
  emotion?: string[];  // 情感列表
  sampling?: string[]; // 采样率
  speech?: {           // 语音示例
    text: string;
    url: string;
  };
  avatar?: string;     // 头像路径
  favorite?: boolean;  // 是否收藏
  settings?: {         // 音色设置
    speed: number;     // 语速 -10.0 ~ 10.0
    pitch: number;     // 语调 -10.0 ~ 10.0
    intensity: number; // 情感强度 -10.0 ~ 10.0
    volume: number;    // 音量 0 ~ 1
  }
}

// 音色设置接口
export interface VoiceSettings {
  speed: number;
  pitch: number;
  intensity: number;
  volume?: number;
}

/**
 * 顶部标签类型
 */
export interface TopBarItem {
  id: string;
  text: string;
}

/**
 * 音色数据响应结构
 */
export interface VoiceDataResponse {
  status: string;
  msg: string;
  data: {
    topbar: TopBarItem[];
    content: VoiceInfo[];
  };
}

/**
 * 音色分类数据响应结构
 */
export interface VoiceCategoriesResponse {
  status: string;
  msg: string;
  data: {
    topbar: TopBarItem[];
  };
}

/**
 * 音色分类列表数据响应结构
 */
export interface VoiceByCategoryResponse {
  status: string;
  msg: string;
  data: {
    content: VoiceInfo[];
  };
}

// 本地存储键名
const VOICE_FAVORITE_KEY = 'voice_favorites';
const VOICE_SETTINGS_KEY = 'voice_settings';

/**
 * 模拟音色数据类
 */
export class MockVoiceData {
  private static instance: MockVoiceData;
  private voiceData: VoiceInfo[] = [];
  private categories: string[] = [];
  
  /**
   * 私有构造函数，初始化数据
   */
  private constructor() {
    // 初始化分类数据
    this.categories = [
      '热门',
      '收藏',
      '解说',
      '男声',
      '女声',
      '童声',
      '外语',
      '方言'
    ];
    
    // 基础音色数据
    const baseVoices: VoiceInfo[] = [
      {
        id: '1',
        voiceCode: 'aliyun_ruirui_柔柔',
        voiceServer: 'aliyun',
        voiceName: 'ruirui',
        voicer: '柔柔',
        category: ['女声'],
        gender: '女',
        age: '成年',
        tag: ['温柔', '甜美'],
        scene: ['解说', '广告'],
        language: '中文',
        emotion: ['开心', '悲伤', '愤怒'],
        avatar: '/data/avatar/1.png',
        favorite: false
      },
      {
        id: '2',
        voiceCode: 'aliyun_wanwan_婉婉',
        voiceServer: 'aliyun',
        voiceName: 'wanwan',
        voicer: '婉婉',
        category: ['女声'],
        gender: '女',
        age: '成年',
        tag: ['温婉', '典雅'],
        scene: ['解说'],
        language: '中文',
        avatar: '/data/avatar/2.png',
        favorite: true
      },
      {
        id: '3',
        voiceCode: 'aliyun_gang_刚刚',
        voiceServer: 'aliyun',
        voiceName: 'gang',
        voicer: '刚刚',
        category: ['男声'],
        gender: '男',
        age: '成年',
        tag: ['浑厚', '磁性'],
        scene: ['解说'],
        language: '中文',
        avatar: '/data/avatar/3.png',
        favorite: false
      },
      {
        id: '4',
        voiceCode: 'aliyun_chenchen_沉沉',
        voiceServer: 'aliyun',
        voiceName: 'chenchen',
        voicer: '沉沉',
        category: ['男声'],
        gender: '男',
        age: '成年',
        emotion: ['开心', '悲伤'],
        avatar: '/data/avatar/4.png',
        favorite: false
      },
      {
        id: '5',
        voiceCode: 'aliyun_tongtong_童童',
        voiceServer: 'aliyun',
        voiceName: 'tongtong',
        voicer: '童童',
        category: ['童声'],
        gender: '未知',
        age: '儿童',
        avatar: '/data/avatar/5.png',
        favorite: false
      },
      {
        id: '6',
        voiceCode: 'en_female_1',
        voiceServer: 'en',
        voiceName: 'female_1',
        voicer: 'Emma',
        category: ['外语'],
        gender: '女',
        language: '英语',
        avatar: '/data/avatar/2.png',
        favorite: false
      },
      {
        id: '7',
        voiceCode: 'dialect_1',
        voiceServer: 'cn',
        voiceName: 'dialect_1',
        voicer: '粤语女声',
        category: ['方言'],
        gender: '女',
        language: '粤语',
        avatar: '/data/avatar/1.png',
        favorite: false
      },
      {
        id: '8',
        voiceCode: 'female_3',
        voiceServer: 'cn',
        voiceName: 'female_3',
        voicer: '甜甜',
        category: ['女声'],
        gender: '女',
        emotion: ['开心', '悲伤', '中性'],
        avatar: '/data/avatar/2.png',
        favorite: false
      },
      {
        id: '9',
        voiceCode: 'male_3',
        voiceServer: 'cn',
        voiceName: 'male_3',
        voicer: '暖暖',
        category: ['男声'],
        gender: '男',
        avatar: '/data/avatar/3.png',
        favorite: false
      },
      {
        id: '10',
        voiceCode: 'en_male_1',
        voiceServer: 'en',
        voiceName: 'male_1',
        voicer: 'Jack',
        category: ['外语'],
        gender: '男',
        language: '英语',
        avatar: '/data/avatar/4.png',
        favorite: false
      }
    ];
    
    // 初始化音色数据，包括基础数据
    this.voiceData = [...baseVoices];
    
    // 添加更多音色数据，达到约100个
    const avatarCount = 5; // 头像文件数量(/data/avatar/1.png到5.png)
    const additionalVoiceCount = 90; // 额外添加的音色数量
    
    const categories = ['男声', '女声', '童声', '外语', '方言', '解说'];
    const emotions = [['开心'], ['悲伤'], ['中性'], ['开心', '悲伤'], ['开心', '悲伤', '愤怒'], []];
    const genders = ['男', '女', '未知'];
    const ages = ['成年', '青年', '中年', '老年', '儿童'];
    const tags = [
      ['浑厚', '磁性'], 
      ['温柔', '甜美'], 
      ['活泼', '可爱'], 
      ['庄重', '严肃'], 
      ['高贵', '典雅'],
      ['清晰', '标准']
    ];
    
    for (let i = 0; i < additionalVoiceCount; i++) {
      const index = i + baseVoices.length + 1;
      const categoryIndex = i % categories.length;
      const avatarIndex = (i % avatarCount) + 1; // 1-5之间的随机头像
      const emotionIndex = i % emotions.length;
      const genderIndex = i % genders.length;
      const ageIndex = i % ages.length;
      const tagIndex = i % tags.length;
      
      const voiceName = `voice_${index}`;
      const voicer = `音色${index}`;
      
      this.voiceData.push({
        id: `${index}`,
        voiceCode: `server_${voiceName}_${voicer}`,
        voiceServer: 'server',
        voiceName: voiceName,
        voicer: voicer,
        category: [categories[categoryIndex]],
        gender: genders[genderIndex],
        age: ages[ageIndex],
        tag: tags[tagIndex],
        language: i % 5 === 0 ? '英语' : '中文',
        emotion: emotions[emotionIndex],
        avatar: `/data/avatar/${avatarIndex}.png`, // 使用5个指定头像中的一个
        favorite: i % 10 === 0
      });
    }
    
    // 从本地存储加载设置和收藏状态
    this.loadUserData();
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): MockVoiceData {
    if (!MockVoiceData.instance) {
      MockVoiceData.instance = new MockVoiceData();
    }
    return MockVoiceData.instance;
  }
  
  /**
   * 加载用户数据（收藏状态和音色设置）
   */
  private loadUserData(): void {
    try {
      // 加载收藏数据
      const favoritesStr = localStorage.getItem('voice_favorites');
      if (favoritesStr) {
        const favorites = JSON.parse(favoritesStr);
        
        // 更新收藏状态
        this.voiceData.forEach(voice => {
          voice.favorite = favorites[voice.id] === true;
        });
      }
      
      // 加载设置数据
      const settingsStr = localStorage.getItem('voice_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        
        // 更新设置
        this.voiceData.forEach(voice => {
          if (settings[voice.id]) {
            voice.settings = settings[voice.id];
          }
        });
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  }
  
  /**
   * 获取音色分类
   */
  public getVoiceCategories(): string[] {
    return this.categories;
  }
  
  /**
   * 根据分类获取音色列表
   * @param category 分类名称，如果为null则返回所有音色
   */
  public getVoicesByCategory(category: string | null): VoiceInfo[] {
    if (!category) {
      return [...this.voiceData];
    }
    
    switch (category) {
      case '热门':
        // 返回前5个音色作为热门
        return this.voiceData.slice(0, 5);
      case '女声':
        return this.voiceData.filter(v => v.category && v.category.includes('女声'));
      case '男声':
        return this.voiceData.filter(v => v.category && v.category.includes('男声'));
      case '童声':
        return this.voiceData.filter(v => v.category && v.category.includes('童声'));
      case '外语':
        return this.voiceData.filter(v => v.language && v.language.includes('en_'));
      case '方言':
        return this.voiceData.filter(v => v.language && v.language.includes('dialect'));
      case '收藏':
        return this.voiceData.filter(v => v.favorite);
      default:
        return [...this.voiceData];
    }
  }
  
  /**
   * 保存收藏状态
   * @param id 音色ID
   * @param isFavorite 是否收藏
   */
  public saveFavorite(id: string, isFavorite: boolean): void {
    // 更新数据
    const voice = this.voiceData.find(v => v.id === id);
    if (voice) {
      voice.favorite = isFavorite;
    }
    
    // 保存到本地存储
    try {
      const favoritesStr = localStorage.getItem('voice_favorites') || '{}';
      const favorites = JSON.parse(favoritesStr);
      
      favorites[id] = isFavorite;
      localStorage.setItem('voice_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('保存收藏状态失败:', error);
    }
  }
  
  /**
   * 保存音色设置
   * @param id 音色ID
   * @param settings 设置参数
   */
  public saveSettings(id: string, settings: VoiceSettings): void {
    // 更新数据
    const voice = this.voiceData.find(v => v.id === id);
    if (voice) {
      voice.settings = { 
        speed: settings.speed,
        pitch: settings.pitch,
        intensity: settings.intensity,
        volume: settings.volume || 0.8 // 确保 volume 有默认值
      };
    }
    
    // 保存到本地存储
    try {
      const settingsStr = localStorage.getItem('voice_settings') || '{}';
      const allSettings = JSON.parse(settingsStr);
      
      allSettings[id] = settings;
      localStorage.setItem('voice_settings', JSON.stringify(allSettings));
    } catch (error) {
      console.error('保存音色设置失败:', error);
    }
  }
  
  /**
   * 获取音色设置
   * @param id 音色ID
   */
  public getVoiceSettings(id: string): VoiceSettings | null {
    const voice = this.voiceData.find(v => v.id === id);
    if (voice && voice.settings) {
      return { ...voice.settings };
    }
    
    // 默认设置
    return {
      speed: 0,      // 默认正常语速
      pitch: 0,      // 默认正常语调
      intensity: 0,  // 默认正常情感强度
      volume: 0.8    // 默认音量 80%
    };
  }
} 