<template>
  <div class="approver-select">
    <a-form style="max-width: 650px; margin: 40px auto 0;">

      <UserTransfer
        ref="approvalSelect"
        @ok="handleApprovalSelect"
        :listStyle="listStyle"
        type="approval"
        tabNum="1"
      />

      <a-form-item :wrapperCol="{span: 14, offset: 10}" style="margin-top: 8px;">
        <a-button @click="prevStep">上一步</a-button>
        <a-button style="margin-left: 8px" :loading="loading" type="primary" @click="nextStep">下一步</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createTalkApproval } from '@/api/talk'
import UserTransfer from '@/components/admin/UserTransfer'

export default {
  name: 'ApproverSelect',
  props: {
    groupInfo: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  components: { UserTransfer },
  data () {
    return {
      /** 审批人列表 */
      approveList: [],
      loading: false,
      listStyle: {
        width: '188px',
        height: '400px'
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'userId',
      'userSecretLevel',
      'avatar',
      'nickname',
      'userPId'
    ])
  },
  created () {
    this.approveList = this.groupInfo.approveList || []
  },
  mounted () {
    const { levels, groupType } = this.groupInfo
    this.$refs.approvalSelect.beginChooseUser(
      this.groupInfo.approveList,
      {
        secretLevel: levels,
        position: groupType
      }
    )
  },
  methods: {
    handleApprovalSelect (selected) {
      this.approveList = selected
    },
    /**
     * 创建群组
     */
    createGroup () {
      if (this.approveList.length === 0) {
        this.$notification.warning({ message: '请选择审批人' })
        return
      }
      this.loading = true

      // 处理审批人
      const approvers = this.approveList.map(item => {
        const newItem = {}
        newItem.img = item.avatar
        newItem.userId = item.id
        newItem.userName = item.name
        newItem.userNo = item.pId
        newItem.userLevels = JSON.parse(item.secretLevel)
        return newItem
      })
      // 处理成员列表
      const members = this.groupInfo.userListRaw.map(item => {
        const newItem = {}
        const { id, secretLevel, img, name, pid } = item
        newItem.userId = id
        newItem.userLevels = secretLevel
        newItem.img = img || ''
        newItem.userName = name
        newItem.userNo = pid
        return newItem
      })
      members.push({
        userId: this.userId,
        userLevels: this.userSecretLevel,
        img: this.avatar,
        userName: this.nickname,
        userNo: this.userPId
      })
      // 处理数据
      const approvalData = Object.assign(
        this.groupInfo,
        { approveList: approvers },
        { userList: members }
      )
      // 发送创建群组的请求
      const postData = {
        code: 3,
        data: approvalData
      }
      createTalkApproval(postData).then(res => {
        if (res.status === 200 && res.rel) {
          // this.$emit('nextStep', { approveList: approvers }, 3)
        } else {
          this.$notification.warn({
            message: '申请提交失败，请稍后再试'
          })
        }
      }).catch(() => {
        this.$notification.warn({
          message: '申请提交失败，请稍后再试'
        })
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 前一步
     */
    prevStep () {
      this.$emit('prevStep')
    },
    /**
     * 下一步
     */
    nextStep () {
      if (this.approveList.length === 0) {
        this.$notification.warning({ message: '请选择审批人' })
        return
      }
      this.$emit('nextStep', { approveList: this.approveList }, 3)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
