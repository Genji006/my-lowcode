<template>
    <div class="chart-wrapper" :style="wrapperStyle">
        <div v-if="conf.props.title" class="chart-title">{{ conf.props.title }}</div>
        <div ref="chartRef" class="chart-content" v-loading="loading" element-loading-text="加载数据中..."></div>
    </div>
</template>

<script setup>
import { ref, watch, computed, inject, onMounted } from 'vue';
import { useECharts, getParsedData } from '../hooks/useECharts';
import { mockApi } from '@/api/mock';

const isPreview = inject('isPreview', true);

const props = defineProps({
    conf: { type: Object, default: () => ({ props: {} }) },
    apiParams: { type: Object, default: () => ({}) },
    bindKey: { type: String, default: '' }
});

const loading = ref(false);
const { chartRef, setOption } = useECharts(props);

const wrapperStyle = computed(() => ({
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    backgroundColor: '#fff', padding: '10px', boxSizing: 'border-box'
}));

// === 1. 策略定义：处理不同图表的 Option ===
const strategies = {
    bar: {
        getOption: (propsData, xData, yData) => ({
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: xData, name: propsData.xAxisName },
            yAxis: { type: 'value', name: propsData.yAxisName },
            series: [{
                type: 'bar', data: yData, name: propsData.seriesName,
                itemStyle: { color: propsData.color, borderRadius: [4, 4, 0, 0] },
                barMaxWidth: 50
            }]
        })
    },
    line: {
        getOption: (propsData, xData, yData) => ({
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: xData, name: propsData.xAxisName },
            yAxis: { type: 'value', name: propsData.yAxisName },
            series: [{
                type: 'line', data: yData, name: propsData.seriesName,
                itemStyle: { color: propsData.color },
                smooth: true, areaStyle: { opacity: 0.1 }
            }]
        })
    },
    scatter: {
        getOption: (propsData, xData, yData) => ({
            tooltip: { trigger: 'item' },
            xAxis: { type: 'value', name: propsData.xAxisName, scale: true },
            yAxis: { type: 'value', name: propsData.yAxisName, scale: true },
            series: [{
                type: 'scatter',
                // 散点图需要 [[x,y], [x,y]] 格式
                data: xData.map((x, i) => [x, yData[i]]),
                name: propsData.seriesName,
                symbolSize: 12, itemStyle: { color: propsData.color }
            }]
        })
    }
};

// === 2. 核心业务逻辑：获取数据 ===
const fetchData = async () => {
    loading.value = true;
    try {
        let rawData = [];
        const { dataType = 'api', apiConf, sqlConf, staticData, mapping = {}, chartType } = props.conf.props;
        // 映射字段名
        const xKey = mapping.xField || 'name';
        const yKey = mapping.yField || 'value';

        // 辅助函数：生成散点图专用假数据
        const getScatterMock = () => [
            { [xKey]: 10, [yKey]: 8.04 },
            { [xKey]: 8, [yKey]: 6.95 },
            { [xKey]: 13, [yKey]: 7.58 },
            { [xKey]: 9, [yKey]: 8.81 },
            { [xKey]: 11, [yKey]: 8.33 }
        ];

        // 辅助函数：生成柱状/折线图通用假数据
        const getNormalMock = () => [
            { [xKey]: '示例A', [yKey]: 120 },
            { [xKey]: '示例B', [yKey]: 200 },
            { [xKey]: '示例C', [yKey]: 150 },
            { [xKey]: '示例D', [yKey]: 80 }
        ];


        if (dataType === 'api') {
            if (!isPreview) {
                // [编辑模式]：造假数据
                rawData = (chartType === 'scatter') ? getScatterMock() : getNormalMock();
            } else {
                // [预览模式]：真实请求
                const targetId = props.apiParams?.[props.bindKey];
                const res = await mockApi.getStats({ targetId, url: apiConf?.url });
                if (res && res.code === 200) rawData = res.data;
            }
        }
        else if (dataType === 'sql') {
            if (!isPreview) {
                rawData = (chartType === 'scatter') ? getScatterMock() : [{ [xKey]: '2023-01', [yKey]: 500 }, { [xKey]: '2023-02', [yKey]: 800 }];
            } else {
                rawData = [{ [xKey]: 'SqlMon', [yKey]: 111 }, { [xKey]: 'SqlTue', [yKey]: 222 }];
            }
        }

        // 3. 数据清洗 & 渲染
        renderChart(rawData, xKey, yKey);

    } catch (error) {
        console.error('图表加载失败', error);
    } finally {
        loading.value = false;
    }
};

// === 3. 渲染逻辑 ===
const renderChart = (list, xKey, yKey) => {
    if (!Array.isArray(list)) return;

    const p = props.conf.props;
    const type = p.chartType || 'bar';

    // 提取 X/Y 轴数据
    const xData = list.map(item => item[xKey]);
    const yData = list.map(item => item[yKey]);

    const colorList = p.colors && p.colors.length > 0 ? p.colors : [p.color || '#409EFF'];

    // 基础 Option
    const baseOption = {
        title: { show: false }, // 标题由外部 div 接管
        grid: { top: 30, right: 30, bottom: 20, left: 40, containLabel: true },
        legend: { bottom: 0 },
        color: colorList,
    };

    // 策略 Option
    const strategy = strategies[type] || strategies.bar;
    const specificOption = strategy.getOption(p, xData, yData);

    setOption({ ...baseOption, ...specificOption });
};

// === 4. 监听器 ===
watch(() => props.conf.props, () => {
    if (!isPreview) fetchData();
}, { deep: true });

watch(() => props.apiParams, (newVal) => {
    if (newVal) fetchData();
}, { deep: true });

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.chart-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
    flex-shrink: 0;
}

.chart-content {
    flex: 1;
    width: 100%;
    overflow: hidden;
}
</style>