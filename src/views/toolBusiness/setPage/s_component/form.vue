<template>
  <div class="form-config-panel">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>字段配置</span>
          <el-button type="primary" size="small" @click="openAddFieldDialog">
            <el-icon>
              <Plus />
            </el-icon>
            添加字段
          </el-button>
        </div>
      </template>
      <!-- 字段列表 -->
      <div v-if="formData.fields.length > 0" class="field-list">
        <el-table
          :data="formData.fields"
          header-cell-class-name="headerTable"
          style="width: 100%; height: 100%"
          border
        >
          <el-table-column prop="label" label="字段标题" />
          <el-table-column prop="prop" label="字段键名" align="center" />
          <el-table-column
            prop="component"
            label="组件"
            :formatter="(e) => fieldTypesList(e.component)"
          />
          <el-table-column label="操作" width="300">
            <template #default="{ $index }">
              <div style="display: flex">
                <el-button
                  type="primary"
                  size="small"
                  @click="handSort('up', $index)"
                  >上移</el-button
                >
                <el-button
                  type="primary"
                  size="small"
                  @click="handSort('down', $index)"
                  >下移</el-button
                >
                <el-button
                  type="primary"
                  size="small"
                  @click="openEditFieldDialog($index)"
                >
                  <el-icon>
                    <Edit />
                  </el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteField($index)"
                >
                  <el-icon>
                    <Delete />
                  </el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty description="暂无字段配置，请点击上方'添加字段'按钮">
          <template #footer>
            <el-button type="primary" @click="openAddFieldDialog">
              <el-icon>
                <Plus />
              </el-icon>
              添加字段
            </el-button>
          </template>
        </el-empty>
      </div>

      <!-- 底部操作按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit">保存配置</el-button>
        <!-- <el-button @click="handleCancel">取消</el-button> -->
      </div>
    </el-card>

    <!-- 添加/编辑字段对话框 -->
    <el-dialog
      v-model="fieldDialogVisible"
      :title="isEditMode ? '编辑字段' : '添加字段'"
      width="600px"
      top="5%"
      destroy-on-close
    >
      <el-form
        ref="fieldFormRef"
        :model="currentField"
        :rules="fieldRules"
        label-width="120px"
        class="field-form"
      >
        <el-form-item label="字段标题：" prop="fieldLabel">
          <el-input
            v-model="currentField.fieldLabel"
            placeholder="请输入字段标题"
            clearable
          />
        </el-form-item>
        <el-form-item label="字段键名：" prop="fieldCode">
          <el-input
            v-model="currentField.fieldCode"
            placeholder="请输入字段名"
            clearable
          />
        </el-form-item>
        <el-form-item label="查询方式：" prop="queryType">
          <el-select
            v-model="currentField.queryType"
            placeholder="请选择查询方式"
            clearable
          >
            <el-option
              v-for="item in fieldQueryType()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="组件类型：" prop="fieldType">
          <el-select
            v-model="currentField.fieldType"
            placeholder="请选择字段类型"
            clearable
            @change="
              currentField.fieldType == 'el-select'
                ? (currentField.source = '自定义')
                : ''
            "
          >
            <el-option
              v-for="item in fieldTypesList()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="
            currentField.fieldType === 'el-select' ||
            currentField.fieldType === 'el-select-v2'
          "
          label="数据来源："
        >
          <div
            style="width: 100%; display: flex; justify-content: space-between"
          >
            <el-select
              v-model="currentField.singleAndMore"
              placeholder="请选择"
              style="width: 100px"
            >
              <el-option label="多选" value="0" />
              <el-option label="单选" value="1" />
            </el-select>
            <el-select
              v-model="currentField.source"
              placeholder="请选择字段类型"
              style="width: cacl(100% - 50px)"
              clearable
            >
              <el-option
                v-for="item in optionSource()"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <el-input
            v-model="currentField.sourceValue"
            v-if="currentField.source != '自定义'"
            :placeholder="
              '请输入' + optionSource(currentField.source || '无') + '名称'
            "
            class="mtForm"
            clearable
          />
          <!-- 自定义类型的下拉 -->
          <div
            style="
              display: flex;
              justify-content: space-between;
              width: 100%;
              margin-top: 10px;
            "
            v-if="currentField.source == '自定义'"
          >
            <!-- 下拉配置 -->
            <div style="width: 60%">
              <p>选项配置</p>
              <el-select
                v-model="currentField.customize"
                placeholder="请选择"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="item in customizeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div style="margin-left: 10px; width: calc(40% - 10px)">
              <p>基础模板</p>
              <el-select
                v-model="currentField.base"
                placeholder="请选择"
                style="width: 100%"
                clearable
                @change="handBase"
              >
                <el-option
                  v-for="item in baseList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <!-- 自定义类型的下拉 -->
          <div
            style="width: 100%; margin-top: 10px"
            v-if="currentField.source == '自定义'"
          >
            <el-input
              v-model="newLabel"
              placeholder="标签"
              style="width: 120px; margin-right: 10px"
            />
            <el-input
              v-model="newValue"
              placeholder="值"
              style="width: 120px; margin-right: 10px"
            />
            <el-button
              type="primary"
              @click="addFieldCustomize(newLabel, newValue)"
              >新增</el-button
            >
            <div
              v-for="(item, index) in customizeList"
              :key="index"
              style="margin: 5px 0; display: flex; align-items: center"
            >
              <el-input
                v-model="item.label"
                style="width: 120px; margin-right: 10px"
              />
              <el-input
                v-model="item.value"
                style="width: 120px; margin-right: 10px"
              />
              <el-button type="danger" @click="deleteOption(index)"
                >删除</el-button
              >
            </div>
          </div>
        </el-form-item>
        <!-- 下拉框对应的code 以及label -->
        <el-form-item
          v-if="
            currentField.fieldType === 'el-select-v2' ||
            currentField.fieldType === 'el-select'
          "
        >
          <div
            style="display: flex; width: 100%; justify-content: space-between"
          >
            <div style="width: 49%">
              键名value:
              <el-input
                v-model="currentField.optionValue"
                placeholder="请输入键名value"
              ></el-input>
            </div>
            <div style="width: 49%">
              键名label:<el-input
                v-model="currentField.optionLabel"
                placeholder="请输入键名label"
              ></el-input>
            </div>
          </div>
          <div style="width: 100%; margin-top: 10px">
            是否树形结构:
            <el-switch
              v-model="currentField.moreTree"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </div>
        </el-form-item>
        <el-form-item
          v-if="currentField.fieldType === 'el-date-picker'"
          label="时间类型："
        >
          <el-select
            v-model="currentField.datePickerType"
            placeholder="请选择字段类型"
            clearable
          >
            <el-option
              v-for="item in datePickerTypeList()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="currentField.fieldType === 'el-radio-date'"
          label="可选值："
          prop="defaultType"
        >
          <el-select
            v-model="currentField.defaultType"
            placeholder="请选择可选值"
            clearable
            multiple
          >
            <el-option
              v-for="item in defaultList()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="padding: 10px">
          <!-- <el-button @click="fieldDialogVisible = false">取消</el-button> -->
          <el-button type="primary" @click="saveField(fieldFormRef)"
            >确定</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  fieldTypesList,
  optionSource,
  datePickerTypeList,
  fieldQueryType,
  defaultList,
} from "./index";
import { sexFn, yesOrNoFn } from "@/types/dict/index";
// 定义事件
const emit = defineEmits(["update"]);
// 表单数据
const formData = reactive({
  fields: [],
});

const customizeList = ref([]); // 自定义数组
const newLabel = ref("");
const newValue = ref("");

// 下拉自定义模板
const baseList = ref([
  { label: "性别", value: "sexFn", options: sexFn() },
  { label: "是否", value: "yesOrNoFn", options: yesOrNoFn() },
]); //  基础模板

// 添加自定义类型
const addFieldCustomize = (label, value) => {
  if (label && value) {
    if (customizeList.value.find((f) => f.value == value))
      return ElMessage.error("当前下拉选项中已存在唯一值！");
    customizeList.value.push({
      label: label,
      value: value,
    });
    newLabel.value = "";
    newValue.value = "";
  } else {
    ElMessage.error("请输入标签/值");
  }
};

// 删除自定义类型
const deleteOption = (index) => {
  customizeList.value.splice(index, 1);
};

// 选择基本配置
const handBase = (value) => {
  customizeList.value = baseList.value.find((f) => f.value == value).options;
};

// 表单验证规则
const fieldRules = reactive({
  fieldLabel: [
    { required: true, message: "请输入字段标题", trigger: "blur" },
    { max: 50, message: "字段标题长度不能超过50个字符", trigger: "blur" },
  ],
  fieldCode: [
    { required: true, message: "请输入字段键名", trigger: "blur" },
    // { pattern: /^[a-zA-Z0-9_]+$/, message: '字段键名仅支持字母、数字和下划线', trigger: 'blur' },
    { max: 80, message: "字段键名长度不能超过80个字符", trigger: "blur" },
  ],
  fieldType: [{ required: true, message: "请选择组件类型", trigger: "change" }],
  source: [{ required: true, message: "请选择数据来源", trigger: "change" }],
  sourceValue: [
    { required: true, message: "请输入数据源名称", trigger: "blur" },
    { max: 100, message: "数据源名称长度不能超过100个字符", trigger: "blur" },
  ],
  datePickerType: [
    { required: true, message: "请选择时间类型", trigger: "change" },
  ],
  defaultType: [{ required: true, message: "请选择可选值", trigger: "change" }],
});

// 字段对话框相关
const fieldDialogVisible = ref(false);
const isEditMode = ref(false);
const currentEditIndex = ref(-1);
const currentField = reactive({
  fieldLabel: "", // 字段标题
  fieldCode: "", // 字段键名
  fieldType: "", // 字段类型(组件)
  queryType: "", // 查询方式
  source: "", // 数据来源（字典、接口、自定义）
  sourceValue: "", // 数据来源值（字典、接口）
  datePickerType: "", // 时间类型（年、月、日）
  singleAndMore: "1", // 单选多选
  defaultType: [], // 可选值（年、季、月）
  optionValue: "", // 键名value
  optionLabel: "", //键名label
  moreTree: "", // 是否树形结构
});
const fieldFormRef = ref(null);

// 打开添加字段对话框
const openAddFieldDialog = () => {
  isEditMode.value = false;
  currentEditIndex.value = -1;
  // 重置当前字段
  Object.keys(currentField).forEach((key) => delete currentField[key]);
  // 设置默认值
  Object.assign(currentField, rowEditValueFn("新增", {}));
  fieldDialogVisible.value = true;
};

// 新增编辑赋值
const rowEditValueFn = (type, item) => {
  console.log(item, "item");

  if (type == "新增") {
    customizeList.value = [];
    return {
      fieldLabel: "", // 字段标题
      fieldCode: "", // 字段键名
      queryType: "", //  查询方式
      fieldType: "", // 字段类型(组件)
      source: "", // 数据来源（字典、接口、自定义）
      sourceValue: "", // 数据来源值（字典、接口）
      datePickerType: "", // 时间类型（年、月、日）
      singleAndMore: "1", // 单选多选
      defaultType: [], // 可选值（年、季、月）
      optionValue: "", // 键名value
      optionLabel: "", //键名label
      moreTree: "", // 是否树形结构
    };
  } else {
    customizeList.value = item.options || [];
    return {
      fieldLabel: item.label, // 字段标题
      fieldCode: item.prop, // 字段键名
      queryType: item.queryType, //  查询方式
      fieldType: item.component, // 字段类型(组件)
      source: item.source, // 数据来源（字典、接口、自定义）
      sourceValue: item.sourceValue, // 数据来源值（字典、接口）
      datePickerType: item.datePickerType, // 时间类型（年、月、日）
      singleAndMore: item.singleAndMore || "1", // 单选多选
      defaultType: item.defaultType, // 可选值（年、季、月）
      optionValue: item.optionValue, // 键名value
      optionLabel: item.optionLabel, //键名label
      moreTree: item.moreTree, // 是否树形结构
    };
  }
};

// 打开编辑字段对话框
const openEditFieldDialog = (index) => {
  isEditMode.value = true;
  currentEditIndex.value = index;
  // 深拷贝字段数据
  const field = formData.fields[index];
  console.log(field, "field");
  Object.keys(currentField).forEach((key) => delete currentField[key]);
  Object.assign(
    currentField,
    JSON.parse(JSON.stringify(rowEditValueFn("编辑", field)))
  );
  fieldDialogVisible.value = true;
};

//  时间范围年月日转换
const yearMonthDateFn = (type) => {
  if (type === "yearrange") {
    return "YYYY";
  } else if (type === "monthrange") {
    return "YYYY-MM";
  } else if (type === "daterange") {
    return "YYYY-MM-DD HH:mm:ss";
  }
  if (type === "year") {
    return "YYYY";
  } else if (type === "month") {
    return "YYYY-MM";
  } else if (type === "date") {
    return "YYYY-MM-DD HH:mm:ss";
  } else {
    return "YYYY-MM-DD HH:mm:ss";
  }
};

//  组件类型转换判断
const attrsFn = (type, item) => {
  console.log(item, "item");
  // 时间范围选择
  if (fieldTypesList(type) == "时间范围选择") {
    const baseAttrs = {
      "start-placeholder": "开始时间",
      "end-placeholder": "结束时间",
      "range-separator": "-",
      "value-format": "YYYY-MM-DD HH:mm:ss",
      // "value-format": yearMonthDateFn(item.datePickerType),  //  fomatter
      type: item.datePickerType, //  时间类型
    };
    if (
      item.datePickerType == "yearrange" ||
      item.datePickerType == "monthrange" ||
      item.datePickerType == "daterange"
    ) {
      return {
        ...baseAttrs,
        "default-time": ["2000 00:00:00", "2000 23:59:59"],
      };
    } else if (
      item.datePickerType == "year" ||
      item.datePickerType == "month" ||
      item.datePickerType == "date"
    ) {
      return {
        ...baseAttrs,
      };
    }
  } else if (
    fieldTypesList(type) == "下拉选择" ||
    fieldTypesList(type) == "虚拟下拉框"
  ) {
    if (item.singleAndMore == "0") {
      return {
        placeholder: "请选择",
        multiple: true,
        clearable: true,
        "collapse-tags": true,
        "collapse-tags-tooltip": true,
        singleAndMore: "0",
      };
    } else {
      return {
        placeholder: "请选择",
        multiple: false,
        clearable: true,
        singleAndMore: "1",
      };
    }
  } else if (fieldTypesList(type) == "时间选择组件") {
    return {
      "value-format": "YYYY-MM-DD HH:mm:ss",
    };
  } else if (fieldTypesList(type) == "文本输入") {
    return { placeholder: "请输入", clearable: true };
  } else {
    return {};
  }
};

//  每个组件的配置
const rowDataFn = (type, item) => {
  let obj = {
    label: currentField.fieldLabel, //  标题
    prop: currentField.fieldCode, //  字段键名
    component: currentField.fieldType, //  组件类型,
    queryType: currentField.queryType, //  查询方式
    optionValue: currentField.optionValue, // 键名value
    optionLabel: currentField.optionLabel, //键名label
    moreTree: currentField.moreTree, // 是否树形结构
    style: { width: "220px" }, //  组件宽度
  };
  if (type == "el-input") {
    return {
      ...obj,
      attrs: attrsFn(currentField.fieldType, currentField), //  当前组件配置
    };
  } else if (type == "el-select") {
    return {
      ...obj,
      options: customizeList.value, // 组件选项
      source: currentField.source, //  数据来源（接口、字典、自定义）
      sourceValue: currentField.sourceValue, //  数据来源值（接口、字典）
      attrs: attrsFn(currentField.fieldType, currentField), //  当前组件配置}
    };
  } else if (type == "el-select-v2") {
    return {
      ...obj,
      options: customizeList.value, // 组件选项
      source: currentField.source, //  数据来源（接口、字典、自定义）
      sourceValue: currentField.sourceValue, //  数据来源值（接口、字典）
      attrs: attrsFn(currentField.fieldType, currentField), //  当前组件配置}
    };
  } else if (type == "el-date-picker") {
    return {
      ...obj,
      datePickerType: currentField.datePickerType, //  时间类型（年、月、日）
      attrs: attrsFn(currentField.fieldType, currentField), //  当前组件配置}
    };
  } else if (type == "el-radio-date") {
    return {
      ...obj,
      defaultType: currentField.defaultType, //  可选值
      attrs: attrsFn(currentField.fieldType, currentField), //  当前组件配置}
    };
  }
};

// 保存字段
const saveField = async (formEl) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      // 是否为编辑
      if (isEditMode.value) {
        formData.fields[currentEditIndex.value] = rowDataFn(
          currentField.fieldType,
          currentField
        );
      } else {
        formData.fields.push(rowDataFn(currentField.fieldType, currentField));
      }
      fieldDialogVisible.value = false;
    } else {
      console.log("error submit!", fields);
    }
  });
};

// 删除字段
const deleteField = (index) => {
  ElMessageBox.confirm("确定要删除这个字段吗？", "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      formData.fields.splice(index, 1);
      ElMessage({ message: "字段已删除", type: "success" });
    })
    .catch(() => {
      // 取消删除
    });
};

// 提交表单
const handleSubmit = () => {
  // console.log(formData.fields, 'formData.fields');
  let obj = {};
  let arr = formData.fields;
  let listType = ["el-date-picker"]; // 默认值为数组
  for (let i = 0, len = arr.length; i < len; i++) {
    if (listType.find((f) => f == arr[i].component)) {
      obj[arr[i].prop] = [];
    } else {
      obj[arr[i].prop] = "";
    }
  }
  // console.log(formData.fields, "formData.fields");
  // // 触发父组件更新
  emit("update", {
    idComponent: props.component.uuidC,
    formData: {
      modelValue: obj,
      items: formData.fields,
      formProps: { inline: true },
      labelWidth: "",
      tabIndex: tabIndex.value,
    },
  });
};

// 数组排序函数 - 处理字段的上移下移
const handSort = (type, index) => {
  if (type === "up") {
    // 上移：当不是第一个元素时，与前一个元素交换位置
    if (index > 0) {
      const temp = formData.fields[index];
      formData.fields[index] = formData.fields[index - 1];
      formData.fields[index - 1] = temp;
      ElMessage({ message: "字段已上移", type: "success" });
    } else {
      ElMessage({ message: "已经是第一个字段", type: "warning" });
    }
  } else if (type === "down") {
    // 下移：当不是最后一个元素时，与后一个元素交换位置
    if (index < formData.fields.length - 1) {
      const temp = formData.fields[index];
      formData.fields[index] = formData.fields[index + 1];
      formData.fields[index + 1] = temp;
      ElMessage({ message: "字段已下移", type: "success" });
    } else {
      ElMessage({ message: "已经是最后一个字段", type: "warning" });
    }
  }
};

// 取消操作
const handleCancel = () => {
  // 触发父组件的取消事件
  defineEmits(["cancel"])();
};

// 定义props
const props = defineProps({
  component: {
    type: Object,
    default: () => ({}),
  },
});
const tabIndex = ref("");
// 监听组件属性变化，更新表单数据
watch(
  () => props.component,
  (newVal) => {
    // console.log('newVal', newVal);
    if (newVal && newVal.bind && newVal.bind.items) {
      tabIndex.value = newVal.bind.tabIndex;
      formData.fields = [...newVal.bind.items];
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.form-config-panel {
  padding: 10px;
  background-color: #f5f7fa;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.config-card {
  height: 100%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 15px;
  box-sizing: border-box;
}
:deep(.el-card__header) {
  padding: 0;
}

:deep(.el-card__body) {
  padding: 0 10;
  height: 100%;
  box-sizing: border-box;
}

.field-list {
  height: calc(100% - 50px);
}

.empty-state {
  text-align: center;
  height: calc(100% - 50px);
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px;
}

.field-form {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}
</style>
