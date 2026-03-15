<template>
  <el-button type="primary" class="base" :class="type" :disabled="disabled">
    <!-- icon图标 -->
    <slot name="icon"></slot>
    <!-- 按钮名称 -->
    <slot></slot>
  </el-button>
</template>
  <script setup>
const props = defineProps({
  type: String,
  disabled: {
    type: Boolean,
    default: false
  },
});
  </script>
  <style lang="scss" scoped>
// base是默认样式(两字按钮)
.base {
  // width: 90px;
  width: auto;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(83, 128, 253, 1) !important;
  box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84),
    1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 16px 5px 16px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: middle;
  border: none;
  font-family: "Microsoft Yahei";
}

.cancel {
  // width: 90px;
  width: auto;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(236, 241, 255, 1) !important;
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

// operation是常用操作按钮样式(四字按钮)
.operation {
  width: 120px;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(83, 128, 253, 1) !important;
  box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84),
    1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 16px 5px 16px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: middle;
  font-family: "Microsoft Yahei";
  border: none;
}

// delete是删除按钮样式(两字按钮)
.delete {
  width: auto;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(245, 101, 101, 1) !important;
  box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84),
    1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 16px 5px 16px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: middle;
  border: none;
  font-family: "Microsoft Yahei";
}

// delete是删除按钮样式(两字按钮)
.moveItem {
  width: 110px;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(245, 101, 101, 1);
  box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84),
    1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 16px 5px 16px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: middle;
  border: none;
  font-family: "Microsoft Yahei";
}

// autoWidth是常用操作按钮样式(文字不固定)
.autoWidth {
  width: auto;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(83, 128, 253, 1);
  box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84),
    1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 16px 5px 16px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: middle;
  font-family: "Microsoft Yahei";
  border: none;
}

// delete是删除按钮样式(文字不固定)
.delautoWidth {
  width: auto;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(245, 101, 101, 1);
  box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84),
    1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 16px 5px 16px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: middle;
  border: none;
  font-family: "Microsoft Yahei";
}

// login是登录页登录按钮
.login {
  width: 100%;
  height: 51.84px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(83, 128, 253, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0px;
  line-height: 26.6px;
  color: rgba(255, 255, 255, 1);
  text-align: center;
  vertical-align: top;
}


.recycleBin {
  // width: 90px;
  width: auto;
  height: 34px;
  opacity: 1;
  border-radius: 4px;
  background: rgba(67, 207, 124, 1) !important;
  box-shadow: -1.58px -1.58px 3.17px rgba(255, 255, 255, 0.84),
    1.58px 1.58px 3.17px rgba(191, 192, 195, 0.53);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 16px 5px 16px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: middle;
  border: none;
  font-family: "Microsoft Yahei";
}
</style>
