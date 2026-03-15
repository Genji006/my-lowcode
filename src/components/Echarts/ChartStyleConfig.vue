<!-- 图表样式配置组件 -->
<template>
  <div class="chart-style-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>图表样式配置</span>
          <el-button type="primary" @click="applyConfig">应用配置</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab" type="border-card" style="overflow: auto">
        <!-- 基础样式配置 -->
        <el-tab-pane label="基础样式" name="basic">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="标题" label-width="120px">
                <el-input v-model="topConfig.title" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <BasicStyleConfig v-model="basicConfig" :chartType="chartType" />
        </el-tab-pane>

        <!-- 颜色配置 -->
        <el-tab-pane label="颜色配置" name="colors">
          <ColorConfig v-model="colorConfig" :chartType="chartType" />
        </el-tab-pane>
        <!-- 字段配置 -->
        <el-tab-pane label="数据配置" name="datas">
          <DataConfig v-model="dataConfig" :chartType="chartType" />
        </el-tab-pane>
        <!-- 字体配置 -->
        <!-- <el-tab-pane label="字体配置" name="fonts">
          <FontConfig v-model="fontConfig" />
        </el-tab-pane> -->

        <!-- 布局配置 -->
        <!-- <el-tab-pane label="布局配置" name="layout">
          <LayoutConfig v-model="layoutConfig" />
        </el-tab-pane> -->

        <!-- 动画配置 -->
        <!-- <el-tab-pane label="动画配置" name="animation">
          <AnimationConfig v-model="animationConfig" />
        </el-tab-pane> -->
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import BasicStyleConfig from "@/components/Echarts/config/BasicStyleConfig.vue";
import ColorConfig from "@/components/Echarts/config/ColorConfig.vue";
import DataConfig from "@/components/Echarts/config/DataConfig.vue";
// import FontConfig from '@/components/Echarts/config/FontConfig.vue'
import LayoutConfig from "@/components/Echarts/config/LayoutConfig.vue";
import AnimationConfig from "@/components/Echarts/config/AnimationConfig.vue";

const props = defineProps({
  data: {},
  chartType: "", //  图形类型
});

// 当前激活的标签页
const activeTab = ref("basic");

// 基础样式配置
const basicConfig = reactive({ ...props.data.basic });

// 颜色配置
const colorConfig = reactive({ ...props.data.colors });

//  顶部图表标题
const topConfig = reactive({ ...props.data.topConfig });

// 数据源配置
const dataConfig = reactive({ ...props.data.dataConfig });

// 定义事件
const emit = defineEmits(["config-change"]);

watch(
  () => props.data,
  (newVal, old) => {
    // console.log(newVal,old, "12344");
    Object.assign(basicConfig, newVal?.basic);
    Object.assign(colorConfig, newVal?.colors);
    Object.assign(topConfig, newVal?.topConfig);
    Object.assign(dataConfig, newVal?.dataConfig);
  },
  {
    immediate: true,
    deep: true,
  }
);

// 应用配置
const applyConfig = () => {
  const config = {
    basic: { ...basicConfig },
    colors: { ...colorConfig },
    topConfig: { ...topConfig },
    dataConfig: { ...dataConfig },
  };
  // console.log(config, "config");
  emit("config-change", config);
};

// 监听配置变化，实时更新
//fontConfig, layoutConfig, animationConfig,
watch(
  [basicConfig, colorConfig, topConfig, dataConfig],
  () => {
    // console.log(
    //   "监听到配置变化",
    //   basicConfig,
    //   colorConfig,
    //   topConfig,
    //   dataConfig
    // );
    applyConfig();
  },

  { immediate: true, deep: true }
);

// 暴露方法给父组件
defineExpose({
  getConfig: () => ({
    basic: { ...props.data.basicConfig },
    colors: { ...props.data.colorConfig },
    topConfig: { ...props.data.topConfig },
    dataConfig: { ...props.data.dataConfig },
  }),
  setConfig: (config) => {
    if (config.basic) Object.assign(basicConfig, config.basic);
    if (config.colors) Object.assign(colorConfig, config.colors);
    if (config.topConfig) Object.assign(topConfig, config.topConfig);
    if (config.dataConfig) Object.assign(dataConfig, config.dataConfig);
  },
});
</script>

<style scoped>
.chart-style-config {
  width: 100%;
  height: 100%;
}
.config-card {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  overflow: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style>
