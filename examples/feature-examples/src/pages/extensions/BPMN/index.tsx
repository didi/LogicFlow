import LogicFlow from '@logicflow/core'
import {
  AutoLayout,
  BpmnElement,
  BpmnXmlAdapter,
  ContextMenu,
  Control,
  DndPanel,
  ShapeItem,
  FlowPath,
  Menu,
  Group,
  MiniMap,
  SelectionSelect,
  Snapshot,
} from '@logicflow/extension'

import { Button, Card, Divider, Flex } from 'antd'
import { useEffect, useRef } from 'react'

import {
  startEventIcon,
  endEventIcon,
  userTaskIcon,
  serviceTaskIcon,
  exclusiveGatewayIcon,
  groupIcon,
  selectionIcon,
  deleteMenuIcon,
} from './svgIcons'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import styles from './index.less'
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

const menuConfig: Record<string, any> = {
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

// @ts-ignore
const getDndPanelConfig = (lf: LogicFlow): ShapeItem[] => [
  {
    label: '选区',
    icon: selectionIcon,
    callback: () => {
      lf.openSelectionSelect()
      lf.once('selection:selected', () => {
        lf.closeSelectionSelect()
      })
    },
  },
  {
    type: 'bpmn:startEvent',
    text: '开始',
    label: '开始',
    icon: startEventIcon,
  },
  {
    type: 'bpmn:userTask',
    label: '用户任务',
    icon: userTaskIcon,
    properties: {
      actived: true,
    },
  },
  {
    type: 'bpmn:serviceTask',
    label: '系统任务',
    icon: serviceTaskIcon,
    cls: 'import_icon',
  },
  {
    type: 'bpmn:exclusiveGateway',
    label: '条件判断',
    icon: exclusiveGatewayIcon,
  },
  {
    type: 'bpmn:endEvent',
    label: '结束',
    icon: endEventIcon,
  },
  {
    type: 'group',
    label: '分组',
    icon: groupIcon,
  },
]

export default function BPMNExtension() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)

  const renderXml = (xml: GraphConfigData) => {
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
        icon: deleteMenuIcon,
        callback: (data: NodeData) => {
          lf.deleteElement(data.id)
          lf.hideContextMenu()
        },
      }
      lf.setContextMenuItems(commonMenuConfig)
      // TODO: 待确认具体功能
      // lf.setContextMenuByType('bpmn:serviceTask', [
      //   userConfig,
      //   serviceConfig,
      //   exclusiveGatewayConfig,
      //   endConfig,
      //   groupConfig,
      // ]);

      const dndPanelConfig = getDndPanelConfig(lf)
      lf.setPatternItems(dndPanelConfig)

      // TODO: 解决 lf extension 插件注册之后，类型仍然是 Extension 的问题，需要注册后定义对应类型，以方便访问其属性 or 方法
      const { control, miniMap } = lf.extension

      ;(control as Control).addItem({
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

  return (
    <Card title="LogicFlow Extension - DndPanel">
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
        <Button type="primary" key="getPath">
          获取路径
        </Button>
        <Button type="primary" key="showPath">
          原始路径
        </Button>
        <Button type="primary" key="autoLayout">
          自动布局
        </Button>
        <Button type="primary" key="getData">
          获取数据
        </Button>
        <Button type="primary" key="rerender">
          重新渲染
        </Button>
        <Button type="primary" key="showMenu">
          显示菜单
        </Button>
        <Button type="primary" key="resize">
          重设宽高
        </Button>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
      <div className="graph-io">
        <a>
          <img
            src={require('@/assets/bpmn/export.png')}
            alt="Export LogicFlow Data"
          />
        </a>
        <a>
          <img src={require('@/assets/bpmn/image.png')} alt="LogicFlow Image" />
        </a>
        <a>
          <input type="file" className="upload" id="upload" />
          <img src={require('@/assets/bpmn/upload.png')} alt="Upload Data" />
        </a>
      </div>
    </Card>
  )
}
