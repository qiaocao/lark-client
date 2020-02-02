<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="权限标识码">
              <a-input-number v-model="queryParam.permission" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="权限名称">
              <a-input v-model="queryParam.name" placeholder=""/>
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="描述信息">
                <a-input v-model="queryParam.description" style="width: 100%"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="权限分类">
                <a-input v-model="queryParam.sort" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="权限类型">
                <a-input v-model="queryParam.type" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="更新日期">
                <a-date-picker v-model="queryParam.updTime" style="width: 100%" placeholder="请输入更新日期"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="创建日期">
                <a-date-picker v-model="queryParam.crtTime" style="width: 100%" placeholder="请输入创建日期"/>
              </a-form-item>
            </a-col>
          </template>
          <a-col
            :md="{
              span: !advanced && 8 || 16
            }"
            :sm="24"
          >
            <span
              class="table-page-search-submitButtons"
              :style="advanced && { float: 'right', overflow: 'hidden' } || {} "
            >
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <s-table
      ref="table"
      size="default"
      :rowKey="(record) => record.id"
      :columns="columns"
      :data="loadData"
      showPagination="auto"
    >
      <!-- 数据序号 -->
      <span slot="serial" slot-scope="text, record, index">
        {{ index + 1 }}
      </span>
      <!-- 描述信息 -->
      <span slot="description" slot-scope="text">
        <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
      </span>
      <!-- 操作 -->
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="associateUser(record)">关联用户</a>
        </template>
      </span>
    </s-table>
    <!-- 关联用户 -->
    <user-model
      ref="model"
      @ok="handleSaveOk"
      :listStyle="{
        width: '280px',
        height: '400px'
      }"
      modelWidth="980px"
    />
  </a-card>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import UserModel from '@/components/admin/UserTransferModel'
import {
  getPositionList,
  getPositionUser,
  savePositionUser
} from '@/api/admin'

export default {
  name: 'AuthList',
  components: {
    STable,
    Ellipsis,
    UserModel
  },
  data () {
    return {
      // 当前操作职位ID
      positionId: '',
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '权限名称',
          dataIndex: 'name'
        },
        {
          title: '权限标识码',
          dataIndex: 'permission'
        },
        {
          title: '描述',
          dataIndex: 'description',
          scopedSlots: { customRender: 'description' }
        },
        {
          title: '类型',
          dataIndex: 'type'
        },
        {
          title: '分类',
          dataIndex: 'sort'
        },
        {
          title: '更新人',
          dataIndex: 'updName'
        },
        {
          title: '创建人',
          dataIndex: 'crtName'
        },
        {
          title: '更新时间',
          dataIndex: 'updTime'
        },
        {
          title: '创建时间',
          dataIndex: 'crtTime'
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getPositionList(Object.assign(parameter, this.queryParam))
          .then(res => {
            return res.result
          })
      }
    }
  },
  methods: {
    /**
     * 关联用户
     */
    associateUser (record) {
      this.positionId = record.id
      return getPositionUser({ id: record.id }).then(res => {
        if (res.status === 200) {
          this.$refs.model.begin(res.result.data)
        } else {
          this.$notification['error']({
            message: '获取人员失败',
            duration: 4
          })
        }
      })
    },
    /**
     * 开启高级搜索
     */
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    /**
     * 重置搜索条件
     */
    resetSearchForm () {
      this.queryParam = {}
    },
    /**
     * 保存关联用户的操作结果
     */
    handleSaveOk (returnData) {
      const ids = returnData.map(item => item.id)
      const names = returnData.map(item => item.name)
      return savePositionUser({
        id: this.positionId,
        users: ids.join(),
        name: names.join()
      })
        .then(res => {
          if (res.status === 200) {
            this.$notification['success']({
              message: '操作成功',
              duration: 2
            })
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
    }
  }
}
</script>

<style>

</style>
