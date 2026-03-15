<template>
    <SzycDialog :dialogVisible="visible" width="30%" @close="handleClose" title="数据库浏览" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="tree-container">
                <el-tree ref="treeRef" :data="treeData" :props="treeProps" :load="loadNode" lazy node-key="nodeId"
                    :highlight-current="true" @node-click="handleNodeClick" :filter-node-method="filterNodeMethod" />
            </div>

            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="handleClose">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, defineEmits, nextTick, watch } from 'vue'
import { ElDialog, ElTree, ElButton, ElMessage } from 'element-plus'
import { databaseExplorer } from '@/api/kettleApi/index'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"

// 定义组件属性
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    databaseInfo: {
        type: Object,
        required: true
    },
    includeElement: {
        type: Number,
        default: 15
    },
    transName: {
        type: String,
        required: true
    }
})

// 定义事件发射
const emit = defineEmits(['select', 'close'])

// 响应式数据
const visible = ref(props.modelValue)
const treeRef = ref()
const treeData = ref([])
const selectedNode = ref(null)

// 树属性配置
const treeProps = {
    label: 'text',
    isLeaf: 'leaf',
    children: 'children'
}

// 关闭对话框
const handleClose = () => {
    visible.value = false
    treeData.value = []
    emit('close')
}

// 确认选择
const handleConfirm = () => {
    if (!selectedNode.value) {
        ElMessage.warning('请选择节点！')
        return
    }

    if (!selectedNode.value.leaf) {
        ElMessage.warning('请选择有效节点！')
        return
    }

    emit('select', selectedNode.value)
    handleClose()
}

// 处理节点点击
const handleNodeClick = (data) => {
    console.log("data", data);
    selectedNode.value = data
}

// 加载节点数据
const loadNode = (node, resolve) => {
    if (node.level === 0) {
        // 加载根节点
        loadTreeData("", 'root', null, null, (data) => {
            resolve(data);
            // 根据根节点的 expanded 属性决定是否加载下一层
            if (data && data.length > 0 && data[0].expanded) {
                // 延迟加载子节点，确保根节点已经渲染完成
                setTimeout(() => {
                    if (treeRef.value) {
                        const rootNode = treeRef.value.getNode(data[0].nodeId);
                        if (rootNode) {
                            rootNode.expand();
                        }
                    }
                }, 0);
            }
        });
        return
    }
    else {
        // 只有当节点没有子节点或者子节点为空时才加载
        if (!node.data.children || node.data.children.length === 0) {
            loadTreeData(node.data.nodeId, node.data.text, node.data.id, node.data.children, resolve)
        } else {
            // 如果已经有子节点数据，直接使用
            resolve(node.data.children)
        }
    }
}

// 从后端获取树数据
const loadTreeData = (nodeId, text, node, treeNode, resolve) => {
    const params = {
        databaseInfo: props.databaseInfo.name,
        includeElement: props.includeElement,
        transName: props.transName || 'nuw',
        nodeId: nodeId,
        text: text,
        node: node || "xnode-332"
    }

    databaseExplorer(params)
        .then(res => {
            console.log("treeNode", treeNode);
            if (resolve) {
                // 使用 resolve 方法返回数据给 tree 组件
                resolve(res)
            } else {
                // 根节点数据
                treeData.value = res
            }
        })
        .catch(error => {
            console.error('Failed to load tree data:', error)
            if (resolve) {
                resolve([])
            }
        })
}
// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
    visible.value = val
    if (val) {
        // 每次打开对话框时重新初始化树数据
        treeData.value = [];
        console.log("props.databaseInfo", props.databaseInfo);
    }
})

// 暴露方法给父组件
defineExpose({
})
</script>

<style scoped>
.tree-container {
    height: 400px;
    overflow-y: auto;
}
</style>