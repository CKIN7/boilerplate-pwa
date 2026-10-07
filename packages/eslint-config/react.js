module.exports = {
  ...require('./index.js'),
  extends: [
    ...require('./index.js').extends.filter((ext) => !ext.includes('next')),
  ],
  rules: {
    ...require('./index.js').rules,
  },
};