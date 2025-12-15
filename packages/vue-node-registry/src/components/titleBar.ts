import { defineComponent, h } from 'vue-demi'
import { isNumber, isEmpty } from 'lodash-es'

export const TitleBar = defineComponent({
  name: 'LFVueNodeTitleBar',
  props: {
    node: { type: Object, required: true },
    graph: { type: Object, required: true },
  },
  data() {
    return {
      showTooltip: false as boolean,
    }
  },
  mounted() {
    const trigger =
      (this as any).node?.properties?.titleTrigger === 'hover'
        ? 'hover'
        : 'click'
    const moreBtn: HTMLElement | null = (this.$refs as any).moreBtn || null
    const tooltip: HTMLElement | null = (this.$refs as any).tooltip || null
    const onDoc = (e: MouseEvent) => {
      if (!tooltip || !moreBtn) return
      const t = e.target as Node
      if (this.showTooltip && !tooltip.contains(t) && !moreBtn.contains(t)) {
        this.showTooltip = false
      }
    }
    if (trigger === 'hover' && moreBtn && tooltip) {
      moreBtn.addEventListener('mouseenter', () => {
        this.showTooltip = true
      })
      moreBtn.addEventListener('mouseleave', () => {
        this.showTooltip = false
      })
    } else if (trigger === 'click' && moreBtn) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.showTooltip = !this.showTooltip
      })
      document.addEventListener('click', onDoc)
      ;(this as any).$once &&
        (this as any).$once('hook:beforeDestroy', () => {
          document.removeEventListener('click', onDoc)
        })
    }
  },
  methods: {
    toggleExpand() {
      const cur = !!this.node?.properties?._expanded
      this.node?.setProperty('_expanded', !cur)
    },
    runAction(act: any) {
      try {
        typeof act?.callback === 'function' &&
          act.callback((this as any).node, (this as any).graph)
      } finally {
        this.showTooltip = false
      }
    },
  },
  render(this: any) {
    const props = this.node?.properties || {}
    const icon = props._icon
    const title = props._title || ''
    const expanded = !!props._expanded
    const _titleHeight = isNumber(props._titleHeight) ? props._titleHeight : 28
    const actions = (this as any).node?.__actions || []
    const showMoreAction = !isEmpty(actions)
    console.log('showMoreAction', actions, props._titleActions)
    const bar = h(
      'div',
      {
        class: expanded
          ? 'lf-vue-node-title lf-vue-node-title-expanded'
          : 'lf-vue-node-title',
        style: `height:${expanded ? _titleHeight : 18}px;`,
        title,
      },
      [
        h('div', { class: 'lf-vue-node-title-left' }, [
          icon
            ? h(
                'i',
                {
                  class: 'lf-vue-node-title-icon',
                },
                icon,
              )
            : null,
          h(
            'span',
            {
              class: 'lf-vue-node-title-text',
            },
            title,
          ),
        ]),
        h('div', { class: 'lf-vue-node-title-actions' }, [
          h(
            'button',
            {
              ref: 'expandBtn',
              class: 'lf-vue-node-title-expand',
              onClick: (e: MouseEvent) => {
                console.log('expandClicked')
                e.stopPropagation()
                this.toggleExpand()
              },
              on: {
                click: (e: MouseEvent) => {
                  console.log('expandClicked')
                  e.stopPropagation()
                  this.toggleExpand()
                },
              },
            },
            [
              h(
                'svg',
                {
                  width: 14,
                  height: 12,
                  viewBox: '0 0 14 12',
                  xmlns: 'http://www.w3.org/2000/svg',
                  class: 'lf-vue-node-title-expand-icon',
                  style: `transform:${expanded ? 'rotate(180deg)' : 'rotate(0deg)'};`,
                },
                [
                  h('path', {
                    d: 'M0.5201124,5.47988755C0.23603013,5.7639699,0.24460429,6.2271326,0.53900635,6.5005059L6.3195491,11.8681526C6.7032304,12.2244282,7.2967696,12.2244282,7.6804514,11.8681526L13.460994,6.5005059C13.755396,6.2271326,13.76397,5.7639699,13.479888,5.47988755C13.211547,5.21154633,12.779465,5.20215771,12.499721,5.45858961L7.3378625,10.1902928C7.1467018,10.3655233,6.8532982,10.3655233,6.6621375,10.1902928L1.5002797,5.45858967C1.2205358,5.20215771,0.78845364,5.21154633,0.5201124,5.47988755Z',
                    fill: '#474747',
                  }),
                  h('path', {
                    d: 'M0.5201124,0.47988755C0.23603013,0.7639699,0.24460429,1.2271326,0.53900635,1.5005059L6.3195491,6.8681526C6.7032304,7.2244282,7.2967696,7.2244282,7.6804514,6.8681526L13.460994,1.5005059C13.755396,1.2271326,13.76397,0.7639699,13.479888,0.47988755C13.211547,0.21154633,12.779465,0.20215771,12.499721,0.45858961L7.3378625,5.1902928C7.1467018,5.3655233,6.8532982,5.3655233,6.6621375,5.1902928L1.5002797,0.45858967C1.2205358,0.20215771,0.78845364,0.21154633,0.5201124,0.47988755Z',
                    fill: '#9B9B9B',
                  }),
                ],
              ),
            ],
          ),
          showMoreAction &&
            h(
              'button',
              {
                ref: 'moreBtn',
                class: 'lf-vue-node-title-more',
              },
              [h('i', { class: 'lf-vue-node-title-more-icon' }, '⋯')],
            ),
          h(
            'div',
            {
              ref: 'tooltip',
              class: 'lf-vue-node-title-tooltip',
              style: `opacity:${this.showTooltip ? 1 : 0};pointer-events:${this.showTooltip ? 'auto' : 'none'};`,
            },
            [
              h(
                'div',
                { class: 'lf-vue-node-title-tooltip-list' },
                actions.map((act: any) =>
                  h(
                    'div',
                    {
                      class: 'lf-vue-node-title-tooltip-item',
                      onClick: (e: MouseEvent) => {
                        e.stopPropagation()
                        this.runAction(act)
                      },
                      on: {
                        click: (e: MouseEvent) => {
                          e.stopPropagation()
                          this.runAction(act)
                        },
                      },
                    },
                    act?.name || '',
                  ),
                ),
              ),
            ],
          ),
        ]),
      ],
    )
    return bar
  },
})
