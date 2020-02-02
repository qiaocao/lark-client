<template>
  <div style="height: 100%">
    <ConvBox
      :messageList="messageList"
      :chatInfo="currentTalk"
      :key="'talk' + currentTalk.id"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { ConvBox } from '@/components/Talk'

export default {
  name: 'ChatBox',
  components: {
    ConvBox
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['currentTalk', 'getTalkHistory']),
    // TODO: 待测试代码
    messageList () {
      // const msgs = this.$store.getters.getTalkHistory(this.currentTalk.id)
      // const stringMsgs = JSON.stringify(msgs)
      // const objMsgs = JSON.parse(stringMsgs)
      // return objMsgs
      return this.getTalkHistory(this.currentTalk.id)
    }
  }
}
</script>
<style lang="less" scoped>
</style>
