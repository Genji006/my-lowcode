<!-- 漏斗图 -->
<template>
  <BaseChart :topConfig="topConfig" :option="chartOption" :theme="theme" />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BaseChart from "../BaseChart.vue";
import http from "@/utils/request"; // 引入封装的请求工具
import { gridFn, legendFn, toolbarFn, echartOptions } from "./base";
// 定义 props
const props = defineProps({
  ...echartOptions,
  stack: {
    type: [String, Boolean],
  },
  // 数据
  series: {
    type: Array,
    default: () => [],
  },
  // X轴数
  xAxis: {
    type: Array,
    default: () => [],
  },
  // 方向
  direction: {
    type: String,
  },
});

// 定义 emits
const emit = defineEmits([
  "chart-ready",
  "chart-click",
  "chart-dblclick",
  "chart-mouseover",
  "chart-mouseout",
]);
// 组件内部数据
const chartData = ref({
  series: [],
});

// 获取数据
const fetchData = () => {
  let arr = Array.from({ length: 5 }, (v, k) =>
    Math.floor(Math.random() * 100)
  );
  let series = [
    {
      data: [
        { value: 63, name: "Show" },
        { value: 63, name: "Click" },
        { value: 53, name: "Visit" },
        { value: 2, name: "Order" },
        { value: 44, name: "Inquiry" },
      ],
    },
  ];
  // console.log(props, '23');
  http.post(props.apiUrl, props.apiParms).then((res) => {
    if (res.code === 200 && res.data) {
      chartData.value = {
        series: res.data.series || [],
      };
    } else {
      chartData.value = {
        series: series,
      };
    }
  });
};

//  处理series
const seriesFn = (arr, colors, chartDataType, direction, stack) => {
  let stackObj = stack ? { stack: "total" } : {};
  let processedData = [];

  // 检查数据格式
  const isObjectArray =
    Array.isArray(arr) &&
    arr.length > 0 &&
    typeof arr[0] === "object" &&
    arr[0] !== null;

  if (isObjectArray) {
    // 对象数组格式：[{ data: [...] }, ...]
    processedData = arr;
  } else {
    // 简单数组格式：[120, 200, ...]
    // 转换为漏斗图所需的格式
    const funnelData = arr.map((value, index) => ({
      value: value,
      name: `项目${index + 1}`,
    }));
    processedData = [{ data: funnelData }];
  }

  return processedData.map((seriesItem, index) => {
    // 为数据项添加颜色
    const coloredData = seriesItem.data.map((dataItem, dataIndex) => ({
      ...dataItem,
      itemStyle: {
        color: colors[dataIndex] || colors[0] || "#5470c6",
      },
    }));

    return {
      name: seriesItem.name || `系列${index + 1}`,
      data: coloredData,
      smooth: true,
      type: "funnel",
      ...stackObj,
      color: colors[index] || "",
      label: {
        show: true,
        position: direction == "category" ? "right" : "inside",
      },
      labelLine: {
        show: true,
      },
      sort: "none",
      maxSize: "100%",
      minSize: "20%",
    };
  });
};

// 计算图表配置
const chartOption = computed(() => {
  let series = seriesFn(
    chartData.value.series,
    props.colors,
    props.chartDataType,
    props.direction,
    props.stack
  ); // series处理
  let legend = legendFn(
    props.showLegend,
    props.legendPosition,
    props.legendLeft,
    props.legendRight,
    props.legendTop,
    props.legendBottom
  ); // 图例位置
  // 从series数据中动态提取图例数据
  if (series.length > 0 && series[0].data.length > 0) {
    legend.data = series[0].data.map((item) => item.name);
  }
  let grid = gridFn(
    props.showGrid,
    props.gridLeft,
    props.gridRight,
    props.gridTop,
    props.gridBottom
  ); // 网格
  const option = {
    title: {
      text: props.title,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: legend,
    toolbox: toolbarFn(props.showToolbox), // 工具箱
    grid: grid,
    series: series,
  };
  console.log(option, "option");
  return option;
});

defineExpose({
  fetchData,
});

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>
