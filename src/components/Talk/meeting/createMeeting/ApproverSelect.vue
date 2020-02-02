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
import { getUserBypositionAndSecret } from '@/api/admin'
import UserTransfer from '@/components/admin/UserTransfer'

export default {
  name: 'ApproverSelect',
  props: {
    info: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  components: { UserTransfer },
  data () {
    return {
      /** 已选审批人列表 */
      approveList: [],
      loading: false,
      listStyle: {
        width: '188px',
        height: '400px'
      }
    }
  },
  created () {
    this.approveList = this.info.approveList || []
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'userId',
      'userSecretLevel',
      'avatar'
    ])
  },
  mounted () {
    const { levels, groupType } = this.info
    this.$refs.approvalSelect.beginChooseUser(
      this.info.approveList,
      {
        secretLevel: levels,
        position: groupType
      }
    )
  },
  methods: {
    /**
     * 设置已选择审批人
     */
    handleApprovalSelect (selected) {
      this.approveList = selected
    },
    /**
     * 显示已选中审批人
     */
    showSelected () {
      const selected = this.info.approveList || []
      selected.forEach(elem => {
        this.targetKeys.push(elem.key)
      })
    },
    /**
     * 获取审批人列表
     */
    getApproverList () {
      /* groupType
        代表类型（0-部门内 1-跨部门 2-跨厂所） */
      const { levels, groupType } = this.info
      getUserBypositionAndSecret({
        id: groupType,
        secretLevel: levels
      }).then(res => {
        this.dataSource = this.transformDate(res.result.data)
      })
    },
    /**
     * 下一步
     */
    nextStep () {
      const { approveList } = this
      if (approveList.length === 0) {
        this.$notification.warning({ message: '请选择审批人' })
        return
      }
      this.$emit('nextStep', { approveList })
    },
    /**
     * 前一步
     */
    prevStep () {
      this.$emit('prevStep')
    },
    /**
     * 处理穿梭框数据
     */
    handleChange (targetKeys, direction, moveKeys) {
      this.targetKeys = targetKeys
    },
    /**
     * 转换数据格式
     */
    transformDate (data) {
      const strTarget = JSON.stringify(data)
      const target = strTarget
        .replace(/"id"/g, '"key"')
        .replace(/"name"/g, '"title"')
        .replace(/"description"/g, '"descrip"')
        .replace(/"orgName"/g, '"description"')
        .replace(/null/g, '"未知"')
      const objTarget = JSON.parse(target)
      return objTarget
    }
  }
}
</script>

<style lang="less" scoped>

</style>
