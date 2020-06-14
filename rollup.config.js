import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';

export default {
  input: 'bin/commit-msg.js',
  output: {
    // dir: 'build',
    file: 'build/commit-msg.js',
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
    // terser(),
  ],
};
