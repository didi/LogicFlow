import React, { PureComponent } from 'react'
import { BaseNodeModel, EventType, GraphModel } from '@logicflow/core'
import { reactNodesMap } from './registry'

export interface IWrapperProps {
  node: BaseNodeModel
  graph: GraphModel
}

export interface IWrapperState {
  tick: number
}

export class Wrapper extends PureComponent<IWrapperProps, IWrapperState> {
  constructor(props: IWrapperProps) {
    super(props)
    this.state = { tick: 0 }
  }

  componentDidMount() {
    // TODO: 讨论设计，如果节点有「副作用」属性配置的处理逻辑
    const { node, graph } = this.props
    graph.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, (eventData) => {
      const keys = eventData.keys as string[]
      const content = reactNodesMap[node.type]

      if (content && eventData.id === node.id) {
        const { effect } = content

        // 如果没有定义 effect，则默认更新；如果定义了 effect，则只有在 effect 中的属性发生变化时才更新
        if (!effect || keys.some((key) => effect.includes(key))) {
          this.setState({ tick: this.state.tick + 1 })
        }
      }
    })
  }

  clone(elem: React.ReactElement) {
    const { node, graph } = this.props

    return typeof elem.type === 'string'
      ? React.cloneElement(elem)
      : React.cloneElement(elem, { node, graph })
  }

  render() {
    const { node } = this.props
    const content = reactNodesMap[node.type]

    if (!content) return null

    const { component } = content
    if (React.isValidElement(component)) {
      return this.clone(component)
    }
    const FC = component as React.FC
    return this.clone(<FC />)
  }
}

export default Wrapper
