import LogicFlow from '@logicflow/core'
import {
  Control,
  MiniMap,
  Snapshot,
  ToImageOptions,
} from '@logicflow/extension'

import {
  Button,
  Card,
  Flex,
  Divider,
  Select,
  Form,
  Space,
  Input,
  InputNumber,
  Switch,
  Row,
  Col,
} from 'antd'
import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: false,
  stopZoomGraph: false,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
  partial: true,
}

const miniMapOptions: MiniMap.MiniMapOption = {
  isShowHeader: false,
  isShowCloseIcon: true,
  headerTitle: 'MiniMap',
  width: 200,
  height: 120,
}

export default function MiniMapExtension() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [showEdge, setShowEdge] = useState(true)
  const [position, setPosition] = useState('right-bottom')

  const [fileName, setFileName] = useState<string>() // 文件名
  const [fileType, setFileType] = useState<string>('png') // 下载的图片类型
  const [width, setWidth] = useState<number>() // 宽度
  const [height, setHeight] = useState<number>() // 高度
  const [backgroundColor, setBackgroundColor] = useState<string>('white') // 背景颜色
  const [padding, setPadding] = useState<number>() //padding
  const [quality, setQuality] = useState<number>() // 图片质量
  const [partial, setPartial] = useState<boolean>(false) // 导出局部渲染
  const [blobData, setBlobData] = useState('')
  const [base64Data, setBase64Data] = useState('')

  useEffect(() => {
    LogicFlow.use(MiniMap)
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 20,
        },
        plugins: [Control, Snapshot],
        pluginsOptions: {
          MiniMap: {
            ...miniMapOptions,
            showEdge,
          },
        },
      })

      lf.on('miniMap:close', () => {
        setVisible(false)
      })

      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  const [elementsNumber, setElementsNumber] = useState(0) // 元素数量

  // 创建画布数据
  const createData = useCallback(() => {
    const nodes: LogicFlow.NodeConfig[] = []
    const edges: LogicFlow.EdgeConfig[] = []

    for (let i = 0; i < elementsNumber; i++) {
      const nodeStartId = `${i * 2 + 1}`
      const nodeEndId = `${i * 2 + 2}`
      const nodeStart: LogicFlow.NodeConfig = {
        id: nodeStartId,
        type: 'rect',
        x: 400 * (i % 10) - 200,
        y: 100 * Math.floor(i / 10) - 500,
        text: `${i}-start`,
      }
      const nodeEnd: LogicFlow.NodeConfig = {
        id: nodeEndId,
        type: 'rect',
        x: 400 * (i % 10),
        y: 100 * Math.floor(i / 10) - 500,
        text: `${i}-end`,
      }
      const edge: LogicFlow.EdgeConfig = {
        id: `e_${i}`,
        type: 'polyline',
        sourceNodeId: nodeStartId,
        targetNodeId: nodeEndId,
      }
      nodes.push(nodeStart)
      nodes.push(nodeEnd)
      edges.push(edge)
    }

    return {
      nodes,
      edges,
    }
  }, [elementsNumber])

  // 画布数据
  const [data, setData] = useState<LogicFlow.GraphConfigData>(createData)

  // 元素数量改变后更新
  useEffect(() => {
    if (lfRef.current) {
      const newData = createData() // 生成新的数据
      setData(newData) // 更新数据
      lfRef.current.render(newData)
      lfRef.current.translateCenter()
    }
  }, [elementsNumber])

  const toggleVisible = () => {
    if (lfRef.current) {
      const miniMap = lfRef.current.extension.miniMap as MiniMap
      if (visible) {
        miniMap.hide()
      } else {
        miniMap.show()
      }
      setVisible(!visible)
    }
  }

  const toggleShowEdge = () => {
    if (lfRef.current) {
      const miniMap = lfRef.current.extension.miniMap as MiniMap
      miniMap.setShowEdge(!showEdge)
      setShowEdge(!showEdge)
    }
  }

  const handleReset = () => {
    if (lfRef.current) {
      ;(lfRef.current.extension.miniMap as MiniMap).reset()
    }
  }

  const updatePosition = (position: any) => {
    if (lfRef.current) {
      const miniMap = lfRef.current.extension.miniMap as MiniMap
      miniMap.updatePosition(position)
      setPosition(position)
    }
  }

  const updatePositionWithObject1 = () => {
    ;(lfRef.current?.extension.miniMap as MiniMap).updatePosition({
      left: 100,
      top: 100,
    })
  }

  const updatePositionWithObject2 = () => {
    ;(lfRef.current?.extension.miniMap as MiniMap).updatePosition({
      right: 100,
      bottom: 100,
    })
  }

  // 下载
  const downLoad = async () => {
    const params: ToImageOptions = {
      fileType,
      backgroundColor,
      partial,
      width,
      height,
      padding,
      quality,
    }
    console.log(params, 'params')
    await lfRef.current?.getSnapshot(fileName, params)
    // await lfRef.current?.extension.snapshot?.getSnapshot(fileName, params)
    // 测试
    // lfRef.current?.addNode({
    //   type: 'circle',
    //   x: 100,
    //   y: 100,
    //   text: '新增circle',
    //   id: '777'
    // })
  }

  // 预览 blob
  const previewBlob = () => {
    if (lfRef.current) {
      setBase64Data('')
      lfRef.current
        .getSnapshotBlob(backgroundColor, fileType)
        .then(
          ({
            data,
            width,
            height,
          }: {
            data: Blob
            width: number
            height: number
          }) => {
            setBlobData(window.URL.createObjectURL(data))
            console.log('width, height ', width, height)
          },
        )
    }
  }

  // 预览 base64
  const previewBase64 = () => {
    if (lfRef.current) {
      setBlobData('')
      lfRef.current
        .getSnapshotBase64(backgroundColor)
        .then(
          ({
            data,
            width,
            height,
          }: {
            data: string
            width: number
            height: number
          }) => {
            setBase64Data(data)
            console.log('width, height ', width, height)
          },
        )
    }
  }

  const handleInputChange = (
    value: number | null | undefined,
    prop: string,
  ) => {
    if (value === null || value === undefined) {
      switch (
        prop // 处理 null 或 undefined 的情况
      ) {
        case 'width':
          setWidth(undefined)
          break
        case 'height':
          setHeight(undefined)
          break
        case 'padding':
          setPadding(undefined)
          break
        case 'quality':
          setQuality(undefined)
          break
      }
    } else {
      switch (
        prop // 设置有效的数字值
      ) {
        case 'width':
          setWidth(value)
          break
        case 'height':
          setHeight(value)
          break
        case 'padding':
          setPadding(value)
          break
        case 'quality':
          setQuality(value)
          break
      }
    }
  }

  return (
    <Card title="Snapshot 元素数量性能测试">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Space>
          <Button onClick={toggleVisible}>
            {visible ? '隐藏' : '显示'}小地图
          </Button>
          {visible && (
            <Button onClick={handleReset}>重置主画布（缩放&位移）</Button>
          )}
        </Space>
        {visible && (
          <Form layout="inline">
            <Form.Item label="小地图中显示连线">
              <Button onClick={toggleShowEdge}>
                {showEdge ? '隐藏' : '显示'}
              </Button>
            </Form.Item>
            <Form.Item label="小地图位置">
              <Select
                value={position}
                onChange={updatePosition}
                style={{ width: 80 }}
              >
                <Select.Option value="left-top">左上</Select.Option>
                <Select.Option value="left-bottom">左下</Select.Option>
                <Select.Option value="right-top">右上</Select.Option>
                <Select.Option value="right-bottom">右下</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item tooltip="left: 100; top: 100" label="小地图位置">
              <Button onClick={updatePositionWithObject1}>设置</Button>
            </Form.Item>
            <Form.Item tooltip="right: 100; bottom: 100" label="小地图位置">
              <Button onClick={updatePositionWithObject2}>设置</Button>
            </Form.Item>
          </Form>
        )}
      </Flex>
      <Divider />
      <Space>
        <Input
          addonBefore="文件名："
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <span>文件类型：</span>
        <Select
          defaultValue={fileType}
          style={{ width: 120 }}
          onChange={(value) => setFileType(value)}
          options={[
            { value: 'png', label: 'png' },
            { value: 'jpeg', label: 'jpeg' },
            { value: 'webp', label: 'webp' },
            { value: 'gif', label: 'gif' },
            { value: 'svg', label: 'svg' },
          ]}
        />
        <InputNumber
          addonBefore="宽度："
          value={width}
          onChange={(value) => handleInputChange(value, 'width')}
        />
        <InputNumber
          addonBefore="高度："
          value={height}
          onChange={(value) => handleInputChange(value, 'height')}
        />
      </Space>
      <p></p>
      <Space>
        <Input
          addonBefore="背景颜色"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
        <InputNumber
          addonBefore="padding："
          value={padding}
          onChange={(value) => handleInputChange(value, 'padding')}
        />
        <InputNumber
          addonBefore="图片质量："
          value={quality}
          onChange={(value) => handleInputChange(value, 'quality')}
        />
        <span>导出局部渲染：</span>
        <Switch onChange={(partial) => setPartial(partial)} />
      </Space>
      <Divider />
      <Space>
        <Button onClick={downLoad}>下载快照</Button>
        <Button onClick={previewBlob}>预览(blob)</Button>
        <Button onClick={previewBase64}>预览(base64)</Button>
        <InputNumber
          addonBefore="元素数量"
          value={elementsNumber}
          onChange={(value) => {
            setElementsNumber(value!)
          }}
        ></InputNumber>
      </Space>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
      <Row>
        <Col span={12}>
          {blobData && (
            <>
              <h2>blobData</h2>
              <img key="blob" src={blobData} />
            </>
          )}
          {base64Data && (
            <>
              <h2>base64Data</h2>
              <img key="base64" src={base64Data} />
            </>
          )}
        </Col>
      </Row>
    </Card>
  )
}
