<!-- 组件图层面板,方便选取组件 -->
<template>
    <div class="layer-panel" :class="{ collapsed: isCollapsed }">
        <div class="panel-header">
            <span v-if="!isCollapsed">组件图层</span>
            <el-icon class="toggle-btn" @click="isCollapsed = !isCollapsed">
                <component :is="isCollapsed ? 'Expand' : 'Fold'" />
            </el-icon>
        </div>

        <div v-show="!isCollapsed" class="tree-content">
            <el-tree :data="treeData" :props="defaultProps" node-key="id" default-expand-all
                :expand-on-click-node="false" highlight-current @node-click="handleNodeClick"
                @node-contextmenu="handleContextMenu">
                <template #default="{ node, data }">
                    <div class="custom-tree-node" @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave">
                        <span class="node-label">{{ data.name || data.type }}</span>
                        <span class="node-id">#{{ data.id.slice(-4) }}</span>
                    </div>
                </template>
            </el-tree>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDesignStore } from '../demoStore';
import { Fold, Expand } from '@element-plus/icons-vue';

const store = useDesignStore();
const isCollapsed = ref(false);

const defaultProps = {
    children: 'children',
    label: 'name',
};

// 递归转换数据结构
const transformData = (list) => {
    return list.map(item => {
        const children = item.props?.children ? transformData(item.props.children) : [];
        return {
            ...item,
            children,
            name: item.props?.title || item.name || item.type
        };
    });
};

const treeData = computed(() => {
    return transformData(store.components);
});

// 1. 点击树节点 -> 选中组件
const handleNodeClick = (data) => {
    store.setActive(data.id);
};

// 2. 鼠标移入树节点 -> 高亮画布组件
const onMouseEnter = (data) => {
    store.setHoverComponent(data.id);
};

// 3. 鼠标移出 -> 取消高亮
const onMouseLeave = () => {
    store.setHoverComponent(null);
};

const handleContextMenu = (event, data) => {
    event.preventDefault();
};
</script>

<style scoped>
.layer-panel {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 200px;
    max-height: calc(100% - 20px);
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    transition: width 0.3s;
    overflow: hidden;
    border: 1px solid #ebeef5;
}

.layer-panel.collapsed {
    width: 40px;
    height: 40px;
    border-radius: 4px;
}

.panel-header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    font-weight: bold;
    font-size: 14px;
    color: #606266;
    flex-shrink: 0;
}

.toggle-btn {
    cursor: pointer;
    font-size: 16px;
}

.layer-panel.collapsed .toggle-btn {
    margin: 0 auto;
}

.tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 5px 0;
}

.custom-tree-node {
    display: flex;
    align-items: center;
    font-size: 12px;
    width: 100%;
    padding-right: 10px;
}

.node-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.node-id {
    color: #c0c4cc;
    font-size: 10px;
    margin-left: 5px;
}

:deep(.el-tree-node__content) {
    height: 28px;
}

/* 悬浮树节点时的样式 */
:deep(.el-tree-node__content:hover) {
    background-color: #f0f9eb;
    color: #67c23a;
}
</style>