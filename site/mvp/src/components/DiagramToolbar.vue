<template>
  <div>
    <div class="toolbar-item">
      <area-select size="18" />
    </div>
    <div class="toolbar-item toolbar-color-picker">
      <el-popover
        placement="top-start"
        title="填充样式"
        width="220"
        trigger="click"
      >
        <sketch-picker :value="fillColor"  @input="$_changeFillColor"/>
        <color-fill size="24" slot="reference" />
      </el-popover>
    </div>
    <div class="toolbar-item">
      <color-text size="20" />
    </div>
    <div class="toolbar-item">
      <icon-font size="18" />
    </div>
    <div class="toolbar-item">
      <icon-blod size="18" />
    </div>
    <div class="toolbar-item">
      <icon-line size="18" />
    </div>
    <div class="toolbar-item">
      <zoom-in size="18" />
    </div>
    <div class="toolbar-item">
      <zoom-out size="18" />
    </div>
    <div class="toolbar-item">
      <step-back size="18" />
    </div>
    <div class="toolbar-item">
      <step-foward size="18" />
    </div>
    <div>
      <button @click="$_saveGraph">保存</button>
    </div>
  </div>
</template>

<script>
import { Sketch } from 'vue-color'
import ColorFill from './icon/ColorFill.vue'
import ColorText from './icon/ColorText.vue'
import IconFont from './icon/Font.vue'
import IconBlod from './icon/Blod.vue'
import IconLine from './icon/Line.vue'
import ZoomIn from './icon/ZoomIn.vue'
import ZoomOut from './icon/ZoomOut.vue'
import StepBack from './icon/StepBack.vue'
import StepFoward from './icon/StepFoward.vue'
import AreaSelect from './icon/AreaSelect.vue'

export default {
  props: {
    fillColor: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      colors: '#345678'
    }
  },
  methods: {
    $_changeFillColor (val) {
      // console.log(33, val.hex)
      this.$emit('changeNodeFillColor', val.hex)
    },
    $_saveGraph () {
      this.$emit('saveGraph')
    }
  },
  components: {
    ColorFill,
    ColorText,
    IconFont,
    IconBlod,
    IconLine,
    ZoomIn,
    ZoomOut,
    StepBack,
    StepFoward,
    AreaSelect,
    SketchPicker: Sketch
  }
}
</script>

<style scoped>
.toolbar-item {
  width: 18px;
  height: 18px;
  float: left;
  margin: 12px 4px;
  cursor: pointer;
}
.toolbar-color-picker {
  width: 24px;
  height: 24px;
  margin: 8px 4px;
}
</style>
