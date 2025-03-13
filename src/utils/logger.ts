// 日志级别枚举
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

// 日志项接口
export interface LogItem {
  level: LogLevel;
  message: string;
  timestamp: number;
}

// 日志监听器类型
type LogListener = (log: LogItem) => void;

import { debugConfig } from '../config/debug';

// 日志管理器类
export class Logger {
  private static instance: Logger;
  private listeners: LogListener[] = [];
  private logs: LogItem[] = [];

  private constructor() {}

  // 获取单例实例
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // 添加日志监听器
  public addListener(listener: LogListener) {
    this.listeners.push(listener);
  }

  // 移除日志监听器
  public removeListener(listener: LogListener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 获取所有日志
  public getLogs(): LogItem[] {
    return this.logs;
  }

  // 清空日志
  public clearLogs() {
    this.logs = [];
    this.notifyListeners({
      level: LogLevel.INFO,
      message: 'Logs cleared',
      timestamp: Date.now()
    });
  }

  // 记录日志
  private log(level: LogLevel, message: string) {
    // 如果日志功能被禁用，直接返回
    if (!debugConfig.enableLogging) {
      return;
    }
    
    const logItem: LogItem = {
      level,
      message,
      timestamp: Date.now()
    };
    this.logs.push(logItem);
    this.notifyListeners(logItem);
  }

  // 通知所有监听器
  private notifyListeners(log: LogItem) {
    this.listeners.forEach(listener => listener(log));
  }

  // 公共日志方法
  public info(message: string) {
    this.log(LogLevel.INFO, message);
  }

  public warn(message: string) {
    this.log(LogLevel.WARN, message);
  }

  public error(message: string) {
    this.log(LogLevel.ERROR, message);
  }

  public debug(message: string) {
    this.log(LogLevel.DEBUG, message);
  }
}

// 导出默认实例
export default Logger.getInstance();