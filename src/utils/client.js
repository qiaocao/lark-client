
/**
 * 适配云雀客户端的方法
 */

import {
  MESSAGE_TYPE,
  SECRETLEVEL_ENUM,
  FILE_SERVER_IP
} from '@/utils/constants'
/**
 * 客户端新消息提醒
 * @param {Tweet} message 消息对象
 */
export function messagePopup (message) {
  const data = parseInfo(message)
  const info = {
    code: 4700,
    data
  }
  // window.parent.postMessage(info, '*')
  console.log(JSON.stringify(info))
}

/** 解析新消息，生成用户客户端提醒的消息内容
 * @param {Tweet} message 消息对象
 */
function parseInfo (message) {
  const info = {
    title: '',
    props: {
      icon: '',
      tag: '',
      body: '',
      data: {}
    }
  }
  const { contactInfo = {}, content = {} } = message
  const hasIcon = contactInfo.avatar && contactInfo.avatar.length
  const body = `[${SECRETLEVEL_ENUM.get(content.secretLevel).file}]` +
    `${MESSAGE_TYPE.get(content.type || 1)}` +
    `${content.title}`

  info.title = contactInfo.name
  info.props.icon = hasIcon ? FILE_SERVER_IP + contactInfo.avatar : ''
  info.props.tag = contactInfo.id
  info.props.body = body
  info.props.data = message
  return info
}
