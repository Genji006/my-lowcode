<template>
    <div class="app-layout">
        <div class="drawer-container left" :class="{ collapsed: !showLeft }">
            <div class="drawer-content">
                <Sidebar />
            </div>
        </div>

        <div class="center-panel">
            <div class="toolbar">
                <div class="tools-right">
                    <el-button type="success" plain size="small" icon="View" @click="handlePreview"
                        style="margin-right: 10px">
                        预览
                    </el-button>
                    <el-button type="primary" plain size="small" @click="handleSave">
                        <el-icon style="margin-right: 5px">
                            <Download />
                        </el-icon>
                        保存
                    </el-button>
                </div>
            </div>

            <div class="canvas-box" @click.self="handleClearSelect">
                <LayerPanel v-if="!isPreview" />
                <div class="root-screen" :style="screenStyle" id="root-screen" @dragover.prevent @drop="onDrop"
                    @click.self="handleClearSelect">
                    <EditorRenderItem v-for="item in store.components" :key="item.id" :conf="item" :isFlow="false" />
                </div>
            </div>

            <div class="floating-panel" :class="{ collapsed: !showRight }">
                <div class="toggle-btn right-toggle" @click="toggleRight">
                    <el-icon>
                        <component :is="showRight ? 'ArrowRight' : 'ArrowLeft'" />
                    </el-icon>
                </div>
                <div class="drawer-content">
                    <ConfigPanel />
                </div>
            </div>

            <PreviewDialog v-model="previewVisible" :componentList="store.components" />
        </div>
    </div>

    <SzycDialog :dialogVisible="save_show" :title="`${route.query.code ? '编辑' : '新增'}` + save_title" width="40%"
        @close="save_show = false">
        <template #uname>
            <submitPage v-model="save_formData" :items="save_formItems" :rules="save_formRules"
                @cancel="save_show = false" @submit="saveConfig" />
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h, provide, watch, reactive } from 'vue';
import { ArrowLeft, ArrowRight, Download, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDesignStore } from './demoStore';
import { createComponent } from './componentSchema';
import submitPage from '@/components/element/SubmitForm.vue';
// 引入图层面板
import LayerPanel from './components/LayerPanel.vue';

// 引入子组件
import Sidebar from './Sidebar.vue';
import ConfigPanel from './ConfigPanel.vue';
import PreviewDialog from './components/PreviewDialog.vue';
import CompWrapper from './components/CompWrapper.vue';

// 引入业务组件 (用于 EditorRenderItem 渲染)
import MyButton from './components/MyButton.vue';
import MyContainer from './components/MyContainer.vue';
import MyInput from './components/MyInput.vue';
import MyQueryForm from './components/MyQueryForm.vue';
import MySelect from './components/MySelect.vue';
import MyTable from './components/MyTable.vue';
import MyChart from './components/MyChart.vue';
import MyText from './components/MyText.vue';
import MyPieChart from './components/MyPieChart.vue';
import MyRadarChart from './components/MyRadarChart.vue';
import MyDatePicker from './components/MyDatePicker.vue';
import DashBoard from './components/DashBoard.vue';
import calCard from './components/calCard.vue';
import MyTree from './components/MyTree.vue';
import MyDynamicTitle from './components/MyDynamicTitle.vue';
import MySpChart from './components/mySpChart.vue';

import { useRoute } from 'vue-router';
import { listAppProjectApi } from "@/api/tool.js";
import { addPageApi, pageUpdate, pageDetailApi } from '@/api/settings/index';
const store = useDesignStore();
const showLeft = ref(true);
const showRight = ref(false);
const previewVisible = ref(false);
const save_show = ref(false);
const save_title = ref("页面");
const appList = ref([]);

const route = useRoute();

const save_formData = reactive({
    pageName: "",
    projectId: "",
    pageCode: "",
    kyf: "1",
});

const save_formItems = computed(() => [
    { label: "页面名称", prop: "pageName", component: "el-input", placeholder: "请输入页面名称" },
    {
        label: "所属应用", prop: "projectId", component: "el-select", placeholder: "请选择所属应用", options: appList.value, optionLabel: "label",
        optionValue: "value",
    },
    { label: "页面路径", prop: "pageCode", component: "el-input", placeholder: "请输入页面路径" },
]);

const save_formRules = reactive({
    pageName: [{ required: true, message: "请输入页面名称", trigger: "blur" }],
    projectId: [{ required: true, message: "请选择所属应用", trigger: "change" }],
    pageCode: [{ required: true, message: "请输入页面路径", trigger: "blur" }],
});

const saveConfig = () => {
    try {
        // 核心修改 1：平铺处理所有组件时，剥离 children，避免向后端发送无限嵌套的巨型 JSON
        const flattenComponents = (components, parentId = null) => {
            let result = [];
            components.forEach((component, index) => {
                // 深拷贝，防止修改 store 原数据
                let compClone = JSON.parse(JSON.stringify(component));
                // 记录父节点 ID
                compClone.parentId = parentId;
                // 记录排序索引
                compClone.sortIndex = index;
                // 提取 children 用于递归，然后将当前项的 children 置空
                const children = (compClone.props && compClone.props.children) ? compClone.props.children : [];
                if (compClone.props && compClone.props.children) {
                    compClone.props.children = [];
                }

                result.push(compClone);

                // 递归处理子组件
                if (children.length > 0) {
                    result = result.concat(flattenComponents(children, compClone.id));
                }
            });
            return result;
        };

        // 处理组件配置
        const processComponent = (component) => {
            const config = JSON.parse(JSON.stringify(component));
            const propsData = config.props || config.bind || {};
            console.log("config", config);
            const isChart = ['MyChart', 'MyPieChart', 'MyScatterChart', 'MyRadarChart'].includes(config.type);
            let compType = "";
            if (isChart) {
                compType = "CHART";
            } else if (config.type === 'MyTable') {
                compType = "TABLE";
            } else if (config.type === 'MyQueryForm') {
                compType = "searchform";
            } else {
                compType = config.type;
            }

            const baseConfig = {
                componentType: compType,
                extendAttr: JSON.stringify(config),
            };


            if (compType === 'CHART') {
                // 1. 处理数据源参数 (designDatasourceParam)
                // 兼容不同层级的数据源类型字段
                const dataType = propsData.dataType || (propsData.dataConfig && propsData.dataConfig.dsType);

                if (dataType && (dataType.toLowerCase() === 'sql' || dataType.toLowerCase() === 'api')) {
                    // 获取配置的语句或接口地址
                    let bashValue = propsData.sqlConf || propsData.apiConf;
                    if (!bashValue && propsData.dataConfig) {
                        bashValue = propsData.dataConfig.dsConfig;
                    }

                    baseConfig.designDatasourceParam = {
                        datasourceType: dataType.toUpperCase(), // 后端要求大写 (SQL/API)
                        datasourceConfig: JSON.stringify({ bash: bashValue || "" }),
                    };
                }

                // 2. 处理图表特有参数 (designChartConfigParam)
                // 根据您的组件类型推导 chartType
                let mappedChartType = "LINE";
                if (config.type === 'MyPieChart') mappedChartType = "PIE";
                else if (config.type === 'MyRadarChart') mappedChartType = "RADAR";
                else if (config.type === 'MyScatterChart') mappedChartType = "SCATTER";
                else mappedChartType = (propsData.chartType || config.chartType || "LINE").toUpperCase();

                // 获取图表的维度/指标映射列表 (兼容存放在顶层、props 或 dataConfig 中的情况)
                let chartConfigList = propsData.designChartConfigList || config.designChartConfigList || [];
                if (!chartConfigList.length && propsData.dataConfig && propsData.dataConfig.designChartConfigList) {
                    chartConfigList = propsData.dataConfig.designChartConfigList;
                }

                baseConfig.designChartConfigParam = {
                    chartType: mappedChartType, // 例如：LINE
                    chartTitle: propsData.title || config.title || config.name || "图表标题", // 提取标题
                    designChartConfigList: chartConfigList // 提取维度、指标数组
                };
            }

            // 特别处理MyTable的数据集配置
            if (compType == 'TABLE' && propsData.datasets && Array.isArray(propsData.datasets)) {
                let datasetConfig
                propsData.datasets.forEach(dataset => {
                    if (dataset.sql) {
                        datasetConfig = {
                            datasourceType: 'SQL',
                            datasourceConfig: JSON.stringify({
                                bash: dataset.sql
                            })
                        };
                    }
                });
                baseConfig.designDatasourceParam = datasetConfig
                baseConfig.tableConfigParam = {}
            }

            return baseConfig;
        };

        // 先平铺所有组件，再处理每个组件的配置
        const flattenedComponents = flattenComponents(store.components);
        const componentConfigList = flattenedComponents.map(processComponent);

        // 构建请求参数
        const requestParams = {
            ...save_formData,
            designComponentParamList: componentConfigList,
        };

        if (route.query.code) {
            requestParams.pageId = route.query.pageId;
            pageUpdate(requestParams).then((res) => {
                if (res.code === 200) {
                    save_show.value = false;
                    ElMessage.success("更新成功！");
                }
            });
        } else {
            addPageApi(requestParams).then((res) => {
                if (res.code === 200) {
                    save_show.value = false;
                    ElMessage.success("保存成功！");
                }
            });
        }
    } catch (error) {
        ElMessage.error("配置处理异常，请检查组件配置！");
        console.error(error);
    }
};

provide('isPreview', false);

// === 1. 画布配置 ===
const screenConfig = { width: 1920, height: 1080, scale: 0.8 };

const screenStyle = computed(() => ({
    width: screenConfig.width + 'px',
    height: screenConfig.height + 'px',
    transform: `scale(${screenConfig.scale})`,
    transformOrigin: 'top center',
    backgroundColor: '#ffffff',
    position: 'relative',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    marginTop: '20px' // 给顶部留点空隙
}));

// === 2. 递归渲染器 (EditorRenderItem) ===
const compMap = {
    'MyButton': MyButton,
    'MyContainer': MyContainer,
    'MyInput': MyInput,
    'MySelect': MySelect,
    'MyQueryForm': MyQueryForm,
    'MyTable': MyTable,
    'MyChart': MyChart,
    'MyText': MyText,
    'MyScatterChart': MyChart,
    'MyPieChart': MyPieChart,
    'MyRadarChart': MyRadarChart,
    'MyDatePicker': MyDatePicker,
    'DashBoard': DashBoard,
    'calCard': calCard,
    'MyTree': MyTree,
    'MyDynamicTitle': MyDynamicTitle,
    'MySpChart': MySpChart,
};

const EditorRenderItem = defineComponent({
    props: ['conf', 'isFlow'],
    setup(props) {
        return () => {
            const config = props.conf;
            const Component = compMap[config.type] || 'div';

            // 递归处理子节点
            let childrenVNodes = null;
            if (config.props.children && Array.isArray(config.props.children)) {
                childrenVNodes = config.props.children.map(child =>
                    h(EditorRenderItem, {
                        key: child.id,
                        conf: child,
                        isFlow: true // 容器内部强制流式
                    })
                );
            }

            // 创建业务组件
            const content = h(Component, {
                conf: config,
                propsData: config.props,
                style: { width: '100%', height: '100%' }
            }, {
                default: () => childrenVNodes // 插槽填入子节点
            });

            // 包裹 CompWrapper (提供拖拽/选中)
            return h(CompWrapper, {
                conf: config,
                isFlow: props.isFlow,
                isActive: store.activeId === config.id,
                onSetActive: () => store.setActive(config.id),
                onUpdateStyle: (style) => store.updateComponentStyle(config.id, style)
            }, {
                default: () => content
            });
        };
    }
});

// === 3. 拖拽放入逻辑 ===
const onDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType');
    if (type) {
        const newComp = createComponent(type);
        newComp.style.left = 0;
        newComp.style.top = 0;
        store.addComponent(newComp);
    }
};

const handleClearSelect = () => {
    store.setActive(null);
};

const handleSave = () => {
    save_show.value = true;
    if (route.query.pageId) {
        save_formData.pageName = route.query.pageName || "";
        save_formData.pageCode = route.query.code || "";
        save_formData.projectId = route.query.projectId || "";
        save_formData.pageStatus = route.query.pageStatus || "";
    } else {
        save_formData.pageName = "";
        save_formData.pageCode = "";
        save_formData.projectId = "";
        save_formData.pageStatus = "";
    }
}

const handlePreview = () => {
    previewVisible.value = true;
};

const toggleRight = () => {
    showRight.value = !showRight.value;
};

const appLicationOptionsFn = () => {
    let obj = {};
    listAppProjectApi(obj).then((res) => {
        appList.value = res.data.map((item) => {
            return {
                ...item,
                label: item.projectName,
                value: item.id,
            };
        });
    });
};

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
            // 还原数据源配置 (保留你原有的逻辑)
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

// 页面详情回显
const pageDetailShowFn = (arr) => {
    store.components = []; // 清空现有组件
    if (!arr || arr.length === 0) return;

    // 兼容以前旧版本的 PAGE 整体包裹数据
    const pageData = arr.find(item => item.componentType === 'PAGE');
    if (pageData) {
        try {
            const components = JSON.parse(pageData.extendAttr);
            if (Array.isArray(components)) {
                store.components = components;
                return;
            }
        } catch (error) {
            console.error('解析 PAGE 配置失败:', error);
        }
    }

    store.components = buildTree(arr);
    console.log(11111, store.components)
};

// 页面详情 API 调用
const pageDetailApiFn = (code) => {
    let obj = {
        pageCode: code,
    };
    pageDetailApi(obj).then((res) => {
        if (res.code == 200) {
            let arr = res.data?.designPageComponentResult || [];
            pageDetailShowFn(arr);
        }
    });
};

// 监听 activeId 变化，当选中组件时展开右侧面板
watch(
    () => store.activeId,
    (newId) => {
        if (newId) {
            showRight.value = true;  // 选中时展开
        } else {
            showRight.value = false; // 取消选中(点空白处)时收起
        }
    }
);

onMounted(() => {
    appLicationOptionsFn();

    if (route.query.code) {
        pageDetailApiFn(route.query.code);
    }
});
</script>

<style scoped>
.app-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    background-color: #f5f5f5;
    overflow: hidden;
}

/* 左侧栏 */
.drawer-container.left {
    width: 240px;
    background: #fff;
    border-right: 1px solid #ddd;
    transition: width 0.3s ease;
    flex-shrink: 0;
}

.drawer-container.left.collapsed {
    width: 0;
    border: none;
}

/* 中间主容器 */
.center-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    min-width: 0;
}

.toolbar {
    height: 50px;
    background: #fff;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    z-index: 10;
}

/* 画布容器 */
.canvas-box {
    flex: 1;
    background-color: #e0e0e0;
    position: relative;
    display: flex;
    justify-content: center;
    /* 居中显示画布 */
    padding: 20px;
    overflow: auto;
    /* 允许滚动 */
}

/* 实际的“屏幕” */
.root-screen {
    /* 样式由 computed screenStyle 控制 */
    user-select: none;
    flex-shrink: 0;
}

/* 右侧属性面板 */
.floating-panel {
    position: absolute;
    top: 50px;
    bottom: 0;
    right: 9px;
    width: 600px;
    /* 固定宽度 */
    background: #fff;
    border-left: 1px solid #e0e0e0;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 1002;
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: visible;
}

.floating-panel.collapsed {
    width: 0 !important;
    border-left: none;
}

.drawer-content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}

.toggle-btn {
    position: absolute;
    top: 50%;
    left: -19px;
    width: 18px;
    height: 60px;
    margin-top: -30px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-right: none;
    border-radius: 8px 0 0 8px;
    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 102;
    color: #909399;
}

.toggle-btn:hover {
    color: #409eff;
    background: #f9f9f9;
}
</style>