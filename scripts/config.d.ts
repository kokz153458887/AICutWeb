export interface MockServerConfig {
  PORT: number;
  HOST: string;
}

export const MOCK_SERVER: MockServerConfig;
export function getMockServerUrl(): string; 