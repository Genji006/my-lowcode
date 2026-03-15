<!-- 树图 -->
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
  // 数据格式：{name: '根节 , children: [{name: '子节 , children: [...]}]}
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
  // 树图类型：tree, treeMap
  treeType: {
    type: String,
    default: 'tree',
    validator: (value) => ['tree', 'treeMap'].includes(value)
  },
  // 布局方向：LR, RL, TB, BT
  layout: {
    type: String,
    default: 'LR',
    validator: (value) => ['LR', 'RL', 'TB', 'BT'].includes(value)
  },
  // 节点间距
  nodeGap: {
    type: Number,
    default: 20
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
      formatter: '{b}'
    },
    toolbox: {
      show: props.showToolbox,
      feature: {
        saveAsImage: {},
        restore: {}
      }
    },
    series: [{
      name: '树图',
      type: props.treeType,
      data: [props.data],
      top: '5%',
      left: '7%',
      bottom: '2%',
      right: '20%',
      symbolSize: 7,
      orient: props.layout,
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 12,
        show: props.showLabel
      },
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
        }
      },
      emphasis: {
        focus: 'descendant'
      },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750,
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
