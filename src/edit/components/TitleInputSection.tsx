/**
 * 标题输入区域组件
 * 负责处理标题输入，可自动生成或手动修改
 */
import React from 'react';
import '../styles/TitleInputSection.css';

interface TitleInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * 标题输入区域组件
 */
const TitleInputSection: React.FC<TitleInputSectionProps> = ({
  value,
  onChange,
  placeholder = '标题'
}) => {
  /**
   * 处理文本变化事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="title-input-section">
      <input
        className="title-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={30}
      />
    </div>
  );
};

export default TitleInputSection; 