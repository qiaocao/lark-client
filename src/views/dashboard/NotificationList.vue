<template>
  <div>
    <a-card v-if="$route.name=='MyNotices'">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row type="flex" justify="end" :gutter="8">
            <a-col :span="40">
              <a-form-item label="标题" class="title">
                <a-input v-model="queryParam.groupName" placeholder="请在此输入..." />
              </a-form-item>
            </a-col>
            <!-- 后台接口还没有做好 -->
            <!-- <a-col :span="4">
              <a-form-item label="密级">
                <a-select placeholder="请选择" v-model="queryParam.groupLevel">
                  <a-select-option value="30">非密</a-select-option>
                  <a-select-option value="40">秘密</a-select-option>
                  <a-select-option value="60">机密</a-select-option>
                </a-select>
              </a-form-item>
            </a-col> -->
            <!-- 暂时没有用到 -->
            <!-- <a-col :span="4">
              <a-form-item label="类型">
                <a-select placeholder="请选择" v-model="queryParam.type">
                  <a-select-option value="admin">管理员公告</a-select-option>
                  <a-select-option value="system">系统消息</a-select-option>
                  <a-select-option value="approve">群组审批</a-select-option>
                </a-select>
              </a-form-item>
            </a-col> -->
            <a-col :span="50">
              <a-button-group>
                <a-button @click="search">查询</a-button>
                <a-button @click="() => queryParam = {}">重置</a-button>
              </a-button-group>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <a-tabs :defaultActiveKey="queryParam.type" @change="changeTabPage">
        <a-tab-pane :key="0">
          <span slot="tab">
            <a-icon type="team" />
            群组审批
          </span>
          <s-table ref="stableGroup" size="default" :columns="columns" :data="loadApprove" :alert="false">
            <span slot="action" slot-scope="text, approveInfo">
              <a @click="approveDetail(approveInfo.id)">详情</a>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane :key="1">
          <span slot="tab">
            <a-icon type="coffee" />
            会议审批
          </span>
          <s-table ref="stableMeeting" size="default" :columns="columnsMeeting" :data="loadApprove" :alert="false">
            <span slot="action" slot-scope="text, approveInfo">
              <a @click="approveDetail(approveInfo.id, approveInfo)">详情</a>
            </span>
          </s-table>
        </a-tab-pane>
      </a-tabs>
      <!-- <a-modal
        title="详情"
        centered
        v-model="detailVisible"
        destroyOnClose
      >
        <template slot="footer">
          <a-button type="primary" @click="pass" :loading="passLoading">同意</a-button>
          <a-button @click="unpass" :loading="unpassLoading">驳回</a-button>
        </template>
        <group-approve :groupApproveId="groupApproveId" ref="child"/>
      </a-modal> -->
    </a-card>
    <router-view/>
  </div>
</template>
<script>
import STable from '@/components/table'
import { getMySelfNoticePage } from '@/api/workplace'
import { groupApprovePage } from '@/api/talk'
import GroupApprove from '@/views/approve/GroupApprove'
export default {
  name: 'NotificationList',
  components: {
    STable,
    GroupApprove
  },
  data () {
    return {
      // 响应式布局
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16, offset: 1 }
      },
      // 详情信息卡片可视化
      cardVisible: false,
      // tabs标签显示审批列表可视化
      visible: true,
      // 驳回按钮加载状态
      unpassLoading: false,
      // 同意按钮加载状态
      passLoading: false,
      groupApproveId: null,
      queryParam: { type: 0 },
      type: '',
      // 设置上传的请求头部，IE10 以上有效
      headers: {
        authorization: 'authorization-text'
      },
      detailVisible: false,
      // 表头
      columns: [
        {
          title: '群组名称',
          dataIndex: 'groupName'
        },
        {
          title: '密级',
          dataIndex: 'groupLevel',
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
        // {
        //   title: '类型',
        //   dataIndex: 'type',
        //   key: 'type',
        //   customRender: function (type) {
        //     const config = {
        //       admin: '管理员公告',
        //       system: '系统消息',
        //       approve: '群组审批'
        //     }
        //     return config[type]
        //   }
        // },
        {
          title: '申请人',
          dataIndex: 'creatorName'
        },
        {
          title: '时间',
          dataIndex: 'createTime'
        },
        {
          title: '操作',
          width: '120px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      columnsMeeting: [
        {
          title: '会议名称',
          dataIndex: 'groupName'
        },
        {
          title: '密级',
          dataIndex: 'groupLevel',
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
          title: '申请人',
          dataIndex: 'creatorName'
        },
        {
          title: '时间',
          dataIndex: 'createTime'
        },
        {
          title: '操作',
          width: '120px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getMySelfNoticePage(Object.assign(parameter, this.queryParam, { 'orgCode': this.userInfo.orgCode })).then(res => {
          return res.result
        })
      },
      // 加载审批列表
      loadApprove: parameter => {
        return groupApprovePage(Object.assign(parameter, this.queryParam)).then(res => {
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
  methods: {
    /**
     * 搜索
     */
    search () {
      this.$refs.stable.refresh({}, this.queryParam, {})
    },
    /**
     * 详情
     */
    approveDetail (approveId, queryParam) {
      console.log('点我之后发送', approveId)
      queryParam = this.queryParam
      this.$router.push({ path: '/dashboard/msg-list/approval-list/approval', query: { approveId, queryParam } })
      // this.groupApproveId = approveId
      // this.detailVisible = true
      // // this.visible = false
      // this.cardVisible = true
      // this.$nextTick(() => {
      //   // this.$refs.child.approveDetail()
      // })
    },
    pass () {
      this.passLoading = true
      this.$refs.child.pass().then(res => {
        if (res.status === 200 && res.rel) {
          this.$notification['success']({
            message: res.result
          })
        } else {
          this.$notification['error']({
            message: res.result
          })
        }
        this.detailVisible = false
        this.$refs.stable.refresh({}, this.queryParam, {})
      }).finally(() => {
        this.passLoading = false
      })
    },
    unpass () {
      this.unpassLoading = true
      this.$refs.child.unpass().then(res => {
        if (res.status === 200 && res.rel) {
          this.$notification['success']({
            message: res.result
          })
        } else {
          this.$notification['error']({
            message: res.result
          })
        }
        this.detailVisible = false
        this.$refs.stable.refresh({}, this.queryParam, {})
      }).finally(() => {
        this.unpassLoading = false
      })
    },
    changeTabPage (key) {
      this.queryParam = {}
      let tab = 'stableGroup'
      if (key === 1) {
        this.queryParam.type = 1
        tab = 'stableMeeting'
      } else {
        this.queryParam.type = 0
      }
      this.$nextTick(() => {
        this.$refs[tab].refresh({}, this.queryParam, {})
      })
    },
    /**
     * 返回按钮
     */
    goBack () {
      this.cardVisible = false
      this.visible = true
    }
  }
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
