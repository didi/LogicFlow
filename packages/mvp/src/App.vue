<template>
  <div class="container">
    <Diagram />
    <DiagramList />
  </div>
</template>

<script>
import DiagramList from './components/DiagramList.vue'
import Diagram from './components/Diagram.vue'

export default {
  name: 'App',
  components: {
    DiagramList,
    Diagram
  }
}
</script>

<style>
html, body {
  height: 100%;
}
body {
  padding: 0;
  margin: 0;
}
</style>
<style scoped>
.container {
  background-color: #f8f9fa;
  height: 100%;
}
</style>
