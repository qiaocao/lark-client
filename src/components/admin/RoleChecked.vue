<template>
  <div>
    <a-select
      placeholder="请选择"
      :value="roles"
      @change="onChange"
      style="width:100%"
    >
      <a-select-option v-for="item in roleopts" :key="item.key">
        {{ item.title }}
      </a-select-option>
    </a-select>
  </div>
</template>
<script>
import { getRoleList } from '@/api/admin'
export default {
  data () {
    return {
      // 角色可选择集合
      roleopts: [],
      roles: ''
    }
  },
  created () {
    // 加载所有角色信息
    getRoleList().then(res => {
      const result = res.result.data
      result.forEach((res) => {
        this.roleopts.push({ 'key': res.id, 'title': res.name })
      })
    })
  },
  props: {
    values: {
      type: String,
      'default': function () {
        return ''
      }
    }
  },
  watch: {
    values (val) {
      this.roles = val
    }
  },
  methods: {
    /**
     * change 事件
     */
    onChange (value) {
      this.$emit('changerolecheck', value)
      this.roles = value
    }
  }
}
</script>
