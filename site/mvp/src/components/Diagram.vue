<template>
  <div class="diagram">
    <diagram-toolbar
      class="diagram-toolbar"
      @changeNodeFillColor="$_changeNodeFill"
    />
    <diagram-sidebar class="diagram-sidebar" @dragInNode="$_dragInNode" :style="{ width: sidebarWidth + 'px'}"/>
    <div class="diagram-container" ref="container" :style="{ left: sidebarWidth + 'px'}">
      <div class="diagram-wrapper" :style="{ width: this.diagramWidth + 'px' }">
        <div class="lf-diagram" ref="diagram" :style="{ width: this.diagramWidth + 'px', height: this.diagramHeight + 'px' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/style/index.css'
import DiagramToolbar from './DiagramToolbar.vue'
import DiagramSidebar from './DiagramSidebar.vue'
import BaseNode from './node/BaseNode'
import CircleNode from './node/CircleNode'
// const LogicFlow = window.LogicFlow

export default {
  name: 'Diagram',
  data () {
    return {
      sidebarWidth: 200,
      diagramWidth: 0,
      diagramHeight: 0
    }
  },
  mounted () {
    this.diagramWidth = this.$refs.container.clientWidth
    this.diagramHeight = this.$refs.container.clientHeight
    this.initLogicFlow()
  },
  methods: {
    initLogicFlow () {
      const lf = new LogicFlow({
        container: this.$refs.diagram,
        width: this.diagramWidth,
        height: this.diagramHeight,
        background: {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QwZDBkMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDBkMGQwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=',
          repeat: 'repeat'
        }
      })
      lf.register(BaseNode)
      lf.register(CircleNode)
      lf.render()
      this.lf = lf
    },
    $_dragInNode (type) {
      this.lf.dnd.startDrag({
        type
      })
    },
    $_changeNodeFill (color) {
      const { nodes } = this.lf.graphModel.getSelectElements()
      nodes.forEach(({ id }) => {
        this.lf.setProperties(id, {
          fill: color
        })
      })
    }
  },
  components: {
    DiagramToolbar,
    DiagramSidebar
  }
}
</script>

<style scoped>

.diagram {
  width: 100%;
  height: 100%;
}
.diagram * {
  box-sizing: border-box;
}
.diagram-toolbar {
  height: 40px;
  border-bottom: 1px solid #dadce0;
}
.diagram-sidebar {
  height: calc(100% - 40px);
  border-right: 1px solid #dadce0;
}
.diagram-container {
  position: absolute;
  top: 40px;
  right: 0;
  bottom: 0;
  overflow: scroll;
}

/* .diagram-wrapper {
  padding: 100px 200px;
  box-sizing: border-box;
} */
.lf-diagram {
  box-shadow: 0px 0px 4px #838284;
}
::-webkit-scrollbar {
  width: 9px;
  height: 9px;
  background: white;
  border-left: 1px solid #e8e8e8;
}
::-webkit-scrollbar-thumb {
  border-width: 1px;
  border-style: solid;
  border-color: #fff;
  border-radius: 6px;
  background: #c9c9c9;
}
::-webkit-scrollbar-thumb:hover {
  background: #b5b5b5;
}
</style>
