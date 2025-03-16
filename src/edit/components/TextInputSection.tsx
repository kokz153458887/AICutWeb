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

  return (
    <div className="text-input-section">
      <textarea
        className="text-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
      />
    </div>
  );
};

export default TextInputSection; 