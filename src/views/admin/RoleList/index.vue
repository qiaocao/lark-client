<template>
  <div>
    <!-- <a-divider v-if="isMobile()" /> -->
    <role-list
      v-if="showRoleList"
      :rolePage="rolePage"
      :formStyle="formStyle"
      @fetchData="fetchData"
      @toCreate="toCreate"
      @edit="editRole"
      @permission="editPermission"/>
    <role-form v-if="showRoleForm" :role="selectedRole" :formStyle="formStyle" @back="hideForm" @success="modifySuccess"/>
    <role-permission v-if="showRolePermission" :formStyle="formStyle" @back="hidePermission" @success="permissionSuccess" />
  </div>
</template>
<script>

import { mixinDevice } from '@/utils/mixin'
import { getRoleList } from '@/api/manage'
import RoleList from './List.vue'
import RoleForm from './Form.vue'
import RolePermission from './Permission.vue'

export default {
  mixins: [mixinDevice],
  components: {
    RoleList,
    RoleForm,
    RolePermission
  },
  data () {
    return {
      horizontalCol: {
        labelSpan: 4,
        wrapperSpan: 16
      },
      showRoleList: true,
      showRoleForm: false,
      showRolePermission: false,
      isCreateForm: false,
      rolePage: {},
      selectedRole: {}
    }
  },
  created () {
    this.fetchData()
  },
  mounted () {
    this.hideForm()
    this.hidePermission()
  },
  computed: {
    formStyle () {
      return this.isMobile() ? { layout: 'vertical', itemLayout: {}, buttonLayout: {} } : {
        layout: 'horizontal',
        itemLayout: {
          labelCol: { span: 4 },
          wrapperCol: { span: 14 }
        },
        buttonLayout: {
          wrapperCol: { span: 14, offset: 4 }
        }
      }
    }
  },
  methods: {
    fetchData (param = { pageNo: 1 }) {
      const vm = this
      getRoleList(param).then((res) => {
        vm.rolePage = Object.assign({}, res.data)
      })
    },
    showForm () {
      this.showRoleList = false
      this.showRoleForm = true
    },
    hideForm () {
      this.showRoleList = true
      this.showRoleForm = false
    },
    showPermission () {
      this.showRoleList = false
      this.showRolePermission = true
    },
    hidePermission () {
      this.showRoleList = true
      this.showRolePermission = false
    },
    toCreate () {
      this.selectedRole = {}
      this.showForm()
      this.isCreateForm = true
    },
    editRole (role) {
      this.selectedRole = Object.assign({}, role)
      this.showForm()
      this.isCreateForm = false
    },
    editPermission (role) {
      this.selectedRole = Object.assign({}, role)
      this.showPermission()
      this.isCreateForm = false
    },
    modifySuccess () {
      this.fetchData()
      this.hideForm()
    },
    permissionSuccess () {
      this.hidePermission()
    }
  }
}
</script>
