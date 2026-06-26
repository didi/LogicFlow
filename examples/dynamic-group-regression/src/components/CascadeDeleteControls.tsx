import { DynamicGroup } from '@logicflow/extension'
import { Alert, Button, Space, Switch, Typography } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import type { ScenarioControlsProps } from '@/scenarios/types'

const { Text } = Typography

const GROUP_ID = 'cascade_group_1'

function getDynamicGroup(lf: NonNullable<ScenarioControlsProps['lf']>) {
  return lf.graphModel.dynamicGroup as DynamicGroup | undefined
}

export default function CascadeDeleteControls({
  lf,
  loadGraph,
}: ScenarioControlsProps) {
  const [cascadeDeleteChildren, setCascadeDeleteChildren] = useState(true)

  const applyCascadeOption = useCallback((value: boolean) => {
    setCascadeDeleteChildren(value)
  }, [])

  useEffect(() => {
    if (!lf) return
    const dg = getDynamicGroup(lf)
    if (dg) {
      dg.cascadeDeleteChildren = cascadeDeleteChildren
    }
  }, [lf, cascadeDeleteChildren])

  const resetScenario = useCallback(() => {
    if (!lf) return
    loadGraph({
      nodes: [
        {
          id: 'cascade_outer',
          type: 'circle',
          x: 120,
          y: 220,
          text: 'cascade_outer',
        },
        {
          id: 'cascade_rect',
          type: 'rect',
          x: 420,
          y: 200,
          text: 'cascade_rect',
          properties: { width: 80, height: 50 },
        },
        {
          id: 'cascade_circle',
          type: 'circle',
          x: 520,
          y: 240,
          text: 'cascade_circle',
        },
        {
          id: GROUP_ID,
          type: 'dynamic-group',
          x: 460,
          y: 220,
          text: GROUP_ID,
          resizable: true,
          properties: {
            width: 360,
            height: 220,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            radius: 5,
          },
        },
      ],
      edges: [
        {
          id: 'cascade_edge_outer_rect',
          type: 'polyline',
          sourceNodeId: 'cascade_outer',
          targetNodeId: 'cascade_rect',
        },
      ],
    })

    const group = lf.getNodeModelById(GROUP_ID) as
      | { addChild: (id: string) => void }
      | undefined
    group?.addChild('cascade_rect')
    group?.addChild('cascade_circle')
    const dg = getDynamicGroup(lf)
    if (dg) {
      dg.cascadeDeleteChildren = cascadeDeleteChildren
    }
  }, [lf, loadGraph, cascadeDeleteChildren])

  const setGroupCollapsed = (collapse: boolean) => {
    if (!lf) return
    const group = lf.getNodeModelById(GROUP_ID) as
      | {
          toggleCollapse?: (c?: boolean) => void
          isCollapsed?: boolean
        }
      | undefined
    if (!group?.toggleCollapse) return
    // 已在目标态时不再调用，避免重复 collapse/expand 导致坐标与虚拟边异常
    if (!!group.isCollapsed === collapse) return
    group.toggleCollapse(collapse)
  }

  const deleteGroup = () => {
    if (!lf) return
    if (!lf.getNodeModelById(GROUP_ID)) {
      alert('分组已不存在，请先重置场景')
      return
    }
    lf.deleteNode(GROUP_ID)
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message={
          cascadeDeleteChildren
            ? '当前：级联删除（删分组会一并删除组内节点）'
            : '当前：仅删分组（组内节点保留在画布并解除归属）'
        }
      />
      <Space wrap align="center">
        <Switch
          checked={cascadeDeleteChildren}
          checkedChildren="级联删"
          unCheckedChildren="保留子"
          onChange={applyCascadeOption}
        />
        <Text type="secondary">cascadeDeleteChildren</Text>
      </Space>
      <Space wrap>
        <Button size="small" onClick={() => setGroupCollapsed(true)}>
          折叠分组
        </Button>
        <Button size="small" onClick={() => setGroupCollapsed(false)}>
          展开分组
        </Button>
        <Button size="small" type="primary" danger onClick={deleteGroup}>
          删除分组
        </Button>
        <Button size="small" onClick={resetScenario}>
          重置场景
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
