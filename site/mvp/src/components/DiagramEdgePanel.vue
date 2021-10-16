<template>
  <div class="diagram-panel">
    <div class="setting-block">
      <div>节点快捷样式</div>
      <div class="short-styles">
        <div
          v-for="(item, index) in shortStyles"
          :key="index"
          :style="{ 'backgroundColor': item.backgroundColor, 'borderColor': item.borderColor, 'borderWidth': item.borderWidth }"
          @click="setStyle(item)"
        >
        </div>
      </div>
    </div>
    <div class="setting-block">
      <div class="setting-item">
        <span>背景色</span>
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="backgroundColor" @input="(c) => $_changeColorProperty(c, 'backgroundColor')"/>
          <div class="border-color" :style='{"backgroundColor": backgroundColor}' slot="reference"></div>
        </el-popover>
        <span>背景渐变色</span>
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="gradientColor" @input="(c) => $_changeColorProperty(c, 'gradientColor')"/>
          <div class="border-color" :style='{"backgroundColor": gradientColor}' slot="reference"></div>
        </el-popover>
      </div>
      <div class="setting-item">
        <span>边框样式</span>
        <el-select v-model="borderStyle" size="small" @change="$_selectBorder">
          <el-option value="hidden" label="不显示"></el-option>
          <el-option
            v-for="(border, index) in borderStyles"
            :value="border.value"
            :key="index"
          >
            <div class="border-style" :style="{ 'borderBottomStyle': border.value}"></div>
          </el-option>
        </el-select>
      </div>
      <div class="setting-item">
        <span>边框颜色</span>
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="borderColor"  @input="(c) => $_changeColorProperty(c, 'borderColor')"/>
          <div class="border-color" :style='{"backgroundColor": borderColor}' slot="reference"></div>
        </el-popover>
      </div>
      <div class="setting-item">
        <span>边框宽度</span>
        <el-input v-model="borderWidth" @change="$_changeBorderWidth" />
      </div>
      <div class="setting-item">
        <span>文本颜色</span>
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="fontColor" @input="(c) => $_changeColorProperty(c, 'fontColor')"/>
          <div class="border-color" :style='{"backgroundColor": fontColor}' slot="reference"></div>
        </el-popover>
      </div>
      <div class="setting-item">
        <span>文本大小</span>
        <el-input v-model="fontSize" @change="$_changeFontSize" />
      </div>
      <div>
        <el-button @click="$emit('setZIndex', 'top')">置为顶部</el-button>
        <el-button @click="$emit('setZIndex', 'bottom')">置为底部</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Sketch } from 'vue-color'
import { shortStyles, borderStyles } from '../constant'

export default {
  props: {
  },
  data () {
    return {
      shortStyles,
      borderStyles,
      backgroundColor: '', // 填充色
      gradientColor: '', // 渐变色
      borderType: 0, // 边框类型
      borderColor: '', // 填充颜色
      borderWidth: 1, // 边框宽度
      borderStyle: '', // 边框类型
      fontSize: 12, // 文本大小
      fontColor: '', // 文本颜色
      SketchPicker: Sketch,
      fontWeight: '' // 文本加粗
    }
  },
  methods: {
    setStyle (item) {
      this.$emit('setStyle', item)
    },
    $_selectBorder () {
      this.$emit('setStyle', {
        borderStyle: this.borderStyle
      })
    },
    $_changeColorProperty ({ rgba: { r, g, b, a } }, type) {
      const color = `rgba(${r},${g},${b},${a})`
      this[type] = color
      this.$emit('setStyle', {
        [type]: color
      })
    },
    $_changeFontSize () {
      this.$emit('setStyle', {
        fontSize: this.fontSize
      })
    },
    $_changeBorderWidth () {
      this.$emit('setStyle', {
        borderWidth: this.borderWidth
      })
    }
  },
  components: {
    SketchPicker: Sketch
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
.border-style {
  width: 150px;
  height: 0px;
  margin-top: 18px;
  border-bottom-width: 1px;
  border-bottom-color: black;
}
.setting-block {
  overflow: hidden;
}
.setting-item {
  line-height: 12px;
  font-size: 12px;
  display: flex;
  vertical-align: middle;
  align-items: center;
  margin-top: 10px;
}
.setting-item > span {
  width: 50px;
  margin-right: 10px;
  text-align: right;
  flex-shrink: 0;
  flex-grow: 0;
}
.border-color {
  width: 40px;
  height: 30px;
  display: inline-block;
  border: 1px solid #eaeaeb;
}

</style>
