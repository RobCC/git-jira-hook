import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';

export default {
  input: 'bin/commit-msg.js',
  output: {
    file: 'build/commit-msg.js',
    // dir: 'build',
    format: 'cjs'
  },
  // preserveModules: true,
  plugins: [
    preserveShebangs(),
    commonjs(),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env'],
      plugins: [['@babel/plugin-transform-runtime', { useESModules: false }]]
    }),
    terser(),
  ],
};
