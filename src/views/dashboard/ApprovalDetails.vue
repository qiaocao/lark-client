<template>
  <div class="goBack">
    <a href="#" slot="extra" @click="cacenlEdit" class="return">返回</a>
    <a-card :bordered="false">
      <detail-list title="审批详情信息列表" class="title">
        <detail-list-item term="审批名称">{{ info.groupName }}</detail-list-item>
        <detail-list-item term="申请人">{{ info.creatorName }}</detail-list-item>
        <detail-list-item term="密级">{{ info.levels | peopleSecret }}</detail-list-item>
        <detail-list-item term="成员范围">{{ setGroupType(info.groupType) }}</detail-list-item>
        <detail-list-item term="所属项目"><ellipsis :length="16" tooltip>{{ info.pname }}</ellipsis></detail-list-item>
        <detail-list-item term="会议类型" v-if="crossShow">{{ setMeetingType(info.cross) }}</detail-list-item>
        <a-divider style="margin-bottom: 8px"/>
        <detail-list-item term="参与范围" class="textarea"><ellipsis :length="200" tooltip>{{ info.scop }}</ellipsis></detail-list-item>
        <a-divider style="margin-bottom: 8px"/>
        <detail-list-item term="描述信息" class="textarea"><ellipsis :length="200" tooltip>{{ info.groupDescribe }}</ellipsis></detail-list-item>
      </detail-list>
      <a-divider style="margin-bottom: 8px"/>
      <a-table
        :columns="approvalColumns"
        :dataSource="approvalUserList"
        :scroll="{ y:314, x:1000}"
        :pagination="false"
        :rowKey="record => record.userId"
      >
        <span slot="userLevels" slot-scope="text">{{ text | peopleSecret }}</span>
        <span slot="roleCode" slot-scope="text">{{ setRoleCodeType(text) }}</span>
      </a-table>
      <a-divider style="margin-bottom: 32px"/>
      <div class="btnGroup" v-if="btnShow">
        <a-button type="primary" @click="pass" >同意</a-button>
        <a-button type="primary" @click="unpass">驳回</a-button>
      </div>
    </a-card>
  </div>
</template>
<script>
import { groupApproveDetail, groupApprove } from '@/api/talk'
import GroupApprove from '@/views/approve/GroupApprove'
import DetailList from '@/views/dashboard/DescriptionList'
import STable from '@/components/table/'
import PageContent from '@/components/layouts/PageView'
import router from '../../router'
import { TYPE_LIST } from '@/components/Talk/meeting/modules/constance'
import Ellipsis from '@/components/Ellipsis'
import { getRoleCodeList } from '@/api/meeting'
import { parseString } from 'loader-utils'
const DetailListItem = DetailList.Item
const approvalColumns = [
  { title: '成员名称',
    dataIndex: 'userName',
    width: 150
  },
  { title: '密级',
    dataIndex: 'userLevels',
    width: 150,
    scopedSlots: { customRender: 'userLevels' }
  },
  { title: '角色',
    dataIndex: 'roleCode',
    width: 150,
    scopedSlots: { customRender: 'roleCode' }
  }
]
const groupApproveColums = [
  { title: '成员名称',
    dataIndex: 'userName',
    width: 150
  },
  { title: '密级',
    dataIndex: 'userLevels',
    width: 150,
    scopedSlots: { customRender: 'userLevels' }
  }
]
/* 成员范围列表 */
const GROUP_TYPE = [
  { value: 0, title: '部门内' },
  { value: 1, title: '跨部门' },
  { value: 2, title: '跨单位' }
]
export default {
  name: 'ApprovalDetail',
  components: {
    GroupApprove,
    DetailList,
    DetailListItem,
    STable,
    PageContent,
    Ellipsis
  },
  props: {
    groupApproveId: {
      type: String,
      default: ''
    }
  },
  beforeRouteEnter (to, from, next) {
    if (from.name === 'Request') {
      next(vm => {
        vm.btnShow = false
      })
    }
    next()
  },
  data () {
    return {
      info: {},
      approvalColumns,
      approvalUserList: [],
      /* 会议类型列表 */
      meetTypeList: TYPE_LIST,
      groupTypeList: GROUP_TYPE,
      roleCodeList: [],
      crossShow: true,
      btnShow: true
    }
  },
  created () {
    groupApproveDetail(this.$route.query.approveId).then(res => {
      console.log('res678', res)
      const result = JSON.parse(res.result).data
      this.info = result
      this.approvalUserList = this.info.userList
    })
    if (this.$route.query.queryParam.type === 0) {
      this.approvalColumns = groupApproveColums
      this.crossShow = false
    }
    /* 获取角色列表 */
    getRoleCodeList().then(res => {
      this.roleCodeList = res.result.data
    })
  },
  methods: {
    pass () {
      return groupApprove({ id: this.$route.query.approveId, approveFlg: 1 }).then(res => {
        console.log('id', this.$route.query.approveId)
        if (res.status === 200 && res.rel) {
          this.$notification['success']({
            message: res.result
          })
        } else {
          this.$notification['error']({
            message: res.result
          })
        }
      }).finally(() => {
        this.cacenlEdit()
      })
    },
    unpass () {
      return groupApprove({ id: this.$route.query.approveId, approveFlg: 2 }).then(res => {
        if (res.status === 200 && res.rel) {
          this.$notification['success']({
            message: res.result
          })
        } else {
          this.$notification['error']({
            message: res.result
          })
        }
      }).finally(() => {
        this.cacenlEdit()
      })
    },
    cacenlEdit () {
      router.go(-1)
      this.$emit('refresh()')
    },
    /**
     * 设置会议类型
     */
    setMeetingType (cross) {
      const MTList = this.meetTypeList
        .find(({ value }) => parseInt(cross) === value) || ''
      return MTList.title
    },
    /**
     * 设置成员范围
     */
    setGroupType (groupType) {
      const STList = this.groupTypeList
        .find(({ value }) => parseInt(groupType) === value) || ''
      return STList.title
    },
    /**
     * 设置角色列表
     */
    setRoleCodeType (roleCode) {
      const a = this.roleCodeList
        .find(({ code }) => parseString(roleCode) === code) || ''
      return a.name
    }
  }
}
</script>
<style lang="less" scoped>
.btnGroup {
  margin:0 auto;
  width:200px;
}
button {
  margin: 0 0 0 20px;
}
.textarea {
  width: 100%
}
.goBack {
  padding: 8px;
  background: #fff;
}
.return {
  padding-left: 8px;
}
</style>
