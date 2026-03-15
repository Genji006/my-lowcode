<template>
    <SzycDialog :dialogVisible="dialogVisible" width="50%" @close="dialogVisible = false" title="集群Schema配置"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="modern-layout">
                <div class="sidebar">
                    <div class="sidebar-header">
                        <span>Schema 列表</span>
                        <szycButton type="primary" :icon="Plus" plain @click="handleAddSchema">
                            新增
                        </szycButton>
                    </div>

                    <div class="list-container">
                        <template v-if="clusterSchemas.length > 0">
                            <div v-for="(item, index) in clusterSchemas" :key="index" class="list-item"
                                :class="{ active: selectedIndex === index }" @click="selectedIndex = index">
                                <span class="item-name">{{ item.name || '未命名 Schema' }}</span>
                                <el-popconfirm title="确定删除该配置吗？" @confirm="handleDeleteSchema(index)" width="200">
                                    <template #reference>
                                        <el-button class="delete-btn" type="danger" link :icon="Delete"
                                            @click.stop></el-button>
                                    </template>
                                </el-popconfirm>
                            </div>
                        </template>
                        <el-empty v-else description="暂无配置" image-size="60"></el-empty>
                    </div>
                </div>
                <div class="main-content">
                    <template v-if="currentForm">
                        <div class="content-scroll mxgraphForm">
                            <el-form :model="currentForm" label-width="180px" size="default" status-icon>
                                <el-form-item label="Schema名称：">
                                    <el-input v-model="currentForm.name" placeholder="请输入名称"></el-input>
                                </el-form-item>
                                <el-form-item label="端口：">
                                    <el-input v-model="currentForm.base_port" placeholder="40000"></el-input>
                                </el-form-item>
                                <el-form-item label="Sockets缓存大小：">
                                    <el-input v-model="currentForm.sockets_buffer_size"></el-input>
                                </el-form-item>
                                <el-form-item label="Sockets刷新间隔(rows)：">
                                    <el-input v-model="currentForm.sockets_flush_interval"></el-input>
                                </el-form-item>
                                <el-form-item label="Sockets数据是否压缩：">
                                    <el-switch v-model="currentForm.sockets_compressed" active-value="Y"
                                        inactive-value="N"></el-switch>
                                </el-form-item>
                                <el-form-item label="动态集群">
                                    <el-switch v-model="currentForm.dynamic" active-value="Y"
                                        inactive-value="N"></el-switch>
                                </el-form-item>
                            </el-form>
                            <el-divider content-position="left">子服务器</el-divider>

                            <div class="sub-server-header">
                                <div class="actions">
                                    <szycButton type="primary" @click="handleAddSubServer" size="small">
                                        <el-icon class="el-icon--left">
                                            <Plus />
                                        </el-icon>添加子服务器
                                    </szycButton>
                                </div>
                            </div>

                            <el-table :data="currentForm.slaveservers" border style="width: 100%; margin-top: 10px;"
                                size="small" :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
                                <el-table-column prop="name" label="名称" min-width="120">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.name" size="small" placeholder="名称"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column label="服务URL" min-width="120">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.hostname" size="small"
                                            placeholder="Host"></el-input>
                                    </template>
                                </el-table-column>
                                <!-- <el-table-column label="Port" width="100">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.port" size="small" placeholder="Port"></el-input>
                                    </template>
                                </el-table-column> -->
                                <el-table-column prop="master" label="是否主服务器" width="120" align="center">
                                    <template #default="scope">
                                        <el-select v-model="scope.row.master" size="small" placeholder="请选择">
                                            <el-option label="是" value="Y"></el-option>
                                            <el-option label="否" value="N"></el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="60" align="center">
                                    <template #default="scope">
                                        <el-button link type="danger" :icon="Delete"
                                            @click="handleRemoveSubServer(scope.$index)"></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </template>

                    <div v-else class="empty-state">
                        <el-empty description="请选择或创建一个 Schema"></el-empty>
                    </div>
                </div>
            </div>

            <div class="dialog-footer">
                <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { Plus, Delete } from '@element-plus/icons-vue'

const { mxUtils } = window.mx || {};

const dialogVisible = ref(false)
const clusterSchemas = ref([])
const slaveServers = ref([])
const selectedIndex = ref(0)
let currentCell = null
let currentGraph = null
let onSaveCallback = null

const currentForm = computed(() => {
    if (clusterSchemas.value.length > 0 && clusterSchemas.value[selectedIndex.value]) {
        return clusterSchemas.value[selectedIndex.value];
    }
    return null;
});

// 1. 新增 Schema
const handleAddSchema = () => {
    const newSchema = {
        name: `New Schema ${clusterSchemas.value.length + 1}`,
        base_port: '40000',
        sockets_buffer_size: '2000',
        sockets_flush_interval: '5000',
        sockets_compressed: 'Y',
        dynamic: 'N',
        slaveservers: []
    }
    clusterSchemas.value.push(newSchema)
    // 自动选中新创建的项
    selectedIndex.value = clusterSchemas.value.length - 1
}

// 2. 删除 Schema
const handleDeleteSchema = (index) => {
    clusterSchemas.value.splice(index, 1)
    // 如果删除的是当前选中的项，或者删除后索引越界，重置索引
    if (clusterSchemas.value.length === 0) {
        selectedIndex.value = -1 // 无选中
    } else if (index <= selectedIndex.value) {
        // 如果删除的在前面或就是当前项，索引前移，但保证不小于0
        selectedIndex.value = Math.max(0, selectedIndex.value - 1)
    }
}

// 3. 子服务器操作
const handleAddSubServer = () => {
    if (!currentForm.value) return;
    if (!currentForm.value.slaveservers) currentForm.value.slaveservers = [];

    currentForm.value.slaveservers.push({
        name: 'Slave1',
        hostname: 'localhost',
        port: '8081',
        master: 'N'
    })
}

const handleRemoveSubServer = (subIndex) => {
    if (currentForm.value && currentForm.value.slaveservers) {
        currentForm.value.slaveservers.splice(subIndex, 1);
    }
}

const infoElement = ref('')
// --- 原有逻辑 ---
const populateFromXml = (xmlDocument) => {
    if (!window.mx) return; // 安全检查
    let xmlDoc = mxUtils.parseXml(xmlDocument);
    infoElement.value = xmlDoc.querySelector('Info');
    console.log("infoElement.value:", infoElement.value);
    if (infoElement.value) {
        clusterSchemas.value = JSON.parse(infoElement.value.getAttribute('clusterSchemas')) || [];
        // 打开时如果有数据，默认选中第一个
        if (clusterSchemas.value.length > 0) selectedIndex.value = 0;
    }
}

const openDialog = (data) => {
    // 重置状态
    clusterSchemas.value = []
    selectedIndex.value = 0

    if (data) populateFromXml(data)
    else handleAddSchema() // 如果没有数据，默认创建一个

    dialogVisible.value = true
}

const changeClusterSchemas = (data) => {
    if (clusterSchemas.value.length){
        data.setAttribute('clusterSchemas', JSON.stringify(clusterSchemas.value));
    }
    return data
}

const handleConfirm = async() => {
    await changeClusterSchemas(infoElement.value)
    dialogVisible.value = false
}

defineExpose({
    openDialog,
    changeClusterSchemas,
})
</script>

<style lang="scss" scoped>
/* 现代化布局样式 */
.modern-layout {
    display: flex;
    height: 550px;
    /* 固定高度，内部滚动 */
    border: 1px solid #ebeef5;
    /* 柔和的边框 */
    border-radius: 4px;
    overflow: hidden;
    background-color: #fff;
}

/* 左侧 Sidebar */
.sidebar {
    width: 240px;
    background-color: #fcfcfc;
    /* 极淡的灰色背景区分 */
    border-right: 1px solid #ebeef5;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ebeef5;
    font-weight: 600;
    color: #303133;
    background-color: #fff;
}

.list-container {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 12px;
    margin-bottom: 4px;
    border-radius: 6px;
    /* 圆角列表项 */
    cursor: pointer;
    transition: all 0.2s;
    color: #606266;
    font-size: 14px;

    &:hover {
        background-color: #f2f6fc;

        .delete-btn {
            opacity: 1;
        }
    }

    &.active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-weight: 500;
    }
}

.item-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}

.delete-btn {
    opacity: 0;
    /* 默认隐藏 */
    padding: 4px;
    margin-left: 5px;
    transition: opacity 0.2s;
}

/* 右侧内容区 */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    overflow: hidden;
    /* 防止自身出现双滚动条 */
}

.content-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 4px solid var(--el-color-primary);
    line-height: 1;
}

.sub-server-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 0 0 10px;
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #909399;
}

/* 底部按钮栏 */
.dialog-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>