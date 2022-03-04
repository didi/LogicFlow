import { h } from '@logicflow/core'
import RectNode from '../basic/RectNode'

// 水平双箭头

class HorizontalArrowModel extends RectNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 80
    this.height = 40
  }
}

class HorizontalArrowView extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    const ArrowHeight =  1/3 * height;
    const leftX = x - 1/2 * width;
    const leftX2 = x - 1/5 * width;
    const rightX = x + 1/2 * width;
    const rightX2 = x + 1/5 * width;
    const attrs = {
      ...style,
      x,
      y,
      width,
      height,
      points: [
        // 右箭头
        [rightX2, y - 1/2 * ArrowHeight],
        [rightX2, y - 1/2 * height],
        [rightX, y],
        [rightX2, y + 1/2 * height],
        [rightX2, y + 1/2 * ArrowHeight],
        // 左箭头
        [leftX2, y + 1/2 * ArrowHeight],
        [leftX2, y + 1/2 * height],
        [leftX, y],
        [leftX2, y - 1/2 * height],
        [leftX2, y - 1/2 * ArrowHeight],
      ]
    }
    
    return h('g', {}, [
       h('polygon', { ...attrs })
    ]
    );
  }
}

export default {
  type: 'horizontal-arrow',
  view: HorizontalArrowView,
  model: HorizontalArrowModel
}