<template>
  <div style="margin-top: 16px">
    <el-form-item label="消息实例">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap">
        <el-select v-model="bindMessageId" @change="updateTaskMessage">
          <el-option v-for="id in Object.keys(messageMap)" :value="id" :label="messageMap[id]" :key="id" />
        </el-select>
        <el-button size="mini" type="primary" icon="el-icon-plus" style="margin-left: 8px" @click="openMessageModel" />
      </div>
    </el-form-item>
    <el-dialog v-model="messageModelVisible" :close-on-click-modal="false" title="创建新消息" width="400px" append-to-body destroy-on-close>
      <el-form :model="newMessageForm" size="mini" label-width="90px" @submit.prevent>
        <el-form-item label="消息ID">
          <el-input v-model="newMessageForm.id" clearable />
        </el-form-item>
        <el-form-item label="消息名称">
          <el-input v-model="newMessageForm.name" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="mini" type="primary" @click="createNewMessage">确 认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';

// 定义组件属性
const props = defineProps({
  id: String,
  type: String
});

// 响应式数据
const bindMessageId = ref('');
const newMessageForm = reactive({});
const messageMap = reactive({});
const messageModelVisible = ref(false);

// 非响应式临时数据
let bpmnMessageRefsMap = Object.create(null);
let bpmnRootElements = [];
let bpmnElement = null;

// 获取绑定的消息
const getBindMessage = () => {
  bpmnElement = window.bpmnInstances.bpmnElement;
  bindMessageId.value = bpmnElement?.businessObject?.messageRef?.id || "-1";
};

// 打开消息模型对话框
const openMessageModel = () => {
  messageModelVisible.value = true;
  Object.keys(newMessageForm).forEach(key => delete newMessageForm[key]);
};

// 创建新消息
const createNewMessage = () => {
  if (messageMap[newMessageForm.id]) {
    ElMessage.error("该消息已存在，请修改id后重新保存");
    return;
  }
  const newMessage = window.bpmnInstances.moddle.create("bpmn:Message", newMessageForm);
  bpmnRootElements.push(newMessage);
  messageMap[newMessageForm.id] = newMessageForm.name;
  bpmnMessageRefsMap[newMessageForm.id] = newMessage;
  messageModelVisible.value = false;
};

// 更新任务消息
const updateTaskMessage = (messageId) => {
  if (messageId === "-1") {
    window.bpmnInstances.modeling.updateProperties(bpmnElement, {
      messageRef: null
    });
  } else {
    window.bpmnInstances.modeling.updateProperties(bpmnElement, {
      messageRef: bpmnMessageRefsMap[messageId]
    });
  }
};

// 监听id变化
watch(() => props.id, () => {
  nextTick(() => getBindMessage());
}, { immediate: true, deep: true });

// 组件挂载时初始化
onMounted(() => {
  bpmnMessageRefsMap = Object.create(null);
  bpmnRootElements = window.bpmnInstances.modeler.getDefinitions().rootElements;
  bpmnRootElements
    .filter(el => el.$type === "bpmn:Message")
    .forEach(m => {
      bpmnMessageRefsMap[m.id] = m;
      messageMap[m.id] = m.name;
    });
  messageMap["-1"] = "无"; // 添加一个空对象，保证可以取消原消息绑定
});

// 组件卸载前清理
onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>
