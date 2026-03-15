<template>
  <div style="margin-top: 16px">
    <el-form-item label="处理用户">
      <el-select
        v-model="userTaskForm.assignee"
        @change="updateElementTask('assignee')"
        clearable
      >
        <el-option
          v-for="ak in mockData"
          :key="'ass-' + ak"
          :label="`用户${ak}`"
          :value="`user${ak}`"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="候选用户">
      <el-select
        v-model="userTaskForm.candidateUsers"
        multiple
        collapse-tags
        clearable
        @change="updateElementTask('candidateUsers')"
      >
        <el-option
          v-for="uk in mockData"
          :key="'user-' + uk"
          :label="`用户${uk}`"
          :value="`user${uk}`"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="候选分组">
      <el-select
        v-model="userTaskForm.candidateGroups"
        multiple
        collapse-tags
        clearable
        @change="updateElementTask('candidateGroups')"
      >
        <el-option
          v-for="gk in mockData"
          :key="'ass-' + gk"
          :label="`分组${gk}`"
          :value="`group${gk}`"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="到期时间">
      <el-input
        v-model="userTaskForm.dueDate"
        clearable
        @change="updateElementTask('dueDate')"
      />
    </el-form-item>
    <el-form-item label="跟踪时间">
      <el-input
        v-model="userTaskForm.followUpDate"
        clearable
        @change="updateElementTask('followUpDate')"
      />
    </el-form-item>
    <el-form-item label="优先级">
      <el-input
        v-model="userTaskForm.priority"
        clearable
        @change="updateElementTask('priority')"
      />
    </el-form-item>
  </div>
</template>

<script setup>
import { reactive, watch, nextTick, onBeforeUnmount } from "vue";

// 定义组件属性
const props = defineProps({
  id: String,
  type: String,
});

// 默认任务表单
const defaultTaskForm = {
  assignee: "",
  candidateUsers: [],
  candidateGroups: [],
  dueDate: "",
  followUpDate: "",
  priority: "",
};

// 响应式数据
const userTaskForm = reactive({});
const mockData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 非响应式临时变量
let bpmnElement = null;

// 重置任务表单
const resetTaskForm = () => {
  // 清空现有表单
  Object.keys(userTaskForm).forEach((key) => delete userTaskForm[key]);

  // 设置新值
  for (let key in defaultTaskForm) {
    let value;
    if (key === "candidateUsers" || key === "candidateGroups") {
      value = bpmnElement?.businessObject[key]
        ? bpmnElement.businessObject[key].split(",")
        : [];
    } else {
      value = bpmnElement?.businessObject[key] || defaultTaskForm[key];
    }
    userTaskForm[key] = value;
  }
};

// 更新元素任务
const updateElementTask = (key) => {
  const taskAttr = Object.create(null);
  if (key === "candidateUsers" || key === "candidateGroups") {
    taskAttr[key] =
      userTaskForm[key] && userTaskForm[key].length
        ? userTaskForm[key].join()
        : null;
  } else {
    taskAttr[key] = userTaskForm[key] || null;
  }
  window.bpmnInstances.modeling.updateProperties(bpmnElement, taskAttr);
};

// 监听id变化
watch(
  () => props.id,
  () => {
    bpmnElement = window.bpmnInstances.bpmnElement;
    nextTick(() => resetTaskForm());
  },
  { immediate: true, deep: true }
);

// 组件卸载前清理
onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>
