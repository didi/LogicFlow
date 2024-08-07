'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./logic-flow.min.js');
} else {
  module.exports = require('./logic-flow.js');
}
