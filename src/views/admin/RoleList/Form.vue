<template>
  <a-card :bordered="false" :style="{ height: '100%' }" title="角色信息">
    <a slot="extra" href="javascript:void(0)" @click="$emit('back')">返回</a>
    <a-form :form="form" :layout="formStyle.layout">
      <a-form-item label="唯一键识别码" v-bind="formStyle.itemLayout">
        <a-input v-decorator="[ 'code', {rules: [{ required: true, message: '请输入唯一识别码!' }]} ]" placeholder="唯一键识别码" />
      </a-form-item>
      <a-form-item label="角色名称" v-bind="formStyle.itemLayout">
        <a-input v-decorator="[ 'name', {rules: [{ required: true, message: '请输入角色名称!' }]} ]" placeholder="角色名称" />
      </a-form-item>
      <a-form-item label="状态" v-bind="formStyle.itemLayout">
        <a-select v-decorator="[ 'status', {rules: [{ required: true, message: '请选择状态!' }]} ]" placeholder="请选择状态">
          <a-select-option :value="1">正常</a-select-option>
          <a-select-option :value="2">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="备注说明" v-bind="formStyle.itemLayout">
        <a-textarea :row="3" v-decorator="[ 'describe', {rules: [{ type:'string',min:0,max:100, message: '备注长度在0-100个汉字之间!' }]} ]" placeholder="备注说明" />
      </a-form-item>
      <a-form-item v-bind="formStyle.buttonLayout">
        <a-button type="primary" @click="save">保存</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>
<script>
import { putRole, postRole } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'

export default {
  name: 'RoleForm',
  mixins: [mixinDevice],
  props: {
    role: {
      type: Object,
      required: true
    },
    formStyle: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  mounted () {
    this.form.setFieldsValue(this.role)
  },
  methods: {
    save () {
      const vm = this
      this.form.validateFields((err, values) => {
        if (!err) {
          vm.role.id ? vm.updateRole(values) : vm.createRole(values)
        }
      })
    },
    createRole (role) {
      const vm = this
      postRole(role).then(res => {
        vm.$emit('success', res.data)
      })
    },
    updateRole (role) {
      const vm = this
      putRole({ id: this.role.id, ...role }).then(res => {
        vm.$emit('success', res.data)
      })
    }
  }
}
</script>
