
const faceUtils = {
  alt: [
    '[K歌]', '[NO]', '[OK]', '[爱你]', '[爱情]', '[爱心]', '[傲慢]', '[白眼]', '[棒棒糖]', '[抱拳]', '[爆筋]', '[鄙视]', '[闭嘴]', '[鞭炮]', '[便便]', '[擦汗]', '[菜刀]', '[差劲]', '[钞票]', '[车头]',
    '[车尾]', '[车厢]', '[呲牙]', '[打哈欠]', '[大兵]', '[大哭]', '[蛋糕]', '[刀]', '[得意]', '[灯笼]', '[电灯泡]', '[凋谢]', '[发财]', '[发呆]', '[发抖]', '[发怒]', '[饭]', '[飞机]', '[飞吻]', '[奋斗]',
    '[风车]', '[尴尬]', '[勾引]', '[购物]', '[鼓掌]', '[害羞]', '[憨笑]', '[喝彩]', '[喝奶]', '[坏笑]', '[挥手]', '[回头]', '[饥饿]', '[激动]', '[街舞]', '[戒指]', '[惊恐]', '[惊讶]', '[咖啡]', '[磕头]',
    '[可爱]', '[可怜]', '[抠鼻]', '[骷髅]', '[酷]', '[快哭了]', '[困]', '[篮球]', '[冷汗]', '[礼物]', '[流汗]', '[流泪]', '[玫瑰]', '[面]', '[难过]', '[闹钟]', '[怄火]', '[啤酒]', '[瓢虫]', '[撇嘴]',
    '[乒乓]', '[祈祷]', '[气球]', '[汽车]', '[强]', '[敲打]', '[亲亲]', '[青蛙]', '[晴天]', '[糗大了]', '[拳头]', '[弱]', '[色]', '[沙发]', '[闪电]', '[胜利]', '[示爱]', '[手枪]', '[衰]', '[双喜]', '[睡]',
    '[太阳]', '[调皮]', '[跳绳]', '[跳跳]', '[偷笑]', '[吐]', '[微笑]', '[委屈]', '[握手]', '[西瓜]', '[下雨]', '[吓]', '[献吻]', '[香蕉]', '[象棋]', '[心碎]', '[信]', '[熊猫]', '[嘘...]', '[药]', '[疑问]',
    '[阴险]', '[拥抱]', '[右哼哼]', '[右太极]', '[雨伞]', '[月亮]', '[晕]', '[再见]', '[炸弹]', '[招财猫]', '[折磨]', '[纸巾]', '[咒骂]', '[猪头]', '[抓狂]', '[转圈]', '[足球]', '[左哼哼]', '[左太极]'
  ],
  faces: function () {
    const self = this
    const arr = {}
    for (let i = 0; i < self.alt.length; i++) {
      arr[self.alt[i]] = '/face/' + self.alt[i] + '.png'
    }
    return arr
  }
}
/**
 * 为链接增加http协议
 * @param {String} oUrl 原始url地址
 */
const addProtocol = (oUrl) => {
  let result = oUrl
  const protocal = /^https?|ftp/
  if (oUrl && oUrl.search(protocal) < 0) {
    result = 'http://' + oUrl
  }
  return result
}
/**
 * 处理投票链接
 * @param {String} oContent
 */
const handleVoteLink = (oContent) => {
  let result = oContent
  if (oContent && oContent.includes('/userVote/')) {
    result = `
      <span style="color: blue">【点击下方链接参与投票】</span>
      <div>
        ${oContent}
      </div>
    `
  }
  return result
}
/**
 * 将文本中的网址文本转为链接文本
 * @param {String} str 带转化的字符串
 */
const urlToLink = (str) => {
  str = handleVoteLink(str)
  // const re = /(https?:\/\/|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost)((\w|=|\?|\.|\/|&|-|:)+)/g
  // eslint-disable-next-line no-useless-escape
  const re = /((http[s]{0,1}|ftp):\/\/[a-zA-Z0-9\.\-]+\.([a-zA-Z]{2,4})(:\d+)?(\/[a-zA-Z0-9\.\-~!@#$%^&*+?:_\/=<>]*)?)|(www.[a-zA-Z0-9\.\-]+\.([a-zA-Z]{2,4})(:\d+)?(\/[a-zA-Z0-9\.\-~!@#$%^&*+?:_\/=<>]*)?)|((http[s]{0,1}|ftp):\/\/)?(([0-9]+\.){3})([0-9]+)(:\d+)?(\/[a-zA-Z0-9\.\-~!@#$%^&*+?:_\/=<>]*)?/g
  str = str.replace(re, (website) => {
    const link = addProtocol(website)
    return `<a href='${link}' target='_blank'>${website}</a>`
  })
  return str
}
const transform = (content) => {
  const fa = faceUtils.faces()
  if (content) {
    content = content
      // eslint-disable-next-line
      .replace(/face\[([^\s\[\]]+?)]/g, function (face) {
        // 转义表情
        const alt = face.replace(/^face/g, '')
        const isFace = faceUtils.alt.includes(alt)
        if (isFace) {
          return '<img width="24px" height="24px" alt="' + fa[alt] + '" title="' + fa[alt] + '" src="' + fa[alt] + '">'
        }
        // return content
      }).replace(/\n/g, '<br/>')
  }
  // 处理链接
  content = urlToLink(content)
  return content
}

export {
  faceUtils,
  transform
}
