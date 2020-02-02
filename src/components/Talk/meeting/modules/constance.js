/* 会议中的常量 */
import Vue from 'vue'
import store from '@/store'
import { SocketMessage, Tweet } from '@/utils/talk'
import uuidv4 from 'uuid/v4'

/* 会议类型列表 */
const TYPE_LIST = [
  { value: 0, title: '讨论' },
  { value: 1, title: '协调' },
  { value: 2, title: '专题' },
  { value: 3, title: '审查' },
  { value: 4, title: '例会' },
  { value: 5, title: '评审' },
  { value: 6, title: '交流' }
]

/* 功能代码 */
const FUNCTIONS = {
  /* 编辑议程 */
  EDIT_AGENDA: '3012',
  /* 修改议程 */
  CHANGE_AGENDA: '3015',
  /* 开始会议 */
  START_M: '3013',
  /* 结束会议 */
  END_M: '3014',
  /* 发送消息 */
  MESSAGE: '3011',
  /* 选择发言人 */
  EDIT_SPEAKER: '3016',
  /* 人员编辑 */
  EDIT_USER: '3007',
  // DEL_USER: '3008'
  /* 人员角色修改 */
  EDIT_USER_ROLE: '3009',
  /* 修改文件类型 */
  EDIT_FILE_TYPE: '3018',
  /* 上传文件 */
  UPLOAD_FILE: '3002',
  /* 文件下载 */
  DOWNLOAD_FILE: '3003',
  /* 删除文件 */
  DEL_FILE: '3004'
}

/**
 * 生成会议中的系统消息
 * @param {String} content 消息内容
 */
const sendSysMsg = (vm, content) => {
  const { userId, avatar, nickname } = store.getters
  const {
    curMeeting: { id, name, memberNum, secretLevel, meetImg }
  } = store.state.meeting

  const tweet = new Tweet()

  Object.assign(tweet, {
    id: uuidv4(),
    username: nickname,
    avatar,
    fromId: userId,
    toId: id,
    toName: name,
    atId: [],
    time: new Date(),
    isGroup: true,
    contactInfo: {
      id,
      name,
      avatar: meetImg,
      secretLevel: parseInt(secretLevel),
      memberNum,
      groupOwnerId: '',
      isGroup: true
    },
    content: {
      id: '0',
      fileSize: '0',
      type: 999,
      extension: '0',
      title: content,
      secretLevel: 30
    }
  })

  const baseMessage = new SocketMessage({
    code: 900,
    data: tweet
  }).toString()
  if (Vue.prototype.SocketGlobal) {
    Vue.prototype.SocketGlobal.send(baseMessage)
    // 添加定时任务 添加到发送队列
    store.dispatch('AddTimingTask', tweet.id)
    // 更新消息列表
    store.dispatch('UpdateTalkMap', {
      direction: 'send',
      message: tweet
    })
  }
}

export {
  TYPE_LIST,
  FUNCTIONS,
  sendSysMsg
}
