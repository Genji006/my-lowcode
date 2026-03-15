<!-- 蜡烛图 -->
<template>
  <BaseChart
    :option="chartOption"
    :width="width"
    :height="height"
    :theme="theme"
    :auto-resize="autoResize"
    :renderer="renderer"
    @chart-ready="onChartReady"
    @chart-click="onChartClick"
    @chart-dblclick="onChartDblclick"
    @chart-mouseover="onChartMouseover"
    @chart-mouseout="onChartMouseout"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '../BaseChart.vue'

// 定义 props
const props = defineProps({
  // 数据格式：[[open, close, lowest, highest], ...] 或 [{open, close, lowest, highest}, ...]
  data: {
    type: Array,
    required: true
  },
  // 日期数据
  dates: {
    type: Array,
    default: () => []
  },
  // 容器宽度
  width: {
    type: String,
    default: '100%'
  },
  // 容器高度
  height: {
    type: String,
    default: '400px'
  },
  // 主题
  theme: {
    type: String,
    default: ''
  },
  // 是否自动调整大小
  autoResize: {
    type: Boolean,
    default: true
  },
  // 渲染器类型
  renderer: {
    type: String,
    default: 'canvas'
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 副标题
  subtitle: {
    type: String,
    default: ''
  },
  // 是否显示工具箱
  showToolbox: {
    type: Boolean,
    default: true
  },
  // 是否显示网格
  showGrid: {
    type: Boolean,
    default: true
  },
  // 是否显示数据缩放
  showDataZoom: {
    type: Boolean,
    default: true
  }
})

// 定义 emits
const emit = defineEmits(['chart-ready', 'chart-click', 'chart-dblclick', 'chart-mouseover', 'chart-mouseout'])

// 计算图表配置
const chartOption = computed(() => {
  // 处理数据格式
  const seriesData = props.data.map((item, index) => {
    if (Array.isArray(item)) {
      return item
    } else if (typeof item === 'object' && item.open !== undefined && item.close !== undefined && item.lowest !== undefined && item.highest !== undefined) {
      return [item.open, item.close, item.lowest, item.highest]
    }
    return item
  })

  const option = {
    title: {
      text: props.title,
      subtext: props.subtitle,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function (params) {
        const data = params[0].data
        return `${params[0].axisValue}<br/>
                开盘：${data[0]}<br/>
                收盘：${data[1]}<br/>
                最低：${data[2]}<br/>
                最高：${data[3]}`
      }
    },
    legend: {
      data: ['K线']
    },
    grid: {
      show: props.showGrid,
      left: '10%',
      right: '10%'
    },
    xAxis: {
      type: 'category',
      data: props.dates.length > 0 ? props.dates : seriesData.map((_, index) => `日期${index + 1}`),
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax'
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100,
        show: props.showDataZoom
      },
      {
        show: props.showDataZoom,
        type: 'slider',
        top: '90%',
        start: 50,
        end: 100
      }
    ],
    animation: false,
    series: [{
      name: 'K线',
      type: 'candlestick',
      data: seriesData,
      itemStyle: {
        color: '#fd1050',
        color0: '#0cf49b',
        borderColor: '#fd1050',
        borderColor0: '#0cf49b'
      }
    }]
  }

  return option
})

// 事件处理
const onChartReady = (chartInstance) => {
  emit('chart-ready', chartInstance)
}

const onChartClick = (params) => {
  emit('chart-click', params)
}

const onChartDblclick = (params) => {
  emit('chart-dblclick', params)
}

const onChartMouseover = (params) => {
  emit('chart-mouseover', params)
}

const onChartMouseout = (params) => {
  emit('chart-mouseout', params)
}
</script>
