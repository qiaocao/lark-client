import { axios } from '@/utils/request'

const meetingApi = {
  /* 会议创建接口地址 */
  createMeeting: 'chat/zzGroupApprove/add',
  /* 会议列表接口地址 */
  meetingList: 'chat/zzMeeting/getMeetingListForContacts',
  /** 查询一个会议的所有消息 */
  meetingHistory: 'chat/zzGroup/queryMessageList',
  /* 会议状态接口地址 */
  // meetingState: '/test/test/test',
  /* 可选会议议程接口地址 */
  agendaCodeList: 'chat/zzMeeting/getMeetProgressCodeList',
  /* 可选会议角色接口地址 */
  roleCodeList: 'chat/zzMeeting/getMeetRoleCodeList',
  /* 会议文件列表 */
  fileList: 'chat/zzGroupFile/getGroupFileList',
  /* 删除会议文件 */
  deleteFile: 'chat/zzGroupFile/delete',
  /* 会议文件上传 */
  uploadMFile: 'chat/zzGroupFile/saveFileInfByJson',
  /* 更新文件类型 */
  updateFileType: 'chat/zzGroupFile/update',
  /* 会议成员列表 */
  memberList: 'chat/zzMeeting/getSingleMeetingInfo',
  /** 选择当前会议议程 */
  selectAgenda: 'chat/zzMeeting/changeMeetAgenda',
  /** 修改发言人 */
  updateSpeakers: 'chat/zzMeetingUser/updateUserList',
  /* 更改会议成员角色 */
  memberRoleList: 'chat/zzMeetingUser/updateUser',
  /** 更新会议议程 */
  updateAgenda: 'chat/zzMeeting/changeMeetAgendaList'
}

/**
 * 创建会议
 * @param {Object} data 创建会议信息
 */
const createMeeting = (data) => {
  return axios({
    url: meetingApi.createMeeting,
    method: 'POST',
    data: data
  })
}
/**
 * 查询会议列表
 * @param {String} userId 用户ID
 */
const getMeetingList = (userId) => {
  return axios({
    url: meetingApi.meetingList,
    method: 'GET',
    params: {
      userId
    }
  })
}
/**
 * 查询一个会议的所有消息
 * @param {String} meetingId 会议ID
 */
const getMeetingHistory = (meetingId) => {
  return axios({
    url: meetingApi.meetingHistory,
    method: 'GET',
    params: {
      type: 'MEET',
      receiver: meetingId
    }
  })
}
/**
 * 查询可选会议议程
 */
const getAgendaCodeList = () => {
  return axios({
    url: meetingApi.agendaCodeList,
    method: 'GET'
  })
}
/**
 * 查询可选参会角色
 */
const getRoleCodeList = () => {
  return axios({
    url: meetingApi.roleCodeList,
    method: 'GET'
  })
}
// **********文件相关**************
/**
 * 获取会议文件列表
 * @param {String} meetingId 会议ID
 */
const getMeetingFile = (meetingId) => {
  return axios({
    url: meetingApi.fileList,
    method: 'POST',
    params: {
      page: 1,
      size: 1000,
      groupId: meetingId,
      isGroup: 905
    }
  })
}
/**
 * 删除会议文件
 * @param {String} id 文件ID
 */
const deleteFile = (id) => {
  return axios({
    url: meetingApi.deleteFile,
    method: 'POST',
    params: { id }
  })
}
/**
 * 上传会议文件
 * @param {Object} info 文件信息
 */
const uploadMFile = (info) => {
  return axios({
    url: meetingApi.uploadMFile,
    method: 'POST',
    data: info
  })
}
/**
 * 修改文件类型
 * @param {String} fileId 文件ID
 * @param {String} meetFileType 文件类型码
 */
const updateFileType = (fileId, meetFileType) => {
  return axios({
    url: meetingApi.updateFileType,
    method: 'POST',
    data: {
      fileId,
      meetFileType
    }
  })
}
// **********成员相关**************
/**
 * 获取会议成员列表
 * @param {String} meetId 会议ID
 */
const getMeetingMember = (meetId) => {
  return axios({
    url: meetingApi.memberList,
    method: 'GET',
    params: { meetId }
  })
}
/**
 * 更改会议成员角色
 * @param {String} meetingId会议id
 * @param {String} userId会议id
 */
const updateUserRoleList = (data) => {
  return axios({
    url: meetingApi.memberRoleList,
    method: 'put',
    data
  })
}
// ************会议状态编辑相关*****************
/**
 * 切换会议议程
 * @param {Object} data {meetingId、code}
 */
const selectAgenda = (data) => {
  return axios({
    url: meetingApi.selectAgenda,
    method: 'PUT',
    data
  })
}
/**
 * 修改发言人
 * @param {Object} data {meetingId userId canMsg userLevel roleCode}
 */
const updateSpeakers = (data) => {
  return axios({
    url: meetingApi.updateSpeakers,
    method: 'PUT',
    data
  })
}
/**
 * @params {String} id 会议ID
 * @params {String} allProgress 议程代码串
 * 更新会议议程
 */
const updateAgenda = (id, allProgress) => {
  return axios({
    url: meetingApi.updateAgenda,
    method: 'PUT',
    data: { id, allProgress }
  })
}

export {
  meetingApi,
  createMeeting,
  getMeetingHistory,
  getMeetingList,
  getAgendaCodeList,
  getRoleCodeList,
  getMeetingFile,
  deleteFile,
  uploadMFile,
  updateFileType,
  getMeetingMember,
  updateUserRoleList,
  selectAgenda,
  updateSpeakers,
  updateAgenda
}
