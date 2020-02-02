<template>
  <div class="drag-kid">
    <a-modal
      title="选择文件密级"
      v-model="visible"
      @ok="onCompleteSecection"
    >
      <a-radio-group @change="onSecretChange" v-model="secretLevel">
        <a-radio
          v-for="secret in secretList"
          :value="secret"
          :key="secret"
          :class="'s-' + secret"
        >
          【{{ secret | fileSecret }}】
        </a-radio>
      </a-radio-group>
    </a-modal>

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
  name: 'DragUpload',
  props: {
    secretList: {
      type: Array,
      default: () => ([30, 40, 60]),
      required: false
    }
  },
  data () {
    return {
      /* 获取的拖拽文件 */
      dropFile: {},
      fileUpload: {},
      /* 控制密级选择框 */
      visible: false,
      /* 文件的密级 */
      secretLevel: 30
    }
  },
  mounted () {
    this.listenParentDragEvent()
    window.addEventListener('message', this.getFileFromMessageEvent)
  },
  beforeDestroy () {
    window.removeEventListener('message', this.getFileFromMessageEvent)
    this.$el.parentNode.removeEventListener('drop', this.handleDrop)
  },
  methods: {
    /**
     * 获取message事件中的文件信息
     */
    getFileFromMessageEvent (e) {
      if (e.data.type === 'dropfile') {
        if (e.data.data.length === 1 && e.data.data[0].type) {
          this.dropFile = e.data.data[0]
          this.visible = true
          return
        }
        this.$message.warning('只能上传单个文件！')
      }
    },
    /**
     * @description 处理上传成功的方法
     * @method handleSuccess
     * @param {Object} fileInfo 上传的文件信息
     */
    handleSuccess (fileInfo) {
      this.$emit('success', fileInfo)
    },
    /**
     * @description 给父组件添加事件监听
     * @method listenParentDragEvent
     */
    listenParentDragEvent () {
      // const eventList = ['dragenter', 'dragover', 'dragleave', 'drop']
      const dragArea = this.$el.parentNode
      this.preventDefaults(dragArea)
      // this.handleDrop(dragArea)
      dragArea.addEventListener('drop', this.handleDrop)
    },
    /**
     * @description 监听除了drop以外的事件，并禁止默认嗅探行为
     * @method preventDefaults
     * @param {Node} el 监听的元素
     */
    preventDefaults (el) {
      el.addEventListener('dragenter', e => {
        e.preventDefault()
        e.stopPropagation()
      }, false)

      el.addEventListener('dragover', e => {
        e.preventDefault()
        e.stopPropagation()
      }, false)

      el.addEventListener('dragleave', e => {
        e.preventDefault()
        e.stopPropagation()
      }, false)
    },
    /**
     * @description 处理drop事件
     * @method handleDrop
     * @param {Event} dropEvent drop事件
     */
    handleDrop (dropEvent) {
      dropEvent.preventDefault()
      dropEvent.stopPropagation()

      const df = dropEvent.dataTransfer
      // 拖拽的文件，会放到这里
      const dropFiles = []
      // 读取文件是个异步的过程，需要记录处理了多少个文件了
      let dealFileCnt = 0
      // 所有的文件的数量，给非Chrome浏览器使用的变量
      const allFileLen = df.files.length

      // 检测是否已经把所有的文件都遍历过了(非Chrome使用)
      function checkDropFinish () {
        if (dealFileCnt === allFileLen - 1) {
          // TODO:非chrome获取完文件信息
          this.dropFileCallBack(dropFiles)
        }
        dealFileCnt++
      }

      if (df.items !== undefined) {
        // Chrome拖拽文件逻辑
        if (df.items.length > 1) {
          this.$message.warning('只能上传单个文件！')
          return
        }
        for (let i = 0; i < df.items.length; i++) {
          const item = df.items[i]
          if (item.kind === 'file' && item.webkitGetAsEntry().isFile) {
            const file = item.getAsFile()
            dropFiles.push(file)
          } else {
            this.$message.warning('只能上传单个文件！')
            return
          }
        }
        // TODO:chrome获取完文件信息
        this.dropFileCallBack(dropFiles)
      } else {
        // 非Chrome拖拽文件逻辑
        for (let i = 0; i < allFileLen; i++) {
          var dropFile = df.files[i]
          if (dropFile.type) {
            dropFiles.push(dropFile)
            checkDropFinish()
          } else {
            try {
              const fileReader = new FileReader()
              fileReader.readAsDataURL(dropFile.slice(0, 3))

              fileReader.addEventListener('load', function (e) {
                dropFiles.push(dropFile)
                checkDropFinish()
              }, false)

              fileReader.addEventListener('error', function (e) {
                this.$message.warning('不可以上传文件夹！')
                checkDropFinish()
              }, false)
            } catch (e) {
              this.$message.warning('不可以上传文件夹！')
              checkDropFinish()
            }
          }
        }
      }
    },
    /**
     * @description 处理获得的文件
     * @method dropFileCallBack
     * @param {Array} dropFiles 拖拽的文件
     */
    dropFileCallBack (dropFiles) {
      const fileNum = dropFiles.length
      // TODO:多个文件的处理情况
      if (fileNum === 1) {
        this.dropFile = dropFiles[0]
        // 选择密级
        this.visible = true
      }
    },
    onCompleteSecection (e) {
      if (this.secretLevel) {
        this.visible = false
        // TODO:开始上传
        this.fileUpload = new FileUpload({
          success: this.handleSuccess,
          secretLevel: this.secretLevel
        })
        this.fileUpload.beforeUpload(this.dropFile)
        this.fileUpload.customRequest({ file: this.dropFile })
      } else {
        // TODO:提示必须选择密级
      }
    },
    onSecretChange (e) {
      this.secretLevel = e.target.value
    }
  }
}
</script>

<style lang="less" scoped>
  .drag-kid {
    display: none;
  }
</style>
