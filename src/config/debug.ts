// 调试配置
export interface DebugConfig {
  // 是否启用日志打印
  enableLogging: boolean;
  // 是否显示调试控制台
  showDebugConsole: boolean;
}

// 从环境变量中获取配置
const getDebugConfig = (): DebugConfig => {
  return {
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
    showDebugConsole: import.meta.env.VITE_SHOW_DEBUG_CONSOLE !== 'false',
  };
};

export const debugConfig = getDebugConfig();