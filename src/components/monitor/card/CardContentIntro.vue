<template>
  <div>
    <div style="margin:12px; text-align:center">
      <a-row :gutter="8">
        <a-col :span="6">
          <a-avatar :src="avatar" :size="72" icon="user" style="margin-left:36px"/>
        </a-col>
        <a-col :span="18">
          <div class="title">
            {{ timeFix }}，{{ user.name }}
            <span class="welcome-text">{{ welcome }}</span>
          </div>
          <!-- <div>主任设计师 | 十一室 - 工程信息化组</div> -->
          <!-- TODO fanjiao返回内容暂未提供职位、组织信息，这里暂显示人员密级 -->
          <!-- 由于src\utils\constants.js密级常量中人员密级只提供60/70/80三个等级，如果人员有其他密级，控制台可能会打印错误 -->
          <!-- <div>人员密级 | {{ user.secretLevel | peopleSecret }}</div> -->
        </a-col>
      </a-row>
    </div>
  </div>
</template>
<script>
import { timeFix, welcome } from '@/utils/util'
import HeadInfo from '@/components/tools/HeadInfo'
import { FILE_SERVER_IP } from '@/utils/constants'
export default {
  components: { HeadInfo },
  data () {
    return {
      timeFix: timeFix(),
      welcome: welcome(),
      avatar: '',
      user: {}
    }
  },
  computed: {
    userInfo () {
      return this.$store.getters.userInfo
    }
  },
  created () {
    this.user = this.userInfo
    this.avatar = FILE_SERVER_IP + this.userInfo.avatar
  }
}
</script>
<style lang="less" scoped>
  .project-list {
    .project-card-grid {
      width: 100%;
    }
  }

  .more-info {
    border: 0;
    padding-top: 16px;
    margin: 36px 0 36px;
  }

  .headerContent .title .welcome-text {
    display: none;
  }
  .title{
    font-size: 20px;
    line-height: 28px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 16px;
    -webkit-box-flex: 1;
    -ms-flex: auto;
    flex: auto;
  }
</style>
