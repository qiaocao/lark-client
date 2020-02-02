<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="8" type="flex" justify="end">
          <a-col :md="6" :sm="24">
            <a-form-item label="名称">
              <a-input placeholder="请输入" v-model="queryParam.title"/>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <a-form-item label="状态">
              <a-select placeholder="请选择" v-model="queryParam.status">
                <a-select-option value="1">正常</a-select-option>
                <a-select-option value="0">停用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24" :offset="1">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="search">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              <a-button type="primary" style="margin-left: 30px" @click="handleAdd()" v-action:add>新增</a-button>
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
        <a @click="handleEdit(record)" v-action:update>编辑</a>
        <a-divider type="vertical" />
        <a v-if="record.status==='0'" @click="handleStatus(record,'1')" v-action:update>启用</a>
        <a v-if="record.status==='1'" @click="handleStatus(record,'0')" v-action:update>停用</a>
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
              <a @click="handleDelete(record)" v-action:delete>删除</a>
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
    >
      <a-form :form="editForm">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="名称"
          hasFeedback
        >
          <a-input v-decorator="['title',{rules: [{ required: true, message: '请填写名称' }]}]" :disabled="inDetail"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="URI"
          hasFeedback
        >
          <a-input v-decorator="['uri',{rules: [{ required: true, message: '请填写地址' }]}]" :disabled="inDetail"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="组织机构"
          hasFeedback
        >
          <org-tree-select :values="orgCode" @ok="getOrgCode" :disabled="inDetail"></org-tree-select>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="是否应用到组织所有人"
        >
          <a-radio-group buttonStyle="solid" v-decorator="['portalOrgUserStatus']" defaultValue="1">
            <a-radio-button value="1">是</a-radio-button>
            <a-radio-button value="0">否</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="描述"
          hasFeedback
        >
          <a-textarea :rows="5" v-decorator="['description']" :disabled="inDetail"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>
<script>
import { STable } from '@/components'
import OrgTreeSelect from '@/components/admin/OrgTreeSelect'
import { getToolList, addTool, updateTool, delTool } from '@/api/admin'
import pick from 'lodash.pick'
export default {
  name: 'CommonTools',
  components: {
    STable,
    OrgTreeSelect
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
          title: '工具名称',
          dataIndex: 'title'
        },
        {
          title: 'URI',
          dataIndex: 'uri'
        },
        {
          title: '组织机构',
          dataIndex: 'orgName'
        },
        {
          title: '描述',
          dataIndex: 'description'
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
        return getToolList(parameter)
          .then(res => {
            return res.result
          })
      },
      confirmLoading: false,
      orgCode: '',
      orgName: '',
      id: ''
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
    handleStatus (record, status) {
      this.confirmLoading = true
      record.status = status
      updateTool(record).then(
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
        content: `确认要删除 ${record.title} 的信息吗?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delTool(record.id).then(
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
      if (this.orgCode === undefined) {
        this.$notification['error']({
          message: '请选择组织机构',
          duration: 4
        })
        return
      }
      this.editForm.validateFields((err, values) => {
        values.id = this.id
        values.orgCode = this.orgCode
        values.orgName = this.orgName
        if (!err) {
          this.confirmLoading = true
          if (this.inAdd) {
            addTool(values).then(
              res => {
                this.handleResult(res)
              }
            ).catch((err) =>
              this.handleCatch(err)
            )
          } else if (this.inEdit) {
            updateTool(values).then(
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
        this.orgCode = record.orgCode
      } else {
        this.id = ''
        this.orgCode = ''
      }
      if (this.inAdd) {
        setTimeout(() => {
          this.editForm.setFieldsValue({
            title: '',
            uri: '',
            description: '',
            portalOrgUserStatus: '1'
          })
        }, 0)
      } else {
        setTimeout(() => {
          this.editForm.setFieldsValue(pick(record, 'title', 'description', 'uri', 'portalOrgUserStatus'))
        }, 0)
      }
      this.editVisible = true
    },
    /**
     * 请求接口后返回的结果
     */
    handleResult (res) {
      if (res.status === 200) {
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
          message: res.message,
          duration: 4
        })
      }
      this.confirmLoading = false
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
    /**
     * 获取组织树下拉框返回值
     */
    getOrgCode (id, label) {
      this.orgCode = id
      this.orgName = label[0]
    }
  }
}
</script>
