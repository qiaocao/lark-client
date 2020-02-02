<template>
  <!-- 会议文件搜索和上传 -->
  <div class="meeting-file">
    <div class="meeting-file-search">
      <a-input-search
        placeholder="搜索文件信息"
        @search="onSearch"
      />

      <a-dropdown placement="bottomLeft">
        <a-button
          :disabled="!UPLOAD_FILE"
          :title="UPLOAD_FILE?'选择上传密级':'无上传权限'"
          style="marginLeft: 8px"
        >
          <a-icon type="upload" />
        </a-button>
        <a-menu slot="overlay">
          <a-menu-item v-for="item in secretList" :key="item">
            <file-upload @success="handleUpload" :secretLevel="item">
              <span
                :class="'s-' + item"
                @click="setSecretLevel(item)"
              >【{{ item | fileSecret }}】</span>
            </file-upload>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <div class="file-sort">
      <a-radio-group v-model="fileSort" @change="sortFile" style="margin:8px">
        <a-radio-button value="all">全部</a-radio-button>
        <a-radio-button value="9000">评审文件</a-radio-button>
        <a-radio-button value="9001">参考文件</a-radio-button>
        <a-radio-button value="9002">结论文件</a-radio-button>
      </a-radio-group>
    </div>

    <!-- 会议文件列表 -->
    <div class="meeting-file-list">
      <a-list
        itemLayout="vertical"
        size="small"
        :loading="loading"
        :dataSource="listData"
        :locale="{emptyText:'无文件'}"
      >
        <a-list-item slot="renderItem" slot-scope="item" :key="item.fileId">
          <div class="file-item">
            <div class="file-title-wrap">
              <div :class="['file-icon', setFileIcon(item.extension).class] ">
                {{ setFileIcon(item.extension).content }}
              </div>
              <div class="file-name">{{ item.fileName }}</div>
            </div>

            <!-- 文件标签 -->
            <a-row type="flex" justify="space-between" class="file-tags">
              <a-col :span="7" class="tag-item" v-for="tag in tags" :key="tag.title">
                <!-- 编辑文件类型标签 -->
                <div v-if="tag.name === 'fileType'">
                  <transition name="file-type">
                    <a-tooltip :title="EDIT_FILE_TYPE?'点击修改文件类型':'文件类型'">
                      <span v-if="editing !== item.fileId" @click="beginEditType(item.fileId)">
                        <a-icon :type="tag.type" class="tag" />{{ item[tag.name] }}
                      </span>
                      <!-- 选择会议类型 -->
                      <a-select
                        v-else
                        :defaultValue="item.meetFileType"
                        size="small"
                        style="width: 100%"
                        @change="(val) => changeType(val, item)"
                        :loading="editLoading"
                      >
                        <a-select-option
                          v-for="(i, index) in fileType"
                          :key="index"
                          :value="i[0]"
                        >{{ i[1] }}
                        </a-select-option>
                      </a-select>
                    </a-tooltip>
                  </transition>
                </div>
                <!-- 其他标签 -->
                <div v-else>
                  <a-tooltip :title="tag.title">
                    <a-icon :type="tag.type" class="tag" />{{ item[tag.name] }}
                  </a-tooltip>
                </div>
              </a-col>

              <!-- 文件操作选项 -->
              <a-col :span="7" class="tag-item">
                <a-tooltip :title="DOWNLOAD_FILE?'下载':'无下载权限'">
                  <a @click="downloadFile(item)">
                    <a-icon type="download" />
                  </a>
                </a-tooltip>

                <a-divider type="vertical" />
                <a-popconfirm
                  :visible="DEL_FILE&&deleting === item.fileId"
                  arrowPointAtCenter
                  placement="topRight"
                  title="确定要删除文件吗?"
                  @visibleChange="(v)=>handleVisibleChange(v,item.fileId)"
                  @confirm="deleteFile(item)"
                  okText="删除"
                  cancelText="取消"
                >
                  <a-tooltip :title="DEL_FILE?'点击删除':'无删除权限'">
                    <a href="javascript:;">
                      <a-icon theme="twoTone" twoToneColor="#e00000" type="delete" />
                    </a>
                  </a-tooltip>
                </a-popconfirm>
              </a-col>
            </a-row>
          </div>
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getMeetingFile,
  deleteFile,
  uploadMFile,
  updateFileType
} from '@/api/meeting'
import { format, formatSize, download } from '@/utils/util'
import FileUpload from '@/components/file/FileUpload'
import { sendSysMsg } from '../meeting/modules/constance'

export default {
  name: 'MFile',
  props: {},
  components: { FileUpload },
  data () {
    return {
      /* 文件id */
      deleting: '',
      /* 删除文件弹出框可视化 */
      visible: false,
      /* 文件类型 */
      fileSort: 'all',
      /* 服务端返回的数据 */
      dataSource: [],
      /* 列表中展示的数据 */
      listData: [],
      /* 加载文件等待 */
      loading: false,
      /* 上次文件的密级 */
      secretLevel: 30,
      /* 正在编辑类型的文件ID */
      editing: '',
      /* 等待修改文件类型的响应 */
      editLoading: false,
      /* 文件标签 */
      tags: Object.freeze([
        {
          type: 'tag',
          title: '类型',
          name: 'fileType'
        }, {
          type: 'environment',
          title: '密级',
          name: 'levels'
        }, {
          type: 'user',
          title: '上传人',
          name: 'reviser'
        }, {
          type: 'clock-circle',
          title: '上传时间',
          name: 'time'
        }, {
          type: 'save',
          title: '文件大小',
          name: 'fileSize'
        }
      ]),
      fileType: Object.freeze(new Map([
        ['9000', '评审文件'],
        ['9001', '参考文件'],
        ['9002', '结论文件']
      ]))
    }
  },
  computed: {
    ...mapGetters([
      'userSecretLevel',
      'userId',
      'nickname',
      'getMAuth'
    ]),
    /* 当前会议的id */
    curMeeting () {
      return this.$store.state.meeting.curMeeting
    },
    UPLOAD_FILE () {
      return this.getMAuth('UPLOAD_FILE')
    },
    DOWNLOAD_FILE () {
      return this.getMAuth('DOWNLOAD_FILE')
    },
    DEL_FILE () {
      return this.getMAuth('DEL_FILE')
    },
    EDIT_FILE_TYPE () {
      return this.getMAuth('EDIT_FILE_TYPE')
    }
  },
  created () {
    this.getFileList(this.curMeeting.id)
    // 处理可上传的文件密级
    this.handleFileSecret()
    console.log('删除文件权限', this.DEL_FILE)
  },
  methods: {
    handleVisibleChange (visible, fileId) {
      if (visible) {
        this.deleting = fileId
      } else {
        this.deleting = ''
      }
    },
    /**
     * 文件分类
     */
    sortFile () {
      const { dataSource, fileSort } = this
      let result = []
      if (fileSort !== 'all') {
        result = dataSource.filter(({ meetFileType }) => meetFileType === fileSort)
      } else { result = dataSource }
      this.listData = result
    },
    /**
     * 设置上传文件的密级
     */
    handleFileSecret (value) {
      const allSendMenu = [30, 40, 60].filter(item => item <= this.userSecretLevel)
      const curSecret = this.curMeeting.secretLevel
      this.secretList = allSendMenu.filter(item => item <= curSecret)
    },
    /**
     * 设置会议文件的图标
     */
    setFileIcon (ext) {
      const info = {
        class: ext,
        content: 'W'
      }
      switch (ext) {
        case 'doc': case 'docx': break
        case 'ppt': case 'pptx':
          info.content = 'P'
          break
        case 'xls': case 'xlsx':
          info.content = 'X'
          break
        default:
          info.content = ext
          break
      }
      return info
    },
    /**
     * 设置列表的高度
     */
    setListHeight () {
      const drawer = document.querySelector('.ant-drawer-wrapper-body')
      const listHeight = drawer && (drawer.clientHeight - 200)
      const fileList = document.querySelector('.meeting-file-list')
      fileList.style.height = listHeight + 'px'
      fileList.style.overflow = 'auto'
    },
    /**
     * 获取服务端文件列表数据
     */
    getFileList (meetingId) {
      this.loading = true
      getMeetingFile(meetingId).then(res => {
        this.dataSource = this.formatData(res.result.data)
        this.listData = this.dataSource
        this.fileSort = 'all'
      }).finally(() => {
        this.loading = false
        this.$nextTick(() => {
          this.setListHeight()
        })
      })
    },
    /**
     * 数据格式化
     */
    formatData (oData) {
      return oData.map((item) => {
        const nData = { ...item }
        nData.time = format(new Date(nData.time), 'MM/dd hh:mm')
        nData.fileSize = formatSize(parseInt(nData.fileSize))
        nData.levels = this.$options.filters.fileSecret(nData.levels)
        nData.fileType = this.fileType.get(nData.meetFileType) || '参会文件'
        return nData
      })
    },
    /**
     * 设置文件密级
     */
    setSecretLevel (level) {
      this.secretLevel = level
    },
    /**
     * 上传成功后的处理方法
     */
    handleUpload ({ fileId, fileSize, fileName, fileExt }) {
      const fileInfo = {
        fileType: '905',
        fromId: this.userId,
        username: this.nickname,
        toId: this.curMeeting.id,
        toName: this.curMeeting.name,
        content: {
          id: fileId,
          fileSize: fileSize,
          title: fileName,
          extension: fileExt,
          secretLevel: this.secretLevel,
          // 上传时给一个默认值
          meetFileType: '9000'
        }
      }
      uploadMFile(fileInfo).then(res => {
        // this.$notification.success({
        //   message: '会议文件上传成功'
        // })
        const msg = `
          ${this.nickname} 上传了 ${fileName}
          【${this.$options.filters.fileSecret(this.secretLevel)}】
        `
        sendSysMsg(this, msg)
        this.getFileList(this.curMeeting.id)
      }).catch(() => {
        this.$notification.warning({
          message: '会议文件上传失败，稍后再试！'
        })
      })
    },
    /**
     * 编辑文件类型
     */
    beginEditType (fileId) {
      if (this.EDIT_FILE_TYPE) {
        this.editing = fileId
      }
    },
    /**
     * 改变文件类型
     */
    changeType (typeCode, { fileName }) {
      this.editLoading = true
      updateFileType(this.editing, typeCode).then(res => {
        if (res.rel) {
          this.$notification.success({
            message: '文件类型修改成功'
          })
          const typeName = this.fileType.get(typeCode)
          const msg = `${this.nickname} 将文件 ${fileName} 设置为 ${typeName}`
          sendSysMsg(this, msg)
          this.editing = ''
          this.getFileList(this.curMeeting.id)
        }
      }).catch(() => {
        this.$notification.warning({
          message: '文件修改失败，请稍后再试'
        })
      }).finally(() => {
        this.editLoading = false
      })
    },
    /**
     * 文件搜索(前端搜索)
     */
    onSearch (text) {
      if (text === '') {
        this.sortFile()
        return
      }
      const { dataSource } = this
      const result = []
      dataSource.forEach(ele => {
        if (JSON.stringify(ele).includes(text)) {
          result.push(ele)
        }
      })
      this.listData = result
    },
    /**
     * 下载文件
     */
    downloadFile ({ fileId, fileName }) {
      if (this.DOWNLOAD_FILE) {
        download(fileId, fileName)
      }
    },
    /**
     * 删除文件
     */
    deleteFile (record) {
      deleteFile(record.fileId).then(res => {
        this.$notification.success({ message: '删除成功' })
        // 删除成功、移除文件
        this.getFileList(this.curMeeting.id)
      }).catch(() => {
        this.$notification.warn({ message: '删除失败，稍后再试' })
      })
    },
    /**
     * 取消文件的删除操作
     */
    cancelDelete () {}
  }
}
</script>

<style lang="less" scoped>
  // 文件类型编辑的切换动画
  .file-type-enter-active, .file-type-leave-active {
    transition: opacity .5s;
  }
  .file-type-leave-to /* .fade-leave-active below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
  }
  .file-type-enter {
    transform: translateX(-10px);
    opacity: 0;
  }
  // 文件列表上方的搜索框样式
  .meeting-file-search {
    display: flex;
    margin-bottom: 16px;
  }

  // 文件样式
  .file-item {
    position: relative;
    padding: 8px;
    font-size: 14px;
    line-height: 1.4em;
    border: 1px solid #ebedf0;
    border-radius: 3px;
    box-shadow: 0px 0px 2px #dedede;

    .file-title-wrap {
      display: flex;

      .file-icon {
        background-color: #4f9fde;
        color: #fff;
        font-size: 20px;
        text-align: center;
        line-height: 40px;
        min-width: 40px;
        height: 40px;
        border: 1px solid #bdc0c5;
        border-radius: 3px;
      }
      .file-name {
        margin-left: 8px;
        color: #333333;
      }
    }
    .file-tags {
      line-height: 2em;
      padding: 4px;
      color: #333333;
      .tag-item {
        cursor: pointer;
        .tag {
          color: #999999;
        }
      }
    }
  }
  // 文件图标背景
  .doc, .docx {
    background-color: #33397c !important;
  }
  .xlsx, .xls {
    background-color: #007234 !important;
  }
  .ppt, .pptx {
    background-color: #dd5b27 !important;
  }
  .pdf {
    background-color: #d72219 !important;
  }
</style>
