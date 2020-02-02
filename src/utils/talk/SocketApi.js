/**
 * websocket接口类
 */
import store from '@/store'
import { ONLINE_STATUS } from '@/utils/constants'
import {
  handleWsOpen,
  handleMessage,
  handleCreateGroup,
  handleMessageAck,
  handleDogChange,
  handleOnlineChange
} from './modules/talk'
import {
  onMeetingMsg,
  onMeetingState
} from './modules/meeting'

/**
 * 消息处理函数
 * @param {Object} ws websocket
 * @param {Object} messageEvent WS消息
 */
const handleWSMsg = (WS, messageEvent) => {
  const received = JSON.parse(messageEvent.data)
  switch (received.code) {
    // 群组和个人消息处理方式相同
    case 0:
      console.log('个人')
      handleMessage(received.data)
      break
    case 1:
      console.log('群')
      handleMessage(received.data)
      break
    case 10:
      handleCreateGroup(received.data)
      break
    case 11:
      console.log('应答消息', received)
      handleMessageAck(received)
      break
    case 900:
      onMeetingMsg(received.data)
      break
    case 903:
      console.log('会议议程变更')
      onMeetingState(received.data)
      break
    case 907:
      // 会议通过审批
      console.log('会议通过审批')
      WS.ws.send(messageEvent.data)
      // 会议通过审批后加入会议列表
      onMeetingState(received.data)
      break
    case 4000:
      console.log('有状态变更通知')
      handleDogChange(received.data)
      break
    case 3:
      console.log(messageEvent.data)
      // 辅助服务端进行群组创建
      WS.ws.send(messageEvent.data)
      break
    case 4:
      // 辅助服务端进行群组编辑
      WS.ws.send(messageEvent.data)
      break
    case 7000:
      handleOnlineChange(received.data)
      break
    default:
      break
  }
}
class SocketApi {
  /**
   * 构造函数
   * @param {String} wsProtocol 接口协议
   * @param {String} ip ip地址
   * @param {Sting} port 接口号
   * @param {String} paramStr 加在url后面的请求参数，形如：?id=12
   * @param {String} param 作为tio.ws对象的参数，由业务自己使用，框架不使用
   * @param {Number} heartbeatTimeout 心跳时间 单位：毫秒
   * @param {Number} reconnInterval 重连间隔时间 单位：毫秒
   * @param {String} binaryType 返回websocket连接所传输二进制数据的类型
   */
  constructor ({ wsProtocol, ip = '127.0.0.1', port = '9326', paramStr, param, heartbeatTimeout = 50000, reconnInterval = 1000, binaryType = 'arraybuffer', needRecon = true } = {}) {
    this.wsProtocol = wsProtocol
    this.ip = ip
    this.port = port
    this.url = 'ws://' + this.ip + ':' + this.port
    this.binaryType = binaryType

    if (paramStr) {
      this.url += '?' + paramStr
    }
    this.param = param
    this.heartbeatTimeout = heartbeatTimeout
    this.reconnInterval = reconnInterval
    this.heartbeatSendInterval = heartbeatTimeout / 2
    this.needRecon = needRecon
  }

  /**
   * 最后一次通信时间
   */
  lastInteractionTime () {
    const len = arguments.length
    if (len === 1) {
      this.lastInteractionTimeValue = arguments[0]
    }
    return this.lastInteractionTimeValue
  }

  /**
   * 建立websocket连接
   * @param {String} userId 用户id
   */
  connect (userId, userPId) {
    userId = userId || store.getters.userId
    userPId = userPId || store.getters.userPId
    const wsURL = this.url + '?userId=' + userId + '&userPId=' + userPId
    const ws = new WebSocket(wsURL)
    // 设置在线状态为连接中
    store.commit('SET_ONLINE_STATE', ONLINE_STATUS.LANDING)
    this.ws = ws

    ws.binaryType = this.binaryType

    const self = this

    // 已经建立websocket连接
    ws.onopen = openEvent => {
      self.lastInteractionTime(new Date().getTime())
      handleWsOpen()
      // 定时发送心跳
      self.pingIntervalId = setInterval(() => {
        self.ping(self)
      }, self.heartbeatSendInterval)
    }

    // 收到websocket消息
    ws.onmessage = messageEvent => {
      const time = new Date()
      handleWSMsg(this, messageEvent)
      self.lastInteractionTime(time.getTime())
    }

    // websocket连接关闭
    ws.onclose = closeEvent => {
      clearInterval(self.pingIntervalId)
      if (self.needRecon) {
        // 设置在线状态为已断开
        store.commit('SET_ONLINE_STATE', ONLINE_STATUS.OFFLINE)
        // 重连的处理逻辑
        self.reconn()
      }
    }

    ws.onerror = errorEvent => {
      self.close(4001, '连接出现错误')
      // 出错的处理逻辑
      // ···
    }

    return ws
  }

  /**
   * 重连websocket
   */
  reconn () {
    const self = this
    setTimeout(() => {
      self.ws = self.connect()
    }, self.reconnInterval)
  }

  /**
   * 心跳
   */
  ping () {
    const iv = new Date().getTime() - this.lastInteractionTime()

    if ((this.heartbeatSendInterval + iv) >= this.heartbeatTimeout) {
      this.ws.send('心跳内容')
    }
  }

  /**
   * 发送数据
   * @param {Object} data 发送的数据
   */
  send (data) {
    console.log(data)
    this.ws.send(data)
  }

  /**
   * 关闭websocket连接
   * @param {Number} code 关闭原因代码
   * @param {String} reason 关闭原因描述
   */
  close (code, reason) {
    // 设置登录状态为正在断开
    store.commit('SET_ONLINE_STATE', ONLINE_STATUS.EXITING)

    if (this.ws) {
      this.ws.close(code, reason)
    }
  }

  /**
   * 获取websocket连接状态
   */
  readyState () {
    return this.ws.readyState
  }
}

export default SocketApi
