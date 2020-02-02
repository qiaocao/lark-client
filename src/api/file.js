import axios from 'axios'
import { axios as fileaxios } from '@/utils/request'

/**
 * 文件上传
 * 支持断点续传
 * parameter：参数
 * data：头信息
 * func：上传进度
 * 调用方式
 * upload: new UploadFile()//声明对象
 * this.upload.execute(参数)//上传
 * this.upload.cancel(参数)//取消
 */
export function UploadFile () {
  const CancelToken = axios.CancelToken
  const self = this
  this.cancel = function () {}
  this.execute = function (parameter, data, progress) {
    if (data.key) {
      data.key = encodeURI(data.key, 'UTF-8')
    }
    if (data.totalSize) {
      data.totalSize = encodeURI(data.totalSize, 'UTF-8')
    }
    if (data.currentNo) {
      data.currentNo = encodeURI(data.currentNo, 'UTF-8')
    }
    if (data.fileName) {
      data.fileName = encodeURI(data.fileName, 'UTF-8')
    }
    if (data.fileType) {
      data.fileType = encodeURI(data.fileType, 'UTF-8')
    }
    if (data.fileSize) {
      data.fileSize = encodeURI(data.fileSize, 'UTF-8')
    }
    if (data.levels) {
      data.levels = encodeURI(data.levels, 'UTF-8')
    }
    return fileaxios({
      baseURL: '/fdfs',
      timeout: 600000, // 请求超时时间
      url: '/file/appendUploadFile',
      method: 'post',
      data: parameter,
      headers: data,
      // 用来监控上传进度
      onUploadProgress: function (e) { progress(e) },
      cancelToken: new CancelToken(function executor (c) {
        // An executor function receives a cancel function as a parameter
        self.cancel = function () {
          c('cancel upload')
        }
      })
    })
  }
}
