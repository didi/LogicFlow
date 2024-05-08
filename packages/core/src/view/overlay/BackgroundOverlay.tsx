import { Component } from 'preact'

/**
 * 背景配置, 支持css属性配置
 * https://developer.mozilla.org/zh-CN/docs/Web/CSS/background
 * @example
 * {
 *  backgroundImage: "url('./img/grid.svg')",
 backgroundRepeat: 'repeat',
 * }
 */
export type BackgroundConfig = {
  /**
   * 背景图片地址
   */
  backgroundImage?: string
  /**
   * 是否重复
   */
  backgroundRepeat?: string
  [key: string]: any
}

type IProps = {
  background: BackgroundConfig
}

export class BackgroundOverlay extends Component<IProps> {
  render() {
    const { background } = this.props
    return (
      <div className="lf-background">
        <div style={background} className="lf-background-area" />
      </div>
    )
  }
}

export default BackgroundOverlay
