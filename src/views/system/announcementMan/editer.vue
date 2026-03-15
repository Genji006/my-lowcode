<template>
    <div class="editor-wrapper" :class="{ 'editor-disabled': disabled }"
        style="border: 1px solid #ccc; width: 98%; box-sizing: border-box;">
        <div ref="toolbarContainer" style="border-bottom: 1px solid #ccc"
            :style="{ display: disabled ? 'none' : 'block' }"></div>

        <div ref="editorContainer" style="height: 400px; overflow-y: hidden;"></div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { createEditor, createToolbar } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

// 定义 Props
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    mode: {
        type: String,
        default: 'default'
    },
    toolbarConfig: {
        type: Object,
        default: () => ({})
    },
    editorConfig: {
        type: Object,
        default: () => ({
            placeholder: '',
        })
    },
    // 接收父组件传入的禁用状态
    disabled: {
        type: Boolean,
        default: false
    }
})

const emits = defineEmits(['update:modelValue', 'onChange', 'onCreated'])

const editorRef = shallowRef()
const toolbarContainer = ref()
const editorContainer = ref()

onMounted(() => {
    const editor = createEditor({
        selector: editorContainer.value,
        html: props.modelValue,
        config: {
            ...props.editorConfig,
            onChange(editor) {
                const html = editor.getHtml()
                emits('update:modelValue', html)
                emits('onChange', editor)
            }
        },
        mode: props.mode,
    })

    editorRef.value = editor

    createToolbar({
        editor,
        selector: toolbarContainer.value,
        config: props.toolbarConfig,
        mode: props.mode,
    })

    // --- 修改点 2: 初始化时检查 disabled 状态 ---
    if (props.disabled) {
        editor.disable()
    }

    emits('onCreated', editor)
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    const editor = editorRef.value
    if (editor && newVal !== editor.getHtml()) {
        editor.setHtml(newVal)
    }
})

// --- 修改点 3: 监听 disabled 变化，动态切换状态 ---
watch(() => props.disabled, (val) => {
    const editor = editorRef.value
    if (editor == null) return

    if (val) {
        editor.disable() // 禁用
    } else {
        editor.enable()  // 启用
    }
})

onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})
</script>

<style scoped>
@import '@wangeditor/editor/dist/css/style.css';

.editor-wrapper {
    /* 确保容器本身是块级元素，独占一行 */
    display: block;
    width: 97%;
}

/* 禁用状态下的样式修复 */
.editor-disabled {
    background-color: #f5f7fa;
    /* 灰色背景 */
    cursor: not-allowed;
}

/* 强制覆盖 WangEditor 内部可能的默认样式 */
.editor-disabled :deep(.w-e-text-container) {
    background-color: transparent;
    /* 让背景色透出来 */
}

/* 关键：防止内容在禁用模式下被异常压缩 */
.editor-disabled :deep(.w-e-scroll) {
    width: 100% !important;
}
</style>