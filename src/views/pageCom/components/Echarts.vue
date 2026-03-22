<template>
  <div class="echart_size" :id="props.id"></div>
</template>

<script setup>
import { reactive, ref, nextTick, onMounted, watch } from "vue";
import * as echarts from "echarts";
//  let maxValue = Math.max(...props.datas.yAxis[0]?.data);
//   let minValue = Math.min(...props.datas.yAxis[0]?.data);
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  datas: {
    type: Object,
    required: true,
  },
});
// console.log(props.color, 'rops.color')
let person = reactive({
  // 初始变量
});

onMounted(() => {
  // GetEchar();
  // console.log(22222);
});

// 添加一个函数用于初始化图表
const initChart = () => {
  if (!props.datas || !props.datas.yAxis || !props.datas.xAxis) {
    console.log('数据未准备好或格式不正确');
    return;
  }

  GetEchar();
};

watch(() => props.datas, (newVal, oldVal) => {
  initChart();
}, { deep: true, immediate: true });

const GetEchar = async () => {
  for (let i = 0; i < props.datas.yAxis.length; i++) {
    for (let j = 0; j < props.datas.yAxis[i].data.length; j++) {
      if (props.datas.yAxis[i].data[j] == "-9999") {
        props.datas.yAxis[i].data[j] = "0";
      }
    }
  }

  const myCharts = ref();
  nextTick(() => {
    myCharts.value = echarts?.init(document.getElementById(props.id));
    let option = {
      tooltip: {
        show: false,
        // trigger: 'axis',
        axisPointer: {
          type: "shadow",
          z: 100,
          backgroundColor: "linear-gradient(180deg, rgba(241, 240, 255, 0.05) 2.1%, rgba(255, 255, 255, 0.32) 57.45%, rgba(255, 255, 255, 0.06) 98.26%)",
        },
        formatter: function (params) {
          let a;
          if (params.data.indexOf(".") != -1) {
            a = (Number(params.data) * 100).toFixed(2) + "%";
          } else {
            a = params.data;
          }
          let html = "";
          html += `<div style="color: #fff;font-size: 16px;line-height: 10px;padding: 6px 12px;
                          background: rgba(255, 255, 255, 0.40);
                          border-radius: 8px;
                          backdrop-filter: blur(9px);">
                                <span style="margin-left: 3px;color:#1D2129;">${a}</span>
                          </div>`;
          return html;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: ["50%", "100%"],
        data: props.datas.xAxis,
        axisLine: {
          // 坐标轴 轴线
          show: false, // 是否显示
          onZero: false,
          lineStyle: {
            color: "#5380FD",
            width: 2,
            type: "solid",
          },
        },

        axisLabel: {
          // 坐标轴标签
          show: false, // 是否显示
          inside: false, // 是否朝内
          rotate: 0, // 旋转角度
          margin: 0, // 刻度标签与轴线之间的距离
          color: "#FFFFFF", // 默认取轴线的颜色
          fontFamily: "none",
          fontSize: "18px",
        },
      },

      yAxis: {
        type: "value",
        //  min: minValue * 0.8, // 比最小值小 20%
        // // 动态设置最大值
        // max: maxValue * 1.25 // 比最大值大 25%
        splitLine: {
          // gird区域中的分割线
          show: false, // 是否显示
          lineStyle: {
            color: "#000",
            width: 1.72,
            type: "dashed",
          },
          formatter: function (val) {
            // console.log(val, '=--------------')
            return val * 100 + "%";
          }, //y轴数值，带百分号
        },
        axisLabel: {
          // 坐标轴标签
          show: false, // 是否显示
          inside: false, // 是否朝内
          rotate: 0, // 旋转角度
          margin: 0, // 刻度标签与轴线之间的距离
          color: "#FFFFFF", // 默认取轴线的颜色
          fontFamily: "none",
          fontSize: " 18px",
        },
      },
      series: [
        {
          type: "line",
          symbol: "circle",
          symbolSize: 9,
          smooth: true,
          data: props.datas.yAxis[0]?.data,
          color: ["#FFF"],
          label: {
            show: true,
            position: "top",
            textStyle: {
              color: "#5380FD",
              fontSize: 1,
              fontWeight: 400,
              fontFamily: "none",
            },
            formatter: function (val) {
              return val.value == "-9999" ? "" : (val.value * 100).toFixed(2) + "%";
            }, //显示百分号
          },
          // 背景渐变
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(207,221,255,0.75)",
              },
              {
                offset: 1,
                color: "rgba(207, 221, 255, 0.00)",
              },
            ]),
          },
          lineStyle: {
            width: 3.445,
            type: "solid",
          },
          selectedMode: "single",
        },
      ],
      grid: {
        // 让图表占满容器
        top: "10px",
        left: "0",
        right: "0",
        bottom: "10px",
      },
    };
    myCharts.value.setOption(option);
    // 让图表跟随屏幕自动的去适应
    window.addEventListener("resize", function () {
      myCharts.value.resize();
    });
  });
};
</script>

<style lang="scss" scoped>
.echart_size {
  width: 100px;
  height: 56px;
}
</style>
