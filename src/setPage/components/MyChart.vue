<template>
    <div class="chart-wrapper" :style="wrapperStyle">
        <div v-if="conf.props.title" class="chart-title">{{ conf.props.title }}</div>

        <div ref="chartRef" class="chart-content" v-loading="loading" element-loading-text="加载数据中..."></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed, nextTick, inject } from 'vue';
import * as echarts from 'echarts';
// 引入模拟接口
import { mockApi } from '../../api/mock';

const isPreview = inject('isPreview', true);

const props = defineProps({
    // 静态配置 (颜色、标题等)
    conf: {
        type: Object,
        default: () => ({ props: {} })
    },
    // 【核心】动态依赖参数 (由 PageRender 传入)
    apiParams: {
        type: Object,
        default: () => ({})
    },
    // 【核心】绑定字段 (用于从 apiParams 中提取 ID)
    bindKey: {
        type: String,
        default: ''
    }
});

const chartRef = ref(null);
let myChart = null;
const loading = ref(false);

// 计算容器样式
const wrapperStyle = computed(() => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: '10px',
    boxSizing: 'border-box'
}));

// 1. 初始化图表实例
const initChart = () => {
    if (chartRef.value) {
        myChart = echarts.init(chartRef.value);
        myChart.setOption({ title: { show: false }, xAxis: {}, yAxis: {}, series: [] });
    }
};

// 2. 获取数据并渲染
const fetchData = async () => {
    if (!myChart) return;
    loading.value = true;
    try {
        let rawData = [];
        const { dataType = 'api', apiConf, sqlConf, mapping = {} } = props.conf.props;
        const xKey = mapping.xField || 'name';
        const yKey = mapping.yField || 'value';

        if (dataType === 'api') {
            if (!isPreview) {
                // [编辑模式]：使用假数据，展示图表效果
                rawData = [
                    { [xKey]: '示例A', [yKey]: 120 },
                    { [xKey]: '示例B', [yKey]: 200 },
                    { [xKey]: '示例C', [yKey]: 150 },
                    { [xKey]: '示例D', [yKey]: 80 },
                    { [xKey]: '示例E', [yKey]: 70 }
                ];
            } else {
                // [预览模式]：真实请求
                // 1. 提取 ID 参数
                const targetId = props.apiParams?.[props.bindKey] ||
                    props.apiParams?.targetId ||
                    props.apiParams?.id ||
                    props.apiParams?.userId;

                // 如果没 ID，直接不查 (或者查默认)
                if (targetId === undefined || targetId === null) {
                    loading.value = false;
                    return;
                }

                console.log(`[MyChart] 请求真实API, targetId: ${targetId}`);
                // 这里调用你的 mockApi (为了通用性，实际项目这里应该是通用的 axios(apiConf.url))
                const res = await mockApi.getStats({ targetId });
                if (res && res.code === 200) {
                    rawData = res.data; // 预期是 [{date: '周一', count: 120}, ...]
                }
            }
        }

        else if (dataType === 'sql') {
            if (!isPreview) {
                rawData = [
                    { [xKey]: '2023-01', [yKey]: 500 },
                    { [xKey]: '2023-02', [yKey]: 800 }
                ];
            } else {
                console.log('执行SQL:', sqlConf?.sql);
                // 模拟 SQL 查询结果
                rawData = [{ date: 'SqlMon', count: 111 }, { date: 'SqlTue', count: 222 }];
            }
        }

        // 3. 处理数据并渲染图表
        processDataAndRender(rawData);
    } catch (error) {
        console.error('图表数据加载失败', error);
    } finally {
        loading.value = false;
    }
};

const processDataAndRender = (list) => {
    if (!Array.isArray(list)) {
        console.warn('[MyChart] 数据格式不正确，期望数组', list);
        return;
    }
    // 1. 获取字段映射配置
    const mapping = props.conf.props.mapping || {};
    let xField = mapping.xField;
    let yField = mapping.yField;
    // 编辑模式下为了不白屏，强制指定一下假数据的key
    if (!xField && !isPreview) xField = 'name';
    if (!yField && !isPreview) yField = 'value';

    // 2. 提取数据
    const xData = xField ? list.map(item => item[xField]) : [];
    const yData = yField ? list.map(item => item[yField]) : [];

    // 3. 渲染图表
    renderEcharts(xData, yData);
}
const renderEcharts = (xData, yData) => {
    const { chartType = 'bar', color = '#409EFF', xAxisName, unit } = props.conf.props;
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                let res = params[0].name + '<br/>';
                params.forEach(item => {
                    res += `${item.marker} ${item.seriesName}: ${item.value} ${unit || ''}`;
                });
                return res;
            }
        },
        grid: { top: 30, right: 30, bottom: 20, left: 40, containLabel: true },
        xAxis: {
            type: 'category',
            name: xAxisName,
            data: xData
        },
        yAxis: {
            type: 'value',
            name: unit
        },
        series: [{
            name: '数值',
            type: chartType,
            data: yData,
            itemStyle: { color: color },
            smooth: true,      // 折线图平滑
            barMaxWidth: 50,   // 柱状图最大宽度
            animationDuration: 1000
        }]
    };

    myChart.setOption(option, true);
}
// 监听窗口大小
const handleResize = () => myChart && myChart.resize();

onMounted(async () => {
    await nextTick(); // 确保 DOM 渲染完成
    initChart();
    fetchData(); // 初始加载
    window.addEventListener('resize', handleResize);
});

// === 核心：监听依赖参数变化 ===
watch(() => props.conf.props, () => {
    // 编辑模式下，如果改了配置，立即重新 fetch
    if (!isPreview) fetchData();
}, { deep: true });

watch(() => props.apiParams, (newVal) => {
    // 只有当参数真的变了才刷新
    if (newVal) {
        fetchData();
    }
}, { deep: true });

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (myChart) myChart.dispose();
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
    /* 占满剩余高度 */
    width: 100%;
    overflow: hidden;
}
</style>