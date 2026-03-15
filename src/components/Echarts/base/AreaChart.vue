<!-- 面积 -->
<template>
  <BaseChart
    :option="chartOption"
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
  // 数据
  data: {
    type: Array,
    required: true
  },
  // X轴数
  xAxis: {
    type: Array,
    default: () => []
  },
  // 系列名称
  seriesName: {
    type: String,
    default: '数据'
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
  // 渲染器类
  renderer: {
    type: String,
    default: 'canvas'
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 副标
  subtitle: {
    type: String,
    default: ''
  },
  // 是否显示图例
  showLegend: {
    type: Boolean,
    default: true
  },
  // 是否显示工具
  showToolbox: {
    type: Boolean,
    default: true
  },
  // 颜色
  colors: {
    type: Array,
    default: () => ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']
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
  // 是否显示平滑曲线
  smooth: {
    type: Boolean,
    default: false
  },
  // 是否显示标记
  showSymbol: {
    type: Boolean,
    default: true
  },
  // 面积透明
  areaOpacity: {
    type: Number,
    default: 0.3
  }
})

// 定义 emits
const emit = defineEmits(['chart-ready', 'chart-click', 'chart-dblclick', 'chart-mouseover', 'chart-mouseout'])

// 计算图表配置
const chartOption = computed(() => {
  const option = {
    title: {
      text: props.title,
      subtext: props.subtitle,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      show: props.showLegend,
      top: props.title ? 60 : 10
    },
    toolbox: {
      show: props.showToolbox,
      feature: {
        saveAsImage: {},
        dataView: { readOnly: false },
        restore: {},
        dataZoom: {},
        magicType: { type: ['line', 'bar'] }
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
      data: props.xAxis.length > 0 ? props.xAxis : props.data.map((_, index) => `时间${index + 1}`),
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: props.seriesName,
      type: 'line',
      data: props.data,
      smooth: props.smooth,
      symbol: props.showSymbol ? 'circle' : 'none',
      symbolSize: 6,
      itemStyle: {
        color: props.colors[0]
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: props.colors[0] + Math.floor(props.areaOpacity * 255).toString(16).padStart(2, '0')
          }, {
            offset: 1, color: props.colors[0] + '10'
          }]
        }
      },
      label: {
        show: props.showLabel,
        position: 'top'
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
