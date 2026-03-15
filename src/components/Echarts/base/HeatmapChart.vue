<!-- 热力图 -->
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
  // 数据格式：[[x, y, value], [x, y, value], ...]
  data: {
    type: Array,
    required: true
  },
  // X轴数据
  xAxis: {
    type: Array,
    default: () => []
  },
  // Y轴数据
  yAxis: {
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
  // 颜色渐变
  colorGradient: {
    type: Array,
    default: () => ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
  },
  // 是否显示数据标签
  showLabel: {
    type: Boolean,
    default: false
  },
  // 是否显示网格
  showGrid: {
    type: Boolean,
    default: true
  },
  // 热力图类型：heatmap, calendar
  heatmapType: {
    type: String,
    default: 'heatmap',
    validator: (value) => ['heatmap', 'calendar'].includes(value)
  }
})

// 定义 emits
const emit = defineEmits(['chart-ready', 'chart-click', 'chart-dblclick', 'chart-mouseover', 'chart-mouseout'])

// 计算图表配置
const chartOption = computed(() => {
  // 处理数据格式
  const seriesData = props.data.map(item => {
    if (Array.isArray(item)) {
      return item
    } else if (typeof item === 'object' && item.x !== undefined && item.y !== undefined && item.value !== undefined) {
      return [item.x, item.y, item.value]
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
      position: 'top',
      formatter: function (params) {
        return `${params.value[0]}, ${params.value[1]}: ${params.value[2]}`
      }
    },
    grid: {
      show: props.showGrid,
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.xAxis.length > 0 ? props.xAxis : [],
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: props.yAxis.length > 0 ? props.yAxis : [],
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: Math.min(...seriesData.map(item => item[2])),
      max: Math.max(...seriesData.map(item => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      inRange: {
        color: props.colorGradient
      }
    },
    series: [{
      name: '热力图',
      type: 'heatmap',
      data: seriesData,
      label: {
        show: props.showLabel
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
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
