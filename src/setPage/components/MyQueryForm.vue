<template>
    <div class="query-form-container">
        <el-form :inline="propsData.inline" :model="formData" class="flex-form">

            <template v-if="propsData.slot">
                <RuntimeSlot :code="propsData.slot"
                    :params="{ model: formData, onSearch: handleSearch, onReset: handleReset }" />
            </template>

            <template v-else>
                <el-form-item v-for="(item, index) in propsData.items" :key="index" :label="item.label">
                    <el-radio-group v-if="item.type === 'radio-group'" v-model="formData[item.fieldName]">
                        <el-radio v-for="opt in item.options" :key="opt.value" :label="opt.value">
                            {{ opt.label }}
                        </el-radio>
                    </el-radio-group>

                    <el-date-picker v-if="item.type === 'date'" v-model="formData[item.fieldName]"
                        :type="item.dateType || 'date'" :placeholder="item.placeholder" value-format="YYYY-MM-DD"
                        style="width: 180px" />

                    <el-select v-if="item.type === 'select'" v-model="formData[item.fieldName]"
                        :placeholder="item.placeholder" style="width: 180px">
                        <el-option v-for="opt in item.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>

                    <el-input v-if="item.type === 'input'" v-model="formData[item.fieldName]"
                        :placeholder="item.placeholder" style="width: 180px" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
                    <el-button icon="Refresh" @click="handleReset">重置</el-button>
                </el-form-item>
            </template>
        </el-form>
    </div>
</template>

<script setup>
import { inject, reactive, watch, onMounted } from 'vue';
import RuntimeSlot from './RuntimeSlot.vue';
import { ElMessage } from 'element-plus';

const props = defineProps(['propsData', 'conf']);
const emit = defineEmits(['update-data']);

// 响应式表单数据
const formData = reactive({});

// 初始化数据：把 props 中的默认值同步到 formData
const initData = () => {
    // 清空当前对象 (保留引用)
    for (const key in formData) delete formData[key];
    // 获取当前 items 定义的所有有效字段名 (白名单)
    const validKeys = props.propsData.items.map(item => item.fieldName).filter(k => k);

    // 只保留 items 里存在的 key，忽略 model 里多余的脏数据
    validKeys.forEach(key => {
        // 优先取 model 里的值 (如果存在且不为空)
        const modelValue = props.propsData.model ? props.propsData.model[key] : undefined;

        // 如果 model 里有值，就用 model 的；否则给默认空值
        formData[key] = (modelValue !== undefined) ? modelValue : '';
    });
};


onMounted(() => {
    initData();
    handleSearch();
});

const handleSearch = () => {
    const payload = {
        formData: JSON.parse(JSON.stringify(formData)), // 表单数据
        timestamp: Date.now(),                          // 时间戳
    };
    // === 修改点 2: 发射 submit 事件 ===
    // 这会将数据发送给 PageRender，PageRender 会将其存入 globalDataStore
    if (props.propsData.triggerMode === 'search') {
        emit('update-data', payload);
    }
};

const handleReset = () => {
    initData(); // 恢复默认值
    const payload = {
        formData: JSON.parse(JSON.stringify(formData)), // 表单数据
        timestamp: Date.now(),                          // 时间戳
    };
    // 重置后通常也需要立即触发一次查询
    if (props.propsData.triggerMode === 'search') {
        emit('update-data', payload);
    }
};
</script>

<style scoped>
.query-form-container {
    padding: 10px;
    background: #fff;
    /* height: 100%; */
    overflow: hidden;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

.flex-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
}

.flex-form :deep(.el-form-item) {
    display: flex;
    align-items: center;
    margin-bottom: 0;
    margin-right: 18px;
}

.flex-form {
    gap: 10px 0;
}
</style>