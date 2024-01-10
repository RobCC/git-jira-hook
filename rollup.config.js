import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
// import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'bin/commit-msg.ts',
  external: [
    'yargs',
    'yargs/helpers',
    'fs',
    'ajv',
    'url',
    'path',
    'app-root-path',
    'current-git-branch',
    'lodash.merge',
  ],
  output: {
    banner: '#!/usr/bin/env node',
    file: 'build/commit-msg.cjs',
    format: 'cjs',
  },
  plugins: [
    typescript(),
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
