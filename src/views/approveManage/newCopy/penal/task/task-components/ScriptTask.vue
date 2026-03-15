<template>
  <div style="margin-top: 16px">
    <el-form-item label="脚本格式">
      <el-input v-model="scriptTaskForm.scriptFormat" clearable @input="updateElementTask()" @change="updateElementTask()" />
    </el-form-item>
    <el-form-item label="脚本类型">
      <el-select v-model="scriptTaskForm.scriptType">
        <el-option label="内联脚本" value="inline" />
        <el-option label="外部资源" value="external" />
      </el-select>
    </el-form-item>
    <el-form-item label="脚本" v-show="scriptTaskForm.scriptType === 'inline'">
      <el-input v-model="scriptTaskForm.script" type="textarea" resize="vertical" :autosize="{ minRows: 2, maxRows: 4 }" clearable @input="updateElementTask()" @change="updateElementTask()" />
    </el-form-item>
    <el-form-item label="资源地址" v-show="scriptTaskForm.scriptType === 'external'">
      <el-input v-model="scriptTaskForm.resource" clearable @input="updateElementTask()" @change="updateElementTask()" />
    </el-form-item>
    <el-form-item label="结果变量">
      <el-input v-model="scriptTaskForm.resultVariable" clearable @input="updateElementTask()" @change="updateElementTask()" />
    </el-form-item>
  </div>
</template>

<script setup>
import { reactive, watch, nextTick, onBeforeUnmount } from 'vue';

// 定义组件属性
const props = defineProps({
  id: String,
  type: String
});

// 默认任务表单
const defaultTaskForm = {
  scriptFormat: "",
  script: "",
  resource: "",
  resultVariable: ""
};

// 响应式数据
const scriptTaskForm = reactive({});

// 非响应式临时变量
let bpmnElement = null;

// 重置任务表单
const resetTaskForm = () => {
  // 清空现有表单
  Object.keys(scriptTaskForm).forEach(key => delete scriptTaskForm[key]);

  // 设置新值
  for (let key in defaultTaskForm) {
    let value = bpmnElement?.businessObject[key] || defaultTaskForm[key];
    scriptTaskForm[key] = value;
  }
  scriptTaskForm.scriptType = scriptTaskForm.script ? "inline" : "external";
};

// 更新元素任务
const updateElementTask = () => {
  let taskAttr = Object.create(null);
  taskAttr.scriptFormat = scriptTaskForm.scriptFormat || null;
  taskAttr.resultVariable = scriptTaskForm.resultVariable || null;
  if (scriptTaskForm.scriptType === "inline") {
    taskAttr.script = scriptTaskForm.script || null;
    taskAttr.resource = null;
  } else {
    taskAttr.resource = scriptTaskForm.resource || null;
    taskAttr.script = null;
  }
  window.bpmnInstances.modeling.updateProperties(bpmnElement, taskAttr);
};

// 监听id变化
watch(() => props.id, () => {
  bpmnElement = window.bpmnInstances.bpmnElement;
  nextTick(() => resetTaskForm());
}, { immediate: true, deep: true });

// 组件卸载前清理
onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>
