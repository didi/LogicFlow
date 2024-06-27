import { Component } from 'preact/compat'
import { cloneDeep, assign } from 'lodash-es'
import { observer } from '../..'
import { createUuid } from '../../util'
import { GraphModel } from '../../model'
import { DEFAULT_GRID_SIZE } from '../../constant'

export type GridOptions = {
  /**
   * 网格格子间距
   */
  size?: number
  /**
   * 网格是否可见
   */
  visible?: boolean
  /**
   * 网格类型
   * - `dot` 点状网格
   * - `mesh` 交叉线网格
   */
  type?: 'dot' | 'mesh'
  config?: {
    /**
     * 网格的颜色
     */
    color: string
    /**
     * 网格的宽度
     * - 对于 `dot` 点状网格，表示点的大小
     * - 对于 `mesh` 交叉线网格，表示线的宽度
     */
    thickness?: number
  }
}

type IProps = GridOptions & {
  graphModel: GraphModel
}

@observer
export class Grid extends Component<IProps> {
  readonly id = createUuid()

  static readonly defaultProps: GridOptions = {
    size: DEFAULT_GRID_SIZE,
    visible: true,
    type: 'dot',
    config: {
      color: '#ababab',
      thickness: 1,
    },
  }

  static getGridOptions(options: number | boolean | GridOptions) {
    const defaultOptions = cloneDeep(Grid.defaultProps)
    if (typeof options === 'number') {
      return assign(defaultOptions, { size: options })
    } else if (typeof options === 'boolean') {
      return assign(defaultOptions, { visible: options })
    } else {
      return assign(defaultOptions, options)
    }
  }

  // 网格类型为点状
  renderDot() {
    const { config, size = 1, visible } = this.props

    const { color, thickness = 2 } = config ?? {}

    const length = Math.min(Math.max(1.5, thickness), size / 2) // 2 < length < size /2
    const opacity = visible ? 1 : 0
    return (
      <g fill={color} opacity={opacity}>
        <circle cx={0} cy={0} r={length / 2} />
        <circle cx={0} cy={size} r={length / 2} />
        <circle cx={size} cy={0} r={length / 2} />
        <circle cx={size} cy={size} r={length / 2} />
      </g>
    )
  }

  // 网格类型为交叉线
  // todo: 采用背景缩放的方式，实现更好的体验
  renderMesh() {
    const { config, size = 1, visible } = this.props
    const { color, thickness = 1 } = config ?? {}
    const strokeWidth = Math.min(Math.max(1, thickness), size / 2) // 1 < strokeWidth < size /2
    const d = `M 0 0 H ${size} V ${size} H 0 Z`
    const opacity = visible ? 1 : 0
    return (
      <path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
        fill="transparent"
      />
    )
  }

  render() {
    const {
      type,
      size = 1,
      graphModel: { transformModel },
    } = this.props
    const { SCALE_X, SKEW_Y, SKEW_X, SCALE_Y, TRANSLATE_X, TRANSLATE_Y } =
      transformModel
    const matrixString = [
      SCALE_X,
      SKEW_Y,
      SKEW_X,
      SCALE_Y,
      TRANSLATE_X,
      TRANSLATE_Y,
    ].join(',')
    const transform = `matrix(${matrixString})`
    // const transitionStyle = {
    //   transition: 'all 0.1s ease',
    // };
    return (
      <div className="lf-grid">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id={this.id}
              patternUnits="userSpaceOnUse"
              patternTransform={transform}
              x="0"
              y="0"
              width={size}
              height={size}
            >
              {type === 'dot' && this.renderDot()}
              {type === 'mesh' && this.renderMesh()}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${this.id})`} />
        </svg>
      </div>
    )
  }
}

export default Grid
