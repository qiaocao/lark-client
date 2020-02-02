<template>
  <div id="m_grabble" ref="box" >
    <a-input-search
      placeholder="输入要搜索内容"
      @search="onSearch"
      enterButton
      type="text"
      v-model="searchVal"
      style="margin-bottom: 20px"
    />
    <ul class="history_box">
      <li v-for="(item, index) in items" class="history_cotent" :key="item.id" :value="item.value">
        <div class="borderDiv">
          <a-avatar class="content_l" shape="square" size="large" :src="fileServerIp + item.avatar" >{{ item.username }}</a-avatar>
          <div class="content_r">
            <h3 class="user_name">{{ item.username }}</h3>
            <div class="content" v-if="item.content.type == 1" @click="isCurrent(index)" :class="{'current':activeIndex != index}" v-html="item.content.title"></div>
            <dir v-else-if="item.content.type == 3" class="content_file">
              <a-icon class="content_icon" type="file"/>
              <a-tooltip :title="item.content.title">
                <h3 class="content_h3" style=" width: 100px,  padding:0">{{ item.content.title }}</h3>
              </a-tooltip>
            </dir>
            <img v-else-if="item.content.type == 2" :src="imgPrevie(item.content.id)" alt="图片加载失败" class="content_img">
          </div>
          <div class="history_right">
            <span>{{ item.sendTimeShort }}</span>
            <div class="secret" style="margin: 6px 0 0 20px">
              <a-tag color="orange" v-if="item.content.secretLevel == '40'">秘密</a-tag>
              <a-tag color="tomato" v-if="item.content.secretLevel == '60'">机密</a-tag>
              <a-tag color="" v-if="item.content.secretLevel == '30'">非密</a-tag>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <a-button v-if="isShow" @click="getHistory" style="margin: auto; display: block;"> 加载失败，点击重试</a-button>
    <div v-if="loading" class="example">
      <a-spin />
    </div>
    <div v-if="noMessage" class="login_img">
      没有更多信息...
    </div>
  </div>
</template>
<script>
import { talkHistoryAll } from '@/api/talk.js'
import api from '@/api/talk'
import { FILE_SERVER_IP } from '@/utils/constants'
import { mapGetters } from 'vuex'
export default {
  name: 'Rabble',
  directives: { scroll },
  data () {
    return {
      searchVal: '',
      items: [],
      flag: true,
      activeOption: '',
      userId: '',
      page: 1,
      isShow: false,
      // 数据加载样式
      loading: false,
      // 没有更多信息提醒
      noMessage: false,
      // 鼠标点击活动行
      activeIndex: '9999',
      fileServerIp: FILE_SERVER_IP
    }
  },
  computed: {
    ...mapGetters(['currentTalk'])
  },
  created () {
    this.activeOption = 'talkHistory'
    this.getHistory()
  },
  mounted () {
    // 滚动条事件监听
    window.addEventListener('scroll', (this.lazyLoading), true)
  },
  methods: {
    // 图片预览地址
    imgPrevie (id) {
      return api.imgPrevie + '?fileId=' + id
    },
    /**
     * 检索
     */
    onSearch (value) {
      this.page = 1
      this.items = []
      this.getHistory()
    },
    /**
     * 行点击事件，查看完整聊天内容
     */
    isCurrent (index) {
      this.activeIndex = index
    },
    // 异常提醒
    openNotification () {
      this.$notification.warning({
        message: '无法获取聊天内容，稍后再试',
        description: ''
      })
    },
    /**
     * 查询历史聊天记录
     */
    getHistory () {
      this.loading = true
      this.userId = this.$store.getters.userId
      talkHistoryAll(this.userId, this.currentTalk.isGroup, this.currentTalk.id, this.searchVal, this.page).then(data => {
        this.isShow = false
        const datas = data.result.data
        if (datas.length < 30) {
          this.loading = false
          this.noMessage = true
        }
        datas.map((item) => {
          this.items.push(item)
        })
      }).catch(res => {
        this.isShow = true
        this.openNotification()
        this.loading = false
      })
    },
    // 滚动获取数据
    lazyLoading () {
      if (this.$refs.box) {
        const scrollTop = this.$refs.box.scrollTop
        const clientHeight = this.$refs.box.clientHeight
        const scrollHeight = this.$refs.box.scrollHeight
        if (scrollTop + clientHeight + 10 >= scrollHeight) {
          this.$nextTick(() => {
            this.page++
            if (this.activeOption === 'talkHistory') {
              talkHistoryAll(this.userId, this.currentTalk.isGroup, this.currentTalk.id, this.searchVal, this.page).then(data => {
                const datas = data.result.data
                if (datas.length < 30) {
                  this.loading = false
                  this.noMessage = true
                }
                datas.map((item, index, array) => {
                  this.items.push(item)
                })
              }).catch((res) => {
                this.isShow = true
                this.openNotification()
              })
            }
          })
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.current {
  display: -webkit-box;
  word-break: break-all;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  user-select: none;
  font-size: 20px;
}
.history_cotent {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  .borderDiv{
    border-bottom: 1px solid #f7f0f0;
  }
  .content_l {
    width: 40px;
    height: 40px;
    background-size: 30px 30px;
    position: absolute;
    top: 10px;
    left: 0;
    line-height: 40px;
    font-size: 10px;
    background: #00a2ae;
    color: white;
    text-align: center
  }
  .content_r {
    display: inline-block;
    margin-left: 50px;
    box-sizing: border-box;
    .user_name {
      margin-bottom: 0;
      padding-top: 7px;
      padding-bottom: 4px;
      width: 150px;
    }
    .content {
      width: 280px;
      color: rgb(133, 133, 134);
      font-size: 13px;
    }
    p {
      border-radius: 5px;
      cursor: pointer;
    }
  }
  .history_right {
    float: right;
    overflow: hidden;
    position: absolute;
    top: 0;
    right: 0;
    span {
      display: block;
      padding-top: 6px;
      float: left;
    }
    .secret {
      float: right;
    }
  }
}
.history_box{
  padding:0;
  margin-bottom: 35px
}
.down{
  margin: 10px 10px 0 0;
  position: absolute;
  bottom: 10px;
  right: 0;
  height: 20px
}
.content_img{
  max-width: 285px;
  max-height: 285px;
  min-height: 50px;
  margin-bottom: 10px
}
.content_file{
  width: 180px;
  padding: 0;
  border: 1px solid #cccccc;
  border-radius: 8px;
  position: relative;
  .content_icon{
    display: inline-block;
    width: 50px;
    height: 50px;
    font-size: 30px;
    line-height: 50px
  }
  .content_h3{
    display: inline-block;
    position: absolute;
    top: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100px
  }
  .dow_height{
    height: 15px
  }
}
.login_img{
  text-align: center;
  color: #cccccc;
  margin-bottom: 20px
}
#m_grabble{
  overflow: auto;
  width: 105%;
  margin-right: 24px;
  height: 100%;
  height: calc(85vh);
}
.example {
    text-align: center;
    border-radius: 4px;
    margin: 10px 0 20px 0;
  }
</style>
