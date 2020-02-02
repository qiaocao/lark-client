import { axios } from '@/utils/request'

const api = {
  myNotice: '/portal/notice/myself',
  myCard: '/portal/card/myself',
  myTools: '/portal/tool/myself',
  myFeedback: '/portal/feedback',
  // myApprove: '/portal/approve/myself',

  approveDetail: '',

  comment: '/portal/comment',

  pageFeedback: '/portal/feedback/page',
  pageNotice: '/portal/notice/page',

  card: '/portal/card/collection'
}

export default api
/**
 * 获取我的公告
 * created by fanjiao
 */
export function getMyNotice (parameter) {
  return axios({
    url: api.myNotice,
    method: 'get',
    params: parameter
  })
}
/**
 * 获取我的卡片
 * created by fanjiao
 */
export function getMyselfCard (parameter) {
  return axios({
    url: api.myCard,
    method: 'get',
    params: parameter
  })
}
/**
 * 移除我的卡片
 * @param {*} params
 */
export function delMyselfCard (params) {
  return axios({
    url: api.myCard,
    method: 'delete',
    params: params
  })
}
/**
 * 移动我的卡片
 * @param {*} params
 */
export function moveMyselfCard (params) {
  return axios({
    url: api.myCard + '/move?data=' + params,
    method: 'put'
  })
}
/**
 * 添加卡片
 */
export function addCard (parameter) {
  return axios({
    url: api.card,
    method: 'post',
    data: parameter
  })
}
/**
 * 删除卡片
 */
export function delCard (parameter) {
  return axios({
    url: api.myCard,
    method: 'delete',
    params: parameter
  })
}
/**
 * 获取全部卡片
 */
export function getCard () {
  return axios({
    url: api.card,
    method: 'get'
  })
}
/**
 * 我的工具
 * created by fanjiao
 */
export function getMyselfTool (parameter) {
  return axios({
    url: api.myTools,
    method: 'get',
    data: parameter
  })
}
/**
 * 添加我的反馈
 * created by fanjiao
 */
export function addFeedback (parameter) {
  return axios({
    url: api.myFeedback,
    method: 'post',
    data: parameter
  })
}
/**
 * 删除我的反馈
 * created by fanjiao
 */
export function delFeedback (parameter) {
  return axios({
    url: api.myFeedback + '/' + parameter,
    method: 'delete'
  })
}
/**
 * 修改我的反馈
 * created by fanjiao
 */
export function updateFeedback (parameter) {
  return axios({
    url: api.myFeedback,
    method: 'put',
    data: parameter
  })
}
/**
 * 分页查询我的反馈
 * created by fanjiao
 */
export function getFeedback (parameter) {
  return axios({
    url: api.myFeedback + '/page',
    method: 'get',
    params: parameter
  })
}
/**
 * 查看评论
 * created by fanjiao
 */
export function getComment (parameter) {
  return axios({
    url: api.comment + '/feedback',
    method: 'get',
    params: parameter
  })
}
/**
 * 添加评论
 * created by fanjiao
 */
export function addComment (parameter) {
  return axios({
    url: api.comment,
    method: 'post',
    data: parameter
  })
}
/**
 * 删除评论
 * created by fanjiao
 */
export function delComment (parameter) {
  return axios({
    url: api.comment + '/' + parameter,
    method: 'delete'
  })
}
/**
 * 查询公告
 */
export function getMySelfNoticePage (parameter) {
  return axios({
    url: api.myNotice + '/page',
    method: 'get',
    params: parameter
    // data: parameter
  })
}
// /**
// * 分页查询审批
// */
// export function getApprovePage (parameter) {
//   return axios({
//     url: api.myApprove + '/page',
//     method: 'get',
//     params: parameter
//   })
// }
/**
* 查询审批详情
*/
export function getApproveGroupDetail (parameter) {
  return axios({
    url: api.approveDetail,
    method: 'get',
    params: parameter
  })
}
