<template>
    <SzycDialog :dialogVisible="visible" width="30%" @close="handleClose" title="文件浏览器" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="file-explorer-wrapper">
                <div class="file-explorer-container">
                    <el-tree ref="treeRef" :data="treeData" :props="treeProps" :load="loadNodes" lazy node-key="id"
                        :expand-on-click-node="false" @node-click="handleNodeClick">
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <el-icon v-if="!data.isFile" class="folder-icon">
                                    <Folder />
                                </el-icon>
                                <span>{{ node.label }}</span>
                            </span>
                        </template>
                    </el-tree>
                </div>
                <div class="extension-selector">
                    <el-select v-model="selectedExtension" placeholder="选择文件类型" @change="handleExtensionChange">
                        <el-option v-for="item in extensions" :key="item.type" :label="item.desc" :value="item.type" />
                    </el-select>
                </div>
                <div class="dialog-footer">
                    <SzycCancel @click="handleClose">取消</SzycCancel>
                    <szycButton type="primary" @click="handleConfirm">确定</szycButton>
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
import { filextension, fileexplorer } from '@/api/kettleApi/index'

// 定义组件属性
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    extension: {
        type: Number,
        default: 0
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
const extensions = ref([])
const selectedExtension = ref(props.extension)
const selectedNode = ref(null)

// 获取文件扩展名列表
const fetchExtensions = async () => {
    try {
        let res = await filextension({ extension: selectedExtension.value })
        extensions.value = res
        // 如果 extensions 数组不为空且 selectedExtension 为默认值 0，则设置为第一个选项
        if (res.length > 0) {
            selectedExtension.value = res[0].type
        }
    } catch (error) {
        console.error('获取文件类型失败:', error)
    }
}
// 加载节点数据
const loadNodes = async (node, resolve) => {
    try {
        let path = node.level === 0 ? '' : node.data.id
        let res = await fileexplorer({
            path: path,
            extension: selectedExtension.value
        })

        let nodes = res.map(item => ({
            id: item.id,
            name: item.text,
            isFile: item.leaf || false
        }))

        resolve(nodes)
    } catch (error) {
        console.error('加载节点失败:', error)
        resolve([])
    }
}

// 处理节点点击
const handleNodeClick = (data) => {
    selectedNode.value = data
}

// 处理扩展名变更
const handleExtensionChange = async () => {
    // 清空并重新加载树
    treeData.value = []
    treeRef.value?.setCurrentKey(null)
    selectedNode.value = null

    // 重新加载树根节点数据
    try {
        let res = await fileexplorer({
            path: '',
            extension: selectedExtension.value
        })

        treeData.value = res.map(item => ({
            id: item.id,
            name: item.text,
            isFile: item.leaf || false
        }))
    } catch (error) {
        console.error('重新加载树数据失败:', error)
        treeData.value = []
    }
}

// 关闭对话框
const handleClose = () => {
    emit('update:visible', false)
}

// 确认选择
const handleConfirm = () => {
    if (selectedNode.value) {
        emit('ok', selectedNode.value.id)
        handleClose()
    }
}

// 监听extension prop的变化，仅在值真正改变时更新
watch(
    () => props.extension,
    (newVal, oldVal) => {
        if (selectedExtension.value !== newVal) {
            selectedExtension.value = newVal
            // 只有当对话框打开时才重新获取扩展名
            if (props.visible) {
                fetchExtensions()
            }
        }
    }
)

// 监听visible prop的变化，仅当组件变为可见时获取扩展名
watch(() => props.visible, (newVal) => {
    if (newVal) {
        // 每次打开时，使用当前的props.extension值
        selectedExtension.value = props.extension
        // 当对话框打开时，使用当前的extension值获取扩展名列表
        fetchExtensions()
    } else {
        
    }
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

.extension-selector {
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