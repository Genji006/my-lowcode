<template>
    <div style="width:170px;height:170px;margin:15px 35px;" id="echartsID"></div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts';
// import 'echarts-liquidfill'

const prop = defineProps({
    data: Number,
})
const decimal = ref(0)
const echartsFn = () => {
    console.log(decimal.value, 'decimal.value1');
    let myCharts = echarts.init(document.getElementById('echartsID'))
    nextTick(() => {
        let option = {
            series: [{
                type: 'liquidFill',
                radius: '100%',
                waveAnimation: true,
                color: [
                    {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: '#66b2ff', // 浅蓝色
                            },
                            {
                                offset: 1,
                                color: '#448aff', // 深蓝色
                            },
                        ],
                        globalCoord: false,
                    },
                ],
                data: [{
                    value: decimal.value,
                    direction: 'left',
                    itemStyle: {
                        normal: {
                            color: 'rgba(83, 128, 253, 0.6)'
                        }
                    }
                },
                {
                    value: decimal.value,
                    direction: 'right', // 相反方向
                    itemStyle: {
                        normal: {
                            color: 'rgba(83, 128, 253, 0.6)'
                        }
                    }
                }],
                outline: {
                    show: true,
                    borderDistance: 0,
                    itemStyle: {
                        borderColor: 'rgba(83, 128, 253, 0.2)',
                        opacity: 1,
                        borderWidth: 1,
                        shadowColor: 'rgba(83, 128, 253, 1)',
                        shadowBlur: 15, // 减小阴影模糊度
                        shadowOffsetX: 0, // 水平偏移
                        shadowOffsetY: 10,
                    }
                },
                itemStyle: {
                    opacity: 1,
                    shadowBlur: 0,
                    color: "rgba(83, 128, 253, 1)"
                },
                backgroundStyle: {
                    color: 'rgba(102, 178, 255, 0.1)',
                    opacity: 0.1,
                    shadowColor: 'rgba(83, 128, 253, 1)'
                },
                label: { // 数据展示样式
                    show: true,
                    color: 'rgba(83, 128, 253, 1)',
                    insideColor: '#fff',
                    fontSize: 30,
                    fontWeight: 500,
                    align: 'center',
                    baseline: 'middle',
                    position: 'inside',
                    position: ['50%', '30%'],
                }
            }]
        }
        myCharts.setOption(option)
    })
}


watch(() => prop.data, (newPro, oldPro) => {
    decimal.value = prop.data / 100
    console.log(decimal.value, 'decimal.value2');
    nextTick(() => {
        echartsFn()
    })
}, {
    immediate: true // 立即执行一次回调函数
})


onMounted(() => {
    nextTick(() => {
        echartsFn()
    })
})

</script>

<style></style>