<template>
  <div class="diagram-panel">
    <div>设置快捷样式</div>
    <div class="short-styles">
      <div
        v-for="(item, index) in shortStyles"
        :key="index"
        :style="{ 'background': item.background, 'borderColor': item.borderColor, 'borderWidth': item.borderWidth }"
        @click="setStyle(item)"
      >
      </div>
    </div>
  </div>
</template>

<script>
import { shortStyles } from '../constant'

export default {
  props: {
  },
  data () {
    return {
      shortStyles,
      background: '', // 填充色
      gradientColor: '', // 渐变色
      borderType: 0, // 边框类型
      borderColor: '', // 填充颜色
      borderWidth: 1, // 边框宽度
      fontSize: 12, // 文本大小
      fontColor: '', // 文本颜色
      fontWeight: '' // 文本加粗
    }
  },
  mounted () {
    console.log(22)
  },
  methods: {
    setStyle (item) {
      this.$emit('setStyle', item)
    }
  }
}
</script>

<style scoped>
.diagram-panel {
  padding: 20px;
}
.short-styles {
  width: 240px;
}
.short-styles > div {
  width: 50px;
  height: 30px;
  margin: 0 10px 5px 0;
  box-sizing: border-box;
  float: left;
  border: 1px solid #fff;
  cursor: pointer;
}
</style>
