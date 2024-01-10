module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '12.22.0',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-transform-runtime'],
};
