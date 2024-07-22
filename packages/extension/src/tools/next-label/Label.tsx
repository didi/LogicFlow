import {
  BaseEdgeModel,
  BaseNodeModel,
  GraphModel,
  Component,
  observer,
} from '@logicflow/core'
import LabelModel from './LabelModel'

export interface ILabelProps {
  label: LabelModel
  element: BaseNodeModel | BaseEdgeModel
  graphModel: GraphModel
}

export interface ILabelState {}

@observer
export class Label extends Component<ILabelProps, ILabelState> {
  constructor(props: ILabelProps) {
    super(props)
  }

  render() {
    const { label, graphModel } = this.props
    const { transformModel } = graphModel
    const { transform } = transformModel.getTransformStyle()

    return (
      <div
        id={`element-container-${label.id}`}
        class="lf-label-editor-container"
        style={{
          left: `${label.x - 10}px`,
          top: `${label.y - 10}px`,
          width: '20px',
          height: '20px',
          transform: `${transform}`,
        }}
      >
        <div
          id={`editor-container-${label.id}`}
          class="lf-label-editor"
          contentEditable={true}
        >
          {label.content}
        </div>
      </div>
    )
  }
}

export default Label
