<template>
    <div class="my-select-wrapper" :style="wrapperStyle">
        <span v-if="conf.props.label" class="select-label">{{ conf.props.label }}</span>
        <el-select v-model="selectedValue" :placeholder="conf.props.placeholder" :clearable="conf.props.clearable"
            :filterable="conf.props.filterable" style="flex: 1" @change="handleChange">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 暂时模拟真实接口，防止您直接运行报错
const executeDatasetApi = async (data) => {
    console.log("下拉框发起真实请求，参数:", data);
    return { code: 200, data: { list: [{ label: '动态部门A', value: 'dept_A' }, { label: '动态部门B', value: 'dept_B' }] } };
}

// 注入预览状态
const isPreview = inject('isPreview', false);

const props = defineProps({
    conf: Object,      // 组件配置
    apiParams: Object, // 接收上游参数 (如果此下拉框依赖别的组件，比如省市级联)
});

// 定义事件，用于向上层汇报数据变化
const emit = defineEmits(['update-data']);

const selectedValue = ref('');
const options = ref([]);

// 样式
const wrapperStyle = computed(() => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
}));

// === 1. 获取数据逻辑 ===
const fetchData = async () => {
    // 获取配置中的 dataType (static / api / sql / script 等)
    const { dataType, options: staticOpts, mapping, script } = props.conf.props;

    // A. 静态数据
    if (dataType === 'static' || !dataType) {
        options.value = staticOpts || [];
        return;
    }

    // B. 动态数据 (拆分：脚本自定义 vs 接口调用)
    try {
        let rawList = [];

        // 【新增逻辑】：如果选择了 JS 脚本数据源
        if (dataType === 'script' && script) {
            const customFunc = new Function('route', 'apiParams', script);

            // 【修改点】：执行时传入真实的对象
            const scriptResult = await customFunc(route, props.apiParams);

            if (Array.isArray(scriptResult)) {
                rawList = scriptResult;
            } else {
                console.error(`[${props.conf.props.label}] 脚本返回值必须是数组格式!`, scriptResult);
                rawList = [];
            }
        }
        // 【原有逻辑】：如果是 api 或 sql 等接口调用数据源
        else {
            const formatQueryParams = (paramsObj) => {
                if (!paramsObj) return [];
                return Object.keys(paramsObj).map(key => ({
                    column: key,
                    value: paramsObj[key]
                }));
            };

            const requestPayload = {
                componentId: props.conf.componentId || props.conf.id,
                pageNum: 1,
                pageSize: 500,
                queryParams: formatQueryParams(props.apiParams)
            };

            const res = await executeDatasetApi(requestPayload);
            if (res && (res.code === 200 || res.code === "200")) {
                rawList = res.data?.list || res.data?.records || res.data || [];
            }
        }

        // C. 数据映射 (将获取到的 rawList 映射为标准 label 和 value)
        const labelKey = mapping?.label || 'label';
        const valueKey = mapping?.value || 'value';

        options.value = rawList.map(item => ({
            label: item[labelKey] !== undefined ? item[labelKey] : item.label,
            value: item[valueKey] !== undefined ? item[valueKey] : item.value,
            original: item
        }));

    } catch (e) {
        console.error('MySelect 加载动态数据/执行脚本失败', e);
        options.value = [];
    }
};

// === 2. 核心联动逻辑 ===
const handleChange = (val) => {
    const payload = { value: val };

    const fieldKey = props.conf.props.fieldName;
    if (fieldKey) {
        payload[fieldKey] = val;
    }

    emit('update-data', payload);
};

// 监听配置变化 (设计器模式下，修改脚本能实时预览)
watch(() => props.conf.props, () => {
    if (!isPreview) fetchData();
}, { deep: true });

// 监听上游依赖参数变化
watch(() => props.apiParams, () => {
    if (props.conf.props.dataType !== 'static') {
        selectedValue.value = '';
        fetchData();
    }
}, { deep: true });

// === 3. 默认选中第一项逻辑 ===
watch(
    () => options.value,
    (newOpts) => {
        if (
            props.conf.props.defaultFirstOption &&
            newOpts && newOpts.length > 0 &&
            (!selectedValue.value)
        ) {
            selectedValue.value = newOpts[0].value;
            handleChange(selectedValue.value);
        }
    },
    { immediate: true, deep: true }
);

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.my-select-wrapper {
    min-width: 100px;
}

.select-label {
    margin-right: 8px;
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
}
</style>