<template>
  <div>
    <el-form>
      <el-form-item v-for="(item, index) in listPath" :key="item.value" :label="'类型' + (index + 1) + '：'">
        <div style="display: flex;">
          <el-input v-model="item.label" placeholder="标签" style="margin-left: 15px;" />
          <el-button type="danger" style="margin-left: 15px;" @click="removeItem(index)">删除</el-button>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addItem">添加项</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { generateRandomId } from '@/components/table/table.js'

// 定义事件
const emit = defineEmits(['update'])
const listPath = ref([])
// 定义props
const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

watch(props.component.bind.listPath, (newVal) => {
  listPath.value = newVal
}, { immediate: true, deep: true })

const addItem = () => {
  listPath.value.push({ label: '', value: generateRandomId() })
}

const removeItem = (index) => {
  listPath.value.splice(index, 1)
}


</script>

<style>
</style>