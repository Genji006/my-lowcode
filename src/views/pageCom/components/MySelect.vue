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
import { mockApi } from '@/api/mock';

// 注入预览状态
const isPreview = inject('isPreview', false);

const props = defineProps({
    conf: Object,      // 组件配置
    apiParams: Object, // 接收上游参数 (如果此下拉框也依赖别的组件)
});

// 定义事件，用于向上层汇报数据变化
const emit = defineEmits(['updateData']);

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
    const { dataType, options: staticOpts, apiConf, sqlConf, mapping } = props.conf.props;

    // A. 静态数据
    if (dataType === 'static') {
        options.value = staticOpts || [];
        return;
    }

    // B. 动态数据 (API/SQL)
    try {
        let rawList = [];

        if (dataType === 'api') {
            // 这里演示调用 Mock 接口
            const res = await mockApi.getUsers();
            rawList = res.data;
        }
        else if (dataType === 'sql') {
            const res = await mockApi.parseSql({ sql: sqlConf.sql });
            rawList = res.data;
        }

        // C. 数据映射
        const labelKey = mapping?.label || 'label';
        const valueKey = mapping?.value || 'value';

        options.value = rawList.map(item => ({
            label: item[labelKey],
            value: item[valueKey],
            original: item
        }));

    } catch (e) {
        console.error('MySelect 加载数据失败', e);
        options.value = [];
    }
};

// === 2. 核心联动逻辑 ===
const handleChange = (val) => {
    // A. 构造要抛出的数据包
    // 如果配置了 bindKey (如 deptId)，则以此为 Key
    // 否则默认以组件 ID 为 Key (PageRender 会自动处理 ID)

    // 关键点：我们抛出一个对象，包含 value
    // 这样 pageRender 在解析依赖时，会把这个 value 自动传给下游
    const payload = {
        value: val,
        // 如果需要，也可以把 label 或整行数据带上
        // row: options.value.find(o => o.value === val)?.original 
    };

    // 如果配置了自定义 bindKey，我们也把它放进去，方便下游用 key 获取
    if (props.conf.bindKey) {
        payload[props.conf.bindKey] = val;
    }

    // B. 发送数据更新事件
    emit('update-data', payload);
};

const initValue = () => {
    selectedValue.value = '';
    handleChange(selectedValue.value);
};

// 监听配置变化
watch(() => props.conf.props, () => {
    if (!isPreview) fetchData();
}, { deep: true });

onMounted(() => {
    fetchData();
    initValue();
});
</script>

<style scoped>
.select-label {
    margin-right: 8px;
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
}
</style>