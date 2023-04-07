import { cloneDeep } from 'lodash-es';

// 需要进行兼容操作，提供的方法

// vue中data会进行Observe, 深拷贝的原始数据对象。
export const formatData = (data) => {
  try {
    return cloneDeep(data);
  } catch {
    return data;
  }
};
