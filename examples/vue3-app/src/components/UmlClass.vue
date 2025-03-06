<template>
  <div class="uml-class">
    <!-- 类名 -->
    <div class="uml-header">{{ className }}</div>

    <!-- 属性列表 -->
    <div class="uml-section">
      <div v-for="(attribute, index) in attributes" :key="'attr-' + index">
        {{ attribute }}
      </div>
      <el-button type="primary" icon="el-icon-plus" circle></el-button>
    </div>

    <!-- 方法列表 -->
    <div class="uml-section">
      <div v-for="(method, index) in methods" :key="'method-' + index">
        {{ method }}
      </div>
      <el-button type="primary" icon="el-icon-plus" circle></el-button>
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'lodash-es'
import { getCurrentInstance } from 'vue'

export default {
  name: 'UmlClass',
  inject: ['getNode', 'getGraph'],
  data() {
    return {
      className: '',
      attributes: [],
      methods: [],
      resizeObserver: {}
    }
  },
  mounted() {
    const instance = getCurrentInstance()
    console.log('instance', instance.appContext.app) // 检查 Vue 应用实例是否加载了 Element Plus
    const { properties } = this.getNode()
    const { className, attributes, methods } = properties
    this.$data.className = className
    this.$data.attributes = attributes
    this.$data.methods = methods
    this.$data.nodeData = this.getNode()
    if (this.$el) {
      this.$data.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect
          this.updateSize(width, height)
        }
      })
      this.$data.resizeObserver.observe(this.$el)
    }
    this.getGraph().eventCenter.on('node:properties-change', (data) => {
      if (data.id === this.$data.nodeData.id) {
        this.$data.className = data.properties.className
        this.$data.attributes = data.properties.attributes
        this.$data.methods = data.properties.methods
      }
    })
  },
  methods: {
    updateSize(newWidth, newHeight) {
      const nodeModel = this.getNode()
      const { width, height } = nodeModel
      const params = {}
      if (newWidth !== width) {
        params.width = newWidth + 5
      }
      if (newHeight !== height) {
        params.height = newHeight + 5
      }
      if (isEmpty(params)) return
      nodeModel.setProperties(params)
    }
  },
  onUnmounted() {
    if (this.$data.resizeObserver) {
      this.$data.resizeObserver.disconnect()
    }
  }
}
</script>

<style scoped>
.uml-class {
  width: 200px;
  border: 2px solid #333;
  background: #fff;
  border-radius: 4px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  font-family: Arial, sans-serif;
  user-select: none;
}

.uml-header {
  background: #333;
  color: white;
  padding: 8px;
  text-align: center;
  font-weight: bold;
}

.uml-section {
  border-top: 1px solid #333;
  padding: 8px;
}
</style>
