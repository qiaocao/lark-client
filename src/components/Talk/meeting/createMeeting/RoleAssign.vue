<template>
  <div class="meeting-role-assign">
    <a-form style="max-width: 650px; margin: 40px auto 0;">
      <a-alert :closable="true" message="请为参会人员分配角色" />
      <!-- 设置创建人角色 -->
      <a-table
        :columns="columns"
        :dataSource="selfInfo"
        size="small"
        :pagination="false"
        :showHeader="false"
        :scroll="{x:600}"
        rowKey="id"
      >
        <a-select
          slot="roleCode"
          slot-scope="text"
          size="small"
          placeholder="请选择角色"
          style="min-width: 100px"
          :defaultValue="text"
          @change="setSelfRole"
        >
          <a-select-option v-for="i in roleList" :key="i.code">
            {{ i.name }}
          </a-select-option>
        </a-select>
      </a-table>
      <!-- 设置其他参会人员角色 -->
      <a-table
        :columns="columns"
        :dataSource="list"
        size="small"
        :pagination="false"
        :showHeader="false"
        :scroll="{ x: 600, y: 400 }"
        rowKey="id"
      >
        <!-- 角色选择 -->
        <a-select
          slot="roleCode"
          slot-scope="text, record, index"
          size="small"
          placeholder="请选择角色"
          style="min-width: 100px"
          :defaultValue="text"
          @change="newVal => handleChange(newVal, index)"
        >
          <a-select-option v-for="i in roleList" :key="i.code">
            {{ i.name }}
          </a-select-option>
        </a-select>
        <!-- 移除会议成员 -->
        <span slot="action" slot-scope="text, record, index">
          <a @click="handelRemove(text, record, index)">移除</a>
        </span>
      </a-table>

      <a-form-item :wrapperCol="{span: 14, offset: 10}" style="margin-top: 8px;">
        <a-button @click="prevStep">上一步</a-button>
        <a-button style="margin-left: 8px" type="primary" @click="nextStep">下一步</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getRoleCodeList } from '@/api/meeting'

export default {
  name: 'RoleAssign',
  props: {
    info: {
      type: Object,
      default: () => ({}),
      required: true
    }
    // roleList: {
    //   type: Array,
    //   default: () => ([]),
    //   required: true
    // }
  },
  data () {
    return {
      // 可选角色列表
      roleList: [],
      columns: [
        {
          dataIndex: 'name',
          key: 'name',
          width: 200
        }, {
          title: 'roleCode',
          dataIndex: 'roleCode',
          key: 'roleCode',
          width: 240,
          scopedSlots: { customRender: 'roleCode' }
        }, {
          title: 'Action',
          key: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      /* 已选择的用户列表 */
      list: [],
      /* 创建人信息 */
      selfInfo: [],
      /* 创建人在会议中的角色 主持人 */
      creatorRole: 4004
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created () {
    this.setRoleCodeList()
    this.initUserList()
    this.initSelfInfo()
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
     * 改变角色时处理数据
     */
    handleChange (newVal, index) {
      const newList = [ ...this.list ]
      newList[index].roleCode = newVal
      this.list = newList
    },
    /**
     * 移除参会人员
     */
    handelRemove (text, record, index) {
      const newList = [ ...this.list ]
      this.$delete(newList, index)
      this.list = newList
    },
    /**
     * 设置成员角色初始值
     */
    initUserList () {
      let list = [ ...(this.info.userListRaw || []) ]
      list = list.map(i => {
        if (i.roleCode) {
          return i
        } else {
          // 设置默认值
          i.roleCode = this.roleList[0] || 4005
          return i
        }
      })
      this.list = list
    },
    /**
     * 设置创建人信息
     */
    initSelfInfo () {
      this.$set(this.selfInfo, 0, { ...this.userInfo })
      const { creatorRole } = this.info
      if (creatorRole) {
        this.selfInfo[0].roleCode = creatorRole
        this.creatorRole = creatorRole
      } else {
        this.selfInfo[0].roleCode = this.roleList[0] || 4004
      }
    },
    /**
     * 设置创建人角色
     */
    setSelfRole (val) {
      this.creatorRole = val
    },
    /**
     * 下一步
     */
    nextStep () {
      const list = [ ...this.list ]
      // 必须要有会务
      if (this.creatorRole !== 4004 && list.filter(i => i.roleCode === 4004).length < 1) {
        this.$notification.warn({ message: '请至少将一名参会人员设为会务！' })
        return
      }
      if (list.every(i => typeof i.roleCode !== 'undefined')) {
        this.$emit('nextStep',
          {
            userList: this.list,
            creatorRole: this.creatorRole
          }
        )
      } else {
        this.$notification.warn({ message: '成员角色不能为空！' })
      }
    },
    /**
     * 上一步
     */
    prevStep () {
      this.$emit('prevStep')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
