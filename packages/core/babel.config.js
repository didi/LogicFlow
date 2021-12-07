module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {node: 'current'}
      }
    ],
    '@babel/preset-typescript',
  ],
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h"
      }
    ],
    [
      "@babel/plugin-proposal-decorators", 
      { "legacy": true }
    ],
    [
      "@babel/plugin-proposal-class-properties",
      { "loose": true }
    ],
  ]
}

