<template>
    <div class="chart-wrapper" :style="wrapperStyle">
        <div v-if="conf.props.title" class="chart-title">{{ conf.props.title }}</div>
        <div ref="chartRef" class="chart-content" v-loading="loading" element-loading-text="加载数据中..."></div>
    </div>
</template>

<script setup>
import { ref, watch, computed, inject, onMounted } from 'vue';
import { useECharts, getParsedData } from '../hooks/useECharts'; // 引入Hook
import { mockApi } from '@/api/mock'; // 引入API

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

        // 1. 获取字段映射 (饼图默认: name -> 扇区名, value -> 数值)
        const nameKey = mapping.xField || 'name';
        const valKey = mapping.yField || 'value';

        if (dataType === 'api') {
            if (!isPreview) {
                // [编辑模式]：生成演示数据，防止白屏
                rawData = [
                    { [nameKey]: '数据1', [valKey]: 1048 },
                    { [nameKey]: '数据2', [valKey]: 735 },
                    { [nameKey]: '数据3', [valKey]: 580 },
                    { [nameKey]: '数据4', [valKey]: 484 }
                ];
            } else {
                // [预览模式]：真实请求
                const targetId = props.apiParams?.[props.bindKey];
                const res = await mockApi.getStats({ targetId, url: apiConf?.url });
                if (res && res.code === 200) rawData = res.data;
            }
        }
        else if (dataType === 'sql') {
            if (!isPreview) {
                rawData = [{ [nameKey]: 'SQL数据A', [valKey]: 500 }, { [nameKey]: 'SQL数据B', [valKey]: 300 }];
            } else {
                rawData = [{ [nameKey]: 'SqlItem1', [valKey]: 111 }, { [nameKey]: 'SqlItem2', [valKey]: 222 }];
            }
        }

        // 3. 渲染图表
        renderPie(rawData, nameKey, valKey);

    } catch (error) {
        console.error('[MyPieChart] 加载失败', error);
    } finally {
        loading.value = false;
    }
};

// === 渲染逻辑 ===
const renderPie = (list, nameKey, valKey) => {
    if (!Array.isArray(list)) return;

    // 数据清洗：转换为 ECharts Pie 需要的 { name, value } 格式
    const data = list.map(item => ({
        name: item[nameKey],
        value: item[valKey]
    }));

    const p = props.conf.props;
    const colorList = p.colors && p.colors.length > 0 ? p.colors : [p.color || '#409EFF'];
    const option = {
        // 标题已由外部 div 接管，这里可以留空或做副标题
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)' // 显示百分比
        },
        legend: {
            bottom: '0%',
            left: 'center'
        },
        color: colorList,
        series: [
            {
                name: p.seriesName || '访问来源',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                    color: p.color
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold'
                    }
                },
                labelLine: { show: false },
                data: data
            }
        ]
    };

    // 如果用户配置了指定颜色，覆盖默认色板（Pie图通常不需要单一颜色，这里仅作兼容）
    // if (p.color) option.color = [p.color];

    setOption(option);
};

// === 监听器 ===
// 监听配置变化 (编辑模式下实时刷新)
watch(() => props.conf.props, () => {
    if (!isPreview) fetchData();
}, { deep: true });

// 监听 API 参数变化 (预览模式下联动刷新)
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