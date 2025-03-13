// 设备信息收集工具
import logger from './logger';

interface DeviceInfo {
  safeArea: {
    top: string;
    bottom: string;
  };
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  userAgent: string;
  platform: string;
}

// 获取设备安全区域尺寸
const getSafeAreaInsets = (): Promise<{ top: string; bottom: string }> => {
  return new Promise((resolve) => {
    // 等待一小段时间，确保浏览器有足够时间计算CSS值
    setTimeout(() => {
      // 创建一个临时div来获取计算后的CSS值
      const temp = document.createElement('div');
      temp.style.cssText = `
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        pointer-events: none;
        z-index: -1;
      `;
      document.body.appendChild(temp);

      // 获取计算后的样式
      const computedStyle = window.getComputedStyle(temp);
      const topInset = computedStyle.paddingTop;
      const bottomInset = computedStyle.paddingBottom;

      // 清理临时元素
      document.body.removeChild(temp);

      // 记录获取到的安全区域值
      logger.info(`设备信息: { "safeArea": { "top": "${topInset}", "bottom": "${bottomInset}" } }`);

      resolve({
        top: topInset,
        bottom: bottomInset
      });
    }, 100); // 给浏览器100ms的时间来计算CSS值
  });
};

// 获取屏幕信息
const getScreenInfo = () => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio
  };
};

// 获取平台信息
const getPlatformInfo = () => {
  const ua = navigator.userAgent;
  let platform = 'unknown';

  if (/iPhone|iPad|iPod/.test(ua)) {
    platform = 'ios';
  } else if (/Android/.test(ua)) {
    platform = 'android';
  } else if (/Windows/.test(ua)) {
    platform = 'windows';
  } else if (/Mac/.test(ua)) {
    platform = 'mac';
  }

  return {
    userAgent: ua,
    platform
  };
};

// 初始化设备信息收集
export const initDeviceInfo = async (): Promise<void> => {
  // 确保DOM已经完全加载
  if (document.readyState !== 'complete') {
    await new Promise<void>((resolve) => {
      window.addEventListener('load', () => resolve(), { once: true });
    });
  }

  const safeArea = await getSafeAreaInsets();
  const screen = getScreenInfo();
  const { userAgent, platform } = getPlatformInfo();

  const deviceInfo: DeviceInfo = {
    safeArea,
    screen,
    userAgent,
    platform
  };

  // 记录设备信息
  logger.info('设备信息：' + JSON.stringify(deviceInfo, null, 2));
};