<!-- 图表样式配置使用示例 -->
<template>
  <div class="style-config-example">
    <el-row :gutter="20">
      <!-- 左侧：样式配置面板 -->
      <el-col :span="8">
        <ChartStyleConfig
          ref="styleConfigRef"
          @config-change="handleConfigChange"
        />
      </el-col>

      <!-- 右侧：图表预览 -->
      <el-col :span="16">
        <div class="chart-preview">
          <h3>图表预览</h3>

          <!-- 图表类型选择 -->
          <el-form :inline="true" class="chart-selector">
            <el-form-item label="图表类型">
              <el-select v-model="selectedChartType">
                <el-option label="柱形图" value="bar" />
                <el-option label="折线图" value="line" />
                <el-option label="饼图" value="pie" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="applyStyleToChart">应用样式</el-button>
              <el-button @click="resetStyle">重置样式</el-button>
            </el-form-item>
          </el-form>

          <!-- 图表容器 -->
          <div class="chart-container">
            <!-- 柱形图 -->
            <BarChart
              v-if="selectedChartType === 'bar'"
              ref="chartRef"
              :data="chartData"
              :x-axis="chartXAxis"
              :width="currentConfig.basic.width"
              :height="currentConfig.basic.height"
              :title="currentConfig.basic.title"
              :subtitle="currentConfig.basic.subtitle"
              :theme="currentConfig.basic.theme"
              :auto-resize="currentConfig.basic.autoResize"
              :renderer="currentConfig.basic.renderer"
              :show-legend="currentConfig.basic.showLegend"
              :show-toolbox="currentConfig.basic.showToolbox"
              :colors="currentConfig.colors.customColors"
              @chart-ready="onChartReady"
            />

            <!-- 折线图 -->
            <LineChart
              v-if="selectedChartType === 'line'"
              ref="chartRef"
              :data="chartData"
              :x-axis="chartXAxis"
              :width="currentConfig.basic.width"
              :height="currentConfig.basic.height"
              :title="currentConfig.basic.title"
              :subtitle="currentConfig.basic.subtitle"
              :theme="currentConfig.basic.theme"
              :auto-resize="currentConfig.basic.autoResize"
              :renderer="currentConfig.basic.renderer"
              :show-legend="currentConfig.basic.showLegend"
              :show-toolbox="currentConfig.basic.showToolbox"
              :colors="currentConfig.colors.customColors"
              @chart-ready="onChartReady"
            />

            <!-- 饼图 -->
            <PieChart
              v-if="selectedChartType === 'pie'"
              ref="chartRef"
              :data="pieChartData"
              :width="currentConfig.basic.width"
              :height="currentConfig.basic.height"
              :title="currentConfig.basic.title"
              :subtitle="currentConfig.basic.subtitle"
              :theme="currentConfig.basic.theme"
              :auto-resize="currentConfig.basic.autoResize"
              :renderer="currentConfig.basic.renderer"
              :show-legend="currentConfig.basic.showLegend"
              :show-toolbox="currentConfig.basic.showToolbox"
              :colors="currentConfig.colors.customColors"
              @chart-ready="onChartReady"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import ChartStyleConfig from '@/components/Echarts/ChartStyleConfig.vue'
import { BarChart, LineChart, PieChart } from '@/components/Echarts/index.js'

// 样式配置引用
const styleConfigRef = ref(null)
const chartRef = ref(null)

// 当前选中的图表类型
const selectedChartType = ref('bar')

// 当前配置
const currentConfig = reactive({
  basic: {
    width: '100%',
    height: '400px',
    title: '图表样式配置示例',
    subtitle: '实时预览样式效果',
    theme: '',
    renderer: 'canvas',
    showLegend: true,
    showToolbox: true,
    autoResize: true
  },
  colors: {
    primaryColor: '#5470c6',
    colorScheme: 'default',
    customColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
  },
  fonts: {
    titleFontFamily: 'Microsoft YaHei',
    titleFontSize: 18,
    axisFontFamily: 'Microsoft YaHei',
    axisFontSize: 12,
    legendFontFamily: 'Microsoft YaHei',
    legendFontSize: 12,
    labelFontFamily: 'Microsoft YaHei',
    labelFontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal'
  },
  layout: {
    left: 50,
    right: 50,
    top: 60,
    bottom: 50,
    showGrid: true,
    gridStyle: 'solid',
    gridColor: '#e0e0e0',
    gridOpacity: 0.3,
    backgroundColor: '#ffffff',
    showBorder: false,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 0,
    showShadow: false,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 4,
    shadowColor: 'rgba(0,0,0,0.3)'
  },
  animation: {
    enabled: true,
    duration: 1000,
    easing: 'cubicOut',
    delay: 0,
    threshold: 200,
    loop: false,
    loopCount: 1,
    direction: 'normal',
    fillMode: 'none',
    playState: 'running'
  }
})

// 图表数据
const chartData = ref([120, 200, 150, 80, 70, 110, 130, 180, 160, 140, 190, 220])
const chartXAxis = ref(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'])

const pieChartData = ref([
  { name: '苹果', value: 35 },
  { name: '三星', value: 25 },
  { name: '华为', value: 20 },
  { name: '小米', value: 15 },
  { name: '其他', value: 5 }
])

// 处理配置变化
const handleConfigChange = (config) => {
  Object.assign(currentConfig, config)
  console.log('配置已更新:', config)
}

// 图表准备就绪
const onChartReady = (chartInstance) => {
  console.log('图表已准备就绪:', chartInstance)
  ElMessage.success('图表渲染完成')
}

// 应用样式到图表
const applyStyleToChart = () => {
  if (chartRef.value) {
    ElMessage.success('样式已应用到图表')
  }
}

// 重置样式
const resetStyle = () => {
  if (styleConfigRef.value) {
    styleConfigRef.value.setConfig({
      basic: {
        width: '100%',
        height: '400px',
        title: '图表样式配置示例',
        subtitle: '实时预览样式效果',
        theme: '',
        renderer: 'canvas',
        showLegend: true,
        showToolbox: true,
        autoResize: true
      },
      colors: {
        primaryColor: '#5470c6',
        colorScheme: 'default',
        customColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
      },
      fonts: {
        titleFontFamily: 'Microsoft YaHei',
        titleFontSize: 18,
        axisFontFamily: 'Microsoft YaHei',
        axisFontSize: 12,
        legendFontFamily: 'Microsoft YaHei',
        legendFontSize: 12,
        labelFontFamily: 'Microsoft YaHei',
        labelFontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal'
      },
      layout: {
        left: 50,
        right: 50,
        top: 60,
        bottom: 50,
        showGrid: true,
        gridStyle: 'solid',
        gridColor: '#e0e0e0',
        gridOpacity: 0.3,
        backgroundColor: '#ffffff',
        showBorder: false,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 0,
        showShadow: false,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 4,
        shadowColor: 'rgba(0,0,0,0.3)'
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut',
        delay: 0,
        threshold: 200,
        loop: false,
        loopCount: 1,
        direction: 'normal',
        fillMode: 'none',
        playState: 'running'
      }
    })
    ElMessage.info('样式已重置')
  }
}
</script>

<style scoped>
.style-config-example {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.chart-preview {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-preview h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.chart-selector {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.chart-container {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px;
  background-color: white;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
