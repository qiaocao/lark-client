/**
 * @file 文件上传工具
 * @author jihainan
 */
import SparkMD5 from 'spark-md5'
import notification from 'ant-design-vue/es/notification'
import { UploadFile } from '@/api/file'

/**
 * @constant {Object}
 * @description 默认配置
 */
const config = {
  loadsize: 1024 * 1024 * 50,
  currentNo: 1,
  totalSize: 0,
  filesize: 0,
  file: {},
  key: '',
  percent: 0,
  progressVisible: false,
  upload: new UploadFile(),
  success: () => {
    console.log('上传成功')
  },
  secretLevel: 30
}

/**
 * @description 文件上传工具类
 * @constructor 非静态类
 * @class FileUpload
 */
class FileUpload {
  /**
   *
   * @param {Number} loadsize 分块大小
   * @param {Number} currentNo 当前块序号，从1开始
   * @param {Number} totalSize 总分块数
   * @param {Number} filesize 文件大小
   * @param {File} file 文件对象
   * @param {String} key 文件内容md5编码
   * @param {Number} percent 上传进度
   * @param {Boolean} progressVisible 进度条是否可见
   * @param {UploadFile} upload 分块上传请求
   * @param {Number} secretLevel 文件密级
   */
  constructor ({
    loadsize = config.loadsize,
    currentNo = config.currentNo,
    totalSize = config.totalSize,
    filesize = config.filesize,
    file = config.file,
    key = config.key,
    percent = config.percent,
    progressVisible = config.progressVisible,
    upload = config.upload,
    success = config.success,
    secretLevel = config.secretLevel
  } = config) {
    this.loadsize = loadsize
    this.currentNo = currentNo
    this.totalSize = totalSize
    this.filesize = filesize
    this.file = file
    this.key = key
    this.percent = percent
    this.progressVisible = progressVisible
    this.upload = upload
    this.success = success
    this.secretLevel = secretLevel

    /**
     * @description 分块上传文件
     * @method uploadFileSlice
     */
    this.uploadFileSlice = () => {
      const formData = new FormData()
      const startbyte = (this.currentNo - 1) * this.loadsize
      const fileslice = this.blobSlice(this.file,
        startbyte, startbyte + this.loadsize)
      formData.append('file', fileslice)
      this.totalSize = Math.ceil(this.filesize / this.loadsize)
      this.upload.execute(
        formData,
        { 'Content-Type': 'multipart/form-data',
          'key': this.key,
          'totalSize': this.totalSize,
          'currentNo': this.currentNo,
          'fileName': this.file.name,
          'fileType': this.file.type,
          'fileSize': this.file.size,
          'levels': this.secretLevel
        }, this.uploadProgressnc)
        .then(res => {
          const result = res.result
          // 递归终止条件，当前上传的片段为最后一段，上传文件结束
          if (parseInt(result.isSuccessNo) === this.totalSize) {
            // this.$emit('success', res.result)
            this.success({ ...res.result, secretLevel: this.secretLevel })
            this.percent = 100
            notification['success']({
              message: '上传成功',
              duration: 2
            })
            this.progressVisible = false
            return
          }
          // 防止无返回参数或返回参数有误时，无限次递归
          if (parseInt(result.isSuccessNo) < this.totalSize) {
            this.currentNo = result.nextNo
            this.uploadFileSlice()
          }
        }).catch((e) => {
          if (e.message !== 'cancel upload') {
            notification['error']({
              message: '出现异常，请联系系统管理员',
              duration: 4
            })
            this.progressVisible = false
          }
        })
    }

    /**
     * @description 上传文件主方法
     * @method customRequest
     * @param {File} file 将要上传的文件
     */
    this.customRequest = (data) => {
      this.progressVisible = true
      this.percent = 0
      this.currentNo = 1
      const fileReader = new FileReader()
      this.file = data.file
      this.filesize = this.file.size
      // 创建md5对象（基于SparkMD5）
      var spark = new SparkMD5()
      // 将文件读取为二进制码
      fileReader.readAsBinaryString(this.file)
      const _this = this
      // 文件读取完毕之后的处理
      fileReader.onload = function (e) {
        spark.appendBinary(e.target.result)
        _this.key = spark.end()
        _this.uploadFileSlice()
      }
    }

    /**
     * @description 更新上传进度
     * @method uploadProgressnc
     * @param {Event} progressEvent 上传进程事件
     */
    this.uploadProgressnc = (progressEvent) => {
      const complete = ((progressEvent.loaded +
        (this.currentNo - 1) * this.loadsize) /
        this.filesize * 100 | 0)
      this.percent = complete
    }

    /**
     * @description 分割文件
     * @method blobSlice
     * @param {File} blob 待分割的文件
     * @param {Number} startByte 开始位置
     * @param {Number} endByte 结束位置
     */
    this.blobSlice = (blob, startByte, endByte) => {
      const blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice
      return blobSlice && blobSlice.call(blob, startByte, endByte)
    }

    /**
     * @description 上传前的文件监测
     * @method beforeUpload
     * @param {File} file 待上传的文件
     */
    this.beforeUpload = (file) => {
      // 校验上传文件尺寸
      const isMaxSize = file.size / 1024 / 1024 > 500
      const isMinSize = file.size === 0
      if (isMaxSize) {
        notification['error']({
          message: '请上传尺寸小于500MB的文件',
          duration: 4
        })
      }
      if (isMinSize) {
        notification['error']({
          message: '请不要上传空文件',
          duration: 4
        })
      }
      return !isMaxSize && !isMinSize
    }

    /**
     * @description 取消上传
     * @method cancelUpload
     */
    this.cancelUpload = () => {
      this.progressVisible = false
      this.upload.cancel()
    }
  }
}

export default FileUpload
