<template>
    <div class="chart-wrapper">
        <div ref="chartRef" class="echarts-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, shallowRef } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
    title: String,
    chartData: {
        type: Object,
        required: true
    }
});

const chartRef = ref(null);
// 1. 使用 shallowRef 存储 echarts 实例，提升性能
const myChart = shallowRef(null);
// 2. 声明 ResizeObserver 变量
let resizeObserver = null;

// 图表初始化与配置
const initChart = () => {
    if (!chartRef.value) return;

    if (myChart.value) myChart.value.dispose();
    myChart.value = echarts.init(chartRef.value);

    const { legend, X, Y, series } = props.chartData;

    // 统一线条样式（空心圆点，配置颜色）
    const formattedSeries = series.map((item, index) => ({
        ...item,
        symbol: 'emptyCircle',
        symbolSize: 6,
        itemStyle: {
            color: index === 0 ? '#ef5b5b' : '#5b89ef' // 匹配图中的红蓝色调
        }
    }));

    const option = {
        // 标题
        title: {
            text: props.title,
            left: 0,
            top: 0,
            textStyle: { fontSize: 16, color: '#333' }
        },
        // 图例
        legend: {
            data: legend,
            top: 2,
            icon: 'emptyCircle', // 图例图标设置为空心圆
            textStyle: { color: '#666' }
        },
        // 右上角下载工具
        toolbox: {
            right: 0,
            top: 0,
            feature: {
                saveAsImage: { iconStyle: { borderColor: '#666' } }
            }
        },
        // 绘图网格区域（留出顶部标题空间）
        grid: {
            top: 50,
            left: 10,
            right: 20,
            bottom: 10,
            containLabel: true
        },
        // X轴配置
        xAxis: {
            ...X,
            axisLine: { lineStyle: { color: '#ccc' } },
            axisTick: { show: false },
            axisLabel: { color: '#666' }
        },
        // Y轴配置（合并传入的 min/max/formatter 等）
        yAxis: {
            ...Y,
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { type: 'solid', color: '#ebeef5' } },
            axisLabel: {
                color: '#666',
                formatter: Y.axisLabel?.formatter || '{value}'
            }
        },
        series: formattedSeries
    };

    myChart.value.setOption(option);
};

// 监听数据变化重新渲染
watch(() => props.chartData, initChart, { deep: true });

onMounted(() => {
    initChart();

    // 3. 核心修改：监听图表容器 DOM 的尺寸变化
    resizeObserver = new ResizeObserver(() => {
        if (myChart.value) {
            myChart.value.resize(); // 只要容器尺寸变了，就强制图表重绘适配
        }
    });

    if (chartRef.value) {
        resizeObserver.observe(chartRef.value);
    }
});

onUnmounted(() => {
    // 4. 清理工作：断开 observer 监听并销毁图表
    if (resizeObserver && chartRef.value) {
        resizeObserver.unobserve(chartRef.value);
        resizeObserver.disconnect();
    }
    if (myChart.value) {
        myChart.value.dispose();
    }
});
</script>

<style scoped>
.chart-wrapper {
    width: 100%;
    height: 250px;
    /* 单个图表高度 */
    padding: 10px;
    box-sizing: border-box;
}

.echarts-container {
    width: 100%;
    height: 100%;
}
</style>