/**
 * 登录页面组件
 * 提供用户登录功能的全屏页面
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginApiService } from '../api/loginApi';
import { TokenManager } from '../tokenManager';
import './LoginPage.css';

/**
 * 返回按钮图标组件
 */
const BackIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * 登录页面组件
 * 包含账号密码输入和登录功能
 */
const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 获取重定向URL
  const getRedirectUrl = (): string => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/';
  };

  // 检查是否已登录，如果已登录则直接跳转
  useEffect(() => {
    if (TokenManager.isAuthenticated()) {
      const redirectUrl = getRedirectUrl();
      navigate(redirectUrl, { replace: true });
    }
  }, [navigate, location.search]);

  /**
   * 处理返回按钮点击
   */
  const handleBackClick = () => {
    // 始终返回到首页，避免返回到需要权限的页面造成无限循环
    console.log('[LoginPage] 返回按钮点击，跳转到首页');
    navigate('/', { replace: true });
  };

  /**
   * 处理登录表单提交
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误信息
    setErrorMessage('');
    
    // 验证输入
    if (!username.trim()) {
      setErrorMessage('请输入用户名');
      return;
    }
    
    if (!password.trim()) {
      setErrorMessage('请输入密码');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用登录API
      const response = await LoginApiService.login({
        username: username.trim(),
        password: password.trim()
      });
      
      // 保存Token和用户信息
      TokenManager.saveToken(
        response.data.token,
        response.data.expiresIn,
        response.data.user
      );
      
      console.log('[LoginPage] 登录成功，跳转到目标页面');
      
      // 登录成功后跳转到重定向页面，使用replace避免登录页留在历史记录中
      const redirectUrl = getRedirectUrl();
      
      // 清理浏览器历史记录中的登录页面，避免返回时出现问题
      window.history.replaceState(null, '', window.location.pathname);
      
      navigate(redirectUrl, { replace: true });
      
    } catch (error) {
      console.error('[LoginPage] 登录失败:', error);
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理输入框变化，清除错误信息
   */
  const handleInputChange = () => {
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <div className='login-page'>
      <button 
        className='login-back-button' 
        onClick={handleBackClick}
        type="button"
        aria-label="返回"
      >
        <BackIcon />
      </button>
      
      <div className='login-container'>
        <div className='login-header'>
          <h1 className='login-title'>用户登录</h1>
          <p className='login-subtitle'>请输入您的账号和密码</p>
        </div>
        
        <form className='login-form' onSubmit={handleLogin}>
          <div className='form-group'>
            <label htmlFor="username" className='form-label'>用户名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                handleInputChange();
              }}
              className='form-input'
              placeholder="请输入用户名"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          
          <div className='form-group'>
            <label htmlFor="password" className='form-label'>密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handleInputChange();
              }}
              className='form-input'
              placeholder="请输入密码"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          
          {errorMessage && (
            <div className='error-message'>
              {errorMessage}
            </div>
          )}
          
          <button
            type="submit"
            className='login-button'
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 