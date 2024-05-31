<template>
  <div style="width: 100%; height: 100%">
    <!-- 看一下下面的解决方案，直接用 keep-alive 就可以解决；给 LogicFlow 提供 destroy 方法 -->
    <!-- https://v2.cn.vuejs.org/v2/cookbook/avoiding-memory-leaks.html -->
    <keep-alive>
      <div
        v-if="flag"
        style="width: 100%; height: 100%; background-color: #eceff7"
      ></div>
      <FlowChart v-else style="width: 100%; height: 100%"></FlowChart>
    </keep-alive>
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
