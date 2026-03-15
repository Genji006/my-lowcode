<!-- 字体配置组件 -->
<template>
  <el-form :model="config" label-width="120px">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="标题字体">
          <el-select v-model="config.titleFontFamily">
            <el-option label="微软雅黑" value="Microsoft YaHei" />
            <el-option label="宋体" value="SimSun" />
            <el-option label="黑体" value="SimHei" />
            <el-option label="Arial" value="Arial" />
            <el-option label="Helvetica" value="Helvetica" />
            <el-option label="Times New Roman" value="Times New Roman" />
            <el-option label="Georgia" value="Georgia" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="标题字号">
          <el-input-number v-model="config.titleFontSize" :min="12" :max="48" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="轴标签字体">
          <el-select v-model="config.axisFontFamily">
            <el-option label="微软雅黑" value="Microsoft YaHei" />
            <el-option label="宋体" value="SimSun" />
            <el-option label="黑体" value="SimHei" />
            <el-option label="Arial" value="Arial" />
            <el-option label="Helvetica" value="Helvetica" />
            <el-option label="Times New Roman" value="Times New Roman" />
            <el-option label="Georgia" value="Georgia" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="轴标签字号">
          <el-input-number v-model="config.axisFontSize" :min="10" :max="24" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="图例字体">
          <el-select v-model="config.legendFontFamily">
            <el-option label="微软雅黑" value="Microsoft YaHei" />
            <el-option label="宋体" value="SimSun" />
            <el-option label="黑体" value="SimHei" />
            <el-option label="Arial" value="Arial" />
            <el-option label="Helvetica" value="Helvetica" />
            <el-option label="Times New Roman" value="Times New Roman" />
            <el-option label="Georgia" value="Georgia" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="图例字号">
          <el-input-number v-model="config.legendFontSize" :min="10" :max="20" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="数据标签字体">
          <el-select v-model="config.labelFontFamily">
            <el-option label="微软雅黑" value="Microsoft YaHei" />
            <el-option label="宋体" value="SimSun" />
            <el-option label="黑体" value="SimHei" />
            <el-option label="Arial" value="Arial" />
            <el-option label="Helvetica" value="Helvetica" />
            <el-option label="Times New Roman" value="Times New Roman" />
            <el-option label="Georgia" value="Georgia" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="数据标签字号">
          <el-input-number v-model="config.labelFontSize" :min="8" :max="20" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="字体粗细">
          <el-select v-model="config.fontWeight">
            <el-option label="正常" value="normal" />
            <el-option label="粗体" value="bold" />
            <el-option label="细体" value="lighter" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="字体样式">
          <el-select v-model="config.fontStyle">
            <el-option label="正常" value="normal" />
            <el-option label="斜体" value="italic" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
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
</script>
