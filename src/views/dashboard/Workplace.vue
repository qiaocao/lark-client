<template>
  <div class="card-container">
    <img src="/refresh.png" @click="refresh()" style="position:absolute;top:6px;right:10px;height:30px;width:30px;z-index:99999"/>
    <a-tabs type="card" size="small" :tabBarStyle="tabBarStyle">
      <a-tab-pane tab="工作看板" key="1" class="tab-pane-style">
        <div>
          <a-spin tip="加载中,请稍候..." v-if="loading" style="z-index:200;">
            <div class="spin-content">
            </div>
          </a-spin>
          <div class="antd-pro-pages-dashboard-analysis-twoColLayout" :class="isDesktop() ? 'desktop' : ''">
            <grid-layout
              :layout.sync="cardList"
              :col-num="2"
              :row-height="61"
              :max-rows="12"
              :is-draggable="true"
              :is-resizable="false"
              :is-mirrored="false"
              :vertical-compact="true"
              :margin="[10, 10]"
              :use-css-transforms="true"
            >
              <grid-item
                v-for="grid in cardList"
                dragAllowFrom=".ant-card-head"
                :minH="cardSize.minH"
                :maxH="cardSize.maxH"
                :minW="cardSize.minW"
                :key="grid.id"
                :x="grid.x"
                :y="grid.y"
                :w="1"
                :h="5"
                :i="grid.i"
                :vertical-compact="true"
                @moved="moved"
              >
                <l-card :cardData="grid" :unRequstType="config" :refreshTag="refreshTag" @refreshCard="refreshCard" @loadingDone="loadingDone">
                </l-card>
              </grid-item>
            </grid-layout>
          </div>

          <div v-if="cardList.length===0&&!loading">
            <div class="exception">
              <div class="img">
                <img src="/images/exceptionImg/500.svg"/>
              </div>
              <div class="content">
                <div class="desc">温馨提示：在账户设置/卡片设置中，可维护常用卡片</div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane tab="日历" key="2" class="tab-pane-style">
        <a-calendar />
      </a-tab-pane>
      <!-- <a-tab-pane tab="数据看板" key="3" class="tab-pane-style">
      </a-tab-pane> -->
    </a-tabs>
    <!--这个地方放置最近访问-->
    <footer-tool-bar
      :style="{
        'background-color': '#f9f9f9',
        height:'80px',
        width: footerBarWidth
      }"
    >
      <a-row>
        <a-col :span="22" style="overflow: auto;">
          <div class="tool-list" :style="{ 'width': toolWidth }">
            <div class="tool-item" v-for="(item, i) in toolList" :key="i">
              <a-dropdown v-if="item.type === '1'">
                <div class="ant-dropdown-link">
                  <a-avatar
                    :style="{backgroundColor: colorList[i % 6], cursor: 'pointer'}"
                    :size="40"
                    shape="square"
                    @click="openExlink(item.uri)"
                  >
                    {{ item.title.slice(0, 2) }}
                  </a-avatar>
                  <div class="tool-name">{{ item.title }}</div>
                </div>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a style="padding:5px;color:#F44336;" @click="deleteTool(item)"><a-icon type="delete" />删除</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
              <div v-else>
                <a-tooltip :title="item.title">
                  <a-avatar
                    :style="{backgroundColor: colorList[i % 6], cursor: 'pointer'}"
                    :size="40"
                    shape="square"
                    @click="openExlink(item.uri)"
                  >
                    {{ item.title.slice(0, 2) }}
                  </a-avatar>
                </a-tooltip>
                <div class="tool-name">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :span="2">
          <a-tooltip title="创建个人常用链接">
            <img src="/images/foot/add-a-subscription.svg" class="addBtn" @click="createMyTool()"/>
          </a-tooltip>
        </a-col>
      </a-row>
    </footer-tool-bar>
    <a-modal
      title="创建个人常用链接"
      style="top: 100px;"
      v-model="visiable"
      @ok="saveTool"
    >
      <a-form :form="form">
        <a-form-item label="链接名称" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
          <a-input
            v-decorator="['name', { rules: [{ required: true, message: '请填写名称!' }, { max: 50 , message: '最多填写50字'}] }]"
          />
        </a-form-item>
        <a-form-item label="链接地址" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
          <a-input
            v-decorator="['url', { rules: [{ required: true, message: '请填写链接地址!' }, { max: 50 , message: '最多填写50字'}] }]"
          >
            <a-select slot="addonBefore" v-model="http" style="width: 90px">
              <a-select-option value="http://">http://</a-select-option>
              <a-select-option value="https://">https://</a-select-option>
            </a-select>
            <a-select slot="addonAfter" v-model="com" style="width: 60px">
              <a-select-option value=".com">.com</a-select-option>
              <a-select-option value=".jp">.jp</a-select-option>
              <a-select-option value=".cn">.cn</a-select-option>
              <a-select-option value=".org">.org</a-select-option>
              <a-select-option value="/">/</a-select-option>
            </a-select>
          </a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { mixin, mixinDevice } from '@/utils/mixin'
import FooterToolBar from '@/components/FooterToolbar/FooterToolBar'
import VueGridLayout from 'vue-grid-layout'
import LCard from '@/views/dashboard/Card'
import { getMyselfTool, getMyselfCard, moveMyselfCard } from '@/api/workplace'
import { mapGetters } from 'vuex'
var STORAGE_KEY = 'tools-vuejs-2.0'
var toolsStorage = {
  fetch: function () {
    var tools = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    tools.forEach(function (tool, index) {
      tool.id = index
    })
    toolsStorage.uid = tools.length
    return tools
  },
  save: function (tool) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tool))
  }
}
export default {
  name: 'Monitor',
  mixins: [mixin, mixinDevice],
  data () {
    return {
      cardList: [],
      cardSize: { maxH: 5, minH: 5, maxW: 1, minW: 1 },
      // items: generateItems(50, i => ({ id: i, data: 'Draggable' + i }))
      is: [],
      ids: [],
      index: '',
      toolList: [],
      toolWidth: '300px',
      cardmap: new Map(),
      loading: true,
      cardLoad: [],
      // 不需要请求数据的卡片类型
      config: ['intro', 'local', 'activity'],
      colorList: [
        '#37af5c', '#801dae', '#ffbf00',
        '#f56a00', '#7265e6', '#00a2ae'
      ],
      tabBarStyle: { 'border-bottom': '0px solid #ffffff' },
      visiable: false,
      form: this.$form.createForm(this),
      myTools: toolsStorage.fetch(),
      refreshTag: 0,
      http: 'http://',
      com: '/'
    }
  },
  components: {
    LCard,
    FooterToolBar,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  computed: {
    ...mapGetters(['userPId']),
    footerBarWidth () {
      let distance = 0
      if (this.isMobile()) {
        distance = 0
      } else {
        distance = this.sidebarOpened ? 184 : 64
      }
      return this.isSideMenu() ? `calc(100% - ${distance}px)` : '100%'
    }
  },
  watch: {
    myTools: {
      handler: function (todos) {
        toolsStorage.save(todos)
      },
      deep: true
    }
  },
  created () {
    this.getSelfWorkplace()
    this.getSelfTools()
  },
  methods: {
    getSelfWorkplace () {
      getMyselfCard()
        .then(res => {
          this.cardList = []
          const dataTemp = res.result.data
          for (var i = 0; i < dataTemp.length; i++) {
            const temp = {}
            temp.id = dataTemp[i].id
            temp.x = 1 * parseInt((parseInt(dataTemp[i].i) + 1) % 2)
            temp.y = 5 * parseInt(dataTemp[i].i / 2)
            temp.w = 1
            temp.h = 5
            temp.i = dataTemp[i].i
            temp.type = dataTemp[i].type
            temp.title = dataTemp[i].title
            temp.url = dataTemp[i].url
            this.cardList.push(temp)
          }
          // 当常用卡片个数为0 或设置的卡片全部不需要请求后台数据时，加载样式关闭
          if (dataTemp.length === 0) {
            this.loading = false
          }
          let check = false
          check = this.config.some(item => {
            dataTemp.forEach(card => {
              if (item !== card.type) {
                return true
              }
            })
          })
          if (!check) {
            this.loading = false
          }
        })
    },
    /**
     * 获取个人常用工具栏信息 byfanjiao
     */
    getSelfTools () {
      getMyselfTool().then(res => {
        const tools = res.result.data
        this.myTools.forEach(function (item) {
          tools.push(item)
        })
        this.toolList = tools
        this.toolWidth = this.toolList.length * 75 + 'px'
      })
    },
    /**
     * 子组件点击移除卡片后触发 by fanjiao
     */
    refreshCard () {
      this.getSelfWorkplace()
    },
    /**
     * 子组件反馈数据加载完成
     * by fanjiao
     */
    loadingDone () {
      this.cardLoad.push(true)
      let length = 0
      this.cardList.forEach(item => {
        if (this.config.indexOf(item.type) === -1) {
          length++
        }
      })
      // 卡片数据全部加载完成后，'加载中'的样式关闭
      if (this.cardLoad.length === length) {
        this.loading = false
        this.cardLoad = []
        if (this.refreshTag > 0) {
          this.$notification['success']({
            message: '刷新成功',
            duration: 2
          })
        }
      }
    },
    /**
     * 移动完成后保存位置变化
     */
    moved (a, newX, newY) {
      moveMyselfCard(this.handleCardI()).then(res => {
      })
    },
    /**
     * 每次移动卡片都将卡片的位置全部重新获取
     */
    handleCardI () {
      let temp = ''
      this.cardList.forEach(item => {
        temp += ',' + item.id + ':' + (parseInt(item.y) / 5 * 2 + parseInt(item.x) + 1)
      })
      return temp.substring(1)
    },
    /**
     * 工具栏打开外部链接
     * by fanjiao
     */
    openExlink (uri) {
      var userParam = ''
      // 如果需要拼接用户信息，在这里添加 ?loginName=userPId
      if (uri.includes('10.11.24.131:8070/OneDoc')) {
        userParam = '?loginName=' + this.userPId
      }
      if (uri.includes('10.12.97.30:9093')) {
        userParam = '?userId=' + this.userPId
      }
      window.open(uri + userParam, '_blank')
    },
    /**
     * 创建个人常用链接
     */
    createMyTool () {
      setTimeout(() => {
        this.form.setFieldsValue({
          name: '',
          url: ''
        })
      }, 0)
      this.visiable = true
    },
    /**
     * 保存个人常用链接
     */
    saveTool () {
      this.form.validateFields((err, values) => {
        if (!err) {
          const item = {
            id: toolsStorage.uid++,
            title: values.name,
            uri: this.http + values.url + this.com,
            type: '1'
          }
          this.myTools.push(item)
          this.toolList.push(item)
          this.visiable = false
          this.toolWidth = this.toolList.length * 75 + 'px'
        }
      })
    },
    /**
     * 删除个人常用链接
     */
    deleteTool (tool) {
      this.myTools.splice(this.myTools.indexOf(tool), 1)
      this.toolList.splice(this.toolList.indexOf(tool), 1)
    },
    refresh () {
      this.refreshTag++
    }
  }
}
</script>
<style lang="less" scoped>
  .antd-pro-pages-dashboard-analysis-twoColLayout {
    position: relative;
    display: flex;
    display: block;
    flex-flow: row wrap;
    &.desktop div[class^=ant-col]:last-child {
      position: absolute;
      right: 0;
      height: 100%;
    }
  }

  .description{
    margin-top: 24px;
    color: gray;
    font-size: 14px;
    line-height: 22px;
    text-align: center;
  }
  .dropdown-container{
    position: relative;
    background: #fff;
    border: 0 solid transparent;
    border-radius: 4px;
    box-shadow: 0 2px 20px rgba(0,0,0,.1);
    .menu {
        border-radius: 4px;
        background: #fff;
        list-style: none;
        overflow: auto;
        margin: 0;
        padding: 4px 0;
        max-height: 400px;
        min-width: 200px;
        .menu-item {
            min-height: 36px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            cursor: pointer;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            font-size: 14px;
            color: #383838;
            box-sizing: border-box;
            padding: 8px 16px;
            word-break: break-all;
        }
    }
  }
.tool-list{
  .tool-item{
    width: 52px;
    margin-left: 12px;
    text-align:center;
    font-size:8px;
    text-overflow: ellipsis;
    float: left;
    .tool-name{
      overflow: hidden;/*超出部分隐藏*/
      white-space: nowrap;/*不换行*/
      text-overflow:ellipsis;/*超出部分文字以...显示*/
      margin-top:-26px;
      height: 40px;
    }
  }
}
.addBtn{
  width: 48px;
  margin-top: -1px;
  text-align:center;
  font-size:8px;
  text-overflow: ellipsis;
  float: right;
  cursor: 'pointer';
}
.exception {
  min-height: 500px;
  height: 80%;
  align-items: center;
  text-align: center;
  margin-top: 100px;
  .img {
    display: inline-block;
    padding-right: 52px;
    zoom: 1;
    img {
      height: 360px;
      max-width: 430px;
    }
  }
  .content {
    display: inline-block;
    flex: auto;
    .desc {
      color: rgba(0, 0, 0, .45);
      font-size: 20px;
      line-height: 28px;
      margin-bottom: 16px;
    }
  }
}
.img_arrow {
  margin-top: 10px;
  margin-right: 55px;
  align-items:end;
  text-align: end;
}
.spin-content{
  border: 1px solid #91d5ff;
  background-color: #e6f7ff;
  padding: 100%;
}
.card-container {
  background: url(/space.jpg);
  background-size: cover;
  // background-color:#cfecfd;
  // background: #F5F5F5;
  overflow: hidden;
  padding: 8px;
  height: 100%;
}
.card-container > .ant-tabs-card > .ant-tabs-content {
  height: 120px;
  margin-top: -16px;
}

.card-container > .ant-tabs-card > .ant-tabs-content > .ant-tabs-tabpane {
  background: rgba(255, 255, 255, 0.5);
  padding: 1px;
  // border-right:1px solid #e2e2e2;
  // border-left:1px solid #e2e2e2;
  // border-bottom:1px solid #e2e2e2;
}

.card-container > .ant-tabs-card > .ant-tabs-bar {
  border-color: #fff;
}

.card-container > .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  border-color: transparent;
  background: transparent;
}

.card-container > .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  border-color: #fff;
  background: #fff;
}

.tab-pane-style{
  height: calc(100vh - 120px);
  border-radius: 0 4px 4px 4px;
  border-top: 1px solid #f8f8f8;
  border-left: 1px solid #f8f8f8;
  border-right: 1px solid #f8f8f8;
  border-bottom: 1px solid #f8f8f8;
  background: rgba(255, 255, 255, 0.6);
  overflow: auto;
}
</style>
