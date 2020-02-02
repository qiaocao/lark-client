<template>
  <div class="approve-detail">
    <!-- <detail-list slot="headerContent" size="small" :col="2" class="detail-layout">
      <detail-list-item term="创建人">{{ groupInfo.creatorName }}</detail-list-item>
      <detail-list-item term="密级">{{ groupInfo.levels }}</detail-list-item>
      <detail-list-item term="创建时间">{{ groupInfo.createTime }}</detail-list-item>
      <detail-list-item term="成员数量">{{ groupInfo.groupMembers }}</detail-list-item>
      <detail-list-item term="备注">{{ groupInfo.groupDescribe }}</detail-list-item>
    </detail-list> -->
    <!-- <a-row slot="extra" class="status-list">
      <a-col :xs="12" :sm="12">
        <div class="text">状态</div>
        <div class="heading">待审批</div>
      </a-col>
    </a-row> -->
    <!-- <a-card
      style="margin-top: 8px"
      title="组成员"
    > -->
    <a-table
      :rowKey="(record) => record.userId"
      :columns="groupUserColumns"
      :dataSource="memberList"
      :pagination="false"
      :scroll="{ y: 379 }"
      :loading="GroupApproveLoading"
    >
    </a-table>
    <!-- </a-card> -->
  </div>
</template>
<script>
import { groupApproveDetail, groupApprove } from '@/api/talk'
import { SECRETLEVEL_ENUM } from '@/utils/constants'
import DetailList from '@/components/tools/DetailList'
export default {
  name: 'GroupApprove',
  components: { DetailList },
  props: {
    groupApproveId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      GroupApproveLoading: false,
      groupApproveValue: {},
      groupInfo: {},
      memberList: [],
      groupUserColumns: [
        // {
        //   title: '序号',
        //   dataIndex: 'num',
        //   key: 'type'
        // },
        {
          title: '成员姓名',
          dataIndex: 'userName',
          key: 'name',
          width: '50%'
        },
        {
          title: '密级',
          dataIndex: 'userLevels',
          key: 'secretLevel',
          width: '50%',
          customRender: function (secretLevel) {
            return SECRETLEVEL_ENUM.get(parseInt(secretLevel)).people
          }
        }
        // {
        //   title: '部门',
        //   dataIndex: 'updatedAt',
        //   key: 'updatedAt'
        // }
      ]
    }
  },
  created () {
    // groupApproveDetail(this.groupApproveId).then(res => {
    //   // 后端接口需要修改，这里全部传过来了，不方便后期维护
    //   this.groupInfo = JSON.parse(res.result).data
    //   this.memberList = this.groupInfo.userList
    //   console.log(this.memberList)
    // })
  },
  methods: {
    pass () {
      return groupApprove({ id: this.groupApproveId, approveFlg: 1 })
    },
    unpass () {
      return groupApprove({ id: this.groupApproveId, approveFlg: 2 })
    },
    approveDetail () {
      this.GroupApproveLoading = true
      groupApproveDetail(this.groupApproveId)
        .then(res => {
          // 后端接口需要修改，这里全部传过来了，不方便后期维护
          this.groupInfo = JSON.parse(res.result).data
          this.memberList = this.groupInfo.userList
          console.log('this.groupInfo', this.groupInfo)
        })
        .finally(() => {
          this.GroupApproveLoading = false
        })
    }
  }
}
</script>
<style scoped>
.approve-detail{

}
</style>
