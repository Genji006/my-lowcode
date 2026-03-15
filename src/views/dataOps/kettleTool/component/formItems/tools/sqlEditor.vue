<template>
    <div class="sql-editor-container" :class="{ disabled: props.disabled }">
        <div class="editor-wrapper">
            <codemirror v-model="localCode" :placeholder="placeholder" :style="{ height: height }"
                :indent-with-tab="true" :tab-size="2" :extensions="extensions" @ready="handleReady"
                @change="handleChange" :readonly="disabled" />
        </div>

        <!-- <div class="status-bar">
            <div class="status-left">
                <span>行数: {{ lineCount }}</span>
                <span class="divider">|</span>
                <span>方言: {{ dialect }}</span>
            </div>
            <div class="shortcuts">
                <span class="tip" title="格式化代码"><kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd> 格式化</span> -->
                <!-- <span class="tip" title="执行查询"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> 运行</span> -->
            <!-- </div>
        </div> -->
    </div>
</template>

<script setup>
import { ref, computed, shallowRef, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { sql } from '@codemirror/lang-sql'
import { keymap } from '@codemirror/view'
import { ElMessage } from 'element-plus'
import { EditorState } from '@codemirror/state'
import { format } from 'sql-formatter' // 引入专业格式化库

// --- Props & Emits ---
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    height: {
        type: String,
        default: '400px'
    },
    placeholder: {
        type: String,
        default: '请输入 SQL 语句...'
    },
    // 支持指定 SQL 方言: 'mysql', 'postgresql', 'sqlite', 'standard' 等
    dialect: {
        type: String,
        default: 'mysql'
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'submit', 'change'])

// --- 内部状态 ---
const localCode = ref(props.modelValue)
const view = shallowRef()

// 监听父组件传入值的变化 (实现 v-model 的单向数据流部分)
watch(() => props.modelValue, (newVal) => {
    if (newVal !== localCode.value) {
        localCode.value = newVal
    }
})

// 1. 内容变化时，同步给父组件
const handleChange = (val) => {
    emit('update:modelValue', val)
    emit('change', val)
}

// 2. 完整的 SQL 格式化方法
const formatSql = () => {
    try {
        // 使用 sql-formatter 进行格式化
        const formatted = format(localCode.value, {
            language: props.dialect, // 使用 props 传入的方言
            tabWidth: 2,             // 缩进 2 空格
            keywordCase: 'upper',    // 关键字转大写 (SELECT, FROM...)
            linesBetweenQueries: 2,  // 多个查询语句之间空2行
        })

        if (formatted !== localCode.value) {
            localCode.value = formatted
            emit('update:modelValue', formatted)
            ElMessage.success('代码已格式化')
        }
    } catch (error) {
        console.error(error)
        ElMessage.error('格式化失败: SQL 语法可能存在错误')
    }
    return true
}

// 3. 运行 (Ctrl + Enter)
const runSql = () => {
    if (!localCode.value.trim()) {
        ElMessage.warning('SQL 内容不能为空')
        return true
    }
    // 触发 submit 事件供父组件调用 API
    emit('submit', localCode.value)
    return true
}

// --- CodeMirror 配置 ---
const extensions = computed(() => {
    const baseExtensions = [
        sql(), // SQL 语法高亮
        keymap.of([
            {
                key: 'Shift-Alt-f', // 绑定快捷键
                run: formatSql,
                preventDefault: true
            }
        ])
    ]

    // 如果禁用，则添加只读扩展
    if (props.disabled) {
        baseExtensions.push(EditorState.readOnly.of(true))
    }

    return baseExtensions
})

const handleReady = (payload) => {
    view.value = payload.view
}

const lineCount = computed(() => {
    return localCode.value ? localCode.value.split('\n').length : 0
})
</script>

<style scoped>
.sql-editor-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* 防止圆角溢出 */
}

.sql-editor-container.disabled {
    opacity: 0.6;
    pointer-events: none;
    background-color: #f5f7fa;
}

.editor-wrapper {
    font-size: 14px;

    /* 移除 CodeMirror 默认的聚焦边框，由外层容器控制 */
    :deep(.cm-editor) {
        outline: none;
    }

    :deep(.cm-scroller) {
        font-family: 'Fira Code', 'Consolas', monospace;
    }

    /* 调整光标颜色 */
    :deep(.cm-cursor) {
        border-left-color: #409eff;
    }
}

/* 底部状态栏美化 */
.status-bar {
    background-color: #f5f7fa;
    border-top: 1px solid #e4e7ed;
    padding: 6px 12px;
    font-size: 12px;
    color: #909399;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
}

.status-left {
    display: flex;
    align-items: center;
}

.divider {
    margin: 0 8px;
    color: #dcdfe6;
}

.shortcuts {
    display: flex;
    gap: 15px;
}

.tip {
    cursor: help;
    display: flex;
    align-items: center;
}

/* 键盘按键样式模拟 */
kbd {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    color: #333;
    display: inline-block;
    font-family: monospace;
    font-size: 11px;
    line-height: 1;
    margin: 0 2px;
    padding: 2px 4px;
    white-space: nowrap;
}
</style>