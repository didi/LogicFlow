<script lang="ts">
import type { Ref } from 'vue'
import { LogicFlow } from '@logicflow/core'
import { defineComponent, onMounted, ref, watchEffect } from 'vue'
import { emits, props } from './ctx'

import TeleportContainer from './TeleportContainer.vue'
import { provideLogicFlow, tryLogicFlow } from './use'

export default defineComponent({
  name: 'VkLogicFlow',
  components: {
    TeleportContainer
  },
  inheritAttrs: false,
  props,
  emits,
  setup(props, { emit }) {
    const parentLogicFlow = tryLogicFlow()
    const containerRef = ref() as Ref<HTMLDivElement>
    const ready = ref(false)
    onMounted(() => {
      const options = {
        container: containerRef.value,
        parentTransform: parentLogicFlow?.graphModel.transformModel,
        // 其他配置
        ...props.defaultOptions
      }
      const lf = new LogicFlow(options)

      watchEffect(() => {
        props.defaultEdgeType && lf.setDefaultEdgeType(props.defaultEdgeType)
      })

      ready.value = true
      provideLogicFlow(lf)
      emit('load', { lf })
    })

    return {
      containerRef,
      ready
    }
  }
})
</script>

<template>
  <div class="vk-logic-flow" v-bind="$attrs">
    <main ref="containerRef"></main>

    <TeleportContainer v-if="ready" />
    <slot v-if="ready"></slot>
  </div>
</template>

<style>
.vk-logic-flow {
  width: 100%;
  height: 100%;
  position: relative;
}
.vk-logic-flow main {
  width: 100%;
  height: 100%;
}
</style>
