import store from '@/store'
import notification from 'ant-design-vue/es/notification'
import { ONLINE_STATUS } from '@/utils/constants'
import { messagePopup } from '@/utils/client'

/** ws连通 */
const handleWsOpen = () => {
  // 请求研讨相关的数据
  store.dispatch('GetTalkMap')
  store.dispatch('GetRecentContacts')
  store.dispatch('GetGroupList')
  store.dispatch('GetContactsTree')
  store.dispatch('GetUserOnlie')
  // 设置在线状态为已连接
  store.commit('SET_ONLINE_STATE', ONLINE_STATUS.ONLINE)
}

/** 处理私聊和群组消息 */
const handleMessage = (data) => {
  // 自己发送的消息，不处理
  if (data.fromId === store.getters.userId) return
  store
    .dispatch('UpdateTalkMap', { direction: 'receive', message: data })
    .then(() => {
      store.dispatch('UpdateRecentContacts', {
        ...data.contactInfo,
        reOrder: true,
        addUnread: true
      })
    })
    .catch(error => {
      console.log(error)
      const key = `talk${Date.now()}`
      notification.warning({
        message: '消息同步出错',
        description: '研讨消息同步出错，点击同步按钮重新同步',
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
                store.dispatch('GetTalkMap')
                  .then(() => {
                    store.dispatch('GetRecentContacts')
                  })
                  .then(() => notification.close(key))
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
// 处理创建群组的消息
const handleCreateGroup = (data) => {
  // 接收到创建群组的消息-->更新最近联系人-->更新群组列表
  const {
    groupId,
    groupName,
    groupImg,
    levels,
    groupOwnerId
  } = data.zzGroup
  store
    .dispatch('UpdateRecentContacts', {
      id: groupId,
      name: groupName,
      avatar: groupImg,
      secretLevel: levels,
      memberNum: data.userList.length,
      isGroup: true,
      groupOwnerId,
      reOrder: true,
      addUnread: false
    })
    .then(() => {
      store.dispatch('GetGroupList')
    })
    .catch(error => {
      console.log(error)
      const key = `talk${Date.now()}`
      notification.warning({
        message: '有新的群组',
        description: '新增群组同步出错，点击手动同步',
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
                store.dispatch('GetRecentContacts')
                  .then(() => {
                    store.dispatch('GetGroupList')
                  })
                  .then(() => notification.close(key))
              }
            }
          }, '同步')
        },
        key
      })
    })
}
// 处理消息确认信息
const handleMessageAck = (received) => {
  // 删除定时任务 同时移出发送队列
  store.dispatch('DelTimingTask', received.oId)
  // 判断消息是否发送成功
  if (received.status === 200) {
    // 发送成功 更新消息id
    store.commit('RESET_MESSAGE_ID', received)
  }
  if (received.status === 201) {
    // 发送失败 添加到失败列表
    store.commit('ADD_FAIL_SET', received.oId)
    store.commit('SET_FAIL_MSG', { id: received.oId, desc: received.content })
  }
}
// 更新DOG状态
const handleDogChange = (data) => {
  const dog = parseInt(data.requireApproveAuthority) ? 0 : 1
  store.commit('SET_DOG_STATE', dog)
}
// 更新ONLINESTATUS状态
const handleOnlineChange = (data) => {
  const updateData = {
    add: [],
    delete: []
  }
  if (data.lineCode === '700') {
    updateData.add.push(data.userId)
    store.commit('UPDATE_ONLINE_LIST', updateData)
  }
  if (data.lineCode === '701') {
    updateData.delete.push(data.userId)
    store.commit('UPDATE_ONLINE_LIST', updateData)
  }
}

export {
  handleWsOpen,
  handleMessage,
  handleCreateGroup,
  handleMessageAck,
  handleDogChange,
  handleOnlineChange
}
