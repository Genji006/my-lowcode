<template>
    <div class="my-date-picker-wrapper" :style="wrapperStyle">
        <span v-if="conf.props.label" class="picker-label">{{ conf.props.label }}</span>

        <el-date-picker v-model="modelValue" :type="conf.props.type" :placeholder="conf.props.placeholder"
            :start-placeholder="conf.props.startPlaceholder" :end-placeholder="conf.props.endPlaceholder"
            :value-format="conf.props.valueFormat" style="flex: 1; width: 100%; min-width: 0;" clearable
            @change="handleChange" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isPreview = inject('isPreview', false);

const props = defineProps({
    conf: Object,
    apiParams: Object,
});

const emit = defineEmits(['update-data']);
const modelValue = ref(null);

const wrapperStyle = computed(() => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
}));

const initData = async () => {
    const p = props.conf.props;
    if (p.dataType === 'static') {
        modelValue.value = p.defaultValue || null;
    } else if (p.dataType === 'script') {
        try {
            const customFunc = new Function('route', p.script);
            const scriptResult = customFunc(route);
            modelValue.value = scriptResult || null;
        } catch (error) {
            console.error(`[${p.label}] 脚本执行错误:`, error);
        }
    } else if (p.dataType === 'api') {
        // 调用接口逻辑...
    }

    // 有初始值时，触发一次抛出
    // if (modelValue.value) {
    handleChange(modelValue.value);
    // }
};

// === 核心修改：值改变时的联动拆解逻辑 ===
const handleChange = (val) => {
    console.log('日期选择器值改变:', val);
    const p = props.conf.props;
    const payload = {};

    // 判断是否是范围选择器
    if (p.type.includes('range')) {
        if (val && Array.isArray(val) && val.length === 2) {
            if (p.startFieldName) payload[p.startFieldName] = val[0];
            if (p.endFieldName) payload[p.endFieldName] = val[1];
        } else {
            // 清空时的处理
            if (p.startFieldName) payload[p.startFieldName] = '';
            if (p.endFieldName) payload[p.endFieldName] = '';
        }
    } else {
        // 单个时间选择器
        const fieldKey = props.conf.bindKey || p.fieldName;
        if (fieldKey) {
            payload[fieldKey] = val || '';
        }
    }

    emit('update-data', payload);
};
watch(() => props.conf.props.dataType, () => {
    if (!isPreview) initData();
});

onMounted(() => {
    initData();
});
</script>

<style scoped>
.my-date-picker-wrapper {
    /* 防止被极度压缩 */
    min-width: 180px;
}

.picker-label {
    margin-right: 8px;
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
    flex-shrink: 0;
}

/* 深度修改 Element Plus 内部样式，防止范围选择器在小宽度下溢出 */
:deep(.el-date-editor--daterange.el-input__wrapper),
:deep(.el-date-editor--monthrange.el-input__wrapper),
:deep(.el-date-editor--datetimerange.el-input__wrapper) {
    width: 100%;
}
</style>