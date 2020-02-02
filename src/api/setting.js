import { axios } from '@/utils/request'

const api = {
  // AllCommonTools: '/portal/userCard/cards',
  SelfCommonTools: '/portal/tool/myAll',
  CheckCommonTools: '/portal/tool/myself'
}

export default api

/**
 * 获取所有的常用工具
 * @param {} parameter
 */
export function getAllCommonTools (parameter) {
  return axios({
    url: api.AllCommonTools,
    method: 'get',
    params: parameter
  })
}

/**
 * 获取个人常用工具
 * @param {*} parameter
 */
export function getSelfCommonTools (parameter) {
  return axios({
    url: api.SelfCommonTools,
    method: 'get',
    params: parameter
  })
}

/**
 * 添加个人工具
 * @param {*} parameter
 */
export function setCheckCommonTools (parameter) {
  return axios({
    url: api.CheckCommonTools,
    method: 'post',
    data: parameter
  })
}
/**
 * 删除个人工具
 * @param {} parameter
 */
export function delCheckCommonTools (parameter) {
  return axios({
    url: api.CheckCommonTools,
    method: 'delete',
    params: parameter
  })
}

export function settingCard (parameter) {
  return axios({
    url: api.settingCard,
    model: 'post',
    params: {
      cardId: parameter,
      userId: this.$store.state.user.name
    }
  })
}
