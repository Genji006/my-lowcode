<!-- 基础样式配置组件 -->
<template>
  <el-form :model="config" label-width="140px">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="主题">
          <el-select v-model="config.theme" placeholder="选择主题" clearable>
            <el-option label="深色" value="dark" />
            <el-option label="浅色" value="light" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联动类型">
          <el-select v-model="config.rowClickData" placeholder="请选择" style="width: 220px" clearable>
            <el-option v-for="item in rowClickDataOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="跳转路径" v-if="config.rowClickData == '3' || config.rowClickData == '4'">
          <el-input v-model="config.jumPathEchart" placeholder="" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="跳转携带参数" v-if="config.rowClickData == '3' || config.rowClickData == '4'">
          <el-input-tag v-model="config.jumPathEchartParams" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="是否必填(联动)">
          <el-switch v-model="config.hasRequired"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="16">
        <el-form-item label="必填参数(联动)">
          <el-input v-model="config.paramsValueList" placeholder="逗号分隔参数" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="显示工具箱">
          <el-switch v-model="config.showToolbox" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="方向" v-if="typeEchartShow('方向', chartType)">
          <el-select v-model="config.direction" placeholder="选择渲染器" clearable>
            <el-option label="横向" value="category" />
            <el-option label="竖向" value="value" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="图表标题">
          <el-input v-model="config.title" placeholder="图表标题" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否堆叠" v-if="typeEchartShow('方向', chartType)">
          <el-switch v-model="config.stack" active-value="total" />
        </el-form-item>
      </el-col>
    </el-row>
    <!-- 饼图配置 -->
    <!-- <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="饼图大小">
          <el-input v-model="config.PieRadius" placeholder="图表标题" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="饼图类型" v-if="typeEchartShow('饼图',chartType)">
          <el-select v-model="config.direction" placeholder="">
            <el-option label="横向" value="category" />
            <el-option label="竖向" value="value" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row> -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="显示图例">
          <el-switch v-model="config.showLegend" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="图例位置">
          <el-select v-model="config.legendPosition" placeholder="选择渲染器" clearable>
            <el-option label="上" value="top" />
            <el-option label="下" value="bottom" />
            <el-option label="左" value="left" />
            <el-option label="右" value="right" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="图例左侧距离">
          <el-input v-model="config.legendLeft" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="图例右侧距离">
          <el-input v-model="config.legendRight" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="图例顶部距离">
          <el-input v-model="config.legendTop" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="图例底部距离">
          <el-input v-model="config.legendBottom" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否展示网格">
          <el-switch v-model="config.showGrid" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否双向展示" v-if="typeEchartShow('方向', chartType)">
          <el-switch v-model="config.doubleBar" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="图表左侧距离">
          <el-input v-model="config.gridLeft" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="图表右侧距离">
          <el-input v-model="config.gridRight" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="图表顶部距离">
          <el-input v-model="config.gridTop" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="图表底部距离">
          <el-input v-model="config.gridBottom" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="旋转度数">
          <el-input v-model="config.rotate" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否反转" v-if="typeEchartShow('方向', chartType)">
          <el-switch v-model="config.inverse" />
        </el-form-item>
      </el-col>
      <!-- <el-col :span="12">
        <el-form-item label="无科室" >
          <el-switch v-model="config.noKs" />
        </el-form-item>
      </el-col> -->
      <el-col :span="12">
        <el-form-item label="刻度展示处理">
          <el-switch v-model="config.scaleShow" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="雷达图最大值">
          <el-select v-model="config.radarMaxValue" placeholder="">
            <el-option label="百分值" value="1" />
            <el-option label="数值" value="0" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="纵坐标单位">
          <el-input v-model="config.yAxisUnit" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="横坐标单位">
          <el-input v-model="config.xAxisUnit" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="综坐标标签">
          <el-input v-model="config.yAxisLabel" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="横坐标轴标签">
          <el-input v-model="config.xAxisLabel" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <!-- <el-col :span="12">
        <el-form-item label="图例位置">
          <el-select v-model="config.legendPosition" placeholder="选择渲染器">
            <el-option label="上" value="top" />
            <el-option label="下" value="bottom" />
            <el-option label="左" value="left" />
            <el-option label="右" value="right" />
          </el-select>
        </el-form-item>
      </el-col> -->
    </el-row>
  </el-form>
</template>

<script setup>
import { computed, watch, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  //  图表类型
  chartType: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

//  图表类型判断
const typeEchartShow = (type, chartType) => {
  if (type == "方向") {
    let arr = ["BAR", "LINE"];
    if (arr.find((f) => f == chartType)) {
      return true;
    } else {
      return false;
    }
  }
};

const rowClickDataOptions = ref([
  { value: "0", label: "无" },
  { value: "1", label: "图表排序" },
  { value: "2", label: "图表科室（暂无）" },
  { value: "3", label: "跳转下钻" },
  { value: "4", label: "跳转或排序" },
  { value: "5", label: "必传参数" },
]);

// const config = computed({
//   get: () => props.modelValue,
//   set: (value) => emit("update:modelValue", value),
// });
const config = computed({
  get: () => {
    return props.modelValue;
  },
  set: (value) => {
    emit("update:modelValue", value);
  },
});
</script>
