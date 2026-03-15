<template>
    <SzycDialog :dialogVisible="visible" width="30%" @close="handleClose" title="资源库浏览" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="file-explorer-wrapper">
                <div class="file-explorer-container">
                    <!-- 文件浏览器树形结构 -->
                    <el-tree ref="treeRef" :data="treeData" :props="treeProps" :load="loadNodes" lazy node-key="id"
                        :expand-on-click-node="false" @node-click="handleNodeClick">
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <img src="@/assets/ItemImg/transLogo.svg" alt="" v-if="props.loadElement == 1"
                                    width="15" height="15" style="margin-right: 5px;">
                                <img src="@/assets/ItemImg/jobLogo.svg" alt="" v-if="props.loadElement == 2" width="15"
                                    height="15" style="margin-right: 5px;">
                                <span>{{ node.label }}</span>
                            </span>
                        </template>
                    </el-tree>
                </div>
                <!-- 显示完整路径的输入框 -->
                <div class="path-input-container">
                    <el-input v-model="selectedPath" placeholder="选中转换或作业的路径将显示在此处" readonly />
                </div>
                <div class="dialog-footer">
                    <SzycCancel @click="handleClose">取消</SzycCancel>
                    <szycButton type="primary" @click="handleConfirm" :disabled="!selectedPath">确定</szycButton>
                </div>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import SzycFormSearch from '@/components/element/searchForm.vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { getJobOrTransList } from '@/api/kettleApi/index'
import { Folder } from '@element-plus/icons-vue'

// 定义组件属性
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    loadElement: {
        type: Number,
        default: 1
    }
})

// 定义事件发射
const emit = defineEmits(['update:visible', 'ok'])

// 响应式数据
const treeRef = ref()
const treeData = ref([])
const treeProps = {
    label: 'name',
    isLeaf: 'isFile'
}
const selectedPath = ref('')
const selectedNode = ref(null)


const isValidFileType = (item) => {
    return item.ext && (item.ext.toLowerCase() === '.ktr' || item.ext.toLowerCase() === '.kjb')
}

// 加载节点数据
const loadNodes = async (node, resolve) => {
    try {
        let path = node.level === 0 ? '' : node.data.id
        let res = await getJobOrTransList({
            path: path,
            loadElement: props.loadElement  // 使用loadElement参数控制加载哪些元素
        })

        // 过滤节点，只显示符合条件的项目（转换和作业）
        let nodes = res.map(item => ({
            id: item.id,
            name: item.text,
            path: item.path,
            isFile: item.leaf || false,
            ext: item.ext || ''
        }))

        resolve(nodes)
    } catch (error) {
        console.error('加载节点失败:', error)
        resolve([])
    }
}

// 处理节点点击
const handleNodeClick = (data) => {
    selectedPath.value = data.path
    selectedNode.value = data
}

// 关闭对话框
const handleClose = () => {
    // 重置状态
    selectedPath.value = ''
    selectedNode.value = null
    emit('update:visible', false)
}

// 确认选择
const handleConfirm = () => {
    if (selectedPath.value) {
        // 解析路径，提取目录和文件名
        const lastSlashIndex = selectedPath.value.lastIndexOf('/')
        let directory = ''
        let fileName = selectedPath.value

        if (lastSlashIndex !== -1) {
            directory = selectedPath.value.substring(0, lastSlashIndex + 1)
            fileName = selectedPath.value.substring(lastSlashIndex + 1)
        }
        emit('ok', directory, fileName)
        handleClose()
    }
}

// 当组件显示时初始化
watch(() => props.visible, (newVal) => {
    if (newVal) {
        // 打开对话框时清空之前的选择
        selectedPath.value = ''
        selectedNode.value = null
    }
})

onMounted(() => {

})
</script>

<style scoped>
.file-explorer-wrapper {
    display: flex;
    flex-direction: column;
    height: 500px;
}

.file-explorer-container {
    flex: 1;
    overflow-y: auto;
}

.path-input-container {
    padding-top: 15px;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 10px;
    padding: 10px 0 0 0;
    flex-shrink: 0;
}

.custom-tree-node {
    display: flex;
    align-items: center;
    gap: 4px;
}

.folder-icon {
    color: #E6A23C;
}
</style>