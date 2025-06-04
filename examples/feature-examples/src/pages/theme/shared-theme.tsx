import LogicFlow from '@logicflow/core'
import { Button, Select, Space, message } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import './shared-theme.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

// 示例数据
const data1 = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形节点',
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 100,
      text: '圆形节点',
    },
  ],
  edges: [
    {
      id: 'e1',
      type: 'polyline',
      sourceNodeId: '1',
      targetNodeId: '2',
    },
  ],
}

const data2 = {
  nodes: [
    {
      id: '3',
      type: 'diamond',
      x: 150,
      y: 100,
      text: '菱形节点',
    },
    {
      id: '4',
      type: 'polygon',
      x: 350,
      y: 100,
      text: '多边形节点',
    },
  ],
  edges: [
    {
      id: 'e2',
      type: 'bezier',
      sourceNodeId: '3',
      targetNodeId: '4',
    },
  ],
}

// 共享主题配置
const sharedTheme = {
  rect: {
    fill: '#EFF5FF',
    stroke: '#4B83FF',
    strokeWidth: 2,
    radius: 8,
  },
  circle: {
    fill: '#E6F7FF',
    stroke: '#1890FF',
    strokeWidth: 2,
  },
  diamond: {
    fill: '#F6FFED',
    stroke: '#52C41A',
    strokeWidth: 2,
    radius: 8,
  },
  polygon: {
    fill: '#FFF7E6',
    stroke: '#FA8C16',
    strokeWidth: 2,
    radius: 8,
  },
  nodeText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Microsoft YaHei',
  },
  edgeText: {
    fontSize: 12,
    color: '#666666',
    textWidth: 100,
  },
  polyline: {
    stroke: '#4B83FF',
    strokeWidth: 2,
    startArrowType: 'solid',
    endArrowType: 'solid',
  },
  bezier: {
    stroke: '#52C41A',
    strokeWidth: 2,
    startArrowType: 'solid',
    endArrowType: 'solid',
  },
} as const

// 主题模式列表
const themeModes = [
  { label: '默认主题', value: 'default' },
  { label: '圆角主题', value: 'radius' },
  { label: '彩色主题', value: 'colorful' },
  { label: '暗黑主题', value: 'dark' },
  { label: '共享主题', value: 'shared' },
]

export default function SharedThemeExample() {
  const lf1Ref = useRef<LogicFlow>()
  const lf2Ref = useRef<LogicFlow>()
  const container1Ref = useRef<HTMLDivElement>(null)
  const container2Ref = useRef<HTMLDivElement>(null)
  const [currentTheme, setCurrentTheme] = useState('default')
  const [themeModeList, setThemeModeList] = useState(themeModes)

  // 初始化两个 LogicFlow 实例
  useEffect(() => {
    if (!lf1Ref.current && !lf2Ref.current) {
      // 初始化第一个实例
      const lf1 = new LogicFlow({
        container: container1Ref.current as HTMLElement,
        width: 500,
        height: 300,
        grid: true,
        background: {
          color: '#FFFFFF',
        },
      })
      lf1.render(data1)
      lf1Ref.current = lf1

      // 初始化第二个实例
      const lf2 = new LogicFlow({
        container: container2Ref.current as HTMLElement,
        width: 500,
        height: 300,
        grid: true,
        background: {
          color: '#FFFFFF',
        },
      })
      lf2.render(data2)
      lf2Ref.current = lf2

      // 注册共享主题
      LogicFlow.addThemeMode('shared', sharedTheme)
    }
  }, [])

  // 处理主题切换
  const handleThemeChange = (theme: string) => {
    if (!lf1Ref.current || !lf2Ref.current) return

    setCurrentTheme(theme)

    // 同时更新两个实例的主题
    if (theme === 'shared') {
      // 应用共享主题
      lf1Ref.current.setTheme(sharedTheme)
      lf2Ref.current.setTheme(sharedTheme)
    } else {
      // 应用内置主题
      lf1Ref.current.setTheme({}, theme)
      lf2Ref.current.setTheme({}, theme)
    }

    message.success(
      `已切换到${themeModes.find((mode) => mode.value === theme)?.label}`,
    )
  }

  // 导出当前主题配置
  const handleExportTheme = () => {
    if (!lf1Ref.current) return

    const currentTheme = lf1Ref.current.getTheme()
    const themeConfig = {
      name: 'shared-theme',
      theme: currentTheme,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(themeConfig, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `logicflow-shared-theme-${new Date().getTime()}.json`
    link.click()
    URL.revokeObjectURL(url)

    message.success('主题配置导出成功')
  }

  // 处理主题导入
  const handleImportTheme = () => {
    // 创建文件输入元素
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const themeConfig = JSON.parse(event.target?.result as string)

          // 验证导入的主题配置格式
          if (!themeConfig.theme || typeof themeConfig.theme !== 'object') {
            throw new Error('无效的主题配置格式')
          }

          // 生成新的主题模式名称
          const newThemeMode = {
            label: themeConfig.name || '导入的主题',
            value:
              themeConfig.name?.toLowerCase().replace(/\s+/g, '-') ||
              `imported-theme-${Date.now()}`,
          }

          // 检查主题模式是否已存在
          const existingMode = themeModeList.find(
            (mode) => mode.value === newThemeMode.value,
          )
          if (existingMode) {
            // 如果已存在，使用新的时间戳创建唯一值
            newThemeMode.value = `${newThemeMode.value}-${Date.now()}`
          }

          // 添加主题模式
          if (lf1Ref.current && lf2Ref.current) {
            // 使用静态方法添加新主题
            LogicFlow.addThemeMode?.(newThemeMode.value, themeConfig.theme)

            // 更新主题列表
            setThemeModeList([...themeModeList, newThemeMode])

            // 切换到新主题
            setCurrentTheme(newThemeMode.value)
            lf1Ref.current.setTheme({}, newThemeMode.value)
            lf2Ref.current.setTheme({}, newThemeMode.value)

            message.success('主题配置导入成功')
          }
        } catch (error) {
          message.error('导入失败：无效的主题配置文件')
          console.error('Import theme error:', error)
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }

  return (
    <div className="shared-theme-container">
      <div className="theme-controls">
        <Space>
          <span>主题模式：</span>
          <Select
            value={currentTheme}
            style={{ width: 120 }}
            onChange={handleThemeChange}
            options={themeModeList}
          />
          <Button onClick={handleExportTheme}>导出主题配置</Button>
          <Button onClick={handleImportTheme}>导入主题配置</Button>
        </Space>
      </div>

      <div className="flow-containers">
        <div className="flow-container">
          <h3>流程图 1</h3>
          <div ref={container1Ref} className="flow-wrapper" />
        </div>
        <div className="flow-container">
          <h3>流程图 2</h3>
          <div ref={container2Ref} className="flow-wrapper" />
        </div>
      </div>
    </div>
  )
}
