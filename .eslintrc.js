module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc*', 'jest.config.js', 'node_modules'],
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  plugins: ['prettier'],
  overrides: [
    {
      files: ['tests/fixtures/src/**/*.js'],
      rules: {
        'import/no-unresolved': [0],
      },
    },
  ],
  env: {
    jest: true,
    es2021: true,
  },
};
