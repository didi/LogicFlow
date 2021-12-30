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
        <div class="node-item" @mousedown="dragInNode('pro-ellipse')">
          <icon-ellipse class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('pro-diamond')">
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
        <div class="node-item" @mousedown="dragInNode('left-arrow')">
          <icon-left-arrow class="svg-node"/>
        </div>
        <div class="node-item" @mousedown="dragInNode('right-arrow')">
          <icon-right-arrow class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('horizontal-arrow')">
          <icon-horizontal-arrow class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('up-arrow')">
          <icon-up-arrow class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('down-arrow')">
          <icon-down-arrow class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('vertical-arrow')">
          <icon-vertical-arrow class="svg-node" />
        </div>
        <!-- <div class="node-item" @mousedown="dragInNode('star')">
          star
        </div> -->
        <div class="node-item" @mousedown="dragInNode('pentagon')">
          <icon-pentagon class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('hexagon')">
          <icon-hexagon class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('septagon')">
          <icon-septagon class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('heptagon')">
          <icon-heptagon class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('trapezoid')">
          <icon-trapezoid class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('cross')">
          <icon-cross class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('minus')">
          <icon-minus class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('times')">
          <icon-times class="svg-node" />
        </div>
        <div class="node-item" @mousedown="dragInNode('divide')">
          <icon-divide class="svg-node" />
        </div>
      </div>
    </div>
    <div>
      <h1 class="node-category-title">图片</h1>
      <div class="image-node image-setting" @mousedown="dragInNode('image-setting')">
      </div>
      <div class="image-node image-user" @mousedown="dragInNode('image-user')">
      </div>
      <div class="image-node image-cloud" @mousedown="dragInNode('image-cloud')">
      </div>
    </div>
    <div>
      <h1 class="node-category-title">ICON</h1>
      <div class="icon-node icon-message" @mousedown="dragInNode('icon-message')">
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
import IconText from './icon/Text.vue'
import IconTriangle from './icon/Triangle.vue'
import IconLeftArrow from './icon/LeftArrow.vue'
import IconRightArrow from './icon/RightArrow.vue'
import IconHorizontalArrow from './icon/HorizontalArrow.vue'
import IconUpArrow from './icon/UpArrow.vue'
import IconDownArrow from './icon/DownArrow.vue'
import IconVerticalArrow from './icon/VerticalArrow.vue'
import IconPentagon from './icon/Pentagon.vue'
import IconHexagon from './icon/Hexagon.vue'
import IconSeptagon from './icon/Septagon.vue'
import IconHeptagon from './icon/Heptagon.vue'
import IconTrapezoid from './icon/Trapezoid.vue'
import IconCross from './icon/Cross.vue'
import IconMinus from './icon/Minus.vue'
import IconTimes from './icon/Times.vue'
import IconDivide from './icon/Divide.vue'

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
    IconText,
    IconTriangle,
    IconRightArrow,
    IconLeftArrow,
    IconHorizontalArrow,
    IconUpArrow,
    IconDownArrow,
    IconVerticalArrow,
    IconPentagon,
    IconHexagon,
    IconSeptagon,
    IconHeptagon,
    IconTrapezoid,
    IconCross,
    IconMinus,
    IconTimes,
    IconDivide
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
  line-height: 30px;
  margin-bottom: 10px;
}
.node-item {
  width: 35px;
  height: 35px;
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
.image-node, .icon-node {
  display: inline-block;
  width: 30px;
  height: 30px;
  margin: 10px;
  cursor: pointer;
}
.image-setting {
  background: url('https://dpubstatic.udache.com/static/dpubimg/UzI4AFUcfO/setting.png');
  background-size: cover;
}
.image-user {
  width: 40px;
  background: url('https://dpubstatic.udache.com/static/dpubimg/-6Fd2uIoJ-/user.png');
  background-size: cover;
}
.image-cloud {
  width: 40px;
  background: url('https://dpubstatic.udache.com/static/dpubimg/0oqFX1nvbD/cloud.png');
  background-size: cover;
}
.icon-message {
  height: 20px;
  background: url('https://dpubstatic.udache.com/static/dpubimg/1TZgBoaq8G/message.png');
  background-size: cover;
}
</style>
