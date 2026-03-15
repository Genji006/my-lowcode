// 页面列表
<template>
  <div class="approveCss">
    <div class="approve_header">
      <SzycFormSearch
        v-model="searchData"
        :items="searchItems"
        labelWidth=""
        @searchVal="ListFn()"
        @reset="ListFn('重置')"
        :inline="true"
      />
    </div>
    <div style="flex: 1; margin-top: 16px; height: 60%">
      <tableList
        ref="tableRef"
        :queryParams="searchData"
        v-bind="bindData"
        @statusClick="statusClick"
        @btnClick="btnClick"
      />
    </div>
  </div>
  <!-- 复制-->
  <SzycDialog
    :dialogVisible="copyShow"
    :close-on-click-modal="false"
    destroy-on-close
    title="复制流程"
    width="30%"
    class="indexAllocation--indRuleExpr-dialog"
    @close="closeCopy()"
  >
    <template #uname>
      <el-form
        :label-position="labelPosition"
        label-width="auto"
        :model="copyForm"
        ref="copyFormRef"
        :rules="copyFormRules"
      >
        <el-form-item label="流程名称：" prop="name">
          <el-input placeholder="请输入" v-model="copyForm.name"> </el-input>
        </el-form-item>
        <el-form-item label="流程编号：" prop="name">
          <el-input placeholder="请输入" v-model="copyForm.deploymentKey">
          </el-input>
        </el-form-item>
        <el-form-item label="流程类型：" prop="category">
          <el-select placeholder="请选择" v-model="copyForm.category">
            <el-option
              v-for="item in dictList.dict['flow_category']"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务触发" prop="dueDays" style="display: flex;" class="el-form-dueDays-item">
          <el-input v-model="copyForm.dueDays" @change="handleChange" placeholder="请输入大于0的整数" style="width: calc(100% - 80px);" />
          <div style="margin-left: 10px; width: 70px; font-family: Microsoft YaHei;font-size: 17px; color: #000;">天后关闭</div>
        </el-form-item>
        <el-form-item label="启用否：" prop="enabled">
          <el-switch
            v-model="copyForm.enabled"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input
            placeholder="请输入"
            v-model="copyForm.remark"
            type="textarea"
            rows="3"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div style="display: flex; justify-content: center; margin-top: 10px">
        <CanCelBtn @click="closeCopy"> 取消 </CanCelBtn>
        <buttonDiv @click="submitCopyForm"> 保存 </buttonDiv>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import { yesOrNoFn, dataItemTypeList } from "@/types/dict/index";
import tableList from "@/components/table/tableAndPage.vue";
import {
  listAppProjectApi,
  deleteDataItemApi,
  updateDataItemUpdateStatusApi,
} from "@/api/tool.js";
import { useRouter } from "vue-router";
import { dictStore } from "@/store/dict";
import { formatToStandardTime } from "@/types/dict/index";
import { copyDeploymentProcess, batchRemoveRepository, updateRepositoryStatus } from "@/api/workflow";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { ElMessage, ElMessageBox } from "element-plus";

const dictList = dictStore(); //  字典接口

// console.log(dictList.dict['flow_category'],"dictList.dict['flow_category']");

const router = useRouter();

const appList = ref([]); // 所属应用
//  查询值
const searchData = reactive({
  name: "", // 流程名称
  category: "", //  流程类型
  enabled: "", // 启用否
});

//  查询表单
const searchItems = computed(() => [
  {
    label: "流程名称：",
    prop: "name",
    component: "el-input",
    attrs: { placeholder: "请输入" },
  },
  {
    label: "流程类型：",
    prop: "category",
    component: "el-select",
    options: dictList.dict["flow_category"],
    optionLabel: "dictLabel",
    optionValue: "dictValue",
    style: { width: "220px" },
    attrs: { placeholder: "请选择" },
  },
  {
    label: "启用否：",
    prop: "enabled",
    component: "el-select",
    options: yesOrNoFn(),
    style: { width: "220px" },
    attrs: { placeholder: "请选择" },
  },
]);
// 点击某个单元格
const handDataClick = ({ row, column, $index }) => {
  console.log("row:", row);
  console.log("column:", column);
  console.log("$index:", $index);
};

const appLicationOptions = ref([]); //  来源应用选项

const statusClick = ({ row, column, value }) => {
  console.log(row, "row");
  let obj = {
    configId: row.configId,
  };
  updateRepositoryStatus(obj).then((res) => {
    if(res.code === 200){
      ElMessage.success('操作成功')
      tableRef.value.fetchData();
    }
  });
};
const tableRef = ref(null); //  表格
const bindData = reactive({
  pageOpen: "1", //  是否需要分页
  checkBox: "1", //  是否需要复选框
  light: "1", //  是否需要高亮
  primaryKey: "id",
  // method: "get",
  btnList: [
    { btnType: "add", text: "新增流程" }, //  新增
    { btnType: "edit", text: "编辑流程" }, //  编辑
    { btnType: "copy", text: "复制流程" }, //  复制
    { btnType: "delete" }, //  删除
  ], // 表格按钮
  // apiUrl: "/flow/listDeploy", //  接口地址pageDeploy
  apiUrl: "/flow/pageDeploy", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    { columnLabel: "流程编号", columnName: "key", columnWidth: "200" },
    { columnLabel: "流程名称", columnName: "defName", columnWidth: "300" },
    {
      columnLabel: "流程类型",
      columnName: "category",
      formatter: (row, cloumn, index) => {
        return dictList.dict["flow_category"].find(
          (item) => item.dictValue === row.category
        )?.dictLabel;
      },
      columnWidth: "160",
    },
    // { columnLabel: "关联模型", columnName: "" },
    {
      columnLabel: "流程节点数",
      columnName: "activityCount",
      columnWidth: "120",
      align: "center",
    },
    {
      columnLabel: "版本",
      columnName: "version",
      columnWidth: "100",
      align: "center",
    },
    {
      columnLabel: "启用否",
      kyf: "1",
      columnName: "enabled",
      align: "center",
      columnWidth: "100",
      attrs: { "active-value": 1, "inactive-value": 0 },
    },
    {
      columnLabel: "备注",
      columnName: "remark",
    },
    {
      columnLabel: "创建时间",
      columnName: "createTime",
      align: "center",
      columnWidth: "180",
      formatter: (row, cloumn, index) => {
        return formatToStandardTime(row.createTime);
      },
    },
    {
      columnLabel: "创建人",
      columnName: "createBy",
      columnWidth: "150",
    },
  ],
});

//保存部署弹窗
const copyShow = ref(false);
const copyFormRef = ref(null);
const copyForm = reactive({
  name: "",
  category: "",
  enabled: 1,
  remark: "",
  deploymentId: "",
  deploymentKey: "",
  dueDays: "",
});
const copyFormRules = {
  name: [{ required: true, message: "请输入流程名称", trigger: "blur" }],
  deploymentKey: [
    { required: true, message: "请输入流程编号", trigger: "blur" },
  ],
  category: [{ required: true, message: "请选择流程类型", trigger: "change" }],
};

const closeCopy = () => {
  copyShow.value = false;
};

const handleChange = (value) => {
  const positiveIntegerRegex = /^[1-9]\d*$/;
  if (!positiveIntegerRegex.test(value)) {
    copyForm.dueDays = parseInt(value) || null
  }
}

const submitCopyForm = async () => {
  copyFormRef.value.validate(async (valid) => {
    if (valid) {
      const obj = { ...copyForm };
      console.log(obj, "obj");
      let res = await copyDeploymentProcess(obj);
      if (res.code == 200) {
        ElMessage.success("保存成功");
        copyShow.value = false;
        ListFn();
      }
    } else {
      ElMessage.error("请您填写必填信息");
      return;
    }
  });
};

//  列表接口
const ListFn = (type) => {
  tableRef.value.fetchData(type);
};

// 应用项目
const appLicationOptionsFn = () => {
  let obj = {};
  listAppProjectApi(obj).then((res) => {
    appLicationOptions.value = res.data.map((item) => {
      return {
        ...item,
        label: item.projectName,
        value: item.id,
      };
    });
  });
};

//  表格按钮点击事件
const btnClick = (item, row) => {
  if (item.btnType == "add") {
    router.push({ path: "/panelIndex", query: {} });
  } else if (item.btnType == "edit") {
    console.log(row, "编辑数据");
    router.push({
      path: "/panelIndex",
      query: {
        id: row?.id,
        category: row?.category,
        enabled: row?.enabled,
        remark: row?.remark,
        name: row?.defName,
        key: row?.key,
        dueDays: row?.dueDays,
        configId: row?.configId,
      },
    });
  } else if (item.btnType == "copy") {
    copyShow.value = true;
    copyForm.name = row.defName;
    copyForm.deploymentId = row.id;
    copyForm.category = row.category;
    copyForm.remark = row.remark;
    copyForm.enabled = row.enabled;
    copyForm.dueDays = row.dueDays;
    copyForm.deploymentKey = row.key + "_copy";
    nextTick(() => {
      copyFormRef.value.clearValidate();
    });
  } else if (item.btnType == "delete") {
    console.log(row, "删除数据");
    ElMessageBox.confirm("是否确认删除勾选流程？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(async () => {
      batchRemoveRepository(row.map((item) => item.key)).then((res) => {
        if (res.code == 200) {
          ElMessage.success("删除成功");
          ListFn();
        }
      });
    });
  }
};

onMounted(() => {
  ListFn();
  appLicationOptionsFn();
});
</script>

<style lang="scss" scoped>
.approveCss {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .approve_header {
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
  }
  .cg_content {
    margin-top: 10px;
    height: calc(100% - 90px);
    background-color: rgba(253, 253, 251);
    padding: 10px;
    box-sizing: border-box;
  }
  .pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
  }
}
</style>
<style lang="scss">
.groupDialogCss {
  .el-overlay-dialog {
    overflow: hidden !important;
  }
}
</style>


