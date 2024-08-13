import postcss from 'rollup-plugin-postcss'
import postcssImport from 'postcss-import'
import postcssUrl from 'postcss-url'
import { rollupConfig } from '../../rollup.config'

export default rollupConfig({
  plugins: [
    postcss({
      plugins: [
        postcssImport(),
        postcssUrl({
          url: 'inline', // 选择 'inline' 选项将外部资源内联到最终的 CSS 文件中
          // maxSize: 10, // 以KB为单位的最大文件大小，超过此大小的文件将不会被内联
        }),
      ],
      extract: 'index.css', // 提取到一个单独的 CSS 文件
    }),
  ],
})
