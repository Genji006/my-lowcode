<!-- 应用注册登记 -->
<template>
  <div class="appRegist-class">
    <div class="appRegist-search">
      <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="" @searchVal="getList()"
        @reset="getList('重置')" :inline="true" />
    </div>
    <div class="appRegist-table">
      <tableList ref="tableRef" :queryParams="searchData" v-bind="bindData" :defaultExpandAll="defaultExpandAll"
        @btnClick="btnClick" @cellClick="tableCellClick" @statusClick="switchChange">
      </tableList>
    </div>
  </div>
  <!-- 新增编辑详情弹窗 -->
  <SzycDialog v-model="addDialogVisible" width="35%" :title="dialogTitle" class="appRegist-submitDialog"
    :alignCenter="true">
    <template #uname>
      <szycSubmitForm :modelValue="addOrEditForm" :items="appItems" ref="addOrEditFormRef" :inline="true"
        labelWidth="auto" :rules="addOrEditRules" :className="'inlineClass'" @submit="addSubmit(addOrEditFormRef)"
        @cancel="addDialogVisible = false" :formProps="{
          disabled: dialogTitle == '详情',
        }" :showAction="dialogTitle != '详情'">
        <template #sourceApplication>
          <el-radio-group v-model="addOrEditForm.sourceApplication" @change="handleAppSourcepChange">
            <el-radio v-for="option in appSourceFn()" :key="option.value" :label="option.value">
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </template>
        <template #cptbdz>
          <el-upload ref="appUpload" v-model:file-list="fileList" style="padding: 0 12px" action="/api/data-ops/upload"
            :headers="headers" multiple :on-preview="handlePreview" :show-file-list="false"
            :before-upload="beforeUpload" :on-success="handleUploadSuccess" :on-remove="handleRemove"
            class="appRegist-upload-demo">
            <img :src="addOrEditForm.cptbdz" alt="" v-if="addOrEditForm.cptbdz" style="width: 24px; height: 24px" />
            <el-icon style="font-size: 24px" v-else>
              <CirclePlus />
            </el-icon>
          </el-upload>
        </template>
      </szycSubmitForm>
    </template>
  </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycSubmitForm from "@/components/element/SubmitForm.vue";
import {
  yesOrNoFn,
  appSourceFn,
  applicationArchitectureFn,
} from "@/types/dict/index";
import tableList from "@/components/table/tableAndPage.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {
  insertIdxCpxxb,
  updateIdxCpxxbStatus,
  deleteIdxCpxxb,
  updateIdxCpxxb,
  getGysNameApi
} from "@/api/appManage/appRegist";
const router = useRouter();

//  查询值
const searchData = reactive({
  cpmc: "",
  sourceApplication: "",
  kyf: "",
  cs: "",
});

const gysList = ref([]);

//  查询表单
const searchItems = computed(() => [
  {
    label: "应用名称：",
    prop: "cpmc",
    component: "el-input",
    style: { width: "220px" },
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    label: "应用来源：",
    prop: "sourceApplication",
    component: "el-select",
    options: appSourceFn(),
    style: { width: "220px" },
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    label: "启用否：",
    prop: "kyf",
    component: "el-select",
    options: yesOrNoFn(),
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true },
  },
  {
    label: "供应商：",
    prop: "cs",
    component: "el-select",
    options: gysList.value,
    optionLabel: "value",
    optionValue: "id",
    style: { width: "220px" },
    attrs: { placeholder: "请选择", clearable: true },
  },
]);

const tableRef = ref(null); //  表格
const defaultExpandAll = ref(false); //  是否默认展开
const bindData = reactive({
  pageOpen: "1", //  是否需要分页
  checkBox: "1", //  是否需要复选框
  light: "1", //  是否需要高亮
  primaryKey: "uuid",
  method: "post",
  btnList: [
    { btnType: "add" }, //  新增
    { btnType: "edit", text: "编辑" }, //  编辑
    { btnType: "detail" },
    { btnType: "delete" },
  ], // 表格按钮
  apiUrl: "/business/idxCpxx/listIdxCpxxb", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "应用名称",
      columnName: "cpmc",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "版本",
      columnName: "cpbb",
      columnWidth: "80",
      align: "center",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "应用URL",
      columnName: "tzlj",
      showOverflowTooltip: true,
      isClick: true,
    },
    {
      columnLabel: "应用来源",
      columnName: "sourceApplication",
      columnWidth: "100",
      formatter: (row, cloumn, index) => {
        return appSourceFn(row.sourceApplication, "formatter");
      },
      showOverflowTooltip: true,
    },
    {
      columnLabel: "AppId",
      columnName: "appId",
      columnWidth: "120",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "密钥",
      columnName: "secretKey",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "应用架构",
      columnName: "applicationArchitecture",
      columnWidth: "90",
      align: "center",
      showOverflowTooltip: true,
      formatter: (row, cloumn, index) => {
        return applicationArchitectureFn(row.applicationArchitecture, "formatter");
      },
    },
    {
      columnLabel: "厂商信息",
      columnName: "CSXX",
      children: [
        {
          columnLabel: "名称",
          columnName: "cs",
          showOverflowTooltip: true,
        },
        {
          columnLabel: "联系人",
          columnName: "cslxr",
          columnWidth: "90",
          showOverflowTooltip: true,
        },
        {
          columnLabel: "联系电话",
          columnWidth: "130",
          align: "center",
          columnName: "cslxrdh",
        },
        {
          columnLabel: "E-mail",
          columnName: "cslxryx",
          columnWidth: "130",
          showOverflowTooltip: true,
        },
      ],
    },
    {
      columnLabel: "启用否",
      columnName: "kyf",
      kyf: "1",
      columnWidth: "80",
      align: "center",
      attrs: { "active-value": "1", "inactive-value": "0" },
    },
  ],
});

// const tableCellClick = async (row, column, $index) => {
//   console.log(row, column, $index, 111);
//   if (row?.column?.columnName === "dictType") {
//     router.push({
//       path: "/dictData",
//       query: { dictType: row?.row?.dictType },
//     });
//   }
// };

const switchChange = async (val) => {
  let params = {
    uuid: val.row.uuid,
    kyf: val.value,
  };
  let res = await updateIdxCpxxbStatus(params);
  if (res.code == 200) {
    ElMessage.success(val.value == 1 ? "已启用" : "已禁用");
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
  } else {
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
    return;
  }
};

const addDialogVisible = ref(false);
const dialogTitle = ref("新增字典");
const addOrEditFormRef = ref(null);
const appUpload = ref(null);
const addOrEditForm = reactive({
  sourceApplication: "",
  cpmc: "",
  cpbb: "",
  tzlj: "",
  cptbdz: "",
  applicationArchitecture: "",
  kyf: "1",
  px: 1,
  uuid: "",
  cs: "",
  cslxr: "",
  cslxrdh: "",
  cslxryx: "",
  menuGroupPath: "",
  menuPath: "",
  cpsm: "",
});
const appItems = computed(() => {
  const isExternalApp = addOrEditForm.sourceApplication && addOrEditForm.sourceApplication !== "0";

  return [
    {
      label: "应用来源",
      prop: "sourceApplication",
    },
    {
      component: "el-input",
      label: "应用名称",
      prop: "cpmc",
      attrs: {
        placeholder: "请输入（输入字符<=50）",
        clearable: true,
        maxlength: 50,
      },
    },
    {
      component: "el-input",
      label: "版本",
      prop: "cpbb",
      attrs: {
        placeholder: "请输入（输入字符<=30）",
        clearable: true,
        maxlength: 30,
      },
    },
    {
      component: "el-input",
      label: "应用进入页URL",
      prop: "tzlj",
      attrs: {
        placeholder: "请输入",
        clearable: true,
      },
    },
    {
      label: "应用图标",
      prop: "cptbdz",
    },
    // 当sourceApplication不为0时显示的厂商信息字段
    ...(isExternalApp ? [
      {
        component: "el-input",
        label: "厂商名称",
        prop: "cs",
        attrs: {
          placeholder: "请输入（输入字符<=30）",
          clearable: true,
          maxlength: 30,
        },
      },
      {
        component: "el-input",
        label: "厂商联系人",
        prop: "cslxr",
        attrs: {
          placeholder: "请输入（输入字符<=30）",
          clearable: true,
          maxlength: 30,
        },
      },
      {
        component: "el-input",
        label: "厂商联系电话",
        prop: "cslxrdh",
        attrs: {
          placeholder: "请输入（输入字符<=30）",
          clearable: true,
          maxlength: 30,
          'show-word-limit': false,
        },
      },
      {
        component: "el-input",
        label: "厂商E-mail",
        prop: "cslxryx",
        attrs: {
          placeholder: "请输入（输入字符<=30）",
          clearable: true,
          maxlength: 30,
        },
      }
    ] : []),
    {
      component: "el-radio-group",
      label: "应用架构模式",
      prop: "applicationArchitecture",
      style: { width: "100% !important" },
      formWidth: { width: "100%" },
      options: applicationArchitectureFn(),
      disabled: addOrEditForm.sourceApplication === "0",
      attrs: {
        placeholder: "",
      },
    },
    // 当sourceApplication不为0时显示的菜单同步接口路径字段
    ...(isExternalApp ? [
      {
        component: "el-input",
        label: "菜单组同步接口路径",
        prop: "menuGroupPath",
        attrs: {
          placeholder: "请输入",
          clearable: true,
        },
      },
      {
        component: "el-input",
        label: "菜单项同步接口路径",
        prop: "menuPath",
        attrs: {
          placeholder: "请输入",
          clearable: true,
        },
      }
    ] : []),
    {
      component: "el-switch",
      label: "启用否",
      prop: "kyf",
      attrs: {
        placeholder: "",
        clearable: true,
        activeValue: "1",
        inactiveValue: "0",
      },
    },
    {
      component: "el-input-number",
      label: "展示顺序",
      prop: "px",
      attrs: {
        min: 1,
        max: 100,
        placeholder: "请输入",
        clearable: true
      },
    },
    {
      component: "el-input",
      label: "应用简介：",
      prop: "cpsm",
      attrs: {
        type: "textarea",
        placeholder: "请输入",
        clearable: true,
        rows: 3,
        resize: "none",
      },
    },
  ];
});
const headers = ref({
  Authorization: sessionStorage.getItem("token"),
});

//校验
let addOrEditRules = reactive({
  //新增弹窗校验
  sourceApplication: [
    {
      required: true,
      message: "应用来源不能为空",
      trigger: ["change"],
    },
  ],
  cpmc: [
    {
      required: true,
      message: "应用名称不能为空",
      trigger: ["blur"],
    },
  ],
  cpbb: [
    {
      required: true,
      message: "版本不能为空",
      trigger: ["blur"],
    },
  ],
  tzlj: [
    {
      required: true,
      message: "应用进入页URL不能为空",
      trigger: ["blur"],
    },
  ],
  cptbdz: [
    {
      required: true,
      message: "应用图标不能为空",
      trigger: ["change"],
    },
  ],
  applicationArchitecture: [
    {
      required: true,
      message: "应用架构模式不能为空",
      trigger: ["change"],
    },
  ],
  cs: [
    {
      required: true,
      message: "厂商名称不能为空",
      trigger: ["blur"],
    },
  ],
  cslxr: [
    {
      required: true,
      message: "厂商联系人不能为空",
      trigger: ["blur"],
    },
  ],
  cslxrdh: [
    {
      required: true,
      message: "厂商联系电话不能为空",
      trigger: ["blur"],
    },
    {
      pattern: /^1[3-9]\d{9}$|^\d{3,4}-?\d{7,8}$/,
      message: "请输入有效的电话号码（手机号或固话）",
      trigger: ["blur"],
    }
  ],
  cslxryx: [
    {
      required: true,
      message: "厂商E-mail不能为空",
      trigger: ["blur"],
    },
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "请输入有效的邮箱地址",
      trigger: ["blur"],
    },
  ],
});

const btnClick = async (item, row) => {
  if (item.text == "新增") {
    dialogTitle.value = "新增";
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      if (item == "kyf") {
        addOrEditForm[item] = "1";
      } else if (item == "px") {
        addOrEditForm[item] = 1;
      }
      else {
        addOrEditForm[item] = "";
      }
    });
    addOrEditForm.sourceApplication = "0";
    addOrEditForm.applicationArchitecture = "0";
    addDialogVisible.value = true;
    nextTick(() => {
      addOrEditFormRef.value.clearValidate();
    });
  } else if (item.text == "编辑") {
    dialogTitle.value = "编辑";
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      addOrEditForm[item] = row?.[item];
    });
    nextTick(() => {
      addOrEditFormRef.value.clearValidate();
    });
    addDialogVisible.value = true;
  } else if (item.text == "删除") {
    ElMessageBox.confirm("确认删除吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        let idList = row.map((item) => item.uuid);
        deleteIdxCpxxb({ idList }).then((res) => {
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
  } else if (item.text == "详情") {
    dialogTitle.value = "详情";
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      addOrEditForm[item] = row?.[item];
    });
    nextTick(() => {
      addOrEditFormRef.value.clearValidate();
    });
    addDialogVisible.value = true;
  }
};

const handleAppSourcepChange = (val) => {
  // if (val === "0") {
  //   addOrEditForm.applicationArchitecture = "0";
  // } else {
  //   addOrEditForm.applicationArchitecture = "";
  // }
};

const beforeUpload = (file) => {
  // 定义允许的文件类型
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  // 定义最大文件大小（10MB）
  const maxSize = 10 * 1024 * 1024;

  // 检查文件类型是否符合要求
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error("上传文件格式不正确，仅支持 JPG、JPEG、PNG 格式！");
    return false;
  }

  // 检查文件大小是否超过限制
  if (file.size > maxSize) {
    ElMessage.error("上传文件大小不能超过 10MB！");
    return false;
  }

  // 如果校验通过，返回 true 允许上传
  return true;
};

const handleUploadSuccess = (res, file) => {
  console.log(res);
  if (res.code == 200) {
    ElMessage({
      type: "success",
      message: "上传成功!",
    });
    addOrEditForm.cptbdz = res?.url || "";
  } else {
    ElMessage.error(res.msg);
  }
};
const addSubmit = () => {
  addOrEditFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogTitle.value == "新增") {
        insertIdxCpxxb(addOrEditForm).then((res) => {
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
        updateIdxCpxxb(addOrEditForm).then((res) => {
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

const getList = async (type) => {
  if (type == "重置") {
    tableRef.value.fetchData("重置");
  } else {
    tableRef.value.fetchData();
  }
};

const getGys = async () => {
  let res = await getGysNameApi({});
  if (res.code == 200) {
    gysList.value = res?.data?.map((item) => ({
      id: item,
      value: item,
    })) || [];
  }
}

onMounted(() => {
  getList();
  getGys();
});
</script>

<style lang="less" scoped>
.appRegist-class {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px 0;

  .appRegist-search {
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
    flex-shrink: 0;
  }

  .appRegist-table {
    min-height: 0;
    flex: 1;
  }
}

.appRegist-operate-btn {
  color: rgba(0, 115, 237, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>

<style lang="less">
.appRegist-submitDialog {
  .appRegist-upload-demo {
    display: flex;
    align-items: center;
  }

  .el-radio.is-disabled {
    background-color: transparent !important;
  }
}
</style>