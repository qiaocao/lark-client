<template>
  <div>
    <a-row :gutter="8" v-if="$route.name=='UserList'">
      <a-col :span="5">
        <a-card :bordered="true" title="组织树">
          <a-tree
            ref="orgtree"
            :treeData="orgTree"
            @select="handleClick"
          />
        </a-card>
      </a-col>
      <a-col :span="19">
        <a-card :bordered="true" title="人员信息列表">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="8">
                <a-col :md="7" :sm="24">
                  <a-form-item label="姓名">
                    <a-input v-model="queryParam.name"/>
                  </a-form-item>
                </a-col>
                <a-col :md="7" :sm="24">
                  <a-form-item label="密级">
                    <a-select placeholder="请选择" v-model="queryParam.secretLevel">
                      <a-select-option value="30">非密</a-select-option>
                      <a-select-option value="40">一般一类</a-select-option>
                      <a-select-option value="50">一般二类</a-select-option>
                      <a-select-option value="60">重要一类</a-select-option>
                      <a-select-option value="70">重要二类</a-select-option>
                      <a-select-option value="80">核心一类</a-select-option>
                      <a-select-option value="90">核心二类</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="10" :sm="24">
                  <span class="table-page-search-submitButtons">
                    <a-button type="primary" @click="searchUser">查询</a-button>
                    <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
                    <a-button style="margin-left: 30px" type="primary" @click="openEditModal('', '1')" v-action:add>新增用户</a-button>
                  </span>
                </a-col>
              </a-row>
              <a-row>
                <s-table
                  ref="stable"
                  size="default"
                  :columns="columns"
                  :data="loadData"
                  :alert="false"
                >
                  <span slot="action" slot-scope="text, record">
                    <template>
                      <a @click="openEditModal(record,'2')" v-action:update>编辑</a>
                      <a-divider type="vertical"/>
                    </template>
                    <template>
                      <a @click="handleDel(record)" v-action:delete>删除</a>
                    </template>
                  </span>
                </s-table>
              </a-row>
            </a-form>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <router-view/>
  </div>
</template>
<script>
import STable from '@/components/table/'
import { getUserPage, deluser, getOrgTree } from '@/api/admin'
export default {
  name: 'UserList',
  components: {
    STable
  },
  data () {
    return {
      expandedKeys: ['key-01'],
      // 查询参数
      queryParam: {},
      // 响应式布局
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16, offset: 1 }
      },
      // 表头
      columns: [
        {
          title: '出入证号',
          dataIndex: 'empCode'
        },
        {
          title: '姓名',
          dataIndex: 'name'
        },
        {
          title: '密级',
          dataIndex: 'secretLevel',
          key: 'secretLevel',
          customRender: function (secretLevel) {
            const config = {
              '30': '非密',
              '40': '一般一类',
              '50': '一般二类',
              '60': '重要一类',
              '70': '重要二类',
              '80': '核心一类',
              '90': '核心二类'
            }
            return config[secretLevel]
          }
        },
        {
          title: '组织机构',
          dataIndex: 'orgName'
        },
        {
          title: '身份证号',
          dataIndex: 'pid'
        },
        {
          title: '操作',
          width: '120px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getUserPage(Object.assign(parameter, this.queryParam)).then(res => {
          return res.result
        })
      },
      orgTree: []
      // OrgTreeSelects: []
    }
  },
  created () {
    // 获取树形组织信息
    getOrgTree({ 'parentTreeId': 'root' }).then(res => {
      this.orgTree = this.handleVal(res.result.data)
    })
  },
  methods: {
    /**
     * 处理后台返回值 替换名字 id=>key label=>title
     */
    handleVal (value) {
      let str = JSON.stringify(value)
      str = str.replace(/id/g, 'key').replace(/label/g, 'title')
      return JSON.parse(str)
    },
    /**
     * 点击树节点刷新人员信息
     */
    handleClick (item, e) {
      this.queryParam = {
        'orgCode': item[0]
      }
      this.$refs.stable.refresh(true)
    },
    /**
     * 查询用户信息
     */
    searchUser () {
      this.$refs.stable.loadData({}, this.queryParam, {})
    },
    /**
     * 打开编辑用户信息
     */
    openEditModal (item, editType) {
      this.$router.push({ path: '/syslist/user-list/user-edit', query: { item, editType } })
    },
    /**
     * 单条删除用户信息
     */
    handleDel (item) {
      const _this = this
      this.$confirm({
        title: '警告',
        content: `确认要删除 ${item.name} 的信息吗?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          _this.spinning = true
          // 在这里调用删除接口
          return deluser(
            { 'id': item.id }
          ).then(
            res => {
              if (res.status === 200) {
                _this.$refs.stable.refresh(true)
                _this.$notification['success']({
                  message: '删除成功',
                  duration: 2
                })
              } else {
                _this.$notification['error']({
                  message: res.message,
                  duration: 4
                })
              }
            }
          ).catch(() =>
            _this.$notification['error']({
              message: '出现异常，请联系系统管理员',
              duration: 4
            })
          ).finally(() => {
            _this.spinning = false
          })
        },
        onCancel: () => {
          _this.$notification['info']({
            message: '取消删除操作',
            duration: 4
          })
        }
      })
    }
  }
}
</script>
