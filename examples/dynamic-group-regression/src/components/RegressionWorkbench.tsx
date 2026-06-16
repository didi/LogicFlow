import LogicFlow from '@logicflow/core'
import {
  Control,
  DndPanel,
  DynamicGroup,
  type ShapeItem,
} from '@logicflow/extension'
import { ElkLayout } from '@logicflow/layout'
import { Alert, Button, Card, Flex, List, Space, Tag, Typography } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { scenarios } from '@/scenarios'
import type { Scenario } from '@/scenarios/types'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const { Text, Paragraph } = Typography

const dndPatternItems: ShapeItem[] = [
  {
    type: 'dynamic-group',
    label: '动态分组',
    text: 'Group',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/group.png',
  },
  {
    type: 'rect',
    label: '矩形',
    text: 'Rect',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/rect.png',
  },
  {
    type: 'circle',
    label: '圆形',
    text: 'Circle',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/circle.png',
  },
]

const lfOptions: Partial<LogicFlow.Options> = {
  grid: { size: 10 },
  allowResize: true,
  allowRotate: false,
  keyboard: { enabled: true },
  plugins: [DynamicGroup, Control, DndPanel, ElkLayout],
}

function setupLf(lf: LogicFlow) {
  lf.setPatternItems(dndPatternItems)
}

export default function RegressionWorkbench() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lfRef = useRef<LogicFlow>()
  const [activeId, setActiveId] = useState(scenarios[0].id)
  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0]

  const loadScenario = useCallback((scenario: Scenario) => {
    const lf = lfRef.current
    if (!lf) return
    scenario.prepare?.(lf)
    lf.render(JSON.parse(JSON.stringify(scenario.graphData)))
    lf.fitView(40, 40)
  }, [])

  useEffect(() => {
    if (!containerRef.current || lfRef.current) return
    const lf = new LogicFlow({
      ...lfOptions,
      container: containerRef.current,
    })
    setupLf(lf)
    lfRef.current = lf
    loadScenario(scenarios[0])
    return () => {
      lf.destroy()
      lfRef.current = undefined
    }
  }, [loadScenario])

  useEffect(() => {
    loadScenario(active)
  }, [active, loadScenario])

  return (
    <Flex style={{ height: '100vh', background: '#f5f5f5' }}>
      <Card
        title="DynamicGroup 回归场景"
        size="small"
        style={{ width: 320, borderRadius: 0, overflow: 'auto' }}
        bodyStyle={{ padding: 8 }}
      >
        <List
          size="small"
          dataSource={scenarios}
          renderItem={(item) => (
            <List.Item
              style={{
                cursor: 'pointer',
                padding: '8px 4px',
                background: item.id === activeId ? '#e6f4ff' : undefined,
                borderRadius: 4,
              }}
              onClick={() => setActiveId(item.id)}
            >
              <div>
                <Text strong>{item.title}</Text>
                <div>
                  {item.issues.map((tag) => (
                    <Tag key={tag} style={{ marginTop: 4 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Flex vertical style={{ flex: 1, minWidth: 0 }}>
        <Card
          size="small"
          style={{ margin: 8, marginBottom: 0 }}
          bodyStyle={{ padding: 12 }}
        >
          <Alert
            type="warning"
            showIcon
            message={`已知问题：${active.expectedBug}`}
          />
          <Paragraph style={{ marginTop: 12, marginBottom: 8 }}>
            <Text strong>操作步骤</Text>
          </Paragraph>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {active.steps.map((step) => (
              <li key={step}>
                <Text>{step}</Text>
              </li>
            ))}
          </ol>
          {active.actions && active.actions.length > 0 && (
            <Space wrap style={{ marginTop: 12 }}>
              {active.actions.map((action) => (
                <Button
                  key={action.key}
                  size="small"
                  onClick={() => lfRef.current && action.run(lfRef.current)}
                  title={action.description}
                >
                  {action.label}
                </Button>
              ))}
              <Button size="small" onClick={() => loadScenario(active)}>
                重置场景
              </Button>
              <Button
                size="small"
                type="dashed"
                onClick={() => {
                  console.log(lfRef.current?.getGraphRawData())
                  alert('图数据已输出到控制台')
                }}
              >
                打印 getGraphRawData
              </Button>
            </Space>
          )}
        </Card>
        <div
          ref={containerRef}
          style={{ flex: 1, margin: 8, background: '#fff', borderRadius: 8 }}
        />
      </Flex>
    </Flex>
  )
}
