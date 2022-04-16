// 需要进行兼容操作，提供的方法
import {
  cloneDeep,
} from 'lodash-es';

// vue中data会进行Observe, 深拷贝的原始数据对象。
export const formatData = (data) => {
  try {
    // fix #564
    return cloneDeep(data);
  } catch {
    return data;
  }
};
