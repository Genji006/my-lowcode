<template>
    <div class="sidebar-container">
        <div class="sidebar-header">组件库</div>

        <div class="sidebar-scroll">
            <el-collapse v-model="activeNames">
                <el-collapse-item v-for="group in componentGroups" :key="group.name" :title="group.title"
                    :name="group.name">
                    <div class="component-list">
                        <div v-for="comp in group.items" :key="comp.type" class="component-item" :class="comp.className"
                            draggable="true" @dragstart="(e) => onDragStart(e, comp.type)">
                            <span>{{ comp.label }}</span>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// 默认展开所有分组
const activeNames = ref([]);

// 定义组件分组数据
const componentGroups = [
    {
        title: '布局组件',
        name: 'layout',
        items: [
            { type: 'MyContainer', label: '布局容器', className: 'item-layout' },
            // { type: 'MyForm', label: '表单容器' } // 暂未启用
        ]
    },
    {
        title: '表单组件',
        name: 'form',
        items: [
            { type: 'MyInput', label: '输入框' },
            { type: 'MySelect', label: '下拉框' },
            { type: 'MyButton', label: '按钮' },
            { type: 'MyDatePicker', label: '日期时间选择器' },
        ]
    },
    {
        title: '表格组件',
        name: 'display',
        items: [
            { type: 'MyTable', label: '表格' },
            // { type: 'MyText', label: '文本' }
        ]
    },
    {
        title: '模板组件',
        name: 'template',
        items: [
            { type: 'MyQueryForm', label: '查询表单' },
            { type: 'DashBoard', label: '指标卡片' },
            { type: 'calCard', label: '计算规则卡片' },
            { type: 'MyTree', label: '科室树状图' },
            { type: 'MyDynamicTitle', label: '动态标题' },
            { type: 'MySpChart', label: '指标图表' },
        ]
    },
    {
        title: '图表组件',
        name: 'chart',
        items: [
            { type: 'MyChart', label: '柱形图/折线图' },
            // { type: 'MyPieChart', label: '饼图' },
            // { type: 'MyScatterChart', label: '散点图' },
            // { type: 'MyRadarChart', label: '雷达图' },
        ]
    }
];

const onDragStart = (e, type) => {
    e.dataTransfer.setData('componentType', type);
};
</script>

<style scoped>
.sidebar-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-right: 1px solid #e0e0e0;
}

.sidebar-header {
    padding: 15px 20px;
    font-weight: 600;
    font-size: 16px;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
}

.sidebar-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    /* el-collapse 自带边框，这里去掉 padding */
}

/* 覆盖 el-collapse 的默认样式，使其更贴合侧边栏风格 */
:deep(.el-collapse) {
    border-top: none;
    border-bottom: none;
}

:deep(.el-collapse-item__header) {
    padding-left: 20px;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #ebeef5;
}

:deep(.el-collapse-item__content) {
    padding: 10px 15px;
    /* 组件列表的内边距 */
    padding-bottom: 5px;
}

/* 组件项样式 */
.component-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* 两列布局，更紧凑 */
    gap: 10px;
}

.component-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    font-size: 12px;
    color: #606266;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: grab;
    transition: all 0.2s;
    user-select: none;
}

.component-item:hover {
    border-color: #409eff;
    color: #409eff;
    background-color: #ecf5ff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.component-item:active {
    cursor: grabbing;
}

/* 特殊样式：布局容器 */
.item-layout {
    grid-column: span 2;
    /* 布局容器占满一行 */
    border-style: dashed;
    background-color: #f0f9eb;
    border-color: #b3e19d;
    color: #67c23a;
}

.item-layout:hover {
    background-color: #e1f3d8;
    border-color: #67c23a;
    color: #67c23a;
}
</style>