<template>
  <div class="card-setting">
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }"
      :dataSource="cardList"
    >
      <a-list-item slot="renderItem" slot-scope="item, index" :key="item.id">
        <a-card
          hoverable
          style="width: 200px"
        >
          <img
            alt="example"
            :src="cardImg[index]"
            slot="cover"
          />
          <template class="ant-card-actions" slot="actions">
            <a-tooltip placement="left" v-if="isPlus[index]" >
              <template slot="title">
                <span>添加卡片</span>
              </template>
              <a-icon @click="click($event, index), pushId(item.id)" type="plus"/>
            </a-tooltip>
            <a-icon type="ellipsis" v-if="isPlus[index]"/>
            <a-icon type="check" v-if="isDelete[index]"/>
            <a-tooltip placement="left" v-if="isDelete[index]" >
              <template slot="title">
                <span>删除卡片</span>
              </template>
              <a-icon @click="clickDelete($event, index), deleteId(item.id)" type="delete"/>
            </a-tooltip>
          </template>
          <a-card-meta
            :title="item.title"
            :description="item.description">
          </a-card-meta>
        </a-card>
      </a-list-item>
      <div v-text="t" style="display:none"></div>
    </a-list>
  </div>
</template>
<script>
import { getCard, addCard, delCard } from '@/api/workplace'
export default {
  data () {
    return {
      cardList: [],
      isPlus: [],
      isDelete: [],
      t: '',
      cardImg: ['/card/collection.png', '/card/message.png', '/card/notice.png', '/card/todo.png', '/card/collection.png', '/card/message.png']
    }
  },
  created () {
    this.getAllCards()
  },
  methods: {
    /**
     * 添加/显示卡片
     */
    click (event, index) {
      this.isPlus[index] = false
      this.isDelete[index] = true
      this.t = Math.random()
    },
    /**
     * 删除/隐藏卡片
     */
    clickDelete (event, index) {
      this.isDelete[index] = false
      this.isPlus[index] = true
      this.t = Math.random()
    },
    /**
     * 获取卡片
     */
    getAllCards () {
      getCard()
        .then(res => {
          const datas = res.result.data
          datas.map(res => {
            this.cardList.push(res)
            if (res.defaultChecked === false) {
              this.isDelete.push(false)
              this.isPlus.push(true)
            } else {
              this.isDelete.push(true)
              this.isPlus.push(false)
            }
          })
        })
    },
    /**
     * 添加卡片
     */
    pushId (cardId) {
      addCard({ 'cardId': cardId }).then(
        res => {
          if (res.status === 200) {
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
    },
    /**
     * 删除卡片
     */
    deleteId (cardId) {
      delCard({ 'cardId': cardId }).then(
        res => {
          if (res.status === 200) {
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
<style>
  #components-a-tooltip-demo-placement .ant-btn {
  width: 70px;
  text-align: center;
  padding: 0;
  margin-right: 8px;
  margin-bottom: 8px
  }
  .card-setting{
    overflow: hidden;
  }
</style>
