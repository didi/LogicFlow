<template>
  <div class="w-full h-full px-4 py-2 leading-6 bg-[#e2f0ff]">
    <p>{{ properties.url }}</p>
    <p>{{ properties.type }}</p>
    <p>{{ properties.category }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { size } from '../confg'

const getNode = inject('getNode')
const nodeModel = getNode()
nodeModel.width = size.defaultNodeWidth
nodeModel.height = size.analysisNodeHeight
const properties = nodeModel.properties
</script>
