<template>
  <div class="panel-tab__content">
    <div class="element-property input-property">
      <div class="element-property__label">元素文档：</div>
      <div class="element-property__value">
        <el-input type="textarea" v-model="documentation" size="mini" resize="vertical" :autosize="{ minRows: 2, maxRows: 4 }" @input="updateDocumentation" @blur="updateDocumentation" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';

// 定义props
const props = defineProps({
  id: {
    type: String,
    default: ''
  }
});

// 响应式数据
const documentation = ref('');
let bpmnElement = null;

// 监听id变化
watch(() => props.id, (newId) => {
  if (newId && newId.length) {
    nextTick(() => {
      const documentations = window.bpmnInstances.bpmnElement?.businessObject?.documentation;
      documentation.value = documentations && documentations.length ? documentations[0].text : '';
    });
  } else {
    documentation.value = '';
  }
}, { immediate: true, deep: true });

// 更新文档内容
function updateDocumentation() {
  // 确保bpmnElement是当前元素
  if (!bpmnElement || bpmnElement.id !== props.id) {
    bpmnElement = window.bpmnInstances.elementRegistry.get(props.id);
  }

  // 创建文档对象并更新属性
  const documentationObj = window.bpmnInstances.bpmnFactory.create("bpmn:Documentation", {
    text: documentation.value
  });

  window.bpmnInstances.modeling.updateProperties(bpmnElement, {
    documentation: [documentationObj]
  });
}

// 组件销毁前清理
onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>