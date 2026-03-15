<template>
    <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="handleDialogClose" title="表输入"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="sql-editor-container mxgraphForm" v-if="dialogVisible">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="步骤名称：">
                        <el-input v-model="form.stepName"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <div style="display: flex;width: 100%;">
                            <el-select v-model="form.dataBase" style="width: 100%;" @change="getDatabaseInfoByName">
                                <el-option v-for="item in dataBaseList" :label="item.name"
                                    :value="item.name"></el-option>
                            </el-select>
                            <el-button @click="editDataBaseSetting" style="margin-left: 10px;"
                                :disabled="!form.dataBase">编辑</el-button>
                            <el-button @click="addDataBaseSetting" style="margin-left: 10px;">新建</el-button>
                            <!-- <el-button @click="" style="margin-left: 10px;">Wizard</el-button> -->
                            <el-button @click="openDatabaseExplorer" style="margin-left: 10px;"
                                :disabled="!form.dataBase">获取SQL查询语句</el-button>
                        </div>
                    </el-form-item>
                </el-form>

                <div class="sql-editor">
                    <codemirror v-model="code" :extensions="extensions" :style="{ height: height }" @ready="handleReady"
                        @change="handleChange" @focus="handleFocus" @blur="handleBlur" />
                </div>
                <div class="editor-footer">
                    <div class="status-bar">
                        <span>行 {{ cursorPosition.line + 1 }}, 列 {{ cursorPosition.column + 1 }}</span>
                    </div>
                </div>
                <el-form :model="form" label-width="200px">
                    <el-form-item label="允许简易转换">
                        <el-checkbox v-model="form.allowSimpleConversion"></el-checkbox>
                    </el-form-item>
                    <el-form-item label="替换 SQL 语句里的变量">
                        <el-checkbox v-model="form.replaceVariables"></el-checkbox>
                    </el-form-item>
                    <el-form-item label="从步骤插入数据">
                        <el-select v-model="form.lookup" placeholder="请选择">
                            <el-option v-for="item in stepList" :label="item.name"
                                :value="item.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="执行每一行？">
                        <el-checkbox v-model="form.executeEveryRow"></el-checkbox>
                    </el-form-item>
                    <el-form-item label="记录数量限制">
                        <el-input-number v-model="form.recordLimit" :min="0"></el-input-number>
                    </el-form-item>
                </el-form>

            </div>
            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
                <SzycCancel @click="getPreview">预览</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
    <database-explorer-dialog v-model="showDatabaseExplorer" :database-info="databaseInfo" :include-element="15"
        :trans-Name="transName" @select="onDatabaseNodeSelect" @close="showDatabaseExplorer = false" />

    <SzycDialog :dialogVisible="previewDialogVisible" title="数据预览" width="60%" @close="previewDialogVisible = false"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="data-preview-dialog">
                <el-table :data="previewDataList.firstRecords" border style="width: 100%" max-height="400">
                    <el-table-column v-for="column in previewDataList.columns" :key="column.dataIndex"
                        :prop="column.dataIndex" :label="column.header" show-overflow-tooltip />
                </el-table>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { getDatabases, tableFields, previewData, previousSteps } from '@/api/kettleApi/index'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
// import { idea } from '@codemirror/theme-idea'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars, drawSelection, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, indentUnit, foldGutter, bracketMatching } from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'
import { Codemirror } from 'vue-codemirror'
import { format } from 'sql-formatter';
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { ElMessage } from 'element-plus'
import DatabaseExplorerDialog from '../tools/DatabaseExplorerDialog.vue'

const stepList = ref([]);

const form = reactive({
    stepName: "",
    dataBase: "",
    allowSimpleConversion: false,
    replaceVariables: false,
    insertDataFromStep: "",
    executeEveryRow: false,
    recordLimit: 0,
    lookup: ""
})

// 响应式数据
const showDatabaseExplorer = ref(false)
const selectedInfo = ref(null)
const previewDialogVisible = ref(false)

const databaseInfo = reactive({})

// 定义组件属性
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    height: {
        type: String,
        default: '400px'
    },
    theme: {
        type: String,
        default: ''
    },
    lineNumbers: {
        type: Boolean,
        default: true
    },
    autocomplete: {
        type: Boolean,
        default: true
    },
    search: {
        type: Boolean,
        default: true
    },
    tabSize: {
        type: Number,
        default: 2
    },
})

// 定义事件
const emit = defineEmits(['ready', 'focus', 'blur', 'change', 'save', 'close', 'update-step'])

// 响应式变量
const code = ref(props.modelValue)
const view = ref()
const state = ref()
const dialogVisible = ref(false)
const cursorPosition = ref({ line: 0, column: 0 })

const openDatabaseExplorer = () => {
    // 确保 databaseInfo 已经被填充
    if (form.dataBase) {
        getDatabaseInfoByName(form.dataBase)
        showDatabaseExplorer.value = true
    }
}

const editDataBaseSetting = () => {
    emit('editDataBaseSetting', { name: form.dataBase })
}

const addDataBaseSetting = () => {
    emit('addDataBaseSetting')
}

// 存储当前编辑的节点信息
let currentCell = null
let currentGraph = null
let currentXml = null
let allXmlData = null
let transName = ref("")

const { mxUtils } = window.mx;
// 关闭对话框
const handleDialogClose = () => {
    dialogVisible.value = false
}

// 保存并关闭
// const saveAndClose = () => {
//     emit('update:modelValue', code.value)
//     emit('save', code.value)
//     dialogVisible.value = false
// }

// 计算属性 - 扩展功能
const extensions = computed(() => {
    const ext = [
        // SQL语言支持
        sql(),

        // 显示行号
        lineNumbers(),

        // 高亮活动行的行号区域
        highlightActiveLineGutter(),

        // 高亮特殊字符（如制表符、换行符等）
        highlightSpecialChars(),

        // 历史记录功能（撤销/重做）
        history(),

        // 代码折叠功能
        foldGutter(),

        // 绘制选区
        drawSelection(),

        // 允许多重选择
        EditorState.allowMultipleSelections.of(true),

        // 设置缩进单位（空格数）
        indentUnit.of(" ".repeat(props.tabSize)),

        // 语法高亮样式
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

        // 括号匹配高亮
        bracketMatching(),

        // 自动闭合括号（输入开括号时自动添加闭括号）
        closeBrackets(),

        // 启用自动补全功能
        autocompletion(),

        // 高亮活动行
        highlightActiveLine(),

        // 高亮选中文本的所有匹配项
        highlightSelectionMatches(),

        // 启用行包装（长行自动换行）
        EditorView.lineWrapping,

        // 设置占位符文本
        // EditorView.placeholder(props.placeholder),

        // 监听光标位置变化
        EditorView.updateListener.of((update) => {
            if (update.selectionSet) {
                const cursor = update.state.selection.main.head
                const line = update.state.doc.lineAt(cursor)
                cursorPosition.value = {
                    line: line.number - 1,
                    column: cursor - line.from
                }
            }
        })
    ]

    // 根据主题属性选择主题
    if (props.theme === 'oneDark') {
        ext.push(oneDark)
    } else {
        ext.push()
    }

    // 添加键盘快捷键
    ext.push(
        keymap.of([
            // 闭括号相关快捷键
            ...closeBracketsKeymap,

            // 默认编辑器快捷键（如Ctrl+Z撤销、Ctrl+Y重做等）
            ...defaultKeymap,

            // 搜索相关快捷键（如Ctrl+F查找）
            ...searchKeymap,

            // 历史记录相关快捷键
            ...historyKeymap,

            // 自动补全相关快捷键（如Ctrl+Space触发补全）
            ...completionKeymap,

            // 语法检查相关快捷键
            ...lintKeymap,

            // Tab缩进快捷键
            indentWithTab
        ])
    )

    return ext
})

// 处理编辑器准备就绪事件
const handleReady = (payload) => {
    view.value = payload.view
    state.value = payload.state

    // 初始化光标位置
    if (payload.state) {
        const cursor = payload.state.selection.main.head
        const line = payload.state.doc.lineAt(cursor)
        cursorPosition.value = {
            line: line.number - 1,
            column: cursor - line.from
        }
    }

    emit('ready', payload)
}

// 处理内容变更事件
const handleChange = (val) => {
    code.value = val
    // emit('update:modelValue', val)
    emit('change', val)
}

// 处理焦点事件
const handleFocus = () => {
    emit('focus')
}

// 处理失去焦点事件
const handleBlur = () => {
    emit('blur')
}

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
    if (newVal !== code.value) {
        code.value = newVal
    }
})

// 清空内容
const clearContent = () => {
    code.value = ''
}

// 格式化SQL
const formatSQL = () => {
    if (view.value) {
        // 触发重新格式化事件
        try {
            code.value = format(code.value);
            emit('format', code.value)
        } catch (error) {
            console.error('格式化失败');
        }
    }
}

// 在光标位置插入文本
const insertText = (text) => {
    if (view.value) {
        view.value.dispatch(view.value.state.replaceSelection(text))
        view.value.focus()
    }
}

let dataBaseList = ref([])
const getDataBase = async () => {
    try {
        let res = await getDatabases({})
        dataBaseList.value = res
    } catch {
        ElMessage.error("获取数据库失败")
    }
}

// 新增：根据数据库名称获取数据库详细信息
const getDatabaseInfoByName = (dbName) => {
    if (!dbName) return

    // 在数据库列表中查找匹配的数据库信息
    const dbInfo = dataBaseList.value.find(db => db.name === dbName)
    if (dbInfo) {
        // 将数据库信息复制到 databaseInfo 对象中
        Object.assign(databaseInfo, dbInfo)
        console.log('获取到的数据库信息:', databaseInfo)
    }
}

const getPreviousSteps = async (val) => {
    let params = {
        graphXml: val,
        stepName: form.stepName,
    };
    let res = await previousSteps(params);
    stepList.value = res?.length ? res : [];
};

const openDialog = (data) => {
    // 接收节点信息
    if (data && data.cell) {
        currentCell = data.cell
        currentGraph = data.graph
        currentXml = data.xml
        transName.value = data.transName
        allXmlData = data.allXml // 获取完整的xml 
        console.log("allXml", data.allXml);
        console.log("xml", data.xml);
        parseStepInfoAndPopulateForm(currentXml);
        getPreviousSteps(data.allXml)
        // 将节点当前名称设置到表单中
        form.stepName = data.cell.value || ''
        steptpName.value = data.cell.value
    }
    getDataBase()
    dialogVisible.value = true
}

// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        // 使用 mxUtils 解析 XML 字符串
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 step 元素
        let stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const tableInputElements = stepElements[0];
            // 填充表单字段
            form.stepName = tableInputElements.getAttribute('label') || '';
            form.dataBase = tableInputElements.getAttribute('connection') || '';
            form.allowSimpleConversion = tableInputElements.getAttribute('lazy_conversion_active') === 'Y';
            form.replaceVariables = tableInputElements.getAttribute('variables_active') === 'Y';
            form.insertDataFromStep = tableInputElements.getAttribute('insertDataFromStep') || '';
            form.executeEveryRow = tableInputElements.getAttribute('execute_each_row') === 'Y';
            form.recordLimit = parseInt(tableInputElements.getAttribute('limit')) || 0;
            form.lookup = tableInputElements.getAttribute('lookup') || '';
            // 填充SQL内容
            code.value = decodeURIComponent(tableInputElements.getAttribute('sql') || '');
        }
    } catch (error) {
        console.error('解析stepInfo XML失败:', error);
        ElMessage.error("解析stepInfo XML数据失败");
    }
}

// 更新stepInfo XML中的数据
const updateStepInfoXml = (stepInfoXml) => {
    try {
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        // 查找 step 元素
        const stepElements = xmlDoc.getElementsByTagName('Step');
        if (stepElements.length > 0) {
            const tableInputElements = stepElements[0];
            // 更新属性
            tableInputElements.setAttribute('connection', form.dataBase);
            tableInputElements.setAttribute('label', form.stepName);
            tableInputElements.setAttribute('lazy_conversion_active', form.allowSimpleConversion ? 'Y' : 'N');
            tableInputElements.setAttribute('variables_active', form.replaceVariables ? 'Y' : 'N');
            tableInputElements.setAttribute('insertDataFromStep', form.insertDataFromStep);
            tableInputElements.setAttribute('execute_each_row', form.executeEveryRow ? 'Y' : 'N');
            tableInputElements.setAttribute('limit', form.recordLimit.toString());
            tableInputElements.setAttribute('sql', encodeURIComponent(code.value));
            tableInputElements.setAttribute('partitioning', JSON.stringify({ method: "none", schema_name: "" }));
            tableInputElements.setAttribute('lookup', form.lookup);
            // 返回更新后的XML
            return mxUtils.getPrettyXml(tableInputElements);
        }

        return stepInfoXml; // 如果没有找到step元素，返回原始XML
    } catch (error) {
        console.error('更新stepInfo XML失败:', error);
        ElMessage.error("更新stepInfo XML数据失败");
        return stepInfoXml;
    }
}
const handleConfirm = () => {
    if (currentCell && currentGraph && currentXml) {
        // 更新节点名称
        currentGraph.getModel().setValue(currentCell, form.stepName);

        // 更新节点的 step（XML结构）
        currentXml = updateStepInfoXml(currentXml);
        // 将更新后的 XML 数据传递回父组件
        emit('update-step', {
            cell: currentCell,
            updatedXml: currentXml
        });
    }
    dialogVisible.value = false
}

const steptpName = ref('')
const previewDataList = ref(null)

// 预览sql
const getPreview = async () => {
    if (allXmlData) {
        // 解析完整 XML
        const allXmlDoc = mxUtils.parseXml(allXmlData);
        let stepXml = updateStepInfoXml(currentXml);
        // 查找并更新当前步骤的 XML
        const stepNodes = allXmlDoc.getElementsByTagName('Step');
        for (let i = 0; i < stepNodes.length; i++) {
            const stepNode = stepNodes[i];
            // 通过节点 ID 或名称匹配当前编辑的节点
            if (stepNode.getAttribute('label') === currentCell.value ||
                stepNode.getAttribute('name') === currentCell.value) {

                // 解析更新后的当前节点 XML
                const updatedStepDoc = mxUtils.parseXml(stepXml);
                const updatedStepNode = updatedStepDoc.documentElement;

                // 将更新后的节点导入到完整 XML 文档中
                const importedNode = allXmlDoc.importNode(updatedStepNode, true);

                // 替换节点
                stepNode.parentNode.replaceChild(importedNode, stepNode);
                break;
            }
        }

        // 更新完整 XML 数据
        allXmlData = mxUtils.getPrettyXml(allXmlDoc.documentElement);
    }
    let params = {
        graphXml: allXmlData,
        stepName: form.stepName,
        rowLimit: 100
    }
    let res = await previewData(params)
    previewDataList.value = res
    previewDialogVisible.value = true
}

const onDatabaseNodeSelect = async (val) => {
    let params = {
        graphXml: currentXml,
        databaseName: databaseInfo.name,
        schema: val.nodeId,
        table: val.text
    }
    try {
        let res = await tableFields(params)
        if (res && Array.isArray(res)) {
            // 将 [{name:"data"}] 格式转换为 SQL 查询字段列表
            const fieldNames = res.map(item => item.name);
            const fieldsString = fieldNames.join(', ');
            // 构造 SQL 查询语句
            const sqlQuery = `SELECT ${fieldsString} FROM ${params.schema}.${params.table}`;
            // 更新编辑器中的 SQL 内容
            code.value = sqlQuery;
            formatSQL()
        }
    } catch {
        ElMessage.error("获取失败")
    }
}

// 暴露方法给父组件使用
defineExpose({
    // 获取CodeMirror视图实例
    getCodemirrorView: () => view.value,

    // 获取CodeMirror状态实例
    getCodemirrorState: () => state.value,

    // 打开对话框
    openDialog,

    // 获取当前SQL内容
    getSQL: () => code.value,

    // 设置SQL内容
    setSQL: (sql) => {
        code.value = sql
    }
})
</script>

<style lang="scss" scoped>
.sql-editor-container {
    display: flex;
    flex-direction: column;
    height: 600px;
    overflow-y: auto;
}

.toolbar {
    padding: 10px 0;
    border-bottom: 1px solid #eee;

    .el-button {
        margin-right: 10px;
    }
}

.sql-editor {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;

    :deep(.cm-editor) {
        height: 100%;
    }

    :deep(.cm-scroller) {
        font-family: 'Consolas', 'Courier New', monospace;
    }
}

.editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;

    .status-bar {
        font-size: 14px;
        color: #666;
    }
}
</style>