<!-- 颜色配置组件 -->
<template>
  <el-form :model="config" label-width="120px">
    <el-form-item label="主色调">
      <el-color-picker v-model="config.primaryColor" />
    </el-form-item>

    <el-form-item label="颜色方案">
      <el-select v-model="config.colorScheme" @change="updateColorPalette">
        <el-option label="默认蓝绿" value="default" />
        <el-option label="专科图表默认色" value="warm" />
        <el-option label="冷色调" value="cool" />
        <el-option label="彩虹色" value="rainbow" />
        <el-option label="商务蓝" value="business" />
        <el-option label="自然绿" value="nature" />
      </el-select>
    </el-form-item>

    <el-form-item label="自定义颜色">
      <div class="color-list">
        <div v-for="(color, index) in config.customColors" :key="index" class="color-item">
          <el-color-picker v-model="config.customColors[index]" />
          <el-button
            type="danger"
            size="small"
            @click="removeColor(index)"
            :disabled="config.customColors.length <= 1"
          >
            删除
          </el-button>
        </div>
        <el-button type="primary" @click="addColor">添加颜色</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 预定义的颜色方案
const colorSchemes = {
  default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
  warm: ['#4066ad', '#bf0100', '#de8833', '#1d7a47', '#6d6da1'],
  cool: ['#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'],
  rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff'],
  business: ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2'],
  nature: ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800']
}

// 更新颜色调色板
const updateColorPalette = () => {
  if (colorSchemes[config.value.colorScheme]) {
    const colorList = [...colorSchemes[config.value.colorScheme]]
    config.value.customColors = []
    config.value.customColors = colorList
  }
}

// 添加颜色
const addColor = () => {
  if (config.value?.customColors?.length) {
    // 创建新数组，避免直接修改原数组
    const newList = [...config.value.customColors];
    newList.push('#5470c6');
    // 更新数据
    config.value.customColors = newList;
  }
}


// 删除颜色
const removeColor = (index) => {
  if (config.value.customColors.length > 1) {
    // 创建新数组，避免直接修改原数组
    const newList = [...config.value.customColors];
     newList.splice(index, 1);
    config.value.customColors = newList;
  }
}
</script>

<style scoped>
.color-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
