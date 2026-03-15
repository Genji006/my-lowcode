<!-- 柱形 -->
<template>
  <BaseChart :topConfig="topConfig" :option="chartOption" :theme="theme" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseChart from '../BaseChart.vue'
import http from "@/utils/request"; // 引入封装的请求工具
import { gridFn, legendFn, toolbarFn, echartOptions } from './base'
// 定义 props
const props = defineProps({
  ...echartOptions,
  // 数据
  series: {
    type: Array,
    default: () => []
  },
  // X轴数
  xAxis: {
    type: Array,
    default: () => []
  },
  // 方向
  direction: {
    type: String,
  }
})

// 定义 emits
const emit = defineEmits(['chart-ready', 'chart-click', 'chart-dblclick', 'chart-mouseover', 'chart-mouseout'])
// 组件内部数据
const chartData = ref({
  xAxis: [],
  series: []
})

// 获取数据
const fetchData = () => {
  let arr = Array.from({ length: 10 }, (v, k) => Math.floor(Math.random() * 100))
  let arrs = Array.from({ length: 10 }, (v, k) => Math.floor(Math.random() * 100))
  let series = [{ name: '谷歌', data: arr }, { name: '360', data: arrs }]
  let xAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  // console.log(props, '23');
  http.post(props.apiUrl, props.apiParms).then(res => {
    if (res.code === 200 && res.data) {
      chartData.value = {
        xAxis: res.data.xAxis.data || [],
        series: res.data.series || []
      }
    } else {
      chartData.value = {
        xAxis: xAxis,
        series: series
      }
    }
  })
}


//  处理series
const seriesFn = (arr, colors, list = [], direction) => {
  let lens = arr.length
  let barWidth = Math.floor(90 / lens)
  
  // 检查数据格式：是否为对象数组（每个元素都有data属性）
  const isObjectArray = 
    Array.isArray(arr) && 
    arr.length > 0 && 
    typeof arr[0] === 'object' && 
    arr[0] !== null && 
    'data' in arr[0]
  
  if (isObjectArray) {
    // 对象数组格式：[{ name: 'xxx', data: [1, 2, 3] }, ...]
    for (let i = 0, len = arr.length; i < len; i++) {
      list.push({
        name: arr[i].name || '系列' + (i + 1),
        data: arr[i].data.map((item) => item || 0),
        smooth: true,
        type: 'line',
        color: colors[i] || '',
        label: {
          show: true,
          position: direction == 'category' ? 'right' : 'top',
        },
      })
    }
  } else {
    // 简单数值数组格式：[1, 2, 3, 4, 5]
    list.push({
      name: '系列1',
      data: arr.map((item) => item || 0),
      smooth: true,
      type: 'line',
      color: colors[0] || '',
      label: {
        show: true,
        position: direction == 'category' ? 'right' : 'top',
      },
    })
  }
  return list
}

//  x轴
const AxisFn = (direction = 'value', type, data) => {
  if (direction == 'category') {
    if (type == 'y') {
      return {
        type: direction,
        data: data,
        axisTick: {
          show: false, // 刻度线
        },
        axisLine: {
          show: false, // 轴线
          lineStyle: {
            type: "dashed",
            color: "rgba(189, 189, 189, 1)",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "rgba(189, 189, 189, 1)",
          },
        },
      }
    } else {
      return {
        type: 'value',
        axisTick: {
          show: false, // 刻度线
        },
        axisLine: {
          show: false, // 轴线
          lineStyle: {
            type: "dashed",
            color: "rgba(189, 189, 189, 1)",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "rgba(189, 189, 189, 1)",
          },
        },
      }
    }
  } else {
    if (type == 'x') {
      return {
        data: data,
        axisTick: {
          show: false, // 刻度线
        },
        axisLine: {
          show: false, // 轴线
          lineStyle: {
            type: "dashed",
            color: "rgba(189, 189, 189, 1)",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "rgba(189, 189, 189, 1)",
          },
        },
      }
    } else {
      return {
        type: 'value',
        axisTick: {
          show: false, // 刻度线
        },
        axisLine: {
          show: false, // 轴线
          lineStyle: {
            type: "dashed",
            color: "rgba(189, 189, 189, 1)",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "rgba(189, 189, 189, 1)",
          },
        },
      }
    }
  }
}
// 是否展示全文字x轴
// axisLabel: {
//   show: true,
//     interval: 0,
//         }


// 计算图表配置
const chartOption = computed(() => {
  let series = seriesFn(chartData.value.series, props.colors, props.chartDataType, props.direction)   // series处理
  let legend = legendFn(props.showLegend, props.legendPosition, props.legendLeft, props.legendRight, props.legendTop, props.legendBottom)  // 图例位置
  let grid = gridFn(props.showGrid, props.gridLeft, props.gridRight, props.gridTop, props.gridBottom)            // 网格
  let xAxis = AxisFn(props.direction, 'x', chartData.value.xAxis)   // x轴
  let yAxis = AxisFn(props.direction, 'y', chartData.value.xAxis)  // y轴
  const option = {
    title: {
      text: props.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: legend,
    toolbox: toolbarFn(props.showToolbox),
    grid: grid,
    xAxis: xAxis,   // x轴,
    yAxis: yAxis,  // y轴,
    series: series
  }

  return option
})

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})


// 事件处理
// const onChartReady = (chartInstance) => {
//   emit('chart-ready', chartInstance)
// }

// const onChartClick = (params) => {
//   emit('chart-click', params)
// }

// const onChartDblclick = (params) => {
//   emit('chart-dblclick', params)
// }

// const onChartMouseover = (params) => {
//   emit('chart-mouseover', params)
// }

// const onChartMouseout = (params) => {
//   emit('chart-mouseout', params)
// }
</script>
