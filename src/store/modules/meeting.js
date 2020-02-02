import {
  getMeetingList
} from '@/api/meeting'

const meeting = {
  state: {
    /* 会议列表 */
    meetingList: [],
    /* 当前会议（所有信息，包含状态信息） */
    curMeeting: {}
  },

  mutations: {
    /**
     * 设置会议列表
     * @param {Array} meetingList 新列表
     */
    SET_MEETING_LIST (state, meetingList) {
      state.meetingList = meetingList
    },
    /**
     * 设置当前会议
     * @param {Object} meetingInfo 会议信息
     */
    SET_CUR_MEETING (state, meetingInfo) {
      state.curMeeting = meetingInfo
    }
  },

  actions: {
    /**
     * 获取会议列表
     */
    GetMeetingList ({ state, commit, rootGetters }) {
      return new Promise((resolve, reject) => {
        getMeetingList(rootGetters.userId).then(response => {
          if (response.status === 200) {
            commit('SET_MEETING_LIST', response.result.data)
          } else {
            reject(new Error('getMeetingList: 服务器发生错误'))
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    /**
     * 更新会议（列表）状态信息
     * @param {Object} meetingItem 需要更新的会议信息
     */
    async UpdateMeetingState ({ state, commit, dispatch, getters, rootGetters, rootState }, meetingItem) {
      if (!state.meetingList.length) {
        await dispatch('GetMeetingList')
      }
      const { id } = meetingItem
      const { meetingList, curMeeting } = state
      const index = meetingList.findIndex(element => element.id === id)

      if (index > -1) {
        // 已经有-更新
        meetingList[index] = meetingItem
      } else {
        // 还没有-新增
        meetingList.unshift(meetingItem)
      }
      commit('SET_MEETING_LIST', meetingList)
      // TODO:?判断对当前会议状态的更新
      if (id === curMeeting.id) {
        commit('SET_CUR_MEETING', meetingItem)
      }
    }
  },

  strict: process.env.NODE_ENV === 'production'
}

export default meeting
