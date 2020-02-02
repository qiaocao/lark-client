/**
 * constants.js 文件存储所有常量信息
 */

// 密级常量
const SECRETLEVEL_ENUM = new Map([
  ['default', '非密'],
  // 服务端传递的密级参数
  [30, {
    people: '非密',
    file: '非密'
  }],
  [40, {
    people: '一般',
    file: '秘密'
  }],
  [50, {
    people: '一般',
    file: '秘密'
  }],
  [60, {
    people: '重要',
    file: '机密'
  }],
  [70, {
    people: '重要',
    file: '机密'
  }],
  [80, {
    people: '重要',
    file: '机密'
  }],
  [90, {
    people: '重要',
    file: '机密'
  }]
])

// 消息类型
const MESSAGE_TYPE = new Map([
  [1, ''],
  [2, '[图片]'],
  [3, '[文件]'],
  [999, '[会议消息]']
])

// 错误类型
const ERROR_TYPE = {
  TIMEOUT_ERROR: 9, // 超时
  TOKEN_ERROR: 401, // token 失效错误
  PARAM_ERROR: 400, // 参数错误
  FLUSH_TOKEN_ERROR: 7, // 刷新token错误
  SERVER_ERROR: 500 // 刷新token错误
}

// 登录状态常量 同websocket的readyState
const ONLINE_STATUS = {
  /** 正在登录 */
  LANDING: 0,
  /** 在线 */
  ONLINE: 1,
  /** 正在退出 */
  EXITING: 2,
  /** 离线 */
  OFFLINE: 3
}

/*
  1) 文件服务器地址，与前端工程部署的nginx所在地址保持一致，数据库中存储的头像地址为group1/M00/开头的相对地址
  2) 在正式环境中，该地址与前端工程的部署地址一致 或者 直接使用 / （代表源地址）
  3) 为了能正常访问到文件服务器，需要在前端部署的nginx中配置代理，将文件相关的请求代理到文件服务器
*/
// const FILE_SERVER_IP = 'http://10.11.24.129:8080/'
const FILE_SERVER_IP = 'http://47.99.247.83:8080/'

// 与websocket服务端地址保持一致
// const WS_SERVER_IP = '10.11.24.129'
const WS_SERVER_IP = '47.99.247.83'

export {
  SECRETLEVEL_ENUM,
  MESSAGE_TYPE,
  ERROR_TYPE,
  ONLINE_STATUS,
  FILE_SERVER_IP,
  WS_SERVER_IP
}
