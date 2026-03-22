<template>
    <div class="chart-wrapper" :style="wrapperStyle">
        <div v-if="conf.props.title" class="chart-title">{{ conf.props.title }}</div>
        <div ref="chartRef" class="chart-content" v-loading="loading" element-loading-text="加载数据中..."></div>
    </div>
</template>

<script setup>
import { ref, watch, computed, inject, onMounted } from 'vue';
import { useECharts } from '../hooks/useECharts';
import { useRoute } from 'vue-router';
// 引入您系统的默认查询接口 (用于 SQL / 数据集模式)
import { queryChartDataPageApi } from '@/api/settings/index';
// 如果您项目里有封装好的 axios，可以在这里引入，例如：
import http from '../../../utils/request';

const isPreview = inject('isPreview', true);
const route = useRoute();

const props = defineProps({
    conf: { type: Object, default: () => ({ props: {} }) },
    apiParams: { type: Object, default: () => ({}) }
});

const loading = ref(false);
const { chartRef, setOption } = useECharts(props);

const wrapperStyle = computed(() => ({
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    backgroundColor: '#fff', padding: '10px', boxSizing: 'border-box'
}));

// === 1. 核心业务逻辑：获取数据 ===
const fetchData = async () => {
    loading.value = true;
    try {
        let chartData = null;
        const p = props.conf.props;

        // 【核心修改】：只要是编辑模式 (isPreview === false)，一律拦截，使用假数据占位！
        if (isPreview === false) {
            const cType = p.chartType || 'bar';
            chartData = {
                xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                yAxis: { type: 'value', data: [] },
                series: [
                    { name: '演示指标', type: cType.toUpperCase(), data: [120, 200, 150, 80, 70, 110, 130] }
                ]
            };
        } else {
            const formatQueryParams = (paramsObj) => {
                if (!paramsObj) return [];

                const resultParams = [];
                const mappingDict = props.conf.paramsMapping || {};

                Object.keys(paramsObj).forEach(sourceKey => {
                    const sourceData = paramsObj[sourceKey];
                    const rules = mappingDict[sourceKey];

                    if (rules && rules.length > 0) {
                        rules.forEach(rule => {
                            if (!rule.target) return;

                            let extractedValue = '';
                            if (!rule.source) {
                                extractedValue = typeof sourceData === 'object' ? JSON.stringify(sourceData) : sourceData;
                            } else if (sourceData && sourceData[rule.source] !== undefined) {
                                extractedValue = sourceData[rule.source];
                            } else if (rule.source.includes('.')) {
                                const keys = rule.source.split('.');
                                let temp = sourceData;
                                for (let k of keys) {
                                    if (temp && typeof temp === 'object') {
                                        temp = temp[k];
                                    } else {
                                        temp = undefined;
                                        break;
                                    }
                                }
                                if (temp !== undefined) extractedValue = temp;
                            }

                            resultParams.push({
                                columnName: rule.target,
                                columnValue: String(extractedValue)
                            });
                        });
                    } else {
                        if (typeof sourceData === 'object' && sourceData !== null) {
                            const fallbackVal = sourceData.value !== undefined ? sourceData.value : JSON.stringify(sourceData);
                            resultParams.push({ columnName: sourceKey, columnValue: fallbackVal });
                        } else {
                            resultParams.push({ columnName: sourceKey, columnValue: sourceData });
                        }
                    }
                });

                return resultParams;
            };

            const buildCustomParams = () => {
                const customParamsList = p.customParams || [];
                const result = [];
                customParamsList.forEach(param => {
                    if (!param.key) return;
                    let calculatedValue = '';
                    if (param.type === 'static') {
                        calculatedValue = param.value;
                    } else if (param.type === 'script' && param.value) {
                        try {
                            const customFunc = new Function('route', param.value);
                            calculatedValue = customFunc(route);
                        } catch (e) {
                            console.error(`自定义参数[${param.key}]脚本执行报错:`, e);
                        }
                    }
                    result.push({ columnName: param.key, columnValue: calculatedValue });
                });
                return result;
            };

            const finalQueryParams = [
                ...formatQueryParams(props.apiParams),
                ...buildCustomParams()
            ];

            if (p.dataType === 'api') {
                const flatParams = {};
                finalQueryParams.forEach(item => {
                    if (item.columnName) {
                        flatParams[item.columnName] = item.columnValue;
                    }
                });
                const res = await http({
                    url: p.apiConf.url,
                    method: p.apiConf.method || 'POST',
                    data: flatParams
                });
                if (res && res.code === 200) {
                    chartData = res.data;
                }

            } else if (p.dataType === 'sql' || !p.dataType) {
                const requestPayload = {
                    componentId: props.conf.componentId || props.conf.id,
                    pageNum: 1,
                    pageSize: 10000,
                    queryParams: finalQueryParams
                };
                const res = await queryChartDataPageApi(requestPayload);
                if (res && (res.code === 200 || res.code === "200")) {
                    chartData = res.data;
                }
            }
        }

        // 4. 渲染图表
        if (chartData) {
            renderChart(chartData);
        }

    } catch (error) {
        console.error('图表加载失败', error);
    } finally {
        loading.value = false;
    }
};

// === 2. 渲染逻辑：根据 dataType 强制分支解析 ===
const renderChart = (backendData) => {
    if (!backendData) return;

    const p = props.conf.props;
    const colorList = p.colors && p.colors.length > 0 ? p.colors : ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

    const option = {
        title: { show: false },
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        grid: { top: 40, right: 30, bottom: 30, left: 40, containLabel: true },
        color: colorList,
        xAxis: {},
        yAxis: {},
        series: []
    };
    if (p.dataType === 'api') {
        // --------------------------------------------------
        // 解析【自定义接口】的特殊结构 
        // (xAxis是纯数组，yAxis包含单位和数据数组)
        // --------------------------------------------------
        option.xAxis = { type: 'category', data: backendData.xAxis || [] };
        option.yAxis = { type: 'value' };

        if (backendData.yAxis && Array.isArray(backendData.yAxis)) {
            option.series = backendData.yAxis.map((item, index) => {
                const chartType = (p.chartType || 'bar').toLowerCase();
                let seriesItem = {
                    name: item.name || `指标${index + 1}`,
                    type: chartType,
                    data: (item.data || []).map(val => Number(val) || 0)
                };

                // 拼上单位
                if (item.unit) {
                    seriesItem.name = `${seriesItem.name} (${item.unit})`;
                }

                if (chartType === 'bar') {
                    seriesItem.barMaxWidth = 50;
                    seriesItem.itemStyle = { borderRadius: [4, 4, 0, 0] };
                } else if (chartType === 'line') {
                    seriesItem.smooth = true;
                }
                return seriesItem;
            });
        }

    } else {
        // --------------------------------------------------
        // 解析【SQL查询】的原有标准 ECharts 结构
        // --------------------------------------------------
        option.xAxis = backendData.xAxis || { type: 'category', data: [] };
        option.yAxis = backendData.yAxis || { type: 'value' };

        if (backendData.series && Array.isArray(backendData.series)) {
            option.series = backendData.series.map((s, index) => {
                const chartType = (s.type || p.chartType || 'bar').toLowerCase();
                let seriesItem = {
                    name: s.name || p.seriesName || `指标${index + 1}`,
                    type: chartType,
                    data: (s.data || []).map(val => {
                        const num = Number(val);
                        return isNaN(num) ? 0 : num;
                    })
                };

                if (chartType === 'bar') {
                    seriesItem.barMaxWidth = 50;
                    seriesItem.itemStyle = { borderRadius: [4, 4, 0, 0] };
                } else if (chartType === 'line') {
                    seriesItem.smooth = true;
                } else if (chartType === 'scatter') {
                    seriesItem.symbolSize = 12;
                }
                return seriesItem;
            });
        }
    }

    // 无论走哪种解析，最后都统一处理用户在右侧配置面板配置的坐标轴名称
    if (option.xAxis && p.xAxisName) option.xAxis.name = p.xAxisName;
    if (option.yAxis && p.yAxisName) option.yAxis.name = p.yAxisName;

    setOption(option);
};

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