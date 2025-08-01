import type { App } from 'vue'
import VkLogicFlow from './src/index.vue'

export * as __VkLogicFlow from './src/types'
export { useLogicFlow } from './src/use'

VkLogicFlow.install = (app: App): void => {
  app.component(VkLogicFlow.name || 'VkLogicFlow', VkLogicFlow)
}
export { VkLogicFlow }
export default VkLogicFlow
