<template>
  <div>
    <div v-if="listData.length!=0" class="card-content">
      <a-list
        :bordered="bordered"
        :dataSource="listData"
        class="card-list"
      >
        <a-list-item style="padding: 3px 21px 3px 21px" slot="renderItem" slot-scope="item">
          <a-list-item-meta v-if="item.type=='message'" :description="item.detail">
            <div slot="title">{{ item.title }}</div>
            <a-avatar slot="avatar" :src="item.avatar" />
          </a-list-item-meta>

          <a-list-item-meta v-else-if="item.type=='notice'" :description="item.detail">
            <a-tag v-if="item.level=='new'" color="red">{{ item.level }}</a-tag>
            <div slot="title">{{ item.title }}</div>
            <a-avatar slot="avatar" :src="item.avatar" />
          </a-list-item-meta>
          <a-list-item-meta v-else-if="item.type=='todos'" :description="item.detail">
            <div slot="title">{{ item.title }}</div>
            <a-avatar slot="avatar" :src="item.avatar" />
          </a-list-item-meta>
          <a-list-item-meta v-else-if="item.type=='collection'" :description="item.detail">
            <div slot="title">{{ item.title }}</div>
            <a-avatar slot="avatar" :src="item.avatar" />
          </a-list-item-meta>
          <div>{{ item.date|timeFormat }}</div>
        </a-list-item>
      </a-list>
    </div>
    <div v-else style="margin: 40px auto 0 auto;text-align: center;" class="card-content">
      <a-icon type="file-exclamation" theme="twoTone" :style="fontSize" />
      <p class="description">卡片暂无内容</p>
    </div>
  </div>
</template>
<script>
import { toWeiXinString } from '@/utils/util'
export default {
  name: 'CardContent',
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
  filters: { timeFormat: toWeiXinString }
}
</script>
<style lang="less" scoped>
    .card-list{
      .ant-list-item{
        cursor: pointer;
        transition: background-color 218ms;
        border-bottom: 0px solid #e8e8e8;
      }
      .ant-list-item:hover{
        background-color: #f5f5f5;
      }
    }
</style>
