<!--
组件使用指南
组件功能：一个带有Transfer穿梭框，Transfer左侧组织树，点击组织节点，可根据节点查询该组织下人员名单
        父组件可传已选择的人员信息 类型为人员信息的JSON数组 参数非必填

使用方法：组件引入后，使用如下方法
        <user-transfer ref="transfer" @ok="handleSaveOk"/>
        this.$refs.transfer.beginChooseUser(传到子组件的参数，查询项)

        目前只支持两个查询项：密级和不包含身份证号
        const test = "{'secretLevels':'40,50','exPid':'110101******38688'}"
        eval("("+test+")")

        可自定义子组件的确认方法(change事件)
        返回值结构同样为人员信息的JSON数组

        支持更改穿梭框尺寸 listStyle 默认 430px 430px
-->
<template>
  <a-row :gutter="8">
    <a-col :span="7">
      <a-card
        :headStyle="headStyle"
        :bodyStyle="bodyStyle"
        :tabList="tabList"
        :activeTabKey="key"
        @tabChange="key => onTabChange(key, 'key')"
      >
        <div style="overflow:scroll;height:344px" v-if="key === 'tab1'">
          <a-tree :treeData="orgTree" @select="handleClick"/>
        </div>
        <div style="overflow:scroll;height:344px" v-if="key === 'tab2'">
          <a-tree :treeData="groupOrgTree" @select="handleClick"/>
        </div>
      </a-card>
    </a-col>
    <a-col :span="17">
      <a-spin :spinning="tLoading">
        <a-transfer
          :titles="['可选择人员', '已选择人员']"
          :dataSource="ds"
          showSearch
          @search="usersFilter"
          :listStyle="listStyle"
          :targetKeys="targetKeys"
          @change="handleChange"
          :render="renderItem"
          :operations="['添加','移除']"
        ></a-transfer>
      </a-spin>
    </a-col>
  </a-row>
</template>
<script>
import { mapGetters } from 'vuex'
import {
  getUserList,
  getGroupOrgTree,
  getGroupUserList,
  getOrgTreeComponent,
  getUserBypositionAndSecret
} from '@/api/admin'
export default {
  name: 'UserTransfer',
  data () {
    return {
      groupMemberList: [],
      bodyStyle: { height: '351px' },
      headStyle: { border: '20px' },
      orgTree: [],
      groupOrgTree: [],
      // key userid value userinfo
      // 用于存储人员信息
      userMap: new Map(),
      // 页2 transfer左侧绑定数据源
      ds: [],
      // 页3 transfer右侧绑定数据源
      targetKeys: [],
      // props: 'props',
      tLoading: false,
      queryparamter: {},
      userfilter: {},
      tabList: [
        {
          key: 'tab1',
          tab: '组织'
        },
        {
          key: 'tab2',
          tab: '团队'
        }
      ],
      key: 'tab1'
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'userPId'])
  },
  created () {
    const newTab = this.tabList.slice(0, this.tabNum)
    this.tabList = newTab
    // 获取树形组织信息
    getOrgTreeComponent({
      level: this.level,
      userOrgCode: this.userInfo.orgCode
    }).then(res => {
      this.orgTree = this.handleVal(res.result.data)
    })
    // 获取团队树形组织信息
    getGroupOrgTree({ parentTreeId: 'root', pId: this.userPId }).then(res => {
      this.groupOrgTree = this.handleProjectVal(res.result.data)
    })
  },
  props: {
    tabNum: {
      type: String,
      default: '2',
      required: false
    },
    listStyle: {
      type: Object,
      required: false,
      default: () => ({
        width: '400px',
        height: '400px'
      })
    },
    /**
     * 用户类型
     * 包括user和approval
     */
    type: {
      type: String,
      default: 'user',
      required: false
    },
    /** 组织层级 0（部门内） 1 2（跨单位） */
    level: {
      type: Number,
      default: 2,
      required: false
    }
  },
  methods: {
    /**
     * 打开人员选择器
     * userArr 非必填 transfer组件中已选中的人员
     *         类型：数组 [{人员信息}]
     * filter 非必填 人员信息过滤
     * 目前只支持两个查询项：密级和不包含人员身份证号 {'secretLevels':'40,50','exPid':'110101******38688'}
     * jihainan新增：
     *    群组类型（创建群组时使用）grouptype: 0(0科室内，1跨科室，2跨厂所)
     *    当前用户所在组织 userOrgCode
     */
    beginChooseUser: function (userArr, filter) {
      this.targetKeys = []
      this.ds = []
      this.userMap = new Map()
      this.userfilter = filter
      if (userArr && userArr.length) {
        userArr.forEach(item => {
          this.targetKeys.push(item.id)
          item.key = item.id
          item.title = item.name
          this.ds.push(item)
          this.userMap.set(item.id, item)
        })
      }
    },
    onTabChange (key, type) {
      this[type] = key
      this.ds = []
      this.targetKeys = []
    },
    /**
     * 点击组织机构树，获取该组织下人员信息
     */
    handleClick (item, e) {
      this.tLoading = true
      // 限制点击根节点触发后台请求操作
      if (item.length > 0 && item[0] === 'key-01') {
        return
      }
      this.queryparamter = { orgCode: item[0] }
      this.tLoading = true
      if (this.queryparamter.orgCode === undefined) {
        this.tLoading = false
      } else {
        this.type === 'user' ? this.getUsers() : this.getApprovers()
      }
    },
    /**
     * 根据人员姓名检索人员信息
     * 如需其他检索项，可在parameter中添加项目
     * TODO 检索项添加时，这里需要调整
     */
    usersFilter (t, searchvalue) {
      if (t === 'left') {
        this.ds.filter(item => {
          return item.title.indexOf(searchvalue) > -1
        })
      } else {
        // 右侧数据只能绑定key值，需要将信息补全后进行过滤
        this.targetKeys.filter(item => {
          const userinfo = this.userMap.get(item)
          if (userinfo.title.indexOf(searchvalue) > -1) {
            return true
          }
        })
      }
    },
    /**
     * 请求后台获取人员信息
     */
    getUsers () {
      // 添加筛选项
      if (this.userfilter) {
        this.queryparamter.secretLevels = this.userfilter.secretLevels || ''
        this.queryparamter.pid = this.userfilter.exPid || ''
      } else {
        this.queryparamter.secretLevels = ''
        this.queryparamter.pid = ''
      }
      if (this.key === 'tab1') {
        getUserList(this.queryparamter)
          .then(res => {
            const members = res.result.data
            // 每次刷新更改绑定数据源时，需要合并右侧已选中的集合
            this.joinDs(this.targetKeys, members)
            this.tLoading = false
          })
          .catch(() =>
            this.$notification['error']({
              message: '出现异常，请联系系统管理员',
              duration: 4
            })
          )
      } else {
        getGroupUserList({ unitID: this.queryparamter.orgCode, secretLevels: this.queryparamter.secretLevels, pId: this.queryparamter.pid }).then(res => {
          this.groupMemberList = JSON.stringify(res.result.data).replace(/null/g, '"未知"')
          const member = JSON.parse(this.groupMemberList)
          this.joinDs(this.targetKeys, member)
          this.tLoading = false
        })
      }
    },
    /**
     * 获取审批人信息
     */
    getApprovers () {
      // 设置筛选条件
      if (this.userfilter) {
        this.queryparamter.id = this.userfilter.position || 0
        this.queryparamter.secretLevel = this.userfilter.secretLevel || ''
      }
      getUserBypositionAndSecret(this.queryparamter).then(res => {
        const members = res.result.data
        this.joinDs(this.targetKeys, members)
        this.tLoading = false
      }).catch(() => {
        this.$notification['error']({
          message: '出现异常，请联系系统管理员',
          duration: 4
        })
      })
    },
    /**
     * 合并数据源
     * 同时给新数据源指定key和title值
     */
    joinDs (oldds, newds) {
      newds.forEach(item => {
        item.key = item.id
        item.title = item.name
        this.userMap.set(item.id, item)
      })
      oldds.forEach(oldval => {
        let check = false
        check = newds.some(newval => {
          if (newval.id === oldval) {
            return true
          }
        })
        if (!check) {
          newds.push(this.userMap.get(oldval))
        }
      })
      this.ds = newds
    },
    /**
     * 点击新增/撤销
     */
    handleChange (targetKeys, direction, moveKeys) {
      this.targetKeys = targetKeys
      const userarr = []
      this.targetKeys.forEach(item => {
        userarr.push(this.userMap.get(item))
      })
      this.$emit('ok', userarr, this.targetKeys)
    },
    // 如需在人员信息上拼接其他人员信息 {item.title} - {item.orgname} - {item.secretLevel}
    renderItem (item) {
      if (this.key === 'tab1') {
        const name = this.getShortName(item.pathName || item.orgName)
        let customLabel = <span class="custom-item">{item.title}</span>
        if (name) {
          customLabel = <span class="custom-item">{item.title} - <span style="color: #9e9e9e">{name}</span></span>
        }
        return {
        // for displayed item
          label: customLabel,
          // for title and filter matching
          value: item.title + (name === undefined ? '' : name)
        }
      } else {
        let customLabel = <span class="custom-item">{item.title}</span>
        if (item.workPost) {
          customLabel = <span class="custom-item">{item.title} - <span style="color: #9e9e9e">{item.workPost}</span></span>
        }
        return {
        // for displayed item
          label: customLabel,
          // for title and filter matching
          value: item.title + item.workPost
        }
      }
    },
    /**
     * 处理后台返回值 替换名字 id=>key label=>title
     */
    handleVal (value) {
      let str = JSON.stringify(value)
      str = str.replace(/id/g, 'key').replace(/label/g, 'title')
      return JSON.parse(str)
    },
    handleProjectVal (value) {
      let str = JSON.stringify(value)
      str = str.replace(/id/g, 'key').replace(/label/g, 'title')
      return JSON.parse(str)
    },
    /**
     * 截取显示两个组织机构
     */
    getShortName (name) {
      if (name) {
        const namearr = name.split('/').slice(-3).filter(x => x)
        if (namearr.length !== 0) {
          return namearr.reduce((a, c) => c + '/' + a)
        } else {
          return ''
        }
        // return namearr.slice(-3).filter(x => x).reduce((a, c) => c + '/' + a)
      }
      return name
    }
  }
}
</script>
<style scoped>
.title {
  padding-bottom: auto;
  min-height: 32px;
}
</style>
