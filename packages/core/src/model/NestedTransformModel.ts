import LogicFlow from '../LogicFlow'
import { TransformModel } from './TransformModel'
import { Options as LFOptions } from '../options'
import EventEmitter from '../event/eventEmitter'
type PointTuple = LogicFlow.PointTuple

export class NestedTransformModel extends TransformModel {
  parentTransform?: TransformModel

  constructor(eventCenter: EventEmitter, options: LFOptions.Common) {
    super(eventCenter, options)
    this.parentTransform = options.parentTransform
  }

  /**
   * 设置父级变换
   * @param parentTransform 父级变换模型
   */
  setParentTransform(parentTransform: TransformModel) {
    this.parentTransform = parentTransform
  }

  /**
   * 获取累积的缩放值
   * 计算包括所有父级的累积缩放
   */
  private getCumulativeScale(): { scaleX: number; scaleY: number } {
    let scaleX = this.SCALE_X
    let scaleY = this.SCALE_Y

    if (this.parentTransform) {
      if (this.parentTransform instanceof NestedTransformModel) {
        const parentScale = this.parentTransform.getCumulativeScale()
        scaleX *= parentScale.scaleX
        scaleY *= parentScale.scaleY
      } else {
        scaleX *= this.parentTransform.SCALE_X
        scaleY *= this.parentTransform.SCALE_Y
      }
    }

    return { scaleX, scaleY }
  }

  /**
   * 获取累积的平移值
   * 计算包括所有父级的累积平移
   */
  private getCumulativeTranslate(): { translateX: number; translateY: number } {
    let translateX = this.TRANSLATE_X
    let translateY = this.TRANSLATE_Y

    if (
      this.parentTransform &&
      this.parentTransform instanceof NestedTransformModel
    ) {
      const { scaleX, scaleY } = this.parentTransform.getCumulativeScale()
      translateX = scaleX * translateX
      translateY = scaleY * translateY
    }

    return { translateX, translateY }
  }

  /**
   * 将最外层graph上的点基于缩放转换为canvasOverlay层上的点。
   * 重写以支持嵌套变换
   * @param point HTML点
   */
  HtmlPointToCanvasPoint(point: PointTuple): PointTuple {
    const [x, y] = point
    const { scaleX, scaleY } = this.getCumulativeScale()
    const { translateX, translateY } = this.getCumulativeTranslate()

    return [(x - translateX) / scaleX, (y - translateY) / scaleY]
  }

  /**
   * 将最外层canvasOverlay层上的点基于缩放转换为graph上的点。
   * 重写以支持嵌套变换
   * @param point Canvas点
   */
  CanvasPointToHtmlPoint(point: PointTuple): PointTuple {
    const [x, y] = point
    const { scaleX, scaleY } = this.getCumulativeScale()
    const { translateX, translateY } = this.getCumulativeTranslate()

    return [x * scaleX + translateX, y * scaleY + translateY]
  }

  /**
   * 将一个在canvas上的点，向x轴方向移动directionX距离，向y轴方向移动directionY距离。
   * 重写以支持嵌套变换
   * @param point 点
   * @param directionX x轴距离
   * @param directionY y轴距离
   */
  moveCanvasPointByHtml(
    point: PointTuple,
    directionX: number,
    directionY: number,
  ): PointTuple {
    const [x, y] = point
    const { scaleX, scaleY } = this.getCumulativeScale()

    return [x + directionX / scaleX, y + directionY / scaleY]
  }

  /**
   * 根据缩放情况，获取缩放后的delta距离
   * 重写以支持嵌套变换
   * @param deltaX x轴距离变化
   * @param deltaY y轴距离变化
   */
  fixDeltaXY(deltaX: number, deltaY: number): PointTuple {
    const { scaleX, scaleY } = this.getCumulativeScale()
    return [deltaX / scaleX, deltaY / scaleY]
  }
}

export default NestedTransformModel
