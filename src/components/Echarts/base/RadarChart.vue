<!-- 雷达图 -->
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
  xAxis: [],
  series: [],
});

// 获取数据
const fetchData = () => {
  let xAxis =  ["全院", "皮肤科"]
  let series = [
    {
      name: "职称",
      type: "RADAR",
      value: null,
      data: ["88", "12"],
    },
    {
      name: "教学资格",
      type: "RADAR",
      value: null,
      data: ["45", "8"],
    },
    {
      name: "教学职称",
      type: "RADAR",
      value: null,
      data: ["67", "15"],
    },
    {
      name: "社会团体职务",
      type: "RADAR",
      value: null,
      data: ["8", "2"],
    },
    {
      name: "作者身份",
      type: "RADAR",
      value: null,
      data: ["4", "1"],
    },
  ];
  http.post(props.apiUrl, props.apiParms).then((res) => {
    if (res.code === 200 && res.data) {
      chartData.value = {
        xAxis: res.data.xAxis.data || [],
        series: res.data.series || [],
      };
    } else {
      chartData.value = {
        xAxis: xAxis,
        series: series,
      };
    }
  });
};

//  处理series
const seriesFn = (arr, colors, list = [], direction, xAxis) => {
  console.log(arr, "arr");
  if (!xAxis.length) return [];
  let lens = xAxis.length;
  let barWidth = Math.floor(90 / lens);
  for (let i = 0, len = xAxis.length; i < len; i++) {
    list?.push({
      data: [
        {
          name: xAxis[i],
          value: arr.map((item) => item?.data[i] || 0),
        },
      ],
      smooth: true,
      type: "radar",
      // barGap: '50%', // 设置柱子之间的间距
      // barWidth: 12,
      color: colors[i] || "",
      label: {
        show: true,
        position: direction == "category" ? "right" : "top",
      },
    });
  }
  return list;
};
const indicatorFn = (series) => {
  console.log(series, "series");
  if (series && series.length > 0) {
    return series.map((item) => ({
      name: item.name,
    }));
  }
};

// 计算图表配置
const chartOption = computed(() => {
  let series = seriesFn(
    chartData.value.series,
    props.colors,
    props.chartDataType,
    props.direction,
    chartData.value.xAxis
  ); // series处理
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
  let indicator = indicatorFn(chartData.value.series);
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
    radar: {
      // shape: 'circle',
      indicator: indicator,
    },
  };
  console.log(option, "option");
  return option;
});

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>
