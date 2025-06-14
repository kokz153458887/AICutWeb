/**
 * 权限控制Hook
 * 提供登录状态检查、权限验证等功能
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TokenManager } from '../tokenManager';
import { AuthCheckResult, UserInfo } from '../types';

// 无需授权的页面路径
const PUBLIC_PATHS = [
  '/',
  '/video',
  '/login'
];

/**
 * 检查路径是否为公开路径（无需登录）
 * @param pathname 路径名
 * @returns 是否为公开路径
 */
const isPublicPath = (pathname: string): boolean => {
  // 检查是否是视频详情页 (/video/:id)
  if (pathname.startsWith('/video/')) {
    return true;
  }
  
  // 检查是否在公开路径列表中
  return PUBLIC_PATHS.some(path => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  });
};

/**
 * 权限控制Hook
 * 提供用户认证状态管理和权限检查功能
 */
export const useAuth = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 检查当前页面是否需要登录授权
   * @returns 权限检查结果
   */
  const checkAuth = useCallback((): AuthCheckResult => {
    const currentPath = location.pathname;
    const isAuthenticated = TokenManager.isAuthenticated();
    const currentUser = TokenManager.getCurrentUser();
    
         // 如果是公开页面，直接允许访问
     if (isPublicPath(currentPath)) {
       return {
         isAuthenticated,
         needLogin: false,
         user: currentUser || undefined
       };
     }
     
     // 私有页面需要检查登录状态
     return {
       isAuthenticated,
       needLogin: !isAuthenticated,
       user: currentUser || undefined
     };
  }, [location.pathname]);

  /**
   * 强制要求登录
   * 将用户导航到登录页面
   */
  const requireLogin = useCallback(() => {
    const currentPath = location.pathname + location.search;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }, [navigate, location]);

  /**
   * 用户登出
   * 清除Token并导航到首页
   */
  const logout = useCallback(() => {
    TokenManager.clearToken();
    setUser(null);
    navigate('/');
  }, [navigate]);

  /**
   * 更新用户状态
   * 从Token管理器获取最新的用户信息
   */
  const updateUserState = useCallback(() => {
    const currentUser = TokenManager.getCurrentUser();
    setUser(currentUser);
  }, []);

  /**
   * 页面权限验证
   * 在需要时自动跳转到登录页
   */
  const verifyPageAccess = useCallback(() => {
    const authResult = checkAuth();
    
    if (authResult.needLogin) {
      console.log('[useAuth] 页面需要登录授权，跳转到登录页');
      requireLogin();
      return false;
    }
    
    return true;
  }, [checkAuth, requireLogin]);

  // 初始化时检查登录状态
  useEffect(() => {
    updateUserState();
    setIsLoading(false);
  }, [updateUserState]);

  // 路由变化时检查权限
  useEffect(() => {
    if (isLoading) return;
    
    const authResult = checkAuth();
    if (authResult.needLogin) {
      requireLogin();
    }
  }, [location.pathname, isLoading, checkAuth, requireLogin]);

  return {
    user,
    isLoading,
    isAuthenticated: TokenManager.isAuthenticated(),
    checkAuth,
    requireLogin,
    logout,
    updateUserState,
    verifyPageAccess
  };
}; 