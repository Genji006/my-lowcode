<template>
  <div class="formExpand cardShadow">
    <!-- {{ formProps }}111{{ items }}222{{ modelValue}} }} -->
      <!-- {{ items }}{{ formProps.isInline }} -->
  <div v-if="formProps.showTitle"  :style="{ height: formProps.titleHeight,lineHeight: formProps.titleHeight,color: formProps.titleColor,fontSize: formProps.titlefontSize,textAlign: formProps.titlePosition }">{{ formProps.titleText }}</div>
    <!-- 整个表单的loading遮罩 -->
    <div v-if="loading" class="form-loading-mask">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
    <el-form :model="modelValue" ref="formRef" :label-width="formProps.labelWidth||'100px'" :label-position="formProps.labelPosition||'left'" v-bind="formProps" :inline="formProps.isInline||false">
      <template v-for="item in items" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop" :rules="getValidationRules(item)">
          <template v-if="item.component === 'el-date-picker' && (item.datePickerType == 'quarter' || item.datePickerType == 'quarterrange')" >
            <el-quarter-picker @change="getQuart" ref="quaRef" v-model="modelValue[item.prop]" :datePickerType="item.datePickerType" :style="{width:formProps.isInline ? (item.width || '100%') : '100%'}"/>
          </template>
          <template v-else-if="item.component === 'el-radio-date'">
            <radioData v-model="modelValue[item.prop]" :defaultType="item.defaultType" :attrs="item.attrs"  :ref="el => setRadioDataRef(el, item.prop)" :style="{width:formProps.isInline ? (item.width || '100%') : '100%'}"></radioData>
          </template>
          <template v-else-if="item.component === 'el-select'">
            <el-select v-model="modelValue[item.prop]" v-bind="item.attrs" :style="{width:formProps.isInline ? (item.width || '100%') : '100%'}">
              <el-option v-for="opt in item.options || []" :key="getOptionValue(opt, item)" :label="getOptionLabel(opt, item)" :value="getOptionValue(opt, item)" />
            </el-select>
          </template>
          <template v-else-if="item.component === 'el-select-v2'">
             <el-select-v2 v-model="modelValue[item.prop]" v-bind="item.attrs" :style="{width:formProps.isInline ? (item.width || '100%') : '100%'}" filterable clearable :options="item.options || []" />
          </template>
          <template v-else>
            <component :is="item.component || 'el-input'" v-model="modelValue[item.prop]" v-bind="item.attrs" :style="{width:formProps.isInline ? (item.width || '100%') : '100%'}" />
          </template>
          <slot :name="item.prop"></slot>
        </el-form-item>
      </template>
      <el-form-item>
        
      </el-form-item>
     <el-form-item>
       <confirm type="primary" @click="onSave" :loading="loading">
          <!-- <el-icon>
            <Search />
          </el-icon>  -->
          {{ formProps.saveText || '保存'}}
        </confirm>
        <concel @click="onReset">
          <!-- <el-icon>
            <RefreshRight />
          </el-icon> -->
          {{ formProps.cancleText || '取消' }}
        </concel>
        
  </el-form-item> 
    </el-form>
   
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import confirm from "./Confirm.vue"
import concel from "./Cancel.vue"
import ElQuarterPicker from './ElQuarterPicker.vue'
import radioData from './radioDataC.vue'
import {fieldValidate}  from '@/views/tool/setPage/s_component/index.js'
import { Loading, Search, RefreshRight } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  items: { type: Array, required: true }, // [{ label, prop, component, attrs, options, style }]
  formProps: { type: Object, default: () => ({}) },
  labelWidth: { type: String, default: '' }
})

const quaRef = ref(null)

const getQuart = (date) => {
  // console.log(date,"<====v-date");
}

const items = computed(() => props.items)   // 监听


const emit = defineEmits(['update:modelValue', 'searchVal', 'reset'])

const formRef = ref(null)
const loading = ref(false) // 添加loading状态变量

// 缓存验证规则列表，避免重复调用fieldValidate()
const validateItems = fieldValidate();

// 生成验证规则
const getValidationRules = (item) => {
  console.log(item, 'item11111111111111111111111')
  const rules = []
  
  // 必填验证
  if (item.isRequired) {
    rules.push({ required: true, message: `${item.label}不能为空`, trigger: 'blur' })
  }
  
  // 正则表达式验证
  if (item.regular) {
    // 查找item.regular与value匹配的项
    const matchedItem = validateItems.find(validateItem => validateItem.value === item.regular);
    // 如果找到匹配项，使用其pattern；否则使用原regular值
    const pattern = matchedItem ? matchedItem.pattern : item.regular;
    console.log('pattern11111111111111111', pattern)
    rules.push({ 
      pattern: pattern, 
      message: `${item.label}格式不正确`, 
      trigger: 'blur' 
    })
  }
  
  return rules
}

function onSave() {
  loading.value = true; // 开始加载
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log(props.modelValue, "props.modelValue查询");
      emit('searchVal', { ...props.modelValue, timeDate: '1' });
    } else {
      console.log('表单验证失败');
      loading.value = false; // 验证失败，结束加载
      return false;
    }
    // 表单验证成功后，等待异步操作完成再结束加载
    setTimeout(() => {
      loading.value = false;
    }, 1000); // 这里可以根据实际情况调整延迟时间，或者在异步操作完成后手动设置为false
  });
}

// 使用数组存储所有 radioData 组件的引用
const radioDataRefs = ref([])
const setRadioDataRef = (el) => {
  if (el) {
    console.log(el, 'el99999999999999999999')
    radioDataRefs.value.push(el)
  }
}

function onReset() {
  formRef.value?.resetFields()
  nextTick(() => {
    radioDataRefs.value.forEach(ref => {
      if (ref && typeof ref.resetData === 'function') {
        ref.resetData()
      }
    })
    // 清空引用数组，为下次渲染做准备
    radioDataRefs.value = []
  })
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
.formExpand {
  width: 100%;
  height: 100%;
   padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative; // 为遮罩层提供定位上下文
 //align-items: center;
}
.form-footer{
  width: 100%;
  height: 40px;
  line-height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  
}
// 整个表单的loading遮罩样式
.form-loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  .el-icon {
    font-size: 30px;
    color: #409EFF;
  }
}
// :deep(.el-form-item__content){
//   flex: inherit!important;
// }
.radio-group-container{
  display: flex;
  align-items: center;
  width: 480px!important;
}
</style>