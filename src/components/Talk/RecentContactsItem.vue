<template>
  <!-- recent contacts item -->
  <div :class="recentContactsClasses" :key="contactsInfo.id">
    <div class="avatar">
      <a-badge
        :dot="JSON.parse(contactsInfo.isMute)"
        :count="JSON.parse(contactsInfo.unreadNum)"
        :overflowCount="99"
        :offset="badgeoffset"
        :numberStyle="badgeNumStyle"
      >
        <a-avatar
          :class="['avatar-img', getOnlineStatus ? 'on-line-tag' : '']"
          shape="square"
          :src="avatarUrl"
          :size="40"
          :icon="contactsInfo.isGroup ? 'team' : ''"
        >{{ contactsInfo.name.substr(0, 4) }}</a-avatar>
      </a-badge>
    </div>

    <div class="extra">
      <p class="attr">{{ contactsInfo.time }}</p>
      <p class="attr">
        <a-icon
          v-if="contactsInfo.isMute && contactsInfo.isGroup"
          type="eye-invisible"
          theme="filled"
        />
      </p>
    </div>

    <div class="info">
      <p class="nickname">
        <span :class="'s-' + contactsInfo.secretLevel">
          [{{ contactsInfo.secretLevel | fileSecret }}]
        </span>
        {{ contactsInfo.name }}
      </p>
      <div class="msg">
        <span v-if="contactsInfo.atMe && contactsInfo.isGroup" class="at-me">[有人@我]</span>
        <!-- 群组被静音后提示未读消息条数 -->
        <span
          v-if="contactsInfo.isGroup && contactsInfo.isMute && contactsInfo.unreadNum"
        >[{{ contactsInfo.unreadNum }}条]</span>
        <!-- 群组提示消息发送者姓名 -->
        <span v-if="contactsInfo.sender && contactsInfo.isGroup">{{ contactsInfo.sender }}:</span>

        <!-- 分类显示消息内容 -->
        {{ lastMessage }}
        <!-- <div v-html="lastMessage" class="msg-content"></div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { MESSAGE_TYPE, FILE_SERVER_IP } from '@/utils/constants'

export default {
  name: 'RecentContactsItem',
  props: {
    /* contacts information object
      contactsInfo = {
        id: 唯一标识符 String
        lastMessage: 最后一条消息 Object 同消息体中的content
        name: 联系人/群组名称 String
        sender: 发送者姓名 String
        avatar: 头像 String
        time: 时间 String
        atMe: 是否有人@我 Boolean
        secretLevel: 联系人密级
        unreadNum 未读消息数
        memberNum 成员数量
        isTop: 是否置顶 Boolean
        isMute: 是否免打扰 Boolean
        isGroup: 是否群组 Boolean
      }
    */
    contactsInfo: {
      type: Object,
      default: () => ({}),
      required: true
    },
    activated: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data () {
    return {}
  },
  computed: {
    /*
    * @author <qiguanquan>
    * 参数：人员id
    * 获取getters 中的判断是否在线的方法
    * 在线 return true
    * 离线 return false
    */
    getOnlineStatus () {
      return this.$store.getters.getOnlineStatus(this.contactsInfo.id)
    },
    recentContactsClasses () {
      return {
        'recent-contacts': true,
        top: this.contactsInfo.isTop && !this.activated,
        activated: this.activated
      }
    },
    badgeoffset () {
      return this.contactsInfo.isMute ? [] : [-5, 5]
    },
    badgeNumStyle () {
      return this.contactsInfo.isMute
        ? {}
        : {
          padding: '0',
          boxShadow: 'none',
          height: '16px',
          minWidth: '16px',
          lineHeight: '16px'
        }
    },
    lastMessage () {
      const { type, title } = this.contactsInfo.lastMessage
      return MESSAGE_TYPE.get(type || 1) + (title || '')
    },
    avatarUrl () {
      return FILE_SERVER_IP + this.contactsInfo.avatar
    }
  }
}
</script>

<style lang="less" scoped>
.activated {
  background-color: #d3d6dc !important;
}

.top {
  background-color: #e6e9ed !important;
}

.recent-contacts {
  width: 100%;
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  cursor: pointer;
  overflow: hidden;
  padding: 12px 18px 11px;
  background-color: #ebeff5;
  border-bottom: 1px solid #e4e8ec;

  &:hover {
    background-color: #d4d7dc99;
  }
}

.avatar {
  float: left;
  width: 40px;
  height: 40px;
  margin-right: 10px;

  &-img {
    border-radius: 2px;
    background-color: #4da6fa;
  }
}

.info {
  height: 40px;
  line-height: 20px;
  word-wrap: normal;
  white-space: nowrap;

  .nickname {
    margin: 0;
    font-size: 16px;
    font-weight: 400;
    color: rgb(0, 0, 0);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .msg {
    margin: 0;
    font-size: 13px;
    color: rgb(140, 141, 143);
    overflow: hidden;
    text-overflow: ellipsis;

    .at-me {
      color: red;
    }
  }
}

.extra {
  float: right;
  height: 40px;
  // width: 40px;
  font-size: 12px;
  text-align: right;
  color: rgb(140, 141, 143);

  .attr {
    height: 20px;
    margin: 0;
  }
}
</style>
