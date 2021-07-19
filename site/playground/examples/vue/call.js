const template = `<div class="call-wrapper">
  <ul>
    <li>{{name}}</li>
    <li>hello</li>
    <input type="text" @blur="change" v-model="pname"/>
  </ul>
</div>`

export default Vue.component('call', {
  template,
  props: {
    name: {
      type: String,
      default: 'logicflow'
    },
  },
  data() {
    return {
      pname: ''
    }
  },
  methods: {
    change() {
      this.$emit('change-name', this.pname)
    }
  },
});
