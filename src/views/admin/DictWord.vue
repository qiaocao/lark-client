<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="8" type="flex" justify="end">
          <a-col :md="4" :sm="24">
            <a-form-item label="词汇类型">
              <a-select placeholder="请选择" v-model="queryParam.wordType">
                <a-select-option value="1">涉密</a-select-option>
                <a-select-option value="2">敏感</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24">
            <a-form-item label="词汇名称">
              <a-input v-model="queryParam.wordName"/>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24" v-show="queryParam.wordType === '2'">
            <a-form-item label="替换词汇">
              <a-input v-model="queryParam.replaceWord"/>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24" v-show="queryParam.wordType === '1'">
            <a-form-item label="密级">
              <a-select v-model="queryParam.wordCode">
                <a-select-option value="40">秘密</a-select-option>
                <a-select-option value="60">机密</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24">
            <a-form-item label="状态">
              <a-select placeholder="请选择" v-model="queryParam.isUse">
                <a-select-option value="1">正常</a-select-option>
                <a-select-option value="0">停用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="search">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              <a-button style="margin-left: 8px" type="primary" @click="handleAdd()">新增</a-button>
              <a-upload
                style="margin-left: 8px"
                name="file"
                @change="uploadChange"
                :fileList="fileList"
                :customRequest="customRequest"
                :beforeUpload="beforeUpload">
                <a-button :loading="importLoading">
                  <a-icon type="upload"/>批量导入
                </a-button>
              </a-upload>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <s-table
      ref="stable"
      size="default"
      :columns="columns"
      :data="loadData"
    >
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a v-if="record.isUse==='1'" @click="handleStatus(record,'0')">停用</a>
        <a v-if="record.isUse==='0'" @click="handleStatus(record,'1')">启用</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a class="ant-dropdown-link">
            更多 <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a @click="handleDetail(record)">详情</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="handleDelete(record)">删除</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>
    </s-table>
    <a-modal
      title="操作"
      style="top: 100px;"
      :width="800"
      v-model="editVisible"
      @ok="handleEditOk"
      :confirmLoading="confirmLoading"
      :destroyOnClose="true"
    >
      <a-form :form="editForm">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="词汇类型"
          hasFeedback
        >
          <a-select v-decorator="['wordType',{rules: [{ required: true, message: '请填写词汇类型' }]}]" :disabled="inDetail" @change="editTypeChange">
            <a-select-option value="1">涉密</a-select-option>
            <a-select-option value="2">敏感</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="词汇名称"
          hasFeedback
        >
          <a-input v-decorator="['wordName',{rules: [{ required: true, message: '请填写词汇名称' }]}]" :disabled="inDetail"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="替换词汇"
          hasFeedback
          v-if="editType==='2'"
        >
          <a-input v-decorator="['replaceWord',{rules: [{ required: true, message: '请填写替换词汇' }]}]" :disabled="inDetail"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="密级"
          hasFeedback
          v-if="editType==='1'"
        >
          <a-select v-decorator="['wordCode',{rules: [{ required: true, message: '请选择密级' }]}]" :disabled="inDetail">
            <a-select-option value="40">秘密</a-select-option>
            <a-select-option value="60">机密</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>
<script>
import { STable } from '@/components'
import { getWordList, addWord, updateWord, delWord, importWords } from '@/api/admin'
export default {
  name: 'DictWord',
  components: {
    STable
  },
  data () {
    return {
      // 编辑弹出框
      editVisible: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      editForm: this.$form.createForm(this),
      // 查询参数
      queryParam: {},
      inDetail: false,
      inAdd: false,
      inEdit: false,
      // 词汇类型
      type: '',
      // 表头
      columns: [
        {
          title: '词汇类型',
          dataIndex: 'wordType',
          key: 'wordType',
          customRender: function (wordType) {
            const config = {
              '1': '涉密',
              '2': '敏感'
            }
            return config[wordType]
          }
        },
        {
          title: '密级',
          dataIndex: 'wordCode',
          key: 'wordCode',
          customRender: function (wordCode) {
            const config = {
              '40': '秘密',
              '60': '机密'
            }
            return config[wordCode]
          }
        },
        {
          title: '词汇名称',
          dataIndex: 'wordName'
        },
        {
          title: '替换词汇',
          dataIndex: 'replaceWord'
        },
        {
          title: '操作',
          width: '200px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getWordList(parameter)
          .then(res => {
            return res.result
          })
      },
      confirmLoading: false,
      importLoading: false,
      id: '',
      fileList: [],
      editType: ''
    }
  },
  created () {
  },
  methods: {
    /**
     * 搜索
     */
    search () {
      if (this.queryParam.wordType === '1') {
        delete this.queryParam.replaceWord
      } else if (this.queryParam.wordType === '2') {
        delete this.queryParam.wordCode
      }
      this.$refs.stable.loadData({}, this.queryParam, {})
    },
    /**
     * 新增弹出框
     */
    handleAdd () {
      this.inDetail = false
      this.inEdit = false
      this.inAdd = true
      this.bindForm()
    },
    /**
     * 停用/启用
     */
    handleStatus (record, isUse) {
      this.confirmLoading = true
      record.isUse = isUse
      updateWord(record).then(
        res => {
          this.handleResult(res)
        }
      ).catch((err) =>
        this.handleCatch(err)
      )
    },
    /**
     * 详情
     */
    handleDetail (record) {
      this.inDetail = true
      this.inEdit = false
      this.inAdd = false
      this.bindForm(record)
    },
    /**
     * 编辑
     */
    handleEdit (record) {
      this.inDetail = false
      this.inEdit = true
      this.inAdd = false
      this.bindForm(record)
    },
    /**
     * 删除
     */
    handleDelete (record) {
      const _this = this
      _this.confirmLoading = true
      this.$confirm({
        title: '警告',
        content: `确认要删除 ${record.wordName} 吗?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delWord({ 'id': record.id }).then(
            res => {
              _this.handleResult(res)
            }
          ).catch((err) =>
            _this.handleCatch(err)
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
     * 保存
     */
    handleEditOk () {
      if (this.inDetail) {
        this.editVisible = false
        return
      }
      this.editForm.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          if (this.inAdd) {
            addWord(values).then(
              res => {
                this.handleResult(res)
              }
            ).catch((err) =>
              this.handleCatch(err)
            )
          } else if (this.inEdit) {
            values.id = this.id
            updateWord(values).then(
              res => {
                this.handleResult(res)
              }
            ).catch((err) =>
              this.handleCatch(err)
            )
          }
        }
      })
    },
    /**
     * 绑定表单值
     */
    bindForm (record) {
      if (record) {
        this.id = record.id
      } else {
        this.wordType = ''
      }
      if (this.inAdd) {
        setTimeout(() => {
          this.editForm.setFieldsValue({
            wordCode: '',
            wordType: '',
            wordName: '',
            replaceWord: ''
          })
        }, 0)
      } else {
        this.editType = record.wordType
        setTimeout(() => {
          this.editForm.setFieldsValue({
            wordCode: record.wordCode,
            wordType: record.wordType,
            wordName: record.wordName,
            replaceWord: record.replaceWord
          })
        }, 0)
      }
      this.editVisible = true
    },
    /**
     * 词汇类型变化
     */
    typeChange (value) {
      this.type = value
    },
    /**
    * 编辑页词汇类型变化
    */
    editTypeChange (value) {
      this.editType = value
    },
    /**
     * 请求接口后返回的结果
     */
    handleResult (res) {
      if (res.status === 200) {
        if (res.message === '200') {
          this.$notification['success']({
            message: '操作成功',
            duration: 2
          })
          // 关闭编辑框
          this.editVisible = false
          // 刷新列表
          this.$refs.stable.refresh(true)
        } else {
          this.$notification['error']({
            message: res.result,
            duration: 4
          })
        }
      }
      this.confirmLoading = false
      this.importLoading = false
    },
    /**
     * 请求接口发生异常
     */
    handleCatch (err) {
      if (err || err.response || err.response) {
        this.$notification['error']({
          message: err.response.data.message,
          duration: 4
        })
      }
      this.confirmLoading = false
    },
    uploadChange (info) {
      // 上传的文件不显示在主页
      this.fileList = []
      this.filename = info.file.name
      if (info.file.status === 'uploading') {
        this.importLoading = true
        return
      }
      if (info.file.status === 'done') {
        this.importLoading = false
      }
    },
    /**
     * 重写上传action方法
     */
    customRequest (data) {
      const formData = new FormData()
      formData.append('file', data.file)
      data.onProgress()
      this.importLoading = true
      importWords(formData).then(
        res => {
          this.handleResult(res)
        }
      ).catch((err) =>
        this.handleCatch(err)
      )
    },
    /**
     * 上传前文件类型及尺寸的校验
     */
    beforeUpload (file) {
      // 校验上传文件类型
      const isExcel = this.checkFileType(file.name)
      if (!isExcel) {
        this.$notification['error']({
          message: '请上传Excel文件',
          duration: 4
        })
      }
      // 校验上传文件尺寸
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$notification['error']({
          message: '请上传尺寸小于10MB的图片',
          duration: 4
        })
      }
      return isExcel && isLt10M
    },
    checkFileType (name) {
      const type = name.substr(name.indexOf('.') + 1)
      if (type === 'xls' || type === 'xlsx') {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
