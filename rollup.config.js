/* eslint-env node */
import fs from 'node:fs'
import path from 'node:path'
import { startCase, camelCase } from 'lodash'
import colors from 'colors/safe'
import babel from '@rollup/plugin-babel'
import alias from '@rollup/plugin-alias'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import fileSize from 'rollup-plugin-filesize'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { visualizer } from 'rollup-plugin-visualizer'

export function formatName(name) {
  const realName = name
    .replace(/^@/, '')
    .replace(/^logicflow\//, '')
    .replace(/\//, '-')

  // PascalCase
  return startCase(camelCase(realName)).replace(/ /g, '')
}

export function makeOutput() {
  const cwd = process.cwd()
  const pkg = JSON.parse(
    fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'),
  )
  const peerDependencies = pkg.peerDependencies
  const output = { name: formatName(pkg.name) }

  if (peerDependencies) {
    const globals = {}
    Object.keys(peerDependencies).forEach((mod) => {
      globals[mod] = formatName(mod)
    })
    output.globals = globals
  }

  return output
}

export function rollupConfig(config = {}) {
  let { output } = config
  const { plugins = [], external = [], ...others } = config

  if (output == null) {
    output = makeOutput()
  }

  const arr = Array.isArray(output) ? output : [output]
  const outputs = []
  arr.forEach((item) => {
    outputs.push({
      format: 'umd',
      file: 'dist/index.min.js',
      sourcemap: true,
      exports: 'named',
      ...item,
    })

    // extra external modules
    if (item && item.globals) {
      Object.keys(item.globals).forEach((key) => {
        if (!external.includes(key)) {
          external.push(key)
        }
      })
    }
  })

  return {
    input: './src/index.ts',
    output: outputs,
    plugins: [
      babel({ babelHelpers: 'bundled' }),
      resolve(),
      commonjs(),
      typescript({
        declaration: false,
        sourceMap: true,
        inlineSources: true,
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      alias({
        entries: [
          { find: 'react', replacement: 'preact/compact' },
          { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
          { find: 'react-dom', replacement: 'preact/compact' },
          { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
        ],
      }),
      nodePolyfills(),
      terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: true,
        },
        sourceMap: true,
      }),
      fileSize({
        reporter: [
          async (options, bundle, result) => {
            return import('boxen').then((mod) => {
              const boxen = mod.default
              const primaryColor = options.theme === 'dark' ? 'green' : 'black'
              const secondaryColor =
                options.theme === 'dark' ? 'yellow' : 'blue'

              const title = colors[primaryColor].bold
              const value = colors[secondaryColor]

              const lines = [
                `${title('Bundle Format:')} ${value(bundle.format)}`,
                `${title('Bundle Name:')} ${value(bundle.name)}`,
              ]
              const globals = bundle.globals
              const mods = Object.keys(globals)

              if (mods.length) {
                lines.push(title('External Globals:'))
                mods.forEach((mod) => {
                  lines.push(value(` ${mod}: ${globals[mod]}`))
                })
                lines.push('')
              }
              lines.push(
                [
                  `${title('Destination:')} ${value(bundle.file)}`,
                  `${title('Bundle   Size:')} ${value(result.bundleSize)}`,
                  `${title('Minified Size:')} ${value(result.minSize)}`,
                  `${title('GZipped  Size:')} ${value(result.gzipSize)}`,
                ].join('\n'),
              )

              return boxen(lines.join('\n'), {
                padding: 1,
                dimBorder: true,
                borderStyle: 'classic',
              })
            })
          },
        ],
      }),
      ...plugins,
      visualizer(),
    ],
    external,
    ...others,
  }
}

const defaultConfig = rollupConfig()

export default defaultConfig
