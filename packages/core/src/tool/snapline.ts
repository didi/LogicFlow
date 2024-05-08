import EventEmitter from '../event/eventEmitter'
import SnaplineModel from '../model/SnaplineModel'

export function snapline(
  eventCenter: EventEmitter,
  snaplineModel: SnaplineModel,
): void {
  // 节点拖动时启动对齐线计算
  eventCenter.on('node:mousemove', ({ data }: any) => {
    // TODO: 取消注释，定义 data 类型，解决编译问题
    snaplineModel.setNodeSnapLine(data)
  })
  // 节点拖动结束时，对齐线消失
  eventCenter.on('node:mouseup', () => {
    snaplineModel.clearSnapline()
  })
}
