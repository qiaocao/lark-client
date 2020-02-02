<template>
  <div>
    <div v-if="listData.length!=0" class="card-content">
      <heat-map title="本年度工作情况" :data="listData"></heat-map>
    </div>
    <div v-else style="margin: 40px auto 0 auto;text-align: center;" class="card-content">
      <a-icon type="file-exclamation" theme="twoTone" :style="fontSize" />
      <p class="description">卡片暂无内容</p>
    </div>
  </div>
</template>
<script>
import HeatMap from '@/components/chart/Heatmap'
import { toWeiXinString } from '@/utils/util'
export default {
  name: 'CardContent',
  components: {
    HeatMap
  },
  data () {
    return {
      bordered: false,
      fontSize: { fontSize: '52px' },
      list: []
    }
  },
  props: {
    listData: {
      type: Array,
      required: true
    }
  },
  filters: { timeFormat: toWeiXinString },
  mounted () {
  }
}
</script>
<style lang="less" scoped>
    .card-list{
      .ant-list-item{
        transition: background-color 218ms;
        border-bottom: 0px solid #e8e8e8;
      }
      .ant-list-item:hover{
        background-color: #f5f5f5;
      }
    }
</style>
