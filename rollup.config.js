import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { preserveShebangs  } from 'rollup-plugin-preserve-shebangs';

export default {
  input: 'bin/commit-msg.js',
  output: {
    file: 'build/commit-msg.js'
  },
  plugins: [
    // resolve({
    //   extensions: ['js'],
    // }),
    // json(),
    preserveShebangs(),
    commonjs(),
    // terser(),
  ],
};
