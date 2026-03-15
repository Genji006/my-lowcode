<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="80px" @submit.prevent>
      <el-form-item label="表单标识">
        <el-input v-model="formKey" clearable @change="updateElementFormKey" />
      </el-form-item>
      <el-form-item label="业务标识">
        <el-select v-model="businessKey" @change="updateElementBusinessKey">
          <el-option v-for="i in fieldList" :key="i.id" :value="i.id" :label="i.label" />
          <el-option label="无" value="" />
        </el-select>
      </el-form-item>
    </el-form>

    <!--字段列表-->
    <div class="element-property list-property">
      <el-divider><el-icon>
          <Coin />
        </el-icon> 表单字段</el-divider>
      <el-table :data="fieldList" size="mini" max-height="240" border fit>
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="字段名称" prop="label" min-width="80px" show-overflow-tooltip />
        <el-table-column label="字段类型" prop="type" min-width="80px" :formatter="row => fieldType[row.type] || row.type" show-overflow-tooltip />
        <el-table-column label="默认值" prop="defaultValue" min-width="80px" show-overflow-tooltip />
        <el-table-column label="操作" width="90px">
          <template #default="{ row, $index }">
            <el-button size="mini" type="text" @click="openFieldForm(row, $index)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeField(row, $index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="element-drawer__button">
      <el-button size="mini" type="primary" icon="el-icon-plus" @click="openFieldForm(null, -1)">添加字段</el-button>
    </div>

    <!--字段配置侧边栏-->
    <el-drawer v-model="fieldModelVisible" title="字段配置" :size="`${width}px`" append-to-body destroy-on-close>
      <el-form :model="formFieldForm" label-width="90px" size="mini" @submit.prevent>
        <el-form-item label="字段ID">
          <el-input v-model="formFieldForm.id" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="formFieldForm.typeType" placeholder="请选择字段类型" clearable @change="changeFieldTypeType">
            <el-option v-for="(value, key) of fieldType" :label="value" :value="key" :key="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型名称" v-if="formFieldForm.typeType === 'custom'">
          <el-input v-model="formFieldForm.type" clearable />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="formFieldForm.label" clearable />
        </el-form-item>
        <el-form-item label="时间格式" v-if="formFieldForm.typeType === 'date'">
          <el-input v-model="formFieldForm.datePattern" clearable />
        </el-form-item>
        <el-form-item label="默认值">
          <el-input v-model="formFieldForm.defaultValue" clearable />
        </el-form-item>
      </el-form>

      <!-- 枚举值设置 -->
      <template v-if="formFieldForm.type === 'enum'">
        <el-divider key="enum-divider" />
        <p class="listener-filed__title" key="enum-title">
          <span><i class="el-icon-menu"></i>枚举值列表：</span>
          <el-button size="mini" type="primary" @click="openFieldOptionForm(null, -1, 'enum')">添加枚举值</el-button>
        </p>
        <el-table :data="fieldEnumList" size="mini" key="enum-table" max-height="240" border fit>
          <el-table-column label="序号" width="60" type="index" />
          <el-table-column label="枚举值编号" prop="id" min-width="100px" show-overflow-tooltip />
          <el-table-column label="枚举值名称" prop="name" min-width="100px" show-overflow-tooltip />
          <el-table-column label="操作" width="100">
            <template #default="{ row, $index }">
              <el-button size="mini" type="text" @click="openFieldOptionForm(row, $index, 'enum')">编辑</el-button>
              <el-divider direction="vertical" />
              <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'enum')">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 校验规则 -->
      <el-divider key="validation-divider" />
      <p class="listener-filed__title" key="validation-title">
        <span><i class="el-icon-menu"></i>约束条件列表：</span>
        <el-button size="mini" type="primary" @click="openFieldOptionForm(null, -1, 'constraint')">添加约束</el-button>
      </p>
      <el-table :data="fieldConstraintsList" size="mini" key="validation-table" max-height="240" border fit>
        <el-table-column label="序号" width="60" type="index" />
        <el-table-column label="约束名称" prop="name" min-width="100px" show-overflow-tooltip />
        <el-table-column label="约束配置" prop="config" min-width="100px" show-overflow-tooltip />
        <el-table-column label="操作" width="100">
          <template #default="{ row, $index }">
            <el-button size="mini" type="text" @click="openFieldOptionForm(row, $index, 'constraint')">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'constraint')">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 表单属性 -->
      <el-divider key="property-divider" />
      <p class="listener-filed__title" key="property-title">
        <span><i class="el-icon-menu"></i>字段属性列表：</span>
        <el-button size="mini" type="primary" @click="openFieldOptionForm(null, -1, 'property')">添加属性</el-button>
      </p>
      <el-table :data="fieldPropertiesList" size="mini" key="property-table" max-height="240" border fit>
        <el-table-column label="序号" width="60" type="index" />
        <el-table-column label="属性编号" prop="id" min-width="100px" show-overflow-tooltip />
        <el-table-column label="属性值" prop="value" min-width="100px" show-overflow-tooltip />
        <el-table-column label="操作" width="90px">
          <template #default="{ row, $index }">
            <el-button size="mini" type="text" @click="openFieldOptionForm(row, $index, 'property')">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'property')">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部按钮 -->
      <div class="element-drawer__button">
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveField">保 存</el-button>
      </div>
    </el-drawer>

    <el-dialog v-model="fieldOptionModelVisible" :title="optionModelTitle" width="600px" append-to-body destroy-on-close>
      <el-form :model="fieldOptionForm" size="mini" label-width="96px" @submit.prevent>
        <el-form-item label="编号/ID" v-if="fieldOptionType !== 'constraint'" key="option-id">
          <el-input v-model="fieldOptionForm.id" clearable />
        </el-form-item>
        <el-form-item label="名称" v-if="fieldOptionType !== 'property'" key="option-name">
          <el-input v-model="fieldOptionForm.name" clearable />
        </el-form-item>
        <el-form-item label="配置" v-if="fieldOptionType === 'constraint'" key="option-config">
          <el-input v-model="fieldOptionForm.config" clearable />
        </el-form-item>
        <el-form-item label="值" v-if="fieldOptionType === 'property'" key="option-value">
          <el-input v-model="fieldOptionForm.value" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="mini" @click="fieldOptionModelVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveFieldOption">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, inject } from 'vue'

// 定义组件属性
const props = defineProps({
  id: String,
  type: String
})

// 注入全局属性
const prefix = inject('prefix')
const width = inject('width')

// 响应式数据
const formKey = ref('')
const businessKey = ref('')
const optionModelTitle = ref('')
const fieldList = ref([])
const formFieldForm = reactive({})
const formFieldIndex = ref(-1)
const formFieldOptionIndex = ref(-1)
const fieldModelVisible = ref(false)
const fieldOptionModelVisible = ref(false)
const fieldOptionForm = reactive({})
const fieldOptionType = ref('')
const fieldEnumList = ref([])
const fieldConstraintsList = ref([])
const fieldPropertiesList = ref([])

// 常量
const fieldType = {
  long: "长整型",
  string: "字符串",
  boolean: "布尔类",
  date: "日期类",
  enum: "枚举类",
  custom: "自定义类型"
}

// 普通变量
let bpmnELement = null
let elExtensionElements = null
let formData = null
let otherExtensions = null

// 监听id变化
watch(() => props.id, (val) => {
  if (val && val.length) {
    nextTick(() => resetFormList())
  }
}, { immediate: true, deep: true })

// 方法定义
const resetFormList = () => {
  bpmnELement = window.bpmnInstances.bpmnElement
  formKey.value = bpmnELement.businessObject.formKey
  // 获取元素扩展属性 或者 创建扩展属性
  elExtensionElements = bpmnELement.businessObject.get("extensionElements") || window.bpmnInstances.moddle.create("bpmn:ExtensionElements", { values: [] })
  // 获取元素表单配置 或者 创建新的表单配置
  formData = elExtensionElements.values.filter(ex => ex.$type === `${prefix}:FormData`)?.[0] || window.bpmnInstances.moddle.create(`${prefix}:FormData`, { fields: [] })
  // 业务标识 businessKey， 绑定在 formData 中
  businessKey.value = formData.businessKey
  // 保留剩余扩展元素，便于后面更新该元素对应属性
  otherExtensions = elExtensionElements.values.filter(ex => ex.$type !== `${prefix}:FormData`)
  // 复制原始值，填充表格
  fieldList.value = JSON.parse(JSON.stringify(formData.fields || []))
  // 更新元素扩展属性，避免后续报错
  updateElementExtensions()
}

const updateElementFormKey = () => {
  window.bpmnInstances.modeling.updateProperties(bpmnELement, { formKey: formKey.value })
}

const updateElementBusinessKey = () => {
  window.bpmnInstances.modeling.updateModdleProperties(bpmnELement, formData, {
    businessKey: businessKey.value
  })
}

// 根据类型调整字段type
const changeFieldTypeType = (type) => {
  formFieldForm.type = type === "custom" ? "" : type
}

// 打开字段详情侧边栏
const openFieldForm = (field, index) => {
  formFieldIndex.value = index

  // 清空表单
  Object.keys(formFieldForm).forEach(key => delete formFieldForm[key])

  if (index !== -1) {
    const FieldObject = formData.fields[index]
    // 复制字段数据
    Object.assign(formFieldForm, JSON.parse(JSON.stringify(field)))
    // 设置自定义类型
    formFieldForm.typeType = !fieldType[field.type] ? "custom" : field.type
    // 初始化枚举值列表
    if (field.type === "enum") {
      fieldEnumList.value = JSON.parse(JSON.stringify(FieldObject?.values || []))
    }
    // 初始化约束条件列表
    fieldConstraintsList.value = JSON.parse(JSON.stringify(FieldObject?.validation?.constraints || []))
    // 初始化自定义属性列表
    fieldPropertiesList.value = JSON.parse(JSON.stringify(FieldObject?.properties?.values || []))
  } else {
    // 初始化枚举值列表
    fieldEnumList.value = []
    // 初始化约束条件列表
    fieldConstraintsList.value = []
    // 初始化自定义属性列表
    fieldPropertiesList.value = []
  }
  fieldModelVisible.value = true
}

// 打开字段 某个 配置项 弹窗
const openFieldOptionForm = (option, index, type) => {
  fieldOptionModelVisible.value = true
  fieldOptionType.value = type
  formFieldOptionIndex.value = index

  // 清空表单
  Object.keys(fieldOptionForm).forEach(key => delete fieldOptionForm[key])

  if (type === "property") {
    if (option) {
      Object.assign(fieldOptionForm, JSON.parse(JSON.stringify(option)))
    }
    optionModelTitle.value = "属性配置"
  } else if (type === "enum") {
    if (option) {
      Object.assign(fieldOptionForm, JSON.parse(JSON.stringify(option)))
    }
    optionModelTitle.value = "枚举值配置"
  } else {
    if (option) {
      Object.assign(fieldOptionForm, JSON.parse(JSON.stringify(option)))
    }
    optionModelTitle.value = "约束条件配置"
  }
}

// 保存字段 某个 配置项
const saveFieldOption = () => {
  if (formFieldOptionIndex.value === -1) {
    if (fieldOptionType.value === "property") {
      fieldPropertiesList.value.push({ ...fieldOptionForm })
    } else if (fieldOptionType.value === "constraint") {
      fieldConstraintsList.value.push({ ...fieldOptionForm })
    } else if (fieldOptionType.value === "enum") {
      fieldEnumList.value.push({ ...fieldOptionForm })
    }
  } else {
    if (fieldOptionType.value === "property") {
      fieldPropertiesList.value.splice(formFieldOptionIndex.value, 1, { ...fieldOptionForm })
    } else if (fieldOptionType.value === "constraint") {
      fieldConstraintsList.value.splice(formFieldOptionIndex.value, 1, { ...fieldOptionForm })
    } else if (fieldOptionType.value === "enum") {
      fieldEnumList.value.splice(formFieldOptionIndex.value, 1, { ...fieldOptionForm })
    }
  }
  fieldOptionModelVisible.value = false
  // 清空表单
  Object.keys(fieldOptionForm).forEach(key => delete fieldOptionForm[key])
}

// 保存字段配置
const saveField = () => {
  const { id, type, label, defaultValue, datePattern } = formFieldForm
  const Field = window.bpmnInstances.moddle.create(`${prefix}:FormField`, { id, type, label })

  if (defaultValue) {
    Field.defaultValue = defaultValue
  }
  if (datePattern) {
    Field.datePattern = datePattern
  }

  // 构建属性
  if (fieldPropertiesList.value && fieldPropertiesList.value.length) {
    const fieldPropertyList = fieldPropertiesList.value.map(fp => {
      return window.bpmnInstances.moddle.create(`${prefix}:Property`, { id: fp.id, value: fp.value })
    })
    Field.properties = window.bpmnInstances.moddle.create(`${prefix}:Properties`, {
      values: fieldPropertyList
    })
  }

  // 构建校验规则
  if (fieldConstraintsList.value && fieldConstraintsList.value.length) {
    const fieldConstraintList = fieldConstraintsList.value.map(fc => {
      return window.bpmnInstances.moddle.create(`${prefix}:Constraint`, { name: fc.name, config: fc.config })
    })
    Field.validation = window.bpmnInstances.moddle.create(`${prefix}:Validation`, {
      constraints: fieldConstraintList
    })
  }

  // 构建枚举值
  if (fieldEnumList.value && fieldEnumList.value.length) {
    Field.values = fieldEnumList.value.map(fe => {
      return window.bpmnInstances.moddle.create(`${prefix}:Value`, { name: fe.name, id: fe.id })
    })
  }

  // 更新数组 与 表单配置实例
  if (formFieldIndex.value === -1) {
    fieldList.value.push({ ...formFieldForm })
    formData.fields.push(Field)
  } else {
    fieldList.value.splice(formFieldIndex.value, 1, { ...formFieldForm })
    formData.fields.splice(formFieldIndex.value, 1, Field)
  }

  updateElementExtensions()
  fieldModelVisible.value = false
}

// 移除某个 字段的 配置项
const removeFieldOptionItem = (option, index, type) => {
  if (type === "property") {
    fieldPropertiesList.value.splice(index, 1)
  } else if (type === "enum") {
    fieldEnumList.value.splice(index, 1)
  } else {
    fieldConstraintsList.value.splice(index, 1)
  }
}

// 移除 字段
const removeField = (field, index) => {
  fieldList.value.splice(index, 1)
  formData.fields.splice(index, 1)
  updateElementExtensions()
}

// 更新元素扩展属性
const updateElementExtensions = () => {
  // 更新回扩展元素
  const newElExtensionElements = window.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
    values: otherExtensions.concat(formData)
  })

  // 更新到元素上
  window.bpmnInstances.modeling.updateProperties(bpmnELement, {
    extensionElements: newElExtensionElements
  })
}
</script>