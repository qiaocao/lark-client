<template>
  <div class="commontool">
    <a-card
      style="margin-top: 24px"
      :bordered="false"
      title="链接列表">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row type="flex" justify="end" :gutter="8">
            <a-col :span="12">
              <a-form-item label="名称">
                <a-input v-model="queryParam.title" placeholder="在此输入..." />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-button-group>
                <a-button @click="search">查询</a-button>
                <a-button @click="() => queryParam = {}">重置</a-button>
              </a-button-group>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <s-table
        ref="stable"
        size="default"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
      >
        <span slot="name" slot-scope="text, record">
          <a-avatar slot="avatar" size="large" shape="square" :src="'/tools/Icon-'+record.description+'.png'"/><span style="margin-left:10px">{{ record.title }}</span>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="addId(record.id)" v-if="record.defaultChecked === false">加入常用</a>
          <a @click="removeId(record.id)" v-if="record.defaultChecked === true">取消常用</a>
        </span>
      </s-table>
    </a-card>
  </div>
</template>
<script>
import { setCheckCommonTools, getSelfCommonTools, delCheckCommonTools } from '@/api/setting'
import { STable } from '@/components'
export default {
  name: 'StandardList',
  components: {
    STable
  },
  data () {
    return {
      flags: [],
      flag: [],
      data: [],
      t: '',
      user: {},
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '名称',
          dataIndex: 'title',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: '描述',
          dataIndex: 'description'
        },
        {
          title: 'uri',
          dataIndex: 'uri'
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
        parameter.orgCode = this.user.orgCode
        return getSelfCommonTools(parameter).then(res => {
          return res.result
        })
      }
    }
  },
  computed: {
    userInfo () {
      return this.$store.getters.userInfo
    }
  },
  created () {
    this.user = Object.assign({}, this.userInfo)
    // this.getData()
  },
  methods: {
    /**
     * 搜索
     */
    search () {
      this.$refs.stable.loadData({}, this.queryParam, {})
    },
    /**
     * 添加个人常用工具
     */
    addId (id) {
      setCheckCommonTools({ 'toolId': id })
        .then(res => {
          if (res.status === 200) {
            this.$notification['success']({
              message: '操作成功',
              duration: 2
            })
            this.search()
          }
        })
    },
    /**
     * 取消个人常用工具
     */
    removeId (id) {
      delCheckCommonTools({ 'commonToolId': id })
        .then(res => {
          if (res.status === 200) {
            this.$notification['success']({
              message: '取消常用',
              duration: 2
            })
            this.search()
          }
        })
    }
  }
}
</script>

<style lang="less">
    .ant-avatar-lg {
        width: 48px;
        height: 48px;
        line-height: 48px;
    }

    .list-content-item {
        color: rgba(0, 0, 0, .45);
        display: inline-block;
        vertical-align: middle;
        font-size: 14px;
        margin-left: 40px;
        span {
            line-height: 20px;
        }
        p {
            margin-top: 4px;
            margin-bottom: 0;
            line-height: 22px;
        }
    }
    .commontool.layout.ant-layout.mobile .ant-table-wrapper .ant-table-body, .layout.ant-layout.tablet .ant-table-wrapper .ant-table-body {
      min-width: 100px
    }
</style>
