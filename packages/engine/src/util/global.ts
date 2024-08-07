// The one and only way of getting global scope in all environments
// https://stackoverflow.com/q/3277182/1008999

const isInBrowser = typeof window === 'object' && window.window === window;

const isInNodeJS = typeof global === 'object' && global.global === global;
// eslint-disable-next-line no-restricted-globals
const isInWebWorker = !isInBrowser && typeof self === 'object' && self.constructor;

const globalScope = (() => {
  if (isInBrowser) {
    return window;
  }
  // eslint-disable-next-line no-restricted-globals
  if (typeof self === 'object' && self.self === self) { // web workers
    // eslint-disable-next-line no-restricted-globals
    return self;
  }
  if (isInNodeJS) {
    return global;
  }
  if (typeof globalThis === 'object') {
    return globalThis;
  }
  return {
    eval: () => undefined,
  } as Record<string, any>;
})();

export {
  globalScope,
  isInBrowser,
  isInWebWorker,
  isInNodeJS,
};
