/**
 * 视频切片输入区域组件
 * 负责处理用户输入、剪切板粘贴、清除内容和解析功能
 */
import React, { useState, useRef } from 'react';
import { ClipboardIcon, ClearIcon } from '../../../components/icons';
import { toast } from '../../../components/Toast';
import './styles.css';

interface InputAreaProps {
  onParse?: (content: string) => void;
}

/**
 * 视频切片输入区域组件
 * 提供文本输入、剪切板粘贴、清除内容和解析功能
 */
const InputArea: React.FC<InputAreaProps> = ({ onParse }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 处理剪切板粘贴功能
   */
  const handleClipboardPaste = async () => {
    try {
      if (!navigator.clipboard) {
        toast.error('当前浏览器不支持剪切板功能');
        return;
      }
      
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputValue(text);
        toast.success('剪切板内容已粘贴');
      } else {
        toast.info('剪切板为空');
      }
    } catch (error) {
      console.error('读取剪切板失败:', error);
      toast.error('读取剪切板失败，请手动粘贴');
    }
  };

  /**
   * 处理清除输入框内容
   */
  const handleClearInput = () => {
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  /**
   * 处理解析按钮点击
   */
  const handleParseClick = () => {
    if (!inputValue.trim()) {
      toast.error('请输入要解析的内容');
      return;
    }

    // 目前显示开发中提示
    toast.info('短视频解析功能开发中');
    
    // 如果有回调函数，调用它
    if (onParse) {
      onParse(inputValue.trim());
    }
  };

  /**
   * 处理输入框内容变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          placeholder="请输入视频链接或相关内容..."
          value={inputValue}
          onChange={handleInputChange}
          rows={4}
        />
        
        {/* 左下角的剪切板按钮 */}
        <div className="input-actions-left">
          <div
            className="action-button clipboard-button"
            onClick={handleClipboardPaste}
            title="粘贴剪切板内容"
          >
            <ClipboardIcon size={16} color="#00d6c9" />
          </div>
        </div>
        
        {/* 右下角的功能按钮组 */}
        <div className="input-actions-right">
          {/* 清除按钮 */}
          <div
            className="action-button clear-button"
            onClick={handleClearInput}
            title="清除内容"
          >
            <ClearIcon size={16} color="#ff4757" />
          </div>
          
          {/* 解析按钮 */}
          <button 
            className="parse-button"
            onClick={handleParseClick}
            disabled={!inputValue.trim()}
          >
            解析
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea; 