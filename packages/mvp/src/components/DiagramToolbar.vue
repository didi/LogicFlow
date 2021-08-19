<template>
  <div>
    <div class="toolbar-item toolbar-item-bigger">
      <color-fill />
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
  </div>
</template>

<script>
import ColorFill from './icon/ColorFill.vue'
import ColorText from './icon/ColorText.vue'
import IconFont from './icon/Font.vue'
import IconBlod from './icon/Blod.vue'
import IconLine from './icon/Line.vue'
import ZoomIn from './icon/ZoomIn.vue'
import ZoomOut from './icon/ZoomOut.vue'
import StepBack from './icon/StepBack.vue'
import StepFoward from './icon/StepFoward.vue'

export default {
  components: { ColorFill, ColorText, IconFont, IconBlod, IconLine, ZoomIn, ZoomOut, StepBack, StepFoward }
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
.toolbar-item-bigger {
  width: 24px;
  height: 24px;
  margin: 8px 4px;
}
</style>
