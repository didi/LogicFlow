import LogicFlow from '@logicflow/core'
import {
  AutoLayout,
  BpmnElement,
  BpmnXmlAdapter,
  ContextMenu,
  Control,
  DndPanel,
  FlowPath,
  Menu,
  Group,
  MiniMap,
  SelectionSelect,
  Snapshot,
} from '@logicflow/extension'
import type { ShapeItem } from '@logicflow/extension'

import { Button, Card, Divider, Flex } from 'antd'
import { useEffect, useRef } from 'react'
import { getImageUrl } from '@/utls'
import { download } from './util'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import './index.less'
import NodeData = LogicFlow.NodeData
import GraphConfigData = LogicFlow.GraphConfigData

const config: Partial<LogicFlow.Options> = {
  edgeTextDraggable: true,
  nodeTextDraggable: true,
  // adjustNodePosition: false,
  // stopMoveGraph: true,
  // multipleSelectedKey: 'meta', // alt, shift
  hideAnchors: false,
  plugins: [
    BpmnElement,
    MiniMap,
    FlowPath,
    AutoLayout,
    DndPanel,
    Menu,
    ContextMenu,
    Group,
    Control,
    BpmnXmlAdapter,
    Snapshot,
    SelectionSelect,
  ],
  // isSilentMode: true,
  grid: {
    type: 'dot',
    size: 20,
  },
  keyboard: {
    enabled: true,
  },
  snapline: true,
}

const menuConfig: Record<string, unknown> = {
  nodeMenu: [
    {
      text: '分享',
      callback() {
        console.log('分享成功！')
      },
    },
    {
      text: '复制',
      callback() {
        console.log('分享成功！')
      },
    },
    {
      text: '修改',
      callback() {
        console.log('分享成功！')
      },
    },
  ],
  graphMenu: [
    {
      text: '分111享',
      callback() {
        console.log('分享成功22！')
      },
    },
  ],
}

const defaultIconConfig: ShapeItem[] = [
  {
    type: 'bpmn:startEvent',
    label: '开始',
    text: '开始',
    icon: getImageUrl('/bpmn/start-event-none.png'),
  },
  {
    type: 'bpmn:userTask',
    label: '用户任务',
    icon: getImageUrl('/bpmn/user-task.png'),
    properties: {
      actived: true,
    },
  },
  {
    type: 'bpmn:serviceTask',
    label: '系统任务',
    icon: getImageUrl('/bpmn/service-task.png'),
    cls: 'import_icon',
  },
  {
    type: 'bpmn:exclusiveGateway',
    label: '条件判断',
    icon: getImageUrl('/bpmn/gateway-xor.png'),
  },
  {
    type: 'bpmn:endEvent',
    label: '结束',
    icon: getImageUrl('/bpmn/end-event-none.png'),
  },
  {
    type: 'group',
    label: '分组',
    icon: getImageUrl('/bpmn/task-none.png'),
  },
]

const getDndPanelConfig = (lf: LogicFlow): ShapeItem[] => [
  {
    label: '选区',
    icon: getImageUrl('/bpmn/select.png'),
    callback: () => {
      lf.openSelectionSelect()
      lf.once('selection:selected', () => {
        lf.closeSelectionSelect()
      })
    },
  },
  ...defaultIconConfig,
]

export default function BPMNExtension() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)

  const renderXml = (xml: unknown) => {
    const lf = lfRef.current
    if (!lf) {
      return
    }
    lf.renderByXml(xml)
  }

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
      })

      lf.setMenuConfig(menuConfig)

      const commonMenuConfig = {
        icon: getImageUrl('/bpmn/delete.png'),
        callback: (data: NodeData) => {
          lf.deleteElement(data.id)
          lf.hideContextMenu()
        },
      }
      lf.setContextMenuItems([commonMenuConfig])
      lf.setContextMenuByType('bpmn:userTask', defaultIconConfig)
      // TODO: 待确认具体功能
      // lf.setContextMenuByType('bpmn:serviceTask', defaultIconConfig);

      const dndPanelConfig = getDndPanelConfig(lf)
      lf.setPatternItems(dndPanelConfig)

      // TODO: 解决 lf extension 插件注册之后，类型仍然是 Extension 的问题，需要注册后定义对应类型，以方便访问其属性 or 方法
      const { control, miniMap } = lf.extension

      ;(control as Control).addItem({
        key: 'mini-map',
        iconClass: 'custom-minimap',
        title: '',
        text: '导航',
        onMouseEnter: (lf: LogicFlow, ev: MouseEvent) => {
          const position = lf.getPointByClient(ev.x, ev.y)
          ;(miniMap as MiniMap).show(
            position.domOverlayPosition.x - 120,
            position.domOverlayPosition.y + 35,
          )
        },
        onClick: (lf: LogicFlow, ev: MouseEvent) => {
          // console.log(MiniMap, ev);
          const position = lf.getPointByClient(ev.x, ev.y)
          // console.log(position);
          ;(miniMap as MiniMap).show(
            position.domOverlayPosition.x - 120,
            position.domOverlayPosition.y + 35,
          )
        },
      })

      // 获取渲染数据
      let lfData: GraphConfigData

      const sessionStorageData = window.sessionStorage.getItem('lf-data')
      if (sessionStorageData) {
        lfData = JSON.parse(sessionStorageData)
        renderXml(lfData)
      } else {
        const lfJsonData = window.sessionStorage.getItem('lf-json-data')
        if (!lfJsonData) {
          lfData = {
            nodes: [],
            edges: [],
          }
        } else {
          lfData = JSON.parse(lfJsonData)
        }
        lf.render(lfData as GraphConfigData)
      }
      const pathes = window.sessionStorage.getItem('lf-pathes')
      if (pathes) {
        lf.setRawPathes(JSON.parse(pathes))
      }

      lfRef.current = lf
    }
  }, [])

  const handleDownloadData = () => {
    const data = lfRef.current?.getGraphData()
    const dataString = JSON.stringify(data)
    download('logicflow.xml', dataString)
    window.sessionStorage.setItem('lf-data', dataString)
  }

  const handleUploadData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const xml = event.target?.result

      renderXml(xml)
    }
    reader.onerror = (error) => console.log(error)

    file && reader.readAsText(file) // you could also read images and other binaries
  }

  const getPath = () => {
    const lf = lfRef.current
    if (lf) {
      lf.setStartNodeType('bpmn:startEvent')
      const paths = lf.getPathes()
      console.log('paths', paths)
      window.sessionStorage.setItem('lf-paths', JSON.stringify(paths))
      // console.log(JSON.parse(window.sessionStorage.getItem('lf-pathes') ?? ''))
    }
  }

  const autoLayout = () => {
    const nextData = lfRef.current?.layout('bpmn:startEvent')
    console.log('after layout:', nextData)
  }

  const getSelectElements = () => {
    const data = lfRef.current?.getSelectElements(true)
    console.log('selected elements: ', data)
  }

  const showContextMenu = () => {
    const lf = lfRef.current
    if (lf) {
      const { nodes } = lf.getSelectElements()
      console.log(nodes[0])
      lf.showContextMenu(nodes[0])
    }
  }

  return (
    <Card title="LogicFlow Extension - DndPanel" className="bpmn-container">
      <p>兼容BPMN官方DEMO，此处仅实现了bpmn中的一部分节点</p>
      <p>此页面绘制的图可以在BPMN官方DEMO中正常使用</p>
      <p>
        点击左下角下载xml，将文件上传到{' '}
        <a href="https://demo.bpmn.io/" target="_blank">
          https://demo.bpmn.io/
        </a>
        即可使用。
      </p>
      <Flex wrap="wrap" gap="small">
        <Button type="primary" key="getPath" onClick={getPath}>
          获取路径
        </Button>
        <Button
          type="primary"
          key="showPath"
          onClick={() => {
            const rawPath = lfRef.current?.getRawPathes()
            console.log('showPath', rawPath)
          }}
        >
          原始路径
        </Button>
        <Button type="primary" key="autoLayout" onClick={autoLayout}>
          自动布局
        </Button>
        <Button
          type="primary"
          key="getSelectElements"
          onClick={getSelectElements}
        >
          获取数据
        </Button>
        <Button type="primary" key="showMenu" onClick={showContextMenu}>
          显示菜单
        </Button>
        <Button
          type="primary"
          key="resize"
          onClick={() => lfRef.current?.resize(1200, 400)}
        >
          重设宽高
        </Button>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className="viewport"></div>
      <div className="graph-io">
        <a onClick={handleDownloadData}>
          <img src={getImageUrl('/bpmn/export.png')} alt="Download GraphData" />
        </a>
        <a onClick={() => lfRef.current?.getSnapshot()}>
          <img
            src={getImageUrl('/bpmn/image.png')}
            alt="Download Graph Image"
          />
        </a>
        <a>
          <input
            type="file"
            className="upload"
            id="upload"
            onChange={handleUploadData}
          />
          <img src={getImageUrl('/bpmn/upload.png')} alt="Upload Data" />
        </a>
      </div>
    </Card>
  )
}
