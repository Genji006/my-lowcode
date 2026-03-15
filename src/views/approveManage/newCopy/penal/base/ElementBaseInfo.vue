<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.native.prevent>
      <el-form-item label="ID">
        <!-- :disabled="idEditDisabled || elementBaseInfo.$type === 'bpmn:Process'" -->
        <el-input v-model="elementBaseInfo.id" :disabled="false" @change="updateBaseInfo('id')" />
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="elementBaseInfo.name" clearable @change="updateBaseInfo('name')" />
      </el-form-item>
      <!--流程的基础属性-->
      <template v-if="elementBaseInfo.$type === 'bpmn:Process'">
        <el-form-item label="版本标签">
          <el-input v-model="elementBaseInfo.versionTag" clearable @change="updateBaseInfo('versionTag')" />
        </el-form-item>
        <el-form-item label="可执行">
          <el-switch v-model="elementBaseInfo.isExecutable" active-text="是" inactive-text="否" @change="updateBaseInfo('isExecutable')" />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Props
const props = defineProps({
  businessObject: Object,
  type: String,
  idEditDisabled: {
    type: Boolean,
    default: true
  }
})

// 响应式数据
const elementBaseInfo = reactive({})
let bpmnElement = null

// 重置基础信息
const resetBaseInfo = () => {
  bpmnElement = window?.bpmnInstances?.bpmnElement
  if (bpmnElement) {
    // 清空并更新 elementBaseInfo
    Object.keys(elementBaseInfo).forEach(key => delete elementBaseInfo[key])
    Object.assign(elementBaseInfo, JSON.parse(JSON.stringify(bpmnElement.businessObject)))
  }
}

// 更新基础信息
const updateBaseInfo = (key) => {
  const attrObj = Object.create(null)
  attrObj[key] = elementBaseInfo[key]
  if (key === "id" && bpmnElement) {
    window.bpmnInstances.modeling.updateProperties(bpmnElement, {
      id: elementBaseInfo[key],
      di: { id: `${elementBaseInfo[key]}_di` }
    })
  } else if (bpmnElement) {
    window.bpmnInstances.modeling.updateProperties(bpmnElement, attrObj)
  }
}

// 监听 businessObject 变化
watch(() => props.businessObject, (newVal) => {
  if (newVal) {
    nextTick(() => resetBaseInfo())
  }
}, { immediate: false, deep: true })

// 组件挂载时初始化
onMounted(() => {
  resetBaseInfo()
})

// 组件卸载前清理
onBeforeUnmount(() => {
  bpmnElement = null
})

// 暴露组件名称和方法（如果需要）
defineExpose({
  name: "ElementBaseInfo",
  resetBaseInfo,
  updateBaseInfo
})
</script>