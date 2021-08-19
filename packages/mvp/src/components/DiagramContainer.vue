<template>
  <div class="diagram-container" ref="container">
    <div class="diagram-wrapper" :style="{ width: this.diagramWidth + 400 + 'px' }">
      <div class="diagram" ref="diagram" :style="{ width: this.diagramWidth + 'px', height: this.diagramHeight + 'px' }"></div>
    </div>
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'

export default {
  data () {
    return {
      diagramWidth: 0,
      diagramHeight: 0
    }
  },
  mounted () {
    this.diagramWidth = this.$refs.container.clientWidth - 200
    this.diagramHeight = this.$refs.container.clientHeight - 100
    this.$nextTick(() => {
      this.$refs.container.scrollTo(100, 50)
    })
    this.$_initLogicFlow()
  },
  methods: {
    $_initLogicFlow () {
      const lf = new LogicFlow({
        container: this.$refs.diagram,
        width: this.diagramWidth,
        height: this.diagramHeight,
        stopZoomGraph: true,
        stopScrollGraph: true,
        background: {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QwZDBkMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDBkMGQwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=',
          repeat: 'repeat'
        }
      })
      lf.render()
    }
  }
}
</script>

<style scoped>
@import '~@logicflow/core/dist/style/index.css';

.diagram-container {
  overflow: scroll;
}
.diagram-wrapper {
  padding: 100px 200px;
  box-sizing: border-box;
}
.diagram {
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
