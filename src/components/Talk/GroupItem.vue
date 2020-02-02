<template>
  <!-- groups item -->
  <div :class="groupItemClasses" @click="handleClick" :key="groupInfo.id">
    <div class="avatar">
      <a-avatar
        class="avatar-img"
        shape="square"
        :src="avatarUrl"
        :size="30"
        icon="team"
      >{{ groupInfo.groupName.substr(0, 2) }}</a-avatar>
    </div>

    <div class="extra">
      <p class="attr on-line">
        <!-- <a-icon type="check-circle" theme="filled" /> -->
      </p>
    </div>

    <div class="info">
      <p class="nickname">
        <span :class="'s-' + groupInfo.levels">
          [{{ groupInfo.levels | fileSecret }}]
        </span>
        {{ groupInfo.groupName }}
      </p>
    </div>
  </div>
</template>

<script>
import { FILE_SERVER_IP } from '@/utils/constants'

export default {
  name: 'GroupItem',
  props: {
    /**
     * 群组信息数据结构
     * groupInfo = {
     *  id: 唯一标识符 String
     *  name: 群组名称 String
     *  avatar: 头像 String
     *  其他需要的信息
     * }
     */
    groupInfo: {
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
    groupItemClasses () {
      return {
        'group-item': true,
        activated: this.activated
      }
    },
    avatarUrl () {
      return FILE_SERVER_IP + this.groupInfo.groupImg
    }
  },
  methods: {
    handleClick () {
      this.$emit('select', this.groupInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.activated {
  background-color: #d3d6dc !important;
}
.on-line {
  color: rgba(43, 162, 69, 1);
}
.group-item {
  width: 100%;
  height: 50px;
  min-height: 50px;
  max-height: 50px;
  cursor: pointer;
  overflow: hidden;
  padding: 10px 18px 9px;
  background-color: #ebeff5;
  border-bottom: 1px solid #e4e8ec;

  &:hover {
    background-color: #d3d6dc99;
  }
}

.avatar {
  float: left;
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
}

.extra {
  float: right;
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
