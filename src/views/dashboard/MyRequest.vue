<template>
  <div>
    <a-card>
      <!-- <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row type="flex" justify="end" :gutter="8">
            <a-col :span="40">
              <a-form-item label="标题" class="title">
                <a-input v-model="queryParam.groupName" placeholder="请在此输入..." />
              </a-form-item>
            </a-col>
            <a-col :span="50">
              <a-button-group>
                <a-button @click="search">查询</a-button>
                <a-button @click="() => queryParam = {}">重置</a-button>
              </a-button-group>
            </a-col>
          </a-row>
        </a-form>
      </div> -->
      <s-table ref="stableRequest" size="default" :columns="columns" :data="requestData" :rowKey="record => record.groupId">
        <span slot="action" slot-scope="text, approveInfo">
          <a @click="approveDetail(approveInfo)">详情</a>
        </span>
        <span slot="userLevels" slot-scope="text">{{ text | peopleSecret }}</span>
        <span slot="approveType" slot-scope="text">{{ setMeetingType(text) }}</span>
        <span slot="approveStatus" slot-scope="text">{{ setApproveStatus(text) }}</span>
        <span slot="groupName" slot-scope="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="userName" slot-scope="text">
          <ellipsis :length="8" tooltip>{{ text }}</ellipsis>
        </span>
      </s-table>
    </a-card>
  </div>
</template>
<script>
import STable from '@/components/table'
import { getRequestList } from '@/api/talk'
import Ellipsis from '@/components/Ellipsis'
const columns = [
  { title: '申请人姓名',
    dataIndex: 'applyName',
    width: 150
  },
  { title: '审批类型',
    dataIndex: 'type',
    width: 150,
    scopedSlots: { customRender: 'approveType' }
  },
  { title: '申请时间',
    dataIndex: 'applyTime',
    width: 150
  },
  { title: '名称',
    dataIndex: 'groupName',
    width: 150,
    scopedSlots: { customRender: 'groupName' }
  },
  { title: '密级',
    dataIndex: 'groupLevel',
    width: 150,
    scopedSlots: { customRender: 'userLevels' }
  },
  { title: '审批人名称',
    dataIndex: 'approveName',
    width: 150,
    scopedSlots: { customRender: 'userName' }
  },
  { title: '审批时间',
    dataIndex: 'approveTime',
    width: 150
  },
  { title: '审批状态',
    dataIndex: 'approveStatus',
    width: 150,
    align: 'center',
    scopedSlots: { customRender: 'approveStatus' }
  },
  {
    title: '操作',
    width: '120px',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
  }
]
/* 审批状态列表 */
const APPROVE_STATUS = [
  { value: 0, title: '未审批' },
  { value: 1, title: '审批通过' },
  { value: 2, title: '不通过' }
]
/* 审批类型列表 */
const TYPE_LIST = [
  { value: 0, title: '群组' },
  { value: 1, title: '会议' }
]

export default {
  name: 'MyRequestList',
  components: {
    STable,
    Ellipsis
  },
  data () {
    return {
      columns,
      pageSize: 10,
      pageNo: 1,
      approveFlg: 4,
      type: -1,
      approveStatusList: APPROVE_STATUS,
      requestData: parameter => {
        return getRequestList(this.pageSize, this.pageNo, this.approveFlg, this.type).then(res => {
          return res.result
        })
      },
      /* 会议类型列表 */
      meetTypeList: TYPE_LIST
    }
  },
  methods: {
    approveDetail ({ id, type }) {
      this.$router.push({ path: '/dashboard/msg-list/approval-list/approval', query: { approveId: id, queryParam: { type: parseInt(type) } } })
    },
    /**
     * 设置审批状态
     */
    setApproveStatus (approveStatus) {
      const ASList = this.approveStatusList
        .find(({ value }) => parseInt(approveStatus) === value) || ''
      return ASList.title
    },
    /**
     * 设置会议类型
     */
    setMeetingType (type) {
      const MTList = this.meetTypeList
        .find(({ value }) => parseInt(type) === value) || ''
      return MTList.title
    }
  }
  // created () {
  //   getRequestList().then(res => {
  //     console.log('res098', res)
  //     this.requestData = res.result
  //   })
  // }
}
</script>
<style lang="less" scoped>
  .title {
    width: 600px
  }
  .form-row {
  margin-bottom: 10px
  }
</style>
