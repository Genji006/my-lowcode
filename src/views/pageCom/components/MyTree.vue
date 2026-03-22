<template>
    <div class="my-tree-wrapper" :style="wrapperStyle">
        <div class="tree-header" v-if="conf.props.title">{{ conf.props.title }}</div>

        <div class="tree-search" v-if="conf.props.showSearch !== false">
            <el-input v-model="searchText" :placeholder="conf.props.searchPlaceholder || '请输入要搜索的条件'" clearable>
                <template #prefix>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
            </el-input>
        </div>

        <div class="tree-body" v-loading="loading">
            <el-scrollbar :height="dynamicBodyHeight">
                <el-tree ref="treeRef" :data="treeData" :show-checkbox="conf.props.showCheckbox !== false"
                    :node-key="nodeKey" :props="treeProps" :default-expand-all="conf.props.defaultExpandAll !== false"
                    :filter-node-method="filterNode" @check="handleCheck" @node-click="handleNodeClick" />
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, inject, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { queryDepartIndex } from '@/api/settings';

const props = defineProps({
    conf: { type: Object, default: () => ({ props: {} }) },
    apiParams: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update-data']);
const isPreview = inject('isPreview', true);
const route = useRoute();

const treeRef = ref(null);
const loading = ref(false);
const treeData = ref([]);
const searchText = ref('');

// === 1. 样式与配置映射 ===
const wrapperStyle = computed(() => ({
    backgroundColor: '#fff',
    padding: '12px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    // 如果外层（如 CompWrapper）已经处理了宽高 100%，这里其实只需要提供视觉样式即可
    height: '100%',
    width: '100%'
}));

const dynamicBodyHeight = computed(() => {
    let offset = 0;

    // 如果配置了标题，减去标题的高度 + 下边距 (大约 30px)
    if (props.conf.props.title) {
        offset += 60;
    }

    // 如果配置了搜索框，减去搜索框的高度 + 下边距 (大约 45px)
    if (props.conf.props.showSearch !== false) {
        offset += 65;
    }

    // 这里的 100% 就是指代您在配置面板里设置的组件总高度 (比如 66%)
    // 减去顶部占用的像素后，就是滚动条一分不差的精确高度！
    return `calc(100% - ${offset}px)`;
});

// 动态映射后端字段名 (兼容您的 ksName, childlist 等)
const nodeKey = computed(() => props.conf.props.nodeKey || 'id');
const treeProps = computed(() => ({
    label: props.conf.props.labelKey || 'label',
    children: props.conf.props.childrenKey || 'children',
    disabled: props.conf.props.disabledKey || 'disabled'
}));

// === 2. 核心：获取树形数据 ===
const loadData = async () => {
    loading.value = true;
    try {
        const p = props.conf.props;

        if (!isPreview) {
            // [编辑模式]：造假数据演示
            const label = p.labelKey || 'label';
            const child = p.childrenKey || 'children';
            treeData.value = [
                {
                    [nodeKey.value]: '1', [label]: '内科系统', [child]: [
                        { [nodeKey.value]: '1-1', [label]: '心血管内科' },
                        { [nodeKey.value]: '1-2', [label]: '神经内科' }
                    ]
                },
                {
                    [nodeKey.value]: '2', [label]: '外科系统', [child]: [
                        { [nodeKey.value]: '2-1', [label]: '骨科' }
                    ]
                }
            ];
            return;
        }

        // [运行模式]：调接口拿真实树数据
        const requestPayload = {
            ...props.apiParams,
            statisticalPeriod: "0",
            indexDefinitionUuid: route.query.indexUuid,
            productUuid: sessionStorage.getItem("menuCode") || "",
        };


        const res = await queryDepartIndex({ ...requestPayload });
        if (res && res.code === 200) {
            treeData.value = res.data;
        }

    } catch (error) {
        console.error('树形组件加载失败:', error);
    } finally {
        loading.value = false;
        if (isPreview) {
            setTimeout(() => {
                handleCheck();
            }, 50);
        }
    }
};

// === 3. 搜索过滤逻辑 ===
watch(searchText, (val) => {
    treeRef.value?.filter(val);
});

const filterNode = (value, data) => {
    if (!value) return true;
    // 按照动态配置的 labelKey 去过滤
    const labelVal = data[treeProps.value.label];
    return labelVal && labelVal.toString().indexOf(value) !== -1;
};

// === 4. 联动派发事件 ===
// 多选框点击时触发
const handleCheck = () => {
    if (!treeRef.value) return;
    // 获取所有勾选的节点对象 (根据业务需要，可以选择只传 key，或者传整个对象)
    const checkedNodes = treeRef.value.getCheckedNodes();
    const checkedKeys = treeRef.value.getCheckedKeys();

    emit('update-data', {
        departmentCode: checkedKeys.map(key => `'${key}'`).join(',')
    });
};

// 单击节点文字时触发 (如果没开启复选框，通常用这个触发联动)
const handleNodeClick = (data) => {
    // if (props.conf.props.showCheckbox !== false) return; // 开启多选时，单击文字不触发抛出
    // emit('update-data', { ...data, value: data[nodeKey.value] });
};

// === 5. 监听器 ===
watch(() => props.conf.props, () => {
    if (!isPreview) loadData();
}, { deep: true });

watch(() => props.apiParams, () => {
    if (isPreview) loadData();
}, { deep: true });

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.my-tree-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

.tree-header {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
    flex-shrink: 0;
}

.tree-search {
    margin-bottom: 12px;
    flex-shrink: 0;
}

.tree-body {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    position: relative;
}

/* 美化 element-plus 原生树的样式，让它更适合大屏/后台 */
:deep(.el-tree-node__content) {
    height: 32px;
    border-radius: 4px;
}

:deep(.el-tree-node__content:hover) {
    background-color: #f5f7fa;
}

:deep(.el-tree-node:focus > .el-tree-node__content) {
    background-color: transparent;
}
</style>