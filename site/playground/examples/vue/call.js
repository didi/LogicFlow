const template = `<div class="call-wrapper">
  <ul>
    <li>{{name}}</li>
    <li>hello</li>
    <input type="text" @blur="change" v-model="p.name"/>
  </ul>
</div>`

export default Vue.component('call', {
  template,
  props: {
    name: String,
  },
  data() {
    return {
      p: {
        name: '',
      }
    }
  },
  methods: {
    change() {
      console.log(555, this.p)
      this.$emit('change-name', this.p)
    }
  },
});
