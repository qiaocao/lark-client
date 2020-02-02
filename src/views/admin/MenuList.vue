<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="8" type="flex" justify="end">
          <a-col :md="5" :sm="24">
            <a-form-item label="菜单名称">
              <a-input v-model="queryParam.title"/>
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="24" :offset="1">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="search">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              <!-- <a-button type="primary" style="margin-left: 30px" @click="addMenu()">新增菜单</a-button> -->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <s-table
      ref="stable"
      size="default"
      :columns="columns"
      :data="loadData"
    >
      <span slot="action" slot-scope="text, record">
        <a @click="detailMenu(record)">详情</a>
        <a-divider type="vertical" />
        <a @click="editMenu(record)" v-action:update>编辑</a>
        <!-- <a-divider type="vertical" />
        <a @click="delMenu(record)">删除</a> -->
      </span>
    </s-table>
    <a-modal
      title="操作"
      style="top: 100px;"
      :width="800"
      v-model="visible"
      @ok="handleOk"
      :destroyOnClose="true"
      :confirmLoading="confirmLoading"
    >
      <a-form :form="form">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="菜单名称"
        >
          <a-input :value="title" :disabled="true"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="上级菜单"
          :labelInValue="true"
        >
          <a-select
            size="default"
            :disabled="true"
            :value="parentId"
          >
            <!-- v-decorator="['parentId',{initialValue:parentId}]" -->
            <a-select-option v-for="menu in menulist" :value="menu.id" :key="menu.id">
              {{ menu.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="包含按钮"
        >
          <a-row>
            <a-checkbox-group style="width:100%" @change="checkBoxChange" :defaultValue="chooseDes">
              <a-row type="flex" justify="start" align="middle" v-for="item in descriptionOpt" :key="item.value">
                <a-col :span="4"><a-checkbox :value="item.value">{{ item.label }}</a-checkbox></a-col>
                <a-col :span="10">
                  <a-select
                    size="default"
                    :disabled="inDetail"
                    style="margin-top:10px"
                    @change="selectChange"
                    :defaultValue="selectMethod.get(item.value)===undefined?'':selectMethod.get(item.value)"
                  >
                    <a-select-option v-for="method in methodArr" :key="`${item.value}-${method}`" >
                      {{ method }}
                    </a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-row>
        </a-form-item>
        <!-- <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="创建人"
          hasFeedback
          v-show="inDetail"
        >
          <a-input v-decorator="['creator']" :disabled="inDetail"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="创建时间"
          hasFeedback
          v-show="inDetail"
        >
          <a-input v-decorator="['createTime']" :disabled="inDetail"/>
        </a-form-item> -->
      </a-form>
    </a-modal>
  </a-card>
</template>
<script>
import { STable } from '@/components'
import { getMenuList, getMenuElement, delMenu, getMenuListAll, saveMenuElement } from '@/api/admin'
// addMenu, updateMenu,
export default {
  name: 'MenuList',
  components: {
    STable
  },
  data () {
    return {
      // 父级菜单id
      parentId: '',
      title: '',
      visible: false,
      form: this.$form.createForm(this),
      // 行信息
      mdl: {},
      // 查询参数
      queryParam: {},
      inAdd: false,
      inEdit: false,
      inDetail: false,
      // 上级菜单下拉框内容
      menulist: [],
      methodArr: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE', 'CONNECT', 'HEAD', 'OPTIONS', 'TRACE'],
      descriptionOpt: [
        { label: '增加', value: 'add' },
        { label: '修改', value: 'update' },
        { label: '删除', value: 'delete' },
        { label: '查询', value: 'query' },
        { label: '上传', value: 'upload' },
        { label: '下载', value: 'download' },
        { label: '导入', value: 'import' },
        { label: '导出', value: 'export' }
      ],
      // 选择的描述
      chooseDes: [],
      // key code value method
      methodMap: new Map(),
      // 绑定在方法下拉框的值
      selectMethod: new Map(),
      // key code value description
      checkboxMap: new Map(),
      menuid: '',
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getMenuList(parameter)
          .then(res => {
            return res.result
          })
      },
      // 表头
      columns: [
        {
          title: '菜单名称',
          dataIndex: 'title'
        },
        {
          title: 'uri',
          dataIndex: 'uri'
        },
        {
          title: '操作',
          width: '200px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
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
      spinning: false,
      confirmLoading: false
    }
  },
  created () {
    return getMenuListAll()
      .then(res => {
        this.menulist = Object.assign({}, res.result.data)
        this.descriptionOpt.forEach(item => {
          this.checkboxMap.set(item.value, item.label)
        })
      })
  },
  methods: {
    /**
     * 描述多选框change事件
     */
    checkBoxChange (value) {
      this.chooseDes = value
    },
    /**
     * 方法下拉框change事件
     */
    selectChange (value, node) {
      const arr = node.data.key.split('-')
      this.methodMap.set(arr[0], arr[1])
    },
    /**
     * 保存element信息
     */
    saveElement () {
      if (this.inDetail) {
        // 关闭编辑框
        this.visible = false
        return
      }
      const elementList = this.handleElementData()
      if (elementList === undefined) {
        return
      }
      const data = { 'menuId': this.menuid, 'elements': elementList }
      this.confirmLoading = true
      // 请求后台保存菜单按钮信息
      return saveMenuElement(data).then(res => {
        if (res.status === 200) {
          this.$notification['success']({
            message: '保存成功',
            duration: 2
          })
          // 关闭编辑框
          this.visible = false
          // 刷新列表
          this.$refs.stable.refresh(true)
          this.refreshMenu()
        } else {
          this.$notification['error']({
            message: res.message,
            duration: 4
          })
        }
      }).catch(() =>
        this.$notification['error']({
          message: '出现异常，请联系系统管理员',
          duration: 4
        })
      ).finally(() => {
        this.confirmLoading = false
      })
    },
    /**
     * 刷新菜单
     */
    refreshMenu () {
      return getMenuListAll()
        .then(res => {
          this.menulist = Object.assign({}, res.result.data)
        })
    },
    /**
     * 处理多选框和下拉框内容
     * 将内容整理为后台接收的格式
     */
    handleElementData () {
      const arr = []
      let checkResult = true
      if (this.chooseDes.length === 0) {
        this.$notification['info']({
          message: '请选择包含的按钮',
          duration: 2
        })
        return
      }
      this.chooseDes.forEach(item => {
        if (this.methodMap.get(item) === undefined) {
          this.$notification['info']({
            message: '请为"' + this.checkboxMap.get(item) + '"按钮选择请求方式',
            duration: 2
          })
          checkResult = false
        }
        arr.push({ 'method': this.methodMap.get(item), 'description': this.checkboxMap.get(item), 'code': item })
      })
      if (!checkResult) {
        return
      }
      return arr
    },
    /**
     * 搜索
     */
    search () {
      this.$refs.stable.loadData({}, this.queryParam, {})
    },
    /**
     * 保存
     * menu，element两个接口
     */
    handleOk () {
      this.saveElement()
      // 暂不支持对菜单内容修改
      // this.form.validateFields((err, values) => {
      //   if (!err) {
      //     if (this.inAdd) {
      //       return addMenu(
      //         values
      //       ).then(
      //         res => {
      //           if (res.status === 200) {
      //             this.menuid = res.result.id
      //             this.saveElement()
      //           } else {
      //             this.$notification['error']({
      //               message: res.message,
      //               duration: 4
      //             })
      //           }
      //         }
      //       ).catch(() =>
      //         this.$notification['error']({
      //           message: '出现异常，请联系系统管理员',
      //           duration: 4
      //         })
      //       )
      //     } else {
      //       values.id = this.menuid
      //       return updateMenu(
      //         values
      //       ).then(
      //         res => {
      //           if (res.status === 200) {
      //             this.saveElement()
      //           } else {
      //             this.$notification['error']({
      //               message: res.message,
      //               duration: 4
      //             })
      //           }
      //         }
      //       ).catch(() =>
      //         this.$notification['error']({
      //           message: '出现异常，请联系系统管理员',
      //           duration: 4
      //         })
      //       )
      //     }
      //   }
      // })
    },
    /**
     * 新增菜单
     */
    addMenu () {
      this.inAdd = true
      this.inEdit = false
      this.inDetail = false
      this.bindFormData({})
    },
    /**
     * 菜单查看
     */
    detailMenu (record) {
      this.inAdd = false
      this.inEdit = false
      this.inDetail = true
      this.bindFormData(record)
    },
    /**
     * 编辑菜单
     */
    editMenu (record) {
      this.inAdd = false
      this.inEdit = true
      this.inDetail = false
      // 以下菜单不能编辑按钮信息
      if (record.title === '协同研讨' || record.title === '工作舱' || record.title === '登录' || record.title === '个人中心') {
        this.inDetail = true
      }
      this.bindFormData(record)
      this.menuid = record.id
    },
    /**
     * form表单绑定数据
     */
    bindFormData (record) {
      this.chooseDes = []
      this.selectMethod = new Map()
      this.methodMap = new Map()
      if (record.id !== undefined) {
        this.title = record.title
        this.parentId = record.parentId
        return getMenuElement({ 'menuId': record.id }).then(res => {
          if (res.status === 200) {
            res.result.data.forEach(item => {
              // 用于初始化绑定组件
              this.chooseDes.push(item.code)
              // 用于初始化绑定组件
              this.selectMethod.set(item.code, item.code + '-' + item.method)
              // 用于发送到后台请求的数据
              this.methodMap.set(item.code, item.method)
            })
          }
          this.visible = true
        }).catch(() =>
          this.$notification['error']({
            message: '出现异常，请联系系统管理员',
            duration: 4
          })
        )
      }
      this.visible = true
    },
    /**
     * 删除菜单
     */
    delMenu (record) {
      const _this = this
      this.$confirm({
        title: '警告',
        content: `确认要删除 ${record.title} 吗?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          _this.spinning = true
          // 在这里调用删除接口
          return delMenu(
            record.id
          ).then(
            res => {
              if (res.status === 200) {
                _this.$notification['success']({
                  message: '删除成功',
                  duration: 2
                })
                _this.$refs.stable.refresh(true)
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
          this.$notification['info']({
            message: '取消删除操作',
            duration: 4
          })
        }
      })
    }
  }
}
</script>
<style>

</style>
