<template>
    <SzycDialog :dialogVisible="dialogVisible" width="35%" @close="dialogVisible = false" title="删除目录"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-position="right" label-width="80px">
                            <el-divider content-position="left">设置</el-divider>
                            <el-form-item>
                                <el-checkbox v-model="form.arg_from_previous" label="保存上一步的结果到参数" />
                            </el-form-item>

                            <el-divider content-position="left">属性文件</el-divider>
                            <el-form-item label="成功条件">
                                <el-select v-model="form.success_condition" placeholder="请选择成功条件" style="width: 100%">
                                    <el-option v-for="charset in charsetOptionList" :key="charset.code"
                                        :label="charset.desc" :value="charset.code" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="数量">
                                <el-input v-model="form.limit_folders"
                                    :disabled="form.success_condition == 'success_if_no_errors'" />
                            </el-form-item>

                            <el-divider content-position="left">待删除的文件夹</el-divider>

                            <RightClickTable v-model="form.fields" :columns="fieldsColumns" :showIndex="true"
                                :height="300" style="width: 100%">
                                <template #cell-suffix-field="{ row, column }">
                                    <el-button size="small" @click="handleFieldAction(row, column)">
                                        浏览
                                    </el-button>
                                </template>
                            </RightClickTable>
                        </el-form>
                    </el-tabs>
                </el-form>
                <div style="display: flex;width: 100%;justify-content: center;margin-top: 20px;">
                    <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                    <szycButton type="primary" @click="handleConfirm">确定</szycButton>
                </div>
            </div>
        </template>
    </SzycDialog>
    <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import FileExplorerWindow from '../../formItems/tools/FileExplorerWindow.vue'
import { deleteFoldersSuccessCondition } from "@/api/kettleApi";
import RightClickTable from "../../formItems/tools/rightClickTable.vue";


const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const showFileExplorer = ref(false);

const form = reactive({
    stepName: "",
    fields: [],
    arg_from_previous: false,
    success_condition: '',
    limit_folders: '',
});

// 存储当前编辑的节点信息
let currentCell = null;
let currentGraph = null;
let currentXml = null;
// 获取完整xml
let allXml = null
let transName = ref("")
// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        let stepElements = xmlDoc.getElementsByTagName('JobEntry');
        if (stepElements.length > 0) {
            const deleteFolders = stepElements[0];
            // 填充表单字段
            form.stepName = deleteFolders.getAttribute('label') || '';
            form.arg_from_previous = deleteFolders.getAttribute('arg_from_previous') === 'Y';
            form.success_condition = deleteFolders.getAttribute('success_condition') || '';
            form.limit_folders = deleteFolders.getAttribute('limit_folders') || '';
            form.fields = JSON.parse(deleteFolders.getAttribute('fields') || '[]');
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
        const stepElements = xmlDoc.getElementsByTagName("JobEntry");
        if (stepElements.length > 0) {
            const deleteFolders = stepElements[0];
            // 更新属性
            deleteFolders.setAttribute("label", form.stepName);
            deleteFolders.setAttribute("arg_from_previous", form.arg_from_previous ? "Y" : "N");
            deleteFolders.setAttribute("success_condition", form.success_condition);
            deleteFolders.setAttribute("limit_folders", form.limit_folders);
            deleteFolders.setAttribute("fields", JSON.stringify(form.fields));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(deleteFolders);
        }

        return stepInfoXml; // 如果没有找到step元素，返回原始XML
    } catch (error) {
        console.error("更新stepInfo XML失败:", error);
        ElMessage.error("更新stepInfo XML数据失败");
        return stepInfoXml;
    }
};

const handleConfirm = () => {
    if (currentCell && currentGraph && currentXml) {
        // 更新节点名称
        currentGraph
            .getModel()
            .setValue(currentCell, form.stepName);

        // 更新节点的 step（XML结构）
        currentXml = updateStepInfoXml(currentXml);
        console.log("currentXml", currentXml);
        // 将更新后的 XML 数据传递回父组件
        emit("update-step", {
            cell: currentCell,
            updatedXml: currentXml,
        });
    }
    dialogVisible.value = false;
};


const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell;
        currentGraph = data.graph;
        currentXml = data.xml;
        allXml = data.allXml
        transName.value = data.transName
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        getAvailableCharsets()
    }
    dialogVisible.value = true;
};

const charsetOptionList = ref([])
const getAvailableCharsets = () => {
    deleteFoldersSuccessCondition({}).then(res => {
        charsetOptionList.value = res
    })
}

const currentEditingRow = ref(null)
const handleFieldAction = (row, column) => {
    currentEditingRow.value = row
    showFileExplorer.value = true;
    console.log(currentEditingRow.value, row);
}

const handleFileSelected = (filePath) => {
    if (currentEditingRow) {
        currentEditingRow.value.field = filePath
        showFileExplorer.value = false
        currentEditingRow.value = null
    }
}

const fieldsColumns = [
    {
        prop: 'field',
        label: '文件夹',
        showSlot: true
    },
]

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>