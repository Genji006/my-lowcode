<!-- 散点图 -->
<template>
  <BaseChart :topConfig="topConfig" :option="chartOption" :theme="theme" />
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import BaseChart from "../BaseChart.vue";
import { gridFn, legendFn, echartOptions, toolbarFn, hexToRgb } from "./base";
import http from "@/utils/request"; // 引入封装的请求工具
// 定义 props
const props = defineProps({
  ...echartOptions,
  // 散点大小
  symbolSize: {
    type: [Number, Function],
    default: 10,
  },
  // 散点形状
  symbol: {
    type: String,
    default: "circle",
    validator: (value) =>
      [
        "circle",
        "rect",
        "roundRect",
        "triangle",
        "diamond",
        "pin",
        "arrow",
        "none",
      ].includes(value),
  },
  // X轴名称
  xAxisName: {
    type: String,
    default: "X轴",
  },
  // Y轴名称
  yAxisName: {
    type: String,
    default: "Y轴",
  },
});

const chartData = ref({
  xAxis: [],
  series: [],
});

// 获取数据
const fetchData = () => {
  let dataList = [
    {
      data: [
        [23, 54],
        [-88, -90],
      ],
      name: "国家级",
      radioSize: 25,
    },
    {
      data: [[12, 30]],
      name: "省级",
      radioSize: 20,
    },
    {
      data: [[42, 30]],
      name: "地市级",
      radioSize: 15,
    },
    {
      data: [[50, 68]],
      name: "其他",
      radioSize: 10,
    },
  ];

  // 定义名称到尺寸的映射关系
  const nameToSizeMap = {
    国家级: 25,
    省级: 20,
    地市级: 15,
    其他: 10,
  };
  http.post(props.apiUrl, props.apiParms).then((res) => {
    if (res.code === 200 && res.data) {
      // 添加散点大小
      const processedSeries = res.data.series.map((item) => {
        const radioSize = nameToSizeMap[item.name] || props.symbolSize || 10;
        return {
          ...item,
          radioSize,
        };
      });
      chartData.value = {
        series: processedSeries,
      };
    } else {
      chartData.value = {
        // xAxis: xAxis,
        series: dataList,
      };
    }
  });
};

// series数据
const seriesFn = (dataList, color, series = []) => {
  // 检查数据格式：是否为对象数组（每个元素都有data属性）
  const isObjectArray = 
    Array.isArray(dataList) && 
    dataList.length > 0 && 
    typeof dataList[0] === 'object' && 
    dataList[0] !== null && 
    'data' in dataList[0]
  
  if (isObjectArray) {
    // 对象数组格式：[{ name: 'xxx', data: [[1, 2], [3, 4]] }, ...]
    for (let i = 0, len = dataList.length; i < len; i++) {
      let obj = {
        name: dataList[i].name || '系列' + (i + 1),
        type: "scatter",
        itemStyle: {
          color: hexToRgb(color[i], 0.5),
          borderColor: hexToRgb(color[i], 1),
        },
        symbolSize: dataList[i].radioSize || props.symbolSize,
        data: dataList[i].data,
      };
      series.push(obj);
    }
  } else {
    // 简单数值数组格式：[[1, 2], [3, 4], [5, 6]]
    let obj = {
      name: '系列1',
      type: "scatter",
      itemStyle: {
        color: hexToRgb(color[0], 0.5),
        borderColor: hexToRgb(color[0], 1),
      },
      symbolSize: props.symbolSize,
      data: dataList,
    };
    series.push(obj);
  }
  return series;
};

// 计算图表配置
const chartOption = computed(() => {
  let legend = legendFn(
    props.showLegend,
    props.legendPosition,
    props.legendLeft,
    props.legendRight,
    props.legendTop,
    props.legendBottom
  ); // 图例位置
  let grid = gridFn(
    props.showGrid,
    props.gridLeft,
    props.gridRight,
    props.gridTop,
    props.gridBottom
  ); // 网格
  let series = seriesFn(chartData.value.series, props.colors);
  // 处理数据格式
  const option = {
    title: {
      text: props.title,
      left: "center",
    },
    tooltip: {
      trigger: "item",
      //提示内容更多设置
      // formatter: function (params) {
      //   // 自定义提示内容
      //   if (params.value && params.value.length >= 2) {
      //     return `${params.seriesName}
      //       ${params.marker} ${params.name || ""}<br />
      //       X: ${params.value[0]}<br />
      //       Y: ${params.value[1]}`;
      //   }
      //   return `${params.seriesName}: ${params.value}`;
      // },
    },
    legend: legend,
    toolbox: toolbarFn(props.showToolbox),
    grid: grid,
    xAxis: {},
    yAxis: {},
    series: series,
  };
  return option;
});

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>