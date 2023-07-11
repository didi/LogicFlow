// The one and only way of getting global scope in all environments
// https://stackoverflow.com/q/3277182/1008999

const globalScope = (() => {
  if (typeof window === 'object' && window.window === window) {
    return window;
  }
  // eslint-disable-next-line no-restricted-globals
  if (typeof self === 'object' && self.self === self) {
    // eslint-disable-next-line no-restricted-globals
    return self;
  }
  if (typeof global === 'object' && global.global === global) {
    return global;
  }
  if (typeof globalThis === 'object') {
    return globalThis;
  }
  return {} as Record<string, any>;
})();

export default globalScope;
