<template>
  <div class="menuLibraryManage-class">
    <div class="menuLibraryManage-search">
      <SzycFormSearch
        v-model="searchData"
        :items="searchItems"
        labelWidth=""
        @searchVal="getList()"
        @reset="getList('重置')"
        :inline="true"
      />
    </div>
    <div class="menuLibraryManage-table">
      <tableList
        ref="tableRef"
        :queryParams="searchData"
        v-bind="bindData"
        :defaultExpandAll="defaultExpandAll"
        @btnClick="btnClick"
        @cellClick="tableCellClick"
        @statusClick="switchChange"
      >
        <template #menuIco="{ row }">
          <div style="text-align: center">
            <img
              :src="row.menuIco"
              style="
                width: 29px;
                height: 25px;
                cursor: pointer;
                white-space: wrap;
              "
              v-if="row.menuIco"
            />
          </div>
        </template>
      </tableList>
    </div>
  </div>

    <el-upload
      ref="upload"
      class="upload-demo"
      action="/api/data-ops/business/menu/import"
      :show-file-list="false"
      :pageOpen="false"
      :headers="{ Authorization: token }"
      :on-change="handleUploadChanged"
      :auto-upload="true"
      :before-upload="beforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      accept=".xlsx,.xls"
      :on-progress="handleUploadProgress"
      :data="{ typeCode: childrenCode }"
    >
      <template #trigger>
        <el-button style="display: none" ref="uploadTriggerRef"></el-button>
      </template>
    </el-upload>
  <!-- 新增编辑详情弹窗 -->
  <SzycDialog
    v-model="addDialogVisible"
    width="50%"
    :title="dialogTitle"
    class="menuLibraryManage-submitDialog"
    top="20px"
  >
    <template #uname>
      <szycSubmitForm
        :modelValue="addOrEditForm"
        :items="appItems"
        ref="addOrEditFormRef"
        :inline="true"
        labelWidth="auto"
        :rules="addOrEditRules"
        :className="'inlineClass'"
        @submit="addSubmit(addOrEditFormRef)"
        @cancel="addDialogVisible = false"
        :formProps="{
          disabled: dialogTitle == '详情',
        }"
        :showAction="dialogTitle != '详情'"
      >
        <template #menuIco>
          <div style="border: 1px solid #aeb6c5; width: 100%">
            <el-scrollbar height="130px" style="width: 100%">
              <div class="Ground-Grid" style="width: 100%">
                <div
                  class="grid-item"
                  :key="i"
                  v-for="(i, index) in pictures"
                  @click="selectPicture(i.checkedurl, index)"
                >
                  <div :class="index == crtIndex ? 'iconneis' : 'iconnei'">
                    <img
                      :src="i.url"
                      style="
                        width: 29px;
                        height: 25px;
                        cursor: pointer;
                        white-space: wrap;
                      "
                      v-if="index != crtIndex"
                    />
                    <img
                      :src="i.checkedurl"
                      style="
                        width: 27px;
                        height: 25px;
                        cursor: pointer;
                        white-space: wrap;
                      "
                      v-if="index == crtIndex"
                    />
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </template>
      </szycSubmitForm>
    </template>
  </SzycDialog>

  <!-- 导入失败明细 -->
  <SzycDialog
    :dialogVisible="exportFailDialog"
    width="60%"
    title="导入失败明细"
    :alignCenter="true"
    :before-close="closeExportFailDialog"
  >
    <template #uname>
      <div style="width: 95%; padding-left: 20px; font-size: 16px">
        <div
          style="
            display: flex;
            justify-content: space-between;
            background-color: rgba(237, 239, 245, 1);
            padding: 10px 20px;
            border-radius: 4px;
          "
        >
          <div>
            总数：<span style="color: rgba(0, 115, 237, 1); margin-right: 4px;">{{
              importResData.totalCount
            }}</span
            >条
          </div>
          <div style="display: flex">
            <img src="" alt="" style="margin-right: 4px" /> 成功：<span
              style="color: rgba(0, 156, 86, 1); margin-right: 4px;"
              >{{ importResData.successCount}}</span
            >条
          </div>
          <div style="display: flex">
            <img src="" alt="" style="margin-right: 4px" />失败：<span
              style="color: rgba(192, 0, 0, 1); margin-right: 4px;"
              >{{ importResData.failCount }}</span
            >条
          </div>
          <!-- <div style="color: rgba(102, 102, 102, 1)">
            用时：{{ timeConsumedFn(importResData.timeConsumed) }}
          </div> -->
        </div>
        <div>
          <div style="color: rgba(29, 33, 41, 1); margin: 16px 0 10px">
            失败明细：
          </div>
          <div
            style="
              border: 1px solid #d2d3d4;
              border-radius: 4px;
              padding: 20px 24px;
              max-height: 500px;
              overflow-y: auto;
              display: flex;
              flex-direction: column;
              gap: 10px;
            "
          >
            <div
              v-for="(item, index) in importResData?.errInfo"
              :key="index"
              class="fail-item"
            >
              <div style="line-height: 24px; display: flex; color: #1d2129">
                <div
                  style="
                    color: rgba(249, 65, 68, 1);
                    display: flex;
                    min-width: 40px;
                    height: 24px;
                    align-items: center;
                    font-size: 16px;
                  "
                >
                  <img
                    src="/src/assets/ItemImg/failImport.svg"
                    alt=""
                    style="margin-right: 4px; width: 30px"
                  />
                </div>
                <!-- 失败设备：{{ item.name }}，{{ item.failReason }} -->
                <span style="color: rgba(51, 51, 51, 1); margin-right: 10px">{{
                  item
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="el-dialog-HorizontalLine"></div>
      <div class="el-dialog-buttons">
        <CanCelBtn @click="closeExportFailDialog"> 返回 </CanCelBtn>
        <!-- <buttonDiv
          @click="exportFailData"
          type="autoWidth"
        >
          下载导入失败数据
        </buttonDiv> -->
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick, h, } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycSubmitForm from "@/components/element/SubmitForm.vue";
import { yesOrNoFn } from "@/types/dict/index";
import tableList from "@/components/table/tableAndPage.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import CanCelBtn from "@/components/element/Cancel.vue";
import buttonDiv from "@/components/element/Confirm.vue";
import {
  listIdxCpxxb,
  updateMenuStatus,
  deleteIdxCpxxb,
  updateIdxCpxxb,
} from "@/api/appManage/appRegist";
const token = sessionStorage.getItem("token");
import { menuExport, insert, update, deleteMenu } from "@/api/appManage/menuLibraryManage";
const router = useRouter();
const appList = ref([]);

//  查询值
const searchData = reactive({
  menuName: "",
  cpUuid: "",
  status: "",
});

//  查询表单
const searchItems = computed(() => [
  {
    label: "菜单名称：",
    prop: "menuName",
    component: "el-input",
    style: { width: "220px" },
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    label: "所属应用/平台：",
    prop: "cpUuid",
    component: "el-select",
    options: appList.value,
    optionLabel: "cpmc",
    optionValue: "uuid",
    style: { width: "220px" },
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    label: "启用否：",
    prop: "status",
    component: "el-select",
    options: yesOrNoFn(),
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
  primaryKey: "menuId",
  method: "post",
  btnList: [
    { btnType: "add", text: "新增菜单" }, //  新增
    { btnType: "edit", text: "编辑菜单" }, //  编辑
    { btnType: "add", text: "下载模板", icon: "Download" },
    { btnType: "import", text: "批量导入" },
    { btnType: "delete", text: "删除" }, //  删除
  ], // 表格按钮
  apiUrl: "/business/menu/listCpxxMenuNape", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "菜单名称",
      columnName: "menuName",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "图标",
      columnName: "menuIco",
      columnWidth: "80",
      align: "center",
      showOverflowTooltip: true,
      hasSlot: true,
    },
    {
      columnLabel: "请求链接",
      columnName: "path",
      showOverflowTooltip: true,
      isClick: true,
    },
    {
      columnLabel: "菜单原应用标识",
      columnName: "originalApplyUuid",
      columnWidth: "150",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "所属应用平台",
      columnName: "cpUuid",
      columnWidth: "180",
      showOverflowTooltip: true,
      formatter: (row) => {
        return appList.value.find((item) => item.uuid == row.cpUuid)?.cpmc || "";
      },
    },
    {
      columnLabel: "加载序号",
      columnName: "menuSort",
      showOverflowTooltip: true,
      columnWidth: "100",
    },
    {
      columnLabel: "更新时间",
      columnName: "updateTime",
      showOverflowTooltip: true,
      columnWidth: "180",
    },
    {
      columnLabel: "备注",
      columnName: "remark",
    },
    {
      columnLabel: "启用否",
      columnName: "status",
      kyf: "1",
      columnWidth: "80",
      align: "center",
      attrs: { "active-value": "1", "inactive-value": "0" },
    },
  ],
});

const switchChange = async (val) => {
  let params = {
    menuId: val.row.menuId,
    status: val.value,
  };
  let res = await updateMenuStatus(params);
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
const dialogTitle = ref("新增菜单");
const addOrEditFormRef = ref(null);
const addOrEditForm = reactive({
  menuName: "",
  menuEn: "", //  菜单英文名待修改
  path: "",
  component: "",
  cpUuid: [],
  originalApplyUuid: "", //  菜单原应用标识待修改
  menuIco: "",
  remark: "",
  status: "1",
  menuSort: 1,
  isCache: "1",
  isShow: "1",
  menuId: "",
  menuType: "C",
});
let crtIndex = ref(); //当前点击的报告类型索引
const appItems = computed(() => {
  return [
    {
      label: "菜单名称",
      prop: "menuName",
      attrs: {
        placeholder: "请输入（输入字符<=30）",
        clearable: true,
        maxlength: 30,
      },
    },
    {
      component: "el-input",
      label: "菜单英文名",
      prop: "menuEn",
      attrs: {
        placeholder: "请输入（输入字符<=30）",
        clearable: true,
        maxlength: 30,
      },
    },
    {
      component: "el-input",
      label: "路由地址",
      prop: "path",
      attrs: {
        placeholder: "请输入",
        clearable: true,
      },
    },
    {
      component: "el-input",
      label: "请求路径",
      prop: "component",
      attrs: {
        placeholder: "请输入",
        clearable: true,
      },
    },
    {
      label: "所属应用/平台",
      prop: "cpUuid",
      component: "el-select",
      options: appList.value,
      optionLabel: "cpmc",
      optionValue: "uuid",
      attrs: {
        "multiple":true,
        "collapse-tags":true,
        "collapse-tags-tooltip":true,
        placeholder: "请输入",
        clearable: true,
        // multiple: true,
        // collapseTags: true,
        // filterable: true,
        // collapseTagsTooltip: true,
      },
    },
    {
      component: "el-input",
      label: "菜单原应用标识",
      prop: "originalApplyUuid",
      attrs: {
        placeholder: "",
        clearable: true,
      },
    },
    {
      label: "菜单图标",
      prop: "menuIco",
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
    {
      component: "el-switch",
      label: "启用否",
      prop: "status",
      attrs: {
        placeholder: "",
        clearable: true,
        activeValue: "1",
        inactiveValue: "0",
      },
    },
    {
      component: "el-switch",
      label: "缓存否",
      prop: "isCache",
      attrs: {
        placeholder: "",
        clearable: true,
        activeValue: "1",
        inactiveValue: "0",
      },
    },
    {
      component: "el-switch",
      label: "显示否",
      prop: "isShow",
      attrs: {
        placeholder: "",
        clearable: true,
        activeValue: "1",
        inactiveValue: "0",
      },
    },
    {
      component: "el-input-number",
      label: "加载序号",
      prop: "menuSort",
      attrs: {
        min: 1,
        max: 100,
        placeholder: "请输入",
        clearable: true
      },
    },
  ];
});
const menuIcons = import.meta.glob("@/assets/menuIcon/*.svg");
const itemImgs = import.meta.glob("@/assets/ItemImg/*.svg");
// 构建图标映射数组
let pictures = computed(() => {
  const result = [];

  // 处理menuIcon目录下的图标（b*.svg 和对应的 l*.svg）
  Object.keys(menuIcons).forEach((key) => {
    const fileName = key.split("/").pop(); // 获取文件名，如 b1.svg
    if (fileName && fileName.startsWith("b") && fileName.endsWith(".svg")) {
      const index = fileName.substring(1, fileName.length - 4); // 提取数字部分，如 1
      const lFileName = `l${index}.svg`; // 对应的l文件名，如 l1.svg

      // 检查对应的l文件是否存在
      const lFilePath = key.replace(`/b${index}.svg`, `/l${index}.svg`);

      result.push({
        url: new URL(key, import.meta.url).pathname,
        checkedurl: menuIcons[lFilePath]
          ? new URL(lFilePath, import.meta.url).pathname
          : new URL(key, import.meta.url).pathname,
        assert: key,
      });
    }
  });

  // 处理ItemImg目录下的图标
  Object.keys(itemImgs).forEach((key) => {
    result.push({
      url: new URL(key, import.meta.url).pathname,
      checkedurl: new URL(key, import.meta.url).pathname,
      assert: key,
    });
  });

  return result;
});

//校验
let addOrEditRules = reactive({
  //新增弹窗校验
  menuName: [
    {
      required: true,
      message: "菜单名称不能为空",
      trigger: ["blur"],
    },
  ],
  // 菜单英文名待添加
  menuEn: [
    {
      required: true,
      message: "菜单英文名不能为空",
      trigger: ["blur"],
    },
  ],
  path: [
    {
      required: true,
      message: "路由地址不能为空",
      trigger: ["blur"],
    },
  ],
  component: [
    {
      required: true,
      message: "请求路径不能为空",
      trigger: ["blur"],
    },
  ],
  cpUuid: [
    {
      required: true,
      message: "所属应用/平台不能为空",
      trigger: ["blur"],
    },
  ],
});

const uploadTriggerRef = ref(null);

const btnClick = async (item, row) => {
  if (item.text == "新增菜单") {
    dialogTitle.value = "新增菜单";
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      if (item == "status" || item == "isCache" || item == "isShow") {
        addOrEditForm[item] = "1";
      } else if (item == "menuSort") {
        addOrEditForm[item] = 1;
      } else if (item == "menuType") {
        addOrEditForm[item] = "C";
      } else {
        addOrEditForm[item] = "";
      }
    });
    addDialogVisible.value = true;
    nextTick(() => {
      addOrEditFormRef.value.clearValidate();
    });
  } else if (item.text == "编辑菜单") {
    dialogTitle.value = "编辑菜单";
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      addOrEditForm[item] = row?.[item];
    });
    if (row?.menuIco) {
      for (let i = 0; i < pictures.value.length; i++) {
        if (pictures.value[i].checkedurl == row?.menuIco) {
          selectPicture(pictures.value[i].checkedurl, i);
          break;
        } else {
          selectPicture();
        }
      }
    }
    console.log(addOrEditForm);
    addDialogVisible.value = true;
  } else if (item.text == "删除") {
    ElMessageBox.confirm("此记录一旦删除，可能会影响所关联功能的使用，请慎重操作！确定还要进行本操作吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "error",
    })
      .then(() => {
        let menuIds = row.map((item) => item.menuId);
        deleteMenu({ menuIds }).then((res) => {
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
  } else if (item.text == "下载模板") {
    menuExport("", "business/menu/export", "菜单模板");
  } else if (item.text == "批量导入") {
    // 触发文件选择
    if (uploadTriggerRef.value) {
      uploadTriggerRef.value.$el.click();
    }
  }
};

//导入失败明细
//上传之前的回调(限制文件类型)
function beforeUpload(file) {
  const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
  const whiteList = ["xls", "xlsx"];
  if (whiteList.indexOf(fileSuffix) === -1) {
    ElMessage({
      message: "上传文件只能是xls或xlsx格式",
      type: "error",
    });
    return false;
  }
}

const importLoading = ref(false);
const importResData = ref({});
const exportFailDialog = ref(false);
const timeConsumedFn = (time) => {
  // 确保输入为数字
  const ms = Number(time);
  if (isNaN(ms) || ms < 0) {
    return "0秒";
  }

  // 计算小时、分钟和秒数
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  // 根据情况构建结果字符串
  let result = "";

  if (hours > 0) {
    result += `${hours}小时`;
  }

  if (minutes > 0 || (hours > 0 && seconds > 0)) {
    // 如果有小时且有秒，也要显示分钟（即使为0）
    result += `${minutes}分`;
  }

  if (seconds > 0 || ms < 60000) {
    // 如果总时间小于1分钟，即使秒数为0也显示秒
    result += `${seconds}`;
  }
  console.log(result, "result", time, seconds);
  return result != 0 ? `${result}秒` : "小于1秒";
};

const handleUploadProgress = () => {
  importLoading.value = true;
};

// 导入成功
const handleUploadSuccess = async (data, uploadFile, uploadFiles) => {
  console.log(data, "导入");

  if (data && data.code === 200 && data?.data?.failCount == 0) {
    ElMessage({
      type: "success",
      message: `${data?.data?.totalCount}条数据全部导入成功`,
    });
    upload.value.clearFiles();
    importLoading.value = false;
  } else if (data && data.code === 200 && data?.data?.failCount > 0) {
    console.log(2);
    exportFailDialog.value = true;
    importResData.value = data?.data || {};
    if (data?.data?.errInfo?.length) {
      const array = data?.data?.errInfo
      importResData.value.errInfo = JSON.parse(JSON.stringify(array));
    }
    importLoading.value = false;
    // await pageSearchFn(fatherUuid.value, childrenUuid.value);
  }
  nextTick(() => {
    tableRef.value.fetchData("重置");
  });
};

const closeExportFailDialog = () => {
  // ElMessageBox.confirm(
  //   h("div", null, [
  //     h("div", null, "弹窗关闭后，无法下载失败数据，"),
  //     h("div", { style: { marginTop: "8px" } }, "确认关闭弹窗吗？"),
  //   ]),
  //   "提示",
  //   {
  //     confirmButtonText: "确定",
  //     cancelButtonText: "取消",
  //   }
  // )
  //   .then(() => {
  //     exportFailDialog.value = false;
  //   })
  //   .catch(() => {});
  exportFailDialog.value = false;
};

const exportFailData = async () => {
  // let res = exportDictionFailing(importResData.value.body);
};

let selectPicture = (i, index) => {
  if (i) {
    addOrEditForm.menuIco = i;
    crtIndex.value = index;
  } else {
    addOrEditForm.menuIco = "";
    crtIndex.value = undefined;
  }
};

const addSubmit = () => {
  addOrEditFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogTitle.value == "新增菜单") {
        insert(addOrEditForm).then((res) => {
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
        update(addOrEditForm).then((res) => {
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

const getAppList = async () => {
  let res = await listIdxCpxxb();
  if (res.code == 200) {
    appList.value = res.rows || [];
  }
};

onMounted(() => {
  getList();
  getAppList();
});
</script>

<style lang="less" scoped>
.menuLibraryManage-class {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px 0;
  .menuLibraryManage-search {
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
    flex-shrink: 0;
  }
  .menuLibraryManage-table {
    min-height: 0;
    flex: 1;
  }
}

.menuLibraryManage-operate-btn {
  color: rgba(0, 115, 237, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.Ground-Grid {
  margin: 10px 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, 40px);
  gap: 10px;
  // background-color: #f0f0f0;
  justify-content: center;
}

.grid-item {
  color: white;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.iconnei {
  margin: 2px;
  border-radius: 5.43px;
  background: rgba(242, 242, 242, 1);
  width: 40px;
  height: 25px;
  padding: 8px 6px;
}

.iconneis {
  margin: 2px;
  border-radius: 5.43px;
  background: #fff;
  width: 40px;
  height: 25px;
  padding: 8px 6px;
  border: 1px solid rgb(6, 96, 231);
}


</style>

<style lang="less">
.menuLibraryManage-submitDialog {
  .menuLibraryManage-upload-demo {
    display: flex;
    align-items: center;
  }
  .el-radio.is-disabled {
    background-color: transparent !important;
  }
}
</style>