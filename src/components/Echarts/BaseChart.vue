// 基础渲染的echart
<template>
  <div class="cardShadow" style="width:100%;height:100%">
    <div class="echartTopConfig" v-if="topConfig?.title">
      <div class="topConfigCss">
        <div style="display: flex;width: 100%;">
          <img src="/Icon/evaluate.svg" alt="" class="bmr" style="width: 20px;" />
          <span> {{ topConfig?.title || ''}} </span>
          <span class="topConfigDate" v-if="topConfig?.title && topConfig?.date"> {{  topConfig?.date || '' }}</span>
        </div>
        <div>
          <img src="/Icon/downBlack.svg" alt="" class="one-image" @click="handEchar(topConfig?.title)" style="cursor: pointer;" />
        </div>
      </div>
    </div>
    <div :class="(topConfig?.title) ? 'echartHeight':'echartHeightNoTitle'">
      <div ref="chartRef" class="echarts-container" style="width:100%;height:100%;overflow-y: auto;"></div>
    </div>
    <!-- <div :class="(topConfig?.title) ? 'echartHeightNoTitle':'echartHeightNoTitle'">
      <div ref="chartRef" class="echarts-container" style="width:100%;height:100%"></div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// 定义 props
const props = defineProps({
  // 顶部信息配置
  topConfig: {
    type: Object,
    default: () => ({ title: '', date: '' })
  },
  // 图表配置
  option: {
    type: Object,
    required: true
  },
  // 主题
  theme: {
    type: String,
    default: ''
  },
  // // 是否自动调整大小
  // autoResize: {
  //   type: Boolean,
  //   default: true
  // },
  // 渲染器类?
  renderer: {
    type: String,
    default: 'canvas',
    validator: (value) => ['canvas', 'svg'].includes(value)
  }
})

// 定义 emits
const emit = defineEmits(['chart-ready', 'chart-click', 'chart-dblclick', 'chart-mouseover', 'chart-mouseout'])

// 图表实例
const chartRef = ref(null)
let chartInstance = null

// 初始化图
const initChart = () => {
  if (!chartRef.value) return
  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  // 创建新实
  chartInstance = echarts.init(chartRef.value, props.theme, {
    renderer: props.renderer
  })
  chartInstance.resize()
  // 设置配置
  chartInstance.setOption(props.option, true)
  // 绑定事件
  bindEvents()
  // 触发 ready 事件
  emit('chart-ready', chartInstance)
}

// 绑定事件
const bindEvents = () => {
  if (!chartInstance) return

  // 点击事件
  chartInstance.on('click', (params) => {
    emit('chart-click', params)
  })

  // 双击事件
  chartInstance.on('dblclick', (params) => {
    emit('chart-dblclick', params)
  })

  // 鼠标悬停事件
  chartInstance.on('mouseover', (params) => {
    emit('chart-mouseover', params)
  })

  // 鼠标离开事件
  chartInstance.on('mouseout', (params) => {
    emit('chart-mouseout', params)
  })
}

// 调整图表大小
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 更新图表配置
const updateChart = (newOption) => {
  if (chartInstance) {
    chartInstance.setOption(newOption, true)
    chartInstance.resize();
  }
}

// 获取图表实例
const getChartInstance = () => {
  return chartInstance
}

// 监听配置变化
watch(
  () => props.option,
  (newOption) => {
    if (chartInstance) {
      chartInstance.setOption(newOption, true)
    }
  },
  { deep: true }
)

// 监听主题变化
watch(
  () => props.theme,
  () => {
    nextTick(() => {
      initChart()
    })
  }
)

// 监听渲染器变
watch(() => props.renderer, () => {
  nextTick(() => {
    initChart()
  })
}
)

// 组件挂载
onMounted(() => {
  nextTick(() => {
    initChart()
    // 监听窗口大小变化事件，并在变化时调用 resizeChart 函数
    window.addEventListener('resize', resizeChart);
  })
})

// 组件卸载
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  // 移除窗口大小变化事件的监听，避免内存泄漏
  window.removeEventListener('resize', resizeChart);
})



//  下载图表图片
const handEchar = (name) => {
  if (!chartInstance) return ElMessage.error('下载失败，请刷新页面重试！');
  const base64 = chartInstance.getDataURL({ pixelRatio: 1, backgroundColor: '#fff' });
  const a = document.createElement('a');
  a.href = base64;
  a.download = `${name || ('chart' + new Date().getTime())}.png`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}










// 暴露方法
defineExpose({
  getChartInstance,
  updateChart,
  resizeChart
})
</script>

<style scoped>
/* 设置图表容器的样式，使其相对定位，并占满父级容器的宽度和高度 */
div[ref="chartRef"] {
  position: relative;
  width: 100%;
  height: 100%;
}
.one-image:hover {
  content: url("/Icon/downBlue.svg");
}
.echartTopConfig {
  line-height: 50px;
  height: 50px;
  width: 100%;
  padding: 0 15px;
  border-bottom: 1px solid rgba(229, 229, 229, 1);
  box-sizing: border-box;
}
.topConfigCss {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.topConfigDate {
  padding-left: 5px;
  font-size: 12px;
  padding-top: 3px;
  box-sizing: border-box;
  color: rgba(128, 128, 128, 1);
}
.echartHeight {
  width: 100%;
  height: calc(100% - 50px);
  padding: 0 15px;
  box-sizing: border-box;
}
.echartHeightNoTitle{
  width: 100%;
  height: 100%;
  padding: 0 15px;
  box-sizing: border-box;
}
</style>