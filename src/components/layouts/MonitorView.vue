<template>
  <div class="main-content">
    <!-- keep-alive  -->
    <route-view></route-view>
  </div>
</template>

<script>
import RouteView from './RouteView'

export default {
  name: 'MonitorContent',
  components: {
    RouteView
  }
}
</script>

<style lang="less" scoped>

.main-content{
    margin: 0;
    height: 100vh;
    overflow-y: overlay;
    overflow-x: hidden;
}
</style>
