<template>
  <div class="dashboard-wrapper">
    <h2 class="main-title">平台概况视图</h2>

    <div class="charts-row">
      <div class="chart-item">
        <GaugeChart title="运行中作业数" :value="chartData.runningJob.value" />
      </div>

      <div class="chart-item">
        <GaugeChart title="运行中转换数" :value="chartData.runningTrans.value" />
      </div>

      <div class="chart-item">
        <GaugeChart title="节点数" :value="chartData.slave.value" />
      </div>

      <div class="chart-item">
        <GaugeChart title="定时作业数" :value="chartData.scheduler.value" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue';
import GaugeChart from './GaugeChart.vue';
import { getData } from '@/api/kettleApi';

const chartData = ref({
  runningJob: { value: 0 },
  runningTrans: { value: 0 },
  slave: { value: 0 },
  scheduler: { value: 0 }
});

const getGuData = async () => {
  let res = await getData({})
  chartData.value = res
}

onMounted(() => {
  getGuData()
})
</script>

<style scoped>
.dashboard-wrapper {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  height: 95%;
}

.main-title {
  text-align: center;
  color: #409eff;
  /* 蓝色标题 */
  font-weight: normal;
  margin-bottom: 20px;
}

.charts-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-item {
  flex: 1;
  /* 平分宽度 */
  position: relative;
}

/* 核心 CSS：给每个子项右侧加虚线，除了最后一个 */
.chart-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  border-right: 1px dashed #c0c4cc;
  /* 灰色虚线分割 */
}
</style>