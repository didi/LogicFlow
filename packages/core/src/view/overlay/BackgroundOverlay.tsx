import { Component } from 'preact/compat'
import { isObject } from 'lodash-es'
import { Options as LFOptions } from '../../options'
import { observer } from '../..'

/**
 * 背景配置, 支持css属性配置
 * https://developer.mozilla.org/zh-CN/docs/Web/CSS/background
 * @example
 * {
 *    backgroundImage: "url('./img/grid.svg')",
      backgroundRepeat: 'repeat',
 * }
 */
type IProps = {
  background: boolean | LFOptions.BackgroundConfig
}

@observer
export class BackgroundOverlay extends Component<IProps> {
  render() {
    const { background } = this.props
    return (
      <div className="lf-background">
        <div
          style={isObject(background) ? background : {}}
          className="lf-background-area"
        />
      </div>
    )
  }
}

export default BackgroundOverlay
