/* eslint-disable global-require */
const runInNewContext = async (code: string, globalData: any = {}) => {
  const vm = require('vm');
  const context = vm.createContext(globalData);
  vm.runInContext(code, context);
  return context;
};

export {
  runInNewContext,
};
