<template>
  <div class="meeting-list">
    <!-- 会议看板 -->
    <div
      v-for="item in meetingList"
      :class="{'meeting-item': true, 'activated': item.id===curMeeting.id}"
      @click="selectMeeting(item)"
      :key="item.id"
    >
      <!-- 会议状态条 -->
      <div :class="labelBarClass(item)">
        <div class="extra-info">
          议程: {{ item.currentProgress.name || '未开始' }}
        </div>
        <div class="extra-info">
          创建人: {{ item.creatorName }}
        </div>
      </div>
      <!-- 会议名称 -->
      <div class="meeting-title">
        <span :class="'s-' + item.secretLevel">
          [{{ item.secretLevel | fileSecret }}]
        </span>
        {{ item.name }}
      </div>
      <!-- 会议相关信息 -->
      <div class="meeting-info">
        <div class="prop-label meeting-type">
          <a-icon type="flag" />
          {{ setMeetingType(item.type) }}
        </div>
        <div class="prop-label member-num">
          <a-icon type="user" />
          {{ item.memberNum }}
        </div>
        <div class="prop-label start-time">
          <a-icon type="clock-circle" />
          {{ new Date(item.startTime) | dateFormat('yyyy/MM/dd hh:mm') }}
        </div>
      </div>
    </div>
    <!-- 无会议时的提示信息 -->
    <div class="empty-tip" v-if="!meetingList.length">
      <a-tag :closable="false" v-if="!loading">
        <a-icon type="exclamation-circle" />
        暂无会议
      </a-tag>
      <a-button size="small" icon="redo" :loading="loading" @click="getMeetingList">
        {{ loading ? '加载中···' : '' }}
      </a-button>
    </div>
  </div>
</template>

<script>
import { TYPE_LIST } from './modules/constance'
import { format } from '@/utils/util'

export default {
  naem: 'MeetingList',
  data () {
    return {
      /* 加载会议的等待状态 */
      loading: false,
      /* 会议类型列表 */
      meetTypeList: TYPE_LIST
    }
  },
  computed: {
    /* 会议列表 */
    meetingList () {
      return this.$store.state.meeting.meetingList
    },
    /* 当前会议 */
    curMeeting () {
      return this.$store.state.meeting.curMeeting
    }
  },
  created () {
    // 消息更新不需要更新列表
    if (!this.meetingList.length) {
      this.getMeetingList()
    }
  },
  filters: {
    'dateFormat': format
  },
  methods: {
    /**
     * 选择会议
     */
    selectMeeting (meetingInfo) {
      console.log(meetingInfo)
      this.$store.commit('SET_CUR_MEETING', meetingInfo)
    },
    /**
     * 生成标签class
     */
    labelBarClass (item) {
      return 'label-bar meeting-s-' + item.status
    },
    /**
     * 设置会议类型
     */
    setMeetingType (type) {
      const item = this.meetTypeList
        .find(i => String(i.value) === type) || {}
      return item.title
    },
    /**
     * 从服务端获取会议列表
     */
    getMeetingList () {
      console.log('获取会议列表')
      this.loading = true
      this.$store.dispatch('GetMeetingList').finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
/* 会议列表 */
// .meeting-list {
//   padding: 8px;
// }
/* 被选中的背景色 */
.activated {
  background-color: #d3d6dc !important
}
/* 会议结束 */
.meeting-s-902 {
  background-color: #a6a6a6;
}
/* 会议未开始 */
.meeting-s-906 {
  background-color: #549adb;
}
/* 会议进行中 */
.meeting-s-908 {
  background-color: #67cd67;
}

.meeting-item {
  position: relative;
  cursor: pointer;
  height: 64px;
  padding: 4px 16px 8px;
  border-bottom: 1px solid #e6e6e6;
  white-space: nowrap;
  /* 默认背景色 */
  background-color: #ebeff5;

  // margin-bottom: 8px;
  // border-radius: 5px;

  /* 会议状态标签 */
  .label-bar {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    padding: 8px 0;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    transition: width 218ms ease-in;
    overflow: hidden;

    .extra-info {
      color: white;
      font-size: 14px;
      padding: 0 8px;
      margin-bottom: 8px;
    }
  }
  /* 会议名称 */
  .meeting-title {
    font-size: 16px;
    color: #333333;
    line-height: 2em;
    /* 控制显示省略号 */
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* 会议相关信息 */
  .meeting-info {
    font-size: 13px;
    color: #999999;
    line-height: 1.5em;
    display: flex;
    flex-direction: row;

    .prop-label {
      overflow: hidden;
    }
    /* 开始时间 */
    .start-time {
      width: 135px;
    }
    /* 会议人数 */
    .member-num {
      width: 50px;
    }
    /* 会议类型 */
    .meeting-type {
      width: 60px;
    }
  }

  /* 悬浮效果 */
  &:hover {
    background-color: #d4d7dc99;
    .label-bar {
      width: 40%;
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 20px;
}
</style>
