<template>
  <div class="meeting-conferee">
    <div class="search-box">
      <a-input-search
        placeholder="请输入您要搜索的人员名称"
        @search="onSearch"
        v-model="searchVal"
      />
      <!-- <a-button
        style="margin-left:10px"
        type="primary"
        :disabled="!EDIT_USER"
        :title="EDIT_USER?'':'无权限'"
        @click="edit"
      >编辑成员</a-button> -->
    </div>
    <div class="meeting-member-list">
      <a-table
        size="small"
        :columns="columns"
        :loading="loading"
        :dataSource="data"
        :pagination="false"
        :locale="{emptyText:'暂无用户信息'}"
        :scroll="{x:460,y: tableHeight}"
        :rowKey="record => record.userId"
      >
        <a-select
          :defaultValue="record.userRoleCode"
          slot="roleList"
          slot-scope="text,record"
          style="width: 85px"
          @change="(value)=>{handleChange(value,record)}"
          :options="options"
          :disabled="!EDIT_USER_ROLE"
          title="123"
        >
        </a-select>
        <a-badge :status="text==='1'?'success':'error'" :text="text==='1'?'在线':'离线'" slot="stateList" slot-scope="text"/>
        <a-icon slot="talkStateList" type="sound" :theme="text==='1'?'twoTone':'outlined'" slot-scope="text"/>
        <span slot="pathName" slot-scope="text">{{ getShortName(text) }}</span>
        <span slot="icon" slot-scope="text,record">
          <a-avatar
            :src="getAvartarSrc(record.userImg)"
            shape="square"
            :class="[
              'meeting-member-avatar',
              getOnlineStatus(record.userId) ? 'on-line-tag' : ''
            ]"></a-avatar>
        </span>
      </a-table>
    </div>
    <a-modal
      title="编辑参会人员"
      :visible="visible"
      @ok="buttonOk"
      @cancel="handleCancel"
      width="720px"
      destroyOnClose
      :maskClosable="false"
      :confirmLoading="confirmLoading"
    >
      <user-transfer ref="transfer" :listStyle="listStyle" @ok="handleOk"/>
    </a-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserTransfer from '@/components/admin/UserTransfer'
import {
  updateUserRoleList,
  getRoleCodeList
} from '@/api/meeting'
import { sendSysMsg } from '../meeting/modules/constance'
import { FILE_SERVER_IP } from '@/utils/constants'

const columns = [{
  title: '',
  dataIndex: 'userImg',
  fixed: 'left',
  width: '50px',
  scopedSlots: { customRender: 'icon' }
}, {
  title: '人员',
  dataIndex: 'userName',
  fixed: 'left',
  width: '80px'
}, {
  title: '研究室',
  dataIndex: 'pathName',
  scopedSlots: { customRender: 'pathName' },
  width: '150px'
}, {
  title: '角色',
  dataIndex: 'userRoleName',
  width: '100px',
  scopedSlots: { customRender: 'roleList' },
  align: 'center'
},
{
  title: '发言状态',
  dataIndex: 'canMsg',
  width: '80px',
  scopedSlots: { customRender: 'talkStateList' },
  align: 'center'
}
]

export default {
  name: 'MConferee',
  components: {
    UserTransfer
  },
  props: {
    listStyle: {
      type: Object,
      required: false,
      default: () => ({
        width: '192px',
        height: '400px'
      })
    }
  },
  data () {
    return {
      searchVal: '',
      // 服务端返回的数据
      // dataSource: [],
      // 列表中显示的数据
      data: [],
      /* 加载文件等待 */
      loading: false,
      // Modal框确定按钮 loading
      confirmLoading: false,
      // 定义table表头
      columns,
      // 编辑人员界面可视化
      visible: false,
      // 存放Transfer右侧的数据
      userList: [],
      // 选择器选项会议角色列表
      options: [ { value: '', title: '' } ],
      // 选择器默认值
      selectDefaultValue: '主持人',
      tableHeight: 500
    }
  },
  computed: {
    ...mapGetters([
      'userSecretLevel',
      'getMAuth',
      'nickname',
      'getOnlineStatus'
    ]),
    /* 当前会议的id */
    curMeeting () {
      return this.$store.state.meeting.curMeeting
    },
    /* 当前会议用户列表 */
    dataSource () {
      return this.curMeeting.meetMemberList || []
    },
    EDIT_USER_ROLE () {
      return this.getMAuth('EDIT_USER_ROLE')
    },
    EDIT_USER () {
      return this.getMAuth('EDIT_USER')
    }
  },
  created () {
    console.log('圣诞节', this.dataSource)
    this.getRoleList()
    this.data = this.dataSource
    this.$nextTick(() => {
      this.setListHeight()
    })
    // getMeetingMember(this.curMeeting.id).then(res => {
    //   console.log('圣诞节', res.result.meetMemberList)
    //   this.dataSource = res.result.meetMemberList
    //   this.data = this.dataSource
    // })
  },
  methods: {
    /**
     * 设置表格高度
     */
    setListHeight () {
      const drawer = document.querySelector('.ant-drawer-wrapper-body')
      const listHeight = drawer && (drawer.clientHeight - 210)
      this.tableHeight = listHeight
    },
    /**
     * 获取服务端会议角色列表数据
     */
    getRoleList () {
      getRoleCodeList().then(res => {
        this.loading = true
        this.selectDefaultValue = this.options.title
        let arr = []
        arr = Array.from(res.result.data, (item) => ({
          value: item.code,
          title: item.name
        }))
        this.options = arr
      }).finally(() => {
        this.loading = false
      })
    },
    onSearch () {
      if (this.searchVal) {
        this.data = this.dataSource.filter(item => item.userName.indexOf(this.searchVal) > -1 ||
        item.userOrgName.indexOf(this.searchVal) > -1 ||
        item.userRoleName.indexOf(this.searchVal) > -1 ||
        item.online.indexOf(this.searchVal) > -1)
      } else {
        this.data = this.dataSource
      }
    },
    //
    edit () {
      this.visible = true
      const {
        userImg,
        userId,
        userName,
        userOrgCode,
        userNo,
        userLevel
      } = this.dataSource
      const targetData = [{
        avatar: userImg,
        delete: '0',
        id: userId,
        key: userId,
        name: userName,
        orgCode: userOrgCode,
        pId: userNo,
        secretLevel: userLevel,
        title: userName
      }]
      this.$nextTick(() => {
        this.$refs.transfer.beginChooseUser(targetData)
        this.userList = targetData
      })
    },
    // 选择器改变角色
    handleChange (value, record) {
      const { userId, canMsg, userLevel, userName } = record
      const data = {
        meetingId: this.curMeeting.id,
        userId,
        canMsg,
        userLevel,
        roleCode: value
      }
      updateUserRoleList(data).then(res => {
        if (res.status === 200 && res.rel) {
          this.$notification['success']({
            message: '更改成员角色成功',
            duration: 2
          })
          // 发送系统消息
          const roleName = this.options.find(i => i.value === value).title
          const msg = `${this.nickname} 将 ${userName} 的角色调整为 ${roleName}`
          sendSysMsg(this, msg)
        } else {
          this.$notification['error']({
            message: '更改成员角色失败',
            duration: 4
          })
        }
      })
    },
    handleCancel (e) {
      this.visible = false
    },
    // 穿梭框中的右移按钮方法
    handleOk (userArr) {
      this.userList = userArr
    },
    // modal框中的确定按钮方法
    buttonOk (e) {
      this.confirmLoading = true
      this.visible = false
    },
    /**
     * 截取组织名
     */
    getShortName (value) {
      let name = ''
      if (value) {
        const arr = value.split('/').filter(x => x)
        name = arr.length ? arr.reduce((a, c) => c + '/' + a) : ''
      }
      return name
    },
    /**
     * 获取头像地址
     */
    getAvartarSrc (src) {
      return FILE_SERVER_IP + src
    }
  }
}
</script>

<style lang="less" scoped>
.search-box {
  display: flex;
  margin-bottom: 16px;
  .edit-meeting-member-btn {
    margin-left: 10px;
  }
}
</style>
