<template>
  <a-card :bordered="false" :style="{ height: '100%' }" title="权限信息">
    <a slot="extra" href="javascript:void(0)" @click="$emit('back')">返回</a>
    <a-form :form="form" :layout="formStyle.layout">
      <a-form-item label="拥有权限" v-bind="formStyle.itemLayout">
        <a-row :gutter="16" v-for="(permission, index) in permissions" :key="index">
          <a-col :xl="4" :lg="24">
            {{ permission.title }}：
          </a-col>
          <a-col :xl="20" :lg="24">
            <a-checkbox
              v-if="permission.options.length > 0"
              :indeterminate="permission.indeterminate"
              :checked="permission.checkedAll"
              @change="onChangeCheckAll($event, permission)">
              全选
            </a-checkbox>
            <a-checkbox-group :options="permission.options" v-model="permission.selected" @change="updateCheckAll(permission)" />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item v-bind="formStyle.buttonLayout">
        <a-button type="primary" @click="savePermission">保存</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>
<script>
import { getPermissions, putPermissions } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'

export default {
  name: 'RolePermission',
  mixins: [mixinDevice],
  props: {
    formStyle: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      permissions: []
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  mounted () {
    this.loadPermissions()
  },
  methods: {
    loadPermissions () {
      const vm = this
      getPermissions().then(res => {
        vm.permissions = vm.formatPermissions(res.data)
      })
    },
    formatPermissions (permissions) {
      const vm = this
      return permissions.map(permission => {
        permission.selected = permission.selected || []
        vm.updateCheckAll(permission)
        permission.options = permission.options.map(option => {
          option.label = option.name
          option.value = option.id
          return option
        })
        return permission
      })
    },
    isIndeterminate (permission) {
      return !!permission.selected.length && (permission.selected.length < permission.options.length)
    },
    isCheckedAll (permission) {
      return permission.selected.length === permission.options.length
    },
    updateCheckAll (permission) {
      permission.indeterminate = this.isIndeterminate(permission)
      permission.checkedAll = this.isCheckedAll(permission)
    },
    onChangeCheckAll (e, permission) {
      permission.selected = e.target.checked ? permission.options.map(option => {
        return option.id
      }) : []
      this.updateCheckAll(permission)
    },
    savePermission () {
      const vm = this
      putPermissions(this.permissions).then(res => {
        vm.$emit('success')
      })
    }
  }
}
</script>
