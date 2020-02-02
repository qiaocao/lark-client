<template>
  <div>
    <a-card
      :loading="loading"
      :headStyle="headStyle"
      :bodyStyle="bodyStyle"
      :bordered="true"
      :title="content.title"
      :style="{ minHeight: '350px', borderRadius: '4px' }">
      <a-dropdown :trigger="['click']" placement="bottomLeft" slot="extra">
        <a class="ant-dropdown-link" href="#">
          <a-icon type="ellipsis" />
        </a>
        <a-menu slot="overlay">
          <a-menu-item>
            <a href="javascript:;" @click="removeCard(content.id)">移除卡片</a>
          </a-menu-item>
          <!-- <a-menu-item>
            <a href="javascript:;">查看全部</a>
          </a-menu-item> -->
        </a-menu>
      </a-dropdown>
      <div v-if="content.type=='info'">
        <card-content-info :listData="contentData"/>
      </div>
      <div v-else-if="content.type=='react'">
        <card-content-react :listData="contentData"/>
      </div>
      <div v-else-if="content.type=='activity'">
        <card-content-activity :listData="contentData"/>
      </div>
      <div v-else-if="content.type=='local'" style="height: 100%">
        <card-content-local/>
      </div>
      <div v-else-if="content.type=='graph'">
        <card-content-graph :listData="contentData"/>
      </div>
      <div v-else-if="content.type=='intro'">
        <card-content-intro/>
        <a-row :gutter="8">
          <a-col :span="12">
            <chart-card title="周工作量" total="0">
              <a-tooltip title="体现上周工作在云雀上的使用情况" slot="action">
                <a-icon type="info-circle-o" />
              </a-tooltip>
              <div>
                <mini-area />
              </div>
              <template slot="footer">日均<span> {{ "0" }}</span></template>
            </chart-card>
          </a-col>
          <a-col :span="12">
            <chart-card :loading="loading" title="工作目标完成率" total="0">
              <a-tooltip title="体现计划、任务、todo等可量化工作的完成情况" slot="action">
                <a-icon type="info-circle-o" />
              </a-tooltip>
              <div>
                <mini-progress color="rgb(19, 194, 194)" :target="zero" :percentage="zero" height="8px" />
              </div>
              <template slot="footer">
                <!-- term 是组件trend 必填项 添加:term="''"暂屏蔽控制台抛错 by fanjiao -->
                <trend flag="down" style="margin-right: 16px;" :term="'0'">
                  <span slot="term">同周比</span>
                  12%
                </trend>
                <trend flag="up" :term="'0'">
                  <span slot="term">日环比</span>
                  80%
                </trend>
              </template>
            </chart-card>
          </a-col>
        </a-row>

      </div>
    </a-card>
  </div>
</template>
<script>
import CardContentInfo from '@/components/monitor/card/CardContentInfo'
import CardContentLocal from '@/components/monitor/card/CardContentLocal'
import CardContentReact from '@/components/monitor/card/CardContentReact'
import CardContentActivity from '@/components/monitor/card/CardContentActivity'
import CardContentGraph from '@/components/monitor/card/CardContentGraph'
import CardContentIntro from '@/components/monitor/card/CardContentIntro'
import ChartCard from '@/components/chart/ChartCard'
import MiniArea from '@/components/chart/MiniArea'
import MiniProgress from '@/components/chart/MiniProgress'
import Trend from '@/components/chart/Trend'
import { delMyselfCard } from '@/api/workplace'
export default {
  name: 'Card',
  components: {
    CardContentInfo,
    CardContentLocal,
    CardContentReact,
    CardContentActivity,
    CardContentGraph,
    CardContentIntro,
    ChartCard,
    MiniArea,
    MiniProgress,
    Trend
  },
  data () {
    return {
      loading: false,
      headStyle: { height: '52px', 'border-bottom': 'none' },
      bodyStyle: { padding: '0', height: '295px' },
      content: this.cardData,
      contentData: [],
      zero: 0
    }
  },
  props: {
    cardData: {
      type: Object,
      required: true
    },
    unRequstType: {
      type: Array,
      required: true
    },
    refreshTag: {
      type: Number,
      required: true
    }
  },
  watch: {
    refreshTag: function () {
      this.refreshList()
    }
  },
  computed: {
    userInfo () {
      return this.$store.getters.userInfo
    }
  },
  created () {
    this.getCard()
  },
  mounted () {
    if (this.content.type === 'intro') {
      this.loading = false
    }
  },
  methods: {
    /**
     * 获取卡片数据
     */
    getCard () {
      // 过滤需要请求接口数据的卡片类型 by fanjiao
      let check = false
      if (this.unRequstType.indexOf(this.content.type) === -1) {
        check = true
      }
      if (check && this.content.url !== undefined) {
        const url = 'portal' + this.content.url + '?' + 'orgCode=' + this.userInfo.orgCode
        this.$http.get(url)
          .then(res => {
            this.loading = false
            this.contentData = res.result === undefined ? [] : res.result.data
            this.$emit('loadingDone', this.content.url)
          })
      }
    },
    /**
     * 手动刷新卡片
     */
    refreshList () {
      this.getCard()
    },
    /**
     * 移除卡片
     */
    removeCard (cardId) {
      delMyselfCard({ 'cardId': cardId }).then(
        res => {
          if (res.status === 200) {
            this.$emit('refreshCard')
            this.$notification['success']({
              message: '操作成功',
              duration: 2
            })
          } else {
            this.$notification['error']({
              message: res.message,
              duration: 4
            })
          }
        }
      ).catch(() =>
        this.$notification['error']({
          message: '发生异常，请联系系统管理员',
          duration: 4
        })
      )
    }
  }
}
</script>
<style lang="less" scoped>
.card-footer{
  position: absolute;
    bottom: 0;
}
    .footer-more{
        border:0;
        color: #a6a6a6;
        font-size: 12px;
        // background: linear-gradient(180deg,#ffffff,#e0e0e0) !important;
    }
    .footer-more:hover{
      color: #1890ff;
    }
</style>
