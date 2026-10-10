<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { HomeFilled, TrendCharts, Stopwatch } from '@element-plus/icons-vue'
import { RouterView } from 'vue-router'

const menuCollapsed = ref(true)

const menuItems = [
  { index: '/', label: 'Home', icon: HomeFilled },
  { index: '/logicflow', label: 'LogicFlow', icon: TrendCharts },
  { index: '/performance', label: 'performacne', icon: Stopwatch },
  {
    index: '/keep-alive-and-teleport',
    label: 'KeepAlive',
    icon: TrendCharts
  },
  { index: '/lf-chart', label: 'LFChartView', icon: TrendCharts },
  { index: '/nested-transform', label: 'NestedTransform', icon: TrendCharts },
  {
    index: '/selection-pool-conflict',
    label: '#2418 Selection',
    icon: TrendCharts
  },
  {
    index: '/pool-lane-workbench',
    label: 'Pool/Lane/DynamicGroup Workbench',
    icon: TrendCharts
  }
]

function notifyLayoutResize() {
  window.dispatchEvent(new Event('resize'))
}

function toggleMenu() {
  menuCollapsed.value = !menuCollapsed.value
  nextTick(() => {
    notifyLayoutResize()
  })
}
</script>

<template>
  <header :class="{ collapsed: menuCollapsed }">
    <button class="menu-toggle" type="button" @click="toggleMenu">
      {{ menuCollapsed ? '展开菜单' : '收起菜单' }}
    </button>
    <img v-show="!menuCollapsed" class="logo" src="./assets/logo.svg" alt="Vue" />
    <div class="wrapper">
      <el-menu router class="el-menu-vertical-demo" :collapse="menuCollapsed">
        <el-menu-item
          v-for="item in menuItems"
          :key="item.index"
          :index="item.index"
          :title="item.label"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>
            <span>{{ item.label }}</span>
          </template>
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
  flex: 0 0 280px;
  position: relative;
  left: 0;
  line-height: 1.5;
  max-height: 100vh;
  overflow: hidden;
  border-right: 1px solid var(--color-border);
  transition:
    flex-basis 0.2s ease,
    width 0.2s ease;
}

header.collapsed {
  width: 72px;
  flex-basis: 72px;
}

.menu-toggle {
  width: calc(100% - 16px);
  min-height: 32px;
  margin: 8px;
  color: #344054;
  cursor: pointer;
  background: #f8fafc;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
}

.content {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.wrapper {
  width: 100%;
}

.el-menu-vertical-demo {
  width: 100%;
  border-right: 0;
}

:deep(.el-menu--collapse) {
  width: 64px;
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
