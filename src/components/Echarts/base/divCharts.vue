<template>
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column">
    <div class="titleEchart">
      <div style="display: flex; width: 100%; justify-content: space-between">
        <div style="display: flex; width: 100%">
          <img src="@/assets/ItemImg/rypz.svg" alt="" class="bmr" style="width: 20px" />
          <span>医师团队人员结构</span>
          <span
            style="
              padding-left: 5px;
              font-size: 12px;
              padding-top: 3px;
              box-sizing: border-box;
              color: rgba(128, 128, 128, 1);
            "
          >
            {{ "2024年度" }}</span
          >
        </div>
        <div>
          <img
            src="/Icon/downBlack.svg"
            alt=""
            class="one-image"
            @click="downloadAsImage()"
            style="cursor: pointer"
          />
        </div>
      </div>
    </div>
    <div
      v-for="(items, index) in legendDataList"
      :key="index"
      class="legend-container"
      ref="legendContainer"
    >
      <div
        v-for="(item, index) in items.legendData"
        :key="index"
        class="item"
        :style="getItemStyle(item, items.legendData)"
        @mouseenter="showTooltip(index, items.legendName)"
        @mouseleave="hideTooltip"
      >
        {{ item.label }}
        <div
          v-if="activeIndex === index && legendNameFlag === items.legendName"
          class="tooltip"
        >
          {{ item.label }}:{{ item.count }}人
        </div>
      </div>
      <span class="legend-name">{{ items.legendName }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from "vue";
import html2canvas from 'html2canvas'; // 引入库

const legendContainer = ref(null);
// 当前激活的图例索引
const activeIndex = ref(-1);
const legendNameFlag = ref("");
const props = defineProps({
  legendDataList: {
    type: Array,
    required: true,
  },
  // 图例数据
  legendData: {
    type: Array,
    required: true,
    default: () => [],
  },
  legendName: {
    type: String,
    required: true,
  },
});

// 计算每个图例项的样式
const maxValue =
  props.legendData.length > 0
    ? Math.max(...props.legendData.map((item) => item.count))
    : 1;

const maxValueFn = (item) => {
  return item.length > 0 ? Math.max(...item.map((item) => item.count)) : 1;
};
const getItemStyle = (item, val) => ({
  width: `${(item.count / maxValueFn(val)) * 50}%`,
  backgroundColor: item.bgColor,
});

// 显示提示框
const showTooltip = (index, nameData) => {
  activeIndex.value = index;
  legendNameFlag.value = nameData;
};

// 隐藏提示框
const hideTooltip = () => {
  activeIndex.value = -1;
  legendNameFlag.value = "";
};

const downloadAsImage = async () => {
    await nextTick();
    const container = legendContainer.value && Array.isArray(legendContainer.value) 
      ? legendContainer.value 
      : [legendContainer.value];
       // 过滤出已挂载到文档中的元素
    const validContainers = container.filter(container => container && container.isConnected);
    if (validContainers.length === 0) {
      console.warn('没有有效的元素可以生成图片');
      return;
    }
    // // 检查元素是否存在且已挂载到文档中
    // if (!container || !container.isConnected) {
    //   console.warn('元素未挂载到文档中，无法生成图片');
    //   // 可以尝试短暂延迟后重试
    //   setTimeout(downloadAsImage, 100);
    //   return;
    // }
    try {
      if (validContainers.length === 1) {
        // 将div转为canvas
        const canvas = await html2canvas(container, {
            useCORS: true, // 允许跨域图片
            scale: 2       // 提高分辨率
        });
        // 转换为图片URL
        const image = canvas.toDataURL('image/png');
        // 创建下载链接
        const link = document.createElement('a');
        link.href = image;
        link.download = '医师团队结构图.png'; // 文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }else {
        // 如果有多个元素，创建一个包含所有元素的组合图像
        const canvases = await Promise.all(validContainers.map(container => 
          html2canvas(container, {
            useCORS: true,
            scale: 2
          })
        ));
        
        // 创建一个足够大的新画布来容纳所有图像
        const totalHeight = canvases.reduce((sum, canvas) => sum + canvas.height, 0);
        const maxWidth = Math.max(...canvases.map(canvas => canvas.width));
        
        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = maxWidth;
        combinedCanvas.height = totalHeight;
        const ctx = combinedCanvas.getContext('2d');
        
        // 将所有画布绘制到新画布上
        let currentY = 0;
        canvases.forEach(canvas => {
          ctx.drawImage(canvas, 0, currentY);
          currentY += canvas.height;
        });
        
        // 下载组合图像
        const image = combinedCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = '医师团队结构图.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
        console.error('图片生成失败:', error);
    }
};

// 获取数据
const fetchData = async () => {
  //   let arr = Array.from({ length: 7 }, (v, k) =>
  //     Math.floor(Math.random() * 1000)
  //   );
  //   let arrs = Array.from({ length: 7 }, (v, k) =>
  //     Math.floor(Math.random() * 1000)
  //   );
  //   let xAxis = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  //   let series = [
  //     { name: "谷歌", data: arr },
  //     { name: "360", data: arrs },
  //   ];
  //   http.post(props.apiUrl, props.apiParms).then((res) => {
  //     if (res.code === 200 && res.data) {
  //       chartData.value = {
  //         xAxis: res.data.xAxis.data || [],
  //         series: res.data.series || [],
  //       };
  //     } else {
  //       chartData.value = {
  //         xAxis: xAxis,
  //         series: series,
  //       };
  //     }
  //   });
};

// 组件挂载时获取数据
onMounted(async () => {
  console.log("props", props);
  await fetchData();
});
</script>

<style lang="scss" scoped>
.titleEchart {
  line-height: 50px;
  height: 50px;
  width: 100%;
  padding: 0 15px;
  border-bottom: 1px solid rgba(229, 229, 229, 1);
  box-sizing: border-box;
  background: #fff;
}
.legend-container {
  width: 100%;
  display: flex;
  flex-direction: column; // 保持竖直排列
  justify-content: center; // 垂直居中
  align-items: center; // 水平居中
  gap: 0; // 添加间距防止重叠
  border-bottom: 1px solid rgba(229, 229, 229, 1);
  padding-top: 15px;
  box-sizing: border-box;
  background-color: #fff;

  .item {
    padding: 8px 12px;
    color: white;
    text-align: center;
    transition: all 0.3s;
    width: 100%;
    flex: 1;
    font-size: 12px;
    cursor: pointer;
    position: relative;

    .tooltip {
      position: absolute;
      top: -20px; // 显示在元素上方
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;

      // 添加小箭头
      &::after {
        content: "";
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px 5px 0;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.8) transparent transparent;
      }
    }
  }

  .legend-name {
    margin-top: 10px;
    margin-bottom: 20px;
    text-align: center;
    flex-shrink: 0;
    font-size: 14px;
  }
}
</style>