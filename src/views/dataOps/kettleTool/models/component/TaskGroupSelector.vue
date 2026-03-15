<!-- TaskGroupSelector.vue -->
<template>
  <div class="task-group-selector">
    <el-table ref="tableRef" :data="taskGroups" height="350" @selectionChange="handleSelectionChange" border>
      <el-table-column type="selection" width="40"></el-table-column>
      <el-table-column label="序号" type="index" width="60"></el-table-column>
      <el-table-column prop="taskGroupName" label="任务组名称" width="150"></el-table-column>
      <el-table-column prop="taskGroupDesc" label="描述"></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { listTaskApi } from '@/api/kettleApi/index'
const props = defineProps({
  taskType: String, // 'job' 或 'trans'
  taskName: String,
  taskSelectedArray: {
    type: Array,
    default: []
  },
})

const taskGroups = ref([])
const tableRef = ref()
const selectedGroups = ref([])

// 获取所有任务组
async function loadTaskGroups() {
  try {
    const response = await listTaskApi({});
    taskGroups.value = response
  } catch (error) {
    console.error('加载任务组失败:', error)
  }
}

// 处理选择变化
function handleSelectionChange(selection) {
  selectedGroups.value = selection.map(item => item.taskGroupName)
}

// 根据传入的数组设置选中项
function setInitialSelection() {
  if (props.taskSelectedArray && props.taskSelectedArray.length > 0 && tableRef.value) {
    // 获取需要选中的任务组名称列表
    const selectedTaskGroupNames = props.taskSelectedArray.map(item => item.belongToTaskGroup || item.taskGroupName);

    // 遍历所有任务组，设置选中状态
    nextTick(() => {
      taskGroups.value.forEach(group => {
        if (selectedTaskGroupNames.includes(group.taskGroupName)) {
          tableRef.value.toggleRowSelection(group, true);
        }
      });
    });
  }
}

// 获取选中的任务组
function getSelectedGroups() {
  return selectedGroups.value
}

// 监听任务组数据和传入的选中数组变化
watch([taskGroups, () => props.taskSelectedArray], () => {
  setInitialSelection();
});

defineExpose({
  getSelectedGroups
})

onMounted(() => {
  loadTaskGroups()
  // console.log(props.taskSelectedArray.map(item => item.belongToTaskGroup));
})
</script>

<style scoped>
.task-group-selector {
  height: 350px;
}
</style>