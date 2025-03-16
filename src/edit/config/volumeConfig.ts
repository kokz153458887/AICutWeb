/**
 * 音量配置文件
 * 配置音量控制的相关参数
 */
export const volumeConfig = {
  // 最大音量（相对于原音量的百分比）
  maxPercent: 500,
  
  // 默认音量（相对于原音量的百分比）
  defaultPercent: 100,
  
  // 最小音量
  minPercent: 0,
  
  // 音量滑块刻度数（更高意味着更精细的控制）
  sliderSteps: 5,
  
  // 音量值显示格式（是否显示百分比符号）
  showPercentSign: true,
  
  // 音量显示的转换系数（用于将滑块值转换为显示值）
  displayFactor: 5 // 滑块值 * displayFactor = 显示的百分比值
}; 