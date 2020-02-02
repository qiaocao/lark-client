<!--
组件使用指南
组件功能：文件断点续传

使用方法：

        引用组件：import FileUpload from '@/components/file/FileUpload'

        这里用到插槽，可自定义上传按钮样式，用法如下：
        <File-upload>
          <a-button>
            <a-icon type="upload" /> Click to Upload
          </a-button>
        </File-upload>
-->
<template>
  <div>
    <a-upload
      name="file"
      :showUploadList="false"
      :beforeUpload="(file) => fileUpload.beforeUpload(file)"
      :customRequest="(data) => fileUpload.customRequest(data)"
    >
      <slot></slot>
    </a-upload>
    <!-- 文件上传进度条 -->
    <a-modal
      v-model="fileUpload.progressVisible"
      :closable="false"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
    >
      <a-progress
        :percent="fileUpload.percent"
        :format="(percent)=>parseInt(fileUpload.percent) + '%'"
      />
      <a-button
        @click="fileUpload.cancelUpload"
        icon="stop"
      >取消上传</a-button>
    </a-modal>
  </div>
</template>
<script>
import FileUpload from './upload'

export default {
  name: 'FileUpload',
  props: {
    secretLevel: {
      type: Number,
      default: 30,
      required: false
    }
  },
  data () {
    return {
      fileUpload: new FileUpload({
        success: this.handleSuccess,
        secretLevel: this.secretLevel
      })
    }
  },
  methods: {
    /**
     * @description 文件上传成功后的回调
     * @method handleSuccess
     * @param {Object} result 文件信息
     */
    handleSuccess (fileInfo) {
      this.$emit('success', fileInfo)
    }
  }
}
</script>
<style lang="less" scoped>
</style>
