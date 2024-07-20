module.exports = {
  printWidth: 80,
  proseWrap: 'never',
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: '*',
      options: {
        proseWrap: 'preserve',
      },
    },
  ],
};
