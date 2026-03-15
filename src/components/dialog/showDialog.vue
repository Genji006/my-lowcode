<template>
  <el-dialog v-model="dialogVisible" class="dialogCss" :title="title" :width="width" :top="top" :align-center="alignCenter" :destroy-on-close="destroy" :close-on-click-modal="canClose" @close="close">
    <slot name="uname"></slot>
  </el-dialog>
</template>

<script setup>
import { watch, ref, onMounted } from "vue";
const dialogVisible = ref(false);
const emit = defineEmits(["close"]);
const props = defineProps({
  dialogVisible: Boolean,
  title: String,
  width: String,
  top: String,
  alignCenter: Boolean,
  destroy: {
    type: Boolean,
    default: false,
  },
  canClose: {
    type: Boolean,
    default: false,
  },
});
// console.log(props, "--");
const close = () => {
  emit("close", false);
};
watch(props, (news, olds) => {
  // console.log(props, "---====");
  dialogVisible.value = props.dialogVisible;
  // console.log("🚀 ~ watch ~ props.dialogVisible:", props.dialogVisible);
  // console.log(prop);
});
</script>


<style lang="scss">
.el-overlay-dialog {
  overflow: hidden;
}

.el-dialog__body {
  padding: 20px 20px 20px !important;
  // width: calc(100% - 64px) !important;
  background: #fff;

  .el-dialog-HorizontalLine {
    width: calc(100% + 40px);
    height: 1px;
    background-color: rgba(201, 201, 201, 1) !important;
    margin: 20px 0 0 -20px;
  }

  .el-dialog-HorizontalLines {
    width: 100%;
    height: 1px;
    background-color: rgba(201, 201, 201, 1) !important;
    margin: 20px 0 0 0;
  }

  .el-dialog-buttons {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }
}
</style>