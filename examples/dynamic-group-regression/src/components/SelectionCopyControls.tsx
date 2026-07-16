import { Alert, Button, Space, Typography } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ScenarioControlsProps } from '@/scenarios/types'
import {
  buildSelectionCopyGraph,
  copySelection,
  diagnoseCopyPaste,
  pasteSelection,
  selectAll,
  type Clipboard,
} from '@/scenarios/selectionCopyPaste'

const { Text, Paragraph } = Typography

type LfWithSelection = NonNullable<ScenarioControlsProps['lf']> & {
  openSelectionSelect?: () => void
  closeSelectionSelect?: () => void
}

export default function SelectionCopyControls({
  lf,
  loadGraph,
}: ScenarioControlsProps) {
  const clipboardRef = useRef<Clipboard>(null)
  const lastPastedGroupRef = useRef<string | undefined>(undefined)
  const [selectionOpen, setSelectionOpen] = useState(false)
  const [hasClipboard, setHasClipboard] = useState(false)

  // 离开场景时关闭框选，避免影响其它场景
  useEffect(() => {
    return () => {
      const target = lf as LfWithSelection | undefined
      target?.closeSelectionSelect?.()
    }
  }, [lf])

  const toggleSelection = useCallback(() => {
    const target = lf as LfWithSelection | undefined
    if (!target) return
    if (selectionOpen) {
      target.closeSelectionSelect?.()
      setSelectionOpen(false)
    } else {
      target.openSelectionSelect?.()
      setSelectionOpen(true)
    }
  }, [lf, selectionOpen])

  const handleSelectAll = useCallback(() => {
    if (!lf) return
    selectAll(lf)
  }, [lf])

  const handleCopy = useCallback(() => {
    if (!lf) return
    const clipboard = copySelection(lf)
    clipboardRef.current = clipboard
    setHasClipboard(!!clipboard)
    if (!clipboard) {
      alert('当前没有选中任何元素，请先框选或全选')
    }
  }, [lf])

  const handlePaste = useCallback(() => {
    if (!lf) return
    if (!clipboardRef.current) {
      alert('剪贴板为空，请先复制选中')
      return
    }
    const { groupId } = pasteSelection(lf, clipboardRef.current)
    lastPastedGroupRef.current = groupId
  }, [lf])

  const handleMovePasted = useCallback(() => {
    if (!lf) return
    const groupId = lastPastedGroupRef.current
    if (!groupId || !lf.getNodeModelById(groupId)) {
      alert('请先粘贴出一个新分组')
      return
    }
    lf.graphModel.moveNode(groupId, 0, 200)
  }, [lf])

  const handleDiagnose = useCallback(() => {
    if (!lf) return
    const result = diagnoseCopyPaste(lf)
    console.log('[selection-copy-paste] diagnosis', result)
    alert(result.message)
  }, [lf])

  const handleReset = useCallback(() => {
    clipboardRef.current = null
    lastPastedGroupRef.current = undefined
    setHasClipboard(false)
    loadGraph(buildSelectionCopyGraph())
  }, [loadGraph])

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert
        type="warning"
        showIcon
        message="复现选区复制分离：先框选/全选，再复制 → 粘贴 → 诊断 → 拖动新分组"
      />
      <Paragraph style={{ margin: 0 }}>
        <Text type="secondary">
          复制/粘贴按钮与键盘 Cmd/Ctrl+C、Cmd/Ctrl+V 走同一套 core 逻辑
          （getSelectElements +
          addElements）。开启框选后可直接在画布空白处拖拽选区。
        </Text>
      </Paragraph>
      <Space wrap>
        <Button
          size="small"
          type={selectionOpen ? 'primary' : 'default'}
          onClick={toggleSelection}
        >
          {selectionOpen ? '关闭框选' : '开启框选'}
        </Button>
        <Button size="small" onClick={handleSelectAll}>
          全选
        </Button>
        <Button size="small" type="primary" onClick={handleCopy}>
          复制选中
        </Button>
        <Button
          size="small"
          type="primary"
          disabled={!hasClipboard}
          onClick={handlePaste}
        >
          粘贴
        </Button>
        <Button size="small" danger onClick={handleMovePasted}>
          拖动新分组（演示分离）
        </Button>
        <Button size="small" onClick={handleDiagnose}>
          诊断
        </Button>
        <Button size="small" onClick={handleReset}>
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
