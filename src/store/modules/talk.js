/**
 * 研讨状态模块
 */
import Vue from 'vue'
import router from '@/router'
import { getGroupList,
  getContactsTree,
  getRecentContacts,
  getTalkMap,
  getUserOnlieList } from '@/api/talk'
import { Tweet, RecentContact, SocketMessage } from '@/utils/talk'
import { ONLINE_STATUS } from '@/utils/constants'
import { format } from '@/utils/util'

/**
 * 设置置顶状态
 * @param {String} id 联系人id
 * @param {Array} recentContacts 最近联系人列表
 * @returns {Boolean}
 */
function setIsTop (recentContacts, id) {
  const contactItems = recentContacts.filter(item => item.id === id)
  if (contactItems.length) return contactItems[0].isTop
  else return false
}

/**
 * 设置免打扰状态
 * @param {String} id 联系人id
 * @param {Boolean} isGroup 是否为群组
 * @param {Array} groupList 群组列表
 * @returns {Boolean}
 */
function setIsMute (groupList, isGroup, id) {
  if (isGroup) {
    const groupItem = groupList.filter(item => item.id === id)
    if (groupItem.length) return groupItem[0].isMute
    else return false
  } else return false
}

/**
 * 设置未读消息数量
 * @param {Array} recentContacts 最近联系人
 * @param {String} id 联系人id
 * @param {Boolean} addUnread 增加未读消息数
 * @param {String} currentId 当前激活研讨的id
 * @param {Object} curRouter 当前路由
 */
function setUnreadNum (recentContacts, id, addUnread, currentId, curRouter) {
  if (curRouter.name === 'ChatBox' && id === currentId) return 0
  if (addUnread) {
    const recentItem = recentContacts.filter(item => item.id === id)
    if (recentItem.length) {
      return recentItem[0].unreadNum + 1
    } else return 1
  } else return 0
}

/**
 * 设置最近联系人项中消息的相关信息
 * @param {Map} talkMap 存储研讨消息的Map
 * @param {String} id 联系人id
 * @param {Object} recentContact 要处理的项
 */
function setMessageInfo (id, talkMap, recentContact) {
  if (talkMap.has(id)) {
    const talkList = talkMap.get(id)
    if (talkList.length) {
      recentContact.time = format(
        new Date(talkList[talkList.length - 1].time),
        'hh:mm')
      recentContact.sender = talkList[talkList.length - 1].username
      recentContact.lastMessage = talkList[talkList.length - 1].content

      // TODO: @功能以后再说
      recentContact.atMe = false
    } else {
      recentContact.time = ''
      recentContact.lastMessage = {}
      recentContact.sender = ''
      recentContact.atMe = false
    }
  } else {
    recentContact.time = ''
    recentContact.lastMessage = {}
    recentContact.sender = ''
    recentContact.atMe = false
  }
}

/**
 * 向研讨服务同步未读消息数
 * @param {Boolean} online 是否在线
 * @param {Object} reviser 接收者信息
 * @param {Object} sender 发送者信息
 */
function syncUnread2Server (newUnreasNum, online, reviser, sender) {
  // TODO: 连接断开，添加提醒
  if (!online || newUnreasNum !== 0) return
  const socketMessage = new SocketMessage({
    code: 9,
    data: {
      reviser: reviser.id,
      sender: sender.id,
      // 保密检查新增
      reviserName: reviser.name,
      senderName: sender.name
    }
  }).toString()
  Vue.prototype.SocketGlobal.send(socketMessage)
}

/**
 * 格式化联系人结构树
 * @param {Array} target 目标数组
 * @param {Array} todoList 待处理数组
 */
function formatTree (target, todoList) {
  if (!todoList) {
    return []
  }
  todoList.forEach(function (element) {
    let newItem = {}
    if (element.scopedSlotsTitle === 'orgNode') {
      // 处理组织节点
      newItem = {
        key: element.id,
        title: element.orgName,
        parentId: '',
        icon: 'folder',
        online: false,
        selectable: false,
        scopedSlots: {
          title: 'orgNode'
        },
        children: formatTree([], element.children)
      }
    } else if (element.scopedSlotsTitle === 'userNode') {
      // 处理用户节点
      newItem = {
        key: element.id,
        title: element.name,
        parentId: '',
        icon: element.avatar,
        online: element.online,
        isLeaf: true,
        scopedSlots: {
          title: 'userNode'
        }
      }
    }
    target.push(newItem)
  })
  return target
}

const talk = {
  state: {
    /** 用户的在线状态 @/utils/constants.js->ONLINE_STATUS */
    onlineState: 3,
    /** 最新联系人列表 */
    recentContacts: [],
    /** 群组列表 */
    groupList: [],
    /** 联系人树 */
    contactsTree: [],
    /** 存储研讨消息的Map */
    talkMap: new Map(),
    /** 当前研讨页面的相关信息 */
    currentTalk: {},
    /** 草稿Map */
    draftMap: new Map(),
    /** 看门狗的状态 0-关 1-开 */
    dogState: 0,
    /** 最新在线联系人列表 */
    onlineList: new Set()
  },

  mutations: {
    CLEAR_ONLINE_LIST (state) {
      state.onlineList = new Set()
    },
    // data格式：
    // data: {
    //   add: [],
    //   delete: []
    // }
    UPDATE_ONLINE_LIST (state, data) {
      const userOnline = state.onlineList
      Object.keys(data).forEach(i => {
        if (data[i] instanceof Array) {
          data[i].forEach(el => {
            userOnline[i](el)
          })
        }
      })
      state.onlineList = new Set(userOnline)
    },
    SET_ONLINE_STATE (state, onlineState) {
      state.onlineState = onlineState
    },
    SET_RECENT_CONTACTS (state, recentContacts) {
      state.recentContacts = recentContacts
    },
    SET_GROUP_LIST (state, groupList) {
      state.groupList = groupList
    },
    SET_CONTACTS_TREE (state, contactsTree) {
      /*
      const { id, parentId, title } = contactsTree[0]
      const newTree = [{
        key: id,
        parentId: parentId,
        title: title,
        scopedSlots: {
          title: 'orgNode'
        },
        children: formatTree([], contactsTree[0].children)
      }]
      */
      // 直接显示到三级单位(二部、二十三所)
      // const newTree = formatTree([], contactsTree[0].children[0].children)
      const newTree = formatTree(state.contactsTree, contactsTree)
      state.contactsTree = newTree
    },
    /**
     * 更新talkMap
     * @param {Object} talkMapObject 赋值数组
     * {
     *    fromServer: true,
     *    talkMapData: [['123', {}, {}], ['123', {}, {}]] 或者
     *                 [['123', [{}, {}]], ['123', [{}, {}]]]
     * }
     */
    SET_TALK_MAP (state, talkMapObject) {
      const { talkMap } = state
      if (talkMapObject.fromServer) {
        talkMapObject.talkMapData.forEach(function (item) {
          talkMap.set(item[0], item.slice(1))
        })
      } else {
        talkMapObject.talkMapData.forEach(function (item) {
          if (item[1] instanceof Array) {
            talkMap.set(item[0], item[1])
          }
        })
      }
      state.talkMap = new Map(talkMap)
    },
    /**
     * 将消息id重设为与服务端一致
     * @param {Object} data {oId, nId, contactId}
     */
    RESET_MESSAGE_ID (state, data) {
      const messageList = state.talkMap.get(data.contactId)
      if (messageList) {
        const index = messageList.findIndex(item =>
          item.id === data.oId
        )
        if (index > -1) {
          messageList[index].id = data.nId
        }
      }
    },
    /**
     * 设置当前研讨相关信息
     * @param {String} id 联系人ID
     */
    SET_CURRENT_TALK (state, id) {
      const item = state.recentContacts.find(element =>
        element.id === id
      )
      if (item) {
        // 更新当前研讨
        // const {
        //   id, name, avatar, secretLevel, memberNum, isGroup, groupOwnerId
        // } = item
        state.currentTalk = { ...item }
      }
    },
    /**
     * 更新draftMap
     * @param {Object} state talk状态
     * @param {Array} draft 赋值数组[id, message]
     */
    SET_DRAFT_MAP (state, draft) {
      state.draftMap.set(draft[0], draft[1])
    },
    /**
     * 设置DOG状态
     */
    SET_DOG_STATE (state, dogState) {
      state.dogState = dogState
    }
  },

  actions: {
    /**
     * 获取在线联系人列表
     */
    GetUserOnlie ({ commit }) {
      commit('CLEAR_ONLINE_LIST')
      return new Promise((resolve, reject) => {
        getUserOnlieList().then(res => {
          const data = {
            add: res.result.data,
            delete: []
          }
          commit('UPDATE_ONLINE_LIST', data)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    /**
     * 获取群组列表
     */
    GetGroupList ({ commit, rootGetters }) {
      return new Promise((resolve, reject) => {
        getGroupList(rootGetters.userId).then(response => {
          if (response.status === 200) {
            commit('SET_GROUP_LIST', [ ...response.result.data ])
          } else {
            reject(new Error('getGroupList: 服务器发生错误!'))
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    /**
     * 获取联系人树
     */
    GetContactsTree ({ commit }) {
      const root = '0010'
      return new Promise((resolve, reject) => {
        getContactsTree(root).then(response => {
          if (response.status === 200) {
            commit('SET_CONTACTS_TREE', response.result.data)
          } else {
            reject(new Error('getContactsTree: 服务器发生错误!'))
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    /**
     * 获取最近联系人列表(用于初始化最近联系人列表)
     */
    GetRecentContacts ({ commit, rootGetters }) {
      return new Promise((resolve, reject) => {
        getRecentContacts(rootGetters.userId).then(response => {
          if (response.status === 200) {
            commit('SET_RECENT_CONTACTS', [ ...response.result.data ])
          } else {
            reject(new Error('getRecentContacts: 服务器发生错误'))
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    /**
     * 更新最近联系人列表
     * @param {...Tweet.contactInfo, reOrder, addUnread} freshItem
     * { id, name, avatar, secretLevel, memberNum, isGroup, reOrder, addUnread }
     * reOrder: 重新排序
     * addUnread: 增加未读消息数量
     */
    UpdateRecentContacts ({ commit, state, rootGetters }, freshItem) {
      const { recentContacts, groupList, talkMap, currentTalk } = state
      const index = recentContacts.findIndex(element => element.id === freshItem.id)
      const newItem = new RecentContact(freshItem)
      // 设置状态
      newItem.isTop = setIsTop(recentContacts, freshItem.id)
      newItem.isMute = setIsMute(groupList, freshItem.isGroup, freshItem.id)
      setMessageInfo(freshItem.id, talkMap, newItem)
      newItem.unreadNum = setUnreadNum(
        recentContacts,
        freshItem.id,
        freshItem.addUnread,
        currentTalk.id,
        router.currentRoute
      )
      if (index > -1) {
        this._vm.$delete(recentContacts, index)
      }
      const TopNum = recentContacts.filter(element => element.isTop).length
      // 更新列表顺序
      if (freshItem.reOrder) {
        newItem.isTop
          ? recentContacts.unshift(newItem)
          : recentContacts.splice(TopNum, 0, newItem)
      } else {
        if (index > -1) {
          recentContacts.splice(index, 0, newItem)
        } else {
          newItem.isTop
            ? recentContacts.unshift(newItem)
            : recentContacts.splice(TopNum, 0, newItem)
        }
      }
      commit('SET_RECENT_CONTACTS', recentContacts)
      // 告知服务器未读消息的状态
      // TODO: 告知服务器的条件还要再加判断
      if (newItem.unreadNum === 0) {
        syncUnread2Server(
          newItem.unreadNum,
          rootGetters.onlineState === ONLINE_STATUS.ONLINE,
          rootGetters.userInfo,
          freshItem)
      }
    },
    /**
     * 获取所有未读消息的map(初始化缓存中的消息列表)
     */
    GetTalkMap ({ commit, rootGetters }) {
      return new Promise((resolve, reject) => {
        getTalkMap(rootGetters.userId).then(response => {
          if (response.status === 200) {
            commit('SET_TALK_MAP', {
              fromServer: true,
              talkMapData: response.result.data
            })
          } else {
            reject(new Error('getTalkMap: 服务器发生错误'))
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    /**
     * 收到消息后 更新缓存中的talkMap
     * @param {Object} messageObj {direction(send/receive), message}
     */
    UpdateTalkMap ({ state, commit, rootGetters }, messageObj) {
      const { direction, message } = messageObj
      if (direction === 'receive' && message.fromId === rootGetters.userId) return
      let tempMessageList = []
      if (direction === 'receive') {
        tempMessageList = state.talkMap.get(message.contactInfo.id) || []
        tempMessageList.push(new Tweet(message))
        commit('SET_TALK_MAP', {
          fromServer: false,
          talkMapData: [[message.contactInfo.id, tempMessageList]]
        })
      }
      if (direction === 'send') {
        tempMessageList = state.talkMap.get(message.toId) || []
        tempMessageList.push(new Tweet(message))
        commit('SET_TALK_MAP', {
          fromServer: false,
          talkMapData: [[message.toId, tempMessageList]]
        })
      }
    },
    /**
     * 更新缓存中的草稿信息
     * @param {Array} draft 草稿信息[id, message]
     */
    UpdateDraftMap ({ state, commit }, draft) {
      return new Promise((resolve) => {
        if (draft[0]) commit('SET_DRAFT_MAP', draft)
        resolve(draft)
      }).catch(error => {
        throw (error)
      })
    }
  },
  strict: process.env.NODE_ENV !== 'production'
}

export default talk
