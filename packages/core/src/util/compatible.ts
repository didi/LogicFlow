// import { cloneDeep } from 'lodash-es'
/**
 * 对数据实现兼容处理。
 *
 * Vue 中的 data 会进行 Observe，深拷贝的原始数据对象
 */
export function formatData<T>(data: T): T {
  try {
    // WARNING: cloneDeep虽然也会将Observe对象转换为plain对象，但是不会像JSON.parse那样，会将undefined去掉。
    // 会导致后面的pick因为存在pick覆盖默认值的情况。
    return JSON.parse(JSON.stringify(data))
  } catch {
    return data
  }
}
