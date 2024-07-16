import { action, observable } from 'mobx'
import {
  concat,
  pullAllWith,
  isEqual,
  isNil,
  findIndex,
  isEmpty,
} from 'lodash-es'
import LogicFlow, { ElementType, EventType } from '@logicflow/core'
import LabelModel from './LabelModel'

export interface ILabelOverlayModel {
  labels: LabelModel[]
  lf: LogicFlow
}

export class LabelOverlayModel implements ILabelOverlayModel {
  @observable labels: LabelModel[] = []
  lf: LogicFlow

  constructor(lf) {
    this.lf = lf
  }

  @action deleteLabel(data) {
    const { graphModel } = this.lf
    const textIndex = findIndex(this.labels, (item) => item.id === data.id)
    const model = graphModel.getElement(data.relateId)
    if (textIndex < 0) return
    this.labels.splice(textIndex, 1)
    graphModel.eventCenter.emit(EventType.LABEL_DELETE, {
      data: this.labels[textIndex],
      model,
    })
  }

  @action deleteLabels(data) {
    pullAllWith(this.labels, data, (arrVar: LabelModel, othVar: LabelModel) =>
      isEqual(arrVar.id, othVar.id),
    )
  }

  @action addLabels(data) {
    this.labels = concat(this.labels, data)
  }

  @action addLabel(data) {
    const {
      model: {
        id,
        BaseType,
        textPosition,
        properties: { _labelOptions },
        x: modelX,
        y: modelY,
      },
      position,
    } = data
    const { eventCenter } = this.lf.graphModel
    const { x, y } = position
    const { multiple = false, max } = _labelOptions
    const relatedLabels = this.labels.filter((item) => item.relateId === id)
    // 当前文本数量有上限且当前已到最大值时不允许新增文本
    if (multiple && !isNil(max) && relatedLabels.length >= max) {
      eventCenter.emit(EventType.LABEL_NOT_ALLOWED_ADD, {
        data: relatedLabels,
        model: data.model,
      })
      console.warn('该元素可添加文本已达上限')
      return
    }
    if (
      (multiple && (isNil(max) || relatedLabels.length < max)) ||
      isEmpty(relatedLabels)
    ) {
      const position =
        BaseType === ElementType.EDGE ? textPosition : { x: modelX, y: modelY }
      const newLabel = {
        id: `${BaseType}_${id}_label_${relatedLabels.length}`,
        relateId: id,
        value: 'new Text',
        content: 'new Text',
        draggable: false,
        editable: true,
        x: multiple ? x : position.x - 10,
        y: multiple ? y : position.y - 10,
        isFocus: true,
      }
      const newLabelModel = new LabelModel(newLabel)
      this.labels.push(newLabelModel)
      eventCenter.emit(EventType.LABEL_ADD, {
        data: newLabel,
        model: data.model,
      })
    }
  }
  getData() {
    return this.labels.map((label) => label.getData())
  }
}

export default LabelOverlayModel
