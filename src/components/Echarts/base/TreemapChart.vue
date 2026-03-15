<!-- 矩形树图 -->
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
  // 数据格式：{name: '根节 , value: 数  children: [{name: '子节 , value: 数  children: [...]}]}
  data: {
    type: Object,
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
    default: true
  },
  // 矩形树图中心位置
  center: {
    type: Array,
    default: () => ['50%', '50%']
  },
  // 矩形树图大小
  size: {
    type: [String, Array],
    default: '80%'
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
      formatter: '{b}: {c}'
    },
    toolbox: {
      show: props.showToolbox,
      feature: {
        saveAsImage: {},
        restore: {}
      }
    },
    series: [{
      name: '矩形树图',
      type: 'treemap',
      data: [props.data],
      center: props.center,
      size: props.size,
      label: {
        show: props.showLabel,
        formatter: '{b}'
      },
      breadcrumb: {
        show: false
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
        gapWidth: 1
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
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
