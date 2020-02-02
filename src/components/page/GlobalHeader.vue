<template>
  <a-layout-header
    v-if="!headerBarFixed"
    :class="[fixedHeader && 'ant-header-fixedHeader', widthCalculate() ]"
    :style="{ padding: '0' }"
  >
    <div v-if="mode === 'sidemenu'" class="header">
      <!-- 侧边栏切换按钮 -->
      <!-- <a-icon
        v-if="deviceType==='mobile'"
        class="trigger"
        :type="collapsed ? 'menu-fold' : 'menu-unfold'"
        @click="toggle"></a-icon>
      <a-icon
        v-else
        class="trigger"
        :type="collapsed ? 'menu-unfold' : 'menu-fold'"
      @click="toggle"/>-->
      <!-- 窗口右上角功能区域 -->
    </div>
    <div v-else :class="['top-nav-header-index', theme]">
      <div class="header-index-wide">
        <div class="header-index-left">
          <logo class="top-nav-header" :show-title="deviceType !== 'mobile'" />
          <s-menu v-if="deviceType !== 'mobile'" mode="horizontal" :menu="menus" :theme="theme"></s-menu>
          <a-icon
            v-else
            class="trigger"
            :type="collapsed ? 'menu-fold' : 'menu-unfold'"
            @click="toggle"
          ></a-icon>
        </div>
        <div class="tools-wrapper">
        </div>
      </div>
    </div>
  </a-layout-header>
</template>

<script>
import SMenu from '../menu/'
import Logo from '../tools/Logo'

import { mixin, mixinDevice } from '@/utils/mixin.js'

export default {
  name: 'GlobalHeader',
  components: {
    SMenu,
    Logo
  },
  mixins: [mixin, mixinDevice],
  props: {
    mode: {
      type: String,
      // sidemenu, topmenu
      default: 'sidemenu'
    },
    menus: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    deviceType: {
      type: String,
      required: false,
      default: 'desktop'
    }
  },
  data () {
    return {
      headerBarFixed: false
    }
  },
  computed: {
  },
  mounted () {
    window.addEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll () {
      if (this.autoHideHeader) {
        const scrollTop =
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop
        if (scrollTop > 100) {
          this.headerBarFixed = true
        } else {
          this.headerBarFixed = false
        }
      } else {
        this.headerBarFixed = false
      }
    },
    toggle () {
      this.$emit('toggle')
    },
    // 动态计算头部宽度
    widthCalculate () {
      if (this.sidebarOpened) {
        if (this.isDesktop()) {
          return 'ant-header-side-desktop-opened'
        }
        if (this.isTablet()) {
          return 'ant-header-side-tablet-opened'
        }
      } else {
        return 'ant-header-side-closed'
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
