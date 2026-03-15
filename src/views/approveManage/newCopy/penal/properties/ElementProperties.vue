<template>
  <div class="panel-tab__content">
    <el-table :data="elementPropertyList" size="mini" max-height="240" border fit>
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column label="属性名" prop="name" min-width="100px" show-overflow-tooltip />
      <el-table-column label="属性值" prop="value" min-width="100px" show-overflow-tooltip />
      <el-table-column label="操作" width="90px">
        <template #default="{ row, $index }">
          <el-button size="mini" type="text" @click="openAttributesForm(row, $index)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeAttributes(row, $index)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="element-drawer__button">
      <el-button size="mini" type="primary" icon="el-icon-plus" @click="openAttributesForm(null, -1)">添加属性</el-button>
    </div>
    <el-dialog v-model="propertyFormModelVisible" title="属性配置" width="600px" append-to-body destroy-on-close @update:visible="(val) => propertyFormModelVisible = val">
      <el-form :model="propertyForm" label-width="80px" size="mini" ref="attributeFormRef" @submit.prevent>
        <el-form-item label="属性名：" prop="name">
          <el-input v-model="propertyForm.name" clearable />
        </el-form-item>
        <el-form-item label="属性值：" prop="value">
          <el-input v-model="propertyForm.value" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="mini" @click="propertyFormModelVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveAttribute">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, inject, watch, nextTick } from 'vue';
import { ElMessageBox } from 'element-plus';

const props = defineProps({
  id: String,
  type: String
});

const prefix = inject('prefix');
const width = inject('width');

// 响应式数据
const elementPropertyList = ref([]);
const propertyForm = reactive({});
const editingPropertyIndex = ref(-1);
const propertyFormModelVisible = ref(false);

// 表单引用
const attributeFormRef = ref(null);

// 非响应式临时数据
let bpmnElement = null;
let otherExtensionList = [];
let bpmnElementProperties = [];
let bpmnElementPropertyList = [];

// 重置属性列表
const resetAttributesList = () => {
  bpmnElement = window.bpmnInstances.bpmnElement;
  otherExtensionList = []; // 其他扩展配置
  bpmnElementProperties = bpmnElement.businessObject?.extensionElements?.values?.filter(ex => {
    if (ex.$type !== `${prefix}:Properties`) {
      otherExtensionList.push(ex);
    }
    return ex.$type === `${prefix}:Properties`;
  }) ?? [];

  // 保存所有的 扩展属性字段
  bpmnElementPropertyList = bpmnElementProperties.reduce((pre, current) => pre.concat(current.values), []);
  // 复制 显示
  elementPropertyList.value = JSON.parse(JSON.stringify(bpmnElementPropertyList ?? []));
};

// 打开属性表单
const openAttributesForm = (attr, index) => {
  editingPropertyIndex.value = index;
  Object.keys(propertyForm).forEach(key => delete propertyForm[key]);
  if (index !== -1 && attr) {
    Object.assign(propertyForm, JSON.parse(JSON.stringify(attr)));
  }
  propertyFormModelVisible.value = true;
  nextTick(() => {
    if (attributeFormRef.value) attributeFormRef.value.clearValidate();
  });
};

// 移除属性
const removeAttributes = (attr, index) => {
  ElMessageBox.confirm("确认移除该属性吗？", "提示", {
    confirmButtonText: "确 认",
    cancelButtonText: "取 消"
  })
    .then(() => {
      elementPropertyList.value.splice(index, 1);
      bpmnElementPropertyList.splice(index, 1);
      // 新建一个属性字段的保存列表
      const propertiesObject = window.bpmnInstances.moddle.create(`${prefix}:Properties`, {
        values: bpmnElementPropertyList
      });
      updateElementExtensions(propertiesObject);
      resetAttributesList();
    })
    .catch(() => console.info("操作取消"));
};

// 保存属性
const saveAttribute = () => {
  const { name, value } = propertyForm;
  console.log(bpmnElementPropertyList);
  if (editingPropertyIndex.value !== -1) {
    window.bpmnInstances.modeling.updateModdleProperties(
      bpmnElement,
      bpmnElementPropertyList[editingPropertyIndex.value],
      {
        name,
        value
      }
    );
  } else {
    // 新建属性字段
    const newPropertyObject = window.bpmnInstances.moddle.create(`${prefix}:Property`, { name, value });
    // 新建一个属性字段的保存列表
    const propertiesObject = window.bpmnInstances.moddle.create(`${prefix}:Properties`, {
      values: bpmnElementPropertyList.concat([newPropertyObject])
    });
    updateElementExtensions(propertiesObject);
  }
  propertyFormModelVisible.value = false;
  resetAttributesList();
};

// 更新元素扩展
const updateElementExtensions = (properties) => {
  const extensions = window.bpmnInstances.moddle.create("bpmn:ExtensionElements", {
    values: otherExtensionList.concat([properties])
  });
  window.bpmnInstances.modeling.updateProperties(bpmnElement, {
    extensionElements: extensions
  });
};

// 监听id变化
watch(() => props.id, (val) => {
  if (val && val.length) {
    resetAttributesList();
  }
}, { immediate: true ,deep:true});
</script>
