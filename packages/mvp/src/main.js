import Vue from 'vue'
import { Popover } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'

Vue.component(Popover.name, Popover)
// Vue.component(Select.name, Select);

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
