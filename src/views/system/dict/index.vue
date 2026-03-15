<template>
  <div class="dictIndex-class">
    <div class="dictIndex_header">
      <SzycFormSearch
        v-model="searchData"
        :items="searchItems"
        labelWidth=""
        @searchVal="getList()"
        @reset="getList('重置')"
        :inline="true"
      />
    </div>
    <div class="dictIndex_table">
      <tableList
        ref="tableRef"
        :queryParams="searchData"
        v-bind="bindData"
        :defaultExpandAll="defaultExpandAll"
        @btnClick="btnClick"
        @cellClick="tableCellClick"
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
  <!-- 新增修改菜单组弹窗 -->
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
import { useRouter } from "vue-router";
import {
  addType,
  updateType,
  delType,
  refreshCache,
  exportDict,
} from "@/api/system/dict";
const router = useRouter();

//  查询值
const searchData = reactive({
  dictName: "",
  dictType: "",
  status: "",
  dateRange: [], 
  params: {
    beginTime: "",
    endTime: "",
  },
});

const searchDataTs = reactive({
  dictName: "",
  dictType: "",
  status: "",
  dateRange: [], 
});

//  查询表单
const searchItems = computed(() => [
  {
    label: "字典名称：",
    prop: "dictName",
    component: "el-input",
    style: { width: "220px" },
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    label: "字典类型：",
    prop: "dictType",
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
  {
    label: "创建时间：",
    component: "el-date-picker",
    style: { width: "250px" },
    prop: "dateRange",
    attrs: {
      placeholder: "请选择时间",
      clearable: true,
      type: "daterange",
      "default-time": ["0000-00-00 00:00:00", "0000-00-00 23:59:59"],
      "value-format": "YYYY-MM-DD HH:mm:ss",
      "range-separator": "至",
      "start-placeholder": "",
      "end-placeholder": "",
    },
  },
]);

const tableRef = ref(null); //  表格
const tableData = ref([]);
const defaultExpandAll = ref(false); //  是否默认展开
const bindData = reactive({
  pageOpen: "1", //  是否需要分页
  checkBox: "1", //  是否需要复选框
  light: "1", //  是否需要高亮
  primaryKey: "dictId",
  method: "get",
  btnList: [
    { btnType: "add" }, //  新增
    { btnType: "edit", text: "修改" }, //  编辑
    { btnType: "delete" },
    { btnType: "add", text: "导出", icon: "", img: "/ItemImg/pldc.svg" },
    { btnType: "add", text: "刷新策略", icon: "Refresh" },
  ], // 表格按钮
  apiUrl: "/system/dict/type/list", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "字典编号",
      columnName: "dictId",
      columnWidth: "150",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "字典名称",
      columnName: "dictName",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "字典类型",
      columnName: "dictType",
      columnWidth: "300",
      showOverflowTooltip: true,
      isClick: true,
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
      columnWidth: "300",
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

const tableCellClick = async (row, column, $index) => {
  console.log(row, column, $index, 111);
  if (row?.column?.columnName === "dictType") {
    router.push({
      path: "/dictData",
      query: { dictType: row?.row?.dictType, },
    });
  }

};

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
          message: "修改成功!",
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
  dictName: "",
  dictType: "",
  status: "0",
  remark: "",
  dictId: "",
});
const dictItems = computed(() => [
  {
    label: "字典名称",
    prop: "dictName",
  },
  {
    component: "el-input",
    label: "字典类型",
    prop: "dictType",
    attrs: {
      placeholder: "",
      clearable: true,
    },
  },
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
    },
  },
]);
//校验
let addOrEditRules = reactive({
  //新增弹窗校验
  dictName: [
    {
      required: true,
      message: "字典名称不能为空",
      trigger: ["blur"],
    },
  ],
  dictType: [
    {
      required: true,
      message: "字典类型不能为空",
      trigger: ["blur"],
    },
  ],
});

const btnClick = async (item, row) => {
  if (item.text == "新增") {
    dialogTitle.value = "新增字典";
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      if (item == "status") {
        addOrEditForm[item] = "0";
      } else {
        addOrEditForm[item] = "";
      }
    });
    addDialogVisible.value = true;
    nextTick(() => {
      addOrEditFormRef.value.clearValidate();
    });
  } else if (item.text == "修改") {
    dialogTitle.value = "修改字典";
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
        let dictIds = row.map((item) => item.dictId).join(",");
        delType(dictIds).then((res) => {
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
    for (const key in searchDataTs) {
      if (searchData[key] !== null && searchData[key] !== undefined) {
        formData.append(key, searchData[key]);

      }
    }
    exportDict(formData, "/system/dict/type/export", "字典信息");
  } else if (item.text == "刷新策略") {
    let res = await refreshCache();
    if (res.code == 200) {
      ElMessage({
        type: "success",
        message: "刷新成功!",
      });
      getList();
    }
  }
};

const handleEdit = (row) => {
  dialogTitle.value = "修改字典";
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
      let dictIds = row.dictId;
      delType(dictIds).then((res) => {
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
      if (dialogTitle.value == "新增字典") {
        addType(addOrEditForm).then((res) => {
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
        updateType(addOrEditForm).then((res) => {
          if (res.code == 200) {
            ElMessage({
              type: "success",
              message: "修改成功!",
            });
            getList();
            addDialogVisible.value = false;
          }
        });
      }
    }
  });
};

const getList = async (type) => {
  if (type == "重置") {
    searchData.roleName = ""; // 角色名称
    searchData.roleKey = ""; // 权限字符
    searchData.status = "";
    searchData.dateRange = [];
    searchData.params.beginTime = "";
    searchData.params.endTime = "";
    tableRef.value.fetchData("重置");
  } else {
    searchData.params.beginTime = searchData?.dateRange[0] || "";
    searchData.params.endTime = searchData?.dateRange[1] || "";
    tableRef.value.fetchData();
  }
};

onMounted(() => {
  getList();
});
</script>

<style lang="less" scoped>
.dictIndex-class {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px 0;
  .dictIndex_header {
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
    flex-shrink: 0;
  }
  .dictIndex_table{
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