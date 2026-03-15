<template>
  <el-button
    type="primary"
    class="base"
    :class="type"
    :disabled="disabled"
    @click="check"
  >
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
    default: false,
  },
  param: {
    type: Object,
    default: {},
  },
});

const emit = defineEmits(["butEvent"]);

const check = () => {
  emit("butEvent", props.param);
};
</script>
<style lang="scss" scoped>
.base {
  width: auto;
  height: 32px;
  display: flex;
  align-items: center;
  font-size: 16px;
  background: #5380fd;
  box-shadow: -1.58438px -1.58438px 3.16875px rgba(255, 255, 255, 0.84),
    1.58438px 1.58438px 3.16875px rgba(191, 192, 196, 0.53);
  border: none;
  border-radius: 4px;
  font-family: "Microsoft Yahei" !important;
  box-sizing: border-box;
}

.el-button {
  width: 84px;
  height: 32px;
  display: flex;
  align-items: center;
  columns: #fff;
  background: #5380fd;
  box-shadow: -1.58438px -1.58438px 3.16875px rgba(255, 255, 255, 0.84),
    1.58438px 1.58438px 3.16875px rgba(191, 192, 196, 0.53);
  border: none;
  border-radius: 4px;
  font-family: "Microsoft Yahei" !important;
}

.widthLong {
  width: 118px;
  height: 32px;
  display: flex;
  align-items: center;
  columns: #fff;
  background: #5380fd;
  box-shadow: -1.58438px -1.58438px 3.16875px rgba(255, 255, 255, 0.84),
    1.58438px 1.58438px 3.16875px rgba(191, 192, 196, 0.53);
  border: none;
  border-radius: 4px;
  font-family: "Microsoft Yahei" !important;
  font-weight: 600;
}

.muban {
  width: 116px;
}

.el-buttonn {
  width: auto;
  height: 32px;
  display: flex;
  align-items: center;
  columns: #fff;
  background: #5380fd;
  box-shadow: -1.58438px -1.58438px 3.16875px rgba(255, 255, 255, 0.84),
    1.58438px 1.58438px 3.16875px rgba(191, 192, 196, 0.53);
  border: none;
  border-radius: 4px;
  font-family: "Microsoft Yahei" !important;
  font-weight: 600;
}

.importM {
  width: 148px;
}

.xiazaiM {
  width: 116px;
}

.newRule {
  width: 212px;
  height: 32px;
  font-family: "Microsoft Yahei" !important;
  font-weight: 600;
}

.newClause {
  width: 140px;
  height: 32px;
  font-family: "Microsoft Yahei" !important;
  font-weight: 600;
}

// 指标信息准备
.prepare {
  width: 116px;
  font-family: "Microsoft Yahei";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  display: flex;
  align-items: center;
}

// 指标信息准备--清空
.prepare-empty {
  width: 84px;
  background: #f56565;
  box-shadow: 1.58438px 1.58438px 3.16875px 0px rgba(191, 192, 195, 0.53),
    -1.58438px -1.58438px 3.16875px 0px rgba(255, 255, 255, 0.84);
  font-family: "Microsoft Yahei";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
}

// 分析报告附件上传--批量删除
.mul-delete {
  width: 116px;
  background: #f56565;
  box-shadow: 1.58438px 1.58438px 3.16875px 0px rgba(191, 192, 195, 0.53),
    -1.58438px -1.58438px 3.16875px 0px rgba(255, 255, 255, 0.84);
  font-family: "Microsoft Yahei";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
}

.deleteAll {
  width: 84px;
  height: 32px;
  display: flex;
  align-items: center;
  columns: #fff;
  background: #f56565;
  box-shadow: -1.58438px -1.58438px 3.16875px rgba(255, 255, 255, 0.84),
    1.58438px 1.58438px 3.16875px rgba(191, 192, 196, 0.53);
  border: none;
  border-radius: 4px;
  font-family: "Microsoft Yahei" !important;
  font-weight: 600;
}

.queryError {
  width: auto;
  height: 32px;
  display: flex;
  align-items: center;
  columns: #fff;
  background: #f56565;
  box-shadow: -1.58438px -1.58438px 3.16875px rgba(255, 255, 255, 0.84),
    1.58438px 1.58438px 3.16875px rgba(191, 192, 196, 0.53);
  border: none;
  border-radius: 4px;
  font-family: "Microsoft Yahei" !important;
  font-weight: 600;
}

// 取消按钮样式
.cancel {
  background: #909399;
  box-shadow: -1.58438px -1.58438px 3.16875px rgba(255, 255, 255, 0.84),
    1.58438px 1.58438px 3.16875px rgba(191, 192, 196, 0.53);
}
</style>
