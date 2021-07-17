/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import playgroundJson from './scripts/rollup-plugin-playground-json.js';

export default [
  {
    input: './index.js',
    output: {
      file: 'dist/index.js',
      format: 'umd',
    },
    plugins: [
      resolve(),
      importMetaAssets(),
      playgroundJson(),
      copy({
        targets: [
          {
            src: './index.html',
            dest: './dist/',
          },
          {
            src: './style.css',
            dest: './dist/',
          },
          {
            src: './examples',
            dest: './dist/'
          }
        ],
      }),
      
    ],
  },
];
