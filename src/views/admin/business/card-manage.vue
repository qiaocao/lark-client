<template>
  <a-card :bordered="false" class="card-manage-list">
    <!-- 查询选项 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="卡片名称">
              <a-input v-model="queryParam.title" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="接口地址">
              <a-input v-model="queryParam.url" placeholder="" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="描述信息">
                <a-input v-model="queryParam.description" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-input v-model="queryParam.status" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="是否删除">
                <a-input v-model="queryParam.deleted" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="卡片类型">
                <a-input v-model="queryParam.type" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属组织编码">
                <a-input v-model="queryParam.orgCode" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属组织">
                <a-input v-model="queryParam.orgName" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="是否应用于部门所有人员">
                <a-input v-model="queryParam.cardOrgUserStatus" />
              </a-form-item>
            </a-col>
          </template>
          <a-col
            :md="{
              span: !advanced && 8 || 24
            }"
            :sm="24"
          >
            <span
              class="table-page-search-submitButtons"
              :style="advanced && { float: 'right', overflow: 'hidden' } || {} "
            >
              <a-button
                type="primary"
                @click="$refs.cardManageList.refresh(true)"
              >查询</a-button>
              <a-button
                style="margin-left: 8px"
                @click="resetQuery"
              >重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 新建卡片 -->
    <div class="table-operator">
      <a-button
        type="primary"
        icon="plus"
        @click="addCard"
      >新建卡片</a-button>
    </div>
    <!-- 卡片列表 -->
    <s-table
      ref="cardManageList"
      :columns="columns"
      :data="loadData"
    >
      <!-- 数据序号 -->
      <span slot="serial" slot-scope="text, record, index">
        <span>{{ index + 1 }}</span>
      </span>
      <!-- 描述信息 -->
      <span slot="description" slot-scope="text">
        <ellipsis :length="8" tooltip>{{ text }}</ellipsis>
      </span>
      <!-- 卡片名称 -->
      <span slot="cardName" slot-scope="text">
        <ellipsis :length="8" tooltip>{{ text }}</ellipsis>
      </span>
      <!-- 接口地址 -->
      <span slot="url" slot-scope="text">
        <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
      </span>
      <!-- 状态 -->
      <span slot="status" slot-scope="text">
        {{ text === '1' ? '有效' : '无效' }}
      </span>
      <!-- 删除状态 -->
      <span slot="deleted" slot-scope="text">
        {{ text === '1' ? '是' : '否' }}
      </span>
      <!-- 所属组织 -->
      <span slot="orgName" slot-scope="text">
        <ellipsis :length="8" tooltip>{{ text }}</ellipsis>
      </span>
      <!-- 删除状态 -->
      <span slot="cardOrgUserStatus" slot-scope="text">
        {{ text === '1' ? '是' : '否' }}
      </span>
      <!-- 操作 -->
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="editCard(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除吗?"
            @confirm="deleteCard(record)"
            okText="确定"
            cancelText="取消"
          >
            <a style="color: red">删除</a>
          </a-popconfirm>
        </template>
      </span>
    </s-table>
    <!-- 卡片详细信息 -->
    <a-modal
      v-model="detailVisible"
      :title="activeCard.hasOwnProperty('id') ? '修改卡片信息' : '创建卡片' "
    >
      <template slot="footer">
        <a-button @click="colseDetailModel">关闭</a-button>
        <a-button type="primary" :loading="loading" @click="handleSubmit">
          {{ activeCard.hasOwnProperty('id') ? '确认修改' : '创建' }}
        </a-button>
      </template>
      <a-form
        :form="modelForm"
      >
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="卡片名称"
          has-feedback
        >
          <a-input
            v-decorator="[
              'title',
              { rules: [{
                required: true,
                message: '请填写卡片名称!' }] },
            ]"
            placeholder="设置卡片名称"
          />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="接口地址"
          has-feedback
        >
          <a-input
            v-decorator="[
              'url',
              { rules: [{
                required: true,
                message: '请填写接口地址!' }] },
            ]"
            placeholder="设置接口地址"
          />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="卡片类型"
          has-feedback
        >
          <a-input
            v-decorator="[
              'type',
              { rules: [{
                required: true,
                message: '请填写卡片类型!' }] },
            ]"
            placeholder="设置卡片类型"
          />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="所属组织"
          has-feedback
        >
          <org-tree-select
            :values="modelForm.getFieldValue('orgCode')"
            @ok="setOrgInfo"
            v-decorator="['orgCode',{rules: [{
              required: true,
              message: '请选择卡片所属部门!' }]}]"
          ></org-tree-select>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="图标"
          has-feedback
        >
          <a-input
            v-decorator="[
              'icon',
              { rules: [{
                required: true,
                message: '请填写卡片图标!' }] },
            ]"
            placeholder="设置卡片图标"
          />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="全部应用"
        >
          <a-switch
            checkedChildren="是"
            unCheckedChildren="否"
            v-decorator="['cardOrgUserStatus', { valuePropName: 'checked' }]"
          />
          <span>（是否应用于部门内所有人）</span>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="状态"
        >
          <a-switch
            checkedChildren="有效"
            unCheckedChildren="无效"
            v-decorator="['status', { valuePropName: 'checked' }]"
          />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="删除">
          <a-switch
            checkedChildren="是"
            unCheckedChildren="否"
            v-decorator="['deleted', { valuePropName: 'checked' }]"
          />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="描述信息"
          has-feedback
        >
          <a-input
            type="textarea"
            v-decorator="[
              'description',
              { rules: [{
                required: true,
                message: '请填写卡片描述!' }] },
            ]"
            placeholder="设置卡片描述信息"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import OrgTreeSelect from '@/components/admin/OrgTreeSelect'
import {
  addPortalCard,
  getPortalCard,
  updatePortalCard,
  deletePortalCard
} from '@/api/admin/card-manage'

export default {
  name: 'CardManage',
  components: { STable, Ellipsis, OrgTreeSelect },
  data () {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '名称',
          dataIndex: 'title',
          width: 160,
          scopedSlots: { customRender: 'cardName' }
        },
        {
          title: '接口地址',
          dataIndex: 'url',
          width: 100,
          scopedSlots: { customRender: 'url' }
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: 80,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '删除',
          dataIndex: 'deleted',
          width: 80,
          scopedSlots: { customRender: 'deleted' }
        },
        {
          title: '图标',
          dataIndex: 'icon',
          width: 80
        },
        {
          title: '类型',
          dataIndex: 'type',
          width: 80
        },
        {
          title: '组织',
          dataIndex: 'orgName',
          width: 150,
          scopedSlots: { customRender: 'orgName' }
        },
        {
          title: '全应用',
          dataIndex: 'cardOrgUserStatus',
          width: 140,
          scopedSlots: { customRender: 'cardOrgUserStatus' }
        },
        {
          title: '描述信息',
          dataIndex: 'description',
          width: 150,
          scopedSlots: { customRender: 'description' }
        },
        {
          title: '操作',
          width: '200px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      loadData: p => getPortalCard(Object.assign(p, this.queryParam))
        .then(r => r.result),
      // 查询参数
      queryParam: {},
      // 高级搜索 展开/关闭
      advanced: false,
      // 详细信息模态框
      detailVisible: false,
      // 当前操作的卡片，用于发送请求
      activeCard: {},
      modelForm: this.$form.createForm(this),
      // 等待修改/创建
      loading: false
    }
  },
  methods: {
    /**
     * 开启高级搜索
     */
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    /**
     * 重置查询
     */
    resetQuery () {
      this.queryParam = {}
      this.$refs.cardManageList.refresh(true)
    },
    /**
     * 添加卡片
     */
    addCard () {
      this.activeCard = {}
      this.detailVisible = true
      this.$nextTick(() => {
        this.modelForm.resetFields()
      })
    },
    /**
     * 编辑卡片
     */
    editCard (card) {
      this.detailVisible = true
      this.activeCard = card
      const {
        title, description, url, status, icon,
        deleted, type, orgCode, cardOrgUserStatus
      } = card
      this.$nextTick(() => {
        this.modelForm.setFieldsValue({
          title,
          description,
          url,
          icon,
          status: Boolean(parseInt(status)),
          deleted: Boolean(parseInt(deleted)),
          type,
          orgCode,
          cardOrgUserStatus: Boolean(parseInt(cardOrgUserStatus))
        })
      })
    },
    /**
     * 删除卡片
     * @param {Object} card 卡片信息
     */
    deleteCard ({ id, title }) {
      deletePortalCard(id).then(res => {
        if (res.status === 200 && res.rel) {
          this.$notification.success({
            message: `卡片“${title}”删除成功`,
            duration: 1
          })
          // 刷新列表
          this.$refs.cardManageList.refresh(true)
        } else {
          throw new Error(`卡片“${title}”删除失败`)
        }
      }).catch(e => {
        this.$notification.error({
          message: e.message,
          duration: 1.5
        })
      })
    },
    /**
     * 关闭卡片详细信息弹窗
     */
    colseDetailModel () {
      this.detailVisible = false
    },
    /**
     * 设置组织信息
     */
    setOrgInfo (id, label) {
      this.modelForm.setFieldsValue({
        orgCode: id
      })
      // 更新组织信息
      Object.assign(this.activeCard, {
        orgName: label[0],
        orgCode: id
      })
    },
    /**
     * 确认修改或创建
     */
    handleSubmit () {
      this.modelForm.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.loading = true
          // 处理数据
          const {
            title, description, url, status, icon,
            deleted, type, cardOrgUserStatus
          } = values
          const { activeCard } = this
          Object.assign(activeCard, {
            title,
            description,
            url,
            icon,
            type,
            status: status ? 1 : 0,
            deleted: deleted ? 1 : 0,
            cardOrgUserStatus: cardOrgUserStatus ? 1 : 0
          })
          // 发送修改请求
          if (activeCard.hasOwnProperty('id')) {
            updatePortalCard(activeCard)
              .then(res => {
                if (res.status === 200 && res.rel) {
                  this.handleSuccess(activeCard)
                } else {
                  throw new Error(`卡片“${title}”修改失败！`)
                }
              })
              .catch(e => this.handleError(e))
              .finally(() => { this.loading = false })
          } else {
            // 发送创建请求
            addPortalCard(activeCard)
              .then(res => {
                if (res.status === 200 && res.rel) {
                  this.handleSuccess(activeCard)
                } else {
                  throw new Error(`卡片“${title}”创建失败！`)
                }
              })
              .catch(e => this.handleError(e))
              .finally(() => { this.loading = false })
          }
        }
      })
    },
    handleError (err) {
      this.$notification.error({
        message: err.message,
        duration: 1.5
      })
    },
    handleSuccess (res) {
      const optionType = res.hasOwnProperty('id') ? '修改' : '创建'
      this.$notification.success({
        message: `卡片“${res.title}”${optionType}成功！`,
        duration: 1.5
      })
      this.detailVisible = false
      this.$refs.cardManageList.refresh(true)
    }

  }
}
</script>

<style lang="less" scoped>
  .card-manage-list {}
</style>
