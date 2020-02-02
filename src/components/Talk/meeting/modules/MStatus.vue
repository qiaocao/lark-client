<template>
  <div class="meeting-status-wrap">
    <!-- 议程状态 -->
    <div class="agenda-status">
      <a-popover placement="bottom">
        <div class="status-info">
          <!-- 进行中：当前议程：全员讨论 -->
          <div
            v-if="curAgenda === agendaList.length"
            style="margin: 0 8px"
          >
            会议已结束
          </div>
          <div v-else style="display:flex">
            <div>当前议程：</div>
            <a-checkable-tag :key="curAgenda" style="width:180px; overflow:hidden; text-overflow:ellipsis; line-height:23px">
              {{ (agendaList[curAgenda - 1] || {}).name || '未开始' }}
            </a-checkable-tag>
          </div>
        </div>

        <!-- 会议议程下拉菜单 -->
        <template slot="content">
          <a-timeline>
            <a-timeline-item
              class="agenda-item"
              v-for="(item, index) in agendaList.slice(0, agendaList.length - 1)"
              :color="setColor(index).color"
              :key="index"
              @click="selectAgenda(index)"
            >
              <a-tooltip :title="CHANGE_AGENDA?'点击切换议程':''">
                {{ item.name }}
              </a-tooltip>
            </a-timeline-item>
            <!-- 会议结束 -->
            <span
              solt="pending"
              class="meeting-end"
              @click="selectAgenda(agendaList.length - 1)">
              <a-icon type="logout" />
              <span class="title">{{ agendaList[agendaList.length - 1].name }}</span>
            </span>
          </a-timeline>
        </template>
      </a-popover>
      <!-- 修改会议议程 -->
      <div class="status-option" v-if="EDIT_AGENDA">
        <a @click="showAgendaModal">编辑</a>
      </div>
    </div>

    <!-- 发言状态 -->
    <div class="speak-status">
      <a-tooltip :title="EDIT_SPEAKER?'选择发言人':''">
        <a-icon type="sound" theme="twoTone" class="speak-status-icon" @click="showSpeakerEdit" />
      </a-tooltip>
      <!-- <div class="speak-status-content">自由发言</div> -->
      <div class="speak-status-content">
        <div :class="isWordsLoop">
          {{ speakers }}
        </div>
      </div>
    </div>

    <div class="status-controll">
      <a v-if="curAgenda === 0 && START_M" @click="selectAgenda(0)" class="start-meeting">
        开始会议
      </a>
      <a
        v-else-if="curAgenda !== agendaList.length && END_M"
        @click="selectAgenda(agendaList.length - 1)"
        class="end-meeting"
      >
        结束会议
      </a>
    </div>

    <!-- 议程编辑模态框 -->
    <AgendaEdit :info="{}" :showAModal.sync="agendaVisible" v-if="agendaVisible" />
    <SpeakerEdit :showSModal.sync="speakerVisible" v-if="speakerVisible" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AgendaEdit from './AgendaEdit'
import SpeakerEdit from './SpeakerEdit'
import { getStrFullLength } from '@/components/_util/StringUtil'
import { selectAgenda } from '@/api/meeting'
import { sendSysMsg } from './constance'

export default {
  /* 会议状态组件 */
  name: 'MStatus',
  props: {},
  components: {
    AgendaEdit,
    SpeakerEdit
  },
  data () {
    return {
      /* 展示议程编辑模态框 */
      agendaVisible: false,
      /* 展示发言人选择模态框 */
      speakerVisible: false,
      /* 发言状态信息 */
      speakers: ''
      // curAgenda: 2,
      // agendaList: [0, 1, 2, 3, 4, 5]
    }
  },
  computed: {
    ...mapGetters(['getMAuth', 'nickname']),
    /** 当前选中的会议 */
    curMeeting () {
      return this.$store.state.meeting.curMeeting
    },
    /** 会议所有的议程 */
    agendaList () {
      return this.curMeeting.allProgress
    },
    /** 会议当前进行的议程编号 1 -- len */
    curAgenda () {
      return parseInt(this.curMeeting.currentProgress.index)
    },
    /* 是否文字轮播 */
    isWordsLoop () {
      const fullLength = getStrFullLength(this.speakers)
      return fullLength > 20 ? 'words-loop' : ''
    },
    EDIT_AGENDA () {
      return this.getMAuth('EDIT_AGENDA')
    },
    CHANGE_AGENDA () {
      return this.getMAuth('CHANGE_AGENDA')
    },
    START_M () {
      return this.getMAuth('START_M')
    },
    END_M () {
      return this.getMAuth('END_M')
    },
    EDIT_SPEAKER () {
      return this.getMAuth('EDIT_SPEAKER')
    }
  },
  watch: {
    curMeeting: {
      deep: true,
      immediate: true,
      handler: function (newVal) {
        this.speakers = this.setSpeakers()
      }
    }
  },
  methods: {
    /**
     * 设置会议议程标签颜色
     */
    setColor (index) {
      const curIndex = this.curAgenda - 1
      if (index < curIndex) {
        return {
          color: 'green',
          type: 'check'
        }
      } else if (index > curIndex) {
        return {
          color: 'gray',
          type: 'info-circle'
        }
      } else {
        return {
          color: 'blue',
          type: 'clock-circle'
        }
      }
    },
    /**
     * 选择会议议程
     */
    selectAgenda (index) {
      // index比服务端的index少1
      const {
        curAgenda,
        $message,
        curMeeting,
        START_M,
        END_M,
        CHANGE_AGENDA,
        agendaList
      } = this
      // 议程不能回退
      if (curAgenda - 1 > index) {
        $message.warning('该议程已结束！')
        return
      }
      if (curAgenda - 1 === index) {
        $message.warning('议程正在进行中！')
        return
      }
      if (index === 0 && !START_M) {
        $message.warning('无启动会议权限！')
        return
      }
      if (index === agendaList.length - 1 && !END_M) {
        $message.warning('无结束会议权限！')
        return
      }
      if (!CHANGE_AGENDA) {
        $message.warning('无变更议程权限！')
        return
      }
      this.$confirm({
        content: '确定要切换议程吗',
        zIndex: 9999,
        onOk: () => {
          selectAgenda({
            meetingId: curMeeting.id,
            // 议程所处位置，从1开始
            code: index + 1
          }).then(res => {
            if (res.rel) {
              $message.success('议程切换成功')
              // 发送系统消息
              const msg = `${this.nickname}  将议程切换为  ${this.agendaList[this.curAgenda - 1].name}`
              sendSysMsg(this, msg)
            }
          }).catch(err => {
            $message.error('议程切换出错，稍后再试')
            console.error(err)
          })
        }
      })
    },
    /**
     * 设置显示的发言人
     */
    setSpeakers () {
      let info = ''
      let num = 0
      const { meetMemberList } = this.curMeeting
      meetMemberList && meetMemberList.forEach(item => {
        if (item.canMsg === '1') {
          if (num !== 0) {
            info += '、'
          }
          num++
          info += item.userName
        }
      })
      if (!meetMemberList || !num) {
        return '禁言中'
      }
      if (meetMemberList.length === num) {
        return '自由发言中'
      }
      return info + '发言中'
    },
    /**
     * 展示会议议程编辑模态框
     */
    showAgendaModal () {
      this.agendaVisible = true
    },
    showSpeakerEdit () {
      if (this.EDIT_SPEAKER) {
        this.speakerVisible = true
      } else {
        this.$message.warning('无权限选择发言人')
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .meeting-status-wrap {
    display: flex;
    justify-content: space-evenly;

    font-size: 12px;
    line-height: 2em;
    height: 2em;
    background-color: #e1ebf7;
    // 议程状态样式
    .agenda-status {
      display: flex;
      justify-content: center;
      width: 320px;
      white-space: nowrap;

      .status-info {
        .finished {
          color: #ff0000;
        }
      }
    }

    // 发言状态的样式
    .speak-status {
      display: flex;
      justify-content: flex-start;
      width: 240px;

      &-icon {
        margin-top: 0.5em;
        cursor: pointer;
      }

      &-content {
        margin-left: 8px;
        overflow: hidden;
      }
    }

    // 会议状态变更按钮
    .status-controll {
      .start-meeting {
        color: #00aa00;
      }
      .end-meeting {
        color: #ff0000;
      }
    }
  }

  // 会议议程菜单字体大小
  .agenda-item {
    font-size: 12px;
    padding: 8px 0;
    cursor: pointer;
  }
  // 会议结束议程样式
  .meeting-end {
    font-size: 12px;
    .title {
      margin-left: 8px;
      cursor: pointer;
    }
  }
  // 文字滚动样式
  .words-loop {
    display: inline-block;
    white-space: nowrap;
    animation: 10s wordsLoop linear infinite normal;
  }
  @keyframes wordsLoop {
    0% {
      transform: translateX(0px);
    }
    100% {
        transform: translateX(calc(-100% + 100px));
    }
  }
</style>
