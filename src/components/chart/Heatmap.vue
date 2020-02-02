<template>
  <div id="main" style="width:100%;height:300px;"></div>
</template>
<script>
// var echarts = require('echarts')
var echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/heatmap')
require('echarts/lib/component/calendar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/visualMap')
export default {
  name: 'Heatmap',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      rangeDate: []
    }
  },
  mounted () {
    if (this.data.length > 0) {
      this.rangeDate.push(this.data[0][0])
      this.rangeDate.push(this.data[this.data.length - 1][0])
    }
    var option = {
      visualMap: {
        min: 0,
        max: 100,
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        top: 5,
        textStyle: {
          color: '#000'
        }
      },
      calendar: {
        range: this.rangeDate,
        // cellSize: ['auto', 26],
        right: 25,
        left: 30,
        top: 70,
        dayLabel: {
          nameMap: 'cn'
        },
        monthLabel: {
          nameMap: 'cn'
        }
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        // data: this.getVirtulData(2017)
        data: this.data
      }
      // title: {
      //   top: 30,
      //   left: 'center',
      //   text: '2016年某人每天的步数'
      // },
      // tooltip : {},
      // visualMap: {
      //     min: 0,
      //     max: 10000,
      //     type: 'piecewise',
      //     orient: 'horizontal',
      //     left: 'center',
      //     top: 65,
      //     textStyle: {
      //         color: '#000'
      //     }
      // },
      // calendar: {
      //     top: 120,
      //     left: 60,
      //     right: 270,
      //     cellSize: ['auto', 13],
      //     range: '2016',
      //     itemStyle: {
      //         normal: {borderWidth: 0.5}
      //     },
      //     yearLabel: {show: false},
      //     dayLabel:{
      //         nameMap: 'cn'
      //     },
      //     monthLabel: {
      //       nameMap: 'cn'
      //     }
      // },
      // series: {
      //     type: 'heatmap',
      //     coordinateSystem: 'calendar',
      //     data: this.data
      // }
    }
    const calendarCharts = echarts.init(document.getElementById('main'))
    calendarCharts.setOption(option)
    window.addEventListener('resize', function () {
      calendarCharts.resize()
    })
  },
  methods: {
    // 模拟数据
    getVirtulData (year) {
      year = year || '2017'
      var date = +echarts.number.parseDate(year + '-01-01')
      var end = +echarts.number.parseDate(year + '-01-31')
      var dayTime = 3600 * 24 * 1000
      var data = []
      for (var time = date; time <= end; time += dayTime) {
        data.push([echarts.format.formatTime('yyyy-MM-dd', time), Math.floor(Math.random() * 10000)])
      }
      return data
    }
  }
}
</script>
