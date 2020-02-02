<template>
  <a-modal
    :visible="visible || showMModal"
    style="top: 16px;"
    :bodyStyle="{padding:'8px'}"
    :maskClosable="false"
    :width="720"
    destroyOnClose
    :footer="null"
    @cancel="handleCloseModal"
  >
    <!-- 标题 -->
    <template slot="title">
      <div class="create-meeting-title">创建会议</div>
    </template>
    <!-- 创建步骤 -->
    <a-card :bordered="false">
      <div class="meeting-steps">
        <a-steps class="steps" :current="currentTab" size="small">
          <a-step v-for="i in steps" :key="i.title" :title="i.title" />
        </a-steps>
      </div>
      <div class="steps-content">
        <BaseInfo
          v-if="currentTab === 0"
          :meetingInfo="meetingInfo"
          @nextStep="handleNext"
          ref="baseInfo"
        />
        <UserSelect
          v-if="currentTab === 1"
          :info="meetingInfo"
          @nextStep="handleNext"
          @prevStep="handlePrev"
        />
        <RoleAssign
          v-if="currentTab === 2"
          :info="meetingInfo"
          :roleList="roleList"
          @nextStep="handleNext"
          @prevStep="handlePrev"
        />
        <ApproverSelect
          v-if="currentTab === 3"
          :info="meetingInfo"
          @nextStep="handleNext"
          @prevStep="handlePrev"
        />
        <ResultPage
          v-if="currentTab === 4"
          :info="meetingInfo"
          :roleList="roleList"
          ref="resultPage"
          @close="handleCloseModal"
          @nextStep="handleNext"
          @prevStep="handlePrev"
        />
      </div>
    </a-card>
  </a-modal>
</template>

<script>
import BaseInfo from './BaseInfo'
import ResultPage from './ResultPage'
import RoleAssign from './RoleAssign'
import ApproverSelect from './ApproverSelect'
// 复用群组创建的人员选择
import UserSelect from '@/components/Talk/createTalk/UserSelect'
import { getRoleCodeList } from '@/api/meeting'

export default {
  name: 'CreateMeeting',
  props: {
    /* 打开创建会议弹窗 v-bind:showMModal.sync="" */
    showMModal: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  components: {
    BaseInfo,
    UserSelect,
    RoleAssign,
    ApproverSelect,
    ResultPage
  },
  data () {
    return {
      visible: false,
      /* 当前位置 0 - 4 */
      currentTab: 0,
      /* 创建会议的步骤 */
      steps: [
        { title: '基本信息' },
        { title: '参会成员' },
        { title: '分配角色' },
        { title: '审批人' },
        { title: '等待审批' }
      ],
      /* 已经选择的会议信息 */
      meetingInfo: {},
      roleList: []
    }
  },
  created () {
    this.setRoleCodeList()
  },
  methods: {
    /**
     * 设置角色表
     */
    setRoleCodeList () {
      getRoleCodeList().then(res => {
        if (res.status !== 200) {
          this.$notification.warn({
            message: '角色列表请求失败，请稍后再试'
          })
          return
        }
        const resData = res.result.data
        const roleList = resData.map(item => {
          const newItem = {
            code: parseInt(item.code),
            name: item.name
          }
          return newItem
        })
        this.roleList = roleList
      })
    },
    /**
     * 下一步
     */
    handleNext (value) {
      if (this.currentTab < this.steps.length - 1) {
        this.currentTab += 1
      } else {
        // 最后一步后再次创建
        this.meetingInfo = {}
        this.currentTab = 0
      }

      // 监控密级和会议范围，控制参会人员和审批人
      const { levels, groupType } = this.meetingInfo
      Object.assign(this.meetingInfo, value)
      if (levels !== this.meetingInfo.levels ||
        groupType !== this.meetingInfo.groupType) {
        this.meetingInfo.approveList = []
        this.meetingInfo.userListRaw = []
      }
    },
    /**
     * 上一步
     */
    handlePrev () {
      if (this.currentTab > 0) {
        this.currentTab -= 1
      }
    },
    /**
     * 关闭创建会议弹框
     */
    handleCloseModal () {
      this.$emit('update:showMModal', false)
      if (this.currentTab === 4 && this.$refs.resultPage.isCreated) {
        this.meetingInfo = {}
        this.currentTab = 0
      }
    }
  }

}
</script>

<style lang="less" scoped>
.create-meeting-title {
  text-align: center;
}
</style>
