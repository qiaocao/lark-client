<template>
  <!-- 聊天记录的抽屉 -->
  <a-drawer
    placement="right"
    :wrapStyle="{overflow: 'auto'}"
    width="420px"
    :closable="false"
    @close="onClose"
    :visible="visibleMode(activeOption.drawerType)"
    destroyOnClose
  >
    <template v-slot:title>
      <b>{{ activeOption.drawerName }}</b>
    </template>
    <component :is="activeOption.drawerType"></component>
  </a-drawer>
</template>
<script>
import talkHistory from './messageGrabble.vue'
import groupFile from './fileGrabble.vue'
import userFile from './UserFileGrabble.vue'
import teamMember from './TeamMember'
import moreInfo from './TalkSetting'
import groupRecord from './GroupRecordGrabble'
import MFile from './MFile'
import MConferee from './MConferee'

export default {
  name: 'TalkDrawer',
  components: {
    talkHistory,
    groupFile,
    userFile,
    teamMember,
    moreInfo,
    groupRecord,
    // 会议抽屉
    MFile,
    MConferee
  },
  props: {
    activeOption: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      // 聊天框操作选项
      config: [
        'talkHistory',
        'groupFile',
        'userFile',
        'moreInfo',
        'personMoreInfo',
        'teamMember',
        'groupRecord',
        'MFile',
        'MConferee'
      ]
    }
  },
  methods: {
    /** 抽屉关闭时触发closeDrawer事件 */
    onClose () {
      this.visible = false
      this.$emit('closeDrawer')
    },
    visibleMode (type) {
      return this.config.includes(type)
    }
  }
}
</script>
<style lang="less" scoped>
  body{
    .ant-drawer .ant-drawer-content {
      width: 100%;
      height: 92%;
    }
  }
  .ant-drawer .ant-drawer-content {
    width: 100%!important;
    height: 92%!important;
}
</style>
