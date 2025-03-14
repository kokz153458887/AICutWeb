// 项目配置
export interface ProjectConfig {
  debug?: {
    // 是否启用日志打印
    enableLogging?: boolean;
    // 是否显示调试控制台
    showDebugConsole?: boolean;
  };
}

// 项目配置
export const projectConfig: ProjectConfig = {
  debug: {
    enableLogging: false,
    showDebugConsole: false
  }
};