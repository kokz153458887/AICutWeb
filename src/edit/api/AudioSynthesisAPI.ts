/**
 * 音频合成API服务
 * 负责处理文本转语音相关的API请求（仅使用MOCK数据）
 */
import { VoiceInfo } from '../mock/voiceData';

/**
 * 音频合成API服务
 */
export class AudioSynthesisAPI {
  private static audioElement: HTMLAudioElement | null = null;
  private static isPlaying: boolean = false;
  private static isRecording: boolean = false;
  private static lastAudioUrl: string = '';
  
  /**
   * 获取当前播放状态
   * @returns 是否正在播放音频
   */
  public static isAudioPlaying(): boolean {
    return this.isPlaying;
  }
  
  /**
   * 获取当前录音状态
   * @returns 是否正在录制音频
   */
  public static isAudioRecording(): boolean {
    return this.isRecording;
  }
  
  /**
   * 合成音频
   * @param text 要合成的文本
   * @param voiceId 语音ID
   * @param volume 音量
   * @returns 音频URL
   */
  public static async synthesizeAudio(text: string, voiceId: string, volume: number): Promise<string> {
    console.log(`[AudioSynthesis] 开始合成音频... 音量: ${volume}, 语音ID: ${voiceId}`);
    
    // 设置录音状态
    this.isRecording = true;
    
    try {
      // 检查参数完整性
      if (!text || !voiceId) {
        throw new Error('合成音频需要文本和语音ID');
      }
      
      // 使用模拟数据
      const audioUrl = await this.mockSynthesizeAudio(text, voiceId, volume);
      this.lastAudioUrl = audioUrl;
      return audioUrl;
    } catch (error) {
      console.error('[AudioSynthesis] 音频合成失败:', error);
      throw error;
    } finally {
      // 重置录音状态
      this.isRecording = false;
    }
  }
  
  /**
   * 模拟合成语音
   * @param text 文本内容
   * @param voiceId 语音ID
   * @param volume 音量
   * @returns 模拟的音频URL
   */
  static mockSynthesizeAudio(text: string, voiceId: string, volume: number): Promise<string> {
    return new Promise((resolve) => {
      console.log(`[AudioSynthesis] 开始模拟合成音频，文本长度: ${text.length}字，音色ID: ${voiceId}`);
      
      // 模拟网络延迟
      setTimeout(() => {
        // 根据文本长度计算模拟的音频时长（约每秒4个汉字）
        const duration = Math.max(2, Math.ceil(text.length / 4));
        
        // 模拟的音频URL
        const audioUrl = '/assets/audio/example.mp3';
        
        console.log(`[AudioSynthesis] 模拟音频合成成功，持续时间: ${duration}秒`);
        
        resolve(audioUrl);
      }, 1000); // 模拟1秒的网络延迟
    });
  }
  
  /**
   * 播放音频
   * @param audioUrl 音频URL
   * @param volume 音量
   */
  public static playAudio(audioUrl: string, volume: number = 100): void {
    console.log(`[AudioSynthesis] 开始播放音频, 音量: ${volume}`);
    
    try {
      // 如果已有音频在播放，先停止
      if (this.audioElement) {
        this.stopAudio();
      }
      
      // 创建新的音频元素
      this.audioElement = new Audio(audioUrl);
      this.audioElement.volume = volume / 100;
      
      // 添加事件监听
      this.audioElement.addEventListener('loadstart', () => {
        console.log('[AudioSynthesis] 音频开始加载');
      });
      
      this.audioElement.addEventListener('canplay', () => {
        console.log('[AudioSynthesis] 音频可以播放');
      });
      
      this.audioElement.addEventListener('ended', () => {
        console.log('[AudioSynthesis] 音频播放完成');
        this.isPlaying = false;
      });
      
      this.audioElement.addEventListener('error', (e) => {
        console.error('[AudioSynthesis] 音频播放错误:', e);
        this.isPlaying = false;
      });
      
      // 开始播放
      this.audioElement.play().then(() => {
        this.isPlaying = true;
      }).catch((error) => {
        console.error('[AudioSynthesis] 音频播放失败:', error);
        this.isPlaying = false;
      });
    } catch (error) {
      console.error('[AudioSynthesis] 播放音频出错:', error);
      this.isPlaying = false;
    }
  }
  
  /**
   * 停止当前播放的音频
   */
  static stopAudio(): void {
    if (this.audioElement) {
      console.log('[AudioSynthesisAPI] 停止当前音频播放');
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
  }
  
  /**
   * 更新当前音频的音量
   * @param volume 音量（0-100）
   */
  static updateVolume(volume: number): void {
    if (this.audioElement) {
      console.log(`[AudioSynthesisAPI] 更新音量: ${volume}%`);
      this.audioElement.volume = volume / 100;
    }
  }
  
  /**
   * 获取最后合成的音频URL
   * @returns 最后合成的音频URL，如果没有则返回null
   */
  static getLastAudioUrl(): string | null {
    return this.lastAudioUrl;
  }
} 