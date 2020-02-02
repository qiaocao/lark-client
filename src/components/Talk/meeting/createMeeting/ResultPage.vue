<template>
  <a-spin :spinning="loading">
    <div class="result-page">
      <result
        v-if="isCreated"
        title="等待审批"
        :is-success="true"
        description
        style="max-width: 560px;"
      >
        <div class="information">
          <a-row>
            <a-col :sm="8" :xs="24">会议名称：</a-col>
            <a-col :sm="16" :xs="24">{{ info.groupName }}</a-col>
          </a-row>
          <a-row>
            <a-col :sm="8" :xs="24">会议密级：</a-col>
            <a-col :sm="16" :xs="24">{{ info.levels | fileSecret }}</a-col>
          </a-row>
        </div>
        <!-- <div v-if="status===1" slot="action">
          <a-button @click="createAgain">再次创建</a-button>
          <a-button @click="close" class="btn-margin-left">关闭</a-button>
        </div>
        <div v-if="status===2" slot="action">
          <a-button @click="sendRequest">再次发送请求</a-button>
          <a-button @click="prevStep" class="btn-margin-left">返回修改信息</a-button>
          <a-button @click="close" class="btn-margin-left">关闭</a-button>
        </div> -->
      </result>

      <div class="meeting-info-container" v-if="!isCreated">
        <div class="meeting-info">
          <div class="info-item">
            <p class="attr">会议名称：</p>
            <p class="val">{{ requsetData.groupName }}</p>
          </div>
          <div class="info-item">
            <p class="attr">会议密级：</p>
            <p class="val">{{ requsetData.levels | fileSecret }}</p>
          </div>
          <div class="info-item">
            <p class="attr">开始时间：</p>
            <p class="val">{{ requsetData.beginTime }}</p>
          </div>
          <div class="info-item">
            <p class="attr">结束时间：</p>
            <p class="val">{{ requsetData.endTime }}</p>
          </div>
          <div class="info-item">
            <p class="attr">成员范围：</p>
            <p class="val">{{ typeList.get(requsetData.groupType) }}</p>
          </div>
          <div class="info-item">
            <p class="attr">会议类型：</p>
            <p class="val">
              {{ meetingType.find(i => i.value === requsetData.cross).title }}
            </p>
          </div>
          <div class="info-item">
            <p class="attr">所属项目：</p>
            <p class="val">{{ requsetData.pname }}</p>
          </div>
          <div class="info-item">
            <p class="attr">组织部门：</p>
            <p class="val">{{ requsetData.org }}</p>
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
              {{ item.userName }} -
              {{ roleList.find(i => i.code === item.roleCode).name }} -
              {{ getShortName(item.pathName) }}
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
        @click="sendRequest"
        style="margin-left: 8px"
      >{{ isCreated ? '关闭' : '创建' }}</a-button>
    </div>
  </a-spin>
</template>

<script>
import { mapGetters } from 'vuex'
import { Result } from '@/components'
import { createMeeting } from '@/api/meeting'
import { format } from '@/utils/util'
import { TYPE_LIST } from '../modules/constance'

export default {
  name: 'ResultPage',
  components: {
    Result
  },
  props: {
    info: {
      type: Object,
      default: () => ({}),
      required: true
    },
    roleList: {
      type: Array,
      default: () => ([]),
      required: true
    }
  },
  data () {
    return {
      loading: false,
      isCreated: false,
      /* 1-成功 2-失败 */
      status: 1,
      typeList: Object.freeze(new Map([
        [0, '部门内'],
        [1, '跨部门'],
        [2, '跨单位']
      ])),
      requsetData: {},
      meetingType: TYPE_LIST
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created () {
    console.log(this.roleList)
    this.formateDate()
  },
  methods: {
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
    formateDate () {
      const approveList = this.formatApprover([...this.info.approveList])
      const userList = this.formatUser([...this.info.userList])
      const creatorInfo = this.addCreatorInfo()
      const data = { code: 901, data: { ...this.info } }
      // 格式化时间
      const beginTime = format(
        new Date(data.data.beginTime),
        'yyyy-MM-dd hh:mm:ss')
      const endTime = format(
        new Date(data.data.endTime),
        'yyyy-MM-dd hh:mm:ss')
      Object.assign(
        this.requsetData,
        this.info,
        creatorInfo,
        {
          approveList,
          userList,
          beginTime,
          endTime,
          sourceType: '1',
          tst: '1'
        }
      )
    },
    /**
     * 发送创建会议的请求
     */
    sendRequest () {
      if (this.isCreated) {
        this.close()
        return
      }
      this.loading = true
      const data = {
        code: 901,
        data: this.requsetData
      }
      console.log('发送创建请求', data)
      createMeeting(data).then(res => {
        if (res.status === 200 && res.rel) {
          // 请求成功
          this.isCreated = true
        } else {
          this.isCreated = false
          this.$notification.error({ message: res.result })
        }
      }).catch(() => {
        this.isCreated = false
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 处理会议议程数据格式
     * @param {Array} allProgress 议程列表
     * @returns {String} 议程逗号分割
     */
    formatProcess (allProgress) {
      const aryProcess = allProgress.map(item => {
        return item.code
      })
      const strProcess = aryProcess.join()
      return strProcess
    },
    /**
     * 处理成员列表数据
     */
    formatUser (userList) {
      userList.push({ ...this.userInfo, roleCode: this.info.creatorRole })
      const strUserList = JSON.stringify(userList)
        .replace(/"avatar"/g, '"img"')
        .replace(/"secretLevel"/g, '"userLevels"')
        .replace(/"id"/g, '"userId"')
        .replace(/"name"/g, '"userName"')
        .replace(/"pid"/g, '"userNo"')
      const aryUserList = JSON.parse(strUserList)
      return aryUserList
    },
    /**
     * 处理审批人列表数据
     */
    formatApprover (approverList) {
      const strApprover = JSON.stringify(approverList)
        .replace(/"avatar"/g, '"img"')
        .replace(/"secretLevel"/g, '"userLevels"')
        .replace(/"id"/g, '"userId"')
        .replace(/"name"/g, '"userName"')
        .replace(/"pId"/g, '"userNo"')
      const aryApprover = JSON.parse(strApprover)
      return aryApprover
    },
    /**
     * 增加创建人信息
     */
    addCreatorInfo () {
      const { id, name } = this.userInfo
      return {
        creator: id,
        creatorName: name,
        updator: id
        // org: orgCode
      }
    },
    /**
     * 再次创建
     */
    createAgain () {
      this.$emit('nextStep')
    },
    /**
     * 关闭创建模态框
     */
    close () {
      this.$emit('close')
    },
    /**
     * 返回修改会议信息
     */
    prevStep () {
      this.$emit('prevStep')
    }
  }
}
</script>

<style lang="less" scoped>
  .btn-margin-left {
    margin-left: 8px;
  }

  .result-page {
    margin: 0 auto;
    width: 72%;
    max-height: 420px;
    overflow-y: auto;

    .meeting-info {
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
