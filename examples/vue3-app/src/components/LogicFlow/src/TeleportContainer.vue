<script lang="ts" setup>
import { getTeleport } from '@logicflow/vue-node-registry'
import { ref } from 'vue'
import { useLogicFlow } from './use'

const flowId = ref('')
const TeleportContainer = getTeleport()

const lf = useLogicFlow()
lf.once('graph:rendered', ({ graphModel }) => {
  flowId.value = graphModel.flowId as string
})
</script>

<template>
  <TeleportContainer v-if="flowId" :flow-id="flowId" />
</template>
