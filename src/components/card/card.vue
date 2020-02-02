<!--
组件使用指南
组件功能：个人信息名片

使用方法：
        引用组件： import PersonCard from '@/components/card/card'
        <person-card
          :isMe="isMe()" --非必填项
          :userId="messageInfo.fromId" --人员id必填项
        >
          插槽，鼠标点击位置（弹出气泡卡片）
        </person-card>
-->
<template>
  <div>
    <a-popover :placement="placement" trigger="click" @click="getData">
      <template slot="content">
        <!-- 加载中状态 -->
        <a-spin :spinning="loadingState" tip="加载中···">
          <div class="card-body">
            <table class="base-info">
              <tr>
                <td class="name"><span>{{ contactsInfo.name }}</span><img :src="imgsrc" class="png"/></td>
                <td rowspan="2">
                  <a-avatar
                    shape="square"
                    :src="avatarUrl"
                    :size="65"
                  >
                    <span>{{ contactsInfo.name }}</span>
                  </a-avatar>
                </td>
              </tr>
              <tr>
                <td><font color="#8c8c8c">{{ contactsInfo.secretLevel | peopleSecret }}</font></td>
              </tr>
            </table>
            <a-divider />
            <table class="detail-info">
              <tr>
                <td>单位</td>
                <td>
                  <a-tooltip placement="right">
                    <template slot="title">
                      {{ contactsInfo.orgName }}
                    </template>
                    <div class="ellipsis">{{ contactsInfo.orgName }}</div>
                  </a-tooltip>
                </td>
              </tr>
              <tr>
                <td>电话</td>
                <td>{{ contactsInfo.otel }}</td>
              </tr>
            </table>
            <div class="message" title="发消息"><a-icon type="message" class="message-icon" @click="sendMessage"/></div>
          </div>
        </a-spin>
      </template>
      <slot></slot>
    </a-popover>
  </div>
</template>
<script>
import { getContactsInfo } from '@/api/talk'
import { FILE_SERVER_IP } from '@/utils/constants'
export default {
  name: 'Card',
  props: {
    isMe: {
      type: Boolean,
      default: false,
      required: false
    },
    userId: {
      type: String,
      required: true
    }
  },
  computed: {
    avatarUrl () {
      return FILE_SERVER_IP + this.contactsInfo.avatar
    }
  },
  data () {
    return {
      /** 名片显示位置 */
      placement: this.isMe ? 'leftTop' : 'rightTop',
      /** 联系人信息 */
      contactsInfo: {},
      /** 加载状态 */
      loadingState: false,
      imgsrc: ''
    }
  },
  methods: {
    /** 通过id获取联系人信息 */
    getData () {
      [ this.contactsInfo, this.loadingState ] = [ {}, true ]

      getContactsInfo(this.userId).then(res => {
        if (res.status === 200) {
          this.contactsInfo = res.result
          if (this.contactsInfo.gender === '1') {
            this.imgsrc = '/people/man.png'
          } else {
            this.imgsrc = '/people/woman.png'
          }
        }

        this.loadingState = false
      }, () => {
        this.loadingState = false
      })
    },
    /** 跳转到研讨页 */
    sendMessage () {
      this.$emit('clickSend')
      const contactItem = this.contactsInfo
      contactItem.groupOwnerId = ''
      contactItem.reOrder = true
      contactItem.addUnread = false
      this.$store.dispatch('UpdateRecentContacts', contactItem)
        .then(() => {
          this.$store.commit('SET_CURRENT_TALK', contactItem.id)
        })
    }
  }
}
</script>
<style lang="less" scoped>
.card-body {
  padding: 28px;
  width: 280px;
  height: 300px;
}
.base-info {
  justify-content: center;
}
.name {
  font-size: 20px;
  width:150px;
  font-weight: 400;
  color: black;
  .png {
    width:20px;
    height:20px;
    margin: 0px 0px 5px 5px;
  }
}
.detail-info {
  table-layout: fixed;
  width:200px;
  td {
    &:first-child{
      width:50px;
      height:30px;
    }
  }
  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.message {
  text-align: center;
  .message-icon {
    font-size:35px;
    margin-top:35px;
    color:#8c8c8c
  }
}
.loading-tip {
  position: absolute;
  margin-top: 20%;
  z-index: 100;
}
</style>
