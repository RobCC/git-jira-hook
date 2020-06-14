import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';

export default {
  input: 'bin/commit-msg.js',
  output: {
    banner: '#!/usr/bin/env node',
    file: 'build/commit-msg.js',
    // dir: 'build',
    format: 'cjs'
  },
  // preserveModules: true,
  plugins: [
    // preserveShebangs(),
    commonjs({
      dynamicRequireTargets: [
        './bin/utils/config/reader.js'
      ],
    }),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env'],
      plugins: [['@babel/plugin-transform-runtime', { useESModules: false }]]
    }),
    // terser(),
  ],
};
