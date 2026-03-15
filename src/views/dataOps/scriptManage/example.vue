<template>
  <div class="t_vertical-steps">
    <div v-for="(step, index) in steps" :key="index" class="t_step-item-container">
      <div class="t_step-marker-wrapper">
        <div class="t_step-marker" :class="{
            't_completed': step.status === 't_completed',
            't_active': step.status === 't_active'
          }"></div>
        <div v-if="index < steps.length - 1" class="t_step-line"></div>
      </div>
      <div class="t_step-content">
        <div v-for="(item, itemIndex) in step.info" :key="itemIndex" :class="[
          't_step-info','t_step-info-desc',
          { 't_step-info-title': itemIndex === 0 },
        ]">
          <div class="t_step-row">
            <span class="t_step-label">{{ item.label }}:</span>
            <span class="t_step-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  steps: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.t_vertical-steps {
  width: 100%;
  position: relative;
  padding: 0 10px;
  margin: 24px 0;
  box-sizing: border-box;
}

.t_step-item-container {
  display: flex;
  position: relative;
}

.t_step-item-container:last-child {
  padding-bottom: 0;
}

.t_step-marker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  position: relative;
}

.t_step-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #c0c4cc;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.t_step-marker.t_completed {
  background-color: #67c23a;
}

.t_step-marker.t_active {
  background-color: #409eff;
}

.t_step-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background-color: #e4e7ed;
}

.t_step-content {
  flex: 1;
  padding-bottom: 20px;
}

.t_step-info {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin: 3px 0;
}

.t_step-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.t_step-label {
  color: #606266;
  flex-shrink: 0;
  margin-right: 4px;
}

.t_step-value {
  color: #303133;
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.t_step-info-title {
  font-weight: 500;
  color: #303133;
  margin-top: -2px;
}

.t_step-info-title .t_step-value {
  font-weight: 500;
}

.t_step-info-desc .t_step-value {
  color: #606266;
}
</style>