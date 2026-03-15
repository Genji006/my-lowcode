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
});
</script>
<style lang="scss" scoped>
// base是默认样式
.workStation {
  color: #f2a2a2;
}
.base {
  width: 84px;
  height: 32px;
  display: flex;
  align-items: center;
  font-size: 16px;
  background: #ecf1ff !important;
  color: #4e5969;
  box-shadow: -1.58438px -1.58438px 3.16875px rgba(255, 255, 255, 0.84),
    1.58438px 1.58438px 3.16875px rgba(191, 192, 196, 0.53);
  border: none;
  border-radius: 4px;
  font-family: "Microsoft Yahei" !important;
  // font-weight: 600;
  &:hover {
    background: #5380fd !important;
    color: #fff;
  }
}

// perform是暂停指标执行的按钮样式
.perform {
  width: 148px;
  height: 32px;
  color: #165dff;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
  font-family: "Microsoft Yahei" !important;
  // font-weight: 600;
}
// complete是指标执行完成的按钮样式
.complete {
  width: 84px;
  height: 32px;
  color: #165dff;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
  font-family: "Microsoft Yahei" !important;
  // font-weight: 600;
}
// upload是材料上传的按钮样式
.upload {
  width: 112px;
  height: 32px;
  border-radius: 3px;
  border: 1px solid #5380fd;
  background: #f3f3f3;
  color: #5380fd;
  text-align: center;
  font-family: HarmonyOS Sans SC;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 157.143% */
  display: flex;
  align-items: center;
  font-family: "Microsoft Yahei" !important;
  // font-weight: 600;
}

.reset {
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 24px;
  color: rgba(29, 33, 41, 1);
}
</style>
