<template>
  <div class="scheduler-monitor-panel">
    <div class="search-container">
      <tableAndPage ref="tableRef" apiUrl="/slave/slaveManager" :queryParams="queryParams" :btnList="operationList"
        :designTableColumns="designTableColumns" :showBorder="true" :light="true" @btnClick="btnClick"
        primaryKey="slaveId" :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 1 }"
        :interfaceType="{ type: 'POST', parameterType: 'special' }" class="table-container">
        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </tableAndPage>
    </div>
    <el-dialog v-model="showProgressDialog" :title="isShowingResult ? '节点体检结果' : '节点体检进度'" width="500px"
      :show-close="isShowingResult" :close-on-press-escape="isShowingResult" :close-on-click-modal="isShowingResult">
      <div v-if="!isShowingResult">
        <!-- 进度阶段 -->
        <el-progress :percentage="progressPercentage" :status="progressPercentage === 100 ? 'success' : null" />
        <div class="progress-message">{{ progressMessage }}</div>
      </div>
      <div v-else>
        <!-- 结果阶段 -->
        <div class="test-result-details">
          <h2>节点体检报告</h2>
          <p><strong>节点进程状态:</strong> <span
              :class="currentResult.carteStatus === 'Y' ? 'status-success' : 'status-error'">{{
                currentResult.carteStatus
                  === 'Y' ? '正常' : '异常' }}</span></p>
          <p><strong>节点服务器网络状态:</strong> <span
              :class="currentResult.slaveNetwork === 'Y' ? 'status-success' : 'status-error'">{{
                currentResult.slaveNetwork
                  === 'Y' ? '正常' : '异常' }}</span></p>
          <p><strong>节点服务支持的第三方工具:</strong> {{ currentResult.slaveJarSupport || '无' }}</p>
        </div>
      </div>

      <div v-if="isShowingResult" class="dialog-footer">
        <el-button type="primary" @click="showProgressDialog = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 节点表单对话框 -->
    <SzycDialog :dialogVisible="dialogVisible" width="60%" @close="dialogVisible = false" :title="dialogTitle"
      :destroy-on-close="true" :alignCenter="true">
      <template #uname>
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="360px">
          <el-tabs v-model="activeTab" type="card" style="height: 400px;">
            <el-tab-pane label="服务" name="service">
              <el-form-item label="服务器名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入服务器名称" />
              </el-form-item>
              <el-form-item label="主机名称或IP地址" prop="hostname">
                <el-input v-model="formData.hostname" placeholder="请输入主机名称或IP地址" />
              </el-form-item>
              <el-form-item label="端口号(如果不写就是80端口)" prop="port">
                <el-input v-model="formData.port" placeholder="请输入端口号" />
              </el-form-item>
              <el-form-item label="Web App Name(required for DI Server)" prop="webAppName">
                <el-input v-model="formData.webAppName" placeholder="请输入Web App Name" />
              </el-form-item>
              <el-form-item label="用户名" prop="username">
                <el-input v-model="formData.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码" />
              </el-form-item>
              <!-- <el-form-item label="是否主服务器" prop="master">
                <el-checkbox v-model="isMaster">是</el-checkbox>
              </el-form-item> -->
            </el-tab-pane>
            <el-tab-pane label="代理" name="proxy">
              <el-form-item label="代理服务器主机名" prop="proxy_hostname">
                <el-input v-model="formData.proxy_hostname" placeholder="请输入代理服务器主机名" />
              </el-form-item>
              <el-form-item label="代理服务器端口" prop="proxy_port">
                <el-input v-model="formData.proxy_port" placeholder="请输入代理服务器端口" />
              </el-form-item>
              <el-form-item label="Ignore proxy for hosts: regexp | separated" prop="non_proxy_hosts">
                <el-input v-model="formData.non_proxy_hosts" placeholder="请输入忽略代理的主机规则" />
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <div style="margin-top: 20px; display: flex; justify-content: center;">
          <szycButton type="cancel" @click="editCancel"> 取消 </szycButton>
          <szycButton @click="handleDialogConfirm"> 保存 </szycButton>
        </div>
      </template>
    </SzycDialog>
    <SzycDialog :dialogVisible="visible" width="80%" @close="closeModal" title="节点指标" :destroy-on-close="true"
      :alignCenter="true">
      <template #uname>
        <div class="dialog-body-scroll">
          <div class="grid-container">
            <MetricLineChart title="负载情况" :chartData="chartData.loadAvg" />
            <MetricLineChart title="线程数" :chartData="chartData.threadNum" />
            <MetricLineChart title="空闲内存" :chartData="chartData.freeMem" />
            <MetricLineChart title="CPU利用率" :chartData="chartData.cpuUsage" />
          </div>
        </div>
      </template>
    </SzycDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { slaveTest, addSlave, updateSlaveServer, allSlaveQuato, deleteSlave } from '@/api/kettleApi';
import searchForm from "@/components/element/SearchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";
import szycButton from "@/components/element/Confirm.vue"
import MetricLineChart from "./MetricLineChart.vue"

// 表格引用
const tableRef = ref(null)
// 查询参数
const queryParams = reactive({
})
const logDetailContent = ref('')
const configDetailContent = ref('')
const configDetailVisible = ref(false)
const logDetailVisible = ref(false)
const dialogVisible = ref(false)
const activeTab = ref('service')
const visible = ref(false);
const closeModal = () => visible.value = false;

// 表单数据
const formData = ref({
  slaveId: '',
  name: '',
  hostname: '',
  port: '',
  webAppName: '',
  username: '',
  password: '',
  master: false,
  sslMode: 'N',
  proxy_hostname: '',
  proxy_port: '',
  non_proxy_hosts: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入服务器名称', trigger: 'blur' }],
  hostname: [{ required: true, message: '请输入主机名称或IP地址', trigger: 'blur' }],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { pattern: /^\d+$/, message: '端口号必须为数字', trigger: 'blur' }
  ]
}

const isMaster = computed({
  get: () => formData.value.master === 'Y',
  set: (val) => {
    formData.value.master = val ? 'Y' : 'N'
  }
})

const dialogTitle = computed(() => formData.value.slaveId ? '修改节点' : '新增节点')

const designTableColumns = ref([
  {
    columnLabel: "slaveId",
    columnName: "slaveId",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "主机名",
    columnName: "hostName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "端口",
    columnName: "port",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "负载指数",
    columnName: "loadAvg",
    showOverflowTooltip: true,
    formatter: (row) => {
      return `${row.loadAvg} (负载指数)`
    }
  },
  {
    columnLabel: "状态",
    columnName: "status",
    showOverflowTooltip: true,
    hasSlot: true,
  },
  {
    columnLabel: "运行中作业数",
    columnName: "runningJobNum",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "运行中转换数",
    columnName: "runningTransNum",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "已完成作业数",
    columnName: "finishJobNum",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "已完成转换数",
    columnName: "finishTransNum",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "运行时长",
    columnName: "upTime",
    showOverflowTooltip: true,
  },
]);

const operationList = ref([
  { btnType: "view", text: "节点体检", typeRow: "rowType" },
  { btnType: "view", text: "节点指标", typeRow: "rowType" },
  { btnType: "add" },
  { btnType: "edit" },
  { btnType: "delete" },
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
  return status.includes('正常') ? 'success' : 'danger'
}

const getStatusText = (status) => {
  return status.replace(/<[^>]*>/g, '') // 移除HTML标签
}


// 添加响应式变量用于控制进度条和结果展示
const showProgressDialog = ref(false)
const progressPercentage = ref(0)
const progressMessage = ref('')
const currentResult = ref(null)
const isShowingResult = ref(false)

const handleTest = async (row) => {
  try {
    // 显示进度对话框
    showProgressDialog.value = true
    isShowingResult.value = false
    currentResult.value = null
    progressMessage.value = '正在初始化节点体检...'
    progressPercentage.value = 0

    const hostName = row.hostName;
    const updateProgress = (percentage, message) => {
      progressPercentage.value = percentage
      progressMessage.value = message
    }
    updateProgress(20, '正在连接节点...')
    await new Promise(resolve => setTimeout(resolve, 500))

    updateProgress(50, '正在执行体检...')

    let res = await slaveTest({
      hostName: hostName
    })
    let result = res

    updateProgress(80, '正在处理结果...')
    await new Promise(resolve => setTimeout(resolve, 300))

    updateProgress(100, '体检完成')
    await new Promise(resolve => setTimeout(resolve, 500))

    currentResult.value = result
    isShowingResult.value = true
    progressMessage.value = '体检完成'

  } catch (error) {
    // 显示错误信息
    progressMessage.value = '体检失败'
    ElMessage.error('节点体检失败')
    setTimeout(() => {
      showProgressDialog.value = false
    }, 2000)
  }
}


const btnClick = async (item, row) => {
  console.log(item);
  if (item.text == "节点体检") {
    handleTest(row)
  } else if (item.text == "新增") {
    formData.value = {
      slaveId: '',
      name: '',
      hostName: '',
      port: '',
      webAppName: '',
      username: '',
      password: '',
      master: false,
      sslMode: 'N',
      proxy_hostname: '',
      proxy_port: '',
      non_proxy_hosts: ''
    }
    dialogTitle.value = '新增节点'
    dialogVisible.value = true
  } else if (item.text == "编辑") {
    formData.value = {
      ...row
    }
    dialogTitle.value = '修改节点'
    dialogVisible.value = true
  } else if (item.text == "节点指标") {
    getSlaveMetrics(row)
  } else if (item.text == "删除") {
    handleDelete(row)
  }
};

const editCancel = () => {
  dialogVisible.value = false
}

const handleDialogConfirm = async () => {
  try {
    if (dialogTitle.value == '新增节点') {
      await addSlave(formData.value)
    } else if (dialogTitle.value == '修改节点') {
      await updateSlaveServer(formData.value)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    tableRef.value.fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}


const chartData = ref({});
const getSlaveMetrics = async (row) => {
  try {
    let res = await allSlaveQuato({})
    chartData.value = res
    visible.value = true
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此节点吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    let res = await deleteSlave({
      slaveId: row.slaveId
    })
    loadSlaveData()
  } catch (error) {
    console.error('删除节点失败:', error)
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
  align-items: center;
  gap: 10px;
  margin: 0 10px;
}

.test-result-details h2 {
  margin-top: 0;
  color: #409eff;
}

.test-result-details p {
  margin: 8px 0;
  word-break: break-all;
}

.progress-message {
  margin-top: 15px;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

.status-success {
  color: #67c23a;
  font-weight: bold;
}

.status-error {
  color: #f56c6c;
  font-weight: bold;
}

.dialog-body-scroll {
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
</style>