<template>
  <div>
    <a-card>
      <a-form layout="inline" :form="form">
        <a-row :gutter="32" type="flex">
          <a-col>
            <a-form-item label="接收人姓名">
              <a-input v-model="queryParam.reviserName" />
            </a-form-item>
            <a-form-item label="发送人姓名">
              <a-input v-model="queryParam.senderName" />
            </a-form-item>
            <!-- <a-form-item label="阅读时间">
              <a-input v-model="queryParam.readtime" />
            </a-form-item>-->
            <a-form-item>
              <a-button type="primary" @click="search">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParams">重置</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <s-table
        :scroll="{x: true}"
        ref="stable"
        size="default"
        :columns="columns"
        :data="loadData"
        :alert="false"
      ></s-table>
    </a-card>
  </div>
</template>
<script>
import { STable } from '@/components'
import { getAllMegRead } from '@/api/admin'
import moment from 'moment'
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
          title: '发送人id',
          dataIndex: 'sender'
        },
        {
          title: '发送人姓名',
          dataIndex: 'senderName'
        },
        {
          title: '发送人身份证',
          dataIndex: 'senderSN'
        },
        {
          title: '接收人',
          dataIndex: 'reviser'
        },
        {
          title: '接收人姓名',
          dataIndex: 'reviserName'
        },
        {
          title: '接收人身份证',
          dataIndex: 'reviserSN'
        },
        {
          title: '阅读时间',
          dataIndex: 'readtime',
          key: 'readtime',
          customRender: function (readtime) {
            return moment(readtime).format('YYYY-MM-DD HH:mm:ss')
          }
        },
        {
          title: '操作',
          dataIndex: 'total'
        },
        {
          title: '结果',
          dataIndex: 'result'
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
      form: this.$form.createForm(this),
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getAllMegRead(parameter).then(res => {
          return Object.assign({}, res.result, {
            data: res.result.data.map((item, index) => {
              return {
                ...item,
                order: index * 1 + 1,
                result: '成功',
                total: '阅读'
              }
            })
          })
        })
      },
      loading: false,
      dataStr: ''
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
