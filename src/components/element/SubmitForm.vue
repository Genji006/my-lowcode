<template>
  <el-form ref="formRef" :model="modelValue" :rules="rules" :label-width="labelWidth" :inline="inline" :label-position="labelPosition" v-bind="formProps" :class="formClass">
    <template v-for="item in items" :key="item.prop">
      <el-form-item :label="item.label" :prop="item.prop" v-bind="item.formItemAttrs" :style="item.formWidth??''" v-if="checkShow(item)">
        <!-- 支持插槽自定义表单项 -->
        <template v-if="$slots[item.prop]">
          <slot :name="item.prop" v-bind="item" />
        </template>
        <template v-else-if="item.component === 'el-select'">
          <el-select v-model="modelValue[item.prop]" v-bind="filterAttrs(item.attrs)" :style="item.style" @change="val => handleSelectChange(val, item)">
            <el-option v-for="opt in item.options || []" :key="getOptionValue(opt, item)" :label="item.montageName ? ( getOptionValue(opt, item) + '/' + getOptionLabel(opt, item)) :getOptionLabel(opt, item) " :value="getOptionValue(opt, item)" />
          </el-select>
        </template>
        <template v-else-if="item.component === 'el-radio-group'">
          <el-radio-group v-model="modelValue[item.prop]" v-bind="item.attrs">
            <el-radio v-for="opt in item.options || []" :key="getOptionValue(opt, item)" :label="getOptionLabel(opt, item)" :value="getOptionValue(opt, item)" :disabled="item.disabled">{{ getOptionLabel(opt, item) }}</el-radio>
          </el-radio-group>
        </template>
        <template v-else>
          <component :is="item.component || 'el-input'" v-model="modelValue[item.prop]" v-bind="{maxlength: 100,'show-word-limit': true,...item.attrs
            }" :style="item.style" />
        </template>
      </el-form-item>
    </template>
    <el-form-item v-if="showAction" style="width: 100%;">
      <slot name="action">
        <div class="form-btns-center">
          <concel @click="onCancel"> 取消 </concel>
          <confirm @click="onSubmit('')"> {{ buttonName }} </confirm>
          <confirm @click="onSubmit('last')" v-if="lastBtnName"> {{ lastBtnName }} </confirm>
        </div>
      </slot>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from "element-plus";
import confirm from "./Confirm.vue"
import concel from "./Cancel.vue"

const props = defineProps({
  modelValue: { type: Object, required: true },
  items: { type: Array, required: true }, // [{ label, prop, component, attrs, options, ... }]
  rules: { type: Object, default: () => ({}) },
  labelWidth: { type: String, default: 'auto' },
  inline: { type: Boolean, default: false },
  formProps: { type: Object, default: () => ({}) },
  showAction: { type: Boolean, default: true },   //  是否展示下方按钮
  buttonName: { type: String, default: '保存' },
  // optionValue: { type: String, default: '' }, //  选项的值
  // optionLabel: { type: String, default: '' }, //  选项的标签
  labelPosition: { type: String, default: '' }, //  标签位置
  lastBtnName: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'submit', 'reset', 'cancel'])

const formRef = ref(null)

function onSubmit(type) {
  if (formRef.value) {
    formRef.value.validate(valid => {
      if (valid) {
        emit('submit', props.modelValue, props.buttonName, type)
      } else {
        // ElMessage.warning('请您填写表单必填信息')
      }
    })
  }
}

function checkShow(item) {
  // 如果没有配置 show 属性，默认显示
  if (item.show === undefined) {
    return true;
  }
  // 如果配置了函数，则将当前表单的 modelValue 传给函数执行（适用于动态联动）
  if (typeof item.show === 'function') {
    return item.show(props.modelValue);
  }
  // 否则直接返回布尔值
  return !!item.show;
}
// function onReset() {
//   if (formRef.value) {
//     formRef.value.resetFields()
//     emit('reset')
//   }
// }

function onCancel() {
  emit('cancel')
}

// 自动推断常用选项组件
// function getDefaultOptionComponent(component) {
//   if (component === 'el-select') return 'el-option'
//   if (component === 'el-radio-group') return 'el-radio'
//   if (component === 'el-checkbox-group') return 'el-checkbox'
//   return 'el-option'
// }
function handleSelectChange(val, item) {
  // 如果父组件在 item.attrs 里传了 onChange，就调用
  if (typeof item.attrs?.onChange === 'function') {
    item.attrs.onChange(val, item)
  }
}


function filterAttrs(attrs) {
  // 过滤掉 onChange，防止 el-select 直接绑定
  const { onChange, ...rest } = attrs || {}
  return rest
}

// 获取 option 的 value，优先用 item.optionValue，再用 value、dictValue、optionValue
function getOptionValue(opt, item) {
  if (item.optionValue && opt[item.optionValue] !== undefined) return opt[item.optionValue]
  return opt.value ?? opt.dictValue ?? opt.label ?? opt.dictLabel ?? opt.optionValue
}
// 获取 option 的 label，优先用 item.optionLabel，再用 label、dictLabel、optionLabel
function getOptionLabel(opt, item) {
  // console.log(opt, 'opt');
  if (item.optionLabel && opt[item.optionLabel] !== undefined) return opt[item.optionLabel]
  return opt.label ?? opt.dictLabel ?? opt.value ?? opt.dictValue ?? opt.optionLabel
}






// 暴露表单方法给父组件
defineExpose({
  validate: (...args) => formRef.value?.validate(...args),
  resetFields: (...args) => formRef.value?.resetFields(...args),
  clearValidate: (...args) => formRef.value?.clearValidate(...args)
})
</script>

<style  scoped>
.form-btns-center {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 0px;
}
</style>

