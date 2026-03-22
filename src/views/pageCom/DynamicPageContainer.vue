<template>
    <div class="dynamic-page-container">
        <div v-if="loading" class="loading-box">
            <el-skeleton :rows="15" animated />
        </div>

        <pageRender v-else-if="pageSchema && pageSchema.length > 0" :schema="pageSchema" />

        <el-empty v-else description="页面配置不存在或已被删除" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { addPageApi, pageUpdate, pageDetailApi } from '@/api/settings/index';
import pageRender from './pageRender.vue';

const route = useRoute();
const loading = ref(true);

const pageSchema = ref([]);

/**
 * 核心方法 1：将扁平化的组件数据构建为树形结构
 */
const buildTree = (flatList) => {
    const tree = [];
    const map = {};

    // 第一次遍历：解析配置，组装基础映射表
    flatList.forEach(item => {
        try {
            if (!item.extendAttr) return; // 容错处理

            let config = JSON.parse(item.extendAttr);
            config.componentId = item.componentId || item.id;
            config.props = config.props || config.bind || {};
            config.props.children = [];

            // 还原数据源配置
            if (item.designDatasourceParam) {
                const { datasourceType, datasourceConfig } = item.designDatasourceParam;
                if (datasourceType === 'sql' || datasourceType === 'api') {
                    const bashConfig = JSON.parse(datasourceConfig)?.bash;
                    if (bashConfig) {
                        if (datasourceType === 'sql') {
                            config.props.sqlConf = bashConfig;
                        } else if (datasourceType === 'api') {
                            config.props.apiConf = bashConfig;
                        }
                        config.props.dataType = datasourceType;
                    }
                }
            }
            if (item.dsType) {
                config.props["dsConfig"] = JSON.parse(item?.dsConfig)?.bash;
                config.props["dsType"] = item.dsType;
            }

            // 确保组件都有 children 数组
            if (!config.props.children) {
                config.props.children = [];
            }

            map[config.id] = config;
        } catch (error) {
            console.error('解析组件配置失败:', error);
        }
    });

    // 第二次遍历：利用 parentId 将组件推入对应父级的 children 数组
    Object.values(map).forEach(config => {
        if (config.parentId && map[config.parentId]) {
            // 如果有父节点，塞进父节点里
            map[config.parentId].props.children.push(config);
        } else {
            // 如果没有父节点，说明是顶层组件，放入主树中
            tree.push(config);
        }
    });

    const sortTree = (nodes) => {
        // 根据保存的 sortIndex 升序排列，如果没有记录则默认排在最后
        nodes.sort((a, b) => {
            const indexA = a.sortIndex !== undefined ? a.sortIndex : 9999;
            const indexB = b.sortIndex !== undefined ? b.sortIndex : 9999;
            return indexA - indexB;
        });

        // 递归去排里面的子节点
        nodes.forEach(node => {
            if (node.props && node.props.children && node.props.children.length > 0) {
                sortTree(node.props.children);
            }
        });
    };

    sortTree(tree); // 执行排序

    return tree;
};

const pageDetailShowFn = (arr) => {
    pageSchema.value = []; // 清空现有组件
    if (!arr || arr.length === 0) return;

    // 兼容以前旧版本的 PAGE 整体包裹数据
    const pageData = arr.find(item => item.componentType === 'PAGE');
    if (pageData) {
        try {
            const components = JSON.parse(pageData.extendAttr);
            if (Array.isArray(components)) {
                pageSchema.value = components;
                return;
            }
        } catch (error) {
            console.error('解析 PAGE 配置失败:', error);
        }
    }

    // 最新版的扁平化树形结构解析
    pageSchema.value = buildTree(arr);
    console.log(1111, pageSchema.value);
};


const fetchPageData = async (code) => {
    loading.value = true;
    try {
        const res = await pageDetailApi({ pageCode: code });
        if (res.code === 200 || res.code === "200") {
            let arr = res.data?.designPageComponentResult || [];
            pageDetailShowFn(arr);
        } else {
            pageSchema.value = [];
        }
    } catch (error) {
        console.error("获取数据失败:", error);
        pageSchema.value = [];
    } finally {
        loading.value = false;
    }
};

watch(
    () => route.path, // 监听路径变化
    () => {
        const currentCode = route.path;
        if (currentCode) {
            fetchPageData(currentCode);
        } else {
            loading.value = false;
        }
    },
    { immediate: true } // 组件挂载时立即执行一次
);

</script>

<style scoped>
.dynamic-page-container {
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 100px);
    background-color: #f5f7fa;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
}

.loading-box {
    padding: 20px;
    background: #fff;
    margin: 20px;
    border-radius: 8px;
}
</style>