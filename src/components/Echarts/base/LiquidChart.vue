<!-- 水波图 -->
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
  // 数值 (0-1之间)
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 1
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
  // 水球图中心位置
  center: {
    type: Array,
    default: () => ['50%', '50%']
  },
  // 水球图半径
  radius: {
    type: [String, Number],
    default: '80%'
  },
  // 水球颜色
  color: {
    type: String,
    default: '#5470c6'
  },
  // 是否显示数值
  showValue: {
    type: Boolean,
    default: true
  },
  // 数值单位
  unit: {
    type: String,
    default: '%'
  },
  // 数值格式化
  valueFormatter: {
    type: Function,
    default: null
  },
  // 是否启用动画
  animation: {
    type: Boolean,
    default: true
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
      formatter: `${props.title || '数值'}: ${(props.value * 100).toFixed(1)}${props.unit}`
    },
    toolbox: {
      show: props.showToolbox,
      feature: {
        saveAsImage: {},
        restore: {}
      }
    },
    series: [{
      name: props.title || '水球图',
      type: 'liquidFill',
      data: [props.value],
      center: props.center,
      radius: props.radius,
      color: [props.color],
      backgroundStyle: {
        color: '#fff',
        borderColor: '#ccc',
        borderWidth: 1
      },
      label: {
        show: props.showValue,
        fontSize: 30,
        color: '#333',
        formatter: props.valueFormatter || `${(props.value * 100).toFixed(1)}${props.unit}`
      },
      outline: {
        show: true,
        borderDistance: 5,
        itemStyle: {
          borderColor: props.color,
          borderWidth: 2
        }
      },
      animation: props.animation
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
