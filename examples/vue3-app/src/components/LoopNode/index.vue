<script lang="tsx" setup>
import { register } from '@logicflow/vue-node-registry'
import { useLogicFlow, VkLogicFlow } from '../LogicFlow'
import { h } from 'vue'
const lf = useLogicFlow()

defineOptions({
  name: 'LoopNode'
})

register(
  {
    type: 'loop-node',
    component: {
      props: ['node', 'graph'],

      setup() {
        return () =>
          h(
            'div',
            {
              class: 'vk-register-node-x',
              onMousedown: (e) => {
                e.stopPropagation()
              },
              onWheel: (e) => {
                e.stopPropagation()
              }
            },
            [
              h(VkLogicFlow, {
                onLoad: ({ lf }) => {
                  lf.render({
                    nodes: [
                      {
                        id: 'start-node-1',
                        type: 'rect',
                        x: 50,
                        y: 50,
                        properties: {
                          name: 'Start Node'
                        }
                      }
                    ],
                    edges: []
                  })
                }
              })
            ]
          )
      }
    }
  },
  lf
)
</script>
<template>
  <slot></slot>
</template>
<style>
.vk-register-node-x {
  width: 500px;
  height: 300px;
}
</style>
