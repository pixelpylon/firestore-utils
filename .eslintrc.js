module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['standard-with-typescript', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'require-jsdoc': 'off',
  },
}
