<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="执行转换"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                    <el-tab-pane label="一般" name="baseConfig" style="height: 510px;overflow-y: auto;">
                        <el-form label-position="right" label-width="250px">
                            <el-divider content-position="left">执行方式</el-divider>
                            <el-form-item label="">
                                <el-radio-group v-model="executionType">
                                    <el-radio label="local" @change="updateExecTypes">本地执行</el-radio>
                                    <el-radio label="remote" @change="updateExecTypes">远程执行</el-radio>
                                    <el-radio label="cluster" @change="updateExecTypes">集群方式执行</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="远程主机：">
                                <el-select v-model="form.remote_server" placeholder="请选择" :disabled="!form.exec_remote">
                                    <el-option v-for="item in slaveList" :key="item.hostId" :label="item.hostName"
                                        :value="item.hostName"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="">
                                <el-checkbox v-model="form.pass_export"
                                    :disabled="!form.exec_remote">将导出的文件发送到远程服务器</el-checkbox>
                            </el-form-item>
                            <el-form-item label="">
                                <el-checkbox v-model="form.cluster_prepare"
                                    :disabled="!form.exec_cluster">提交转换</el-checkbox>
                            </el-form-item>
                            <el-form-item label="">
                                <el-checkbox v-model="form.cluster_post"
                                    :disabled="!form.exec_cluster">准备执行</el-checkbox>
                            </el-form-item>
                            <el-form-item label="">
                                <el-checkbox v-model="form.cluster_start"
                                    :disabled="!form.exec_cluster">开始执行</el-checkbox>
                            </el-form-item>
                            <el-form-item label="">
                                <el-checkbox v-model="form.cluster_show_trans"
                                    :disabled="!form.exec_cluster">显示转换</el-checkbox>
                            </el-form-item>
                            <el-divider content-position="left">细节</el-divider>
                            <el-form-item label="使用安全模式：">
                                <el-checkbox v-model="form.safe_mode"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="Gather performance metrics：">
                                <el-checkbox v-model="form.gather_metrics"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="日志级别：">
                                <el-select v-model="form.log_level" placeholder="请选择">
                                    <el-option v-for="item in logLevelList" :key="item.id" :label="item.desc"
                                        :value="item.code"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="重放日期(yyyy/MM/dd HH:mm:ss)：">
                                <el-input v-model="form.replay_date" placeholder=""></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="命名参数" name="paramConfig" style="height: 510px;overflow-y: auto;">
                        <RightClickTable ref="paramTableRef" v-model="form.parameters" :columns="paramDataColumns"
                            :showIndex="true" :height="500" style="width: 100%">
                        </RightClickTable>
                    </el-tab-pane>
                    <el-tab-pane label="变量" name="varConfig" style="height: 510px;overflow-y: auto;">
                        <RightClickTable ref="varTableRef" v-model="form.variables" :columns="varDataColumns"
                            :showIndex="true" :height="500" style="width: 100%">
                        </RightClickTable>
                    </el-tab-pane>
                    <el-tab-pane label="位置参数" name="posParamConfig" style="height: 510px;overflow-y: auto;">
                        <RightClickTable ref="posParamTableRef" v-model="form.arguments" :columns="argumentColumns"
                            :showIndex="true" :height="500" style="width: 100%">
                        </RightClickTable>
                    </el-tab-pane>
                </el-tabs>
                <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                    <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                    <szycButton type="primary" @click="handleConfirm">运行</szycButton>
                </div>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import { systemLogLevel, getSlaveSelect } from "@/api/kettleApi/index";
import RightClickTable from "../tools/rightClickTable.vue";

// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("baseConfig");
const executionType = ref("local"); // 用于界面展示的执行类型
const logLevelList = ref([])
const slaveList = ref([])
const form = reactive({
    exec_local: false,
    exec_remote: false,
    exec_cluster: false,
    remote_server: '',
    pass_export: false,
    cluster_prepare: false,
    parameters: [],
    variables: [],
    arguments: [],
});

const paramFields = ref([])
const updateFields = ref([])
const columnList = ref([])
const nameList = ref([])

// 当用户切换执行方式时，更新三个布尔值参数
const updateExecTypes = () => {
    form.exec_local = executionType.value === "local";
    form.exec_remote = executionType.value === "remote";
    form.exec_cluster = executionType.value === "cluster";
}

const paramDataColumns = computed(() => [
    {
        prop: 'name',
        label: '命名参数',
    },
    {
        prop: "value",
        label: "值",
    },
    {
        prop: 'default_value',
        label: '默认值',
    },
]);

const varDataColumns = computed(() => [
    {
        prop: 'name',
        label: '变量'
    },
    {
        prop: 'value',
        label: '值',
    },
])

const argumentColumns = computed(() => [
    {
        prop: 'name',
        label: '位置参数',
    },
    {
        prop: "value",
        label: "值",
    },
])

const openDialog = async (data) => {
    if (data && data.exec_local) {
        executionType.value = data.exec_local === "Y" ? "local" : "remote";
    } else if (data && data.exec_remote) {
        executionType.value = data.exec_remote === "Y" ? "remote" : "local";
    } else if (data && data.exec_cluster) {
        executionType.value = data.exec_cluster === "Y" ? "cluster" : "local";
    }

    // 同步表单数据并转换YN为布尔值
    if (data) {
        const convertedData = { ...data };
        // 将所有Y/N值转换为布尔值
        Object.keys(convertedData).forEach(key => {
            if (convertedData[key] === 'Y') {
                convertedData[key] = true;
            } else if (convertedData[key] === 'N') {
                convertedData[key] = false;
            }
        });
        Object.assign(form, convertedData);
    }
    await getLogLevel()
    await getSlaveSelectList()
    dialogVisible.value = true;
};

// 添加一个函数用于将布尔值转换为Y/N
const convertBooleanToYN = (data) => {
    const result = {};
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'boolean') {
            result[key] = data[key] ? 'Y' : 'N';
        } else {
            result[key] = data[key];
        }
    });
    return result;
};

// 更新处理确认按钮的方法
const handleConfirm = () => {
    ElMessageBox.confirm("确定要运行吗？", "确认运行", {
        confirmButtonText: "运行",
        cancelButtonText: "取消",
        type: "warning",
    }).then(async () => {
        // 在提交前将布尔值转换回Y/N格式
        const submitData = convertBooleanToYN({ ...form });

        // 更新执行类型相关字段
        submitData.exec_local = executionType.value === 'local' ? 'Y' : 'N';
        submitData.exec_remote = executionType.value === 'remote' ? 'Y' : 'N';
        submitData.exec_cluster = executionType.value === 'cluster' ? 'Y' : 'N';

        emit("update-step", submitData);
        dialogVisible.value = false;
    })
};

const getLogLevel = async () => {
    try {
        let res = await systemLogLevel();
        logLevelList.value = res
    } catch {
        ElMessage.error("获取日志级别失败")
    }
}

const getSlaveSelectList = async () => {
    try {
        let res = await getSlaveSelect();
        slaveList.value = res
    } catch {
        ElMessage.error("获取从库列表失败")
    }
}

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>
<style lang="scss" scoped>
.tabItem {

    :deep(.el-radio__label) {
        font-size: 14px !important;
    }
}
</style>