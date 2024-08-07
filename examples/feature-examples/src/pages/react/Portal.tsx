import React, { FC, useContext } from 'react'
import LogicFlow from '@logicflow/core'
import {
  register,
  ReactNodeProps,
  Portal,
} from '@logicflow/react-node-registry'
import { Button, Card, Divider } from 'antd'

import '@logicflow/core/es/index.css'
import styles from './index.less'

const LFReactPortalProvider = Portal.getProvider() // 注意，一个 LogicFlow 实例只能生命一个 portal provider
const ThemeContext = React.createContext('light')

const NodeComponent: FC<ReactNodeProps> = ({ node }) => {
  const theme = useContext(ThemeContext)
  const data = node.getData()
  if (!data.properties) data.properties = {}

  return (
    <div className={`react-algo-node ${theme === 'light' ? 'light' : 'dark'}`}>
      <img src={require('@/assets/didi.png')} alt="滴滴出行" />
      <span>{data.properties.name as string}</span>
    </div>
  )
}

export default class Example extends React.Component {
  private container!: HTMLDivElement
  private count = 0
  private timer?: ReturnType<typeof setTimeout>

  state = {
    theme: 'light',
  }

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      // width: 800,
      // height: 600,
    })

    lf.render({
      nodes: [
        {
          type: 'rect',
          x: 400,
          y: 100,
          text: '???',
          properties: {
            name: '矩形',
          },
        },
      ],
    })

    register(
      {
        type: 'custom-react-node',
        component: NodeComponent,
      },
      lf,
    )

    const node = lf.addNode({
      id: 'react-node-1',
      type: 'custom-react-node',
      x: 80,
      y: 80,
      properties: {
        name: '今日出行',
        width: 120,
        height: 28,
      },
    })
    console.log('node --->>>', node)

    const update = () => {
      // lf.setProperties('react-node-1', { name: `逻辑回归 ${(this.count += 1)}` })
      node.setProperty('name', `今日出行 ${(this.count += 1)}`)
      this.timer = setTimeout(update, 1000)
    }

    update()
  }

  componentWillUnmount() {
    console.log('0-0-0 componentWillUnmount 0-0-0')
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  changeTheme = () => {
    this.setState({
      theme: this.state.theme === 'light' ? 'dark' : 'light',
    })
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container
  }

  render() {
    return (
      <Card title="React 自定义节点">
        <ThemeContext.Provider value={this.state.theme}>
          <LFReactPortalProvider />
        </ThemeContext.Provider>

        <Button onClick={this.changeTheme}>
          {this.state.theme === 'light' ? '切换到暗色' : '切换到亮色'}
        </Button>
        <Divider />
        <div
          ref={this.refContainer}
          id="graph"
          className={styles.viewport}
        ></div>
      </Card>
    )
  }
}
