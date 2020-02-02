<template>
  <a-row :class="prefixCls">
    <a-col :span="24">
      <slot></slot>
    </a-col>
    <a-col :span="1" style="float: left">
      <slot name="extra">{{ extra }}</slot>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'FooterToolBar',
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-footer-toolbar'
    },
    extra: {
      type: [String, Object],
      default: ''
    }
  }
}
</script>

<style lang="less" scoped>
// 解决常用连接样式，解决首次加载样式问题
.ant-pro-footer-toolbar {
  position: fixed;
  width: 100%;
  bottom: 0;
  right: 0;
  height: 56px;
  line-height: 56px;
  -webkit-box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.03);
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.03);
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 0 24px;
  z-index: 9;
}
</style>
