import { EventType } from '../../constant'
import EventEmitter from '../../event/eventEmitter'
import SnaplineModel from '../../model/SnaplineModel'

export function snapline(
  eventCenter: EventEmitter,
  snaplineModel: SnaplineModel,
): void {
  // 节点拖动时启动对齐线计算
  eventCenter.on(EventType.NODE_MOUSEMOVE, ({ data }) => {
    snaplineModel.setNodeSnapLine(data)
  })
  // 节点拖动结束时，对齐线消失
  eventCenter.on(EventType.NODE_MOUSEUP, () => {
    snaplineModel.clearSnapline()
  })
}
