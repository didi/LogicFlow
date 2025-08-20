const path = require('path')

module.exports = {
  displayName: '@logicflow/core',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [path.resolve(__dirname, '../../jest.setup.js')],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    'lodash-es': 'lodash',
    'preact/jsx-runtime': 'preact/jsx-runtime',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(lodash-es|preact|preact/jsx-runtime)/)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
}
