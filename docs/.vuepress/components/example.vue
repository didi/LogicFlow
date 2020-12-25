<template>
  <iframe :width="width" :height="height" :src="iframeLink"></iframe>
</template>

<script>
  export default {
    props: {
      href: {
        type: String
      },
      width: {
        type: String | Number,
        default: '100%'
      },
      height: {
        type: Number,
        default: 600
      }
    },
    data() {
      return {
        iframeLink: ''
      }
    },
    computed: {
      iframeHeight() {
        if (this.height) {
          return 600
        }
        return 600
      }
    },
    mounted() {
      const { base } = this.$router.options;
      let host = ''
      if (process.env.NODE_ENV === 'development') {
        host = 'http://localhost:3000'
      }
      if (this.href) {
        this.iframeLink = host + base.slice(0, -1) + this.href;
      } else {
        this.iframeLink = host + location.pathname.replace('guide', 'examples/#').replace('.html', '')
      }
    }
  }
</script>
<style scoped>
iframe {
  border: none;
  outline: none;
}
</style>