<template>
  <div>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="32" type="flex" justify="end">
            <a-col :md="4" :sm="24">
              <a-form-item label="标题">
                <a-input v-model="queryParam.title" />
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="24">
              <a-form-item label="消息类型">
                <a-select placeholder="请选择" v-model="queryParam.type">
                  <a-select-option value="admin">管理员公告</a-select-option>
                  <a-select-option value="system">系统消息</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="24">
              <a-form-item label="密级">
                <a-select placeholder="请选择" v-model="queryParam.secretLevel">
                  <a-select-option value="30">非密</a-select-option>
                  <a-select-option value="40">秘密</a-select-option>
                  <a-select-option value="60">机密</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="24">
              <a-form-item label="发布状态">
                <a-select placeholder="请选择" v-model="queryParam.isSend">
                  <a-select-option value="0">未发布</a-select-option>
                  <a-select-option value="1">已发布</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="search">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
                <a-button
                  type="primary"
                  style="margin-left: 30px"
                  @click="openModal('1')"
                  v-action:add
                >新增消息</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <s-table ref="stable" size="default" :columns="columns" :data="loadData" :alert="false">
        <span slot="action" slot-scope="text, record">
          <template>
            <a v-if="record.isSend==='0'">
              <a @click="openModal('2', record)" v-action:update>修改</a>
              <a-divider type="vertical" />
              <a @click="sendNotice(record)" v-action:update>发布</a>
              <a-divider type="vertical" />
              <a @click="deleteNotice(record)" v-action:delete>删除</a>
            </a>
          </template>
        </span>
      </s-table>
    </a-card>
    <a-modal
      title="操作"
      style="top: 100px;"
      width="800px"
      v-model="visiable"
      :closable="false"
      :destroyOnClose="true"
      :okText="okText"
      @ok="handleOk"
      :confirmLoading="confirmLoading"
    >
      <a-form :form="detailForm">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="标题">
          <a-input
            v-decorator="['title',{rules: [{ required: true, message: '请填写标题' },{ max: 100, message: '最多填写100个字' }]}]"
          />
        </a-form-item>
        <!-- <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="附件"
        >
          <a>文件名|支持点击下载</a>
        </a-form-item>-->
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="消息类型">
          <a-select
            placeholder="请选择"
            v-decorator="['type',{rules: [{ required: true, message: '请填写消息类型' }]}]"
          >
            <a-select-option value="admin">管理员公告</a-select-option>
            <a-select-option value="system">系统消息</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="密级">
          <a-select
            placeholder="请选择"
            v-decorator="['secretLevel',{rules: [{ required: true, message: '请填写消息密级' }]}]"
          >
            <a-select-option value="30">非密</a-select-option>
            <a-select-option value="40">秘密</a-select-option>
            <a-select-option value="60">机密</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="组织机构">
          <org-tree-select :values="orgCode" @ok="getOrgCode"></org-tree-select>
        </a-form-item>
        <!-- <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="附件"
        >
          <a-upload
            name="file"
            :multiple="true"
            action="https://www.easy-mock.com/mock/5cd3d62bd0717344110ebfb4/lark/api/admin/fileupload"
            :headers="headers"
            @change="uploadChange"
            @beforeUpload="beforeUpload"
          >
            <a-button>
              <a-icon type="upload" />上传
            </a-button>
          </a-upload>
        </a-form-item>-->
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="内容">
          <a-textarea
            :rows="5"
            v-decorator="['content',{rules: [{ max: 100, message: '最多填写2000个字' }]}]"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import STable from '@/components/table/'
import OrgTreeSelect from '@/components/admin/OrgTreeSelect'
import { getNoticePage, addNotice, updateNotice, delNotice, sendNotice } from '@/api/admin'
import pick from 'lodash.pick'
export default {
  name: 'NotificationList',
  components: {
    STable,
    OrgTreeSelect
  },
  data () {
    return {
      queryParam: {},
      visiable: false,
      type: '',
      noticeid: '',
      detailForm: this.$form.createForm(this),
      // 设置上传的请求头部，IE10 以上有效
      headers: {
        authorization: 'authorization-text'
      },
      // 表头
      columns: [
        {
          title: '标题',
          dataIndex: 'title'
        },
        {
          title: '内容',
          dataIndex: 'content'
        },
        {
          title: '密级',
          dataIndex: 'secretLevel',
          key: 'secretLevel',
          customRender: function (secretLevel) {
            const config = {
              '30': '非密',
              '40': '秘密',
              '60': '机密'
            }
            return config[secretLevel]
          }
        },
        {
          title: '消息类型',
          dataIndex: 'type',
          key: 'type',
          customRender: function (type) {
            const config = {
              admin: '管理员公告',
              system: '系统消息'
            }
            return config[type]
          }
        },
        {
          title: '发布状态',
          dataIndex: 'isSend',
          key: 'isSend',
          customRender: function (isSend) {
            const config = {
              '0': '未发布',
              '1': '已发布'
            }
            return config[isSend]
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        // this.queryParam['orgCode'] = this.user.orgCode
        return getNoticePage(Object.assign(parameter, this.queryParam)).then(res => {
          return res.result
        })
      },
      fileList: [],
      okText: '确认',
      confirmLoading: false,
      orgCode: ''
    }
  },
  methods: {
    /**
     * 搜索
     */
    search () {
      this.$refs.stable.loadData({}, this.queryParam, {})
    },
    /**
     * 发布消息弹出框
     */
    openModal (type, record) {
      this.visiable = true
      this.type = type
      if (record) {
        this.orgCode = record.orgCode
      } else {
        this.orgCode = ''
      }
      if (type === '1') {
        this.okText = '保存'
        this.$nextTick(() => {
          // 表单中绑定信息项
          this.detailForm.setFieldsValue({})
        })
      } else {
        this.noticeid = record.id
        this.$nextTick(() => {
          // 表单中绑定信息项
          this.detailForm.setFieldsValue(pick(record, 'title', 'content', 'type', 'secretLevel'))
        })
      }
    },
    /**
     * 上传文件change事件
     * TODO 后台联调
     * 如需支持点击超链接查看上传内容，需返回url（file.response.url）
     * uploadFile
     */
    uploadChange (info) {
      // TODO 如果上传文件数量有限制
      if (info.fileList.length > 1) {
        this.$notification['error']({
          message: '只能上传n个文件',
          duration: 4
        })
        return
      }
      this.fileList = info.fileList
      if (info.file.status !== 'uploading') {
        console.log('info.file', info.file)
        console.log('info.fileList', info.fileList)
      }
      if (info.file.status === 'done') {
        this.$message.success(`${info.file.name} 上传成功`)
      } else if (info.file.status === 'error') {
        this.$message.error(`${info.file.name} 上传失败`)
      }
    },
    /**
     * 在这添加上传限制 TODO
     * 限制文件大小
     * 限制文件类型
     */
    beforeUpload (file) {
      console.log('file', file)
      // const isJPG = file.type === 'image/jpeg'
      // if (!isJPG) {
      //   this.$message.error('You can only upload JPG file!')
      // }
      // const isLt2M = file.size / 1024 / 1024 < 2
      // if (!isLt2M) {
      //   this.$message.error('Image must smaller than 2MB!')
      // }
      // return isJPG && isLt2M
    },
    /**
     * 保存消息
     */
    handleOk () {
      if (this.type === '1') {
        this.detailForm.validateFields((err, values) => {
          if (!err) {
            this.confirmLoading = true
            values.orgCode = this.orgCode
            return addNotice(values)
              .then(res => {
                if (res.status === 200) {
                  this.$notification['success']({
                    message: '保存成功',
                    duration: 2
                  })
                  this.visiable = false
                  this.search()
                } else {
                  this.$notification['error']({
                    message: res.message,
                    duration: 4
                  })
                }
              })
              .catch(() =>
                this.$notification['error']({
                  message: '出现异常，请联系系统管理员',
                  duration: 4
                })
              )
              .finally(() => {
                this.confirmLoading = false
              })
          }
        })
      } else if (this.type === '2') {
        this.detailForm.validateFields((err, values) => {
          if (!err) {
            values.orgCode = this.orgCode
            values.id = this.noticeid
            this.confirmLoading = true
            return updateNotice(values)
              .then(res => {
                if (res.status === 200) {
                  this.$notification['success']({
                    message: '保存成功',
                    duration: 2
                  })
                  this.visiable = false
                  this.search()
                } else {
                  this.$notification['error']({
                    message: res.message,
                    duration: 4
                  })
                }
              })
              .catch(() =>
                this.$notification['error']({
                  message: '出现异常，请联系系统管理员',
                  duration: 4
                })
              )
              .finally(() => {
                this.confirmLoading = false
              })
          }
        })
      } else {
        this.visiable = false
      }
    },
    /**
     * 删除消息
     */
    deleteNotice (record) {
      const _this = this
      this.$confirm({
        title: '警告',
        content: `确认要删除这条消息吗?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          // 在这里调用删除接口
          return delNotice(record.id)
            .then(res => {
              if (res.status === 200) {
                _this.$notification['success']({
                  message: '删除成功',
                  duration: 2
                })
                _this.search()
              } else {
                _this.$notification['error']({
                  message: res.message,
                  duration: 4
                })
              }
            })
            .catch(() =>
              _this.$notification['error']({
                message: '删除异常，请联系系统管理员',
                duration: 4
              })
            )
        },
        onCancel: () => {
          _this.$notification['info']({
            message: '取消删除操作',
            duration: 4
          })
        }
      })
    },
    /**
     * 消息发布
     */
    sendNotice (record) {
      record.orgCode = this.orgCode
      this.confirmLoading = true
      return sendNotice(record)
        .then(res => {
          if (res.status === 200) {
            this.$notification['success']({
              message: '发布成功',
              duration: 2
            })
            this.search()
          } else {
            this.$notification['error']({
              message: res.message,
              duration: 4
            })
          }
        })
        .catch(() =>
          this.$notification['error']({
            message: '出现异常，请联系系统管理员',
            duration: 4
          })
        )
        .finally(() => {
          this.confirmLoading = false
        })
    },
    /**
     * 获取组织树下拉框返回值
     */
    getOrgCode (value) {
      this.orgCode = value
    }
  }
}
</script>
