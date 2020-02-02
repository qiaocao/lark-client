<template>
  <!-- 议程编辑模态框 -->
  <a-modal
    :visible="visible || showAModal"
    title="议程编辑"
    :bodyStyle="{padding:'8px'}"
    :maskClosable="false"
    :width="720"
    destroyOnClose
    :footer="null"
    @cancel="closeAgendaEdit"
  >
    <a-spin :spinning="loading">
      <p v-if="over" class="over-tip">会议已结束，无法编辑议程</p>

      <div v-else class="meeting-agenda-edit">
        <a-form style="max-width: 650px; margin: 40px auto 0;">

          <a-row type="flex" justify="space-around">
            <a-col :span="6">
              <a-card
                title="可选议程"
                :headStyle="{fontSize: '14px',textAlign: 'center',lineHeight: '2.5em'}"
                :bodyStyle="{maxHeight: '400px', overflow: 'auto'}"
              >
                <a-tag
                  class="agenda"
                  v-for="(i, index) in agenda"
                  :key="index"
                  @click="addAgenda(i)"
                  color="blue"
                >
                  {{ i.name }}
                </a-tag>
                <a-input
                  v-if="inputVisible"
                  ref="input"
                  type="text"
                  size="small"
                  :style="{ width: '78px' }"
                  :value="inputValue"
                  @change="handleInputChange"
                  @blur="handleInputConfirm"
                  @keyup.enter="handleInputConfirm"
                />
                <a-tag v-else @click="showInput" style="background: #fff; borderStyle: dashed;">
                  <a-icon type="plus" /> 新增议程
                </a-tag>
              </a-card>
            </a-col>
            <a-col :span="12">
              <!-- 已选议程列表 -->
              <a-table
                :columns="columns"
                :dataSource="selected"
                size="small"
                :rowKey="() => Math.random()"
                :scroll="{ x: 300, y: 400 }"
                :pagination="false"
                :showHeader="false"
                :locale="{ emptyText: '未选择议程' }"
              >
                <span slot="index" slot-scope="text, record, index">
                  {{ index }}
                </span>
                <!-- 可操作的议程 -->
                <span
                  slot="action"
                  slot-scope="text, record, index"
                  v-if="index + 1 > curAgendaIndex && index < selected.length - 1"
                >
                  <!-- 向上移动 -->
                  <a
                    @click="moveUp(text, record, index)"
                    style="marginRight: 8px"
                    :disabled="index===0 || index === curAgendaIndex || index === 1"
                  >
                    <a-icon type="arrow-up" />
                  </a>
                  <!-- 向下移动 -->
                  <a
                    @click="moveDown(text, record, index)"
                    :disabled="index === selected.length - 2"
                  >
                    <a-icon type="arrow-down" />
                  </a>
                  <a-divider type="vertical" />
                  <!-- 移除 -->
                  <a @click="removeAgenda(text, record, index)">移除</a>
                </span>
                <!-- 不可操作的议程 -->
                <!-- 开始会议和结束会议不可编辑 -->
                <span
                  v-else-if="index === 0 || index === selected.length - 1"
                  slot="action"
                  slot-scope="text, record, index"
                >该议程不可编辑</span>
                <!-- 已经结束的议程不可编辑 -->
                <span v-else slot="action" style="color: #aaa">该议程已结束</span>
              </a-table>
            </a-col>
          </a-row>

          <a-form-item :wrapperCol="{span: 14, offset: 10}" style="margin-top: 8px;">
            <a-button @click="handleCancel">取消</a-button>
            <a-button
              style="margin-left: 8px"
              type="primary"
              @click="handleConfirm"
            >确认
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import { updateAgenda } from '@/api/meeting'

export default {
  name: 'AgendaEdit',
  props: {
    showAModal: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data () {
    return {
      /* 控制模态框显示状态 */
      visible: false,
      /* 可选议程列表 */
      agenda: [],
      /* 已选择议程列表 */
      selected: [],
      /* 等待服务器响应 */
      loading: false,
      /* 议程编辑表格属性 */
      columns: [
        {
          key: 'index',
          scopedSlots: { customRender: 'index' }
        },
        {
          dataIndex: 'name',
          key: 'name'
        },
        {
          key: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {
    /* 已选议程 */
    allProgress () {
      return this.$store.state.meeting
        .curMeeting.allProgress || []
    },
    /* 当前议程序号，比数组下标大一 */
    curAgendaIndex () {
      const curIndex = this.$store.state.meeting
        .curMeeting.currentProgress.index
      const index = parseInt(curIndex) || 0
      return index
    },
    /* 会议是否结束 */
    over () {
      return this.curAgendaIndex === this.allProgress.length
    },
    /** 当前会议ID */
    curMeetingId () {
      return this.$store.state.meeting.curMeeting.id
    }
  },
  created () {
    this.showAgendaModal()
  },
  methods: {
    /**
     * 议程上移
     */
    moveUp (text, record, index) {
      const selected = [ ...this.selected ]
      const temp = selected[index]
      selected[index] = selected[index - 1]
      selected[index - 1] = temp
      this.selected = selected
    },
    /**
     * 议程下移动
     */
    moveDown (text, record, index) {
      const selected = [ ...this.selected ]
      const temp = selected[index]
      selected[index] = selected[index + 1]
      selected[index + 1] = temp
      this.selected = selected
    },
    /**
     * 增加议程
     */
    addAgenda (record) {
      const selected = [ ...this.selected ]
      const newRecord = { ...record }
      selected.splice(selected.length - 1, 0, newRecord)
      this.selected = selected
    },
    /**
     * 删除已选议程
     */
    removeAgenda (text, record, index) {
      this.$delete(this.selected, index)
    },
    /**
     * 取消议程编辑
     */
    handleCancel () {
      this.closeAgendaEdit()
    },
    /**
     * 确定修改议程
     */
    handleConfirm () {
      this.loading = true
      const allProgress = this.selected.map(item => {
        return item.name
      }).join()
      updateAgenda(this.curMeetingId, allProgress).then(res => {
        if (res.status === 200 && res.rel) {
          this.$message.success('议程列表更新成功！')
          // 关闭弹窗
          this.closeAgendaEdit()
        } else {
          this.$message.warning('操作失败，请稍后再试！')
        }
      }).catch(() => {
        this.$message.warning('操作失败，请稍后再试！')
      }).finally(() => {
        this.loading = false
      })
    },
    closeAgendaEdit () {
      this.$emit('update:showAModal', false)
    },
    showAgendaModal () {
      const { allProgress } = this
      const len = allProgress.length
      this.agenda = allProgress.slice(1, len - 1)
      this.selected = this.allProgress
    },
    // **********编辑标签************
    showInput () {
      this.inputVisible = true
      this.$nextTick(function () {
        this.$refs.input.focus()
      })
    },
    handleInputChange (e) {
      // 不允许输入英文逗号
      if (e.target.value.includes(',')) {
        return false
      }
      this.inputValue = e.target.value
    },
    handleInputConfirm () {
      const inputValue = this.inputValue
      let tags = this.agenda
      if (inputValue && !tags.some(i => i.name === inputValue)) {
        tags = [...tags, { name: inputValue }]
      }
      Object.assign(this, {
        agenda: tags,
        inputVisible: false,
        inputValue: ''
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .agenda {
    margin-bottom: 8px;
  }
  .over-tip {
    text-align: center;
    padding: 24px;
  }
</style>
