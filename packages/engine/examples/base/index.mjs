import {
  getLogicData,
} from './data.mjs'

const vm = new Vue({
  el: '#app',
  data: function() {
    return {
      visible: false,
      isLoading: false,
      tableData: []
    }
  },
  mounted() {
    const engine = new Engine()
    engine.batchRegisterLu([
      {
        type: 'LogicButtonClick',
        lu: this.buttonClickLu
      },
      {
        type: 'LogicDialogOpen',
        lu: this.DialogShowLu
      },
      {
        type: 'LoadingDialog',
        lu: this.LoadingLu
      },
      {
        type: 'TipsDialog',
        lu: this.TipLu
      },
      {
        type: 'FetchData',
        lu: this.fetchDataLu
      },
      {
        type: 'RenderTable',
        lu: this.renderTableLu
      }
    ])
    this.engine = engine
  },
  methods: {
    geSetting() {
      this.ButtonBindLogic = getLogicData()
      this.engine.run(this.ButtonBindLogic, 'LogicButtonClick');
    },
    buttonClickLu(instance) {
      instance.next()
    },
    LoadingLu(instance, data) {
      if (data.properties.action === 'show') {
        this.loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      } else {
        this.loading && this.loading.close()
      }
      instance.next()
    },
    DialogShowLu(instance) {
      this.visible = true;
      this.instance = instance;
    },
    TipLu(instance, data) {
      this.$message({
        message: data.properties.tip,
        type: data.properties.type
      });
      instance.next()
    },
    fetchDataLu(instance) {
      fetch('https://api.github.com/orgs/logic-flow/repos')
      .then((res) => res.json())
      .then(data => {
        instance.setFlowData('fetchData1', data)
        instance.next()
      })
    },
    renderTableLu(instance) {
      const tableData = instance.getFlowData('fetchData1')
      this.tableData = tableData;
      instance.next();
    },
    dialogCancel() {
      this.instance.next('cancel');
      this.visible = false;
    },
    dialogSure() {
      this.instance.next('default');
      this.visible = false;
    }
  }
})

// console.log(vm);