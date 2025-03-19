/**
 * Toast提示组件
 * 负责显示非阻塞式的提示信息，使用单例模式管理全局Toast
 */
import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

export interface ToastItem {
  id: number;
  message: string;
}

// Toast管理器单例
class ToastManager {
  private static instance: ToastManager;
  private listeners: ((toasts: ToastItem[]) => void)[] = [];
  private toasts: ToastItem[] = [];
  private counter: number = 0;

  private constructor() {}

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  addListener(listener: (toasts: ToastItem[]) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (toasts: ToastItem[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  show(message: string, duration: number = 2000) {
    const id = ++this.counter;
    const toast = { id, message };
    this.toasts.push(toast);
    this.notifyListeners();

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.notifyListeners();
    }, duration);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

// 导出静态方法供直接调用
export const toast = {
  show: (message: string, duration?: number) => {
    ToastManager.getInstance().show(message, duration);
  },
  info: (message: string, duration?: number) => {
    ToastManager.getInstance().show(message, duration);
  },
  error: (message: string, duration?: number) => {
    ToastManager.getInstance().show(message, duration);
  },
  success: (message: string, duration?: number) => {
    ToastManager.getInstance().show(message, duration);
  }
};

// Toast组件
const Toast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const handleToastsChange = useCallback((newToasts: ToastItem[]) => {
    setToasts(newToasts);
  }, []);

  useEffect(() => {
    const manager = ToastManager.getInstance();
    manager.addListener(handleToastsChange);
    return () => {
      manager.removeListener(handleToastsChange);
    };
  }, [handleToastsChange]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast-item">
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toast; 