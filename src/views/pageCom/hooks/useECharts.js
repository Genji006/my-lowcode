// 图表实例管理，负责生命周期管理
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';

export function useECharts(props) {
    const chartRef = ref(null);
    let chartInstance = null;

    // 初始化
    const initChart = () => {
        if (chartRef.value) {
            // 避免重复初始化
            if (chartInstance) chartInstance.dispose();
            chartInstance = echarts.init(chartRef.value);
        }
    };

    // 更新配置 (核心方法)
    const setOption = (option) => {
        if (!chartInstance) initChart();
        if (chartInstance && option) {
            // true 表示不合并配置，而是重置，防止不同类型切换时样式残留
            chartInstance.setOption(option, true);
        }
    };

    // 窗口/容器大小变化监听
    let resizeObserver = null;
    const setupResize = () => {
        if (!chartRef.value) return;

        resizeObserver = new ResizeObserver(() => {
            chartInstance && chartInstance.resize();
        });
        resizeObserver.observe(chartRef.value);
    };

    onMounted(() => {
        initChart();
        setupResize();
    });

    onBeforeUnmount(() => {
        if (chartInstance) {
            chartInstance.dispose();
            chartInstance = null;
        }
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    });

    return {
        chartRef,
        chartInstance,
        setOption
    };
}

// 辅助工具：安全的 JSON 解析
export function getParsedData(jsonStr) {
    try {
        return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    } catch (e) {
        console.warn('JSON Parse Error:', e);
        return [];
    }
}