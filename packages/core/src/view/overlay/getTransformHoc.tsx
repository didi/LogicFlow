import { Component, ComponentType } from 'preact'
import GraphModel from '../../model/GraphModel'

type IProps = {
  graphModel: GraphModel
}

export type GraphTransform = {
  transform: string
  transformOrigin: string
}

export function getTransform<P>(WrappedComponent: ComponentType<P>) {
  return class extends Component<IProps & P> {
    getMatrixString(): GraphTransform {
      const { graphModel } = this.props
      const {
        transformModel: {
          SCALE_X,
          SKEW_Y,
          SKEW_X,
          SCALE_Y,
          TRANSLATE_X,
          TRANSLATE_Y,
        },
      } = graphModel
      const matrixString = [
        SCALE_X,
        SKEW_Y,
        SKEW_X,
        SCALE_Y,
        TRANSLATE_X,
        TRANSLATE_Y,
      ].join(',')
      return {
        transform: `matrix(${matrixString})`,
        transformOrigin: 'left top',
      }
    }

    render() {
      return (
        <WrappedComponent
          {...(this.props as P)}
          transformStyle={this.getMatrixString()}
        />
      )
    }
  }
}
