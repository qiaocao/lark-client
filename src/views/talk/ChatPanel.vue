<template>
  <a-layout class="talk-layout">
    <a-layout-sider class="talk-layout-sider">
      <div class="search-bar">

        <SearchAll :inputStyle="{height: '31px', width: '200px'}" @showDetail="showSearchDetail" />

        <a-dropdown placement="bottomLeft">
          <a-button class="add-group-btn" icon="plus" size="small" />
          <a-menu slot="overlay">
            <a-menu-item key="talk" @click="startTalk" :disabled="crtTalkAuth.disable" :title="crtTalkAuth.title">
              <a-icon type="message" />发起研讨
            </a-menu-item>
            <a-menu-item key="meeting" @click="startMeet">
              <a-icon type="coffee" />发起会议
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>

      <a-tabs
        :activeKey="activeKey"
        @change="changePane"
        :tabBarGutter="10"
        :tabBarStyle="{ margin: '0 20px' }"
        animated
      >
        <!-- 最近联系人页 -->
        <a-tab-pane key="1" forceRender>
          <span slot="tab">
            <a-tooltip placement="top" title="最近" :overlayStyle="tabOverLayStyle">
              <a-icon type="clock-circle" style="fontSize: 18px" />
            </a-tooltip>
          </span>
          <div class="recent-contacts-container tab-content-container">
            <div v-for="(item, index) in recentContacts" :key="index" @click="showConvBox(item)">
              <RecentContactsItem :contactsInfo="item" :activated="item.id === activeChat" />
            </div>

            <!-- 没有最新联系人或者联系人加载失败时的提示信息 -->
            <div v-if="!recentContacts || !recentContacts.length" class="empty-tips">
              <p>
                暂无聊天信息，
                <a-button
                  type="primary"
                  ghost
                  size="small"
                  :loading="recentLoading"
                  @click="getRecentContacts"
                >重新加载</a-button>
              </p>
            </div>
          </div>
        </a-tab-pane>

        <!-- 群组列表页 -->
        <a-tab-pane key="2" forceRender>
          <span slot="tab">
            <a-tooltip placement="top" title="群组" :overlayStyle="tabOverLayStyle">
              <a-icon type="team" style="fontSize: 18px" />
            </a-tooltip>
          </span>

          <div class="group-contacts-container tab-content-container">
            <div v-for="(item, index) in groupList" :key="index" @click="showGroup(item)">
              <GroupItem :groupInfo="item" :activated="item.groupId === activeGroup" />
            </div>

            <!-- 没有群组或者群组加载失败时的提示信息 -->
            <div v-if="!groupList || !groupList.length" class="empty-tips">
              <p>
                暂无群组信息，
                <a-button
                  type="primary"
                  ghost
                  size="small"
                  :loading="groupLoading"
                  @click="getGroupList"
                >重新加载</a-button>
              </p>
            </div>
          </div>
        </a-tab-pane>

        <!-- 联系人页 -->
        <a-tab-pane key="3" >
          <span slot="tab">
            <a-tooltip placement="top" title="联系人" :overlayStyle="tabOverLayStyle">
              <a-icon type="user" style="fontSize: 18px" />
            </a-tooltip>
          </span>

          <div class="contacts-container tab-content-container">
            <contacts-tree
              :contactsTree="contactsTree"
              @SelectContacts="showContacts"
              style="paddingLeft: 18px;"
            />

            <!-- 获取联系人树失败时的提示信息 -->
            <div v-if="!contactsTree || !contactsTree.length" class="empty-tips">
              <p>
                加载失败，
                <a-button
                  type="primary"
                  ghost
                  size="small"
                  :loading="contactsLoading"
                  @click="getContactsTree"
                >重新加载</a-button>
              </p>
            </div>
          </div>
        </a-tab-pane>

        <!-- 会议列表页 -->
        <a-tab-pane key="4">
          <span slot="tab">
            <a-tooltip placement="top" title="会议" :overlayStyle="tabOverLayStyle">
              <a-icon type="coffee" style="fontSize: 18px" />
            </a-tooltip>
          </span>

          <div class="contacts-container tab-content-container">
            <MeetingList />
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-layout-sider>

    <a-layout class="talk-layout-content">
      <div v-show="activeKey == '1'" class="chat-area">
        <keep-alive>
          <router-view />
        </keep-alive>
      </div>
      <div v-show="activeKey == '2'" class="info-area">
        <GroupInfo :selected="activeGroup" @clickSend="handleClickSend" />
      </div>

      <div v-show="activeKey == '3'" class="info-area">
        <ContactsInfo :selected="activeContacts" @clickSend="handleClickSend" />
      </div>
      <!-- 使用v-if减少研讨页面初始渲染压力 -->
      <div v-if="activeKey == '4'" class="info-area">
        <MeetingRoom />
      </div>
    </a-layout>

    <!-- 创建新的研讨模态框 -->
    <CreateTalk :showTModal="showTalkModal" @toTalk="handleClickSend" />
    <CreateMeeting :showMModal.sync="showMeetModal" />
  </a-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  ContactsTree,
  ContactsInfo,
  GroupInfo,
  RecentContactsItem,
  GroupItem,
  CreateTalk,
  SearchAll
} from '@/components/Talk'
import {
  MeetingList,
  MeetingRoom,
  CreateMeeting
} from '@/components/Talk/meeting'
import { ONLINE_STATUS } from '@/utils/constants'

export default {
  name: 'ChatPanel',
  components: {
    ContactsTree,
    ContactsInfo,
    GroupInfo,
    RecentContactsItem,
    GroupItem,
    CreateTalk,
    SearchAll,
    // 会议相关
    MeetingList,
    MeetingRoom,
    CreateMeeting
  },
  data () {
    return {
      // 当前选中的标签页
      activeKey: '1',
      // 是否显示创建研讨的模态框
      showTalkModal: () => false,
      // 是否展示创建会议的模态框
      showMeetModal: false,

      // 记录当前选中的联系人/群组信息
      activeContacts: '',
      activeGroup: '',

      // 加载状态
      recentLoading: false,
      groupLoading: false,
      contactsLoading: false,

      tabOverLayStyle: { fontSize: '12px' }
    }
  },
  computed: {
    ...mapGetters([
      'recentContacts',
      'groupList',
      'contactsTree',
      'onlineState',
      'positions'
    ]),
    // 当前激活的研讨ID
    activeChat () {
      return this.$store.getters.currentTalk.id
    },
    // 禁用创建群组按钮
    crtTalkAuth () {
      const crtTalkAuth = {
        disable: false,
        title: ''
      }
      if (!this.canCreateTalk()) {
        crtTalkAuth.disable = true
        crtTalkAuth.title = '无法创建群组'
      }
      return crtTalkAuth
    }
  },
  methods: {
    handleClickSend () {
      this.activeKey = '1'
    },
    /* 切换面板 */
    changePane (activeKey) {
      this.activeKey = activeKey
    },
    /** 发起研讨 */
    startTalk () {
      this.showTalkModal = () => true
    },
    /** 发起会议 */
    startMeet () {
      this.showMeetModal = true
    },
    handleSaveClose () {},
    /**
     * 展示研讨对话框
     * @param {RecentContact} selectedItem 当前研讨
     */
    showConvBox (selectedItem) {
      this.$store.commit('SET_CURRENT_TALK', selectedItem.id)
      this.$store.dispatch(
        'UpdateRecentContacts',
        { ...selectedItem, reOrder: false, addUnread: false }
      )
    },
    /** 展示群组详细信息 */
    showGroup (group) {
      this.activeGroup = group.groupId
    },
    /** 展示联系人详细信息 */
    showContacts (key) {
      this.activeContacts = key
    },
    /** 加载群组列表 */
    getGroupList () {
      this.groupLoading = true
      this.$store.dispatch('GetGroupList').finally(() => {
        this.groupLoading = false
      })
    },
    /** 加载联系人树 */
    getContactsTree () {
      this.contactsLoading = true
      this.$store.dispatch('GetContactsTree').finally(() => {
        this.contactsLoading = false
      })
    },
    /** 获取最近联系列表 */
    getRecentContacts () {
      this.recentLoading = true
      this.$store.dispatch('GetRecentContacts').finally(() => {
        this.recentLoading = false
      })
    },
    showSearchDetail (item, isGroup) {
      if (isGroup) {
        this.activeKey = '2'
        this.activeGroup = item.groupId
      } else {
        this.activeKey = '3'
        this.activeContacts = item.id
      }
    },
    /**
     * 判断能否创建群组
     */
    canCreateTalk () {
      if (this.onlineState !== ONLINE_STATUS.ONLINE ||
        this.positions.join().search(/[012]/g) < 0) {
        return false
      } else {
        return true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.talk-layout {
  // height: calc(100vh - 64px);
  overflow-y: hidden;
}

.talk-layout-sider {
  // 覆盖默认样式
  max-width: 280px !important;
  flex: 0 0 280px !important;

  background-color: #ebeff5;
  border-right: 1px solid #dcdee0;

  // 聊天搜索栏样式 该部分高度为48px
  .search-bar {
    display: flex;
    margin: 16px 19px 8px;
    .add-group-btn {
      margin-left: 10px;
      // width: 31px;
      height: 31px;
      background-color: #d3d6dc;
      color: #7c7a7a;
      font-size: 18px;
    }
  }

  // 调整tabs标签样式
  .ant-tabs-nav .ant-tabs-tab .anticon {
    margin-right: 0px;
  }

  // 最近消息标签页样式
  .recent-contacts-container {
    flex: 1;
    display: flex;
    position: relative;
    flex-direction: column;
    border-top: 1px solid #ebebeb;
  }

  // 群组标签页样式
  // .group-contacts-container {
  // }

  // 联系人标签页样式
  // .contacts-container {
  // }

  // 让最近 群组 联系人tab页的内容可以滚动的样式
  .tab-content-container {
    overflow: hidden;

    // 视窗高度-搜索框高度-tab页高度-titleBar高度
    height: calc(100vh -  79px - 22px);

    &:hover {
      overflow-y: overlay;
    }
  }

  // 加载失败或列表为空的提示信息样式
  .empty-tips {
    text-align: center;
    padding: 32px;
  }
}

.talk-layout-content {
  overflow: hidden;
  z-index: 8;
  background-color: rgb(242, 243, 245);
  .chat-area,
  .info-area {
    height: 100%;
  }
}
.affix-block{
  z-index: 99;
}
</style>
