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

// === 核心业务逻辑：获取数据 ===
const fetchData = async () => {
    loading.value = true;
    try {
        let rawData = [];
        const { dataType = 'api', apiConf, sqlConf, staticData, mapping = {} } = props.conf.props;

        // 映射字段：xField -> 系列名, yField -> 数值数组
        const nameKey = mapping.xField || 'name';
        const valKey = mapping.yField || 'value';

        if (dataType === 'api') {
            if (!isPreview) {
                // [编辑模式] Mock
                rawData = [
                    { [nameKey]: '系列1', [valKey]: [42, 30, 100, 50, 50, 80] },
                    { [nameKey]: '系列2', [valKey]: [50, 40, 80, 60, 20, 10] }
                ];
            } else {
                const targetId = props.apiParams?.[props.bindKey];
                const extraParams = { type: 'radar' };
                const res = await mockApi.getStats({ targetId, url: apiConf?.url, ...extraParams });
                if (res && res.code === 200) rawData = res.data;
            }
        }
        else if (dataType === 'sql') {
            if (!isPreview) {
                rawData = [{ [nameKey]: 'SQL系列A', [valKey]: [60, 70, 80, 90, 50, 40] }];
            } else {
                console.log('执行SQL:', sqlConf?.sql);
                rawData = [{ [nameKey]: 'Result', [valKey]: [100, 100, 100, 100, 100, 100] }];
            }
        }

        renderRadar(rawData, nameKey, valKey);

    } catch (error) {
        console.error('[MyRadarChart] 加载失败', error);
    } finally {
        loading.value = false;
    }
};

// === 渲染逻辑 ===
const renderRadar = (list, nameKey, valKey) => {
    if (!Array.isArray(list)) return;

    const p = props.conf.props;
    const colorList = p.colors && p.colors.length > 0 ? p.colors : [p.color || '#409EFF'];
    // 1. 解析雷达指标 (Indicator)
    // 这是雷达图必须的配置，定义了维度的名称和最大值
    const indicators = getParsedData(p.radarIndicators);
    if (!indicators || indicators.length === 0) {
        console.warn('雷达图缺少 indicators 配置');
        return;
    }

    // 2. 数据清洗
    const data = list.map(item => ({
        value: item[valKey],
        name: item[nameKey]
    }));

    const option = {
        color: colorList,
        tooltip: { trigger: 'item' },
        legend: {
            bottom: 0,
            data: data.map(i => i.name)
        },
        radar: {
            // 形状：'circle' 或 'polygon'
            shape: 'polygon',
            indicator: indicators,
            radius: '65%',
            splitNumber: 4,
            axisName: {
                color: '#999',
                backgroundColor: '#fff',
                borderRadius: 3,
                padding: [3, 5]
            },
            splitArea: {
                areaStyle: {
                    color: ['#f8f9fa', '#fff'],
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10
                }
            }
        },
        series: [
            {
                name: p.title || '雷达图',
                type: 'radar',
                areaStyle: { opacity: 0.2 },
                lineStyle: { width: 2 },
                symbol: 'circle',
                symbolSize: 6,
                data: data,
                itemStyle: p.color ? { color: p.color } : undefined
            }
        ]
    };

    setOption(option);
};

// === 监听器 ===
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