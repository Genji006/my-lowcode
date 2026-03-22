<template>
    <div class="business-chart-wrapper" :style="wrapperStyle">
        <div ref="chartRef" class="chart-content" v-loading="loading" element-loading-text="加载数据中..."></div>
    </div>
</template>

<script setup>
import { ref, watch, computed, inject, onMounted } from 'vue';
import { useECharts } from '../hooks/useECharts';
import { useRoute } from 'vue-router';
// 这里换成您真实的请求接口
import { DetailEChartsListBySqlv2, bianMa } from '@/api/settings/index';

const isPreview = inject('isPreview', true);
const route = useRoute();

const props = defineProps({
    conf: { type: Object, default: () => ({ props: {} }) },
    apiParams: { type: Object, default: () => ({}) }
});

const loading = ref(false);
const { chartRef, setOption } = useECharts(props);

const dynamicTitle = ref('');

const wrapperStyle = computed(() => ({
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    backgroundColor: '#fff', padding: '15px', boxSizing: 'border-box',
    borderRadius: '8px', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)'
}));

// === 1. 加载数据 ===
const fetchData = async () => {
    loading.value = true;
    try {
        let backendData = null;

        if (!isPreview) {
            // [编辑模式占位数据] 模拟您发给我的 JSON 结构
            backendData = {
                xAxis: ["1月", "2月", "3月", "4月"],
                headerInfo: [
                    { tableHead: "JSCURDATEVALUE", tableHeadName: "危重患者占出院人次比例", showName: "比例", comments: "%", echartsShowSign: "1" }
                ],
                yAxis: [
                    [{ JSCURDATEVALUE: "1.65" }],
                    [{ JSCURDATEVALUE: "3.41" }],
                    [{ JSCURDATEVALUE: "1.40" }],
                    [{ JSCURDATEVALUE: "4.97" }]
                ]
            };
        } else {
            let params = {
                indexDefinitionUuid: route.query.indexUuid,
                productUuid: sessionStorage.getItem("menuCode"),
                statisticalPeriod: "0",
                valueTip: 2
            };
            // [运行模式真实请求] 逻辑和之前完全一样，组装参数发请求
            const requestPayload = { ...props.apiParams, ...params };
            // 假设这是您的真实请求
            const res = await DetailEChartsListBySqlv2(requestPayload);
            backendData = res.data;
        }

        if (backendData) {
            renderSingleBarChart(backendData);
        }
    } catch (error) {
        console.error('业务图表加载失败', error);
    } finally {
        loading.value = false;
    }
};

// === 2. 核心：智能解析 JSON 并渲染单柱状图 ===
const renderSingleBarChart = (data) => {
    if (!data || !data.xAxis || !data.headerInfo || !data.yAxis) return;
    const targetMetric = data.headerInfo.find(h => h.echartsShowSign === "1");
    if (!targetMetric) return;
    dynamicTitle.value = `${keshiArr.value.find(k => k.code == data.yAxis[0][0].DEPTCODE)?.name}/${targetMetric.showName}`;

    const seriesData = [];
    data.yAxis.forEach(monthArr => {
        const monthData = monthArr[0] || {};
        const val = Number(monthData[targetMetric.tableHead]) || 0;
        seriesData.push(val);
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line' }
        },
        legend: {
            itemWidth: 12,
            itemHeight: 2,
            itemStyle: {
                color: "FF9F40",
            },
            textStyle: {
                color: "#1D2129",
                fontFamily: "none",
                fontSize: "14px",
                fontWeight: 600,
            },
        },
        grid: { top: 30, right: 20, bottom: 20, left: 20, containLabel: true },
        xAxis: {
            type: 'category',
            data: data.xAxis,
            axisTick: { show: true }, // 隐藏多余的刻度线，更清爽
            axisLine: { lineStyle: { color: '#e0e6ed' } },
            axisLabel: { color: '#666' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { type: 'dashed', color: '#ebeef5' } },
            axisLabel: { color: '#666' }
        },
        series: [
            {
                name: dynamicTitle.value + `(${data.unitOfMeasurement ? data.unitOfMeasurement : ""})`, // 提示框里显示的名称
                type: 'bar',
                barWidth: '35%', // 调整柱子宽度，看着更协调
                data: seriesData,
                itemStyle: {
                    color: "#FF9F40", // 截图中的标准数据蓝
                    // borderRadius: [4, 4, 0, 0] // 顶部优雅的小圆角
                },
                label: {
                    show: true,
                    position: 'top', // 在柱子顶部显示具体数值
                    color: '#666',
                    formatter: `{c}`
                }
            }
        ],
        label: {
            show: true, //开启显示
            position: "top", //在上方显示
            textStyle: {
                //数值样式
                color: "black", //字体颜色
                fontSize: 10, //字体大小
            },
        },
    };

    setOption(option);
};

let keshiArr = ref([]);
const getKeshi = () => {
    bianMa({
        tableName: "BM_KS",
        pageSize: 999,
    }).then(res => {
        keshiArr.value = res.rows;
    });
}
watch(() => props.apiParams, () => {
    if (isPreview) fetchData();
}, { deep: true });

onMounted(() => {
    fetchData();
    getKeshi();
});
</script>

<style scoped>
.dynamic-title {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    flex-shrink: 0;
}

.chart-content {
    flex: 1;
    width: 100%;
}
</style>