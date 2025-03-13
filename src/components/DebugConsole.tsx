import * as React from 'react';
import { useState, useEffect } from 'react';
import logger, { LogItem, LogLevel } from '../utils/logger';

const DebugConsole: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);

  useEffect(() => {
    // 添加日志监听器
    const logListener = (log: LogItem) => {
      setLogs(prevLogs => [...prevLogs, log]);
    };
    logger.addListener(logListener);

    // 清理监听器
    return () => {
      logger.removeListener(logListener);
    };
  }, []);

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getLogColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.ERROR:
        return '#ff4d4f';
      case LogLevel.WARN:
        return '#faad14';
      case LogLevel.INFO:
        return '#1677ff';
      case LogLevel.DEBUG:
        return '#52c41a';
      default:
        return '#000000';
    }
  };

  if (!isExpanded) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '14px',
          WebkitTapHighlightColor: 'transparent'
        }}
        onClick={() => setIsExpanded(true)}
      >
        📋 控制台
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '300px',
        maxHeight: '80vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        borderRadius: '4px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <span>调试控制台</span>
        <div>
          <button
            onClick={handleClearLogs}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              marginRight: '8px',
              padding: '4px'
            }}
          >
            🗑️
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}
      >
        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              marginBottom: '4px',
              color: getLogColor(log.level)
            }}
          >
            <span style={{ color: '#888' }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {' ['}{log.level.toUpperCase()}{'] '}
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugConsole;