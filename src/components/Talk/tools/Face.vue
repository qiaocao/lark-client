<template>
  <div>
    <ul class="faces">
      <li v-for="(item, index) in faceList" :key="index">
        <img :src="faceMap[item]" :alt="item" :title="item" @click="insertFace(item)"/>
      </li>
    </ul>
    <div class="clear"></div>
  </div>
</template>
<script>
import { faceUtils } from '@/utils/face'
export default {
  name: 'Face',
  components: {},
  data () {
    return {
      faceList: faceUtils.alt,
      faceMap: faceUtils.faces()
    }
  },
  created () {
  },
  methods: {
    insertFace: function (item) {
      this.$emit('insertFace', item)
    }
  }
}
</script>

<style scoped lang="less">
.faces {
  width: 30.5rem;
  list-style: none;
  background-color: #ffffff;
  border: 1px solid #f0f5ff;
  display: block;
  height: 25rem;
  overflow: auto;
  padding: 0;
  li {
    width: 3rem;
    height: 3rem;
    display: inline-block;
    padding: 4px;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
