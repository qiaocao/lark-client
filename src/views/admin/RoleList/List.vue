<template>
  <a-card :bordered="false" :style="{ height: '100%' }">
    <a-form :layout="isMobile() ? 'vertical' : 'inline'" style="text-align:right;">
      <a-form-item label="唯一识别码">
        <a-input v-model="queryParam.code" style="width:180px;"></a-input>
      </a-form-item>
      <a-form-item label="状态" v-bind="formStyle.itemLayout">
        <a-select v-model="queryParam.status" style="width:180px;" allowClear>
          <a-select-option :value="1">正常</a-select-option>
          <a-select-option :value="2">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button style="margin-left: 8px;" type="primary" @click="searchData">查询</a-button>
        <a-button style="margin-left: 8px;" @click="() => queryParam = {}">重置</a-button>
      </a-form-item>
      <a-form-item>
        <a-button style="margin-left: 8px;" type="primary" icon="plus" @click="$emit('toCreate')">新增</a-button>
      </a-form-item>
    </a-form>
    <a-table :columns="columns" :dataSource="rolePage.content" :rowKey="row => 'role-'+row.id" :pagination="pagination" @change="handleTableChange">
      <template slot="operation" slot-scope="text,row">
        <a href="javascript:void(0)" @click="$emit('edit',row)">编辑</a>
        <a href="javascript:void(0)" style="margin-left:8px;" @click="$emit('permission',row)">权限</a>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { mixinDevice } from '@/utils/mixin'

export default {
  name: 'RoleList',
  mixins: [mixinDevice],
  props: {
    rolePage: {
      type: Object,
      required: true
    },
    formStyle: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      queryParam: {},
      pagination: {},
      columns: [
        {
          title: '唯一识别码',
          dataIndex: 'code'
        },
        {
          title: '角色名称',
          dataIndex: 'name'
        },
        {
          title: '状态',
          dataIndex: 'status'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime'
        },
        {
          title: '操作',
          dataIndex: 'id',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      roles: []
    }
  },
  beforeCreate () {
    this.searchForm = this.$form.createForm(this)
  },
  methods: {
    searchData () {
      this.$emit('fetchData', { pageNo: 1, ...this.queryParam })
    },
    handleTableChange (pagination, filters, sorter) {
      this.$emit('fetchData', { pageNo: pagination.current, size: pagination.pageSize })
    }
  }
}
</script>

<style scoped>

</style>
