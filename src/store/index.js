import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import talk from './modules/talk'
import timer from './modules/timer'
import meeting from './modules/meeting'
import download from './modules/download'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    talk,
    timer,
    meeting,
    download
  },
  state: {

  },
  mutations: {

  },
  actions: {

  },
  getters
})
