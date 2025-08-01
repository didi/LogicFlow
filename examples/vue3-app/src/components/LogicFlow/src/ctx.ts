import type { PropType } from 'vue'
import type { DefaultOptions, LoadEvent } from './types'

export const props = {
  defaultOptions: {
    type: Object as PropType<DefaultOptions>,
    default: () => ({})
  },

  defaultEdgeType: {
    type: String,
    required: false
  }
}

export const emits = {
  load: (_e: LoadEvent) => true
}
