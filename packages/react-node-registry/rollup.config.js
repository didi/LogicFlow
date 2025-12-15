import path from 'node:path'
import postcss from 'rollup-plugin-postcss'
import postcssUrl from 'postcss-url'
import postcssImport from 'postcss-import'
import { rollupConfig } from '../../rollup.config'

export default [
  {
    input: 'src/index.less',
    output: [
      {
        file: 'dist/index.css',
      },
      {
        file: 'lib/index.css',
      },
      {
        file: 'lib/style/index.css',
      },
      {
        file: 'es/index.css',
      },
      {
        file: 'es/style/index.css',
      },
    ],
    plugins: [
      postcss({
        plugins: [
          postcssImport({
            resolve: (id) => {
              if (id.startsWith('~')) {
                return path.resolve('node_modules', id.slice(1))
              }
              return id
            },
          }),
          postcssUrl({
            url: 'inline', // 选择 'inline' 选项将外部资源内联到最终的 CSS 文件中
            // maxSize: 10, // 以KB为单位的最大文件大小，超过此大小的文件将不会被内联
          }),
        ],
        use: [['less', { javascriptEnabled: true }]],
        extract: true,
        // extract: 'index.css', // 提取到一个单独的 CSS 文件
        // extract: path.resolve('dist/index.css'), // 提取到一个单独的 CSS 文件
        minimize: true,
      }),
    ],
  },
  rollupConfig(),
]
