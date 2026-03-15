<template>
    <SzycDialog :dialogVisible="dialogVisible" width="40%" @close="dialogVisible = false" title="值映射"
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
                            <el-form-item label="使用的字段名：">
                                <el-select v-model="form.field_to_use" style="width: 100%;">
                                    <el-option v-for="item in partitioningFieldList" :key="item.name" :label="item.name"
                                        :value="item.name"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="目标字段名：">
                                <el-input v-model="form.target_field" placeholder="（空 = 覆盖）"></el-input>
                            </el-form-item>
                            <el-form-item label="不匹配时的默认值：">
                                <el-input v-model="form.non_match_default" placeholder=""></el-input>
                            </el-form-item>
                            <el-form-item label="字段值：">
                                <RightClickTable ref="fileTableRef" v-model="form.fields" :columns="fileDataColumns"
                                    :showIndex="true" :height="200" style="width: 100%" :needSpecialFunction="false">
                                </RightClickTable>
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
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";;
import { getDatabases, inputOutputFields, tableFields } from "@/api/kettleApi/index";
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'
import RightClickTable from "../tools/rightClickTable.vue";

const { mxUtils } = window.mx;
// 定义事件
const emit = defineEmits(["update-step"]);

const dialogVisible = ref(false);
const activeTab = ref("");
const partitioningFieldList = ref([])
const columnList = ref([])

const form = reactive({
    stepName: "",
    field_to_use: "",
    target_field: "",
    non_match_default: "",
    fields: []
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
        console.log("parseStepInfoAndPopulateForm", stepInfoXml, xmlDoc);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('Step');
        console.log("stepElements", stepElements);
        if (stepElements.length > 0) {
            const valueMapper = stepElements[0];
            console.log("valueMapper", valueMapper);
            // 填充表单字段
            form.stepName = valueMapper.getAttribute('label') || '';
            form.field_to_use = valueMapper.getAttribute('field_to_use') || '';
            form.target_field = valueMapper.getAttribute('target_field') || '';
            form.non_match_default = valueMapper.getAttribute('non_match_default') || '';
            form.fields = JSON.parse(valueMapper.getAttribute('fields') || '[]');
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
        // 查找 step 元素
        const stepElements = xmlDoc.getElementsByTagName("Step");
        if (stepElements.length > 0) {
            const valueMapper = stepElements[0];
            // 更新属性
            valueMapper.setAttribute("label", form.stepName);
            valueMapper.setAttribute("field_to_use", form.field_to_use);
            valueMapper.setAttribute("target_field", form.target_field);
            valueMapper.setAttribute("non_match_default", form.non_match_default);
            valueMapper.setAttribute("fields", JSON.stringify(form.fields));
            // 返回更新后的XML
            return mxUtils.getPrettyXml(valueMapper);
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


const fileDataColumns = computed(() => [
    {
        prop: 'source_value',
        label: '源值',
        type: "input",
    },
    {
        prop: 'target_value',
        label: '目标值',
        type: "input",
    },
]);

const stepName = ref('')

const getPartitioningField = async () => {
    try {
        let params = {
            stepName: stepName.value,
            graphXml: allXml,
            before: true
        };
        let res = await inputOutputFields(params);
        partitioningFieldList.value = res
    } catch {
        ElMessage.error("获取分区字段失败")
    }
}



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
        stepName.value = data.cell.value || "";
        parseStepInfoAndPopulateForm(currentXml);
        getPartitioningField()

    }
    dialogVisible.value = true;
};

// 暴露方法给父组件使用
defineExpose({
    openDialog,
});
</script>


<style lang="scss" scoped></style>