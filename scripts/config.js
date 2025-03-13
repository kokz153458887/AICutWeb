/**
 * Mock Server 配置
 */
export const MOCK_SERVER = {
  PORT: 3002,
  HOST: 'localhost'
};

/**
 * 获取 Mock Server 的完整 URL
 */
export const getMockServerUrl = () => `http://${MOCK_SERVER.HOST}:${MOCK_SERVER.PORT}`; 