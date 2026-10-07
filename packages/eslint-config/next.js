module.exports = {
  ...require('./index.js'),
  extends: [
    ...require('./index.js').extends,
    'plugin:@next/next/recommended',
  ],
  rules: {
    ...require('./index.js').rules,
    '@next/next/no-html-link-for-pages': 'off',
    '@next/next/no-img-element': 'warn',
  },
};