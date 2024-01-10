const { getBabelOutputPlugin } = require("@rollup/plugin-babel");
const terser = require("@rollup/plugin-terser");
const commonjs = require("@rollup/plugin-commonjs");
const { preserveShebangs } = require("rollup-plugin-preserve-shebangs");

module.exports = {
  input: "bin/commit-msg.js",
  output: {
    banner: "#!/usr/bin/env node",
    file: "build/commit-msg.js",
    // dir: 'build',
    format: "cjs",
  },
  // preserveModules: true,
  plugins: [
    // preserveShebangs(),
    commonjs({
      dynamicRequireTargets: ["./bin/utils/config/reader.js"],
    }),
    getBabelOutputPlugin({
      presets: ["@babel/preset-env"],
      plugins: [["@babel/plugin-transform-runtime", { useESModules: false }]],
    }),
    terser(),
  ],
};
