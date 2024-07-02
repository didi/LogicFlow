import { createElement as h, render } from 'preact/compat'
import LabelContainer from './LabelContainer'

export class Label {
  static pluginName = 'label'
  lf: any
  container: any
  labelContainer: any
  constructor({ lf }) {
    this.lf = lf
    this.labelContainer = new LabelContainer()
  }
  render(lf, toolOverlay) {
    const vDom = h(LabelContainer, {
      graphModel: lf.graphModel,
      extension: lf.extension,
    })
    render(vDom, toolOverlay)
  }
}

export default Label
