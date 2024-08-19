<template>
  <div class="w-full h-full flex flex-col">
    <el-tabs
      hide-content
      v-model="activeKey"
      @tab-click="
        (key: string) => {
          activeKey = key as string
        }
      "
    >
      <el-tab-pane name="page1" label="page1">
        <template #title> page1 </template>
      </el-tab-pane>
      <el-tab-pane name="page2" label="page2">
        <template #title> page2 </template>
      </el-tab-pane>
    </el-tabs>

    <div class="flex-1 overflow-hidden">
      <KeepAlive>
        <component :is="LFChartView" :key="activeKey" :active-key="activeKey" />
      </KeepAlive>
      <TeleportContainer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTeleport } from '@logicflow/vue-node-registry'
import { ref } from 'vue'
import LFChartView from './LFChartView.vue'

const activeKey = ref('page1')
const TeleportContainer = getTeleport()
</script>
