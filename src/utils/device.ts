// Secure Client-side Device ID generation & persistent binding helper

const DEVICE_ID_KEY = 'fs_device_id_v1';
const DEVICE_LABEL_KEY = 'fs_device_label_v1';

export function getOrCreateDeviceId(): { deviceId: string; deviceLabel: string } {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const timeHex = Date.now().toString(36);
    deviceId = `fs_dev_${timeHex}_${randomHex}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  let deviceLabel = localStorage.getItem(DEVICE_LABEL_KEY);
  if (!deviceLabel) {
    const ua = navigator.userAgent;
    let label = 'Web Browser';
    if (/android/i.test(ua)) {
      label = 'Android Device';
      const match = ua.match(/;\s*([^;)]+)\s*Build/);
      if (match && match[1]) label = `Android (${match[1].trim()})`;
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      label = 'iOS Device (iPhone/iPad)';
    } else if (/windows/i.test(ua)) {
      label = 'Windows PC';
    } else if (/macintosh|mac os x/i.test(ua)) {
      label = 'MacBook / macOS';
    }
    deviceLabel = label;
    localStorage.setItem(DEVICE_LABEL_KEY, deviceLabel);
  }

  return { deviceId, deviceLabel };
}
