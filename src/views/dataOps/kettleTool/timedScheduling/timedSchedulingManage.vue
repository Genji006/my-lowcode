<template>
  <div class="scheduler-monitor-panel">
    <div class="search-container">
      <searchForm :modelValue="queryParams" :items="searchItems" :inline="true" labelWidth="" @reset="handleReset"
        @searchVal="handleSearch" class="search-form">
      </searchForm>
      <tableAndPage ref="tableRef" apiUrl="/scheduler/getAllJobScheduler" :queryParams="queryParams"
        :btnList="operationList" :designTableColumns="designTableColumns" :showBorder="true" :light="true"
        @btnClick="buttonClick" primaryKey="idJobtask" :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }"
        :interfaceType="{ type: 'POST', parameterType: 'special' }" class="table-container">
      </tableAndPage>
    </div>

    <!-- 修改定时任务对话框 -->
    <el-dialog v-model="updateDialogVisible" title="修改定时任务" width="50%" :close-on-click-modal="false">
      <el-form :model="updateForm" label-width="120px">
        <el-form-item label="定时类型">
          <el-select v-model="updateForm.schedulerType" @change="handleSchedulerTypeChange">
            <el-option v-for="item in schedulerTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- 根据类型动态显示字段 -->
        <template v-if="updateForm.schedulerType === '1'">
          <el-form-item label="间隔分钟数">
            <el-input-number v-model="updateForm.intervalMinutes" :min="1" />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="分钟">
            <el-input-number v-model="updateForm.minutes" :min="0" :max="59" />
          </el-form-item>

          <el-form-item label="小时">
            <el-input-number v-model="updateForm.hours" :min="0" :max="23" />
          </el-form-item>

          <el-form-item v-if="updateForm.schedulerType === '3'" label="星期">
            <el-select v-model="updateForm.weekDay">
              <el-option label="周日" :value="1" />
              <el-option label="周一" :value="2" />
              <el-option label="周二" :value="3" />
              <el-option label="周三" :value="4" />
              <el-option label="周四" :value="5" />
              <el-option label="周五" :value="6" />
              <el-option label="周六" :value="7" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="updateForm.schedulerType === '4'" label="日期">
            <el-input-number v-model="updateForm.dayOfMonth" :min="1" :max="31" />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSlaveSelect, getSchedulerDetails, updateJobScheduler, deleteScheduler } from '@/api/kettleApi'
import searchForm from "@/components/element/SearchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";

// 响应式数据
const selectedRows = ref([])
const slaveHosts = ref([]) // 从API获取的主机列表
const updateDialogVisible = ref(false)
const currentRow = ref(null)


// 表格引用
const tableRef = ref(null)
// 查询参数
const queryParams = reactive({
  typeId: '',
  hostName: '',
  jobName: ''
})

// 定时类型选项
const schedulerTypes = [
  { value: '1', label: '间隔重复' },
  { value: '2', label: '每天执行' },
  { value: '3', label: '每周执行' },
  { value: '4', label: '每月执行' }
]

const searchItems = computed(() => [
  {
    label: "执行类型：",
    prop: "typeId",
    component: "el-select",
    options: schedulerTypes,
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true, filterable: true },
    optionValue: "value",
    optionLabel: "label",
  },
  {
    label: "节点选择：",
    prop: "hostName",
    component: "el-select",
    options: slaveHosts.value,
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true, filterable: true },
    optionValue: "hostName",
    optionLabel: "hostName",
  },
  {
    component: "el-input",
    label: "任务名：",
    style: { width: "220px" },
    prop: "jobName",
  },
]);

const designTableColumns = ref([
  {
    columnLabel: "定时ID",
    columnName: "idJobtask",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "作业名",
    columnName: "jobName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "执行节点",
    columnName: "hostName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "周期",
    columnName: "timerInfo",
    showOverflowTooltip: true,
  },
]);

const operationList = ref([
  {
    btnType: "edit",
  },
  {
    btnType: "deletes",
  },
]);

const handleSearch = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData("");
};

const handleReset = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData("重置");
};


// 更新表单数据
const updateForm = reactive({
  schedulerType: '',
  intervalMinutes: null,
  minutes: null,
  hours: null,
  weekDay: null,
  dayOfMonth: null
})
// 获取从机主机列表
const fetchSlaveHosts = async () => {
  let res = await getSlaveSelect()
  slaveHosts.value = res
  console.log("主机列表", slaveHosts.value);
}


const btnClick = async (item, row) => {
  if (item.text == "编辑") {
    await updateScheduler(row)
  } else if (item.text == "删除") {
    deleteSchedulerFn(row)
  }
};

// 删除定时任务
const deleteSchedulerFn = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确认删除所选中的定时任务?',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    let res = await deleteScheduler({
      taskIdArray: [row.idJobtask]
    })

    if (res.ok) {
      ElMessage.success('删除成功')
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 修改定时任务
const updateScheduler = async (row) => {
  currentRow.value = row

  try {
    let res = await getSchedulerDetails(row.idJobtask)
    if (res.ok) {
      let data = await res.json()

      // 填充更新表单
      updateForm.schedulerType = String(data.schedulertype)
      updateForm.intervalMinutes = data.intervalminutes || null
      updateForm.minutes = data.minutes || null
      updateForm.hours = data.hour || null
      updateForm.weekDay = data.weekday || null
      updateForm.dayOfMonth = data.dayofmonth || null

      updateDialogVisible.value = true
    } else {
      throw new Error('获取定时任务详情失败')
    }
  } catch (error) {
    console.error('Error fetching scheduler details:', error)
    ElMessage.error('获取定时任务详情失败')
  }
}

// 确认更新定时任务
const confirmUpdate = async () => {
  try {
    const params = {
      taskId: currentRow.value.idJobtask,
      schedulertype: parseInt(updateForm.schedulerType),
      intervalminutes: updateForm.intervalMinutes,
      minutes: updateForm.minutes,
      hour: updateForm.hours,
      weekday: updateForm.weekDay,
      dayofmonth: updateForm.dayOfMonth
    }

    let res = await updateJobScheduler(params)
    if (res.ok) {
      ElMessage.success('更新成功')
      updateDialogVisible.value = false
    }
  } catch (error) {
    console.error('Error updating scheduler:', error)
    ElMessage.error('更新失败')
  }
}

// 处理定时类型改变
const handleSchedulerTypeChange = () => {
  // 重置相关字段
  updateForm.intervalMinutes = null
  updateForm.minutes = null
  updateForm.hours = null
  updateForm.weekDay = null
  updateForm.dayOfMonth = null
}

// 初始化数据
onMounted(() => {
  fetchSlaveHosts()
  nextTick(async () => {
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
  });
})
</script>

<style scoped lang="scss">
.search-container {
  width: 100%;
  height: 100%;

  .search-form {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .table-container {
    margin-top: 20px;
    height: 720px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>