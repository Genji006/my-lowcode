<template>
    <div class="filter-node">

        <div v-if="isGroupMode" class="group-container" :class="{ 'is-negated': isNegated }">
            <div class="group-header">
                <div class="header-left">
                    <el-icon class="collapse-icon" :class="{ 'is-collapsed': collapsed }"
                        @click="collapsed = !collapsed">
                        <ArrowDown />
                    </el-icon>

                    <template v-if="index > 0">
                        <span class="label-text">逻辑:</span>
                        <el-select v-model="modelValue.operator" size="small" class="logic-select">
                            <el-option v-for="item in operatorOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </template>

                    <div class="negated-wrapper">
                        <el-checkbox :model-value="Boolean(modelValue.negated)"
                            @update:model-value="(val) => modelValue.negated = val" label="取反 (NOT)" />
                        <el-tag v-if="modelValue.negated" type="danger" effect="dark" size="small"
                            class="not-badge">NOT</el-tag>
                    </div>
                </div>

                <div class="header-right">
                    <el-button type="primary" plain size="small" icon="Plus" @click="addCondition" class="header-btn">
                        添加条件
                    </el-button>
                    <el-button type="primary" plain size="small" icon="FolderAdd" @click="addGroup" class="header-btn">
                        添加子组
                    </el-button>
                    <el-button v-if="index !== -1" type="danger" plain size="small" icon="Delete"
                        @click="$emit('remove')" class="header-btn">
                        删除本组
                    </el-button>
                </div>
            </div>

            <el-collapse-transition>
                <div v-show="!collapsed" class="group-body">
                    <div v-if="(!modelValue.conditions || modelValue.conditions.length === 0)" class="empty-state">
                        <el-icon>
                            <InfoFilled />
                        </el-icon> 暂无条件，请点击右上角按钮添加
                    </div>

                    <TransitionGroup name="list">
                        <div v-for="(child, idx) in modelValue.conditions" :key="child._id" class="tree-node-wrapper"
                            :class="isChildGroup(child) ? 'node-type-group' : 'node-type-condition'">
                            <div class="tree-line-vertical"></div>
                            <div class="tree-line-horizontal"></div>

                            <FilterBuilder v-model="modelValue.conditions[idx]" :index="idx"
                                :field-options="fieldOptions" @remove="removeChild(idx)" />
                        </div>
                    </TransitionGroup>
                </div>
            </el-collapse-transition>
        </div>

        <div v-else class="condition-item" :class="{ 'is-negated': isNegated }">
            <div class="condition-content">

                <div class="inline-logic" v-if="index > 0">
                    <el-select v-model="modelValue.operator" size="small" style="width: 75px">
                        <el-option v-for="item in operatorOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </div>

                <el-tooltip content="取反此条件 (NOT)" placement="top" :show-after="800">
                    <div class="condition-negated-btn" :class="{ active: Boolean(modelValue.negated) }"
                        @click="modelValue.negated = !modelValue.negated">
                        !
                    </div>
                </el-tooltip>

                <el-select v-model="modelValue.left_valuename" placeholder="左侧字段" size="small" class="select-field"
                    filterable clearable>
                    <el-option v-for="item in fieldOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <el-select v-model="modelValue.func" size="small" class="select-operator">
                    <el-option v-for="item in funcOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <el-select v-if="!isNullFunc" v-model="modelValue.right_valuename" placeholder="对比字段" size="small"
                    class="select-field" filterable clearable>
                    <el-option v-for="item in fieldOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <el-input v-if="!isNullFunc && !modelValue.right_valuename" :model-value="displayExactValue" readonly
                    placeholder="设置固定值" size="small" class="input-value-trigger" @click="openValueDialog">
                    <template #suffix>
                        <el-icon class="trigger-icon">
                            <EditPen />
                        </el-icon>
                    </template>
                </el-input>

                <el-button type="danger" plain size="small" icon="Close" class="btn-remove-condition"
                    @click="$emit('remove')">
                    删除
                </el-button>
            </div>
        </div>

        <el-dialog v-model="dialogVisible" title="输入一个值" width="500px" append-to-body class="kettle-value-dialog"
            draggable>
            <el-form :model="tempExact" label-width="80px">
                <el-form-item label="类型">
                    <el-select v-model="tempExact.type" style="width: 100%;" @change="getMaskMeta">
                        <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.name" />
                    </el-select>
                </el-form-item>
                <el-form-item label="值">
                    <el-input v-model="tempExact.text" />
                </el-form-item>
                <el-form-item label="转换格式">
                    <el-select v-model="tempExact.mask" style="width: 100%;">
                        <el-option v-for="item in maskList" :key="item.id" :label="item.name" :value="item.name" />
                    </el-select>
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="长度"><el-input-number v-model="tempExact.length" :min="-1"
                                style="width: 100%;" controls-position="right" /></el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="精度"><el-input-number v-model="tempExact.precision" :min="-1"
                                style="width: 100%;" controls-position="right" /></el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="testValue">测试</el-button>
                    <el-button type="primary" @click="confirmValueDialog">确定</el-button>
                </div>
            </template>
        </el-dialog>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, FolderAdd, Delete, Close, ArrowDown, InfoFilled, EditPen } from '@element-plus/icons-vue';
import { valueMeta, valueFormat, testString } from "@/api/kettleApi/index";

defineOptions({ name: 'FilterBuilder' });

const typeList = ref([]);
const maskList = ref([]);

const props = defineProps({
    modelValue: Object,
    index: { type: Number, default: -1 }, // -1 表示最顶层
    fieldOptions: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:modelValue', 'remove']);

const collapsed = ref(false);
const dialogVisible = ref(false);
const tempExact = ref({});
const funcOptions = [
    { label: '=', value: 0 },
    { label: '<>', value: 1 },
    { label: '<', value: 2 },
    { label: '<=', value: 3 },
    { label: '>', value: 4 },
    { label: '>=', value: 5 },
    { label: 'REGEX', value: 6 },
    { label: 'IS NULL', value: 7 },
    { label: 'IS NOT NULL', value: 8 },
    { label: 'IN LIST', value: 9 },
    { label: 'CONTAINS', value: 10 },
    { label: 'STARTS WITH', value: 11 },
    { label: 'ENDS WITH', value: 12 },
    { label: 'LIKE', value: 13 },
    { label: 'TRUE', value: 14 },
];

const operatorOptions = [
    { label: '-', value: 0 },
    { label: 'OR', value: 1 },
    { label: 'AND', value: 2 },
    { label: 'NOT', value: 3 },
    { label: 'OR NOT', value: 4 },
    { label: 'AND NOT', value: 5 },
    { label: 'XOR', value: 6 },

];

// --- 生成唯一ID (修复动画关键) ---
const uuid = () => '_' + Math.random().toString(36).substr(2, 9);

// --- 核心状态计算 ---
const isGroupMode = computed(() => {
    return (
        props.index === -1 || // 根节点强制为组
        (props.modelValue.conditions && props.modelValue.conditions.length > 0) ||
        props.modelValue._uiType === 'group'
    );
});

const isNegated = computed(() => Boolean(props.modelValue.negated));
const isNullFunc = computed(() => [7, 8].includes(props.modelValue.func)); // 7=IS NULL, 8=IS NOT NULL

// 辅助判断子节点类型（用于连线样式）
const isChildGroup = (child) => {
    return (child.conditions && child.conditions.length > 0) || child._uiType === 'group';
};

onMounted(() => {
    // 1. 补全自身 ID
    if (!props.modelValue._id) {
        props.modelValue._id = uuid();
    }

    // 2. 如果是根节点且没有 conditions，补全为空数组，确保能渲染出空组容器
    if (props.index === -1 && !props.modelValue.conditions) {
        props.modelValue.conditions = [];
    }

    // 3. 补全子节点 ID
    if (props.modelValue.conditions) {
        props.modelValue.conditions.forEach(item => {
            if (!item._id) item._id = uuid();
        });
    }
    console.log('props.modelValue',props.modelValue);
});

// --- 数据初始化工厂 ---
const createCondition = () => ({
    _id: uuid(),
    negated: false, operator: 2, conditions: [],
    left_valuename: '', func: 0, right_valuename: null, right_exact: null
});
const createGroup = () => ({
    _id: uuid(),
    _uiType: 'group', negated: false, operator: 2, conditions: [],
    left_valuename: null, func: 0, right_valuename: null, right_exact: null
});

// --- 操作方法 ---
const addCondition = () => {
    if (!props.modelValue.conditions) props.modelValue.conditions = [];
    props.modelValue.conditions.push(createCondition());
    collapsed.value = false;
};
const addGroup = () => {
    if (!props.modelValue.conditions) props.modelValue.conditions = [];
    props.modelValue.conditions.push(createGroup());
    collapsed.value = false;
};
const removeChild = (idx) => {
    props.modelValue.conditions.splice(idx, 1);
};

// --- Dialog 逻辑 ---
const openValueDialog = () => {
    if (!props.modelValue.right_exact) {
        props.modelValue.right_exact = { name: '', type: '', text: '', mask: '', length: -1, precision: -1 };
    }
    tempExact.value = JSON.parse(JSON.stringify(props.modelValue.right_exact));
    dialogVisible.value = true;
    getValueMeta()
    // 如果类型有值，则调用getMaskMeta方法
    if (tempExact.value.type) {
        getMaskMeta();
    }
};
const confirmValueDialog = async () => {
    let res = await testValue();

    if (!res) {
        // ElMessage.error("测试不通过")
        return;
    } else {
        props.modelValue.right_exact = JSON.parse(JSON.stringify(tempExact.value));
        dialogVisible.value = false;
        ElMessage.success("测试通过")
    }

};

const testValue = async () => {
    let res = await testString(tempExact.value)
    if (res.code == 500) {
        return false;
    } else {
        return true;
    }

}
const displayExactValue = computed(() => {
    const v = props.modelValue.right_exact;
    if (!v) return '';
    return `[${v.type}] ${v.text}`;
});

const getValueMeta = async () => {
    try {
        let res = await valueMeta({});
        typeList.value = res.map(item => ({
            id: item.id.toString(),
            name: item.name
        }))
    } catch {
        ElMessage.error("获取类型失败")
    }
}

const getMaskMeta = async () => {
    try {
        let res = await valueFormat({ valueType: tempExact.value.type });
        maskList.value = res.map(item => ({
            id: item.id.toString(),
            name: item.name
        }))
    } catch {
        ElMessage.error("获取转换格式失败")
    }
}
</script>

<style scoped>
/* =========== 容器 =========== */
.filter-node {
    width: 100%;
}

.group-container {
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    margin-bottom: 10px;
    overflow: hidden;
}

.group-container.is-negated {
    border-color: #fca5a5;
    background-color: #fff1f2;
}

/* =========== 头部 =========== */
.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ebeef5;
    height: 38px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 箭头动画 */
.collapse-icon {
    cursor: pointer;
    color: #909399;
    font-size: 14px;
    transition: transform 0.3s;
    padding: 4px;
    border-radius: 4px;
}

.collapse-icon:hover {
    background-color: #e9e9eb;
}

.collapse-icon.is-collapsed {
    transform: rotate(-90deg);
}

.label-text {
    font-size: 14px;
    font-weight: bold;
    color: #606266;
}

.logic-select {
    width: 110px;
}

.negated-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    border-left: 1px solid #dcdfe6;
    padding-left: 10px;
    height: 20px;
}

.not-badge {
    font-weight: bold;
    letter-spacing: 1px;
}

/* =========== 内容区 =========== */
.group-body {
    padding: 12px 12px 12px 30px;
    position: relative;
    background-color: inherit;
}

.group-body::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 16px;
    left: 15px;
    width: 1px;
    background-color: #dcdfe6;
}

.tree-node-wrapper {
    position: relative;
    margin-bottom: 8px;
    width: 100%;
}

.tree-line-horizontal {
    position: absolute;
    left: -15px;
    width: 15px;
    height: 1px;
    background-color: #dcdfe6;
}

.node-type-condition .tree-line-horizontal {
    top: 12px;
}

.node-type-group .tree-line-horizontal {
    top: 19px;
}

.empty-state {
    color: #909399;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
}

/* =========== Condition =========== */
.condition-item {
    height: 24px;
}

.condition-content {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 6px;
}

.inline-logic {
    margin-right: 4px;
    margin-top: -4px;
}

/* ! 取反按钮 */
.condition-negated-btn {
    width: 20px;
    min-width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    color: #909399;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    background: #fff;
}

.condition-negated-btn.active {
    background-color: #f56c6c;
    color: white;
    border-color: #f56c6c;
}

/* 控件宽度 */
.select-field {
    width: 150px;
    flex-shrink: 0;
}

.select-operator {
    width: 90px;
    flex-shrink: 0;
}

.input-value-trigger {
    flex: 1;
    min-width: 140px;
}

.input-value-trigger :deep(.el-input__wrapper) {
    cursor: pointer;
    background-color: #fbfbfb;
}

.trigger-icon {
    color: #409eff;
}

/* =========== 动画 =========== */
.list-move {
    transition: transform 0.3s ease-in-out;
}

.list-enter-active {
    transition: all 0.2s ease-out;
}

.list-enter-from {
    opacity: 0;
    transform: translateY(-5px);
}

.list-leave-active {
    transition: all 0.2s ease-in;
    position: absolute;
    width: 100%;
    z-index: 0;
}

.list-leave-to {
    opacity: 0;
    transform: scale(0.98);
}

.kettle-value-dialog .el-form-item {
    margin-bottom: 12px;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 8px;
    align-items: center;
    padding-bottom: 20px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-remove-condition {
    margin-left: 4px;
    padding: 0 8px;
    height: 24px;
}
</style>