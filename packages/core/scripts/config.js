module.exports = function getProxy() {
  let proxy = {};
  const env = process.env.MOCK_TYPE || 'mock';
  switch (env) {
    case 'mock':
      proxy = {};
      break;
    case 'test':
      proxy = {};
      break;
    case 'pre':
      proxy = {};
      break;
    default:
      proxy = {};
      break;
  }
  return proxy;
};
