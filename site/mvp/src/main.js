import Vue from 'vue'
import { Popover, Select, Option } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'

Vue.component(Popover.name, Popover)
Vue.component(Select.name, Select)
Vue.component(Option.name, Option)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
