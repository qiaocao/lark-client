<template>
  <div :class="contactsItemClasses" @click="handleClick" :key="contactsInfo.key">
    <div class="avatar">
      <a-avatar
        :class="['avatar-img', TogetOnlineStatus ? 'on-line-tag' : '']"
        shape="square"
        :src="avatarUrl"
        :size="30"
      >{{ contactsInfo.name.substr(0, 2) }}</a-avatar>
    </div>
    <div class="info">
      <div class="nickname">{{ contactsInfo.name }}</div>

      <a-tooltip :title="contactsInfo.orgName">
        <div class="orgname">{{ getShortName(contactsInfo.orgName) }}</div>
      </a-tooltip>

    </div>
    <!-- <div class="extra">
      <p class="attr on-line">
        <a-icon type="check-circle" theme="filled" />
      </p>
    </div> -->
  </div>
</template>

<script>
import { FILE_SERVER_IP } from '@/utils/constants'

export default {
  name: 'ContactsItem',
  props: {
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
    TogetOnlineStatus () {
      if (this.contactsInfo.isGroup) {
        return false
      } else {
        return this.$store.getters.getOnlineStatus(this.contactsInfo.id)
      }
    },
    contactsItemClasses () {
      return {
        'contacts-item': true,
        activated: this.activated
      }
    },
    avatarUrl () {
      return FILE_SERVER_IP + this.contactsInfo.avatar
    }
  },
  methods: {
    handleClick () {
      this.$emit('select', this.contactsInfo)
    },
    /**
     * 对组织机构名称做裁剪
     */
    getShortName (value) {
      if (value) {
        const name = value.split('/').filter(x => x)
        if (name.length !== 0) {
          return name.reduce((a, c) => c + '/' + a)
        } else {
          return ''
        }
      }
      return name
    }
  }
}
</script>

<style lang="less" scoped>
.activated {
  background-color: #d3d6dc !important;
}
.on-line {
  color: #82cc92;
}
.contacts-item {
  width: 100%;
  height: 50px;
  min-height: 50px;
  max-height: 50px;
  cursor: pointer;
  overflow: hidden;
  padding: 10px 18px 9px;
  background-color: #ebeff5;
  border-bottom: 1px solid #e4e8ec;
  display: flex;

  &:hover {
    background-color: #d3d6dc99;
  }
}

.avatar {
  width: 30px;
  height: 30px;
  margin-right: 10px;

  &-img {
    border-radius: 2px;
    background-color: #4da6fa;
    span {
      color: #fff;
    }
  }
}

.info {
  height: 30px;
  line-height: 30px;
  white-space: nowrap;
  overflow: hidden;
  display: flex;

  .nickname {
    margin: 0;
    font-size: 16px;
    font-weight: 400;
    color: rgb(0, 0, 0);
  }
  .orgname {
    margin-left: 10px;
    font-size: 13px;
    color: #747477;
    overflow: hidden;
    text-overflow: ellipsis;
  }

}

.extra {
  margin-left: auto;
  height: 30px;
  width: 30px;
  font-size: 12px;
  text-align: right;
  color: rgb(140, 141, 143);

  .attr {
    height: 30px;
    line-height: 30px;
    margin: 0;
  }
}
</style>
