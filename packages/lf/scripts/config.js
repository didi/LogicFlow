module.exports = function getProxy() {
  let proxy = {
  }
  let env = process.env.MOCK_TYPE || 'mock'
  switch (env) {
    case 'mock':
      proxy = {
      }
      break;
    case 'test':
      proxy = {
      }
      break;
    case 'pre':
      proxy = {
      }
      break;
  }
  return proxy
}