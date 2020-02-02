<template>
  <div style="height: 100%">
    <a-spin :spinning="!isOnline || meetLoading">
      <!-- 自定义加载动画 -->
      <MLoading slot="indicator" style="left: 30%; top: 55%" />
      <conv-box
        :messageList="messageList"
        :chatInfo="curMeeting"
        :key="'meeting' + curMeeting.id"
        :windowType="3"
        :allowSend="allowSendMessage"
      >
        <template v-slot:statusBar>
          <MStatus />
        </template>
      </conv-box>
    </a-spin>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ConvBox } from '@/components/Talk'
import MStatus from './modules/MStatus'
import MLoading from './modules/MLoading'
import { getMeetingHistory } from '@/api/meeting'
import { ONLINE_STATUS } from '@/utils/constants'

export default {
  name: 'MeetingRoom',
  components: {
    ConvBox,
    MStatus,
    MLoading
  },
  data () {
    return {
      // messageList: [],
      /* 等待加载 */
      meetLoading: false
    }
  },
  computed: {
    ...mapGetters(['userId', 'onlineState']),
    /** 当前会议信息 */
    curMeeting () {
      const curMeeting = this.$store.state.meeting.curMeeting
      if (Object.keys(curMeeting).length === 0) return {}
      const meeting = {
        ...curMeeting,
        avatar: '',
        isGroup: true,
        groupOwnerId: ''
      }
      return meeting
    },
    /** 当前会议的消息列表 */
    messageList () {
      const msgs = this.$store.getters.getTalkHistory(this.curMeeting.id)
      const stringMsgs = JSON.stringify(msgs)
      const objMsgs = JSON.parse(stringMsgs)
      return objMsgs
    },
    /** 判断当前用户是否允许在当前会议中发言 */
    allowSendMessage () {
      const memberList = this.$store.state.meeting.curMeeting.meetMemberList || []
      const allowSize = memberList.filter(item => {
        return item.canMsg === '1' && item.userId === this.userId
      }).length
      return allowSize > 0
    },
    /* 用户在线状态 */
    isOnline () {
      const online = this.onlineState === ONLINE_STATUS.ONLINE
      return online
    }
  },
  watch: {
    // 监控会议ID，更新会议信息
    'curMeeting.id': {
      immediate: true,
      handler: function (newId) {
        this.onMeetingChange(newId)
      }
    }
  },
  methods: {
    /**
     * 会议变更处理
     */
    onMeetingChange (meetingId) {
      if (typeof meetingId !== 'undefined') {
        this.meetLoading = true

        getMeetingHistory(meetingId).then(res => {
          if (res.result.data) {
            if (res.result.data.length > this.messageList.length + 1) {
              this.$store.commit('SET_TALK_MAP', {
                fromServer: true,
                talkMapData: [res.result.data]
              })
            }
          }
        }).finally(() => {
          this.meetLoading = false
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .meeting-status {
    height: 24px;
    width: 100%;
    background-color: #92cbff2b;
  }
</style>
