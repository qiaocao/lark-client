<template>
  <div>
    <a-table
      size="small"
      :columns="columns"
      :rowKey="record => record.id"
      :dataSource="fileList"
      :loading="loading"
      :pagination="false"
    >
    </a-table>
    <a-pagination simple class="pageStyle" :total="total" @change="handleTableChange"/>
  </div>
</template>
<script>
import { queryGroupRecord } from '@/api/talk.js'
import { mapGetters } from 'vuex'
export default {
  name: 'GroupRecordGrabble',
  components: {
  },
  data () {
    return {
      // 数据加载样式
      loading: false,
      fileList: [],
      // 初始信息
      total: 0,
      pageSize: 10,
      pageNo: 1,
      columns: [
        {
          title: '操作人',
          dataIndex: 'operatorName'
        },
        {
          title: '操作类型',
          dataIndex: 'operateType',
          key: 'operateType',
          customRender: function (operateType) {
            const config = {
              '300': '新建群',
              '301': '新增成员',
              '302': '删除成员',
              '303': '群解散',
              '304': '上传群文件',
              '305': '下载群文件'
            }
            return config[operateType]
          }
        },
        {
          title: '操作时间',
          dataIndex: 'operateTime'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['currentTalk'])
  },
  mounted () {
    this.loadData()
  },
  methods: {
    /**
     * 搜索
     */
    loadData () {
      this.loading = true
      const options = {
        groupId: this.currentTalk.id,
        pageSize: this.pageSize,
        pageNo: this.pageNo
      }
      queryGroupRecord(options).then(res => {
        this.fileList_org = res.result.data
        this.fileList = this.fileList_org
        this.total = res.result.totalCount
        this.loading = false
      })
    },
    /**
     * 分页
     */
    handleTableChange (page, pageSize) {
      this.pageSize = pageSize
      this.pageNo = page
      this.loadData()
    },
    /** 抽屉关闭时触发closeDrawer事件 */
    onClose () {
      this.$emit('closeDrawer')
    }
  }
}
</script>

<style lang="less">
.pageStyle {
  margin-top: 10px;
  margin-left: 140px;
}
:global {
.ant-table-tbody > tr > td {
    max-width: 100px;
  }
}
</style>
