<template>
  <a-layout v-if="Object.keys(chatInfo).length" class="conv-box">
    <DragUpload
      @success="handleUpload"
      :secretList="sendSecretList"
      v-if="allowFile"
    />
    <!-- 聊天设置选项的抽屉组件 -->
    <talk-drawer
      :activeOption="activeOption"
      @closeDrawer="triggerDrawer"
    />
    <a-layout-header
      class="conv-box-header"
      :style="{backgroundImage: windowType === 3 ?
        'linear-gradient( #55abfc, #e1ebf7)' : ''}"
    >
      <div class="conv-title">
        <!-- 需要对名字的字数做限制 -->
        <span>{{ chatInfo.name }}</span>
        <!-- 若为群组时显示成员数量 -->
        <span v-show="chatInfo.isGroup">( {{ chatInfo.memberNum }} )</span>
        <!-- 显示密级 -->
        <span :class="'s-' + chatInfo.secretLevel">
          【{{ chatInfo.secretLevel | fileSecret }}】
        </span>
      </div>
      <div class="conv-option">
        <div>
          <!-- 需要判断是否为群聊，操作选项不同 -->
          <a-tooltip
            v-for="(item, index) in optionFilter(chatInfo.isGroup)"
            :key="index"
            placement="bottomRight"
            arrowPointAtCenter
            :overlayStyle="{fontSize: '12px'}"
          >
            <template slot="title">
              <span>{{ item.message }}</span>
            </template>
            <a-icon
              @click="triggerDrawer(item.name, item.message)"
              style="marginLeft: 20px"
              :type="item.type"
            />
          </a-tooltip>
        </div>
      </div>
    </a-layout-header>

    <!-- 状态插槽 -->
    <slot name="statusBar"></slot>

    <a-layout-content class="conv-box-message">
      <div class="talk-main-box">
        <div v-if="messageList.length" class="talk-main">
          <div v-if="windowType === 1" class="view-history">
            <a-tag
              color="#f0f2f5"
              @click="triggerDrawer('talkHistory', '聊天历史')"
              style="color: #b2b2b2"
            >
              <a-icon type="clock-circle" /> 历史消息
            </a-tag>
          </div>
          <div
            v-for="(item, index) in messageList"
            :key="index"
            class="talk-item"
          >
            <message-piece
              :messageInfo="item"
              :isTimeVisible="timeVisibleSet.has(index)"
              @imgLoaded="scrollToBottom"
            />
          </div>
        </div>

        <div v-else class="talk-main">
          <p class="empty-tip">暂时没有消息</p>
        </div>
      </div>
    </a-layout-content>

    <a-layout-footer class="conv-box-editor">
      <div class="editor-option">
        <!-- 文字编辑选项 -->
        <div>
          <a-tooltip
            title="表情"
            placement="top"
            :overlayStyle="{fontSize: '12px'}"
          >
            <a-popover
              placement="topLeft"
              v-model="faceVisible"
              trigger="click"
              overlayClassName="emojis-picker"
            >
              <template slot="content">
                <Face @insertFace="insertFace" />
              </template>
              <a-icon style="marginRight: 20px" type="smile" />
            </a-popover>
          </a-tooltip>
        </div>

        <div v-if="allowFile">
          <!-- 上传文件 -->
          <a-dropdown placement="topLeft">
            <a-icon
              :style="{
                fontSize: '20px',
                color: Object.keys(fileUpload).length ? '#00000033' : ''
              }"
              type="folder"
            />
            <a-menu slot="overlay">
              <a-menu-item v-for="item in sendSecretList" :key="item">
                <file-upload @success="handleUpload" :secretLevel="item">
                  <span
                    :class="'s-' + item"
                    @click="handleSendSecretLevel(item)"
                  >【{{ item | fileSecret }}】</span>
                </file-upload>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>

      </div>
      <div class="editor-area">
        <div class="draft-input">
          <!-- 输入框 -->
          <textarea
            v-show="!Object.keys(fileUpload).length"
            size="large"
            class="textarea-input"
            v-model="messageContent"
            @keydown.enter.stop.prevent.exact
            @keyup.enter.stop.prevent.exact="sendMessage(sendSecretLevel)"
            @keyup.alt.enter.exact="messageContent += '\n'"
            @keyup.ctrl.enter.exact="messageContent += '\n'"
          />
          <!-- 上传成功的文件 -->
          <div v-show="Object.keys(fileUpload).length" class="upload-display">
            <a-card
              class="file-card"
              :bodyStyle="{
                lineHeight: '30px',
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis'
              }"
            >
              <a-icon
                type="paper-clip"
                style="fontSize: 20px;
                marginRight: 10px;"
              />
              <a-tooltip :title="fileUpload.fileName+'.'+fileUpload.fileExt">
                <span>{{ fileUpload.fileName+'.'+fileUpload.fileExt }}</span>
              </a-tooltip>

              <a-tooltip placement="top" title="删除">
                <a-icon
                  type="close"
                  @click="removeFile"
                  style="position: absolute;top: 5px; right: 5px;
                  font-size: 11px; cursor: pointer;"
                />
              </a-tooltip>
            </a-card>
          </div>
        </div>
      </div>
      <!-- 发送键 -->
      <div class="send-toolbar">
        <div style="marginLeft: auto">
          <!-- 发送键 -->
          <a-radio-group v-model="sendSecretLevel">
            <template v-for="item in sendSecretList">
              <a-radio
                :value="item"
                :key="item"
                @click="handleSendSecretLevel(item)"
              >
                <span :class="'s-' + item">【{{ item | fileSecret }}】</span>
              </a-radio>
            </template>
          </a-radio-group>
          <a-button
            type="primary"
            @click="sendMessage(sendSecretLevel)"
            :disabled="sendDisabled"
          >发送
            <span :class="'s-' + sendSecretLevel">
              【{{ sendSecretLevel | fileSecret }}】
            </span>
          </a-button>
        </div>
      </div>
    </a-layout-footer>
  </a-layout>

  <a-layout v-else style="height: 100%; textAlign: center;">
    <div class="unselected-tip">
      <a-icon type="message" style="fontSize: 140px; color: #d7d9db" />
    </div>
  </a-layout>
</template>

<script>
import {
  MessagePiece,
  Face,
  TalkDrawer
} from '@/components/Talk'
import FileUpload from '@/components/file/FileUpload'
import DragUpload from '@/components/file/DragUpload'
import { ONLINE_STATUS } from '@/utils/constants'
import { SocketMessage, Tweet } from '@/utils/talk'
import { mapGetters } from 'vuex'
// 生成随机uuid
import uuidv4 from 'uuid/v4'
import Watermark from '@/utils/waterMark'

export default {
  name: 'ConvBox',
  components: {
    MessagePiece,
    Face,
    TalkDrawer,
    FileUpload,
    DragUpload
  },
  props: {
    /** 聊天窗口类型（研讨1、弹框2、会议3等） */
    windowType: {
      type: Number,
      default: 1,
      required: false
    },
    /** 允许发送消息，默认为true */
    allowSend: {
      type: Boolean,
      default: true,
      required: false
    },
    /** 消息列表 */
    messageList: {
      type: Array,
      default: () => ([]),
      required: true
    },
    /** 当前联系人/对话信息 */
    chatInfo: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },
  data () {
    return {
      // 被激活的抽屉
      activeOption: {},
      // 所有被at用的id
      atId: [],
      // 消息类型
      messageType: 1,
      // 输入框内容
      messageContent: '',
      // 发送消息的密级，默认为非密
      sendSecretLevel: 30,
      // 发送键的可选密级选项
      sendSecretList: [],
      // 控制表情选择框不自动关闭
      faceVisible: false,
      // 上传的文件
      fileUpload: {},

      imgFormat: ['jpg', 'jpeg', 'png', 'gif'],
      fileFormat: [
        'doc',
        'docx',
        'jpg',
        'jpeg',
        'png',
        'gif',
        'xls',
        'xlsx',
        'pdf',
        'gif',
        'exe',
        'msi',
        'swf',
        'sql',
        'apk',
        'psd'
      ],
      // 显示时间的消息集合
      timeVisibleSet: new Set()
    }
  },
  activated () {
    this.scrollToBottom()
  },
  computed: {
    ...mapGetters([
      'onlineState',
      'userSecretLevel',
      'userId',
      'avatar',
      'nickname',
      'token']),
    // 发送按钮的可用状态
    sendDisabled () {
      const allow = this.onlineState === ONLINE_STATUS.ONLINE &&
        this.allowSend
      return !allow
    },
    allowFile () {
      const {
        windowType,
        chatInfo: { isGroup }
      } = this
      // const allow = !this.chatInfo.isGroup
      const dogState = this.$store.state.talk.dogState
      const allowDog = windowType === 1 && (dogState || !isGroup)
      return allowDog
    }
  },
  watch: {
    'chatInfo.id': {
      // 切换当前联系人
      handler (newId) {
        this.handleSendSecretLevel()
        // TODO:测试草稿功能
        this.getDraft(newId)
        // 设置水印
        if (typeof newId !== 'undefined') {
          this.$nextTick(() => {
            this.printWaterMark(this.nickname)
          })
        }
      },
      immediate: true
    },
    'messageList.length': {
      immediate: true,
      handler () {
        this.scrollToBottom()
        this.setTimeVisibleSet()
      }
    }
  },
  beforeDestroy () {
    // 设置草稿
    this.setDraft(this.chatInfo.id)
  },
  methods: {
    /** 给研讨界面添加水印 */
    printWaterMark (username) {
      const config = {
        text: username,
        font: '24px serif',
        opacity: 0.4,
        density: 0.8,
        rotate: (-1 / 6) * Math.PI,
        z_index: 999,
        color: 'rgba(252, 252, 252, 0.6)',
        yOffset: 5
      }
      const watermark = new Watermark(config)
      watermark.remove('user-name-mask')
      watermark.embed('.conv-box-message', 'user-name-mask')
    },
    /**
     * 设置当前研讨的草稿信息
     * @param {String} preId 上一个研讨ID
     * @param {String} curId 当前研讨ID
     */
    setDraft (preId) {
      const { $store } = this
      $store
        .dispatch('UpdateDraftMap', [preId + 'file', this.fileUpload])
        .then(() => {
          $store
            .dispatch('UpdateDraftMap', [preId, this.messageContent])
        })
    },
    /**
     * 获取草稿信息
     */
    getDraft (curId) {
      const { draftMap } = this.$store.state.talk
      this.fileUpload = draftMap.get(curId + 'file') || {}
      this.messageContent = draftMap.get(curId) || ''
    },
    /** 设置显示时间的消息集合 */
    setTimeVisibleSet () {
      const { timeVisibleSet, messageList } = this
      timeVisibleSet.clear()
      if (messageList.length) {
        let lastVisibleTime = messageList[0].time
        messageList.forEach((item, index) => {
          const interval = new Date(item.time) - new Date(lastVisibleTime)
          if (interval > 3 * 60 * 1000 || interval === 0) {
            timeVisibleSet.add(index)
            lastVisibleTime = item.time
          }
        })
      }
    },
    /**
     * 文件上传成功时触发
     * @param {Object} file 文件属性包括：
     * fileExt, fileId, fileName, fileSize, isSuccessNo, totalSize
     */
    handleUpload (file) {
      const { secretLevel } = file
      if (secretLevel && this.sendSecretList.includes(secretLevel)) {
        this.sendSecretLevel = secretLevel
        this.fileUpload = file
      } else {
        this.$notification.warn({
          description: '密级错误！',
          duration: 2,
          key: 'secret-err'
        })
      }
    },
    beforeUpload () {
      this.headers.authorization = this.token
    },
    /** 清除上传的文件 */
    removeFile () {
      this.fileUpload = {}
    },
    /**
     * 聊天消息滚到到最新一条
     * 1. 发送消息 2. 页面创建 3.页面更新
     * @param {Number} height 滚动的高度
     */
    scrollToBottom (height) {
      this.$nextTick(() => {
        const msgContr = this.$el.querySelector('.talk-main-box')
        if (msgContr) {
          msgContr.scrollTop = height ? msgContr.scrollTop + Number.parseInt(height) : msgContr.scrollHeight
        }
      })
    },
    /** 通过isGroup属性过滤聊天选项 */
    optionFilter () {
      const {
        windowType,
        chatInfo: {
          isGroup
        }
      } = this
      // 聊天操作选项
      const optionList = [
        { window: 1, group: false, name: 'talkHistory', message: '聊天历史', type: 'file-text' },
        { window: 1, group: false, name: 'userFile', message: '文件', type: 'folder-open' },
        { window: 1, group: true, name: 'talkHistory', message: '聊天历史', type: 'file-text' },
        { window: 1, group: true, name: 'moreInfo', message: '详细信息', type: 'profile' },
        { window: 1, group: true, name: 'teamMember', message: '群组成员', type: 'team' },
        // 会议相关操作选项
        { window: 3, group: false, name: 'MConferee', message: '参会人员', type: 'team' },
        { window: 3, group: false, name: 'MFile', message: '会议文件', type: 'folder-open' },

        // { group: true, name: 'groupNotice', message: '群公告', type: 'notification' },
        // { group: true, name: 'markMessage', message: '标记信息', type: 'tags' },
        { group: false, name: 'talkHistory', message: '聊天历史', type: 'file-text' },
        { group: false, name: isGroup ? 'groupFile' : 'userFile', message: '文件', type: 'folder-open' },
        { group: true, name: isGroup ? 'moreInfo' : 'personMoreInfo', message: '详细信息', type: 'profile' },
        { group: true, name: isGroup ? 'teamMember' : 'personMoreInfo', message: '组成员', type: 'team' },
        { group: true, name: 'groupRecord', message: '群组变动信息', type: 'file' }
      ]
      const options = optionList.filter(item => {
        if (windowType === 1) {
          return item.window === windowType && item.group === isGroup
        } else {
          return item.window === windowType
        }
      })
      return options
    },
    /** 根据drawerName打开对应的抽屉 */
    triggerDrawer (drawerType, drawerName) {
      this.activeOption = { 'drawerType': drawerType, 'drawerName': drawerName }
    },
    /** 设置发送消息的密级 */
    handleSendSecretLevel (value) {
      const secretLevel = value || 30
      const allSendMenu = [30, 40, 60].filter(item => item <= this.userSecretLevel)
      const curTalkSecret = this.chatInfo.secretLevel
      this.sendSecretLevel = secretLevel
      this.sendSecretList = allSendMenu.filter(item => item <= curTalkSecret)
    },
    /** 发送消息 */
    sendMessage (secretLevel) {
      if (this.sendDisabled) {
        this.$message.warning('还不能发送消息！')
        return
      }
      const tweet = new Tweet()
      const { fileUpload, messageContent: content } = this
      // 如果有文件消息，发送文件消息，忽略文字消息
      if (Object.keys(fileUpload).length) {
        const { fileId, fileName, fileExt, fileSize } = fileUpload
        this.generateFileMsg(tweet, fileId, fileSize, fileExt, fileName, secretLevel)
      } else {
        // 没有文件消息，验证文字消息的合法性
        if (content.replace(/\n/g, '').trim() === '') {
          this.$message.warning('消息内容不能为空')
          return
        } else if (content.length > 2000) {
          this.$message.warning('消息内容不能超过2000个字符')
          return
        } else {
          this.generateTextMsg(tweet, content, secretLevel)
        }
      }
      this.generateBaseInfo(tweet, secretLevel)
      this.addContactInfo(tweet)
      const baseMessage = new SocketMessage({
        code: this.setWSCode(),
        data: tweet
      }).toString()
      this.SocketGlobal.send(baseMessage)
      // 添加定时任务 添加到发送队列
      this.$store.dispatch('AddTimingTask', tweet.id)
      // 更新消息列表
      this.$store.dispatch('UpdateTalkMap', {
        direction: 'send',
        message: tweet
      })
      // TODO:判断窗口类型(非会议时更新最近联系人列表)
      if (this.windowType !== 3) {
        this.$store.dispatch('UpdateRecentContacts', {
          ...this.chatInfo,
          reOrder: true,
          addUnread: false
        })
      }
      this.scrollToBottom()
      tweet.content.type === 1 ? (this.messageContent = '') : (this.fileUpload = {})
    },
    // TODO:设置消息类型
    /** 根据窗口类型设置消息码 */
    setWSCode () {
      return this.windowType === 3 ? 900 : this.chatInfo.isGroup ? 1 : 0
    },
    /** 添加消息发送人或所在群组信息 */
    addContactInfo (tweet) {
      tweet.contactInfo = {}
      if (tweet.isGroup) {
        const { chatInfo: { id, name, avatar, secretLevel, memberNum, groupOwnerId } } = this
        tweet.contactInfo = { id, name, avatar, secretLevel, memberNum, groupOwnerId }
        tweet.contactInfo.isGroup = true
      } else {
        const { userId, nickname, avatar, userSecretLevel } = this
        tweet.contactInfo.id = userId
        tweet.contactInfo.name = nickname
        tweet.contactInfo.avatar = avatar
        tweet.contactInfo.secretLevel = userSecretLevel
        tweet.contactInfo.memberNum = 2
        tweet.contactInfo.isGroup = false
        tweet.contactInfo.groupOwnerId = ''
      }
    },
    /** 生成消息体中的基本信息 */
    generateBaseInfo (tweet, secretLevel) {
      const { userId, avatar, nickname, chatInfo } = this
      tweet.id = uuidv4()
      tweet.username = nickname
      tweet.avatar = avatar
      tweet.fromId = userId
      tweet.toId = chatInfo.id
      tweet.toName = chatInfo.name
      tweet.atId = []
      tweet.time = new Date()
      tweet.isGroup = chatInfo.isGroup
    },
    /** 生成文字消息 */
    generateTextMsg (tweet, content, secretLevel) {
      tweet.content = {
        id: '0',
        fileSize: '0',
        type: 1,
        extension: '0',
        title: content,
        secretLevel: secretLevel
      }
    },
    /** 生成图片和文件类消息 */
    generateFileMsg (tweet, id, fileSize, extension, title, secretLevel) {
      const index = this.imgFormat.indexOf(extension.toLowerCase())
      tweet.content = {
        id,
        fileSize,
        type: index < 0 ? 3 : 2,
        extension,
        title,
        secretLevel
      }
    },
    /** 插入表情 */
    insertFace (item) {
      this.messageContent = this.messageContent + 'face' + item
      this.faceVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.unselected-tip {
  padding-top: 20%;
  color: #a5a7a9;
  font-size: 16px;
}

.conv-box {
  display: flex;
  flex-direction: column;
  height: calc(100vh);
  overflow: hidden;

  // 头部区域
  &-header {
    height: 55px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    line-height: 55px;
    padding: 0 20px;
    background-color: #f2f3f5;
    border-bottom: 1px solid #dcdee0;

    .conv-title {
      color: black;
      font-size: 16px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      :nth-child(2) {
        letter-spacing: -2px;
      }
    }

    .conv-option {
      // 右对齐
      overflow: hidden;
      font-size: 18px;

      .anticon:hover {
        color: #1890ff;
      }
    }
  }
  // 消息展示区域
  &-message {
    display: flex;
    flex-direction: column;
    flex: 1;

    .talk-main-box {
      position: relative;
      flex-grow: 1;
      overflow: hidden;
      &:hover {
        overflow: overlay;
      }

      .talk-main {
        box-sizing: border-box;
        min-height: 100%;
        min-width: 400px;
        width: 100%;
        padding: 4px 32px 16px;
        background: rgba(255, 255, 255, 0);
        overflow: hidden;
        .talk-item {
          display: flex;
          flex-direction: row-reverse;
          flex-shrink: 0;
        }
        .view-history {
          text-align: center;
        }

        .empty-tip {
          text-align: center;
          margin-top: 130px;
          color: #ccc;
          font-size: 13px;
        }
      }
    }
  }
  // 文字编辑区域
  &-editor {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;

    background-color: #fff;
    padding: 0 32px;
    border-top: 1px solid #dcdee0;
    // 编辑器选项
    .editor-option {
      flex-grow: 0;
      flex-shrink: 0;

      display: flex;
      height: 40px;
      line-height: 32px;
      padding: 4px 0;
      font-size: 20px;
      z-index: 3;
      background-color: #fff;
    }
    // 文字编辑区域
    .editor-area {
      flex-grow: 1;
      flex-shrink: 1;
      height: 60px;

      display: flex;
      flex-direction: column;

      .draft-input {
        flex: 1 0 auto;
        width: 100%;
        display: flex;
        flex-direction: column;
        cursor: text;
        // 输入框
        .textarea-input {
          height: 60px;
          width: 100%;
          line-height: 20px;
          padding: 0;
          color: black;
          resize: none;
          outline: none;
          border: none;
          z-index: 2;
        }
        // 文件上传展示
        .upload-display {
          height: 100%;
          width: 100%;
          max-height: 60px;
          .file-card {
            width: 300px;
            height: 60px;
          }
        }
      }
    }
    // 发送键
    .send-toolbar {
      flex-grow: 0;
      flex-shrink: 0;

      margin: 4px 0 8px;
      display: flex;
      align-items: center;
    }
  }
}
</style>
