<template>
    <SzycDialog :dialogVisible="dialogVisible" width="40%" @close="handleDialogClose" title="获取系统信息"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="130px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName"></el-input>
                    </el-form-item>

                    <!-- 系统信息字段配置 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <div class="dialog-content-wrapper">
                            <el-tab-pane label="字段" name="fields" class="tableStyle">
                                <RightClickTable v-model="form.fields" :columns="logDataColumns"
                                    :defaultRow="defaultLogDataRow" :showIndex="true" :height="200">
                                </RightClickTable>
                            </el-tab-pane>
                        </div>
                    </el-tabs>
                </el-form>
            </div>
            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="handleDialogClose">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { ElMessage } from 'element-plus'
import { systemDataTypes } from "@/api/kettleApi/index.js";
import RightClickTable from "../tools/rightClickTable.vue";
// 获取 mxUtils
const { mxUtils } = window.mx;
// 定义 emits
const emit = defineEmits(['update-step'])

const dialogVisible = ref(false)
const defaultLogDataRow = ref({});
const activeTab = ref('fields')
const form = reactive({
    stepName: '',
    fields: [],
})

// 表格列配置
const logDataColumns = computed(() => [
    { prop: "name", label: "名称" },
    {
        prop: "type",
        label: "类型",
        type: "select",
        options: [],
        valueKey: "code",
        labelKey: "descrp",
        filterable: true,
    },
]);

// 存储当前编辑的节点信息
let currentCell = null
let currentGraph = null
let currentXml = null
let allXml = null
let transName = ref("")

// 打开对话框
const openDialog = (data) => {
    if (data && data.cell) {
        currentCell = data.cell
        currentGraph = data.graph
        currentXml = data.xml
        allXml = data.allXml
        transName.value = data.transName

        console.log("open systemInfo", currentXml);
        parseStepInfoAndPopulateForm(currentXml);

        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || ''
        getSystemDataTypes();
    }
    dialogVisible.value = true
}

// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        let stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const systemInfo = stepElements[0];
            console.log("systemInfo", systemInfo);

            // 填充表单字段
            form.stepName = systemInfo.getAttribute('label') || '';
            form.fields = JSON.parse(systemInfo.getAttribute("fields")) || [];

        }
    } catch (error) {
        console.error('解析stepInfo XML失败:', error);
        ElMessage.error("解析stepInfo XML数据失败");
    }
}

// 更新stepInfo XML中的数据
const updateStepInfoXml = (stepInfoXml) => {
    try {
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        const stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const systemInfo = stepElements[0];

            // 更新属性
            systemInfo.setAttribute('label', form.stepName);
            systemInfo.setAttribute('fields', JSON.stringify(form.fields));

            // 返回更新后的XML
            return mxUtils.getPrettyXml(systemInfo);
        }

        return stepInfoXml;
    } catch (error) {
        console.error('更新stepInfo XML失败:', error);
        ElMessage.error("更新stepInfo XML数据失败");
        return stepInfoXml;
    }
}

const handleConfirm = () => {
    if (currentCell && currentGraph && currentXml) {
        // 更新节点名称
        currentGraph.getModel().setValue(currentCell, form.stepName);

        // 更新节点的 step（XML结构）
        currentXml = updateStepInfoXml(currentXml);
        console.log("currentXml", currentXml);

        // 将更新后的 XML 数据传递回父组件
        emit('update-step', {
            cell: currentCell,
            updatedXml: currentXml
        });
    }
    dialogVisible.value = false
}

const handleDialogClose = () => {
    dialogVisible.value = false
}

const getSystemDataTypes = async () => {
    let res = await systemDataTypes({});
    logDataColumns.value[1].options = res;
}

onMounted(() => {
})

// 暴露方法给父组件使用
defineExpose({
    openDialog
})
</script>

<style lang="scss" scoped>
.tabItem {
    margin-top: 10px;

    .tableStyle {
        :deep(.el-table .cell) {
            padding: 0 !important;
        }

        :deep(.el-input__wrapper) {
            border: none !important;
        }

        :deep(.el-select__wrapper) {
            border: none !important;
        }
    }

    .parameters {
        :deep(.el-table .cell) {
            padding: 0 !important;
        }

        :deep(.el-input__wrapper) {
            border: none !important;
        }

        :deep(.el-select__wrapper) {
            border: none !important;
        }
    }
}
</style>
