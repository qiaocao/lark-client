<template>
  <!-- 会议发言人选择模态框 -->
  <a-modal
    :visible="visible || showSModal"
    title="选择发言人"
    :bodyStyle="{padding:'8px'}"
    :maskClosable="false"
    :width="720"
    destroyOnClose
    :footer="null"
    @cancel="closeSpeakerEdit"
  >
    <a-form class="speaker-edit-content">

      <a-row type="flex" justify="space-around">
        <a-col :span="20">
          <div :style="{ borderBottom: '1px solid #E9E9E9' }">
            <a-checkbox
              :indeterminate="indeterminate"
              @change="onCheckAllChange"
              :checked="checkAll"
            >
              自由发言
            </a-checkbox>
          </div>
          <br />
          <a-checkbox-group v-model="checkedList" @change="onChange" class="member-list">
            <a-row>
              <a-col :span="8" v-for="item in memberList" :key="item.userId" class="member-item">
                <a-checkbox :value="item.userId">
                  {{ item.userName }} - {{ item.userRoleName }}
                </a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-col>
      </a-row>

      <a-form-item :wrapperCol="{span: 14, offset: 10}" style="margin-top: 24px;">
        <a-button @click="handleCancel">取消</a-button>
        <a-button
          style="margin-left: 8px"
          type="primary"
          @click="handleConfirm"
          :loading="loading"
        >确认
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateSpeakers } from '@/api/meeting'
import { sendSysMsg } from './constance'

export default {
  name: 'SpeakerEdit',
  props: {
    showSModal: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data () {
    return {
      /* 是否显示窗口 */
      visible: false,
      /* 已选成员 */
      checkedList: [],
      /* 是否部分选择 */
      indeterminate: false,
      /* 是否全选 */
      checkAll: false,
      /* 等待服务器响应 */
      loading: false
    }
  },
  computed: {
    ...mapGetters(['nickname']),
    /* 参会人员列表
      canMsg:"1"
      joinTime:"2019-10-18 11:31:19"
      online:"1"
      userId:"yanzhenqing"
      userImg:"group1/M00/00/06/CgsYil2JvpSABbj9AAHYRvaY9e8526.jpg"
      userLevel:"70"
      userName:"严振卿"
      userNo:"123"
      userOrgCode:"00100011"
      userOrgName:"党委工作部"
      userRoleCode:"4000"
      userRoleName:"主持人"
    */
    memberList () {
      return this.$store.state.meeting.curMeeting.meetMemberList
    }
  },
  mounted () {
    // 设置默认选中的成员、自由发言选择框的状态
    const defaultList = Array.from(
      this.memberList.filter(i => i.canMsg === '1'),
      i => i.userId
    )
    this.checkedList = defaultList
    this.onChange(defaultList)
  },
  methods: {
    /**
     * 关闭发言人编辑窗口
     */
    closeSpeakerEdit () {
      this.$emit('update:showSModal', false)
    },
    /**
     * 取消操作
     */
    handleCancel () {
      this.closeSpeakerEdit()
    },
    /**
     * 确定操作
     */
    handleConfirm () {
      this.loading = true
      const { memberList, checkedList } = this
      const meetingId = this.$store.state.meeting.curMeeting.id
      let reqData = []
      reqData = memberList.map(item => {
        return {
          meetingId,
          userId: item.userId,
          canMsg: checkedList.includes(item.userId) ? '1' : '0'
        }
      })
      updateSpeakers(reqData).then(res => {
        if (res.rel) {
          this.$message.success('会议发言人已更新')
          // 发送系统消息
          const msg = `${this.nickname} 更新了发言状态`
          sendSysMsg(this, msg)
          this.closeSpeakerEdit()
        } else {
          this.$message.error('发言人更新失败，稍后再试')
        }
      }).catch(() => {
        this.$message.error('发言人更新失败，稍后再试')
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 已选人员发生改变
     */
    onChange (checkedList) {
      this.indeterminate = !!checkedList.length && (checkedList.length < this.memberList.length)
      this.checkAll = checkedList.length === this.memberList.length
    },
    /**
     * 全选状态发生改变
     */
    onCheckAllChange (e) {
      Object.assign(this, {
        checkedList: e.target.checked ? Array.from(this.memberList, i => i.userId) : [],
        indeterminate: false,
        checkAll: e.target.checked
      })
    }
  }

}
</script>

<style lang="less" scoped>
  .speaker-edit-content {
    max-width: 650px;
    margin: 16px auto;

    .member-list {
      overflow: auto;
      max-height: 350px;
      .member-item {
        margin-bottom: 8px;
      }
    }
  }
</style>
