import ReactDOM from 'react-dom/client'
import { ColorPicker, Space, Tooltip } from 'antd'
import { CheckCircleTwoTone } from '@ant-design/icons'
import { HtmlNode, HtmlNodeModel } from '@logicflow/core'

export class CustomReactNodeModel extends HtmlNodeModel {
  createId() {
    return Math.random() + '_react_node'
  }

  setAttributes() {
    const width = 200
    const height = 130
    this.width = width
    this.height = height
    this.textHeight = 60
    this.text = {
      ...this.text,
      y: this.y - this.height / 2,
    }

    this.anchorsOffset = [
      {
        x: width / 2,
        y: 0,
        isSourceAnchor: false,
        isTargetAnchor: true,
      },
    ]
    // this.anchorsOffset = [
    //   [width / 2, 0],
    //   [0, height / 2],
    //   [-width / 2, 0],
    //   [0, -height / 2],
    // ]
  }
}

export class CustomReactNode extends HtmlNode {
  setHtml(rootEl: SVGForeignObjectElement) {
    const { properties } = this.props.model
    console.log('properties', properties)

    const el = document.createElement('div')
    el.className = 'custom-react-node-wrapper'
    ReactDOM.createRoot(el).render(
      <Space direction="vertical">
        <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 40 }} />
        <ColorPicker defaultValue="#1677ff" size="large" showText />
        <Tooltip title="prompt text">
          <span>Show Tooltip</span>
        </Tooltip>
      </Space>,
    )
    rootEl.appendChild(el)
  }
}

export default {
  type: 'custom-react-node',
  view: CustomReactNode,
  model: CustomReactNodeModel,
}
