<template>
  <div>
    <div v-if="listData.length!=0" class="card-content">
      <a-list
        itemLayout="horizontal"
        :bordered="bordered"
        :dataSource="listData.slice(0, 5)"
        class="card-list"
      >
        <a-list-item
          :style="{padding: '3px 21px 3px 21px', lineHeight: '48px'}"
          slot="renderItem"
          slot-scope="item, index"
          @click="handle2Talk"
        >
          <a-list-item-meta :description="item|handleMsg(item)">
            <!-- <a slot="title" href="#">{{ item.sender }}</a> -->
            <a slot="title" href="#">{{ item.msgSender }}</a>
            <a-avatar
              :class="['card-content-react', getOnlineStatus(item.sendUserId) ? 'on-line-tag' : '']"
              :size="40"
              slot="avatar"
              shape="square"
              :src="fileurl+''+item.avatar"
              :icon="item.isGroup ? 'team' : ''"
              :style="{backgroundColor: colorList[index], opacity: 0.8}"
            >
              <!-- {{ item.sender.slice(0, 1) }} -->
              {{ item.msgSender.slice(0, 1) }}
            </a-avatar>
          </a-list-item-meta>
          <div>{{ item.sendTime|timeFormat }}</div>
        </a-list-item>
      </a-list>
    </div>
    <div v-else style="margin: 40px auto 0 auto;text-align: center;" class="card-content">
      <a-icon type="file-exclamation" theme="twoTone" :style="fontSize" />
      <p class="description">卡片暂无内容</p>
    </div>
  </div>
</template>
<script>
import { toWeiXinString } from '@/utils/util'
import { FILE_SERVER_IP, MESSAGE_TYPE } from '@/utils/constants'
export default {
  name: 'CardContent',
  computed: {
    /*
    * @author <qiguanquan>
    * 参数：人员id
    * 获取getters 中的判断是否在线的方法
    * 在线 return true
    * 离线 return false
    */
    getOnlineStatus () {
      return function (key) {
        return this.$store.getters.getOnlineStatus(key)
      }
    }
  },
  data () {
    return {
      bordered: false,
      fontSize: { fontSize: '52px' },
      list: [],
      colorList: [
        '#37af5c', '#801dae', '#ffbf00',
        '#f56a00', '#7265e6', '#00a2ae'
      ],
      fileurl: FILE_SERVER_IP
    }
  },
  props: {
    listData: {
      type: Array,
      required: true
    }
  },
  filters: {
    timeFormat: toWeiXinString,
    // 消息显示过滤 1、图片及文件显示文字2、文字超过20字显示部分
    handleMsg: function (value, item) {
      let msgType = item.msgType
      const msg = item.msg
      msgType = parseInt(msgType)
      return MESSAGE_TYPE.get(msgType || 1) + (msg || '')
    }
  },
  methods: {
    // 跳转到研讨页
    handle2Talk () {
      this.$router.push({
        name: 'ChatBox'
      })
    }
  }
}
</script>
<style lang="less" scoped>
.card-list {
  .ant-list-item {
    cursor: pointer;
    transition: background-color 218ms;
    border-bottom: 0px solid #e8e8e8;
  }
  .ant-list-item:hover {
    background-color: #f5f5f5;
  }
}
.ant-list-item-meta-description {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
</style>
