/**
 * 时间格式化工具函数
 */

/**
 * 将秒数转换为时分秒格式
 * @param seconds 秒数
 * @returns 格式化后的时间字符串 (mm:ss)
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 解析时间字符串为秒数
 * @param timeStr 时间字符串 (mm:ss)
 * @returns 秒数
 */
export function parseTimeToSeconds(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
} 