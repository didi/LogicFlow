#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const sourceDir = path.join(rootDir, 'sites/docs/docs')
const targetDir = path.join(rootDir, 'packages/core/dist/docs')

// 主逻辑
try {
  // 清理目标目录
  fs.removeSync(targetDir)
  fs.ensureDirSync(targetDir)

  // 复制 tutorial
  const tutorialSource = path.join(sourceDir, 'tutorial')
  const tutorialTarget = path.join(targetDir, 'tutorial')
  if (fs.existsSync(tutorialSource)) {
    fs.copySync(tutorialSource, tutorialTarget)
    console.log(
      `✓ Copied tutorial: ${fs.readdirSync(tutorialSource).length} items`,
    )
  }

  // 复制 api
  const apiSource = path.join(sourceDir, 'api')
  const apiTarget = path.join(targetDir, 'api')
  if (fs.existsSync(apiSource)) {
    fs.copySync(apiSource, apiTarget)
    console.log(`✓ Copied api: ${fs.readdirSync(apiSource).length} items`)
  }

  // 创建文档入口索引
  const indexContent = `# LogicFlow 文档

## 入门教程
- tutorial/get-started.zh.md - 快速上手（中文）
- tutorial/get-started.en.md - Quick Start（英文）

## 核心 API
- api/ - API 参考

## 扩展插件
- tutorial/extension/ - 插件使用指南（MiniMap、Group、DndPanel 等）
`

  fs.writeFileSync(path.join(targetDir, 'index.md'), indexContent)
  console.log(`✓ Created index.md`)

  // 统计文件数量
  const countFiles = (dir) => {
    let count = 0
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
      if (item.isDirectory()) {
        count += countFiles(path.join(dir, item.name))
      } else if (item.isFile() && item.name.endsWith('.md')) {
        count++
      }
    }
    return count
  }

  const tutorialCount = countFiles(tutorialTarget)
  const apiCount = countFiles(apiTarget)
  console.log(
    `\nTotal: ${tutorialCount + apiCount} markdown files copied to ${targetDir}`,
  )
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exit(1)
}
