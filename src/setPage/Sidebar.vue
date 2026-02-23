<!-- 组件库左侧边栏 -->
<template>
    <div class="sidebar">
        <div class="title">组件库</div>

        <div class="category">布局</div>
        <div class="item container-item" draggable="true" @dragstart="(e) => onDragStart(e, 'MyContainer')">布局容器
        </div>
        <!-- <div class="item form-item" draggable="true" @dragstart="(e) => onDragStart(e, 'MyForm')">表单容器</div> -->

        <div class="category">表单项</div>
        <div class="item" draggable="true" @dragstart="(e) => onDragStart(e, 'MyInput')">输入框</div>
        <div class="item" draggable="true" @dragstart="(e) => onDragStart(e, 'MySelect')">下拉框</div>
        <div class="item" draggable="true" @dragstart="(e) => onDragStart(e, 'MyButton')">按钮</div>

        <div class="category">展示</div>
        <div class="item" draggable="true" @dragstart="(e) => onDragStart(e, 'MyTable')">
            表格
        </div>
        <div class="item" draggable="true" @dragstart="(e) => onDragStart(e, 'MyChart')">
            图表
        </div>
        <div class="category">组件</div>
        <div class="item" draggable="true" @dragstart="(e) => onDragStart(e, 'MyQueryForm')">
            查询表单
        </div>
    </div>
</template>

<script setup>
const onDragStart = (e, type) => {
    e.dataTransfer.setData('componentType', type);
};
</script>

<style scoped>
.sidebar {
    width: 200px;
    border-right: 1px solid #ddd;
    padding: 10px;
    background: #fff;
}

.title {
    font-weight: bold;
    margin-bottom: 15px;
}

.item {
    padding: 12px;
    background: #f5f7fa;
    margin-bottom: 10px;
    cursor: grab;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    text-align: center;
}

.container-item {
    background: #e6f7ff;
    border-color: #91d5ff;
    color: #1890ff;
}

.category {
    font-size: 12px;
    color: #999;
    margin: 10px 0 5px;
}

.form-item {
    background: #f0f9eb;
    border-color: #e1f3d8;
}
</style>