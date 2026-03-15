<template>
    <SzycDialog :dialogVisible="dialogVisible" width="35%" @close="dialogVisible = false" title="等待文件"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!-- 其他表单项 -->
                    <el-tabs type="border-card" v-model="activeTab" class="tabItem">
                        <el-form label-position="right" label-width="140px">
                            <el-divider content-position="left">属性文件</el-divider>
                            <el-form-item label="文件名">
                                <el-input v-model="form.filename" placeholder="请输入文件路径">
                                    <template #append>
                                        <el-button @click="showFileExplorer = true" type="primary">浏览</el-button>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="超时">
                                <el-input v-model="form.maximum_timeout" placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item label="循环检查的时间间隔">
                                <el-input v-model="form.check_cycle_time" placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox v-model="form.success_on_timeout" label="超时则成功" />
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox v-model="form.file_size_check" label="检查文件大小" />
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox v-model="form.add_filename_result" label="添加文件名到结果" />
                            </el-form-item>
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


const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const showFileExplorer = ref(false);

const form = reactive({
    stepName: "",
    filename: "",
    maximum_timeout: "",
    check_cycle_time: "",
    success_on_timeout: false,
    file_size_check: false,
    add_filename_result: false,
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
            const waitForFile = stepElements[0];
            // 填充表单字段
            form.stepName = waitForFile.getAttribute('label') || '';
            form.filename = waitForFile.getAttribute('filename') || '';
            form.maximum_timeout = waitForFile.getAttribute('maximum_timeout') || '';
            form.check_cycle_time = waitForFile.getAttribute('check_cycle_time') || '';
            form.success_on_timeout = waitForFile.getAttribute('success_on_timeout') === 'Y';
            form.file_size_check = waitForFile.getAttribute('file_size_check') === 'Y';
            form.add_filename_result = waitForFile.getAttribute('add_filename_result') === 'Y';
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
            const waitForFile = stepElements[0];
            // 更新属性
            waitForFile.setAttribute("label", form.stepName);
            waitForFile.setAttribute("filename", form.filename);
            waitForFile.setAttribute("maximum_timeout", form.maximum_timeout);
            waitForFile.setAttribute("check_cycle_time", form.check_cycle_time);
            waitForFile.setAttribute("success_on_timeout", form.success_on_timeout ? "Y" : "N");
            waitForFile.setAttribute("file_size_check", form.file_size_check ? "Y" : "N");
            waitForFile.setAttribute("add_filename_result", form.add_filename_result ? "Y" : "N");
            // 返回更新后的XML
            return mxUtils.getPrettyXml(waitForFile);
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
    }
    dialogVisible.value = true;
};

const handleFileSelected = (filePath) => {
    form.filename = filePath;
    showFileExplorer.value = false;
}

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>