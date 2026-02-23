<template>
    <div class="editor-container" :style="{ width: width, height: height }">
        <vue-monaco-editor v-model:value="code" theme="vs" :options="editorOptions" language="javascript"
            @mount="handleMount" />
    </div>
</template>

<script setup>
import { ref, watch, shallowRef } from 'vue'

const props = defineProps({
    modelValue: String,
    // === 新增：支持传入宽高，带默认值 ===
    width: {
        type: String,
        default: '100%'
    },
    height: {
        type: String,
        default: '300px'
    }
})

const emit = defineEmits(['update:modelValue'])

const code = ref(props.modelValue || '')
const editorRef = shallowRef()

// 编辑器配置
const editorOptions = {
    automaticLayout: true, // 这一行非常关键，确保容器大小变动时编辑器会自动重绘
    formatOnType: true,
    formatOnPaste: true,
    minimap: { enabled: false },
    lineNumbers: 'on',
    fontSize: 12,
    tabSize: 2,
    scrollBeyondLastLine: false,
    diagnosticsOptions: {
        noSemanticValidation: false,
        noSyntaxValidation: false,
    }
}

watch(() => props.modelValue, (newVal) => {
    if (newVal !== code.value) {
        code.value = newVal || ''
    }
})

watch(code, (newVal) => {
    emit('update:modelValue', newVal)
})

const handleMount = (editor) => {
    editorRef.value = editor
}
</script>

<style scoped>
.editor-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
}
</style>