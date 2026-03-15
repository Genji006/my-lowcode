<template>
  <div class="scheduler-monitor-panel">
    <div class="search-container">
      <searchForm :modelValue="queryParams" :items="searchItems" :inline="true" labelWidth="" @reset="handleReset"
        @searchVal="handleSearch" class="search-form">
      </searchForm>
      <tableAndPage ref="tableRef" apiUrl="/log/getAllHistoryLog" :queryParams="queryParams" :btnList="operationList"
        :designTableColumns="designTableColumns" :showBorder="true" :light="true" @btnClick="buttonClick"
        primaryKey="fireId" :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }"
        :interfaceType="{ type: 'POST', parameterType: 'special' }" class="table-container">
        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
        </template>
      </tableAndPage>
    </div>

    <!-- 日志详情弹窗 -->
    <el-dialog v-model="logDetailVisible" title="日志详情" width="60%" destroy-on-close>
      <div class="log-content" v-html="logDetailContent"></div>
      <template #footer>
        <el-button @click="logDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 参数详情弹窗 -->
    <el-dialog v-model="configDetailVisible" title="参数详情" width="60%" destroy-on-close>
      <div class="config-content" v-html="configDetailContent"></div>
      <template #footer>
        <el-button @click="configDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTraceById } from '@/api/kettleApi'
import searchForm from "@/components/element/SearchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";

// 表格引用
const tableRef = ref(null)
// 查询参数
const queryParams = reactive({
  statu: '',
  type: '',
  taskName: '',
  startDate: ''
})
const logDetailContent = ref('')
const configDetailContent = ref('')
const configDetailVisible = ref(false)
const logDetailVisible = ref(false)


const searchItems = computed(() => [
  {
    label: "执行结果：",
    prop: "statu",
    component: "el-select",
    options: [
      { value: '成功', label: '成功' },
      { value: '失败', label: '失败' },
      { value: '系统调度失败', label: '系统调度失败' }
    ],
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true, filterable: true },
    optionValue: "value",
    optionLabel: "label",
  },
  {
    label: "任务类型：",
    prop: "type",
    component: "el-select",
    options: [
      { value: 'job', label: '作业' },
      { value: 'trans', label: '转换' }
    ],
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true, filterable: true },
    optionValue: "value",
    optionLabel: "label",
  },
  {
    component: "el-input",
    label: "任务名：",
    style: { width: "220px" },
    prop: "taskName",
  },
  {
    component: "el-date-picker",
    label: "开始时间：",
    style: { width: "250px" },
    prop: "startDate",
    attrs: {
      placeholder: "请选择",
      clearable: true,
      "value-format": "YYYY-MM-DD",
    },
  },
]);

const designTableColumns = ref([
  {
    columnLabel: "任务名",
    columnName: "jobName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "任务类型",
    columnName: "type",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "开始时间",
    columnName: "startTime",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "结束时间",
    columnName: "endTime",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "执行方式",
    columnName: "execMethod",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "状态",
    columnName: "status",
    showOverflowTooltip: true,
    hasSlot: true,
  },
]);

const operationList = ref([
  { btnType: "view", text: "参数信息", typeRow: "rowType" },
  { btnType: "view", text: "日志详情", typeRow: "rowType" },
]);

const handleSearch = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData("");
};

const handleReset = () => {
  if (!tableRef.value) return;
  tableRef.value.fetchData("重置");
};


const getStatusTagType = (status) => {
  switch (status) {
    case '成功':
      return 'success'
    case '失败':
    case '系统调度失败':
      return 'danger'
    default:
      return 'info'
  }
}

const btnClick = async (item, row) => {
  if (item.text == "日志详情") {
    await showLogInfo(row)
  } else if (item.text == "参数信息") {
    await showConfigInfo(row)
  }
};

// 显示日志详情
const showLogInfo = async (row) => {
  try {
    const response = await getTraceById(row.fireId)
    const trace = response.data
    let executionLog = trace.executionLog
    let status = trace.status

    let windowHTML = ""
    if (status !== "系统调度失败" && status !== "程序错误") {
      try {
        const logJSON = JSON.parse(executionLog)
        if (logJSON.log) {
          windowHTML += `log:<br/>${logJSON.log}<br/><br/>`
        }
      } catch (e) {
        // 如果解析JSON失败，直接显示原始日志
        windowHTML += executionLog
      }
    } else {
      windowHTML += executionLog
    }

    logDetailContent.value = windowHTML
    logDetailVisible.value = true
  } catch (error) {
    console.error('获取日志详情失败:', error)
    ElMessage.error('获取日志详情失败')
  }
}

// 显示参数详情
const showConfigInfo = async (row) => {
  try {
    const response = await getTraceById(row.fireId)

    const trace = response.data
    let executionConfiguration = trace.executionConfiguration
    let windowHTML = ""

    if (executionConfiguration && executionConfiguration !== "") {
      try {
        const configJSON = JSON.parse(executionConfiguration)

        for (const item in configJSON) {
          if (item === "parameters" || item === "variables" || item === "arguments") {
            const array = configJSON[item]
            let twoInfo = ""

            if (Array.isArray(array)) {
              for (let i = 0; i < array.length; i++) {
                const attr = array[i]
                for (const item2 in attr) {
                  twoInfo += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item2}:${attr[item2]}<br/>`
                }
              }
            }

            if (item === "parameters") {
              windowHTML += `命名参数:<br/>${twoInfo}<br/>`
            } else if (item === "variables") {
              windowHTML += `变量:<br/>${twoInfo}<br/>`
            } else if (item === "arguments") {
              windowHTML += `位置参数:<br/>${twoInfo}<br/>`
            }
          } else if (item === "safe_mode") {
            windowHTML += `是否使用安全模式:<br/>${configJSON[item]}<br/><br/>`
          } else if (item === "log_level") {
            windowHTML += `日志级别:<br/>${configJSON[item]}<br/><br/>`
          } else if (item === "group") {
            const array = configJSON[item]
            if (array === "暂未分配任务组") {
              windowHTML += `所属任务组:<br/>${array}<br/><br/>`
            } else {
              let twoInfo = ""
              if (Array.isArray(array)) {
                for (let i = 0; i < array.length; i++) {
                  const attr = array[i]
                  twoInfo += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${(i + 1)}:${attr}<br/>`
                }
              }
              windowHTML += `所属任务组:<br/>${twoInfo}<br/>`
            }
          }
        }
      } catch (e) {
        console.error('解析配置信息失败:', e)
      }
    }

    configDetailContent.value = windowHTML
    configDetailVisible.value = true
  } catch (error) {
    console.error('获取参数详情失败:', error)
    ElMessage.error('获取参数详情失败')
  }
}


// 初始化数据
onMounted(() => {
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