<template>
  <div
    :id="`editorContainer${id}`"
    style="height: 300px; width: 100%"
    ref="editorContainer"
  ></div>
</template>

<script setup>
import { editorConfig } from "./editorConfif.js";
import * as monaco from "monaco-editor/esm/vs/editor/editor.main.js";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import { ref, onMounted, nextTick, toRaw, onUnmounted, watch } from "vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: "",
  },
  modelCode: {
    type: String,
    default: "【模块字段】",
  },
  modelName: {
    type: String,
    default: "【模块名称】",
  },
  fieldName: {
    type: String,
    default: "【属性名称】",
  },
  fieldCode: {
    type: String,
    default: "【属性名】",
  },
  language: {
    type: String,
    default: "javascript",
  },
});

const emit = defineEmits(["update:value"]);

const editor = ref(null);
const editorContainer = ref(null);

const createEditor = () => {
  // 确保容器存在
  if (!editorContainer.value) {
    console.error("Editor container not found");
    return;
  }

  try {
    // 销毁已存在的编辑器实例
    if (editor.value) {
      disposeEditor();
    }

    // 创建编辑器实例
    editor.value = monaco.editor.create(editorContainer.value, {
      ...editorConfig,
      value: props.value
        ? props.value + ""
        : `if (!window.【模块字段】.【属性名】) {\n    window.missingFields.push('请输入【属性名】')\n}`,
      language: props.language,
    });

    // 监听编辑器内容变化
    let timeout = null;
    editor.value.onDidChangeModelContent(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const content = toRaw(editor.value).getValue();
        console.log("content", content.length);
        emit("update:value", content);
      }, 200);
    });
  } catch (error) {
    console.error("Error creating editor:", error);
  }
};

const disposeEditor = () => {
  if (editor.value && typeof editor.value.dispose === "function") {
    try {
      toRaw(editor.value).dispose();
      editor.value = null;
    } catch (error) {
      console.error("Error disposing editor:", error);
    }
  }
};

// 删除有问题的旧监听器，只保留下面的优化版本

// 删除有问题的监听器，重写为更安全的版本

// 监听外部value变化 - 只在真正需要时更新，并且保存/恢复光标位置
watch(
  () => props.value,
  (newValue) => {
    if (!editor.value || newValue === undefined) return;
    const currentValue = toRaw(editor.value).getValue();
    // 只有当外部value真正变化且与编辑器内容不同时才更新
    if (newValue !== currentValue) {
      const position = toRaw(editor.value).getPosition();
      toRaw(editor.value).setValue(newValue);
      if (position) {
        toRaw(editor.value).setPosition(position);
      }
    }
  },
  { deep: true, immediate: false }
);

// 监听模块和字段变化 - 只在编辑器为空或内容是默认模板时更新
watch(
  [() => props.fieldCode, () => props.modelCode],
  () => {
    if (!editor.value || !props.modelCode || !props.fieldCode || props.modelCode.length>1 || props.fieldCode.length>1) return;
    const newTemplate = `if (!window.${props.modelCode}.${props.fieldCode}) {\n    window.missingFields.push('${props.modelName}-${props.fieldName}')\n}`;
    toRaw(editor.value).setValue(newTemplate);
  },
  { deep: true, immediate: false }
);
// // 监听 language 属性变化
// watch(
//   () => props.language,
//   (newLanguage) => {
//     if (editor.value) {
//       monaco.editor.setModelLanguage(editor.value.getModel(), newLanguage);
//     }
//   }
// );

onMounted(() => {
  nextTick(() => {
    createEditor();
  });
});

onUnmounted(() => {
  disposeEditor();
});
</script>

<style scoped>
:deep(.monaco-editor) {
  width: 100% !important;
}
</style>
