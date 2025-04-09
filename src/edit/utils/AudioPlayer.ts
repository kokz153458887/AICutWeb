/**
 * 音频播放工具类
 * 负责管理音频的播放、暂停等操作
 */
class AudioPlayer {
  private static instance: AudioPlayer;
  private audio: HTMLAudioElement | null = null;
  private onEndedCallback: (() => void) | null = null;

  private constructor() {
    // 私有构造函数，确保单例
  }

  /**
   * 获取AudioPlayer实例
   */
  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  /**
   * 播放音频
   * @param url 音频URL
   * @param onEnded 播放结束回调
   */
  public play(url: string, onEnded?: () => void): void {
    // 如果正在播放其他音频，先停止
    this.stop();
    
    // 创建新的音频实例
    this.audio = new Audio(url);
    
    // 设置播放结束回调
    this.onEndedCallback = onEnded || null;
    
    // 播放完成后清理实例
    this.audio.onended = () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
      this.audio = null;
      this.onEndedCallback = null;
    };
    
    // 播放音频
    this.audio.play().catch(error => {
      console.error('播放音频失败:', error);
      this.audio = null;
      this.onEndedCallback = null;
    });
  }

  /**
   * 停止当前播放的音频
   */
  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
      this.audio = null;
      this.onEndedCallback = null;
    }
  }

  /**
   * 检查是否正在播放
   */
  public isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused;
  }
}

export default AudioPlayer; 