<template>
  <a-row :class="prefixCls">
    <a-col :span="23">
      <slot></slot>
    </a-col>
    <a-col :span="1" style="float: left">
      <slot name="extra">{{ extra }}</slot>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'ElementFooter',
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-footer-toolbar-ele'
    },
    extra: {
      type: [String, Object],
      default: ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>
