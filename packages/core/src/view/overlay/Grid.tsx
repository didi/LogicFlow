import { Component } from 'preact/compat'
import { cloneDeep, assign, isNil } from 'lodash-es'
import { observer } from '../..'
import { mergeMajorBoldConfig, MajorBoldConfig } from './gridConfig'
import { createUuid } from '../../util'
import { GraphModel } from '../../model'
import { defaultGrid } from '../../constant'

type IProps = {
  graphModel: GraphModel
}

@observer
export class Grid extends Component<IProps> {
  gridOptions: Grid.GridOptions

  readonly id = createUuid()

  constructor(props: IProps) {
    super(props)
    this.gridOptions = this.props.graphModel.grid
  }

  // 网格类型为点状
  renderDot() {
    const { config, size = 1, visible } = this.gridOptions

    const { color, thickness = 2 } = config ?? {}

    // 对于点状网格，点的半径不能大于网格大小的四分之一
    const radius = Math.min(Math.max(2, thickness), size / 4)
    const opacity = visible ? 1 : 0
    return (
      <g fill={color} opacity={opacity}>
        <circle cx={0} cy={0} r={radius / 2} />
        <circle cx={0} cy={size} r={radius / 2} />
        <circle cx={size} cy={0} r={radius / 2} />
        <circle cx={size} cy={size} r={radius / 2} />
      </g>
    )
  }

  // 计算与 size 整除的虚线周期，使边长能被 (dash + gap) 完整分割
  private getDashArrayForSize(dashCfg?: { pattern: number[] }): string {
    // 若提供了直接可用的 pattern，则优先使用
    const direct = dashCfg?.pattern?.filter(
      (n) => typeof n === 'number' && n > 0,
    )
    return direct?.join(',') || '2,1'
  }

  // 计算一个周期内的最大加粗索引（作为周期大小）
  private getPeriod(advanced: any): number {
    const list = Array.isArray(advanced?.boldIndices)
      ? advanced.boldIndices.filter((n: any) => typeof n === 'number' && n > 0)
      : []
    return list.length ? Math.max(...list) : 0
  }

  // 计算加粗线宽，优先使用自定义；否则根据周期与厚度估算
  private getBoldStrokeWidth(
    advanced: any,
    size: number,
    thickness?: number,
    period?: number,
  ): number {
    if (typeof advanced?.customBoldWidth === 'number')
      return advanced.customBoldWidth
    const baseThickness = Math.max(1, thickness ?? 1)
    const p = Math.max(1, period ?? this.getPeriod(advanced))
    return Math.min(baseThickness, (size * p) / 2) / 2
  }

  // 渲染 mesh 类型四条边的虚线，减少重复代码
  private renderMeshEdgeLines(
    size: number,
    color: string,
    strokeWidth: number,
    opacity: number,
    dash?: string,
  ) {
    const segments = [
      { d: `M 0 0 H ${size}` },
      { d: `M 0 ${size} H ${size}` },
      { d: `M 0 0 V ${size}` },
      { d: `M ${size} 0 V ${size}` },
    ]
    return (
      <g opacity={opacity} fill="transparent">
        {segments.map((seg) => (
          <path
            d={seg.d}
            stroke={color}
            strokeWidth={strokeWidth / 2}
            strokeDasharray={dash}
            strokeLinecap="butt"
            fill="transparent"
          />
        ))}
      </g>
    )
  }

  // 网格类型为交叉线
  // todo: 采用背景缩放的方式，实现更好的体验
  renderMesh() {
    const {
      config,
      size = 1,
      visible,
      majorBold,
    } = this.gridOptions as Grid.GridOptions & {
      majorBold?: boolean | MajorBoldConfig
    }
    const { config: advanced } = mergeMajorBoldConfig(majorBold)
    const { opacity: baseOpacity } = advanced
    const color: string = (config?.color ?? '#D7DEEB') as string
    const thickness: number = (config?.thickness ?? 1) as number

    // 对于交叉线网格，线的宽度不能大于网格大小的一半
    const strokeWidth = Math.min(Math.max(1, thickness), size / 2)
    const opacity = visible ? baseOpacity : 0

    // 根据 size 自动计算合适的 dash/gap 周期，使 size 能被 (dash + gap) 整除
    const dash =
      majorBold === false
        ? undefined
        : this.getDashArrayForSize(advanced.dashArrayConfig)
    return this.renderMeshEdgeLines(size, color, strokeWidth, opacity, dash)
  }

  render() {
    const {
      graphModel: { transformModel, grid },
    } = this.props
    this.gridOptions = grid
    const {
      type,
      config = {},
      size = 1,
      majorBold,
    } = this.gridOptions as Grid.GridOptions & {
      majorBold?: boolean | MajorBoldConfig
    }
    const showMajorBold = majorBold !== false && !isNil(majorBold)
    const { config: advanced } = mergeMajorBoldConfig(majorBold)
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
    const radius = Math.min(Math.max(2, config.thickness ?? 1), size / 4)
    const opacity = showMajorBold ? advanced.opacity : 1
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
            {type === 'dot' && advanced.boldIndices.length ? (
              <pattern
                id={`${this.id}-dot-major`}
                patternUnits="userSpaceOnUse"
                patternTransform={transform}
                x="0"
                y="0"
                width={size * this.getPeriod(advanced)}
                height={size * this.getPeriod(advanced)}
              >
                <g
                  fill={this.gridOptions.config?.color ?? '#D7DEEB'}
                  opacity={this.gridOptions.visible ? opacity : 0}
                >
                  <circle cx={0} cy={0} r={(radius * 1.5) / 2} />
                  <circle
                    cx={size * this.getPeriod(advanced)}
                    cy={0}
                    r={(radius * 1.5) / 2}
                  />
                  <circle
                    cx={0}
                    cy={size * this.getPeriod(advanced)}
                    r={(radius * 1.5) / 2}
                  />
                  <circle
                    cx={size * this.getPeriod(advanced)}
                    cy={size * this.getPeriod(advanced)}
                    r={(radius * 1.5) / 2}
                  />
                </g>
              </pattern>
            ) : null}
            {type === 'mesh' && advanced.boldIndices.length ? (
              <pattern
                id={`${this.id}-major`}
                patternUnits="userSpaceOnUse"
                patternTransform={transform}
                x="0"
                y="0"
                width={size * this.getPeriod(advanced)}
                height={size * this.getPeriod(advanced)}
              >
                {advanced.boldIndices.map((i: number) => (
                  <g>
                    <path
                      d={`M ${size * i} 0 V ${size * this.getPeriod(advanced)}`}
                      stroke={this.gridOptions.config?.color ?? '#D7DEEB'}
                      strokeWidth={this.getBoldStrokeWidth(
                        advanced,
                        size,
                        (this.gridOptions.config ?? {}).thickness,
                        this.getPeriod(advanced),
                      )}
                      opacity={this.gridOptions.visible ? opacity : 0}
                      fill="transparent"
                    />
                    <path
                      d={`M 0 ${size * i} H ${size * this.getPeriod(advanced)}`}
                      stroke={this.gridOptions.config?.color ?? '#D7DEEB'}
                      strokeWidth={this.getBoldStrokeWidth(
                        advanced,
                        size,
                        (this.gridOptions.config ?? {}).thickness,
                        this.getPeriod(advanced),
                      )}
                      opacity={this.gridOptions.visible ? opacity : 0}
                      fill="transparent"
                    />
                  </g>
                ))}
              </pattern>
            ) : null}
          </defs>
          <rect width="100%" height="100%" fill={`url(#${this.id})`} />
          {type === 'dot' && showMajorBold && advanced.boldIndices.length ? (
            <rect
              width="100%"
              height="100%"
              fill={`url(#${this.id}-dot-major)`}
            />
          ) : null}
          {type === 'mesh' && showMajorBold && advanced.boldIndices.length ? (
            <rect width="100%" height="100%" fill={`url(#${this.id}-major)`} />
          ) : null}
        </svg>
      </div>
    )
  }
}

export namespace Grid {
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
      color?: string
      /**
       * 网格的宽度
       * - 对于 `dot` 点状网格，表示点的大小
       * - 对于 `mesh` 交叉线网格，表示线的宽度
       */
      thickness?: number
    }
    /**
     * 行为配置：支持 boolean 或高级对象
     * - false: 禁用特殊样式，opacity=1，无加粗，无虚线
     * - true: 启用默认样式，opacity=0.75，每第5个加粗/实线，虚线动态计算
     * - object: 高级配置，详见 MajorBoldConfig
     */
    majorBold?: boolean | MajorBoldConfig
  }

  export function getGridOptions(options: number | boolean | GridOptions) {
    const defaultOptions = cloneDeep(defaultGrid) as GridOptions
    if (typeof options === 'number') {
      return assign(defaultOptions, { size: options })
    } else if (typeof options === 'boolean') {
      return assign(defaultOptions, { visible: options })
    } else {
      return assign(defaultOptions, options)
    }
  }
}
