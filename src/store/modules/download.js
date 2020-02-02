/**
 * @file 监测下载状态
 * @author jihainan
 */

const download = {
  state: {
    downloading: {}
  },
  mutations: {
    UPDATE_DOWNLOAD (state, newState) {
      state.downloading = newState
    }
  },
  actions: {
  }
}

export default download
