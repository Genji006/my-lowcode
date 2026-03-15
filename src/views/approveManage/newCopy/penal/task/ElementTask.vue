<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.prevent>
      <el-form-item label="异步延续">
        <el-checkbox v-model="taskConfigForm.asyncBefore" label="异步前" @change="changeTaskAsync" />
        <el-checkbox v-model="taskConfigForm.asyncAfter" label="异步后" @change="changeTaskAsync" />
        <el-checkbox v-model="taskConfigForm.exclusive" v-if="taskConfigForm.asyncAfter || taskConfigForm.asyncBefore" label="排除" @change="changeTaskAsync" />
      </el-form-item>
      <component :is="witchTaskComponent" :id="id" :type="type" />
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import UserTask from "./task-components/UserTask.vue";
import ScriptTask from "./task-components/ScriptTask.vue";
import ReceiveTask from "./task-components/ReceiveTask.vue";

// 注册组件
const components = {
  UserTask,
  ScriptTask,
  ReceiveTask
};

// 定义组件属性
const props = defineProps({
  id: String,
  type: String
});

// 响应式数据
const taskConfigForm = reactive({
  asyncAfter: false,
  asyncBefore: false,
  exclusive: false
});

const witchTaskComponent = ref('');

// 非响应式常量数据
const installedComponent = {
  // 手工任务与普通任务一致，不需要其他配置
  // 接收消息任务，需要在全局下插入新的消息实例，并在该节点下的 messageRef 属性绑定该实例
  // 发送任务、服务任务、业务规则任务共用一个相同配置
  'UserTask': UserTask, // 用户任务配置
  'ScriptTask': ScriptTask, // 脚本任务配置
  'ReceiveTask': ReceiveTask // 消息接收任务
};

// 非响应式临时变量
let bpmnElement = null;

// 更新任务异步配置
const changeTaskAsync = () => {
  if (!taskConfigForm.asyncBefore && !taskConfigForm.asyncAfter) {
    taskConfigForm.exclusive = false;
  }
  window.bpmnInstances.modeling.updateProperties(window.bpmnInstances.bpmnElement, {
    ...taskConfigForm
  });
};


// 监听id变化
watch(() => props.id, () => {
  bpmnElement = window.bpmnInstances.bpmnElement;
  if (bpmnElement && bpmnElement.businessObject) {
    taskConfigForm.asyncBefore = bpmnElement.businessObject.asyncBefore || false;
    taskConfigForm.asyncAfter = bpmnElement.businessObject.asyncAfter || false;
    taskConfigForm.exclusive = bpmnElement.businessObject.exclusive || false;
  }
}, { immediate: true, deep: true });

// 监听type变化
watch(() => props.type, (newType) => {
  witchTaskComponent.value = installedComponent[newType] || '';
}, { immediate: true, deep: true });
</script>
