import { Button, Divider, InputNumber, Select, Space, Typography } from 'antd'
import { useCallback, useState } from 'react'
import {
  applyTitleHeaderConfig,
  buildTitleHeaderGraph,
  defaultTitleHeaderConfig,
  logTitleHeaderInfo,
  TITLE_ALIGN_OPTIONS,
  TITLE_HEADER_GROUP_ID,
  type TitleHeaderConfig,
} from '@/scenarios/titleHeader'
import type { ScenarioControlsProps } from '@/scenarios/types'

const { Text } = Typography

const OVERFLOW_OPTIONS = [
  { value: 'default', label: 'default（允许溢出）' },
  { value: 'autoWrap', label: 'autoWrap（自动换行）' },
  { value: 'ellipsis', label: 'ellipsis（省略号）' },
]

const LONG_TEXT_SAMPLE =
  '这是一段很长的分组标题文本，用于验证换行与省略号在标题栏内的表现'

export default function TitleHeaderControls({
  lf,
  loadGraph,
}: ScenarioControlsProps) {
  const [config, setConfig] = useState<TitleHeaderConfig>(
    defaultTitleHeaderConfig,
  )

  const applyLive = useCallback(
    (next: TitleHeaderConfig) => {
      if (lf && applyTitleHeaderConfig(lf, next)) {
        return
      }
      loadGraph(buildTitleHeaderGraph(next))
    },
    [lf, loadGraph],
  )

  const updateConfig = useCallback(
    (patch: Partial<TitleHeaderConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...patch }
        applyLive(next)
        return next
      })
    },
    [applyLive],
  )

  const resetToDefault = useCallback(() => {
    setConfig(defaultTitleHeaderConfig)
    loadGraph(buildTitleHeaderGraph(defaultTitleHeaderConfig))
  }, [loadGraph])

  const toggleCollapse = useCallback(() => {
    if (!lf) return
    const model = lf.getNodeModelById(TITLE_HEADER_GROUP_ID) as
      | { toggleCollapse?: (c?: boolean) => void; isCollapsed?: boolean }
      | undefined
    if (!model?.toggleCollapse) return
    model.toggleCollapse(!model.isCollapsed)
  }, [lf])

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>properties.textStyle（变更后自动应用到 th_group）</Text>
        <Space wrap style={{ marginTop: 8 }} align="start">
          <span>
            textAlign
            <Select
              size="small"
              style={{ width: 200, marginLeft: 4 }}
              value={config.textAlign}
              options={TITLE_ALIGN_OPTIONS}
              onChange={(textAlign) => updateConfig({ textAlign })}
            />
          </span>
          <span>
            overflow
            <Select
              size="small"
              style={{ width: 160, marginLeft: 4 }}
              value={config.overflowMode}
              options={OVERFLOW_OPTIONS}
              onChange={(overflowMode) => updateConfig({ overflowMode })}
            />
          </span>
        </Space>
      </div>

      <div>
        <Text type="secondary">wrapPadding（top, right, bottom, left）</Text>
        <Space wrap style={{ marginTop: 8 }}>
          {(
            [
              ['paddingTop', 'top'],
              ['paddingRight', 'right'],
              ['paddingBottom', 'bottom'],
              ['paddingLeft', 'left'],
            ] as const
          ).map(([key, label]) => (
            <span key={key}>
              {label}
              <InputNumber
                min={0}
                max={80}
                step={2}
                size="small"
                value={config[key]}
                onChange={(v) => updateConfig({ [key]: v ?? 0 })}
                style={{ width: 64, marginLeft: 4 }}
              />
            </span>
          ))}
        </Space>
      </div>

      <Divider style={{ margin: 0 }} />

      <Space wrap>
        <Button size="small" onClick={resetToDefault}>
          重置场景
        </Button>
        <Button
          size="small"
          onClick={() => lf?.selectElementById(TITLE_HEADER_GROUP_ID, true)}
        >
          选中分组
        </Button>
        <Button size="small" onClick={toggleCollapse}>
          折叠 / 展开
        </Button>
        <Button
          size="small"
          onClick={() => {
            const model = lf?.getNodeModelById(TITLE_HEADER_GROUP_ID) as
              | { updateText?: (v: string) => void }
              | undefined
            model?.updateText?.(LONG_TEXT_SAMPLE)
          }}
        >
          填入长文本
        </Button>
        <Button size="small" onClick={() => lf && logTitleHeaderInfo(lf)}>
          打印文本信息
        </Button>
      </Space>
    </Space>
  )
}
