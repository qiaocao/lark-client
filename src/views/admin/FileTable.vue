<template>
  <div>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" :form="form">
          <a-row :gutter="8" type="flex" justify="end">
            <a-col :md="4" :sm="24">
              <a-form-item label="文件名">
                <a-input v-model="queryParam.fileName"/>
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="24">
              <a-form-item label="文件类型">
                <a-select v-model="queryParam.isGroup">
                  <a-select-option value="">不限制</a-select-option>
                  <a-select-option value="1">群文件</a-select-option>
                  <a-select-option value="0">个人文件</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="24">
              <a-form-item label="密级">
                <a-select v-model="queryParam.level">
                  <a-select-option value="">不限制</a-select-option>
                  <a-select-option value="30">非密</a-select-option>
                  <a-select-option value="40">秘密</a-select-option>
                  <a-select-option value="60">机密</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="24">
              <a-form-item label="上传者">
                <a-input v-model="queryParam.userName"/>
              </a-form-item>
            </a-col>
            <!-- <a-col :md="4" :sm="24">
              <a-form-item label="上传时间">
                <a-range-picker @change="onChange" v-decorator="['timerange']"/>
              </a-form-item>
            </a-col> -->
            <a-col :md="4" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="search">查询</a-button>
                <a-button style="margin-left: 8px" @click="resetQueryParams">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <a-table
        :columns="columns"
        :loading="spinning"
        :dataSource="data"
        :pagination="false"
        :rowKey="(record) => record.fileId"
      >
        <a class="file_name_all" style="" slot="name" slot-scope="text">{{ text }}</a>
        <span slot="customTitle"> 文件名</span>
        <span slot="tags" slot-scope="tags, record">
          <a-tag :color="record.color">{{ tags }}</a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <a
            v-if="record.levels === '非密'"
            @click="handleFileDownload(record)"
          >下载</a>
        </span>
      </a-table>
      <a-pagination style="float: right" @change="onChanges" :total="total" />
    </a-card>
  </div>
</template>
<script>

import { download } from '@/utils/util'
import { fileAll } from '@/api/admin.js'
const columns = [{
  dataIndex: 'fileName',
  key: 'name',
  slots: { title: 'customTitle' },
  scopedSlots: { customRender: 'name' }
},
{
  title: '文件类型',
  key: 'isGroup',
  dataIndex: 'isGroup'
},
{
  title: '文件大小',
  dataIndex: 'fileSize',
  key: 'fileSize'
},
{
  title: '上传者',
  dataIndex: 'uploadUserName',
  key: 'uploadUserName'
},
{
  title: '上传时间',
  key: 'uploadTime',
  dataIndex: 'uploadTime'
},
{
  title: '密级',
  key: 'levels',
  dataIndex: 'levels',
  scopedSlots: { customRender: 'tags' }
},
{
  title: '操作',
  key: 'action',
  scopedSlots: { customRender: 'action' }
}]
export default {
  data () {
    return {
      data: [],
      color: 'tomato',
      current: 1,
      dateBegin: '',
      dateEnd: '',
      columns,
      pageSize: 5,
      total: 5,
      spinning: false,
      // 查询参数
      queryParam: {},
      form: this.$form.createForm(this)
    }
  },
  created () {
    this.getTable()
  },
  methods: {
    /**
     * 时间搜索框发生变化
     */
    onChange (date, dateString) {
      if (dateString.length > 2) {
        this.dateBegin = dateString[0]
        this.dateEnd = dateString[1]
      }
    },
    /**
     * 翻页变化
     */
    onChanges (current) {
      this.current = current
      this.getTable()
    },
    /**
     * 搜索
     */
    search () {
      if (this.current === undefined) {
        this.current = 1
      }
      this.current = 1
      this.getTable()
    },
    /**
     * 查询项清空
     */
    resetQueryParams () {
      this.queryParam = {}
      this.form.setFieldsValue({ timerange: undefined })
      this.dateBegin = ''
      this.dateEnd = ''
    },
    /**
     * 下载
     */
    handleFileDownload (file) {
      download(file.fileId, file.fileName)
    },
    /**
     * 请求查询数据
     */
    getTable () {
      this.spinning = true
      let options = {
        dateBegin: this.dateBegin,
        dateEnd: this.dateEnd,
        page: this.current,
        size: 10
      }
      options = Object.assign(this.queryParam, options)
      fileAll(options).then(res => {
        this.spinning = false
        res.result.data.map(res => {
          if (res.isGroup === '0') {
            res.isGroup = '个人文件'
          } else {
            res.isGroup = '群文件'
          }
          res.fileSize = res.fileSize + 'M'
          if (res.levels === '30') {
            res.levels = '非密'
            res.color = ''
          } else if (res.levels === '40') {
            res.levels = '秘密'
            res.color = 'orange'
          } else if (res.levels === '60') {
            res.levels = '机密'
            res.color = 'tomato'
          }
          this.fileId = res.fileId
        })
        this.total = res.result.totalCount
        this.data = res.result.data
      })
    }
  }
}
</script>
<style lang='less' scoped>
    .file_name_all{
      max-width: 230px;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
</style>
