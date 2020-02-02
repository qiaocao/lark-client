<template>
  <div>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" :form="form">
          <a-row :gutter="32" type="flex">
            <a-col :span="6">
              <a-form-item label="发送人姓名">
                <a-input v-model="queryParam.senderName" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="接收方">
                <a-input v-model="queryParam.receiverName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="消息密级">
                <a-select v-model="queryParam.messageLevel">
                  <a-select-option value="30">非密</a-select-option>
                  <a-select-option value="40">秘密</a-select-option>
                  <a-select-option value="60">机密</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="search">查询</a-button>
                <a-button style="margin-left: 8px" @click="resetQueryParams">重置</a-button>
              </span>
            </a-col>
          </a-row>
          <!-- <a-row :gutter="32" type="flex">
            <a-col :span="6">
              <a-form-item label="发送时间">
                <a-range-picker @change="onChange" v-decorator="['timerange']"/>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="消息内容">
                <a-input v-model="queryParam.messageContent"/>
              </a-form-item>
            </a-col>
          </a-row>-->
        </a-form>
      </div>
      <s-table
        :scroll="true"
        ref="stable"
        size="default"
        :columns="columns"
        :data="loadData"
        :alert="false"
      >
        <!-- 消息 -->
        <span slot="messageContent" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>
      </s-table>
    </a-card>
  </div>
</template>
<script>
import { STable, Ellipsis } from '@/components'
import { queryAllMessagePrivate } from '@/api/admin'
export default {
  name: 'PrivateMsg',
  components: {
    STable,
    Ellipsis
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
          title: '日志id',
          dataIndex: 'id'
        },
        {
          title: '发送者',
          dataIndex: 'senderName'
        },
        {
          title: '操作者身份证号',
          dataIndex: 'senderSn'
        },
        {
          title: '消息',
          dataIndex: 'messageContent',
          scopedSlots: { customRender: 'messageContent' }
        },
        {
          title: '消息密级',
          dataIndex: 'messageLevel',
          key: 'messageLevel',
          customRender: function (messageLevel) {
            const config = {
              '30': '非密',
              '40': '秘密',
              '60': '机密'
            }
            return config[messageLevel]
          }
        },
        {
          title: '操作对象id',
          dataIndex: 'senderId'
        },
        {
          title: '接收方',
          dataIndex: 'receiverName'
        },
        {
          title: '接收方id',
          dataIndex: 'receiverId'
        },
        {
          title: '时间',
          dataIndex: 'sendTime'
        },
        {
          title: 'ip',
          dataIndex: 'ip'
        },
        {
          title: '状态',
          dataIndex: 'status'
        }

        // {
        //   title: '发送人密级',
        //   dataIndex: 'senderLevel',
        //   key: 'senderLevel',
        //   customRender: function (senderLevel) {
        //     const config = {
        //       '30': '非密',
        //       '40': '一般',
        //       '60': '重要',
        //       '80': '核心'
        //     }
        //     return config[senderLevel]
        //   }
        // },
        // {
        //   title: '发送时间',
        //   dataIndex: 'sendTime'
        // },
        // {
        //   title: '接收方',
        //   dataIndex: 'receiverName'
        // },
        // {
        //   title: '消息密级',
        //   dataIndex: 'messageLevel',
        //   key: 'messageLevel',
        //   customRender: function(messageLevel) {
        //     const config = {
        //       '30': '非密',
        //       '40': '秘密',
        //       '60': '机密'
        //     };
        //     return config[messageLevel];
        //   }
        // },
        // {
        //   title: '消息内容',
        //   dataIndex: 'messageContent'
        // }
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
        return queryAllMessagePrivate(parameter).then(res => {
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
        this.queryParam.sendTime = this.dataStr.join()
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
