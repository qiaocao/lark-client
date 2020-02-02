<template>
  <div>
    <a-tree-select
      :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
      :treeData="orgTree"
      treeDefaultExpandAll
      allowClear
      :key="id"
      :value="id"
      @change="onChange"
      style="width:100%"
      :disabled="disabled"
    ></a-tree-select>
  </div>
</template>
<script>
import { getOrgTree } from '@/api/admin'
export default {
  name: 'OrgTreeSelect',
  components: {
    getOrgTree
  },
  data () {
    return {
      orgTree: [],
      id: ''
    }
  },
  created () {
    // 获取树形组织信息
    getOrgTree({ 'parentTreeId': 'root' }).then(res => {
      this.orgTree = this.genernateTree(res.result.data)
    })
    if (this.values) {
      this.id = this.values
    }
  },
  watch: {
    values: function (val) {
      this.id = val
    }
  },
  props: {
    // 树选择器选中内容 非必填可传递
    values: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    /**
     * 处理后台返回值
     */
    genernateTree (value) {
      value.forEach(item => {
        item.value = item.id
        if (item.children && item.children.length) {
          this.genernateTree(item.children)
        }
      })
      return value
    },
    /**
     * change事件
     */
    onChange (value, label) {
      this.id = value
      this.$emit('ok', value, label)
    }
  }
}
</script>
