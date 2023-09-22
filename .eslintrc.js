module.exports = {
  env: {
    commonjs: true,
    es2021: true,
  },
  extends: 'standard-with-typescript',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'never'],
  },
}
