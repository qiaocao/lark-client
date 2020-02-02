import { SECRETLEVEL_ENUM } from './constants'
import Vue from 'vue'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

Vue.filter('NumberFormat', function (value) {
  if (!value) {
    return '0'
  }
  const intPartFormat = value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') // 将整数部分逢三一断
  return intPartFormat
})

Vue.filter('dayjs', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

Vue.filter('moment', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

// 人员密级过滤器
Vue.filter('peopleSecret', function (code) {
  const codeNumber = Number.parseInt(code)
  return codeNumber ? SECRETLEVEL_ENUM.get(codeNumber).people : SECRETLEVEL_ENUM.get('default')
})

// 资源密级过滤器
Vue.filter('fileSecret', function (code) {
  const codeNumber = Number.parseInt(code)
  return codeNumber ? SECRETLEVEL_ENUM.get(codeNumber).file : SECRETLEVEL_ENUM.get('default')
})
