import { ButtonBindLogic, buttonClickLu } from './index.mjs'

new Vue({
  el: '#app',
  data: function() {
    return { visible: false }
  },
  mounted() {
    this.ButtonBindLogic = ButtonBindLogic
    const engine = new Engine()
    engine.batchRegisterLu([
      {
        type: 'LogicButtonClick',
        lu: buttonClickLu
      },
    ])
    this.engine = engine
  },
  methods: {
    geSetting() {
      console.log(44);
      this.engine.run(this.ButtonBindLogic);
    }
  }
})