import React from 'react'
import { BaseNodeModel, GraphModel } from '@logicflow/core'
import TitleBar from './TitleBar'

export type ContainerProps = {
  node: BaseNodeModel
  graph: GraphModel
  children?: React.ReactNode
}

export const Container: React.FC<ContainerProps> = ({
  node,
  graph,
  children,
}) => {
  const props: any = node?.properties || {}
  const titleColor = props.style?.titleColor || '#E5EEFC'
  const expanded = props._expanded === true

  return (
    <div
      className="lf-vue-node-container"
      style={{
        background: `linear-gradient(180deg, ${titleColor} 0%, #FFFFFF 24px)`,
      }}
    >
      {props._showTitle && <TitleBar node={node} graph={graph} />}
      {expanded && <div className="lf-vue-node-content-wrap">{children}</div>}
    </div>
  )
}

export default Container
