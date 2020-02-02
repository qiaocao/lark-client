<template>
  <div class="container">
    <div class="color">
      <div class="red"></div>
    </div>
    <div class="color">
      <div class="orange"></div>
    </div>
    <div class="color">
      <div class="yellow"></div>
    </div>
    <div class="color">
      <div class="green"></div>
    </div>
    <div class="color">
      <div class="blue"></div>
    </div>
    <div class="color">
      <div class="purple"></div>
    </div>
    <div class="color">会议加载中···</div>
  </div>
</template>

<script>

export default {
  name: 'MLoading'
}
</script>

<style lang="less" scoped>
.container {
  width: 320px;
  height: 180px;
  transform: scale(0.8)
}
.container .color {
  height: 30px;
}
.container .color div {
  height: 30px;
  width: 0;
}
.container .color .red {
  background: #f25774;
  animation-name: slide;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
}
.container .color .orange {
  background: #ffb65b;
  animation-name: slide;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-delay: 0.05s;
}
.container .color .yellow {
  background: #fdda74;
  animation-name: slide;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-delay: 0.1s;
}
.container .color .green {
  background: #4cbe5d;
  animation-name: slide;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-delay: 0.15s;
}
.container .color .blue {
  background: #4080ff;
  animation-name: slide;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-delay: 0.2s;
}
.container .color .purple {
  background: #7b64c0;
  animation-name: slide;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-delay: 0.25s;
}

@keyframes slide {
  10% {
    width: 0;
    float: left;
  }
  37% {
    width: 100%;
    float: left;
  }
  63% {
    width: 100%;
    float: right;
  }
  90% {
    width: 0;
    float: right;
  }
}
</style>
