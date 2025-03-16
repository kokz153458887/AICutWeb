/**
 * 配置项组件
 * 负责展示可点击的配置选项，如视频风格、说话人等
 */
import React from 'react';
import '../styles/ConfigItem.css';

interface ConfigItemProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  onClick: () => void;
}

/**
 * 配置项组件
 */
const ConfigItem: React.FC<ConfigItemProps> = ({
  title,
  value,
  subValue,
  tag,
  onClick
}) => {
  return (
    <div className="config-item" onClick={onClick}>
      <div className="config-title">{title}</div>
      <div className="config-value-container">
        <div className="config-value-wrapper">
          <div className="config-value-row">
            <div className="config-value">{value}</div>
            {tag && <div className="config-tag">{tag}</div>}
          </div>
          {subValue && <div className="config-sub-value">{subValue}</div>}
        </div>
        <div className="config-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ConfigItem; 