module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: "10.16"
      }
    }]
  ],
  plugins: ['@babel/plugin-transform-runtime'],
}
