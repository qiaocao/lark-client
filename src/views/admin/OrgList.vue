<template>
  <div>
    <a-row :gutter="24" >
      <a-spin :spinning="spinning">
        <a-col :span="6">
          <a-card :bordered="true" title="组织树">
            <a-row :gutter="24" type="flex" justify="space-around" align="middle">
              <a-col :span="18">
                <a-input-search style="margin-bottom: 8px" placeholder="Search" @change="onChange" />
              </a-col>
              <a-col :span="6">
                <a-icon type="plus-circle" @click="addOrg" style="font-size:20px" theme="twoTone" v-action:add/>
              </a-col>
            </a-row>
            <div style="overflow:scroll;height:650px">
              <a-tree
                @expand="onExpand"
                :expandedKeys="expandedKeys"
                :autoExpandParent="autoExpandParent"
                :treeData="orgTree"
                @select="selectOrg"
                ref="orgtree"
              >
                <template slot="title" slot-scope="{title}">
                  <span v-if="title.indexOf(searchValue) > -1">
                    {{ title.substr(0, title.indexOf(searchValue)) }}
                    <span style="color: #f50">{{ searchValue }}</span>
                    {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
                  </span>
                  <span v-else>{{ title }}</span>
                </template>
              </a-tree>
            </div>
          </a-card>
        </a-col>
        <a-col :span="18" >
          <a-card :bordered="true" :title="cardname" v-show="formvisable">
            <a-row :gutter="24" >
              <a-form :form="editForm">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="上级组织"
                >
                  <a-input v-decorator="['parentId']" :disabled="disabled"/>
                </a-form-item>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="组织名称"
                >
                  <a-input
                    placeholder="组织名称"
                    v-decorator="['orgName',{rules: [{ required: true, message: '请输入组织名称信息' },{ max:20,message:'长度不能超过20个字'}]}]"/>
                </a-form-item>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="组织类型"
                >
                  <a-select
                    v-decorator="['orgtype',{rules: [{ required: true, message: '请选择组织类型信息' }]}]"
                    placeholder="请选择"
                  >
                    <a-select-option value="1">集团</a-select-option>
                  </a-select>
                </a-form-item>
                <!-- <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="人员排序一"
                >
                  <a-input-search
                    enterButton
                    v-decorator="['people1']"
                    @search="$refs.model.beginChoose(people1id, '1')"
                  />
                </a-form-item>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="人员排序二"
                >
                  <a-input
                    enterButton
                    v-decorator="['people2']"
                  />
                </a-form-item>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="人员排序三"
                >
                  <a-input
                    enterButton
                    v-decorator="['people3']"
                  />
                </a-form-item>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="人员排序四"
                >
                  <a-input
                    enterButton
                    v-decorator="['people4']"
                  />
                </a-form-item>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="人员排序五"
                >
                  <a-input
                    enterButton
                    v-decorator="['people5']"
                  />
                </a-form-item> -->
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="排序"
                >
                  <a-input-number style="width:100%" :min="1" :max="99999" v-decorator="['orderId',{rules: [{ required: true, message: '请输入排序信息' }]}]" />
                </a-form-item>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="描述"
                >
                  <a-textarea :rows="5" v-decorator="['description']"/>
                </a-form-item>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="状态"
                >
                  <a-switch defaultChecked v-decorator="['status']"/>
                </a-form-item>
              </a-form>
            </a-row>
            <a-row type="flex" justify="end">
              <a-col :span="6">
                <a-button type="primary" @click="saveOrginfo" v-action:update>
                  保存
                </a-button>
                <a-button type="danger" @click="delOrg" style="margin-left: 8px" v-action:delete>
                  删除
                </a-button>
              </a-col>
            </a-row>
            <!-- <user-transfer ref="model" @ok="handleSaveOk" @close="handleSaveClose"/> -->
          </a-card>
        </a-col>
      </a-spin>
    </a-row>
  </div>
</template>
<script>
// import UserTransfer from '@/components/admin/UserTransfer'
import { getOrgTree, addorg, updateorg, delorg } from '@/api/admin'
export default {
  name: 'OrgList',
  components: {
    // UserTransfer
  },
  data () {
    return {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      orgTree: [],
      dataList: [],
      // 当前点击树节点
      currentitem: '',
      pareOrg: '',
      cardname: '组织信息',
      // 查询参数
      queryParam: {},
      // 响应式布局
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14, offset: 1 }
      },
      editForm: this.$form.createForm(this),
      // 1 新增2 修改
      type: '',
      // people1id: '',
      // people2id: '',
      // people3id: '',
      // people4id: '',
      // people5id: '',
      // 右侧form表单默认不显示
      formvisable: false,
      disabled: true,
      parentId: '',
      spinning: false
    }
  },
  created () {
    // 获取树形组织信息
    getOrgTree({ 'parentTreeId': 'root' }).then(res => {
      this.orgTree = this.handleVal(res.result.data)
      generateList(this.orgTree)
    })
    // 将树型结构信息转成列表形式，用于组织信息搜索
    const generateList = (data) => {
      for (let i = 0; i < data.length; i++) {
        const node = data[i]
        const key = node.title
        // 用于树型搜索框添加样式（前台处理需使用递归函数遍历所有子节点，耗用资源，请在后台添加该信息）
        node.scopedSlots = { title: 'title' }
        this.dataList.push({ key, title: key })
        if (node.children) {
          generateList(node.children, node.key)
        }
      }
    }
  },
  methods: {
    /**
     * 展开/收起节点时触发
     */
    onExpand  (expandedKeys) {
      // 展开指定树节点
      this.expandedKeys = expandedKeys
      // this.autoExpandParent = false
    },
    /**
     * 搜索组织信息
     */
    onChange (e) {
      const value = e.target.value
      const expandedKeys = this.dataList.map((item) => {
        if (item.key.indexOf(value) > -1) {
          return this.getParentKey(item.key, this.orgTree).key
        }
        return null
      }).filter((item, i, self) => item && self.indexOf(item) === i)
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true
      })
    },
    /**
     * 获取父节点key
     */
    getParentKey (key, tree) {
      let parentKey
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        if (node.children) {
          if (node.children.some(item => item.title === key)) {
            parentKey = node
          } else if (this.getParentKey(key, node.children)) {
            parentKey = this.getParentKey(key, node.children)
          }
        }
      }
      return parentKey
    },
    /**
     * 点击树节点进入编辑模式
     */
    selectOrg (selectedKeys, e) {
      this.formvisable = true
      this.currentitem = e.node._props.dataRef
      const parentNode = this.getParentNode(this.currentitem.key, this.orgTree)
      this.parentId = parentNode === undefined ? '' : parentNode.key
      this.editForm.setFieldsValue({
        orgName: this.currentitem.title,
        orgtype: this.currentitem.orgtype,
        orderId: this.currentitem.order,
        // people1: this.currentitem.people1name,
        // people2: this.currentitem.people2name,
        // people3: this.currentitem.people3name,
        // people4: this.currentitem.people4name,
        // people5: this.currentitem.people5name,
        description: this.currentitem.description,
        status: this.currentitem.status,
        parentId: parentNode === undefined ? '' : parentNode.title
      })
      this.cardname = '修改组织信息'
      // this.people1id = this.currentitem.people1id
      // this.people2id = this.currentitem.people2id
      // this.people3id = this.currentitem.people3id
      // this.people4id = this.currentitem.people4id
      // this.people5id = this.currentitem.people5id
      this.type = '2'
    },
    /**
     * 获取父节点 用于点击树节点触发右侧form表单 获取上级组织信息
     */
    getParentNode (key, tree) {
      let parentKey
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        if (node.children) {
          if (node.children.some(item => item.key === key)) {
            parentKey = node
          } else if (this.getParentNode(key, node.children)) {
            parentKey = this.getParentNode(key, node.children)
          }
        }
      }
      return parentKey
    },
    /**
     * 点击新增按钮进入新增模式
     */
    addOrg () {
      if (this.currentitem === '') {
        this.$notification['warning']({
          message: '请选择一个组织单元',
          duration: 2
        })
        return
      }
      this.formvisable = true
      this.editForm.resetFields()
      this.editForm.setFieldsValue({
        parentId: this.currentitem.title
      })
      this.type = '1'
      this.cardname = '新增组织信息'
    },
    /**
     * 单条删除组织机构信息
     */
    delOrg () {
      if (this.currentitem === '') {
        this.$notification['warning']({
          message: '请选择一个组织单元',
          duration: 2
        })
        return
      }
      const _this = this
      this.$confirm({
        title: '警告',
        content: `确认要删除 ${this.currentitem.title} 的组织信息吗?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          _this.spinning = true
          // 在这里调用删除接口
          return delorg(
            _this.currentitem.key
          ).then(
            res => {
              if (res.status === 200) {
                _this.$notification['success']({
                  message: '删除成功',
                  duration: 2
                })
                _this.formvisable = false
                _this.refreshOrg()
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
    },
    /**
     * 组件主要负责人点击保存触发
     */
    handleSaveOk (returnData, type) {
      const username = []
      const userid = []
      returnData.forEach(item => {
        username.push(item.name)
        userid.push(item.id)
      })
      if (type === '1') {
        this.people1id = userid.join(',')
        this.editForm.setFieldsValue({
          'people1': username.join(',')
        })
      } else if (type === '2') {
        this.people2id = userid.join(',')
        this.editForm.setFieldsValue({
          'people2': username.join(',')
        })
      } else if (type === '3') {
        this.people3id = userid.join(',')
        this.editForm.setFieldsValue({
          'people3': username.join(',')
        })
      } else if (type === '4') {
        this.people4id = userid.join(',')
        this.editForm.setFieldsValue({
          'people4': username.join(',')
        })
      } else if (type === '5') {
        this.people5id = userid.join(',')
        this.editForm.setFieldsValue({
          'people5': username.join(',')
        })
      }
    },
    /**
     * 组件主要负责人点击取消触发
     */
    handleSaveClose () {

    },
    /**
     * 组织信息增删改后强制刷新树
     */
    refreshOrg () {
      getOrgTree({ 'parentTreeId': 'root' }).then(res => {
        this.orgTree = this.handleVal(res.result.data)
      })
    },
    /**
     * 保存组织表单信息
     */
    saveOrginfo () {
      const _this = this
      this.editForm.validateFields((err, values) => {
        if (!err) {
          this.spinning = true
          if (this.type === '1') {
            values.parentId = this.currentitem.key
            // fansq 19-11-27 14:53  添加参数 pathCode pathName
            values.pathCode = this.currentitem.pathCode
            values.pathName = this.currentitem.pathName
            values.orgLevel = this.currentitem.level
            // 在这里调用新增接口
            return addorg(
              values
            ).then(
              res => {
                if (res.status === 200) {
                  _this.$notification['success']({
                    message: '保存成功',
                    duration: 2
                  })
                  _this.formvisable = false
                  _this.refreshOrg()
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
          } else {
            values.parentId = this.parentId
            values.id = this.currentitem.key
            const parentNodeTree = this.getParentNode(this.currentitem.key, this.orgTree)
            values.pathCode = parentNodeTree.pathCode
            values.pathName = parentNodeTree.pathName
            // 在这里调用修改接口
            return updateorg(
              values
            ).then(
              res => {
                if (res.status === 200) {
                  _this.$notification['success']({
                    message: '保存成功',
                    duration: 2
                  })
                  this.formvisable = false
                  _this.refreshOrg()
                } else {
                  _this.$notification['error']({
                    message: res.message,
                    duration: 4
                  })
                }
              }
            ).catch(() =>
              this.$notification['error']({
                message: '出现异常，请联系系统管理员',
                duration: 4
              })
            ).finally(() => {
              _this.spinning = false
            })
          }
        }
      })
    },
    /**
     * 处理后台返回值 替换名字 id=>key label=>title
     */
    handleVal (value) {
      let str = JSON.stringify(value)
      str = str.replace(/id/g, 'key').replace(/label/g, 'title')
      return JSON.parse(str)
    }
  }
}
</script>
