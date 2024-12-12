<template>
  <div style="width: 100%; height: 100%">
    <div
      v-if="flag"
      style="width: 100%; height: 100%; background-color: #fafafa"
    ></div>
    <FlowChart v-else style="width: 100%; height: 100%"></FlowChart>
    <div
      @click="flag = !flag"
      style="font-size: 20px; position: fixed; left: 0; bottom: 40px"
    >
      切换
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import FlowChart from './FlowChart.vue'
const flag = ref(true)
</script>
