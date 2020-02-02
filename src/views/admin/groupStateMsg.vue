<template>
  <div>
    <a-card>
      <s-table
        ref="stable"
        rowKey="order"
        size="default"
        :columns="columns"
        :data="loadData"
        :alert="false"
        :scroll="{x: 1500 }"
      >
        <div slot="expandedRowRender" slot-scope="rowdata">
          <a-table
            size="default"
            :columns="UserColumns"
            :dataSource="rowdata.memberList"
            :alert="false"
          />
          <!-- <dl v-for="item in rowdata.memberList">
              <dd>{{item.userName}}</dd>
              <dd>{{item.userNo}}</dd>
          </dl>-->
        </div>
      </s-table>
    </a-card>
  </div>
</template>
<script>
import { STable } from '@/components'
import { getApproveLogInf } from '@/api/admin'
export default {
  name: 'PrivateMsg',
  components: {
    STable
  },
  data () {
    return {
      queryParam: {},
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: 'order'
        },
        {
          title: '操作人id',
          dataIndex: 'operator'
        },
        {
          title: '操作人身份证',
          dataIndex: 'operatorNo'
        },
        {
          title: '动作',
          dataIndex: 'operateType',
          key: 'operateType',
          // 300新建群，301新增成员，302删除成员，303群解散，304上传群文件,305审批群 后续跟进需要补充
          customRender: function (operateType) {
            const config = {
              '300': '新建群',
              '301': '新增成员',
              '302': '删除成员',
              '303': '群解散',
              '304': '上传群文件',
              '305': '审批群'
            }
            return config[operateType]
          }
        },
        {
          title: '操作时间',
          dataIndex: 'operateTime'
        },
        {
          title: '群id',
          dataIndex: 'groupId'
        },
        {
          title: '群名称',
          dataIndex: 'groupName'
        },
        {
          title: '群密级',
          dataIndex: 'groupLevel',
          key: 'groupLevel',
          customRender: function (groupLevel) {
            const config = {
              '30': '非密',
              '40': '秘密',
              '60': '机密'
            }
            return config[groupLevel]
          }
        },
        {
          title: '群项目',
          dataIndex: 'groupPro'
        },
        {
          title: '参团范围',
          dataIndex: 'groupScope'
        },
        {
          title: '群描述',
          dataIndex: 'groupDes'
        },
        {
          title: '群类型',
          dataIndex: 'groupType',
          key: 'groupType',
          customRender: function (groupType) {
            const config = {
              '0': '普通',
              '1': '跨科室',
              '2': '跨厂所'
            }
            return config[groupType]
          }
        },
        {
          title: '审批人id',
          dataIndex: 'approve'
        },

        {
          title: '审批人姓名',
          dataIndex: 'approveName'
        },
        {
          title: '审批时间',
          dataIndex: 'approveTime'
        },
        {
          title: '审批结论',
          dataIndex: 'approveRes',
          key: 'approveRes',
          customRender: function (approveRes) {
            const config = {
              '1': '通过',
              '2': '不通过'
            }
            return config[approveRes]
          }
        },
        {
          title: '审批人ip',
          dataIndex: 'ip'
        },
        {
          title: '审批是否成功',
          dataIndex: 'status',
          key: 'status',
          customRender: function (status) {
            const config = {
              '0': '否',
              '1': '是'
            }
            return config[status]
          }
        },
        {
          title: '操作人姓名',
          dataIndex: 'operatorName'
        }
      ],
      UserColumns: [
        {
          title: '姓名',
          dataIndex: 'userName'
        },
        {
          title: '身份证号',
          dataIndex: 'userNo'
        },
        {
          title: '用户id',
          dataIndex: 'userId'
        }
      ],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        console.log(parameter)
        // {
        //   groupName: "测试的订单",
        //   operatorName: '',
        //   operateTimeBegin: "2019-09-13",
        //   operateTimeEnd: "2019-09-13",
        //   approveName: "张三啦"
        // }
        return getApproveLogInf(parameter).then(res => {
          return Object.assign({}, res.result, {
            data: res.result.data.map((item, index) => {
              return {
                ...item,
                order: index * 1 + 1
              }
            })
          })
        })
      },
      loading: false,
      dataStr: '',
      form: this.$form.createForm(this)
    }
  },
  methods: {
    /**
     * 搜索
     */
    search () {
      if (this.dataStr !== '') {
        this.queryParam.sendTime = this.dataStr.join(',')
      }
      const pageInfo = {
        pageNo: 1,
        pageSize: 10
      }
      this.queryParam = Object.assign(this.queryParam, pageInfo)
      this.$refs.stable.loadData({}, this.queryParam, {})
    },
    /**
     * 查询项清空
     */
    resetQueryParams () {
      this.queryParam = {}
      this.dataStr = ''
      this.form.setFieldsValue({ timerange: undefined })
    },
    onChange (date, datestr) {
      this.dataStr = datestr
    }
  }
}
</script>
