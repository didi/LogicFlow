import { h } from '@logicflow/core'
import RectNode from '../basic/RectNode'

// 竖直箭头

class VerticalArrowModel extends RectNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 40
    this.height = 80
  }
}

class VerticalArrowView extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    const ArrowWidth =  1/3 * width;
    const upY = y - 1/2 * height;
    const upY2 = y - 1/5 * height;
    const downY = y + 1/2 * height;
    const downY2 = y + 1/5 * height;
    const attrs = {
      ...style,
      x,
      y,
      width,
      height,
      points: [
        // 上箭头
        [x - 1/2 * ArrowWidth, upY2],
        [x - 1/2 * width, upY2],
        [x, upY],
        [x + 1/2 * width, upY2],
        [x + 1/2 * ArrowWidth, upY2],
        // 下箭头
        [x + 1/2 * ArrowWidth, downY2],
        [x + 1/2 * width, downY2],
        [x , downY],
        [x - 1/2 * width, downY2],
        [x - 1/2 * ArrowWidth, downY2],
      ]
    }
    
    return h('g', {}, [
       h('polygon', { ...attrs })
    ]
    );
  }
}

export default {
  type: 'vertical-arrow',
  view: VerticalArrowView,
  model: VerticalArrowModel
}