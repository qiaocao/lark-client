const timer = {
  state: {
    // TODO: 移到talk模块中
    /** 发送中的消息 Map<messageId, slotIndex> */
    sendingMap: new Map(),
    // TODO: 移到talk模块中
    /** 发送失败的消息 Set<messageId> */
    failSet: new Set(),
    // TODO: 移到talk模块中
    /** 发送失败的原因 */
    failMsg: {},
    // *****超时定时器相关*****
    /** 循环队列，长度=超时时间+1 */
    listLoop: new Array(7),
    /** 循环队列的当前位置 */
    currentSlotIndex: 1,
    /** 定时器标识 */
    messageTimer: 0
  },

  mutations: {
    /**
     * 设置发送中的消息
     * @param {Map} newSendingMap 更新后的sendingMap
     */
    SET_SENDING_MAP (state, newSendingMap) {
      state.sendingMap = new Map(newSendingMap)
    },
    /**
     * 移除发送中的信息
     * @param {String} messageId 消息id
     */
    DEL_SENDING_MAP (state, messageId) {
      const { sendingMap } = state
      sendingMap.delete(messageId)
      state.sendingMap = new Map(sendingMap)
    },
    /**
     * 新增发送失败的消息
     * @param {String} messageId 消息id
     */
    ADD_FAIL_SET (state, messageId) {
      state.failSet = new Set(state.failSet.add(messageId))
    },
    /**
     * 移除发送失败的消息
     * @param {String} messageId 消息id
     */
    DEl_FAIL_SET (state, messageId) {
      const { failSet } = state
      failSet.delete(messageId)
      state.failSet = new Set(failSet)
    },
    /**
     * 设置发送失败原因
     */
    SET_FAIL_MSG (state, { id, desc }) {
      const { failMsg } = state
      failMsg[id] = desc
      // TODO: no use
      state.failMsg = failMsg
    },
    /**
     * 设置定时器
     * @param {Number} timer 定时器
     */
    SET_MESSAGE_TIMER (state, timer) {
      state.messageTimer = timer
    },
    /**
     * 设置循环队列的当前位置
     * @param {Number} index 新位置标识
     */
    SET_CURRENT_SLOT_INDEX (state, index) {
      state.currentSlotIndex = index
    },
    /**
     * 清除循环队列中对应的插槽
     * @param {Number} slotIndex 插槽序号
     */
    CLEAR_LIST_LOOP_SLOT (state, slotIndex) {
      // 这里未进行数据类型的判断
      // 使用该方法前需要进行判断
      state.listLoop[slotIndex].clear()
    }
  },

  actions: {
    /**
     * 增加定时任务
     * @param {String} messageId 消息ID
     */
    AddTimingTask ({ state, commit, dispatch }, messageId) {
      const { sendingMap } = state
      console.log(sendingMap)
      // 如果循环队列中已存在该uid，需要先干掉，重新计时
      let slotIndex = sendingMap.get(messageId)
      if (typeof slotIndex !== 'undefined') {
        state.listLoop[slotIndex].delete(messageId)
      }
      // 将该uid重现添加到循环队列中
      // 周期7，新插入的置入当前的后一个（即，6s后可以扫描到它）
      // 更新map中这个uid的最新slotIndex
      slotIndex = state.currentSlotIndex - 1
      const index = slotIndex < 0 ? 6 : slotIndex
      state.listLoop[index] = state.listLoop[index]
        ? state.listLoop[index].add(messageId)
        : new Set().add(messageId)
      // 添加到发送中队列
      sendingMap.set(messageId, index)
      commit('SET_SENDING_MAP', sendingMap)
      // 如果定时器未启动，则启动定时器
      if (state.messageTimer === 0) {
        dispatch('StartMessageTimer')
      }
    },
    /**
     * 删除定时任务 (考虑做成action)
     * @param {String} messageId 消息id
     */
    DelTimingTask ({ state, commit, dispatch }, messageId) {
      const { sendingMap } = state
      const slotIndex = sendingMap.get(messageId)
      if (typeof slotIndex !== 'undefined') {
        state.listLoop[slotIndex].delete(messageId)

        sendingMap.delete(messageId)
        commit('SET_SENDING_MAP', sendingMap)
      }
      // 如果没有定时任务，清除定时器
      if (sendingMap.size === 0) {
        dispatch('ClearMessageTimer')
      }
    },
    /**
     * 开启超时定时器
     */
    StartMessageTimer ({ state, commit, dispatch }) {
      dispatch('ClearMessageTimer')
        .then(() => {
          const timer = setInterval(() => {
            const slotSet = state.listLoop[state.currentSlotIndex]
            if (slotSet && slotSet.size > 0) {
              for (const uid of slotSet.values()) {
                // 将执行完的uid从sendingMap中剔除
                commit('DEL_SENDING_MAP', uid)
                // 添加到失败列表中
                commit('ADD_FAIL_SET', uid)
                commit('SET_FAIL_MSG', { id: uid, desc: '发送超时' })
                console.log(`消息：<${uid}>超时，发送失败！`)
              }
              // 置空该集合
              slotSet.clear()
              commit('CLEAR_LIST_LOOP_SLOT', state.currentSlotIndex)
            }
            // 继续循环
            commit('SET_CURRENT_SLOT_INDEX', (++state.currentSlotIndex) % 7)
          }, 1000)
          commit('SET_MESSAGE_TIMER', timer)
        })
    },
    /**
     * 清除消息定时器
     */
    ClearMessageTimer ({ state, commit }) {
      clearInterval(state.messageTimer)
      // 将定时器标记重置为0
      commit('SET_MESSAGE_TIMER', 0)
    }
  },
  strict: process.env.NODE_ENV !== 'production'
}

export default timer
