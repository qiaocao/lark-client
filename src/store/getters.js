import { FUNCTIONS } from '@/components/Talk/meeting/modules/constance'

const getters = {
  device: state => state.app.device,
  theme: state => state.app.theme,
  color: state => state.app.color,
  multiTab: state => state.app.multiTab,

  token: state => state.user.token,
  welcome: state => state.user.welcome,
  roles: state => state.user.roles,
  userInfo: state => state.user.info,
  /** 用户岗位（权限） */
  positions: state => {
    const positions = state.user.info.positions
    return positions && JSON.parse(positions) || []
  },
  /** 用户id(非身份证号) */
  userId: state => state.user.info.id,
  /** 用户身份证号 */
  userPId: state => state.user.info.pid,
  /** 用户头像 */
  avatar: state => state.user.avatar,
  /** 用户名 */
  nickname: state => state.user.name,
  /** 用户密级 */
  userSecretLevel: state => parseInt(state.user.info.secretLevel),

  addRouters: state => state.permission.addRouters,

  /** websocket连接状态 */
  onlineState: state => state.talk.onlineState,
  currentTalk: state => state.talk.currentTalk,
  recentContacts: state => state.talk.recentContacts,
  groupList: state => state.talk.groupList,
  contactsTree: state => state.talk.contactsTree,
  /** 未读消息数 */
  unreadMsgCount: state => {
    const count = 0
    const { recentContacts } = state.talk
    if (recentContacts.length) {
      return recentContacts.reduce((a, c) => a + c.unreadNum, 0)
    } else {
      return count
    }
  },
  /** 消息状态判断 100-成功 101-失败 102-发送中 */
  getMessageStatus: state => messageId => {
    if (state.timer.sendingMap.has(messageId)) {
      return 102
    } else if (state.timer.failSet.has(messageId)) {
      return 101
    } else {
      return 100
    }
  },
  /** 判断在线状态 */
  getOnlineStatus: state => pId => {
    if (state.talk.onlineList.has(pId)) {
      return true
    } else {
      return false
    }
  },
  /** 获取消息历史记录 */
  getTalkHistory: state => contactId => {
    return state.talk.talkMap.get(contactId) || []
  },
  /** 是否为群主 */
  isGroupOwner: state => {
    return state.user.info.id === state.talk.currentTalk.groupOwnerId
  },
  /** 当前用户的会议权限 Boolean */
  getMAuth: (state, { userId }) => authName => {
    const meetMemberList = state.meeting.curMeeting.meetMemberList || []
    const curUserFunList = meetMemberList.find(item => {
      return item.userId === userId
    }).functionList || []
    const hasAuth = curUserFunList.some(i => {
      return i.code === FUNCTIONS[authName]
    })
    return hasAuth
  }
}

export default getters
