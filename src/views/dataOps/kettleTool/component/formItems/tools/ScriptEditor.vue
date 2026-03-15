<template>
    <div class="kettle-studio" @click="closeContextMenu">

        <div class="main-layout">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <el-input v-model="filterText" prefix-icon="Search" placeholder="搜索函数 or 字段..."
                        class="custom-search-input" />
                </div>
                <div class="tree-content">
                    <el-tree ref="treeRef" :data="localTreeData" :props="{ children: 'children', label: 'text' }"
                        :filter-node-method="filterNode" default-expand-all node-key="id" :indent="12"
                        @node-click="handleNodeClick">
                        <template #default="{ data }">
                            <div class="tree-node" :draggable="isDraggable(data)"
                                @dragstart="handleDragStart($event, data)">
                                <div class="node-icon">
                                    <el-icon v-if="getNodeType(data) === 'folder'" color="#e6a23c">
                                        <Folder />
                                    </el-icon>
                                    <el-icon v-else-if="getNodeType(data) === 'script'" color="#409eff">
                                        <Document />
                                    </el-icon>
                                    <el-icon v-else-if="getNodeType(data) === 'field'" color="#67c23a">
                                        <PriceTag />
                                    </el-icon>
                                    <el-icon v-else color="#909399">
                                        <Setting />
                                    </el-icon>
                                </div>
                                <span class="node-text">{{ data.text }}</span>
                                <span v-if="getNodeType(data) === 'func'" class="node-badge">Fn</span>
                                <span v-if="getNodeType(data) === 'constant'" class="node-badge">C</span>
                            </div>
                        </template>
                    </el-tree>
                </div>
            </aside>

            <main class="editor-wrapper">
                <div class="tabs-bar">
                    <div v-for="(script, index) in scripts" :key="script.id" class="tab-item"
                        :class="{ active: activeScriptId === script.id }" @mousedown="switchTab(script.id)"
                        @contextmenu.prevent="openContextMenu($event, script, index)">
                        <el-icon class="tab-type-icon" :size="14">
                            <View v-if="script.type === 'transform'" />
                            <VideoPlay v-else-if="script.type === 'start'" />
                            <VideoPause v-else-if="script.type === 'end'" />
                        </el-icon>
                        <span class="tab-title">{{ script.label }}</span>
                        <span class="tab-close" @click.stop="removeScriptById(script.id, index)">
                            <el-icon>
                                <Close />
                            </el-icon>
                        </span>
                    </div>
                    <div class="tab-add" @click="addNewScript">
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </div>
                </div>
                <div class="code-container">
                    <codemirror v-if="activeScript" v-model="activeScript.content"
                        placeholder="// 请在此输入 JavaScript 脚本..." :style="{ height: '100%' }" :autofocus="true"
                        :indent-with-tab="true" :tab-size="2" :extensions="extensions" @ready="handleReady" />
                    <div v-else class="empty-placeholder">
                        <el-empty description="未打开任何脚本" :image-size="100" />
                    </div>
                </div>
                <div class="editor-statusbar">
                    <div class="status-left">
                    </div>
                    <div class="status-right">
                        <span>Ln {{ cursorPos.line }}, Col {{ cursorPos.col }}</span>
                    </div>
                </div>
            </main>
        </div>

        <div v-show="contextMenu.visible" class="context-menu-popover"
            :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
            <div class="menu-item" @click="addNewScript">
                <el-icon>
                    <Plus />
                </el-icon> <span>Add new</span>
            </div>
            <div class="menu-item" @click="copyScript">
                <el-icon>
                    <DocumentCopy />
                </el-icon> <span>Add copy</span>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" @click="setScriptType('transform')">
                <div class="menu-icon-wrap">
                    <el-icon v-if="contextMenu.target?.type === 'transform'" color="#409eff">
                        <Check />
                    </el-icon>
                </div>
                <el-icon>
                    <View />
                </el-icon> <span>Set Transform Script</span>
            </div>
            <div class="menu-item" @click="setScriptType('start')">
                <div class="menu-icon-wrap">
                    <el-icon v-if="contextMenu.target?.type === 'start'" color="#409eff">
                        <Check />
                    </el-icon>
                </div>
                <el-icon>
                    <VideoPlay />
                </el-icon> <span>Set Start Script</span>
            </div>
            <div class="menu-item" @click="setScriptType('end')">
                <div class="menu-icon-wrap">
                    <el-icon v-if="contextMenu.target?.type === 'end'" color="#409eff">
                        <Check />
                    </el-icon>
                </div>
                <el-icon>
                    <VideoPause />
                </el-icon> <span>Set End Script</span>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" @click="removeCurrentScript">
                <el-icon>
                    <Delete />
                </el-icon> <span>Remove Script Type</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, shallowRef, reactive, onMounted } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@codemirror/view'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
    serverTreeData: {
        type: Array,
        default: () => []
    },
    jsScripts: {
        type: [String, Array],
        default: ''
    }
})

// --- 状态定义 ---
const localTreeData = ref([])
const scripts = ref([])
const activeScriptId = ref('')
const view = shallowRef()
const filterText = ref('')
const treeRef = ref()
const cursorPos = reactive({ line: 1, col: 1 })
const contextMenu = reactive({ visible: false, x: 0, y: 0, target: null, index: -1 })

const activeScript = computed(() => scripts.value.find(s => s.id === activeScriptId.value))

// --- 类型判断 ---
const getNodeType = (data) => {
    if (data.iconCls === 'activeScript') return 'script'
    if (data.iconCls === 'arrowOrange') return 'field'
    if (data.iconCls === 'arrowGreen') {
        if (/^[A-Z_]+$/.test(data.text)) return 'constant'
        return 'func'
    }
    if (!data.leaf || (data.children && data.children.length > 0)) {
        return 'folder'
    }
    return 'folder'
}

const isDraggable = (data) => {
    const type = getNodeType(data)
    return ['field', 'func', 'constant'].includes(type)
}

// --- 递归提取树中的脚本节点 ---
const extractScriptsFromTree = (nodes, result = []) => {
    for (const node of nodes) {
        if (getNodeType(node) === 'script') {
            result.push({
                id: String(node.id),
                label: node.text,
                content: `// Source: ${node.text}\n`, // 注意：这里使用了 content 对应 codemirror
                type: 'transform'
            })
        }
        if (node.children && node.children.length > 0) {
            extractScriptsFromTree(node.children, result)
        }
    }
    return result
}

// --- 映射与同步 ---
const mapTypeNumToString = (num) => {
    if (num === 1) return 'start'
    if (num === 2) return 'end'
    return 'transform'
}

// 查找脚本父目录
const findScriptParentNode = (nodes) => {
    for (const node of nodes) {
        if ((String(node.id) === '1' || node.text === 'Transform Scripts') && getNodeType(node) === 'folder') {
            return node
        }
        if (node.children) {
            const found = findScriptParentNode(node.children)
            if (found) return found
        }
    }
    return null
}

const syncScriptsToTree = () => {
    const scriptFolder = findScriptParentNode(localTreeData.value)
    if (scriptFolder) {
        scriptFolder.children = scripts.value.map(s => ({
            id: s.id,
            text: s.label,
            iconCls: 'activeScript',
            leaf: true
        }))
    }
}

const loadScriptsFromProp = (rawInput) => {
    if (!rawInput) return

    try {
        let data = []
        // 判断类型：兼容字符串和数组
        if (typeof rawInput === 'string') {
            const jsonString = rawInput.replace(/&quot;/g, '"')
            data = JSON.parse(jsonString)
        } else if (Array.isArray(rawInput)) {
            data = rawInput
        }

        if (Array.isArray(data)) {
            const mappedScripts = data.map((item, index) => {
                // 处理 value: 去掉前缀并解码
                let rawContent = item.value || ''
                if (typeof rawContent === 'string' && rawContent.startsWith('VALUE_')) {
                    rawContent = rawContent.substring(6)
                }
                const decodedContent = typeof rawContent === 'string' ? decodeURIComponent(rawContent) : rawContent

                return {
                    id: `imported_${Date.now()}_${index}`,
                    label: item.name,
                    content: decodedContent, // 映射到 content
                    type: mapTypeNumToString(item.type)
                }
            })

            scripts.value = mappedScripts
            if (scripts.value.length > 0) {
                activeScriptId.value = scripts.value[0].id
            }
            syncScriptsToTree()
        }
    } catch (e) {
        console.error('脚本数据加载失败:', e)
        ElMessage.error('无法加载脚本数据')
    }
}


watch(() => props.serverTreeData, (newVal) => {
    if (newVal && newVal.length) {
        localTreeData.value = JSON.parse(JSON.stringify(newVal))
        // 优先级逻辑：有 jsScripts 则用 jsScripts，否则用树自带
        if (props.jsScripts && (Array.isArray(props.jsScripts) ? props.jsScripts.length > 0 : props.jsScripts !== '')) {
            loadScriptsFromProp(props.jsScripts)
        } else {
            const foundScripts = extractScriptsFromTree(localTreeData.value)
            if (foundScripts.length > 0) {
                scripts.value = foundScripts
                activeScriptId.value = foundScripts[0].id
            } else {
                if (scripts.value.length === 0) addNewScript()
            }
        }
    }
}, { immediate: true, deep: true })

// 监听 jsScripts 变化
watch(() => props.jsScripts, (newVal) => {
    // 确保树已有数据后再加载脚本，防止找不到父节点
    if (newVal && localTreeData.value.length > 0) {
        loadScriptsFromProp(newVal)
    }
})


// --- 递归删除逻辑 ---
const removeNodeRecursively = (nodes, targetId) => {
    if (!nodes || !nodes.length) return false
    const index = nodes.findIndex(node => String(node.id) === String(targetId))

    if (index !== -1) {
        nodes.splice(index, 1)
        return true
    }

    for (const node of nodes) {
        if (node.children && node.children.length > 0) {
            const found = removeNodeRecursively(node.children, targetId)
            if (found) return true
        }
    }
    return false
}

// --- 辅助：生成唯一名称 ---
const generateUniqueName = (basePrefix) => {
    let index = 1;
    let candidate = `${basePrefix} ${index}`;
    while (scripts.value.some(s => s.label === candidate)) {
        index++;
        candidate = `${basePrefix} ${index}`;
    }
    return candidate;
}

// --- 交互逻辑 ---
const switchTab = (id) => {
    activeScriptId.value = id
}

const handleNodeClick = (data) => {
    const type = getNodeType(data)

    if (type === 'script') {
        const existing = scripts.value.find(s => String(s.id) === String(data.id))
        if (existing) {
            activeScriptId.value = existing.id
        } else {
            // ID 不匹配时尝试按名字匹配，或者当作新导入
            const matchByName = scripts.value.find(s => s.label === data.text)
            if (matchByName) {
                activeScriptId.value = matchByName.id
            }
        }
        return
    }

    if (isDraggable(data) && view.value) {
        const v = view.value
        const r = v.state.selection.main
        v.dispatch({
            changes: { from: r.from, to: r.to, insert: data.text },
            selection: { anchor: r.from + data.text.length }
        })
        v.focus()
    }
}

const addNewScript = () => {
    const newId = Date.now().toString()
    const newName = generateUniqueName("Script");

    scripts.value.push({
        id: newId,
        label: newName,
        content: '// New Script\n', // 使用 content
        type: 'transform'
    })
    activeScriptId.value = newId

    const scriptFolder = findScriptParentNode(localTreeData.value)
    if (scriptFolder) {
        if (!scriptFolder.children) scriptFolder.children = []
        scriptFolder.children.push({
            id: newId,
            text: newName,
            iconCls: 'activeScript',
            leaf: true
        })
    } else {
        ElMessage.warning('未找到存放脚本的根目录')
    }
}

const removeScriptById = (id, index) => {
    if (scripts.value.length <= 1) {
        ElMessage.warning("至少保留一个脚本，无法删除");
        return;
    }

    ElMessageBox.confirm(
        '确定要删除该脚本吗？此操作将同步删除左侧资源树中的对应节点。',
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        scripts.value.splice(index, 1);

        if (id === activeScriptId.value) {
            if (scripts.value.length > 0) {
                const nextIndex = Math.max(0, index - 1);
                activeScriptId.value = scripts.value[nextIndex].id;
            } else {
                activeScriptId.value = '';
            }
        }
        // 使用同步方法刷新树，比递归删除更直接匹配 tabs 状态
        syncScriptsToTree()
    }).catch(() => { });
}

const handleDragStart = (e, data) => {
    if (!isDraggable(data)) { e.preventDefault(); return }
    e.dataTransfer.setData('application/x-kettle-snippet', data.text)
    e.dataTransfer.setData('text/plain', data.text)
    e.dataTransfer.effectAllowed = 'copy'
}

watch(filterText, (val) => treeRef.value.filter(val))
const filterNode = (value, data) => !value || data.text.toLowerCase().includes(value.toLowerCase())

const extensions = computed(() => [
    javascript(),
    EditorView.updateListener.of((update) => {
        if (update.selectionSet) {
            const state = update.state
            const range = state.selection.main
            const line = state.doc.lineAt(range.head)
            cursorPos.line = line.number
            cursorPos.col = range.head - line.from + 1
        }
    }),
    EditorView.domEventHandlers({
        dragover(event) { event.preventDefault(); return true },
        drop(event, view) {
            const snippet = event.dataTransfer?.getData('application/x-kettle-snippet')
            if (!snippet) return
            event.preventDefault()
            const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
            if (pos !== null) {
                view.dispatch({ changes: { from: pos, insert: snippet }, selection: { anchor: pos + snippet.length } })
                view.focus()
            }
        }
    })
])

const handleReady = (payload) => { view.value = payload.view }

const openContextMenu = (e, script, index) => {
    contextMenu.visible = true
    contextMenu.x = e.clientX + 5
    contextMenu.y = e.clientY + 5
    contextMenu.target = script
    contextMenu.index = index
    activeScriptId.value = script.id
}
const closeContextMenu = () => { contextMenu.visible = false }

const copyScript = () => {
    if (!contextMenu.target) return
    const newId = Date.now().toString()

    let baseName = `${contextMenu.target.label}_copy`;
    let newName = baseName;
    if (scripts.value.some(s => s.label === newName)) {
        newName = generateUniqueName(baseName);
    }

    // 注意：这里使用的是 content
    scripts.value.push({ id: newId, label: newName, content: contextMenu.target.content, type: contextMenu.target.type })
    activeScriptId.value = newId

    // 同步到树
    syncScriptsToTree()
}

const setScriptType = (type) => { if (contextMenu.target) contextMenu.target.type = type; closeContextMenu() }
const removeCurrentScript = () => { if (contextMenu.index > -1) removeScriptById(contextMenu.target.id, contextMenu.index); closeContextMenu() }

const getData = () => {
    return scripts.value.map(script => {
        let typeCode = 0; // 默认为 Transform (0)
        if (script.type === 'start') typeCode = 1;
        if (script.type === 'end') typeCode = 2;
        // 编码 content
        let encodedValue = 'VALUE_' + encodeURIComponent(script.content);
        return {
            name: script.label,
            type: typeCode,
            value: encodedValue
        };
    });
};

// --- 暴露给父组件 ---
defineExpose({
    getData,
    scripts
});
</script>

<style scoped>
.kettle-studio {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f5f5f5;
    font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
    color: #333;
    user-select: none;
}

.main-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 5px;
    gap: 5px;
}

.sidebar {
    width: 260px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 8px 10px;
    border-bottom: 1px solid #ebeef5;
}

:deep(.custom-search-input .el-input__wrapper) {
    background-color: #fff;
    border-radius: 4px;
    height: 30px;
}

.tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 5px 0;
}

.tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    height: 26px;
    font-size: 13px;
    color: #606266;
    cursor: default;
}

.tree-node[draggable="true"] {
    cursor: grab;
}

.node-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    margin-right: 4px;
}

.node-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.node-badge {
    font-size: 10px;
    color: #909399;
    background: #f4f4f5;
    border: 1px solid #e9e9eb;
    padding: 0 4px;
    border-radius: 2px;
    margin-right: 5px;
}

:deep(.el-tree-node__content) {
    height: 28px;
}

:deep(.el-tree-node__content:hover) {
    background-color: #f5f7fa;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: #ecf5ff;
    color: #409eff;
}

.editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
}

.tabs-bar {
    height: 32px;
    background: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    align-items: flex-end;
    padding-left: 5px;
}

.tab-item {
    height: 28px;
    min-width: 120px;
    max-width: 200px;
    padding: 0 8px;
    margin-right: 2px;
    background: #e4e7ed;
    border: 1px solid #dcdfe6;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #606266;
    font-size: 12px;
    position: relative;
    top: 1px;
}

.tab-item.active {
    background: #fff;
    height: 29px;
    border-top: 2px solid #409eff;
    color: #303133;
    z-index: 10;
}

.tab-type-icon {
    margin-right: 6px;
    color: #409eff;
}

.tab-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tab-close {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-left: 4px;
    opacity: 0;
    transition: opacity 0.2s;
}

.tab-item:hover .tab-close {
    opacity: 1;
}

.tab-close:hover {
    background: #ffdede;
    color: #f56c6c;
}

.tab-add {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #909399;
}

.tab-add:hover {
    color: #409eff;
}

.code-container {
    flex: 1;
    overflow: hidden;
    position: relative;
}

:deep(.cm-editor) {
    height: 100%;
    font-family: Consolas, "Fira Code", monospace;
    font-size: 14px;
}

:deep(.cm-gutters) {
    background-color: #fff;
    border-right: 1px solid #ebeef5;
    color: #c0c4cc;
}

.editor-statusbar {
    height: 24px;
    background: #f5f7fa;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    font-size: 12px;
}

.context-menu-popover {
    position: fixed;
    z-index: 9999;
    background: #fff;
    border: 1px solid #dcdfe6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 2px;
    padding: 4px 0;
    min-width: 180px;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    font-size: 12px;
    color: #333;
    cursor: pointer;
}

.menu-item:hover {
    background-color: #ecf5ff;
}

.menu-item .el-icon {
    margin-right: 8px;
    font-size: 14px;
    color: #606266;
}

.menu-icon-wrap {
    width: 16px;
    display: flex;
    justify-content: center;
    margin-right: -4px;
}

.menu-divider {
    height: 1px;
    background: #ebeef5;
    margin: 4px 0;
}
</style>