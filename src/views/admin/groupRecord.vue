
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
        :scroll="{x: true}"
      >
      </s-table>
    </a-card>
  </div>
</template>
<script>
import { STable } from '@/components'
import { queryGroupStatus } from '@/api/admin'

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
          title: 'id',
          dataIndex: 'id'
        },
        {
          title: '接收人id',
          dataIndex: 'groupId'
        },
        {
          title: '接收人',
          dataIndex: 'groupName'
        },
        {
          title: '上传人id',
          dataIndex: 'operator'
        },
        {
          title: '上传人姓名',
          dataIndex: 'operatorName'
        },
        {
          title: '操作时间',
          dataIndex: 'operateTime'
        },
        {
          title: '描述',
          dataIndex: 'describe'
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
        return queryGroupStatus({ ...parameter, all: 1 }).then(res => {
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
