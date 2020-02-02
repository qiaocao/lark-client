/* eslint-disable camelcase */
const config = {
  text: 'Hello world',
  font: '16px serif',
  opacity: 0.6,
  density: 1,
  rotate: (-1 / 6) * Math.PI,
  z_index: 2018,
  color: 'rgba(151,168,190)',
  yOffset: 3
}

/**
 * 为元素添加水印
 * @param {String} text 'Hello world'	the text as watermark
 * @param {String} font '16px serif'	Font size and the style of text
 * @param {Number} opacity 0.6	the opactity of watermark
 * @param {Number} density 1	the density of watermark
 * @param {rad} rotate -1 / 6 * Math.PI	the rotate of watermark
 * @param {Number} z_index 2018	the element's z-index which has watermark
 * @param {String} color 'rgba(151,168,190,0.6)'	Text color, you can use HEX or RGBA color codes
 * @param {Number} yOffset 3	control the start point of text
 */
class Watermark {
  constructor ({
    text = config.text,
    opacity = config.opacity,
    density = config.density,
    rotate = config.rotate,
    z_index = config.z_index,
    font = config.font,
    color = config.color,
    yOffset = config.yOffset
  } = config) {
    this.text = text
    this.density = density
    this.opacity = opacity
    this.rotate = rotate
    this.z_index = z_index
    this.font = font
    this.color = color
    this.yOffset = yOffset

    this._setStamp = () => {
      const canvasEl = document.createElement('canvas')
      const ctx = canvasEl.getContext('2d')

      ctx.fillStyle = this.color
      ctx.font = this.font
      const fontSize = this.font.replace(/(\d+)(?=px).*/, '$1')
      const text = ctx.measureText(this.text)
      const txtLen = text.width + fontSize * this.yOffset

      canvasEl.width = txtLen * 2
      canvasEl.height = txtLen * 2

      ctx.translate(txtLen, txtLen)
      ctx.rotate(this.rotate)
      ctx.fillStyle = this.color
      ctx.font = this.font
      ctx.fillText(this.text, fontSize * this.yOffset, 0)

      return canvasEl
    }

    this._compositeStamp = () => {
      const stamp = this._setStamp()
      const stampLen = stamp.getAttribute('width') / 2

      const canvasEl = document.createElement('canvas')
      // 保证水印可以完全展示
      const len = 200 * this.density > stampLen ? 200 * this.density : stampLen
      canvasEl.width = len * 2
      canvasEl.height = len * 2
      const ctx = canvasEl.getContext('2d')
      ctx.translate(len, len)

      const sinValueByRotate = Math.sin(this.rotate)
      const cosValueByRotate = Math.cos(this.rotate)

      //  上左
      if (
        sinValueByRotate <= 0 &&
        sinValueByRotate > -1 &&
        cosValueByRotate > 0 &&
        cosValueByRotate <= 1
      ) {
        ctx.drawImage(
          stamp,
          stampLen,
          0,
          stampLen,
          stampLen,
          0,
          0,
          stampLen,
          stampLen
        )
        ctx.drawImage(
          stamp,
          stampLen,
          0,
          stampLen,
          stampLen,
          -len,
          -len,
          stampLen,
          stampLen
        )
      }
      // 上右
      if (
        sinValueByRotate < 0 &&
        sinValueByRotate >= -1 &&
        cosValueByRotate <= 0 &&
        cosValueByRotate < 1
      ) {
        ctx.drawImage(stamp, 0, 0, stampLen, stampLen, 0, 0, stampLen, stampLen)
        ctx.drawImage(
          stamp,
          0,
          0,
          stampLen,
          stampLen,
          -len,
          -len,
          stampLen,
          stampLen
        )
      }
      // 下右
      if (
        sinValueByRotate >= 0 &&
        sinValueByRotate < 1 &&
        cosValueByRotate < 0 &&
        cosValueByRotate >= -1
      ) {
        ctx.drawImage(
          stamp,
          0,
          stampLen,
          stampLen,
          stampLen,
          0,
          0,
          stampLen,
          stampLen
        )
        ctx.drawImage(
          stamp,
          0,
          stampLen,
          stampLen,
          stampLen,
          -len,
          -len,
          stampLen,
          stampLen
        )
      }
      // 下左
      if (
        sinValueByRotate > 0 &&
        sinValueByRotate <= 1 &&
        cosValueByRotate >= 0 &&
        cosValueByRotate < 1
      ) {
        ctx.drawImage(
          stamp,
          stampLen,
          stampLen,
          stampLen,
          stampLen,
          0,
          0,
          stampLen,
          stampLen
        )
        ctx.drawImage(
          stamp,
          stampLen,
          stampLen,
          stampLen,
          stampLen,
          -len,
          -len,
          stampLen,
          stampLen
        )
      }
      return canvasEl.toDataURL()
    }
  }

  /**
   * 注入到指定的元素
   * @param {String} el 元素选择器
   * @param {String} className 水印元素的类名
   */
  embed (el, className) {
    if (!document.querySelector(el)) {
      console.error('el is ' + document.querySelector(el))
      return
    }

    const contain_el = document.querySelector(el)

    const watermark_img = this._compositeStamp()

    const watermark_div = document.createElement('div')
    watermark_div.setAttribute(
      'style',
      `
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: url('${watermark_img}');
      opacity: 0.6;
      z-index: ${this.z_index};
      pointer-events: none;
    `
    )
    watermark_div.setAttribute('class', 'water-mark')
    if (className) {
      watermark_div.setAttribute('class', 'water-mark ' + className)
    }
    contain_el.style.position = 'relative'
    contain_el.insertBefore(watermark_div, contain_el.firstChild)
  }

  /**
   * 移除水印
   * @param {String} className 移除水印的类名 无参数删除所有
   */
  remove (className) {
    const markClass = className || 'water-mark'
    const marks = document.getElementsByClassName(markClass)
    for (let i = 0; i < marks.length; i++) {
      if (marks[i] != null) {
        marks[i].parentNode.removeChild(marks[i])
      }
    }
  }
}
export default Watermark
