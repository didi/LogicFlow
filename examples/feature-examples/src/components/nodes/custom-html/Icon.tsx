import { LogicFlow, RectNode, RectNodeModel, h } from '@logicflow/core'
import { cloneDeep } from 'lodash-es'

export type CustomProperties = {
  // 形状属性
  width?: number
  height?: number
  radius?: number

  // 文字位置属性
  refX?: number
  refY?: number

  // 样式属性
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.TextNodeTheme
}

class CustomIconNode extends RectNode {
  getCustomIcon = (): h.JSX.Element => {
    const { model } = this.props
    const { x, y, width, height } = model
    console.log('model.modelType', model.modelType)
    const style = model.getNodeStyle()

    // TODO: 目前没办法自适应 path 的大小，path 与 width、height 需要同步
    return h(
      'svg',
      {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
      },
      [
        h('circle', {
          cx: '50%',
          cy: '50%',
          r: '50%',
          fill: 'white',
        }),
        h('path', {
          d: style.path,
          fill: style.fill,
          stroke: style.stroke,
          // d: 'M 0 5 10 0 C 20 0 20 20 10 20 L 0 15 Z',
          // d: 'M24.85,10.126c2.018-4.783,6.628-8.125,11.99-8.125c7.223,0,12.425,6.179,13.079,13.543c0,0,0.353,1.828-0.424,5.119c-1.058,4.482-3.545,8.464-6.898,11.503L24.85,48L7.402,32.165c-3.353-3.038-5.84-7.021-6.898-11.503c-0.777-3.291-0.424-5.119-0.424-5.119C0.734,8.179,5.936,2,13.159,2C18.522,2,22.832,5.343,24.85,10.126z',
          // d: 'M690.366075 350.568358c0-98.876614-79.937349-179.048571-178.558027-179.048571-98.59935 0-178.515371 80.150629-178.515371 179.048571 0 98.833958 79.916021 178.963259 178.515371 178.963259C610.428726 529.531617 690.366075 449.380988 690.366075 350.568358M376.140632 350.568358c0-75.159877 60.72082-136.072649 135.667416-136.072649 74.989253 0 135.667416 60.912772 135.667416 136.072649 0 75.117221-60.678164 136.029993-135.667416 136.029993C436.861451 486.577022 376.140632 425.664251 376.140632 350.568358M197.284012 762.923936 197.284012 778.472049l15.526785 0 291.255186 0.127968L819.784387 778.472049l15.569441 0 0-15.548113c0-139.783721-136.413897-285.581938-311.026243-273.275681-10.002833 0.703824-24.740482 9.128385-34.658002 9.938849-8.573857 0.74648 13.692577 8.232609 14.396401 16.827793 9.021745-0.789136 6.313088 13.095393 15.505457 13.095393 150.597017 0 263.14488 103.07823 263.14488 224.62651l15.441473-15.590769-285.816546-0.042656-278.991585 1.81288 15.526785 15.612097c0-82.752645 75.095893-152.70849 136.861785-191.824044 7.25152-4.58552 8.659169-17.659585 4.862784-22.906273-6.846288-9.426977-19.877697-8.701825-28.046322-6.014496C285.262018 560.521203 197.284012 667.758394 197.284012 762.923936',
        }),
      ],
    )
  }

  getShape = (): h.JSX.Element => {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    console.log('model.modelType', model.modelType)
    const style = model.getNodeStyle()

    return h('g', {}, [
      h('rect', {
        ...style,
        stroke: 'transparent',
        fill: 'transparent',
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
      }),
      this.getCustomIcon(),
    ])
  }

  getText(): h.JSX.Element | null {
    return null
  }
}

class CustomIconNodeModel extends RectNodeModel {
  setAttributes() {
    console.log('this.properties', this.properties)
    const { width, height, radius } = this.properties as CustomProperties
    if (width) {
      this.width = width
    }
    if (height) {
      this.height = height
    }
    if (radius) {
      this.radius = radius
    }
  }

  getTextStyle(): LogicFlow.TextNodeTheme {
    // const { x, y, width, height } = this
    const {
      refX = 0,
      refY = 0,
      textStyle,
    } = this.properties as CustomProperties
    const style = super.getTextStyle()

    // 通过 transform 重新设置 text 的位置
    return {
      ...style,
      fill: 'red',
      ...(cloneDeep(textStyle) || {}),
      transform: `matrix(1 0 0 1 ${refX} ${refY})`,
    }
  }

  getNodeStyle(): LogicFlow.CommonTheme {
    const style = super.getNodeStyle()
    const {
      style: customNodeStyle,
      // radius = 0, // 第二种方式，设置圆角
    } = this.properties as CustomProperties

    return {
      ...style,
      ...(cloneDeep(customNodeStyle) || {}),
      // rx: radius,
      // ry: radius,
    }
  }
}

export default {
  type: 'customIcon',
  view: CustomIconNode,
  model: CustomIconNodeModel,
}
