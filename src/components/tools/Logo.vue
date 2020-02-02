<template>
  <div class="logo">
    <!-- <router-link :to="{name:'dashboard'}"> -->
    <LogoSvg alt="logo" />
    <h1 v-if="showTitle">{{ title }}</h1>
    <!-- </router-link> -->
  </div>
</template>

<script>
import LogoSvg from '@/assets/logo-bolb.svg?inline'

export default {
  name: 'Logo',
  components: {
    LogoSvg
  },
  props: {
    title: {
      type: String,
      default: '云雀协同',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  }
}
</script>

<style lang="less" scoped>
</style>
