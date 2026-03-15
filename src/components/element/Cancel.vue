<template>
  <el-button type="primary" class="base" :class="type">
    <!-- icon图标 -->
    <slot name="icon"></slot>
    <!-- 按钮名称 -->
    <slot></slot>
  </el-button>
</template>
  <script setup>
const props = defineProps({
  type: String,
})
  </script>
  <style lang="scss" scoped>
// base是默认样式(两字按钮)
.base {
  // width: 90px;
  width: auto;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(236, 241, 255, 1);
  box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84),
    1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 16px 5px 16px;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 16px;
  color: rgba(29, 33, 41, 1);
  text-align: left;
  vertical-align: middle;
  border: none;
  font-family: "Microsoft Yahei";
}
</style>
