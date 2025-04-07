/**
 * 音频播放工具类
 * 负责管理音频的播放、暂停等操作
 */
class AudioPlayer {
  private static instance: AudioPlayer;
  private audio: HTMLAudioElement | null = null;

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
   */
  public play(url: string): void {
    // 如果正在播放其他音频，先停止
    this.stop();
    
    // 创建新的音频实例
    this.audio = new Audio(url);
    
    // 播放完成后清理实例
    this.audio.onended = () => {
      this.audio = null;
    };
    
    // 播放音频
    this.audio.play().catch(error => {
      console.error('播放音频失败:', error);
      this.audio = null;
    });
  }

  /**
   * 停止当前播放的音频
   */
  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }
}

export default AudioPlayer; 