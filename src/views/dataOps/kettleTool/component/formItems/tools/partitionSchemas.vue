<template>
    <SzycDialog :dialogVisible="dialogVisible" width="50%" @close="dialogVisible = false" title="数据库分区Schema对话框"
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
                        <template v-if="partitionSchemas.length > 0">
                            <div v-for="(item, index) in partitionSchemas" :key="index" class="list-item"
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
                            <el-form :model="currentForm" label-width="280px" size="default" status-icon>
                                <el-form-item label="分区Schema名称:">
                                    <el-input v-model="currentForm.name" placeholder="请输入名称"></el-input>
                                </el-form-item>
                                <el-form-item label="Dynamically create the schema:">
                                    <el-switch v-model="currentForm.dynamic" active-value="Y"
                                        inactive-value="N"></el-switch>
                                </el-form-item>
                                <el-form-item label="Number of partitions per slave server?:">
                                    <el-input v-model="currentForm.partitions_per_slave" placeholder=""></el-input>
                                </el-form-item>
                            </el-form>
                            <el-divider content-position="left">分区</el-divider>
                            <div class="sub-server-header">
                                <div class="actions">
                                    <szycButton type="primary" @click="handleAddPartition" size="small">
                                        <el-icon class="el-icon--left">
                                            <Plus />
                                        </el-icon>添加分区
                                    </szycButton>
                                </div>
                            </div>
                            <el-table :data="currentForm.partition" border style="width: 100%; margin-top: 10px;"
                                size="small" :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
                                <el-table-column label="分区ID" min-width="120">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.partitionId" size="small" placeholder="请输入分区ID"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="60" align="center">
                                    <template #default="scope">
                                        <el-button link type="danger" :icon="Delete"
                                            @click="handleRemovePartition(scope.$index)"></el-button>
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
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { Plus, Delete } from '@element-plus/icons-vue'

const { mxUtils } = window.mx || {};

const dialogVisible = ref(false)
const partitionSchemas = ref([])
const selectedIndex = ref(0)
const infoElement = ref('')

// 当前选中的表单数据
const currentForm = computed(() => {
    if (partitionSchemas.value.length > 0 && partitionSchemas.value[selectedIndex.value]) {
        return partitionSchemas.value[selectedIndex.value];
    }
    return null;
});

// 1. 新增 Schema
const handleAddSchema = () => {
    const newSchema = {
        name: `Partition Schema ${partitionSchemas.value.length + 1}`,
        dynamic: false,
        partitions_per_slave: '',
        partition: [] // 存储分区ID列表
    }
    partitionSchemas.value.push(newSchema)
    selectedIndex.value = partitionSchemas.value.length - 1
}

// 2. 删除 Schema
const handleDeleteSchema = (index) => {
    partitionSchemas.value.splice(index, 1)
    if (partitionSchemas.value.length === 0) {
        selectedIndex.value = -1
    } else if (index <= selectedIndex.value) {
        selectedIndex.value = Math.max(0, selectedIndex.value - 1)
    }
}

// 3. 添加分区ID (对应图片下方的列表)
const handleAddPartition = () => {
    if (!currentForm.value) return;
    if (!currentForm.value.partition) currentForm.value.partition = [];

    currentForm.value.partition.push({
        partitionId: ''
    })
}

// 4. 删除分区ID
const handleRemovePartition = (subIndex) => {
    if (currentForm.value && currentForm.value.partition) {
        currentForm.value.partition.splice(subIndex, 1);
    }
}

// --- 数据解析与保存逻辑 ---
const populateFromXml = (xmlDocument) => {
    if (!window.mx) return;
    let xmlDoc = mxUtils.parseXml(xmlDocument);
    infoElement.value = xmlDoc.querySelector('Info');

    if (infoElement.value) {
        // 读取 partitionSchemas 属性，如果不存在则为空数组
        const storedData = infoElement.value.getAttribute('partitionSchemas');
        partitionSchemas.value = storedData ? JSON.parse(storedData) : [];
        console.log('partitionSchemas', partitionSchemas.value);
        if (partitionSchemas.value.length > 0) selectedIndex.value = 0;
    }
}

const openDialog = (data) => {
    partitionSchemas.value = []
    selectedIndex.value = 0

    if (data) populateFromXml(data)
    else handleAddSchema()

    dialogVisible.value = true
}

const saveToXml = (data) => {
    if (infoElement.value) {
        // 将数据序列化回 XML 属性
        data.setAttribute('partitionSchemas', JSON.stringify(partitionSchemas.value));
    }
    return data
}

const handleConfirm = async () => {
    saveToXml(infoElement.value);
    dialogVisible.value = false
}

defineExpose({
    openDialog,
    saveToXml
})
</script>

<style lang="scss" scoped>
/* 现代化布局样式 - 保持与之前一致 */
.modern-layout {
    display: flex;
    height: 550px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    background-color: #fff;
}

/* 左侧 Sidebar */
.sidebar {
    width: 240px;
    background-color: #fcfcfc;
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
}

.content-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

/* 调整了sub-server-header的间距 */
.sub-server-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 10px 0;
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #909399;
}

.dialog-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>