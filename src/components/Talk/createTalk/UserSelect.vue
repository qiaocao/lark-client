<template>
  <div>
    <a-form style="max-width: 650px; margin: 40px auto 0;">
      <a-alert :closable="true" :message="alertMessage" style="margin-bottom: 12px;" />

      <UserTransfer
        ref="groupUserTransfer"
        @ok="handleUserSelect"
        :listStyle="listStyle"
        :level="info.groupType"
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
import UserTransfer from '@/components/admin/UserTransfer'

export default {
  name: 'UserSelect',
  components: { UserTransfer },
  props: {
    info: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },
  data () {
    return {
      loading: false,
      userListRaw: [],
      listStyle: {
        width: '188px',
        height: '400px'
      }
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'userPId',
      'avatar',
      'nickname',
      'userSecretLevel',
      'userInfo'
    ])
  },
  mounted () {
    const secretListMap = new Map([
      [60, [60, 70, 80, 90]],
      [40, [40, 50, 60, 70, 80, 90]],
      [30, [30, 40, 50, 60, 70, 80, 90]]
    ])
    this.userListRaw = this.info.userListRaw || []
    this.$refs.groupUserTransfer.beginChooseUser(
      this.userListRaw,
      {
        secretLevels: secretListMap.get(this.info.levels).join(),
        exPid: this.userPId,
        // 下面同时兼容会议和群组的创建
        grouptype: this.info.groupType,
        userOrgCode: this.userInfo.orgCode
      }
    )
  },
  methods: {
    alertMessage () {
      switch (this.info.levels) {
        case 60:
          return '机密级成员数量不能超过50'
        case 40:
          return '秘密级成员数量不能超过100'
        case 30:
        default:
          return '下列用户已根据密级和类型进行了筛选'
      }
    },
    nextStep () {
      const memberNum = this.userListRaw.length
      if (memberNum < 1) {
        this.$notification.warning({ message: '请选择成员' })
        return
      } else if (memberNum < 2) {
        this.$notification.warning({ message: '成员数量不满足要求' })
        return
      } else if (this.info.levels === 40 && memberNum >= 100) {
        this.$notification.warning({ message: '秘密级成员数量不能超过100' })
        return
      } else if (this.info.levels === 60 && memberNum >= 50) {
        this.$notification.warning({ message: '机密级成员数量不能超过50' })
        return
      }
      // const members = this.userList.map(item => {
      //   const newItem = {}
      //   const { id, secretLevel, img } = item
      //   newItem.userId = id
      //   newItem.userLevels = secretLevel
      //   newItem.img = img
      //   return newItem
      // })
      // members.push({
      //   userId: this.userId,
      //   userLevels: this.userSecretLevel,
      //   img: this.avatar
      // })
      this.$emit('nextStep', { userListRaw: this.userListRaw }, 2)
    },
    prevStep () {
      this.$emit('prevStep')
    },
    handleUserSelect (userArr) {
      this.userListRaw = userArr
    }
  }
}
</script>

<style lang="less" scoped>
.stepFormText {
  margin-bottom: 24px;

  .ant-form-item-label,
  .ant-form-item-control {
    line-height: 22px;
  }
}
</style>
