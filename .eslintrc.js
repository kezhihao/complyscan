export default [
  {
    ignores: ['node_modules/', '.wrangler/', 'dist/'],
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
