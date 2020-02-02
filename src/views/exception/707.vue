<template>
  <exception-page type="707">
    <template slot="option">
      <a-button type="primary" @click="handleDownLoadClient">下载客户端</a-button>
    </template>
  </exception-page>
</template>

<script>
import ExceptionPage from './ExceptionPage'

export default {
  components: {
    ExceptionPage
  },
  methods: {
    handleDownLoadClient () {
      console.log('下载客户端')
    }
  }
}
</script>

<style scoped>

</style>
