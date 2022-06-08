// 只有明确指定开发环境才使用未压缩版本
const isDev = ['dev', 'devlopment'].includes(process.env.NODE_ENV);
if (isDev) {
  module.exports = require('./dist/logic-flow.js');
} else {
  module.exports = require('./dist/logic-flow.min.js');
}
