<template>
  <div class="checkbox-flat">
    <div v-for="item in flatItems" :key="getItemValue(item)" class="checkbox-item">
      <span v-if="hasChildren(item)" class="expand-btn" @click="toggleExpand(getItemValue(item))">
        {{ isExpanded(getItemValue(item)) ? '▼' : '▶' }}
      </span>
      <span v-else class="expand-btn"></span>
      <input type="checkbox" :checked="isChecked(item)" @change="handleCheck(item)" class="flat-checkbox" />
      <span class="item-label">{{ getItemLabel(item) }}</span>

      <!-- 子级自定义内容插槽 -->
      <div v-if="hasChildren(item) && isExpanded(getItemValue(item))" class="item-children">
        <slot name="children" :item="item" :level="1"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  Prop: {
    type: Object,
    default: () => {
      return {
        label: 'label',
        value: 'id',
        children: 'children'
      };
    }
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['check', 'update:modelValue']);

// 展开状态映射
const expandedMap = ref({});

// 切换展开状态
function toggleExpand(value) {
  expandedMap.value = {
    ...expandedMap.value,
    [value]: !expandedMap.value[value]
  };
}

// 检查是否展开
function isExpanded(value) {
  return expandedMap.value[value] !== undefined ? expandedMap.value[value] : props.defaultExpanded;
}

// 只渲染第一层项目
const flatItems = computed(() => {
  return props.items;
});

// 获取项目的标签
function getItemLabel(item) {
  return item[props.Prop.label];
}

// 获取项目的值
function getItemValue(item) {
  return item[props.Prop.value];
}

// 获取项目的子项
function getItemChildren(item) {
  return item[props.Prop.children] || [];
}

// 检查项目是否有子级
function hasChildren(item) {
  const children = getItemChildren(item);
  return children && Array.isArray(children) && children.length > 0;
}

// 检查项目是否被勾选
function isChecked(item) {
  return props.modelValue.includes(getItemValue(item));
}

// 处理复选框变化
function handleCheck(item) {
  emit('check', item);
  // 计算新的勾选状态
  const itemValue = getItemValue(item);
  const isChecked = props.modelValue.includes(itemValue);
  let newModelValue;
  if (isChecked) {
    // 如果已经勾选，则移除
    newModelValue = props.modelValue.filter(value => value !== itemValue);
  } else {
    // 如果未勾选，则添加
    newModelValue = [...props.modelValue, itemValue];
  }
  // 更新modelValue
  emit('update:modelValue', newModelValue);
}
</script>

<style scoped>
.checkbox-flat{
  height: 100%;
  overflow: auto;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* .checkbox-item:hover {
  background-color: #f5f7fa;
  padding-left: 8px;
  border-radius: 4px;
} */

.flat-checkbox {
  margin: 0;
  accent-color: #409eff;
  cursor: pointer;
}

.item-label {
  flex: 1;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.expand-btn {
  width: 16px;
  cursor: pointer;
  font-size: 12px;
  width: 16px;
  text-align: center;
  color: #909399;
  transition: color 0.2s ease;
}

.expand-btn:hover {
  color: #409eff;
}

/* 子级内容样式 */
.item-children {
  width: 100%;
  margin-left: 24px;
}
</style>