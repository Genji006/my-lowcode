<!-- 动画配置组件 -->
<template>
  <el-form :model="config" label-width="120px">
    <el-form-item label="启用动画">
      <el-switch v-model="config.enabled" />
    </el-form-item>

    <el-form-item label="动画时长">
      <el-input-number
        v-model="config.duration"
        :min="0"
        :max="5000"
        :step="100"
      />
      <span class="unit">毫秒</span>
    </el-form-item>

    <el-form-item label="缓动函数">
      <el-select v-model="config.easing">
        <el-option label="线性" value="linear" />
        <el-option label="二次缓入" value="quadraticIn" />
        <el-option label="二次缓出" value="quadraticOut" />
        <el-option label="二次缓入缓出" value="quadraticInOut" />
        <el-option label="三次缓入" value="cubicIn" />
        <el-option label="三次缓出" value="cubicOut" />
        <el-option label="三次缓入缓出" value="cubicInOut" />
        <el-option label="四次缓入" value="quarticIn" />
        <el-option label="四次缓出" value="quarticOut" />
        <el-option label="四次缓入缓出" value="quarticInOut" />
        <el-option label="正弦缓入" value="sinusoidalIn" />
        <el-option label="正弦缓出" value="sinusoidalOut" />
        <el-option label="正弦缓入缓出" value="sinusoidalInOut" />
        <el-option label="指数缓入" value="exponentialIn" />
        <el-option label="指数缓出" value="exponentialOut" />
        <el-option label="指数缓入缓出" value="exponentialInOut" />
        <el-option label="圆形缓入" value="circularIn" />
        <el-option label="圆形缓出" value="circularOut" />
        <el-option label="圆形缓入缓出" value="circularInOut" />
        <el-option label="弹性缓入" value="elasticIn" />
        <el-option label="弹性缓出" value="elasticOut" />
        <el-option label="弹性缓入缓出" value="elasticInOut" />
        <el-option label="回弹缓入" value="backIn" />
        <el-option label="回弹缓出" value="backOut" />
        <el-option label="回弹缓入缓出" value="backInOut" />
        <el-option label="弹跳缓入" value="bounceIn" />
        <el-option label="弹跳缓出" value="bounceOut" />
        <el-option label="弹跳缓入缓出" value="bounceInOut" />
      </el-select>
    </el-form-item>

    <el-form-item label="延迟时间">
      <el-input-number
        v-model="config.delay"
        :min="0"
        :max="2000"
        :step="50"
      />
      <span class="unit">毫秒</span>
    </el-form-item>

    <el-form-item label="动画阈值">
      <el-input-number
        v-model="config.threshold"
        :min="0"
        :max="1000"
        :step="50"
      />
      <span class="unit">毫秒</span>
    </el-form-item>

    <el-form-item label="动画循环">
      <el-switch v-model="config.loop" />
    </el-form-item>

    <el-form-item label="循环次数" v-if="config.loop">
      <el-input-number
        v-model="config.loopCount"
        :min="1"
        :max="100"
      />
      <span class="unit">次</span>
    </el-form-item>

    <el-form-item label="动画方向">
      <el-select v-model="config.direction">
        <el-option label="正向" value="normal" />
        <el-option label="反向" value="reverse" />
        <el-option label="交替" value="alternate" />
        <el-option label="交替反向" value="alternate-reverse" />
      </el-select>
    </el-form-item>

    <el-form-item label="动画填充模式">
      <el-select v-model="config.fillMode">
        <el-option label="无" value="none" />
        <el-option label="向前" value="forwards" />
        <el-option label="向后" value="backwards" />
        <el-option label="双向" value="both" />
      </el-select>
    </el-form-item>

    <el-form-item label="动画播放状态">
      <el-select v-model="config.playState">
        <el-option label="运行" value="running" />
        <el-option label="暂停" value="paused" />
      </el-select>
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

<style scoped>
.unit {
  margin-left: 10px;
  color: #666;
}
</style>
