<!-- 词云图 -->
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
  // 数据格式：[{name: '词语', value: 数值}, ...]
  data: {
    type: Array,
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
  // 词云图中心位置
  center: {
    type: Array,
    default: () => ['50%', '50%']
  },
  // 词云图大小
  size: {
    type: [String, Array],
    default: ['80%', '80%']
  },
  // 字体大小范围
  fontSizeRange: {
    type: Array,
    default: () => [12, 60]
  },
  // 是否启用动画
  animation: {
    type: Boolean,
    default: true
  },
  // 旋转角度范围
  rotationRange: {
    type: Array,
    default: () => [-90, 90]
  }
})

// 定义 emits
const emit = defineEmits(['chart-ready', 'chart-click', 'chart-dblclick', 'chart-mouseover', 'chart-mouseout'])

// 计算图表配置
const chartOption = computed(() => {
  // 处理数据格式
  const seriesData = props.data.map((item, index) => ({
    name: item.name || `词语${index + 1}`,
    value: item.value || item,
    itemStyle: {
      color: props.colors[index % props.colors.length]
    }
  }))

  const option = {
    title: {
      text: props.title,
      subtext: props.subtitle,
      left: 'center'
    },
    tooltip: {
      show: true,
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
      name: '词云图',
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: props.size[0],
      height: props.size[1],
      right: null,
      bottom: null,
      sizeRange: props.fontSizeRange,
      rotationRange: props.rotationRange,
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function () {
          return props.colors[Math.floor(Math.random() * props.colors.length)]
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: seriesData,
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
