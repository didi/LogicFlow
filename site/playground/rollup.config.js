/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';

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
      copy({
        targets: [
          {
            src: './index.html',
            dest: './dist/',
          },
        ],
      }),
    ],
  },
];
