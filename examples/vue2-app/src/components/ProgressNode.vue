<template>
  <el-progress type="dashboard" :percentage="percentage" :width="80">
    <template #default="{ percentage }">
      <span class="percentage-value">{{ percentage }}%</span>
    </template>
  </el-progress>
</template>

<script>
export default {
  name: 'ProgressNode',
  inject: ['getNode', 'getGraph'],
  data() {
    return {
      percentage: 80,
    }
  },
}
</script>
