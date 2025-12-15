import { defineComponent, h } from 'vue-demi'
import { TitleBar } from './titleBar'

export const Container = defineComponent({
  name: 'LFVueNodeContainer',
  props: {
    node: { type: Object, required: true },
    graph: { type: Object, required: true },
  },
  render(this: any) {
    const props = this.node?.properties || {}
    const children: any[] = []
    const titleColor = props.style.titleColor || '#E5EEFC'
    if (props._showTitle) {
      children.push(h(TitleBar, { node: this.node, graph: this.graph }))
    }
    console.log('props._expanded', props._expanded)
    if (props._expanded === true) {
      children.push(
        h(
          'div',
          { class: 'lf-vue-node-content-wrap' },
          this.$slots?.default ? this.$slots.default() : [],
        ),
      )
    }
    return h(
      'div',
      {
        class: 'lf-vue-node-container',
        style: ` background: linear-gradient(180deg, ${titleColor} 0%, #FFFFFF 24px)`,
      },
      children,
    )
  },
})
