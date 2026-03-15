<template>
  <div class="containerApp">
    <!-- <my-process-palette /> -->
    <div></div>
    <my-process-designer :key="`designer-${reloadIndex}`" v-model="xmlString" v-bind="controlForm" keyboard ref="processDesigner" @element-click="elementClick" @init-finished="initModeler" />
    <myPropertiesPanel :key="`penal-${reloadIndex}`" :bpmn-modeler="modeler" :prefix="controlForm.prefix" class="process-panel" />
  </div>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import translations from "./translations";
// 自定义渲染（隐藏了 label 标签）
import CustomRenderer from "./modules/custom-renderer";
// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from "./plugins/content-pad";
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from "./plugins/palette";
import Log from "./Log.js";

import myProcessPalette from "./palette/ProcessPalette.vue";
import myProcessDesigner from "./designer/ProcessDesigner.vue";
import myPropertiesPanel from "./penal/PropertiesPanel.vue";

// 响应式数据
const xmlString = ref('');
const modeler = ref(null);
const reloadIndex = ref(0);
const element = ref(null);
const processDesigner = ref(null);
const translationsSelf = translations;

// 控制表单数据
const controlForm = reactive({
  processId: "",
  processName: "",
  simulation: true,
  labelEditing: false,
  labelVisible: false,
  prefix: "camunda",  // 控制类型  flowable  camunda  activiti
  headerButtonSize: "mini",
  additionalModel: [CustomContentPadProvider, CustomPaletteProvider]
});

// 附加配置
const addis = reactive({
  CustomContentPadProvider,
  CustomPaletteProvider
});

// 初始化模型器
const initModeler = (modelerInstance) => {
  setTimeout(() => {
    modeler.value = modelerInstance;
    const canvas = modelerInstance.get("canvas");
    const rootElement = canvas.getRootElement();
    Log.prettyPrimary("Process Id:", rootElement.id);
    Log.prettyPrimary("Process Name:", rootElement.businessObject.name);
  }, 10);
};

// 重新加载流程设计器
const reloadProcessDesigner = (deep) => {
  controlForm.additionalModel = [];
  for (let key in addis) {
    if (addis[key]) {
      controlForm.additionalModel.push(addis[key]);
    }
  }
  if (deep) {
    xmlString.value = undefined;
  }
  reloadIndex.value += 1;
  modeler.value = null; // 避免 panel 异常
};

// 更改标签编辑状态
const changeLabelEditingStatus = (status) => {
  addis.labelEditing = status ? { labelEditingProvider: ["value", ""] } : false;
  reloadProcessDesigner();
};

// 更改标签可见状态
const changeLabelVisibleStatus = (status) => {
  addis.customRenderer = status ? CustomRenderer : false;
  reloadProcessDesigner();
};

// 元素点击事件
const elementClick = (elementData) => {
  element.value = elementData;
};

// 生命周期钩子
onMounted(() => {
  // 这里可以添加组件挂载后的逻辑
});
</script>



<style lang="scss">
@use "./theme/index.scss";
@import "bpmn-js/dist/assets/diagram-js.css";
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
@import "./theme/element-variables.scss";

.containerApp {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: inline-grid;
  grid-template-columns: 10px auto max-content;
  background: #fff;
}
.demo-control-bar {
  position: fixed;
  right: 8px;
  bottom: 8px;
  z-index: 1;
  .open-control-dialog {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 32px;
    background: rgba(64, 158, 255, 1);
    color: #ffffff;
    cursor: pointer;
  }
}
.info-tip {
  position: fixed;
  top: 40px;
  right: 500px;
  z-index: 10;
  color: #999999;
}
.control-form {
  .el-radio {
    width: 100%;
    line-height: 32px;
  }
}
.element-overlays {
  box-sizing: border-box;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  color: #fafafa;
}

.bjs-powered-by{
  display: none !important;
}

</style>