<!-- 仪表盘 -->
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
  // 数值
  value: {
    type: Number,
    required: true
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
  // 颜色
  colors: {
    type: Array,
    default: () => ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']
  },
  // 最小值
  min: {
    type: Number,
    default: 0
  },
  // 最大值
  max: {
    type: Number,
    default: 100
  },
  // 仪表盘中心位置
  center: {
    type: Array,
    default: () => ['50%', '50%']
  },
  // 仪表盘半径
  radius: {
    type: [String, Number],
    default: '80%'
  },
  // 是否显示进度条
  showProgress: {
    type: Boolean,
    default: true
  },
  // 是否显示指针
  showPointer: {
    type: Boolean,
    default: true
  },
  // 是否显示数值
  showValue: {
    type: Boolean,
    default: true
  },
  // 数值单位
  unit: {
    type: String,
    default: ''
  },
  // 数值格式化
  valueFormatter: {
    type: Function,
    default: null
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
      formatter: `${props.title || '数值'}: {c}${props.unit}`
    },
    toolbox: {
      show: props.showToolbox,
      feature: {
        saveAsImage: {},
        restore: {}
      }
    },
    series: [{
      name: props.title || '仪表盘',
      type: 'gauge',
      min: props.min,
      max: props.max,
      center: props.center,
      radius: props.radius,
      progress: {
        show: props.showProgress,
        width: 18
      },
      pointer: {
        show: props.showPointer,
        length: '60%',
        width: 6
      },
      axisLine: {
        lineStyle: {
          width: 18
        }
      },
      axisTick: {
        distance: -25,
        length: 8,
        lineStyle: {
          color: '#fff',
          width: 2
        }
      },
      splitLine: {
        distance: -30,
        length: 30,
        lineStyle: {
          color: '#fff',
          width: 4
        }
      },
      axisLabel: {
        color: 'inherit',
        distance: 40,
        fontSize: 12
      },
      anchor: {
        show: true,
        showAbove: true,
        size: 25,
        itemStyle: {
          borderWidth: 10
        }
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 30,
        offsetCenter: [0, '70%'],
        formatter: props.valueFormatter || `{value}${props.unit}`,
        color: 'inherit'
      },
      data: [{
        value: props.value,
        name: props.title || '数值'
      }]
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
