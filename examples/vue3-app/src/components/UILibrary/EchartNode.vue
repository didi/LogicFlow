<template>
  <div class="echart-node">
    <StackedLineChart></StackedLineChart>
    <RadarChart></RadarChart>
    <ScatterAggregateChart></ScatterAggregateChart>
    <BarRaceChart></BarRaceChart>
  </div>
</template>

<script setup lang="ts">
import StackedLineChart from './echart/StackedLineChart.vue'
import RadarChart from './echart/RadarChart.vue'
import ScatterAggregateChart from './echart/ScatterAggregateChart.vue'
import BarRaceChart from './echart/BarRaceChart.vue'
</script>
<style>
.echart-node {
  width: 1000px;
  background-color: #fff;
}
</style>
