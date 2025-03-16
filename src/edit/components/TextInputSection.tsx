/**
 * 文本输入区域组件
 * 负责处理用户输入的文案内容
 */
import React from 'react';
import '../styles/TextInputSection.css';

interface TextInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * 文本输入区域组件
 */
const TextInputSection: React.FC<TextInputSectionProps> = ({
  value,
  onChange,
  placeholder = '这一刻的想法...'
}) => {
  /**
   * 处理文本变化事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  /**
   * 处理喇叭点击事件
   */
  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    console.log('喇叭被点击');
    // 这里可以添加语音输入或文本朗读等功能
    alert('语音功能待实现');
  };

  return (
    <div className="text-input-section">
      <textarea
        className="text-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
      />
      <div className="speaker-icon" onClick={handleSpeakerClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default TextInputSection; 