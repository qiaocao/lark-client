import { axios } from '@/utils/request'

const api = {
  groupInfo: 'chat/zzGroup/getGroupInfo',
  groupList: 'chat/zzGroup/queryGroupListByUserId',
  contactsInfo: 'admin/user/',
  contactsTree: 'admin/api/contacts',
  searchUsers: '/admin/user/page',
  recentContacts: 'chat/zzGroup/queryContactListById',
  talkMap: 'chat/zzGroup/queryHistoryMessageById',
  talkHistory: 'chat/history',
  getHistory: 'chat/zzGroup/queryHistoryMessageForSingle',
  getTalksetting: 'chat/zzGroup/getGroupInfo',
  getMoreInfo: '/talk/contacts/info',
  fileGrabble: 'chat/zzGroupFile/groupfile',
  setFileApproveFLg: 'chat/zzFileManage/setFileApproveFLg',
  groupFileListByMe: 'chat/zzGroupFile/groupFileListByMe',
  groupFileListByPass: 'chat/zzGroupFile/groupFileListByPass',
  groupFileListByOwner: 'chat/zzGroupFile/groupFileListByOwner',
  getPrivateFile: 'chat/zzPrivateMsg/privateFile',
  userfileGrabble: 'chat/zzPrivateMsg/privateFile',
  talkHistoryAll: 'chat/zzGroup/queryHistoryMessageForSingle',
  getGroupMembers: 'chat/zzGroup/getGroupUserList',
  // removeMember: 'chat/zzGroup/removeMember',
  // addMember: 'chat/zzGroup/addMember',
  editGroup: 'chat/zzGroup/editGroup',
  // 文件下载地址
  fileDownload: 'file/sensitiveDownload',
  grouprecord: 'chat/zzGroupStatus/query',
  // 群组审批
  approvePage: 'chat/zzGroupApprove/getApproveList',
  approveDetail: 'chat/zzGroupApprove/getApproveGroupDetail',
  approveGroup: 'chat/zzGroupApprove/approve',
  imgPrevie: '/fdfs/file/getSensitiveImage',
  // 创建群组（带审批）
  createTalkApproval: 'chat/zzGroupApprove/add',
  // 获取当前登录人申请会议（群）列表
  getRequestList: 'chat/zzGroupApprove/getApplyGroupList',
  // 搜索联系人
  searchContacts: 'admin/user/findUsers',
  // 登陆时获取在线人员列表（id）
  getUserOnlie: 'chat/zzUserOnline/getAllOnlineUserList'
}
export default api

/**
 * 通过群组id获取群组详细信息
 * @param {String} groupId 群组id
 */
export function getGroupInfo (groupId) {
  return axios({
    url: api.groupInfo,
    method: 'GET',
    params: {
      groupId: groupId
    }
  })
}

/**
 * 通过联系人id获取联系人详细信息
 * @param {String} contactsId 联系人id
 */
export function getContactsInfo (id) {
  return axios({
    url: api.contactsInfo + id,
    method: 'GET'
  })
}

/**
 * 获取群组列表
 * @param {String} userId 当前用户id
 */
export function getGroupList (userId) {
  return axios({
    url: api.groupList,
    method: 'GET',
    params: {
      userId: userId
    }
  })
}

/**
 * 获取联系人树
 */
export function getContactsTree (orgCode) {
  return axios({
    url: api.contactsTree,
    method: 'GET',
    params: { orgCode }
  })
}

/**
 * 获取最近联系人列表
 * @param {String} userId 当前用户id
 */
export function getRecentContacts (userId) {
  return axios({
    url: api.recentContacts,
    method: 'GET',
    params: {
      userId: userId
    }
  })
}

/**
 * 获取未读消息
 * @param {String} userId 当前用户id
 */
export function getTalkMap (userId) {
  return axios({
    url: api.talkMap,
    method: 'GET',
    params: {
      userId: userId
    }
  })
}

/**
 * 获取指定联系人的研讨记录
 * @param {String} userId 当前用户id
 * @param {String} contactId 指定联系人id
 */
export function getTalkHistory (userId, contactId) {
  return axios({
    url: api.talkHistory,
    method: 'GET',
    params: {
      userId: userId,
      contactId: contactId
    }
  })
}

/**
 * 聊天历史记录
 */
export function getHistory (parameter) {
  return axios({
    url: api.getHistory,
    method: 'get'
  })
}

/**
 * 群组Talksetting
 */

export function getTalksetting (parameter) {
  return axios({
    url: api.getTalksetting,
    method: 'get',
    params: {
      groupId: parameter
    }
  })
}

/**
 * fileGrabble
 */
export function fileGrabble (parameter) {
  return axios({
    url: api.fileGrabble,
    method: 'post',
    params: parameter
  })
}

/**
 * 联系人判断历史消息
 */
export function talkHistoryAll (userId, isGroup, id, query, page) {
  return axios({
    url: api.talkHistoryAll,
    method: 'get',
    params: {
      userId: userId,
      isGroup: isGroup,
      contactId: id,
      query: query,
      page: page,
      size: 30
    }
  })
}
/**
 * 联系人文件
 * userd receiver page size
 */
export function getPrivateFile (parameter) {
  return axios({
    url: api.getPrivateFile,
    method: 'post',
    params: parameter
  })
}
/**
 * 我的文件(群组)
 */
export function groupFileListByMe (parameter) {
  return axios({
    url: api.groupFileListByMe,
    method: 'post',
    params: parameter
  })
}
/**
 * 我的审批(群组)
 */
export function groupFileListByOwner (parameter) {
  return axios({
    url: api.groupFileListByOwner,
    method: 'post',
    params: parameter
  })
}
/**
 * 已审批(群组)
 */
export function groupFileListByPass (parameter) {
  return axios({
    url: api.groupFileListByPass,
    method: 'post',
    params: parameter
  })
}
/**
 * 审批文件
 */
export function setFileApproveFLg (parameter) {
  return axios({
    url: api.setFileApproveFLg,
    method: 'post',
    params: parameter
  })
}
/**
 * 群成员列表
 * ?groupId=
 */
export function getGroupMembers (groupId) {
  return axios({
    url: api.getGroupMembers,
    method: 'get',
    params: {
      groupId
    }
  })
}
/**
 * 群成员列表（分页）TODO
 */
export function getGroupMembersPage (parameter) {
  return axios({
    url: api.getGroupMembers,
    method: 'get',
    params: parameter
  })
}
/**
 * 群组新增成员
 */
export function addMember (parameter) {
  return axios({
    url: api.editGroup,
    method: 'post',
    data: parameter
  })
}
/**
 * 移出群组
 */
export function removeMember (parameter) {
  return axios({
    url: api.editGroup,
    method: 'get',
    params: parameter
  })
}
/**
 * 文件下载
 * @param {String} fileId 文件ID
 */
export function fileDownload (fileId, progress) {
  return axios({
    baseURL: '/fdfs',
    timeout: 600000, // 请求超时时间
    url: api.fileDownload,
    method: 'get',
    params: { fileId: fileId },
    responseType: 'blob',
    onDownloadProgress: function (e) {
      if (progress) {
        progress(e)
      }
    }
  })
}
/**
 * 查询群变动信息
 * @param {*} parameter
 */
export function queryGroupRecord (parameter) {
  return axios({
    url: api.grouprecord,
    method: 'post',
    params: parameter
  })
}
/**
 * 获取群组审批列表
 * @param {String} params 用户id
 */
export function groupApprovePage (params) {
  return axios({
    url: api.approvePage,
    method: 'get',
    params: params
  })
}

/**
 * 获取群组审批列表
 * @param {String} params 用户id
 */
export function groupApproveDetail (params) {
  return axios({
    url: api.approveDetail,
    method: 'get',
    params: { id: params }
  })
}
/**
 * 审批 1-通过 2-不通过
 * @param {String} params 用户id和approveFlg
 */
export function groupApprove (params) {
  return axios({
    url: api.approveGroup,
    method: 'put',
    params: params
  })
}
/*
 * 提交创建群组审批
 */
export function createTalkApproval (data) {
  return axios({
    url: api.createTalkApproval,
    method: 'POST',
    data: data
  })
}

/**
 * 获取当前登录人申请会议（群）列表
 * pageSize ：每页条数
 * pageNo ：第几页
 * approveFlg ：0未审批1通过2不通过3已审批4全部
 * type ：0 群，1会议, -1全部
 */
export function getRequestList (pageSize, pageNo, approveFlg, type) {
  return axios({
    url: api.getRequestList,
    method: 'get',
    params: {
      pageSize: pageSize,
      pageNo: pageNo,
      approveFlg: approveFlg,
      type: type
    }
  })
}

/**
 * 研讨搜索联系人信息
 * 获取用户列表
 */
export function getSearchUsers (parameter) {
  return axios({
    url: api.searchContacts,
    method: 'get',
    params: parameter
  })
}

/**
 * 获取在线人员信息
 * @param {String} params 用户id
 */
export function getUserOnlieList (parameter) {
  return axios({
    url: api.getUserOnlie,
    method: 'get',
    params: parameter
  })
}
