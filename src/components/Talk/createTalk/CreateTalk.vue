<template>
  <a-modal
    v-model="visible"
    style="top: 16px;"
    :bodyStyle="{padding:'8px'}"
    :maskClosable="false"
    :width="720"
    destroyOnClose
    :footer="null"
    @cancel="handleCloseModal"
  >
    <template slot="title">
      <div class="create-talk-title">创建研讨组</div>
    </template>
    <a-card :bordered="false">
      <div class="steps-container">
        <a-steps class="steps" :current="currentTab" size="small">
          <a-step title="填写基本信息" />
          <a-step title="选择群组成员" />
          <a-step title="选择审批人" />
          <a-step title="提交审批" />
        </a-steps>
      </div>
      <div class="content">
        <BaseInfo
          v-if="currentTab === 0"
          :groupInfo="baseInfo"
          @nextStep="nextStep"
          ref="baseInfo"
        />
        <UserSelect
          v-if="currentTab === 1"
          :info="baseInfo"
          @nextStep="nextStep"
          @prevStep="prevStep"
        />
        <ApproverSelect
          v-if="currentTab === 2"
          :groupInfo="baseInfo"
          @nextStep="nextStep"
          @prevStep="prevStep"
        />
        <ResultPage
          v-if="currentTab === 3"
          ref="resultPage"
          :groupInfo="baseInfo"
          @prevStep="prevStep"
          @close="handleCloseModal"
        />
      </div>
    </a-card>
  </a-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseInfo from './BaseInfo'
import UserSelect from './UserSelect'
import ApproverSelect from './ApproverSelect'
import ResultPage from './ResultPage'

export default {
  name: 'CreateTalk',
  components: {
    BaseInfo,
    UserSelect,
    ResultPage,
    ApproverSelect
  },
  props: {
    // 显示显示模态框,需要一个返回true或者false的方法
    showTModal: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      visible: false,
      currentTab: 0,
      baseInfo: {}
    }
  },
  computed: {
    ...mapGetters(['userId', 'nickname'])
  },
  watch: {
    showTModal (fuc) {
      if (fuc()) this.visible = true
    }
  },
  methods: {
    nextStep (values, step) {
      switch (step) {
        // 从第一步跳转到第二步
        case 1:
          const creatorInfo = {
            creator: this.userId,
            creatorName: this.nickname,
            updator: this.userId,
            type: '3'
          }
          const { levels, groupType } = this.baseInfo
          Object.assign(this.baseInfo, values, creatorInfo)
          // 根据条件判断是否重新选择成员
          if (levels !== this.baseInfo.levels ||
            groupType !== this.baseInfo.groupType) {
            this.baseInfo.approveList = []
            this.baseInfo.userListRaw = []
          }
          break
        // 从第二步跳转到第三步
        case 2:
          Object.assign(this.baseInfo, values)
          break
        // 从第三步跳到第四部
        case 3:
          Object.assign(this.baseInfo, values)
          break
        default:
          break
      }
      if (this.currentTab < 3) {
        this.currentTab += 1
      }
    },
    prevStep () {
      if (this.currentTab > 0) {
        this.currentTab -= 1
      }
      if (this.currentTab === 0) {
        // 回显基本信息
        this.$nextTick(() => {
          this.$refs.baseInfo.setFormData(this.baseInfo)
        })
      }
    },
    resetCreate () {
      this.baseInfo = {}
      this.currentTab = 0
    },
    /** 创建成功后再次打开模态框回到第一步 */
    handleCloseModal () {
      this.visible = false
      // 已经完成创建
      if (this.currentTab === 3 && this.$refs.resultPage.isCreated) {
        this.resetCreate()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.steps {
  max-width: 750px;
  margin: 8px auto;
}
.steps-container {
  padding: 0 16px 0 32px;
}
.create-talk-title {
  text-align: center;
}
</style>
