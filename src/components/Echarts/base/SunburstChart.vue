<!-- 旭日图 -->
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
  // 数据格式：{name: '根节点', value: 数值, children: [{name: '子节点', value: 数值, children: [...]}]}
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
  // 是否显示数据标签
  showLabel: {
    type: Boolean,
    default: true
  },
  // 旭日图中心位置
  center: {
    type: Array,
    default: () => ['50%', '50%']
  },
  // 旭日图半径
  radius: {
    type: [String, Array],
    default: ['0%', '90%']
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
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20
    },
    toolbox: {
      show: props.showToolbox,
      feature: {
        saveAsImage: {},
        restore: {}
      }
    },
    series: [{
      name: '旭日图',
      type: 'sunburst',
      data: [props.data],
      center: props.center,
      radius: props.radius,
      label: {
        show: props.showLabel,
        rotate: 'radial'
      },
      nodeClick: 'rootToNode',
      sort: null,
      levels: [],
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
