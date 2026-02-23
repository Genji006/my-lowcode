<template>
    <div class="app-layout">
        <div class="drawer-container left" :class="{ collapsed: !showLeft }">
            <div class="drawer-content">
                <Sidebar />
            </div>
        </div>

        <div class="center-panel">
            <div class="toolbar">
                <div class="tools-left">
                    <el-button link type="danger" @click="clearCache">清空缓存</el-button>
                </div>
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
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h, provide } from 'vue';
import { ArrowLeft, ArrowRight, Download, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDesignStore } from './demoStore';
import { createComponent } from './componentSchema'; // 你的组件创建工具

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

const store = useDesignStore();
const showLeft = ref(true);
const showRight = ref(false);
const previewVisible = ref(false);

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
    'MyForm': MyContainer,
    'MyInput': MyInput,
    'MySelect': MySelect,
    'MyQueryForm': MyQueryForm,
    'MyTable': MyTable,
    'MyChart': MyChart,
    'MyText': MyText
};

const EditorRenderItem = defineComponent({
    props: ['conf', 'isFlow'],
    setup(props) {
        return () => {
            const config = props.conf;
            const isFlow = props.isFlow;
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
        // 简单的默认位置计算，这里简化为左上角
        store.addComponent(newComp);
    }
};

const handleClearSelect = () => {
    store.setActive(null);
};

// === 4. 保存与加载逻辑 (LocalStorage) ===
const STORAGE_KEY = 'draft_schema_v1';

const handleSave = () => {
    try {
        const jsonStr = store.getJsonString();
        localStorage.setItem(STORAGE_KEY, jsonStr);
        ElMessage.success('已保存到浏览器缓存');
    } catch (err) {
        ElMessage.error('保存失败: ' + err.message);
    }
};

const loadFromCache = () => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
                store.components = parsed; // 恢复数据到 Store
                ElMessage.success('已恢复上次编辑的内容');
            }
        } catch (e) {
            console.error('缓存解析失败', e);
        }
    }
};

const clearCache = () => {
    ElMessageBox.confirm('确定清空缓存并重置画布吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        localStorage.removeItem(STORAGE_KEY);
        store.components = []; // 清空 Store
        ElMessage.success('缓存已清空');
    });
}

const handlePreview = () => {
    previewVisible.value = true;
};

const toggleRight = () => {
    showRight.value = !showRight.value;
};

// === 5. 生命周期 ===
onMounted(() => {
    loadFromCache(); // 页面加载时自动读取缓存
});
</script>

<style scoped>
.app-layout {
    display: flex;
    height: 98vh;
    width: 98vw;
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
    right: 0;
    width: 500px;
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
    left: -18px;
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