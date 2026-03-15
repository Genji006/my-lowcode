<template>
  <div :class="`${formClass ? 'formPropsClass' : 'formContentCss cardShadow'}`">
    <el-form :model="modelValue" ref="formRef" :label-width="labelWidth" v-bind="formProps" :inline="inline">
      <template v-for="item in items" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <template v-if="item.component === 'el-select'">
            <el-select v-model="modelValue[item.prop]" v-bind="item.attrs" filterable :style="item.style">
              <el-option v-for="opt in item.options || []" :key="getOptionValue(opt, item)"
                :label="item.montageName ? (getOptionValue(opt, item) + '/' + getOptionLabel(opt, item)) : getOptionLabel(opt, item)"
                :value="getOptionValue(opt, item)" />
            </el-select>
          </template>
          <template v-else-if="item.component === 'el-tree-select'">
            <el-tree-select v-model="modelValue[item.prop]" v-bind="item.attrs" :style="item.style">
              <template #default="{ node }">
                <el-tooltip effect="dark" :content="node.label" placement="top" :show-after="500"
                  popper-class="custom-tree-tooltip">
                  <span class="custom-tree-node">{{ node.label }}</span>
                </el-tooltip>
              </template>
            </el-tree-select>
          </template>
          <template v-else>
            <component :is="item.component || 'el-input'" v-model="modelValue[item.prop]" v-bind="item.attrs"
              :style="item.style" />
          </template>
          <slot :name="item.prop"></slot>
        </el-form-item>
      </template>
      <el-form-item>
        <confirm type="primary" @click="onSearch">
          <el-icon>
            <Search />
          </el-icon> 查询
        </confirm>
        <concel @click="onReset">
          <el-icon>
            <RefreshRight />
          </el-icon> 重置
        </concel>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import confirm from "./Confirm.vue"
import concel from "./Cancel.vue"

const props = defineProps({
  modelValue: { type: Object, required: true },
  items: { type: Array, required: true }, // [{ label, prop, component, attrs, options, style }]
  formProps: { type: Object, default: () => ({}) },
  labelWidth: { type: String, default: 'auto' },
  formClass: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'searchVal', 'reset'])

const formRef = ref(null)

function onSearch() {
  emit('searchVal', props.modelValue)
}

function onReset() {
  formRef.value.resetFields()
  emit('reset')
}

// 获取 option 的 value，优先用 item.optionValue，再用 value、dictValue
function getOptionValue(opt, item) {
  if (item.optionValue && opt[item.optionValue] !== undefined) return opt[item.optionValue]
  return opt.value ?? opt.dictValue ?? opt.label ?? opt.dictLabel
}
// 获取 option 的 label，优先用 item.optionLabel，再用 label、dictLabel
function getOptionLabel(opt, item) {
  if (item.optionLabel && opt[item.optionLabel] !== undefined) return opt[item.optionLabel]
  return opt.label ?? opt.dictLabel ?? opt.value ?? opt.dictValue
}
</script>
<style lang="scss" scoped>
.custom-tree-node {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block; // 确保占满宽度触发截断
}

.custom-tree-tooltip {
  max-width: 250px;
  /* 限制悬浮框的最大宽度，避免文字太长撑满屏幕 */
  line-height: 1.5;
  /* 增加行高，多行文本阅读更舒适 */
  word-break: break-all;
  /* 允许在单词内换行 */
}
</style>
<style lang="scss">
.formPropsClass {
  width: 100%;
  height: 100%;
  padding: 12px 16px 0 16px;
  box-sizing: border-box;

  .el-form {
    display: flex;
    flex-wrap: wrap;
  }

  .el-form-item {
    // margin-left: 0px !important;
    margin: 0 24px 12px 0 !important;
  }
}

.formContentCss {
  width: 100%;
  height: 100%;
  padding: 12px 16px 0 16px;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  .el-form {
    display: flex;
    flex-wrap: wrap;
  }

  .el-form-item {
    // margin-left: 0px !important;
    margin: 0 24px 12px 0 !important;
  }
}
</style>