import { RectNode, RectNodeModel } from '@logicflow/core'
class NotAllowConnectRectModel extends RectNodeModel {
  getDefaultAnchor() {
    return []
  }
}
class NotAllowConnectRectView extends RectNode {}

export default {
  type: 'not-allow-connect',
  view: NotAllowConnectRectView,
  model: NotAllowConnectRectModel,
}
