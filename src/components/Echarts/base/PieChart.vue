<!-- 饼图 -->
<template>
  <BaseChart :topConfig="topConfig" :option="chartOption" :theme="theme" />
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import BaseChart from "../BaseChart.vue";
import { gridFn, legendFn, toolbarFn, echartOptions } from "./base";
import http from "@/utils/request"; // 引入封装的请求工具
// 定义 props
const props = defineProps({
  ...echartOptions,
});

const chartData = ref({
  xAxis: [],
  series: [
    {
      data: [
        { value: 1048, name: "Search Engine" },
        { value: 735, name: "Direct" },
        { value: 580, name: "Email" },
        { value: 484, name: "Union Ads" },
        { value: 300, name: "Video Ads" },
      ],
    },
  ],
});

// 获取数据
const fetchData = () => {
  http.post(props.apiUrl, props.apiParms).then((res) => {
    if (res.code === 200 && res.data) {
      chartData.value = {
        // xAxis: res.data.xAxis.data || [],
        series: res.data.series || [],
      };
    } else {
      // chartData.value = {
      //   xAxis: xAxis,
      //   series: series
      // }
    }
  });
};

const seriesFn = (arr, colors, list = []) => {
  // 检查数据格式：是否为对象数组（每个元素都有data属性）
  const isObjectArray =
    Array.isArray(arr) &&
    arr.length > 0 &&
    typeof arr[0] === "object" &&
    arr[0] !== null &&
    "data" in arr[0];

  if (isObjectArray) {
    // 对象数组格式：[{ name: 'xxx', data: [{value: 100, name: '项目1'}, ...] }, ...]
    for (let i = 0, len = arr.length; i < len; i++) {
      let arrList = arr[i]?.data || [];
      let obj = {
        name: arr[i]?.name || "系列" + (i + 1),
        data: arrList.map((item) => item || 0),
        type: "pie",
        radius: "50%",
        // color: colors[i] || '',
      };
      list.push(obj);
    }
  } else {
    // 简单格式：直接作为单个饼图系列的数据
    // 检查是否为标准饼图数据格式 [{value: 100, name: '项目1'}, ...]
    const isPieDataFormat =
      Array.isArray(arr) &&
      arr.length > 0 &&
      typeof arr[0] === "object" &&
      arr[0] !== null &&
      "value" in arr[0] &&
      "name" in arr[0];

    let data = [];
    if (isPieDataFormat) {
      // 标准饼图数据格式
      data = arr;
    } else if (Array.isArray(arr) && arr.length > 0) {
      // 简单数值数组格式：[100, 200, 300, ...]
      data = arr.map((value, index) => ({
        value: value || 0,
        name: "项目" + (index + 1),
      }));
    }

    let obj = {
      name: "系列1",
      data: data,
      type: "pie",
      radius: "50%",
      // color: colors[0] || '',
    };
    list.push(obj);
  }
  return list;
};

// 计算图表配置
const chartOption = computed(() => {
  let series = seriesFn(chartData.value.series, "");
  let legend = legendFn(
    props.showLegend,
    props.legendPosition,
    props.legendLeft,
    props.legendRight,
    props.legendTop,
    props.legendBottom
  ); // 图例位置
  const option = {
    title: {
      text: props.title,
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    color: props.colors, // 自定义颜色范围
    legend: legend, //  图例位置
    toolbox: toolbarFn(props.showToolbox), // 工具箱
    series: series,
  };
  return option;
});

onMounted(() => {
  fetchData();
});
</script>
