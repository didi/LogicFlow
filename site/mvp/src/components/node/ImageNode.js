import { h } from '@logicflow/core'
import RectNode from './RectNode'

// 图片

class ImageView extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model
    const href = ''
    const attrs = {
      x: x- 1/2 * width, y: y - 1/2 * height, width, height, href,preserveAspectRatio: true
    }
    return h('g', {}, [
       h('image', { ...attrs })
    ]
    );
  }
}

export default {
  type: 'image',
  view: ImageView,
  model: RectNode.model
}