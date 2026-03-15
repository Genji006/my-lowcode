<template>
    <el-dialog v-model="dialogVisible" title="应用预览" fullscreen destroy-on-close :show-close="true"
        class="preview-dialog">
        <div class="preview-layout">
            <el-container class="full-height">
                <el-header class="preview-header">
                    <div class="header-left">
                        <div class="logo">
                            <span>配置组件演示</span>
                        </div>
                        <el-menu mode="horizontal" background-color="#001529" text-color="rgba(255, 255, 255, 0.65)"
                            active-text-color="#fff" default-active="1" class="top-menu">
                            <el-menu-item index="1">首页</el-menu-item>
                            <el-menu-item index="2">基础信息管理</el-menu-item>
                            <el-menu-item index="3">系统管理</el-menu-item>
                        </el-menu>
                    </div>

                    <div class="header-right">
                        <el-button link style="color: #fff">
                            <el-icon :size="18">
                                <Bell />
                            </el-icon>
                        </el-button>
                        <div class="user-info">
                            Admin
                        </div>
                    </div>
                </el-header>

                <div class="tags-view-container">
                    <div class="tags-scroll-wrapper">
                        <div class="tag-item">
                            首页
                        </div>
                        <div class="tag-item">
                            基础信息管理
                            <el-icon class="close-icon">
                                <Close />
                            </el-icon>
                        </div>
                        <div class="tag-item active">
                            系统管理
                            <el-icon class="close-icon">
                                <Close />
                            </el-icon>
                        </div>
                    </div>
                </div>

                <div class="preview-main-container">
                    <div class="page-content-wrapper">
                        <PageRender :schema="componentList" />
                    </div>
                </div>
            </el-container>
        </div>
    </el-dialog>
</template>

<script setup>
import { computed, provide } from 'vue';
import { Bell, Close } from '@element-plus/icons-vue'; // 确保引入图标
import PageRender from '../pageRender.vue';

const props = defineProps(['modelValue', 'componentList']);
const emit = defineEmits(['update:modelValue']);
provide('isPreview', true);
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
:deep(.el-dialog__body) {
    padding: 0 !important;
    overflow-y: auto;
    height: calc(100vh - var(--el-dialog-title-height, 54px));
    display: block;
    background-color: #f0f2f5;
}

.preview-layout {
    width: 100%;
    min-height: 100%;
}

.preview-header {
    background-color: #001529;
    padding: 0 24px;
    height: 50px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
}

.header-left {
    display: flex;
    align-items: center;
    height: 100%;
}

.logo {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin-right: 40px;
}

.top-menu {
    border-bottom: none;
    height: 50px;
    width: 500px;
}

:deep(.el-menu--horizontal > .el-menu-item) {
    border-bottom: none;
}

:deep(.el-menu--horizontal > .el-menu-item.is-active) {
    background-color: #1890ff !important;
    color: #fff !important;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 6px;
    color: #fff;
    font-size: 14px;
}

.tags-view-container {
    height: 34px;
    flex-shrink: 0;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 20px;
    z-index: 9;
    border-bottom: 1px solid #d8dce5;
}

.tags-scroll-wrapper {
    display: flex;
    align-items: center;
    gap: 5px;
}

.tag-item {
    display: inline-flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    height: 26px;
    line-height: 26px;
    border: 1px solid #d8dce5;
    color: #495060;
    background: #fff;
    padding: 0 8px;
    font-size: 12px;
    border-radius: 2px;
}

.tag-item:hover {
    background-color: #f5f7fa;
}

.tag-item.active {
    background-color: #409EFF;
    color: #fff;
    border-color: #409EFF;
}

.close-icon {
    margin-left: 5px;
    width: 14px;
    height: 14px;
    font-size: 10px;
}

.preview-main-container {
    background-color: #f0f2f5;
    box-sizing: border-box;
    /* 1. 让 main 容器占据剩余的全部高度 */
    flex: 1; 
    /* 2. 允许容器内部出现横向和纵向滚动条 */
    overflow: auto; 
    padding: 20px;
    /* 3. 设置相对定位，为内部绝对定位的组件提供基准 */
    position: relative; 
}

.page-content-wrapper {
    background-color: #fff;
    /* 1. 如果屏幕比 1920 宽，占满 100%；如果比 1920 窄，保持 1920 并出现滚动条 */
    width: 100%;
    min-width: 1920px; 
    /* 2. 同理处理高度 */
    min-height: 1080px; 
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.05);
    /* 3. 这里非常重要：设计器里的画布通常是相对定位的，这里也要一致 */
    position: relative; 
}
</style>