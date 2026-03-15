<template>
  <div class="slave-monitor-container">
    <div class="toolbar">
      <searchForm :modelValue="queryParams" :items="searchItems" :inline="true" labelWidth="" @reset="handleReset"
        @searchVal="refreshData" class="search-form">
      </searchForm>
    </div>

    <div class="chart-container">
      <div ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElSelect, ElOption, ElDatePicker, ElButton } from 'element-plus'
import { getSlaveQuatoByCondition } from '@/api/kettleApi'
import searchForm from "@/components/element/SearchForm.vue";
const chartRef = ref()

const queryParams = ref({
  selectedQuatoType: '负载指数',
  selectedCalcType: '平均值',
  selectedDate: ''
})

// 指标类型选项
const quotaTypes = [
  { value: '负载指数', label: '负载指数' },
  { value: 'CPU利用率', label: 'CPU利用率' },
  { value: '空闲内存', label: '空闲内存' },
  { value: '空闲硬盘', label: '空闲硬盘' },
  { value: '线程数', label: '线程数' },
  { value: '转换数', label: '转换数' },
  { value: '作业数', label: '作业数' }
]

// 计算方式选项
const calcTypes = [
  { value: '平均值', label: '平均值' },
  { value: '最大值', label: '最大值' }
]

const searchItems = [
  {
    label: '指标类型',
    prop: 'selectedQuatoType',
    component: "el-select",
    options: quotaTypes,
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true, filterable: true },
    optionValue: "value",
    optionLabel: "label",
  },
  {
    label: '计算方式',
    prop: 'selectedCalcType',
    component: "el-select",
    options: calcTypes,
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true, filterable: true },
    optionValue: "value",
    optionLabel: "label",
  },
  {
    component: "el-date-picker",
    label: "选择日期：",
    style: { width: "250px" },
    prop: "selectedDate",
    attrs: {
      placeholder: "请选择",
      clearable: true,
      "value-format": "YYYY-MM-DD",
    },
  },
]

// 图表实例
let myChart = null

// 刷新数据函数
const refreshData = async () => {
  const response = await getSlaveQuatoByCondition({
    quatoTypeValue: queryParams.value.selectedQuatoType,
    maxOrAvg: queryParams.value.selectedCalcType,
    chooseDate: queryParams.value.selectedDate || ''
  })


  let result = response

  if (!result) {
    // 显示没有可用节点的消息
    console.log('当前暂无可用节点')
    return
  }

  try {
    showSlaveQuota(result)
  } catch (error) {
    console.error('解析数据失败:', error)
  }
}

const handleReset = () => {
  queryParams.value = {
    selectedQuatoType: '负载指数',
    selectedCalcType: '平均值',
    selectedDate: ''
  }
  refreshData()
}

// 绘制图表
const showSlaveQuota = (result) => {
  // 确保DOM已更新
  nextTick(() => {
    if (myChart) {
      myChart.dispose()
    }

    const chartDom = chartRef.value
    if (!chartDom) return

    myChart = echarts.init(chartDom)

    const option = {
      title: {
        text: '负载情况'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: result.legend || []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      toolbox: {
        // feature: {
        //   saveAsImage: {}
        // }
      },
      xAxis: result.X || {},
      yAxis: result.Y || {},
      series: result.series || []
    }

    myChart.setOption(option)

    // 响应式处理
    window.addEventListener('resize', () => {
      if (myChart) {
        myChart.resize()
      }
    })
  })
}

// 初始化时加载数据
onMounted(async () => {
  await refreshData()
})
</script>

<style scoped>
.slave-monitor-container {
  border-radius: 4px;
  min-height: 500px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.chart-container {
  position: relative;
  height: 700px;
  background-color: #fff;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>