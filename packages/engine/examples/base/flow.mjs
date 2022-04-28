import { ButtonBindLogic, updateLogicData } from './data.mjs';
import FetchData from './nodes/FetchData.mjs';
import LoadingDialog from './nodes/LoadingDialog.mjs';
import LogicButtonClick from './nodes/LogicButtonClick.mjs';
import LogicDialogOpen from './nodes/LogicDialogOpen.mjs';
import RenderTable from './nodes/RenderTable.mjs';
import TipsDialog from './nodes/TipsDialog.mjs';
import LogicLine from './nodes/LogicLine.mjs';

const vm = new Vue({
  el: '#flow',
  data: function() {
    return {
      visible: false,
    }
  },
  methods: {
    openFlow() {
      this.visible = true
      this.$nextTick(() => {
        const lf = new LogicFlow({
          container: document.querySelector('#flowContainer'),
          grid: true,
          keyboard: {
            enabled: true
          },
        })
        lf.register(FetchData)
        lf.register(LoadingDialog)
        lf.register(LogicButtonClick)
        lf.register(LogicDialogOpen)
        lf.register(RenderTable)
        lf.register(TipsDialog)
        lf.register(LogicLine)
        lf.render(ButtonBindLogic)
        lf.setDefaultEdgeType('LogicLine');
        this.lf = lf;
      })
    },
    updateGraph() {
      const data = this.lf.getGraphData();
      data.properties = {
        startNode: data.nodes[0].id
      }
      console.log(data);
      updateLogicData(data)
    }
  }
})