import alias from '@rollup/plugin-alias'
import { rollupConfig } from '../../rollup.config'

export default rollupConfig({
  plugins: [
    alias({
      entries: [
        { find: 'react', replacement: 'preact/compact' },
        { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
        { find: 'react-dom', replacement: 'preact/compact' },
        { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
      ],
    }),
  ],
})
