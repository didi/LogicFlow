/**
 * 存储执行记录
 */
import { globalScope } from './global';

if (!globalScope.sessionStorage) {
  const storage = {
    data: {} as Record<string, any>,
    setItem(key, value) {
      storage.data[key] = value;
    },
    getItem(key) {
      return storage.data[key];
    },
    removeItem(key) {
      delete storage.data[key];
    },
  };
  globalScope.sessionStorage = storage;
}

export default {
  setItem(key, value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    globalScope.sessionStorage.setItem(key, value);
  },
  getItem(key) {
    const value = globalScope.sessionStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  },
  removeItem(key) {
    globalScope.sessionStorage.removeItem(key);
  },
};
