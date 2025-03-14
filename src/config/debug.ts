// 调试配置
export interface DebugConfig {
  // 是否启用日志打印
  enableLogging: boolean;
  // 是否显示调试控制台
  showDebugConsole: boolean;
}

import { projectConfig } from './project';

// 从项目配置和环境变量中获取配置
const getDebugConfig = (): DebugConfig => {
  return {
    enableLogging: projectConfig.debug?.enableLogging ?? (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_ENABLE_LOGGING !== 'false' : true),
    showDebugConsole: projectConfig.debug?.showDebugConsole ?? import.meta.env.VITE_SHOW_DEBUG_CONSOLE !== 'false',
  };
};

export const debugConfig = getDebugConfig();