/**
 * 节流
 * @param callback
 * @param delay
 * @returns
 */
export function throttle(callback: (...args: any[]) => void, delay: number) {
  let begin = 0;
  return function (this: any, ...args: any[]) {
    // 获取事件触发时的时间
    const cur = Date.now();
    // 超过间隔 执行回调
    if (cur - begin > delay) {
      callback.apply(this, args);
      begin = cur;
    }
  };
}
