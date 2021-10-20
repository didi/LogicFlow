<template>
  <div class="diagram-sidebar">
    <div>
      <h1 class="node-category-title">General</h1>
      <div class="node-category">
        <div class="node-item" @mousedown="dragInNode('pro-circle')">
          <icon-circle class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('pro-rect')">
          <icon-rect class="svg-node"/>
        </div>
        <div class="node-item" @mousedown="dragInNode('rect-radius')">
          <icon-rect-radius class="svg-node"/>
        </div>
        <div class="node-item" @mousedown="dragInNode('triangle')">
          <icon-triangle class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('ellipse')">
          <icon-ellipse class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('diamond')">
          <icon-diamond class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('cylinde')">
          <icon-cylinde class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('actor')">
          <icon-actor class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('parallelogram')">
          <icon-parallelogram class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('pro-text')">
          <icon-text class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('table')">
          <icon-table class="svg-table" />
        </div>
      </div>
    </div>
    <div>
      <h1 class="node-category-title">Misc</h1>
      <div class="node-category">
        <div class="node-item circle-node"></div>
        <div class="node-item rect-node"></div>
        <div class="node-item rect-radius-node"></div>
        <div class="node-item triangle-node"></div>
        <div class="node-item ellipse-node"></div>
        <div class="node-item diamond-node"></div>
        <div class="node-item cylinde-node"></div>
        <div class="node-item actor-node"></div>
        <div class="node-item arrow-node"></div>
      </div>
    </div>
  </div>
</template>

<script>
import IconCircle from './icon/Circle.vue'
import IconRect from './icon/Rect.vue'
import IconRectRadius from './icon/RectRadius.vue'
import IconActor from './icon/Actor.vue'
import IconCylinde from './icon/Cylinde.vue'
import IconDiamond from './icon/Diamond.vue'
import IconEllipse from './icon/Ellipse.vue'
import IconParallelogram from './icon/Parallelogram.vue'
import IconTable from './icon/Table.vue'
import IconText from './icon/Text.vue'
import IconTriangle from './icon/Triangle.vue'

export default {
  name: 'DiagramSidebar',
  methods: {
    dragInNode (type) {
      this.$emit('dragInNode', type)
    }
  },
  components: {
    IconCircle,
    IconRect,
    IconRectRadius,
    IconActor,
    IconCylinde,
    IconDiamond,
    IconEllipse,
    IconParallelogram,
    IconTable,
    IconText,
    IconTriangle
  }
}
</script>

<style scoped>
.diagram-sidebar {
  user-select: none;
}
.node-category-title {
  margin: 0;
  font-size: 14px;
  display: block;
  border-bottom: 1px solid #e5e5e5;
  line-height: 40px;
}
.node-item {
  width: 30px;
  height: 30px;
  margin-right: 5px;
  display: inline-block;
}
.node-category {
  border-bottom: 1px solid #e5e5e5;
}
.svg-node {
  left: 1px;
  top: 1px;
  width: 32px;
  height: 30px;
  display: block;
  position: relative;
  overflow: hidden;
}
</style>
