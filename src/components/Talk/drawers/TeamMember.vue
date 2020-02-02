<template>
  <div>
    <a-row>
      <a-col>
        <a-input-search
          placeholder="输入要搜索内容"
          @search="onSearch"
          enterButton
          type="text"
          v-model="searchVal"
          style="margin-bottom: 20px;width: 100%"
        />
        <a-button style="margin-left:16px" icon="edit" v-if="false" @click="addMember">编辑成员</a-button>
      </a-col>
    </a-row>
    <user-model ref="model" :operations="['添加']" @ok="handleSaveOk"/>
    <div class="member-frame">
      <a-spin :spinning="loading" tip="加载中···">
        <div v-for="(item, index) in userList" :key="item.id+index" class="member-card">
          <person-card
            :userId="item.id"
          >
            <a-avatar
              shape="square"
              :src="getAvartarSrc(item.avatar)"
              :size="40"
              :class="['team-member-avatar', getOnlineStatus(item.id) ? 'on-line-tag' : '']"
              style="float:left"
            >
              <span>{{ item.name.substr(0, 4) }}</span>
            </a-avatar>
            <div class="info">
              <div class="nickname">{{ item.name }}</div>
              <div class="msg">{{ item.secretLevel | peopleSecret }}</div>
            </div>
          </person-card>
        </div>
      </a-spin>
    </div>
  </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getGroupMembersPage, addMember, removeMember } from '@/api/talk.js'
import UserModel from '@/components/admin/UserTransferModel'
import { Ellipsis } from '@/components'
import { FILE_SERVER_IP } from '@/utils/constants'
import PersonCard from '@/components/card/card'

export default {
  name: 'TeamMember',
  components: {
    UserModel,
    Ellipsis,
    PersonCard
  },
  mounted () {
    this.loadData()
  },
  computed: {
    ...mapGetters(['userPId', 'isGroupOwner', 'currentTalk', 'getOnlineStatus'])
  },
  data () {
    return {
      searchVal: '',
      // 数据加载样式
      loading: false,
      userList: [],
      // 初始信息
      userList_org: [],
      secretListMap: new Map([
        [60, [60, 70, 80, 90]],
        [40, [40, 50, 60, 70, 80, 90]],
        [30, [30, 40, 50, 60, 70, 80, 90]]
      ])
    }
  },
  methods: {
    /**
     * 搜索
     */
    onSearch () {
      if (this.searchVal) {
        this.userList = this.userList_org.filter(item => item.name.indexOf(this.searchVal) > -1)
      } else {
        this.userList = this.userList_org
      }
    },
    loadData () {
      this.loading = true
      const params = {}
      params.groupId = this.currentTalk.id
      getGroupMembersPage(params).then(res => {
        this.userList_org = res.result.data
        this.userList = this.userList_org
        if (this.searchVal) {
          this.onSearch()
        }
        this.loading = false
      })
    },
    /**
     * 分页
     */
    handleTableChange (page, pageSize) {
      this.onSearch({
        pageSize: pageSize,
        pageNo: page
      })
    },
    /**
     * 退出群组
     */
    removeMember (record) {
      const _this = this
      this.$confirm({
        title: '警告',
        content: `请确认是否将${record.name}退出群组?`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          _this.loading = true
          return removeMember(
            { 'groupId': _this.currentTalk.id, 'type': '2', 'userList': [{ 'id': record.id }] }
          ).then(
            res => {
              if (res.status === 200) {
                _this.$notification['success']({
                  message: '操作成功',
                  duration: 2
                })
                _this.loadData()
              } else {
                _this.$notification['error']({
                  message: res.message,
                  duration: 4
                })
              }
            }
          ).catch(() =>
            _this.$notification['error']({
              message: '出现异常，请联系系统管理员',
              duration: 4
            })
          ).finally(() => {
            _this.loading = false
          })
        },
        onCancel: () => {
          _this.$notification['info']({
            message: '取消操作',
            duration: 4
          })
        }
      })
    },
    /**
     * 新增成员
     */
    addMember () {
      this.$refs.model.begin(this.userList, {
        secretLevels: this.secretListMap.get(this.currentTalk.secretLevel).join(),
        exPid: this.userPId
      })
    },
    /**
     * 新增成员确认
     */
    handleSaveOk (users, userids) {
      this.loading = true
      addMember({
        'groupId': this.currentTalk.id,
        'type': '1',
        'userList': users
      }).then(
        res => {
          if (res.status === 200 && res.rel) {
            this.$notification['success']({
              message: res.message,
              duration: 2
            })
            this.loadData()
          } else {
            this.$notification['error']({
              message: res.message,
              duration: 4
            })
          }
        }
      ).catch(() =>
        this.$notification['error']({
          message: '出现异常，请联系系统管理员',
          duration: 4
        }).finally(() => {
          this.loading = false
        })
      )
    },
    /**
     * 获取头像地址
     */
    getAvartarSrc (src) {
      return FILE_SERVER_IP + src
    }
  }
}
</script>
<style lang="less" scoped>
.pageStyle {
  margin-top: 10px;
  margin-left: 350px;
}
.member-frame {
  padding: 3px;
}
.member-card {
  height: 60px;
  width: 120px;
  // border: 1px solid #f7f0f0;
  float: left;
}
.info {
  height: 40px;
  line-height: 20px;
  word-wrap: normal;
  white-space: nowrap;
  float: left;

  .nickname {
    margin-left: 3px;
    font-size: 14px;
    font-weight: 400;
    color: rgb(0, 0, 0);
    overflow: hidden;
    text-overflow: ellipsis;
    width:60px;
  }
  .msg {
    margin-left: 3px;
    font-size: 12px;
    color: rgb(140, 141, 143);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
