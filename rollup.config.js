import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
// import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
// import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';

export default {
  input: 'bin/commit-msg.ts',
  output: {
    banner: '#!/usr/bin/env node',
    file: 'build/commit-msg.cjs',
    format: 'cjs',
  },
  // preserveModules: true,
  plugins: [
    typescript(),
    // preserveShebangs(),
    // commonjs({
    //   dynamicRequireTargets: ["./bin/utils/config/reader.js"],
    // }),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env'],
      plugins: [['@babel/plugin-transform-runtime', { useESModules: false }]],
    }),
    terser(),
  ],
};
