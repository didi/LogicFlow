import { Button, Checkbox, Divider, Space, Typography } from 'antd'
import { useCallback, useState } from 'react'
import {
  buildResizeBoundsGraph,
  defaultResizeBoundsConfig,
  logResizeBoundsInfo,
  RESIZE_BOUNDS_GROUP_ID,
  syncResizeBoundsMembership,
  type ResizeBoundsConfig,
} from '@/scenarios/resizeBounds'
import type { ScenarioControlsProps } from '@/scenarios/types'

const { Text } = Typography

export default function ResizeBoundsControls({
  lf,
  loadGraph,
}: ScenarioControlsProps) {
  const [config, setConfig] = useState<ResizeBoundsConfig>(
    defaultResizeBoundsConfig,
  )

  const applyGraph = useCallback(
    (next: ResizeBoundsConfig) => {
      loadGraph(buildResizeBoundsGraph(next))
      lf && syncResizeBoundsMembership(lf)
    },
    [loadGraph, lf],
  )

  const updateConfig = useCallback(
    (patch: Partial<ResizeBoundsConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...patch }
        applyGraph(next)
        return next
      })
    },
    [applyGraph],
  )

  const resetToDefault = useCallback(() => {
    setConfig(defaultResizeBoundsConfig)
    applyGraph(defaultResizeBoundsConfig)
  }, [applyGraph])

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>分组配置（变更后自动应用）</Text>
        <Space wrap style={{ marginTop: 8 }}>
          <Checkbox
            checked={config.isRestrict}
            onChange={(e) => updateConfig({ isRestrict: e.target.checked })}
          >
            isRestrict（限制子节点拖出分组）
          </Checkbox>
          <Checkbox
            checked={config.autoResize}
            onChange={(e) => updateConfig({ autoResize: e.target.checked })}
          >
            autoResize（子节点移动时父组自动扩大，需 isRestrict）
          </Checkbox>
        </Space>
      </div>

      <Divider style={{ margin: 0 }} />

      <Space wrap>
        <Button size="small" onClick={resetToDefault}>
          重置为默认
        </Button>
        <Button
          size="small"
          onClick={() => lf?.selectElementById(RESIZE_BOUNDS_GROUP_ID, true)}
        >
          选中分组
        </Button>
        <Button size="small" onClick={() => lf && logResizeBoundsInfo(lf)}>
          打印分组信息
        </Button>
        <Button
          size="small"
          type="dashed"
          onClick={() => {
            console.log(lf?.getGraphRawData())
            alert('图数据已输出到控制台')
          }}
        >
          打印 getGraphRawData
        </Button>
      </Space>
    </Space>
  )
}
