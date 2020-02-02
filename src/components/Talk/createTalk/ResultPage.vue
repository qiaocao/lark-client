<template>
  <a-spin :spinning="loading">
    <!-- <div style="margin: 40px auto 0;"> -->
    <div class="result-page">
      <result
        title="等待审批"
        :is-success="true"
        description
        style="max-width: 560px;"
        v-if="isCreated"
      >
        <div class="information">
          <a-row>
            <a-col :sm="8" :xs="24">群组名称：</a-col>
            <a-col :sm="16" :xs="24">{{ groupInfo.groupName }}</a-col>
          </a-row>
          <a-row>
            <a-col :sm="8" :xs="24">群组密级：</a-col>
            <a-col :sm="16" :xs="24">{{ groupInfo.levels | fileSecret }}</a-col>
          </a-row>
        </div>
      </result>
      <div class="group-info-container" v-show="!isCreated">
        <div class="group-info">
          <div class="info-item">
            <p class="attr">群组名称：</p>
            <p class="val">{{ requsetData.groupName }}</p>
          </div>
          <div class="info-item">
            <p class="attr">群组密级：</p>
            <p class="val">{{ requsetData.levels | fileSecret }}</p>
          </div>
          <div class="info-item">
            <p class="attr">所属项目：</p>
            <p class="val">{{ requsetData.pname }}</p>
          </div>
          <div class="info-item">
            <p class="attr">群组类型：</p>
            <p class="val">{{ typeList.get(requsetData.groupType) }}</p>
          </div>
          <div class="info-item">
            <p class="attr">参与范围：</p>
            <p class="val">{{ requsetData.scop }}</p>
          </div>
          <div class="info-item">
            <p class="attr">描述信息：</p>
            <p class="val">{{ requsetData.groupDescribe }}</p>
          </div>
        </div>

        <div class="user-list">
          <a-list size="small" bordered :dataSource="requsetData.userList">
            <a-list-item slot="renderItem" slot-scope="item">
              {{ item.userName }} - {{ getShortName(item.pathName) }}
            </a-list-item>
            <div slot="header">成员列表：</div>
          </a-list>
        </div>
        <div class="approver-list">
          <a-list size="small" bordered :dataSource="requsetData.approveList">
            <a-list-item slot="renderItem" slot-scope="item">
              {{ item.userName }} - {{ getShortName(item.pathName) }}
            </a-list-item>
            <div slot="header">审批人列表：</div>
          </a-list>
        </div>
      </div>
    </div>

    <div class="operation">
      <a-button v-if="!isCreated" @click="prevStep">上一步</a-button>
      <!-- 创建 或者 关闭 -->
      <a-button
        :type="isCreated ? 'danger' : 'primary'"
        @click="createGroup"
        style="margin-left: 8px"
      >{{ isCreated ? '关闭' : '创建' }}</a-button>
    </div>
  </a-spin>
</template>

<script>
import { mapGetters } from 'vuex'
import { createTalkApproval } from '@/api/talk'
import { Result } from '@/components'

export default {
  name: 'ResultPage',
  components: {
    Result
  },
  props: {
    groupInfo: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'userId',
      'userSecretLevel',
      'avatar',
      'nickname',
      'userPId'
    ])
  },
  data () {
    return {
      loading: false,
      typeList: Object.freeze(new Map([
        [0, '部门内'],
        [1, '跨部门'],
        [2, '跨单位']
      ])),
      // 标识是否已经创建
      isCreated: false,
      // 请求的数据
      requsetData: {}
    }
  },
  created () {
    this.formateData()
  },
  methods: {
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
    },
    formateData () {
      // 处理审批人
      const approvers = this.groupInfo.approveList.map(item => {
        const newItem = {}
        newItem.img = item.avatar
        newItem.userId = item.id
        newItem.userName = item.name
        newItem.userNo = item.pId
        newItem.userLevels = JSON.parse(item.secretLevel)
        newItem.pathName = item.pathName
        return newItem
      })
      // 处理成员列表
      const members = this.groupInfo.userListRaw.map(item => {
        const newItem = {}
        const { id, secretLevel, img, name, pid, pathName } = item
        newItem.userId = id
        newItem.userLevels = secretLevel
        newItem.img = img || ''
        newItem.userName = name
        newItem.userNo = pid
        newItem.pathName = pathName
        return newItem
      })
      members.push({
        userId: this.userId,
        userLevels: this.userSecretLevel,
        img: this.avatar,
        userName: this.nickname,
        userNo: this.userPId
      })
      Object.assign(
        this.requsetData,
        this.groupInfo,
        { approveList: approvers },
        { userList: members }
      )
    },
    /**
     * 创建群组
     */
    createGroup () {
      if (this.isCreated) {
        this.close()
        return
      }
      this.loading = true
      // 发送创建群组的请求
      const postData = {
        code: 3,
        data: this.requsetData
      }
      createTalkApproval(postData).then(res => {
        if (res.status === 200 && res.rel) {
          this.isCreated = true
        } else {
          this.$notification.warn({
            message: '申请提交失败，请稍后再试'
          })
        }
      }).catch(() => {
        this.$notification.warn({
          message: '申请提交失败，请稍后再试'
        })
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 再次创建
     */
    prevStep () {
      this.$emit('prevStep')
    },
    /**
     * 开始研讨
     */
    toTalk () {
      this.$emit('toTalk')
    },
    /**
     * 关闭创建群组模态框
     */
    close () {
      this.$emit('close')
    }
  }
}
</script>
<style lang="less" scoped>
  .result-page {
    margin: 0 auto;
    width: 72%;
    max-height: 420px;
    overflow-y: auto;

    .group-info {
      margin-top: 16px;
      background: #fafafa;
      border-radius: 3px;
      padding: 8px 16px;
      .info-item {
        display: flex;
        .attr {
          width: 80px;
          min-width: 80px;
          color: rgba(153, 153, 153, 1);
        }
        .val {
          color: black;
        }
      }
    }

    .user-list {
      margin-top: 16px;
    }

    .approver-list {
      margin-top: 16px;
    }
  }
  .operation {
    margin: 8px 0;
    text-align: center;
  }

</style>
