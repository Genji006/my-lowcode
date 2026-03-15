<template>
    <div class="app-container">
        <div style="flex-shrink: 0">
            <!-- 搜索区域 -->
            <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="auto" @searchVal="handleQuery"
                @reset="resetQuery" :inline="true" />

        </div>
        <!-- 表格区域 -->
        <div style="margin-top: 16px;width: 100%; flex-grow: 1; margin-top: 16px; height: 10%">
            <tableList ref="tableRef" :queryParams="searchData" v-bind="bindData" @btnClick="btnClick">
                <template #operate="{ row }">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(row)"
                        v-hasPermi="['system:config:edit']">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                        v-hasPermi="['system:config:remove']">删除</el-button>
                </template>
            </tableList>
        </div>
        <!-- 编辑/新增对话框 -->
        <SzycDialog :dialogVisible="open" :title="title" width="500px" @close="cancel">
            <template #uname>
                <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
                    <el-form-item label="参数名称" prop="configName">
                        <el-input v-model="form.configName" placeholder="请输入参数名称" />
                    </el-form-item>
                    <el-form-item label="参数键名" prop="configKey">
                        <el-input v-model="form.configKey" placeholder="请输入参数键名" />
                    </el-form-item>
                    <el-form-item label="参数键值" prop="configValue">
                        <el-input v-model="form.configValue" type="textarea" placeholder="请输入参数键值" />
                    </el-form-item>
                    <el-form-item label="系统内置" prop="configType">
                        <el-radio-group v-model="form.configType">
                            <el-radio v-for="dict in sys_yes_no" :key="dict.dictValue" :label="dict.dictValue">{{
                                dict.dictLabel
                                }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                    </el-form-item>
                </el-form>
                <div class="dialog-btn-class">
                    <CanCelBtn @click="cancel">取 消</CanCelBtn>
                    <buttonDiv type="primary" @click="submitForm">确 定</buttonDiv>
                </div>
            </template>
        </SzycDialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import SzycFormSearch from "@/components/element/searchForm.vue";
import tableList from "@/components/table/tableAndPage.vue";
import SzycDialog from "@/components/dialog/showDialog.vue";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/system/config";
import { systemDictType } from '@/api/system/dict'
import { parseTime } from '@/utils/ruoyi';

const sys_yes_no = ref([])   // 字典


// ========== 响应式状态 ==========
const open = ref(false);
const title = ref("");
const tableRef = ref(null);
const formRef = ref(null);

// 搜索数据模型
const searchData = reactive({
    configName: '',
    configKey: '',
    configType: '',
    dateRange: []
});

// 表单数据
const form = reactive({
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: "Y",
    remark: undefined
});

// 表单验证规则
const rules = reactive({
    configName: [{ required: true, message: "参数名称不能为空", trigger: "blur" }],
    configKey: [{ required: true, message: "参数键名不能为空", trigger: "blur" }],
    configValue: [{ required: true, message: "参数键值不能为空", trigger: "blur" }]
});

// 搜索配置项
const searchItems = computed(() => [
    {
        label: "参数名称：",
        prop: "configName",
        component: "el-input",
        attrs: { placeholder: "请输入参数名称", clearable: true, style: "width:220px" }
    },
    {
        label: "参数键名：",
        prop: "configKey",
        component: "el-input",
        attrs: { placeholder: "请输入参数键名", clearable: true, style: "width:220px" }
    },
    {
        label: "系统内置：",
        prop: "configType",
        component: "el-select",
        options: sys_yes_no.value,
        attrs: { placeholder: "请选择", clearable: true, style: "width:220px" }
    },
    {
        label: "创建时间：",
        prop: "dateRange",
        component: "el-date-picker",
        attrs: {
            type: "daterange",
            "value-format": "yyyy-MM-dd",
            "range-separator": "-",
            "start-placeholder": "开始日期",
            "end-placeholder": "结束日期",
            style: "width:220px"
        }
    }
]);

// 表格配置
const bindData = reactive({
    pageOpen: "1",
    checkBox: "1",
    light: "1", //  是否需要高亮
    primaryKey: "configId",
    apiUrl: "/system/config/list",
    method: 'get',
    showBorder: '1',
    designTableColumns: [
        { columnLabel: "参数主键", columnName: "configId", columnWidth: "100" },
        { columnLabel: "参数名称", columnName: "configName", showOverflowTooltip: true },
        { columnLabel: "参数键名", columnName: "configKey", showOverflowTooltip: true },
        { columnLabel: "参数键值", columnName: "configValue", showOverflowTooltip: true },
        {
            columnLabel: "系统内置",
            columnName: "configType",
            formatter: (row) => {
                const dict = sys_yes_no.value.find(d => d.dictValue === row.configType);
                return dict ? dict.dictLabel : '';
            }
        },
        { columnLabel: "备注", columnName: "remark", showOverflowTooltip: true },
        {
            columnLabel: "创建时间",
            columnName: "createTime",
            formatter: (row) => parseTime(row.createTime)
        },
        {
            columnLabel: "操作",
            columnName: "operate",
            hasSlot: true,
            align: "center"
        }
    ],
    btnList: [
        { btnType: "add", text: "新增", vHasPermi: "system:config:add" },
        { btnType: "edit", text: "修改", vHasPermi: "system:config:edit" },
        { btnType: "delete", text: "删除", vHasPermi: "system:config:remove" },
        { btnType: "add", text: "导出", icon: "el-icon-download", vHasPermi: "system:config:export" },
        { btnType: "add", text: "刷新缓存", icon: "el-icon-refresh", vHasPermi: "system:config:remove" }
    ]
});

// ========== 方法 ==========
const handleQuery = () => {
    tableRef.value.fetchData();
};

const resetQuery = () => {
    Object.assign(searchData, {
        configName: '',
        configKey: '',
        configType: '',
        dateRange: []
    });
    tableRef.value.fetchData('重置');
};

const cancel = () => {
    open.value = false;
    reset();
};

const reset = () => {
    Object.assign(form, {
        configId: undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined,
        configType: "Y",
        remark: undefined
    });
    formRef.value?.resetFields();
};

const handleAdd = () => {
    reset();
    open.value = true;
    title.value = "添加参数";
};

const handleUpdate = (row) => {
    reset();
    getConfig(row.configId).then(response => {
        Object.assign(form, response.data);
        open.value = true;
        title.value = "修改参数";
    });
};

const submitForm = () => {
    formRef.value?.validate((valid) => {
        if (valid) {
            const api = form.configId ? updateConfig : addConfig;
            api(form).then(() => {
                ElMessage.success(form.configId ? "修改成功" : "新增成功");
                open.value = false;
                handleQuery();
            });
        }
    });
};

const handleDelete = (row) => {
    ElMessageBox.confirm(`是否确认删除参数编号为"${row.configId}"的数据项？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        return delConfig(row.configId);
    }).then(() => {
        handleQuery();
        ElMessage.success("删除成功");
    }).catch(() => { });
};

const handleExport = () => {
    // 实际项目中需实现导出逻辑
    console.log("导出逻辑");
};

const handleRefreshCache = () => {
    refreshCache().then(() => {
        ElMessage.success("刷新成功");
    });
};

const btnClick = (item, rows) => {
    switch (item.text) {
        case '新增':
            handleAdd();
            break;
        case '修改':
            handleUpdate(rows);
            break;
        case '删除':
            if (rows && rows.length > 0) {
                const ids = rows.map(r => r.configId);
                ElMessageBox.confirm(`是否确认删除参数编号为"${ids.join(',')}"的数据项？`, "警告", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(() => {
                    return delConfig(ids);
                }).then(() => {
                    handleQuery();
                    ElMessage.success("删除成功");
                }).catch(() => { });
            } else {
                ElMessage.warning("请选择要删除的数据");
            }
            break;
        case '导出':
            handleExport();
            break;
        case '刷新缓存':
            handleRefreshCache();
            break;
    }
};

// ========== 生命周期 ==========
onMounted(() => {
    systemDictType().then((res) => {
        // console.log(res, 'res-');
        sys_yes_no.value = res?.data || []
    })
    handleQuery();
});
</script>

<style scoped>
.dialog-btn-class {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.app-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>