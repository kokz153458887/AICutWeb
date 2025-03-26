/**
 * Toast提示组件
 * 负责显示非阻塞式的提示信息，使用单例模式管理全局Toast
 */
import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

export interface ToastItem {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'error' | 'loading';
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

  show(message: string, type: ToastItem['type'] = 'info', duration?: number) {
    const id = ++this.counter;
    const toast = { id, message, type };
    this.toasts.push(toast);
    this.notifyListeners();

    // 如果是 loading 类型，不自动关闭
    if (type !== 'loading' && duration !== undefined) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  dismiss(id?: number) {
    if (id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    } else {
      this.toasts = [];
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

// 导出静态方法供直接调用
export const toast = {
  show: (message: string, duration: number = 2000) => {
    return ToastManager.getInstance().show(message, 'info', duration);
  },
  info: (message: string, duration: number = 2000) => {
    return ToastManager.getInstance().show(message, 'info', duration);
  },
  error: (message: string, duration: number = 2000) => {
    return ToastManager.getInstance().show(message, 'error', duration);
  },
  success: (message: string, duration: number = 2000) => {
    return ToastManager.getInstance().show(message, 'success', duration);
  },
  loading: (message: string) => {
    return ToastManager.getInstance().show(message, 'loading');
  },
  dismiss: (id?: number) => {
    ToastManager.getInstance().dismiss(id);
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
        <div key={toast.id} className={`toast-item ${toast.type || 'info'}`}>
          {toast.type === 'loading' && <div className="toast-loading-spinner" />}
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toast; 