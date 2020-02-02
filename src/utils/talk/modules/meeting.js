/* 会议消息处理 */
import store from '@/store'
import notification from 'ant-design-vue/es/notification'
import { messagePopup } from '@/utils/client'

/**
 * 处理会议消息
 * @param {Object} data 消息体
 */
const onMeetingMsg = (data) => {
  /* 逻辑与群组消息一致，不更新最近联系人消息 */
  // 自己发送的消息，不处理
  if (data.fromId === store.getters.userId) return
  store
    .dispatch('UpdateTalkMap', { direction: 'receive', message: data })
    .catch(error => {
      console.log(error)
      const key = `talk${Date.now()}`
      notification.warning({
        message: '消息同步出错',
        description: '会议消息同步出错，点击同步按钮重新同步',
        duration: null,
        btn: (h) => {
          return h('a-button', {
            props: {
              type: 'primary',
              size: 'small',
              icon: 'reload'
            },
            on: {
              click: () => {
                // TODO:会议消息同步出现问题，重新抓取会议消息
                console.log('重新抓取会议消息，并同步于TalkMap中')
                notification.close(key)
                // store.dispatch('GetTalkMap')
                //   .then(() => notification.close(key))
              }
            }
          }, '同步')
        },
        key
      })
    })
  // 向客户端发送提醒
  messagePopup(data)
}
/**
 * 处理会议状态变更消息
 * @param {Object} meetingItem 新会议
 */
const onMeetingState = (meetingItem) => {
  store.dispatch('UpdateMeetingState', meetingItem)
}

export {
  onMeetingMsg,
  onMeetingState
}
