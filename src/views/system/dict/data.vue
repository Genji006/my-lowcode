<template>
  <div class="dictData-class">
    <div class="dictData_header">
      <SzycFormSearch
        v-model="searchData"
        :items="searchItems"
        labelWidth=""
        @searchVal="getList()"
        @reset="getList('重置')"
        :inline="true"
      />
    </div>
    <div class="dictData_table">
      <tableList
        ref="tableRef"
        :queryParams="searchData"
        v-bind="bindData"
        :defaultExpandAll="defaultExpandAll"
        @btnClick="btnClick"
      >
        <template #operate="{ row }">
          <div style="display: flex; justify-content: space-between">
            <div class="menuIndex-operate-btn" @click="handleEdit(row)">
              <el-icon style="color: rgba(0, 115, 237, 1); margin-right: 4px"
                ><Edit /></el-icon
              >编辑
            </div>
            <div class="menuIndex-operate-btn" @click="handleDelete(row)">
              <el-icon style="color: rgba(0, 115, 237, 1); margin-right: 4px"
                ><Delete /></el-icon
              >删除
            </div>
          </div>
        </template>
        <template #status="{ row }">
          <div style="width: 76px; display: flex; justify-content: center">
            <div
              :class="
                row.status === '0'
                  ? 'menuIndex-status-class'
                  : row.status === '1'
                  ? 'menuIndex-statuss-class'
                  : ''
              "
            >
              {{ yesOrNoFns(row.status, "formatter") }}
            </div>
          </div>
        </template>
      </tableList>
    </div>
  </div>
  <!-- 新增编辑菜单组弹窗 -->
  <SzycDialog v-model="addDialogVisible" width="30%" :title="dialogTitle">
    <template #uname>
      <szycSubmitForm
        :modelValue="addOrEditForm"
        :items="dictItems"
        ref="addOrEditFormRef"
        :inline="true"
        labelWidth="auto"
        :rules="addOrEditRules"
        :className="'inlineClass'"
        @submit="addMGSubmit(addOrEditFormRef)"
        @cancel="addDialogVisible = false"
      >
      </szycSubmitForm>
    </template>
  </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycSubmitForm from "@/components/element/SubmitForm.vue";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { yesOrNoFns, dataItemTypeList } from "@/types/dict/index";
import tableList from "@/components/table/tableAndPage.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import {
  optionselect,
  addData,
  updateData,
  delData,
  exportDict,
} from "@/api/system/dict";
import {
  themeStoreMenu
} from "@/store/theme";
import {
  storeToRefs
} from "pinia";
const storeTheme = themeStoreMenu(); //  主题存储
const router = useRouter();
const route = useRoute();



const {
  currentTab
} = storeToRefs(storeTheme);

// const tabsStore = useTabsStore();
// console.log(storeTheme.tabs, "storeTheme.tabs");

const {
  setCurrentTab,
  addTab,
  removeTab
} = storeTheme.tabsFn;


const dictTypeOptions = ref([]);
//  查询值
const searchData = reactive({
  dictType: "",
  dictLabel: "",
  status: "",
});

//  查询表单
const searchItems = computed(() => [
  {
    label: "字典名称：",
    prop: "dictType",
    component: "el-select",
    options: dictTypeOptions.value,
    optionLabel: "dictName",
    optionValue: "dictType",
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: false },
  },
  {
    label: "字典名称：",
    prop: "dictLabel",
    component: "el-input",
    style: { width: "220px" },
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    label: "启用否：",
    prop: "status",
    component: "el-select",
    options: yesOrNoFns(),
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true },
  },
]);

const tableRef = ref(null); //  表格
const tableData = ref([]);
const defaultExpandAll = ref(false); //  是否默认展开
const bindData = reactive({
  pageOpen: "1", //  是否需要分页
  checkBox: "1", //  是否需要复选框
  light: "1", //  是否需要高亮
  primaryKey: "dictCode",
  method: "get",
  btnList: [
    { btnType: "add" }, //  新增
    { btnType: "edit", text: "编辑" }, //  编辑
    { btnType: "delete" },
    { btnType: "add", text: "导出", icon: "", img: "/ItemImg/pldc.svg" },
    { btnType: "add", text: "关闭", icon: "CloseBold" },
  ], // 表格按钮
  apiUrl: "/system/dict/data/list", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "字典编码",
      columnName: "dictCode",
      columnWidth: "150",
      align: "center",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "数据标签",
      columnName: "dictLabel",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "数据键值",
      columnName: "dictValue",
      columnWidth: "150",
      align: "center",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "字典排序",
      columnName: "dictSort",
      columnWidth: "150",
      align: "center",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "启用否",
      columnName: "status",
      kyf: "1",
      columnWidth: "120",
      align: "center",
      attrs: { "active-value": "0", "inactive-value": "1" },
    },
    {
      columnLabel: "备注",
      columnName: "remark",
      columnWidth: "150",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "创建时间",
      columnName: "createTime",
      columnWidth: "200",
      align: "center",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "操作",
      columnName: "operate",
      columnWidth: "150",
      align: "center",
      showOverflowTooltip: true,
      hasSlot: true,
    },
  ],
});

const switchChange = (row) => {
  let text = row.status === "0" ? "启用" : "停用";
  ElMessageBox.confirm(`确认要"${text}""${row.row.roleName}"字典吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      let res = changeStatus({ roleId: row.roleId, status: row.status });
      if (res.code == 200) {
        ElMessage({
          type: "success",
          message: "编辑成功!",
        });
        getList();
      }
    })
    .catch(() => {
      row.row.status = "0";
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};

const addDialogVisible = ref(false);
const dialogTitle = ref("新增字典");
const addOrEditFormRef = ref(null);
const addOrEditForm = reactive({
  dictType: "",
  dictLabel: "",
  dictValue: "",
  // cssClass: "",
  dictSort: "",
  // listClass: "",
  dictCode:"",
  status: "",
  remark: "",
});
const dictItems = computed(() => [
  {
    label: "字典类型",
    prop: "dictType",
    attrs: {
      disabled: true,
    },
  },
  {
    component: "el-input",
    label: "数据标签",
    prop: "dictLabel",
    attrs: {
      placeholder: "",
      clearable: true,
    },
  },
  {
    component: "el-input",
    label: "数据键值",
    prop: "dictValue",
    attrs: {
      placeholder: "",
      clearable: true,
    },
  },
  // {
  //   component: "el-input",
  //   label: "样式属性",
  //   prop: "cssClass",
  //   attrs: {
  //     placeholder: "",
  //     clearable: true,
  //   },
  // },
  {
    component: "el-input-number",
    label: "显示排序",
    prop: "dictSort",
    attrs: {
      placeholder: "",
      clearable: true,
    },
  },
  // {
  //   component: "el-select",
  //   label: "回显样式",
  //   prop: "listClass",
  //   options: yesOrNoFns(),
  //   attrs: {
  //     placeholder: "",
  //     clearable: true,
  //   },
  // },
  {
    component: "el-radio-group",
    label: "启用否",
    prop: "status",
    options: yesOrNoFns(),
    attrs: {
      placeholder: "",
      clearable: true,
    },
  },
  {
    component: "el-input",
    label: "备注",
    prop: "remark",
    attrs: {
      placeholder: "",
      clearable: true,
      type: "textarea",
      rows: 3,

    },
  },
]);
//校验
let addOrEditRules = reactive({
  //新增弹窗校验
  dictLabel: [
    {
      required: true,
      message: "数据标签不能为空",
      trigger: ["blur"],
    },
  ],
  dictValue: [
    {
      required: true,
      message: "数据键值不能为空",
      trigger: ["blur"],
    },
  ],
  dictSort: [
    {
      required: true,
      message: "显示排序不能为空",
      trigger: ["blur", "change"],
    },
  ],
});

const btnClick = async (item, row) => {
  if (item.text == "新增") {
    dialogTitle.value = "新增字典数据";
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      if (item == "status" || item == "dictSort") {
        addOrEditForm[item] = "0";
      } else if (item == "dictType") {
        addOrEditForm[item] = searchData.dictType;
      }  else {
        addOrEditForm[item] = "";
      }
    });
    addDialogVisible.value = true;
    nextTick(() => {
      addOrEditFormRef.value.clearValidate();
    });
  } else if (item.text == "编辑") {
    dialogTitle.value = "编辑字典数据";
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      addOrEditForm[item] = row?.[item];
    });
    addDialogVisible.value = true;
  } else if (item.text == "删除") {
    ElMessageBox.confirm("确认删除吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        let dictIds = row.map((item) => item.dictCode).join(",");
        delData(dictIds).then((res) => {
          if (res.code == 200) {
            ElMessage({
              type: "success",
              message: "删除成功!",
            });
            getList();
          }
        });
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消",
        });
      });
  } else if (item.text == "导出") {
    const formData = new FormData();
    for (const key in searchData) {
      if (searchData[key] !== null && searchData[key] !== undefined) {
        formData.append(key, searchData[key]);

      }
    }
    exportDict(formData, "/system/dict/data/export", "字典数据");
  } else if (item.text == "关闭") {
    console.log("关闭", storeTheme);
    removeTab(storeTheme.currentTab.menuName);
    router.push(storeTheme.currentTab.path); //  跳转上一个
    // router.go(-1);

  }
};

const handleEdit = (row) => {
  dialogTitle.value = "编辑字典数据";
  let keysData = Object.keys(addOrEditForm);
  keysData.forEach((item) => {
    addOrEditForm[item] = row?.[item];
  });
  addDialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm("确认删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      let dictIds = row.dictCode;
      delData(dictIds).then((res) => {
        if (res.code == 200) {
          ElMessage({
            type: "success",
            message: "删除成功!",
          });
          getList();
        }
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};

const addMGSubmit = () => {
  addOrEditFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogTitle.value == "新增字典数据") {
        addData(addOrEditForm).then((res) => {
          if (res.code == 200) {
            ElMessage({
              type: "success",
              message: "新增成功!",
            });
            getList();
            addDialogVisible.value = false;
          }
        });
      } else {
        updateData(addOrEditForm).then((res) => {
          if (res.code == 200) {
            ElMessage({
              type: "success",
              message: "编辑成功!",
            });
            getList();
            addDialogVisible.value = false;
          }
        });
      }
    }
  });
};

const getDictTypeOptions = async () => {
  let res = await optionselect();
  if (res.code == 200) {
    dictTypeOptions.value = res.data;
  }
};

const getList = async (type) => {
  if (type == "重置") {
    searchData.dictLabel = "";
    searchData.status = "";
    searchData.dictType = route.query.dictType || "";
    tableRef.value.fetchData();
  } else {
    tableRef.value.fetchData();
  }
};

onMounted(async () => {
  await getDictTypeOptions();
  searchData.dictType = route.query.dictType || "";
  await getList();

});

</script>

<style lang="less" scoped>
.dictData-class {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px 0;
  .dictData_header {
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
    flex-shrink: 0;
  }
  .dictData_table{
    min-height: 0;
    flex: 1;
  }
}

.menuIndex-operate-btn {
  color: rgba(0, 115, 237, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
}

</style>