<script setup lang="ts">
import { HomeFilled, TrendCharts, Stopwatch } from '@element-plus/icons-vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <img class="logo" src="./assets/logo.svg" alt="Vue" />
    <div class="wrapper">
      <el-menu router class="el-menu-vertical-demo">
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>Home</span>
        </el-menu-item>

        <el-menu-item index="/logicflow">
          <el-icon><TrendCharts /></el-icon>
          <span>LogicFlow</span>
        </el-menu-item>

        <el-menu-item index="/performance">
          <el-icon><Stopwatch /></el-icon>
          <span>performacne</span>
        </el-menu-item>

        <el-menu-item index="/keep-alive-and-teleport">
          <el-icon><TrendCharts /></el-icon>
          <span>KeepAlive</span>
        </el-menu-item>

        <el-menu-item index="/lf-chart">
          <el-icon><TrendCharts /></el-icon>
          <span>LFChartView</span>
        </el-menu-item>
      </el-menu>
    </div>
  </header>
  <div class="content">
    <RouterView />
  </div>
</template>

<style scoped>
header {
  width: 280px;
  position: relative;
  left: 0;
  line-height: 1.5;
  max-height: 100vh;
}
.content {
  position: relative;
  width: calc(100% - 340px);
  height: 100%;
}

.logo {
  display: block;
  width: 50px;
  margin: 1rem 3rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    flex-direction: column;
    place-items: center;
  }

  .logo {
    margin: 1rem 3rem;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
