<template>
    <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';

// 接收父组件传入的标题和数值
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        default: 0
    }
});

const chartRef = ref(null);
let myChart = null;

const initChart = () => {
    if (chartRef.value) {
        myChart = echarts.init(chartRef.value);
        setOptions();
    }
};

const setOptions = () => {
    const option = {
        series: [
            {
                type: 'gauge',
                center: ['50%', '55%'], // 调整圆心位置
                radius: '85%',          // 半径大小
                startAngle: 210,        // 起始角度（左下）
                endAngle: -30,          // 结束角度（右下）
                min: 0,
                max: 100,
                splitNumber: 10,

                // 仪表盘轴线（颜色带）
                axisLine: {
                    lineStyle: {
                        width: 20, // 轴线宽度
                        color: [
                            [0.2, '#91c7ae'], // 0-20% 绿色
                            [0.8, '#63869e'], // 20-80% 蓝色 (图中大部分是蓝色)
                            [1, '#c23531']    // 80-100% 红色
                        ]
                    }
                },

                // 指针样式
                pointer: {
                    icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', // 使用默认或自定义SVG路径
                    length: '60%',
                    width: 6,
                    offsetCenter: [0, '-10%'],
                    itemStyle: {
                        color: '#91c7ae' // 指针颜色
                    }
                },

                // 小刻度样式（白色短线）
                axisTick: {
                    length: 6,
                    lineStyle: { color: '#fff', width: 1 },
                    distance: -20 // 负值表示向内绘制，使其位于色带上
                },

                // 分割线样式（白色长线）
                splitLine: {
                    length: 20,
                    lineStyle: { color: '#fff', width: 2 },
                    distance: -20
                },

                // 刻度标签（0, 10, 20...）
                axisLabel: {
                    color: '#999',
                    distance: 25, // 距离轴线的距离
                    fontSize: 10
                },

                // 仪表盘中心的数值
                detail: {
                    valueAnimation: true,
                    formatter: '{value}',
                    fontSize: 30,
                    color: '#91c7ae', // 数值颜色
                    offsetCenter: [0, '40%'] // 位置调整到下方
                },

                // 仪表盘下方标题
                title: {
                    offsetCenter: [0, '70%'], // 标题位置
                    fontSize: 14,
                    color: '#333'
                },

                data: [
                    {
                        value: props.value,
                        name: props.title // 这里对应 title 配置
                    }
                ]
            }
        ]
    };
    myChart.setOption(option);
};

// 监听数据变化，动态更新
watch(() => props.value, () => {
    if (myChart) {
        setOptions();
    }
});

onMounted(() => {
    initChart();
    // 监听窗口大小变化
    window.addEventListener('resize', () => myChart && myChart.resize());
});

onUnmounted(() => {
    if (myChart) myChart.dispose();
});
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 250px;
    /* 必须给高度 */
}
</style>