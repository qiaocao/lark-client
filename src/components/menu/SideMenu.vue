<template>
  <a-layout-sider
    :class="[
      'sider',
      theme,
      fixSiderbar ? 'ant-fixed-sidemenu' : null
    ]"
    :width="isTablet() ? '160px' : '184px' "
    :collapsible="collapsible"
    v-model="collapsed"
    :trigger="null"
    :collapsedWidth="64"
  >
    <div class="sider-layout">
      <div class="sider-layout-header">
        <logo />
      </div>

      <div class="sider-layout-content">
        <s-menu
          :collapsed="collapsed"
          :menu="menus"
          :theme="theme"
          :mode="mode"
          :unreadMsgCount="unreadMsgCount"
          @select="onSelect"
        ></s-menu>
      </div>
      <div class="sider-layout-footer">
        <user-menu
          :collapsed="collapsed"
          :menu="menus"
          :theme="theme"
          :mode="mode"
          @select="onSelect"
        ></user-menu>
      </div>
    </div>
  </a-layout-sider>
</template>

<script>
import ALayoutSider from 'ant-design-vue/es/layout/Sider'
import { mapGetters } from 'vuex'
import Logo from '../tools/Logo'
import SMenu from './index'
import { mixin, mixinDevice } from '@/utils/mixin.js'
import UserMenu from '../tools/UserMenu'

export default {
  name: 'SideMenu',
  components: { ALayoutSider, Logo, SMenu, UserMenu },
  mixins: [mixin, mixinDevice],
  props: {
    mode: {
      type: String,
      required: false,
      default: 'inline'
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    collapsible: {
      type: Boolean,
      required: false,
      default: false
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    menus: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapGetters(['unreadMsgCount'])
  },
  methods: {
    onSelect (obj) {
      this.$emit('menuSelect', obj)
    }
  }
}
</script>
<style lang="less" scoped>
  // 将侧边栏设置成上中下布局 -> flex -- jihainan
  .sider-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    &-header {
      height: auto;
    }
    &-content {
      overflow-y: auto;
      flex-grow: 1;
    }
    &-footer {
      height: auto;
    }
  }
</style>
