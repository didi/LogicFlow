import LogicFlow from '@logicflow/core'
import { merge } from 'lodash-es'
import { Control } from '@logicflow/extension'
import {
  Button,
  ColorPicker,
  Form,
  InputNumber,
  Select,
  Tabs,
  Input,
  message,
} from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import {
  data,
  config,
  FieldConfig,
  ThemeConfig,
  FormValues,
  themeFieldConfigs,
  fieldTypeConfigs,
} from './config'

// 渲染表单项的组件
const renderFormField = (fieldName: string, fieldConfig: FieldConfig) => {
  const { type, label, options, min, max, step, placeholder } = fieldConfig

  // 处理嵌套字段
  const [parentField, childField] = fieldName.split('.')
  const name = childField ? [parentField, childField] : fieldName

  switch (type) {
    case 'color':
      return (
        <Form.Item key={fieldName} label={label} name={name}>
          <ColorPicker
            size="small"
            showText
            format="hex"
            onChange={(color) => {
              return color.toHexString()
            }}
          />
        </Form.Item>
      )
    case 'number':
      return (
        <Form.Item key={fieldName} label={label} name={name}>
          <InputNumber size="small" min={min} max={max} step={step} />
        </Form.Item>
      )
    case 'select':
      return (
        <Form.Item key={fieldName} label={label} name={name}>
          <Select size="small" options={options} />
        </Form.Item>
      )
    case 'text':
      return (
        <Form.Item key={fieldName} label={label} name={name}>
          <Input placeholder={placeholder} />
        </Form.Item>
      )
    default:
      return null
  }
}

// 独立的表单组件
const ThemeFormComponent: React.FC<{
  themeKey: string
  themeConfig: ThemeConfig
  initialValues: any
  onFormChange: (themeKey: string, changedValues: any, allValues: any) => void
}> = ({ themeKey, themeConfig, initialValues, onFormChange }) => {
  const [form] = Form.useForm()
  const { fields = [], nestedFields = {} } = themeConfig

  // 当初始值改变时，更新表单值
  useEffect(() => {
    // 处理嵌套字段的初始值
    const processedInitialValues: Record<string, any> = { ...initialValues }
    if (nestedFields) {
      Object.entries(nestedFields).forEach(([nestedKey, nestedFieldNames]) => {
        if (initialValues[nestedKey]) {
          nestedFieldNames.forEach((fieldName) => {
            processedInitialValues[`${nestedKey}.${fieldName}`] =
              initialValues[nestedKey][fieldName]
          })
        }
      })
    }
    form.setFieldsValue(processedInitialValues)
  }, [form, initialValues, nestedFields])

  return (
    <Form
      form={form}
      layout="vertical"
      size="small"
      initialValues={initialValues}
      onValuesChange={(changedValues, allValues) => {
        // 处理嵌套字段的值
        const processedValues: Record<string, any> = { ...allValues }
        if (nestedFields) {
          Object.entries(nestedFields).forEach(
            ([nestedKey, nestedFieldNames]) => {
              const nestedValues: Record<string, any> = {}
              let hasNestedValues = false
              nestedFieldNames.forEach((fieldName) => {
                const key = `${nestedKey}.${fieldName}`
                if (key in allValues) {
                  nestedValues[fieldName] = allValues[key]
                  hasNestedValues = true
                  delete processedValues[key]
                }
              })
              if (hasNestedValues) {
                processedValues[nestedKey] = nestedValues
              }
            },
          )
        }
        onFormChange(themeKey, changedValues, processedValues)
      }}
    >
      {/* 渲染基础字段 */}
      {fields.map((fieldName) => {
        const fieldConfig = fieldTypeConfigs[fieldName]
        return fieldConfig ? renderFormField(fieldName, fieldConfig) : null
      })}

      {/* 渲染嵌套字段 */}
      {Object.entries(nestedFields).map(([nestedKey, nestedFieldNames]) => (
        <div
          key={nestedKey}
          style={{
            marginTop: 16,
            padding: 12,
            background: '#f9f9f9',
            borderRadius: 6,
          }}
        >
          <h4
            style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 'bold' }}
          >
            {nestedKey === 'background'
              ? '背景样式'
              : nestedKey === 'hover'
                ? '悬停样式'
                : nestedKey === 'adjustLine'
                  ? '调整线样式'
                  : nestedKey === 'adjustAnchor'
                    ? '调整锚点样式'
                    : nestedKey === 'wrapPadding'
                      ? '内边距'
                      : nestedKey === 'config'
                        ? '网格样式'
                        : nestedKey}
          </h4>
          {(nestedFieldNames as string[]).map((fieldName) => {
            const fieldConfig = fieldTypeConfigs[fieldName]
            return fieldConfig
              ? renderFormField(`${nestedKey}.${fieldName}`, fieldConfig)
              : null
          })}
        </div>
      ))}
    </Form>
  )
}

// 渲染主题表单
const renderThemeForm = (
  themeKey: string,
  themeConfig: ThemeConfig,
  formValues: FormValues,
  handleFormChange: (
    themeKey: string,
    changedValues: any,
    allValues: any,
  ) => void,
) => {
  const currentFormValues = formValues[themeKey] || {}

  return (
    <ThemeFormComponent
      themeKey={themeKey}
      themeConfig={themeConfig}
      initialValues={currentFormValues}
      onFormChange={handleFormChange}
    />
  )
}

const initialFormValues: FormValues = Object.keys(themeFieldConfigs).reduce(
  (acc, key) => {
    acc[key] = {}
    return acc
  },
  {} as FormValues,
)

export default function ThemeExample() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [themeModeList, setThemeModeList] = useState([
    { label: '默认主题', value: 'default' },
    { label: '复古主题', value: 'retro' },
    { label: '彩色主题', value: 'colorful' },
    { label: '暗黑主题', value: 'dark' },
  ])
  const [themeMode, setThemeMode] = useState('default')
  const [formValues, setFormValues] = useState(initialFormValues)
  // 添加一个状态来跟踪哪些主题被修改过
  const [modifiedThemes, setModifiedThemes] = useState<Set<string>>(new Set())

  const handleFormChange = (
    themeKey: string,
    changedValues: any,
    allValues: any,
  ) => {
    const { baseNode = {} } = formValues
    // 处理颜色值，将ColorPicker的对象转换为十六进制字符串
    const processedValues = merge({}, baseNode, allValues, changedValues)

    console.log(
      'handleFormChange',
      themeKey,
      processedValues,
      formValues,
      baseNode,
      allValues,
      changedValues,
    )

    // 递归处理所有可能的颜色字段
    const processColorValues = (obj: any) => {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          // 检查是否是ColorPicker返回的颜色对象
          if (
            obj[key].toHexString &&
            typeof obj[key].toHexString === 'function'
          ) {
            obj[key] = obj[key].toHexString()
          } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            // 递归处理嵌套对象（如background, hover等）
            processColorValues(obj[key])
          }
        }
      }
    }

    processColorValues(processedValues)

    // 特殊处理背景和网格配置
    if (themeKey === 'background' && lfRef.current) {
      // 直接更新背景配置
      lfRef.current.graphModel.updateBackgroundOptions(processedValues)
    } else if (themeKey === 'grid' && lfRef.current) {
      // 处理扁平化的配置数据
      const gridOptions: any = {
        size: processedValues.size,
        visible: processedValues.visible,
        type: processedValues.type,
        config: {
          ...lfRef.current.graphModel.grid.config,
        },
      }

      // 处理扁平化的 config 字段
      Object.keys(processedValues).forEach((key) => {
        if (key.startsWith('config.')) {
          const configKey = key.replace('config.', '')
          gridOptions.config[configKey] = processedValues[key]
        }
      })
      // 处理高级行为 majorBold（支持扁平与嵌套两种结构）
      // 判断是否启用高级行为：显式开关，或存在任何majorBold相关字段
      const enabled = (() => {
        if (processedValues.majorBoldEnabled === true) return true
        if (processedValues.majorBoldEnabled === false) return false
        const mbObj = (processedValues as any).majorBold || {}
        const hasNested = Object.keys(mbObj).length > 0
        const hasFlat = Object.keys(processedValues).some((k) =>
          k.startsWith('majorBold.'),
        )
        return hasNested || hasFlat
      })()
      if (enabled === false) {
        gridOptions.majorBold = false
      } else if (enabled === true) {
        const mb: any = {}
        const parseNumberArray = (val: any) =>
          typeof val === 'string'
            ? val
                .split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0)
                .map((s: string) => Number(s))
                .filter((n: number) => Number.isFinite(n) && n > 0)
            : Array.isArray(val)
              ? val
              : undefined

        const mbObj = (processedValues as any).majorBold || {}
        const getVal = (flatKey: string, nestedKey: string) =>
          processedValues[flatKey] !== undefined
            ? processedValues[flatKey]
            : mbObj[nestedKey]

        const opacityVal = getVal('majorBold.opacity', 'opacity')
        if (opacityVal !== undefined) mb.opacity = Number(opacityVal)

        const boldIndicesVal = getVal('majorBold.boldIndices', 'boldIndices')
        const boldIndices = parseNumberArray(boldIndicesVal)
        if (boldIndices && boldIndices.length) mb.boldIndices = boldIndices

        const customBoldWidthVal = getVal(
          'majorBold.customBoldWidth',
          'customBoldWidth',
        )
        if (customBoldWidthVal !== undefined)
          mb.customBoldWidth = Number(customBoldWidthVal)

        const baseSizeVal = getVal('majorBold.dashBaseSize', 'dashBaseSize')
        const dashPatternVal = getVal('majorBold.dashPattern', 'dashPattern')
        const baseSize =
          baseSizeVal !== undefined ? Number(baseSizeVal) : undefined
        const dashPattern = parseNumberArray(dashPatternVal)
        if (baseSize || (dashPattern && dashPattern.length)) {
          mb.dashArrayConfig = {
            baseSize: baseSize ?? lfRef.current.graphModel.grid.size ?? 8,
            pattern: dashPattern ?? [],
          }
        }
        gridOptions.majorBold = Object.keys(mb).length ? mb : true
      }
      console.log('grid', processedValues, gridOptions)

      // 过滤掉undefined值
      Object.keys(gridOptions).forEach((key) => {
        if (gridOptions[key] === undefined) {
          delete gridOptions[key]
        }
      })

      // 更新网格配置
      lfRef.current.graphModel.updateGridOptions(gridOptions)
      // 同时更新主题中的网格配置
      lfRef.current.setTheme({}, themeMode)
    }

    // 标记当前主题已被修改
    setModifiedThemes((prev) => new Set([...prev, themeMode]))

    setFormValues((prev) => ({
      ...prev,
      [themeKey]: processedValues,
    }))
  }

  const handleThemeModeChange = (mode: string) => {
    if (!lfRef.current) return

    // 如果当前主题被修改过，保存修改的配置
    if (modifiedThemes.has(themeMode)) {
      const currentTheme = lfRef.current.getTheme()
      const modifiedConfig = Object.entries(formValues).reduce(
        (acc, [key, value]) => {
          if (value && Object.keys(value).length > 0) {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, any>,
      )

      // 将修改的配置保存到主题中
      LogicFlow.addThemeMode?.(themeMode, {
        ...currentTheme,
        ...modifiedConfig,
      })
    }

    // 切换到新主题前，先清空当前主题的配置
    lfRef.current.setTheme({}, mode)

    // 切换到新主题
    setThemeMode(mode)

    // 重置表单值为新主题的默认值
    const newTheme = lfRef.current.getTheme()
    const newFormValues: FormValues = {}

    // 将新主题的配置映射到表单结构
    Object.entries(themeFieldConfigs).forEach(([themeKey]) => {
      if (themeKey === 'background') {
        if (lfRef.current?.graphModel.background) {
          newFormValues[themeKey] = lfRef.current.graphModel.background
        }
      } else if (themeKey === 'grid') {
        if (lfRef.current?.graphModel.grid) {
          const grid = lfRef.current.graphModel.grid as any
          const fv: any = { ...grid }
          if (grid.majorBold === false) {
            fv.majorBoldEnabled = false
          } else if (grid.majorBold === true) {
            fv.majorBoldEnabled = true
          } else if (typeof grid.majorBold === 'object') {
            fv.majorBoldEnabled = true
            if (grid.majorBold.opacity !== undefined)
              fv['majorBold.opacity'] = grid.majorBold.opacity
            if (Array.isArray(grid.majorBold.boldIndices))
              fv['majorBold.boldIndices'] = grid.majorBold.boldIndices.join(',')
            if (grid.majorBold.customBoldWidth !== undefined)
              fv['majorBold.customBoldWidth'] = grid.majorBold.customBoldWidth
            if (grid.majorBold.dashArrayConfig) {
              if (grid.majorBold.dashArrayConfig.baseSize !== undefined)
                fv['majorBold.dashBaseSize'] =
                  grid.majorBold.dashArrayConfig.baseSize
              if (Array.isArray(grid.majorBold.dashArrayConfig.pattern))
                fv['majorBold.dashPattern'] =
                  grid.majorBold.dashArrayConfig.pattern.join(',')
            }
          }
          newFormValues[themeKey] = fv
        }
      } else if (newTheme[themeKey as keyof typeof newTheme]) {
        newFormValues[themeKey] = newTheme[themeKey as keyof typeof newTheme]
      }
    })

    // 清空表单值后重新设置
    setFormValues({})
    setTimeout(() => {
      setFormValues(newFormValues)
    }, 0)
  }

  // 从LogicFlow获取当前主题并设置到表单
  const loadCurrentThemeToForm = () => {
    if (lfRef.current) {
      const currentTheme = lfRef.current.getTheme()
      const graphModel = lfRef.current.graphModel

      // 将当前主题映射到表单结构
      const mappedFormValues: FormValues = {}
      Object.keys(themeFieldConfigs).forEach((themeKey) => {
        if (themeKey === 'background') {
          // 特殊处理背景配置
          if (
            graphModel.background &&
            typeof graphModel.background === 'object'
          ) {
            mappedFormValues[themeKey] = graphModel.background
          }
        } else if (themeKey === 'grid') {
          // 特殊处理网格配置
          if (graphModel.grid) {
            mappedFormValues[themeKey] = graphModel.grid
          }
        } else if (currentTheme[themeKey as keyof typeof currentTheme]) {
          mappedFormValues[themeKey] =
            currentTheme[themeKey as keyof typeof currentTheme]
        }
      })

      setFormValues(mappedFormValues)
    }
  }

  const handleAddThemeMode = () => {
    if (!lfRef.current) return

    // 获取当前完整的主题配置
    const currentCompleteTheme = lfRef.current.getTheme()
    const graphModel = lfRef.current.graphModel
    console.log('Complete current theme:', currentCompleteTheme)
    console.log('Current background:', graphModel.background)
    console.log('Current grid:', graphModel.grid)

    // 合并用户修改的配置到完整主题中
    const mergedTheme = { ...currentCompleteTheme } as any
    Object.entries(formValues).forEach(([themeKey, themeConfig]) => {
      if (themeConfig && Object.keys(themeConfig).length > 0) {
        if (themeKey === 'background') {
          mergedTheme.background = themeConfig
        } else if (themeKey === 'grid') {
          mergedTheme.grid = themeConfig
        } else {
          mergedTheme[themeKey] = {
            ...mergedTheme[themeKey],
            ...themeConfig,
          }
        }
      }
    })

    console.log('Merged theme for saving:', mergedTheme)

    const customModeName = `自定义主题${Date.now()}`
    const newThemeMode = {
      label: customModeName,
      value: customModeName.toLowerCase().replace(/\s+/g, '-'),
    }

    // 添加自定义主题模式
    lfRef.current.addThemeMode?.(newThemeMode.value, mergedTheme)
    setThemeModeList([...themeModeList, newThemeMode])
    setThemeMode(newThemeMode.value)
  }

  // 修改导出主题的处理逻辑
  const handleExportTheme = () => {
    if (!lfRef.current) return

    // 获取当前主题的配置
    const currentTheme = lfRef.current.getTheme()

    // 创建主题配置对象
    const themeConfig = {
      name: themeMode,
      // 如果当前主题被修改过，导出修改后的配置，否则导出原始配置
      theme: modifiedThemes.has(themeMode)
        ? {
            ...currentTheme,
            ...Object.entries(formValues).reduce(
              (acc, [key, value]) => {
                if (value && Object.keys(value).length > 0) {
                  acc[key] = value
                }
                return acc
              },
              {} as Record<string, any>,
            ),
          }
        : currentTheme,
      timestamp: new Date().toISOString(),
    }

    // 转换为JSON字符串
    const themeConfigStr = JSON.stringify(themeConfig, null, 2)

    // 创建Blob对象
    const blob = new Blob([themeConfigStr], { type: 'application/json' })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `logicflow-theme-${themeMode}-${new Date().getTime()}.json`

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success('主题配置导出成功')
  }

  // 修改导入主题的处理逻辑
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

          // 添加新的主题模式
          const newThemeMode = {
            label: `imported-theme-${Date.now()}`,
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
          if (lfRef.current) {
            // 使用静态方法添加新主题
            LogicFlow.addThemeMode?.(newThemeMode.value, themeConfig.theme)

            // 更新主题列表
            setThemeModeList([...themeModeList, newThemeMode])

            // 切换到新主题前，先清空当前主题的配置
            lfRef.current.setTheme({}, newThemeMode.value)

            // 切换到新主题
            setThemeMode(newThemeMode.value)

            // 将导入的主题配置设置到表单中，但不标记为已修改
            const importedFormValues: FormValues = {}
            Object.entries(themeConfig.theme).forEach(([key, value]) => {
              if (themeFieldConfigs[key]) {
                importedFormValues[key] = value
              }
            })

            // 清空表单值后重新设置
            setFormValues({})
            setTimeout(() => {
              setFormValues(importedFormValues)
            }, 0)

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

  // 修改 useEffect 中的主题监听逻辑
  useEffect(() => {
    if (lfRef.current) {
      // 清空当前主题配置
      lfRef.current.setTheme({}, themeMode)

      // 如果是修改过的主题，应用保存的配置
      if (modifiedThemes.has(themeMode)) {
        const modifiedConfig = Object.entries(formValues).reduce(
          (acc, [key, value]) => {
            if (value && Object.keys(value).length > 0) {
              acc[key] = value
            }
            return acc
          },
          {} as Record<string, any>,
        )

        if (Object.keys(modifiedConfig).length > 0) {
          lfRef.current.setTheme(modifiedConfig, themeMode)
        }
      }
    }
  }, [themeMode, modifiedThemes])

  // 修改表单值变化的监听逻辑
  useEffect(() => {
    if (lfRef.current && modifiedThemes.has(themeMode)) {
      // 只有在主题被修改过的情况下，才应用表单值的变化
      const modifiedConfig = Object.entries(formValues).reduce(
        (acc, [key, value]) => {
          if (value && Object.keys(value).length > 0) {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, any>,
      )
      console.log('before theme config', modifiedConfig, themeMode)
      if (Object.keys(modifiedConfig).length > 0) {
        lfRef.current.setTheme(modifiedConfig, themeMode)
      }
    }
  }, [formValues, themeMode, modifiedThemes])

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        height: 600,
        multipleSelectKey: 'shift',
        disabledTools: ['multipleSelect'],
        autoExpand: true,
        adjustEdgeStartAndEnd: true,
        allowRotate: true,
        edgeTextEdit: true,
        allowResize: true,
        keyboard: {
          enabled: true,
        },
        plugins: [Control],
        partial: true,
        grid: config.grid, // 使用 config 中定义的网格配置
        edgeTextDraggable: true,
        edgeType: 'bezier',
        idGenerator(type) {
          return type + '_' + Math.random()
        },
        edgeGenerator: (sourceNode) => {
          // 限制'rect', 'diamond', 'polygon'节点的连线为贝塞尔曲线
          if (['rect', 'diamond', 'polygon'].includes(sourceNode.type))
            return 'bezier'
          return 'polyline'
        },
      })
      lf.render(data)
      lfRef.current = lf

      // LogicFlow 初始化后，加载当前主题到表单
      setTimeout(() => {
        loadCurrentThemeToForm()
      }, 100)
    }
  }, [])

  // 按分类组织主题项
  const themeCategories: Record<
    string,
    { label: string; items: Array<ThemeConfig & { key: string }> }
  > = {
    basic: { label: '基础主题', items: [] },
    node: { label: '节点主题', items: [] },
    edge: { label: '边主题', items: [] },
    text: { label: '文本主题', items: [] },
    other: { label: '其他元素', items: [] },
    canvas: { label: '画布配置', items: [] },
  }

  Object.entries(themeFieldConfigs).forEach(([key, config]) => {
    themeCategories[config.category].items.push({ key, ...config })
  })

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 左侧画布 */}
      <div style={{ flex: 1, background: '#f0f2f5' }}>
        <div style={{ padding: 16 }}>
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span>主题模式:</span>
            <Select
              value={themeMode}
              style={{ width: 200 }}
              onChange={handleThemeModeChange}
              options={themeModeList}
            />
            <Button type="primary" onClick={handleAddThemeMode}>
              保存为自定义主题
            </Button>
            <Button onClick={handleExportTheme}>导出主题配置</Button>
            <Button onClick={handleImportTheme}>导入主题配置</Button>
          </div>
        </div>
        <div ref={containerRef} id="LF-theme" />
      </div>

      {/* 右侧表单面板 */}
      <div
        style={{
          width: 800,
          background: '#fff',
          borderLeft: '1px solid #e8e8e8',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: 16 }}>
          <h3 style={{ margin: 0, marginBottom: 16 }}>主题配置</h3>

          <Tabs
            type="card"
            size="small"
            items={Object.entries(themeCategories).map(
              ([categoryKey, category]) => ({
                key: categoryKey,
                label: category.label,
                children: (
                  <div
                    style={{
                      maxHeight: 'calc(100vh - 200px)',
                      overflow: 'auto',
                    }}
                  >
                    {category.items.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          marginBottom: 24,
                          padding: 16,
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                        }}
                      >
                        <h4
                          style={{
                            margin: '0 0 12px 0',
                            color: '#666',
                            fontSize: 13,
                          }}
                        >
                          {item.label}
                        </h4>
                        {renderThemeForm(
                          item.key,
                          item,
                          formValues,
                          handleFormChange,
                        )}
                      </div>
                    ))}
                  </div>
                ),
              }),
            )}
          />
        </div>
      </div>
    </div>
  )
}
