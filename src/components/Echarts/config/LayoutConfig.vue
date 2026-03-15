<!-- 布局配置组件 -->
<template>
  <el-form :model="config" label-width="120px">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="左边距">
          <el-input-number v-model="config.left" :min="0" :max="200" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="右边距">
          <el-input-number v-model="config.right" :min="0" :max="200" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="上边距">
          <el-input-number v-model="config.top" :min="0" :max="200" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="下边距">
          <el-input-number v-model="config.bottom" :min="0" :max="200" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="网格显示">
          <el-switch v-model="config.showGrid" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="网格样式">
          <el-select v-model="config.gridStyle">
            <el-option label="实线" value="solid" />
            <el-option label="虚线" value="dashed" />
            <el-option label="点线" value="dotted" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="网格颜色">
          <el-color-picker v-model="config.gridColor" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="网格透明度">
          <el-slider
            v-model="config.gridOpacity"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="背景色">
          <el-color-picker v-model="config.backgroundColor" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="边框显示">
          <el-switch v-model="config.showBorder" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="边框颜色">
          <el-color-picker v-model="config.borderColor" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="边框宽度">
          <el-input-number v-model="config.borderWidth" :min="0" :max="10" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="圆角半径">
          <el-input-number v-model="config.borderRadius" :min="0" :max="20" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="阴影显示">
          <el-switch v-model="config.showShadow" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="阴影配置" v-if="config.showShadow">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="X偏移">
            <el-input-number v-model="config.shadowOffsetX" :min="-20" :max="20" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Y偏移">
            <el-input-number v-model="config.shadowOffsetY" :min="-20" :max="20" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="模糊半径">
            <el-input-number v-model="config.shadowBlur" :min="0" :max="20" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="阴影颜色">
            <el-color-picker v-model="config.shadowColor" />
          </el-form-item>
        </el-col>
      </el-row>
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
</script>
