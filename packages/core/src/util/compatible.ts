// import { cloneDeep } from 'lodash-es';
// vue中data会进行Observe, 深拷贝的原始数据对象。
export const formatData = (data) => {
  try {
    // WARNING: cloneDeep虽然也会将Observe对象转换为plain对象，但是不会像JSON.parse那样，会将undefined去掉。
    // 会导致后面的pick因为存在pick覆盖默认值的情况。
    return JSON.parse(JSON.stringify(data));
  } catch {
    return data;
  }
};
