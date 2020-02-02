<template>
  <div>
    <a-row :gutter="8">
      <a-spin :spinning="spinning">
        <a-card :bordered="true" title="人员基础信息">
          <a href="#" slot="extra" @click="cacenlEdit">返回</a>
          <a-form :form="editForm">
            <a-row class="form-row">
              <a-col :span="10" :offset="1">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="姓名"
                >
                  <a-input v-decorator="['name',{rules: [{ required: true, message: '请输入姓名' },{ max:10,message:'长度不能超过10个字'}]}]"/>
                </a-form-item>
              </a-col>
              <a-col :span="10" :offset="1">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="密级"
                >
                  <a-select placeholder="请选择" v-decorator="['secretLevel',{rules: [{ required: true, message: '请选择密级' }]}]">
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
            </a-row>
            <a-row class="form-row">
              <a-col :span="10" :offset="1">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="身份证号"
                >
                  <a-input
                    v-decorator="['pid',{rules: [{ required: true, message: '请输入身份证号' },{pattern: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/, message: '身份证输入格式有误'}]}]"/>
                </a-form-item>
              </a-col>
              <a-col :span="10" :offset="1">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="性别"
                >
                  <a-select placeholder="请选择" v-decorator="['gender',{rules: [{ required: true, message: '请选择性别' }]}]">
                    <a-select-option value="1">男</a-select-option>
                    <a-select-option value="2">女</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row class="form-row">
              <a-col :span="10" :offset="1">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="人员排序"
                >
                  <a-input-number :min="1" :max="99999" v-decorator="['orderId']" style="width:100%"/>
                </a-form-item>
              </a-col>
              <a-col :span="10" :offset="1">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="状态"
                >
                  <a-radio-group buttonStyle="solid" v-decorator="['inservice']">
                    <a-radio-button value="1">在职</a-radio-button>
                    <a-radio-button value="2">离职</a-radio-button>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
        <a-card :bordered="true" title="组织信息">
          <a-row>
            <a-col :span="10" :offset="1">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="所属组织"
              >
                <a-tree-select
                  :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
                  :treeData="treeOfOrg"
                  treeDefaultExpandAll
                  allowClear
                  @change="orgChange"
                  style="width:100%"
                  :value="orgid"
                ></a-tree-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
        <a-card :bordered="true" title="角色信息">
          <a-row>
            <a-col :span="10" :offset="1">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="选择角色"
              >
                <Role-checked :values="rolechecked" @changerolecheck="changerolecheck"></Role-checked>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
        <a-card :bordered="true" title="权限信息">
          <a-row>
            <a-col :span="10" :offset="1">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="权限"
              >
                <a-checkbox :indeterminate="indeterminate" @change="onCheckAllChange" :checked="checkAll">
                  全 选
                </a-checkbox>
                <a-checkbox-group :options="positionOptions" v-model="positionList" @change="positionChange" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row type="flex" justify="end">
            <a-col>
              <a-button type="primary" @click="saveUserInfo">保存</a-button>
            </a-col>
          </a-row>
        </a-card>
      </a-spin>
    </a-row>
  </div>
</template>
<script>
import RoleChecked from '@/components/admin/RoleChecked'
import { setTimeout } from 'timers'
import router from '../../router'
import { adduser, updateuser, getOrgTree, getPositionList, getuserInfo } from '@/api/admin'
export default {
  name: 'UserEdit',
  components: {
    RoleChecked
  },
  data () {
    return {
      // 响应式布局
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16, offset: 1 }
      },
      // 编辑页面信息传递
      userinfo: {},
      // 用户对应角色
      rolechecked: '',
      dataSource: [],
      // 绑定树选择的值
      orgid: '',
      orgname: '',
      spinning: false,
      positionList: [],
      indeterminate: false,
      checkAll: false,
      positionOptions: [],
      editForm: this.$form.createForm(this),
      treeOfOrg: []
    }
  },
  created () {
    // 获取树形组织信息
    getOrgTree({ 'parentTreeId': 'root' }).then(res => {
      this.treeOfOrg = this.genernateTree(res.result.data)
    })
    // 获取人员权限信息
    getPositionList().then(res => {
      const data = res.result.data
      data.forEach(item => {
        item.label = item.name
        item.value = item.id
      })
      this.positionOptions = data
      this.showUserInfo(this.$route.query.item)
    })
  },
  methods: {
    /**
     * 处理后台返回值 替换名字 id=>key label=>title
     * 处理与树型绑定值冲突问题
     */
    genernateTree (value) {
      value.forEach(item => {
        // item.value = item.key
        item.value = item.id + 'select'
        item.title = item.label
        item.key = item.id
        if (item.children && item.children.length) {
          this.genernateTree(item.children)
        }
      })
      return value
    },
    /**
     * 保存修改内容
     */
    saveUserInfo () {
      this.editForm.validateFields((err, values) => {
        // 除了用户基础信息必填项限制，在这里加，且需要有对应的提醒信息
        values.orgCode = this.orgid === undefined ? '' : this.orgid.replace('select', '')
        values.orgName = this.orgname[0] || ''
        if (!err) {
          this.spinning = true
          if (this.$route.query.editType === '1') {
            this.addUser(values)
          } else {
            this.updateUser(values)
          }
        }
      })
    },
    /**
     * 新增用户
     */
    addUser (values) {
      return adduser(
        values,
        { 'roles': this.rolechecked, 'positions': this.positionList.join(',') }
      ).then(
        res => {
          if (res.status === 200) {
            this.$notification['success']({
              message: '操作成功',
              duration: 2
            })
          } else {
            this.$notification['error']({
              message: res.message,
              duration: 4
            })
          }
        }
      ).catch((err) => {
        if (err || err.response || err.response) {
          this.$notification['error']({
            message: err.response.data.message,
            duration: 4
          })
        }
      }).finally(() => {
        this.spinning = false
        router.go(-1)
      })
    },
    updateUser (values) {
      values.id = this.userinfo.id
      return updateuser(
        values,
        { 'roles': this.rolechecked, 'positions': this.positionList.join(',') }
      ).then(
        res => {
          if (res.status === 200) {
            this.$notification['success']({
              message: '操作成功',
              duration: 2
            })
          } else {
            this.$notification['error']({
              message: res.message,
              duration: 4
            })
          }
        }
      ).catch((err) => {
        if (err || err.response || err.response) {
          this.$notification['error']({
            message: err.response.data.message,
            duration: 4
          })
        }
      }).finally(() => {
        this.spinning = false
        router.go(-1)
      })
    },
    /**
     * 返回
     */
    cacenlEdit () {
      router.go(-1)
      this.$notification['info']({
        message: '取消操作',
        duration: 2
      })
    },
    /**
     * 打开编辑用户信息弹出框
     */
    showUserInfo (item) {
      this.userinfo = Object.assign({}, item)
      setTimeout(() => {
        this.editForm.setFieldsValue({
          name: this.userinfo.name,
          inservice: this.userinfo.inservice === undefined ? '1' : '2',
          secretLevel: this.userinfo.secretLevel,
          pid: this.userinfo.pid,
          gender: this.userinfo.gender,
          orderId: this.userinfo.orderId
        })
      }, 0)
      if (item !== '') {
        // 拷贝选中信息内容到userinfo
        this.orgid = item.orgCode === undefined ? '' : item.orgCode + 'select'
        getuserInfo({ 'id': item.id }).then(res => {
          this.handleUserInfo(res.result.data)
        })
      }
    },
    handleUserInfo (user) {
      const roles = user[0]
      const positions = user[1]
      this.rolechecked = roles.map(role => role.id)
      if (roles.length > 0) {
        this.rolechecked = roles[0].id
      } else {
        this.rolechecked = ''
      }
      if (positions !== undefined && positions.length > 0) {
        this.positionList = positions.map(position => position.id)
        if (positions.length === this.positionOptions.length) {
          this.indeterminate = false
          this.checkAll = true
        } else {
          this.indeterminate = true
          this.checkAll = false
        }
      }
    },
    /**
     * 角色change事件
     */
    changerolecheck (value) {
      this.rolechecked = value
    },
    /**
     * 组织change事件
     */
    orgChange (value, name) {
      this.orgid = value
      this.orgname = name
    },
    /**
     * 权限change事件
     */
    positionChange (checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < this.positionOptions.length
      this.checkAll = checkedList.length === this.positionOptions.length
    },
    /**
     * 权限权限change事件
     */
    onCheckAllChange (e) {
      const value = this.positionOptions.map(item => {
        return item.id
      })
      Object.assign(this, {
        positionList: e.target.checked ? value : [],
        indeterminate: false,
        checkAll: e.target.checked
      })
    }
  }
}
</script>
<style scoped>
.form-row {
  margin-bottom: 10px
}
</style>
