<template>
  <div class="user-wrapper">
    <!-- TODO:去掉s-menu组件，把通知单独做成一页 -->
    <s-menu
      :collapsed="collapsed"
      :menu="usermenu"
      :theme="theme"
      :mode="mode"
      @select="onSelect"
    ></s-menu>
    <!-- TODO:应该有更好的用户菜单展示的方式 -->
    <a-dropdown :trigger="['click']">
      <div class="user-style">
        <a-badge
          :status="statusMap.get(onlineState)"
          :offset="[-8, 24]"
          :numberStyle="{padding: '4px'}"
        >
          <!-- 用户头像 -->
          <a-avatar class="avatar-style" :src="avatarUrl">
            {{ nickname.slice(0,1) }}
          </a-avatar>
        </a-badge>
        <!-- 用户名 -->
        <div class="name-style">
          <ellipsis :length="12" tooltip :class="nameColor">{{ nickname }}</ellipsis>
        </div>
      </div>

      <a-menu
        slot="overlay"
        class="user-dropdown-menu-wrapper"
        :style="{'margin-left' : '20px'}"
      >
        <a-menu-item key="1">
          <router-link :to="{ name: 'Settings' }">
            <a-icon type="setting" />
            <span>账户设置</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="2">
          <router-link :to="{ name: 'Feedback' }">
            <a-icon type="question-circle" />
            <span>意见反馈</span>
          </router-link>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="3">
          <a href="javascript:;" @click="handleLogout">
            <a-icon type="logout" />
            <span>注销</span>
          </a>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>

</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Utils from '@/utils/utils.js'
import { ONLINE_STATUS, FILE_SERVER_IP } from '@/utils/constants'
import SMenu from '../menu/index'
import { Ellipsis } from '@/components'

export default {
  name: 'UserMenu',
  components: { SMenu, Ellipsis },
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
    menu: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      statusMap: new Map([
        [ONLINE_STATUS.LANDING, 'warning'],
        [ONLINE_STATUS.ONLINE, 'success'],
        [ONLINE_STATUS.EXITING, 'error'],
        [ONLINE_STATUS.OFFLINE, 'default']
      ]),
      usermenu: []
    }
  },
  computed: {
    ...mapGetters(['nickname', 'avatar', 'userPId']),
    onlineState () {
      return this.$store.state.talk.onlineState
    },
    avatarUrl () {
      return FILE_SERVER_IP + this.avatar
    },
    nameColor () {
      return 'name-color-' + this.theme
    }
  },
  created () {
    const managerPIds = ['2', '3', '4']
    const subMenu = this.menu.find(item => item.name === 'Dashboard').children
    this.usermenu = subMenu.filter(item => {
      if (managerPIds.indexOf(this.userPId) > -1) {
        return false
      } else {
        return item.name === 'MyNotice'
      }
    })
  },
  methods: {
    ...mapActions(['Logout']),
    handleLogout () {
      const that = this

      this.$confirm({
        title: '提示',
        content: '真的要下线吗 ?',
        onOk () {
          return that
            .Logout({})
            .then(() => {
              window.location.reload()
            })
            .catch(err => {
              that.$message.error({
                title: '错误',
                description: err.message
              })
            })
        },
        onCancel () {}
      })
    },
    messageFun () {
      Utils.$emit('message', 'msg')
      this.$router.push({ name: 'Workplace', params: { messageFlag: true } })
    },
    onSelect (obj) {
      this.$emit('menuSelect', obj)
    }
  }
}
</script>
<style lang="less" scoped>
.user-wrapper{
  display: flex;
  flex-direction: column;
  padding: 24px 0;

  .user-style {
    white-space: nowrap;
    overflow: hidden;
    margin-left: 18px;
    cursor: pointer;

    .avatar-style {
      background: #f49d2a;
      display: inline-block;
    }

    .name-style {
      display: inline-block;
      vertical-align: middle;
      margin-left: 16px;
      color: hsla(0, 0%, 100%, 0.651);
      // 深色背景时文字颜色
      .name-color-dark {
        color: hsla(0, 0%, 100%, 0.651);
      }
      // 浅色背景时文字颜色
      .name-color-light {
        color: hsla(0, 0%, 0%, 0.651)
      }
    }
  }
}
</style>
