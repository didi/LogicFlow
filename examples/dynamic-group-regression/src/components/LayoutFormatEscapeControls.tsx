import {
  Button,
  Checkbox,
  Divider,
  InputNumber,
  Radio,
  Select,
  Space,
  Typography,
} from 'antd'
import type { ResizeGroupMode } from '@logicflow/layout'
import { useCallback, useState } from 'react'
import {
  buildLayoutGraph,
  defaultLayoutGraphConfig,
  defaultLayoutRunConfig,
  logLayoutMembership,
  runLayout,
  type LayoutGraphConfig,
  type LayoutRunConfig,
} from '@/scenarios/layoutFormatEscape'
import type { ScenarioControlsProps } from '@/scenarios/types'

const { Text } = Typography

type Props = ScenarioControlsProps

export default function LayoutFormatEscapeControls({ lf, loadGraph }: Props) {
  const [graphConfig, setGraphConfig] = useState<LayoutGraphConfig>(
    defaultLayoutGraphConfig,
  )
  const [runConfig, setRunConfig] = useState<LayoutRunConfig>(
    defaultLayoutRunConfig,
  )

  const applyGraph = useCallback(
    (config: LayoutGraphConfig) => {
      loadGraph(buildLayoutGraph(config))
    },
    [loadGraph],
  )

  const patchGraph = (patch: Partial<LayoutGraphConfig>) => {
    setGraphConfig((prev) => ({ ...prev, ...patch }))
  }

  const patchRun = (patch: Partial<LayoutRunConfig>) => {
    setRunConfig((prev) => ({ ...prev, ...patch }))
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>分组配置</Text>
        <Space wrap style={{ marginTop: 8 }}>
          <Checkbox
            checked={graphConfig.groupResizable}
            onChange={(e) => patchGraph({ groupResizable: e.target.checked })}
          >
            分组 resizable
          </Checkbox>
          <span>
            宽
            <InputNumber
              min={120}
              max={800}
              step={20}
              value={graphConfig.groupWidth}
              onChange={(v) =>
                patchGraph({
                  groupWidth: v ?? defaultLayoutGraphConfig.groupWidth,
                })
              }
              style={{ width: 88, marginLeft: 4 }}
            />
          </span>
          <span>
            高
            <InputNumber
              min={100}
              max={600}
              step={20}
              value={graphConfig.groupHeight}
              onChange={(v) =>
                patchGraph({
                  groupHeight: v ?? defaultLayoutGraphConfig.groupHeight,
                })
              }
              style={{ width: 88, marginLeft: 4 }}
            />
          </span>
          <Button size="small" onClick={() => applyGraph(graphConfig)}>
            应用配置
          </Button>
        </Space>
      </div>

      <Divider style={{ margin: 0 }} />

      <div>
        <Text strong>布局参数</Text>
        <Space wrap style={{ marginTop: 8 }}>
          <Radio.Group
            value={runConfig.engine}
            onChange={(e) => patchRun({ engine: e.target.value })}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="dagre">Dagre (#2205)</Radio.Button>
            <Radio.Button value="elk">ELK (#2332)</Radio.Button>
          </Radio.Group>

          <Radio.Group
            value={runConfig.scope}
            onChange={(e) => patchRun({ scope: e.target.value })}
            optionType="button"
            size="small"
          >
            <Radio.Button value="all">全图布局</Radio.Button>
            <Radio.Button value="group">仅组内布局</Radio.Button>
          </Radio.Group>

          <Select
            size="small"
            style={{ width: 200 }}
            value={String(runConfig.resizeGroup)}
            onChange={(v) =>
              patchRun({
                resizeGroup: (v === 'false' ? false : v) as ResizeGroupMode,
              })
            }
            options={[
              { value: 'false', label: 'resizeGroup: 不调整' },
              { value: 'grow-only', label: 'resizeGroup: grow-only' },
              { value: 'fit', label: 'resizeGroup: fit' },
            ]}
          />

          <span>
            padding
            <InputNumber
              min={0}
              max={120}
              step={10}
              size="small"
              value={runConfig.groupPadding}
              onChange={(v) => patchRun({ groupPadding: v ?? 40 })}
              style={{ width: 64, marginLeft: 4 }}
            />
          </span>

          <Radio.Group
            value={runConfig.rankdir}
            onChange={(e) => patchRun({ rankdir: e.target.value })}
            size="small"
          >
            <Radio.Button value="TB">TB</Radio.Button>
            <Radio.Button value="LR">LR</Radio.Button>
          </Radio.Group>

          <span>
            ranksep
            <InputNumber
              min={20}
              max={200}
              step={10}
              size="small"
              value={runConfig.ranksep}
              onChange={(v) => patchRun({ ranksep: v ?? 80 })}
              style={{ width: 64, marginLeft: 4 }}
            />
          </span>
          <span>
            nodesep
            <InputNumber
              min={20}
              max={200}
              step={10}
              size="small"
              value={runConfig.nodesep}
              onChange={(v) => patchRun({ nodesep: v ?? 40 })}
              style={{ width: 64, marginLeft: 4 }}
            />
          </span>
        </Space>
      </div>

      <Space wrap>
        <Button
          type="primary"
          size="small"
          onClick={() => lf && runLayout(lf, runConfig)}
        >
          执行布局
        </Button>
        <Button
          size="small"
          onClick={() => {
            setGraphConfig(defaultLayoutGraphConfig)
            setRunConfig(defaultLayoutRunConfig)
            applyGraph(defaultLayoutGraphConfig)
          }}
        >
          重置为默认配置
        </Button>
        <Button size="small" onClick={() => lf && logLayoutMembership(lf)}>
          打印归属
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
