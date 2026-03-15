<!-- 登录日志 -->
<template>
  <div class="taskGroupManage-all-class">
    <div class="taskGroupManage-search-class">
      <searchForm :modelValue="queryParams" :items="searchItems" :inline="true" labelWidth="" @reset="handleReset"
        @searchVal="handleSearch">
      </searchForm>
    </div>
    <div class="taskGroupManage-table-class">
      <tableAndPage ref="tableRef" apiUrl="/task/getJobs" :queryParams="queryParams" :btnList="operationList"
        :designTableColumns="designTableColumns" :showBorder="true" :light="true" @btnClick="buttonClick"
        @selection-change="handleSelectionChange" @rowClick="rowClick" primaryKey="jobId" :reserveSelection="true"
        v-bind="{ showBorder: 1, pageOpen: 1 }" :interfaceType="{ type: 'POST', parameterType: 'special' }">
      </tableAndPage>
    </div>
  </div>
  <!-- 编辑作业 -->
  <SzycDialog :dialogVisible="transNameShow" :close-on-click-modal="false" destroy-on-close title="修改作业名" width="25%"
    @close="transNameShow = false">
    <template #uname>
      <SubmitForm :modelValue="submitParams" :items="submitItems" :labelWidth="auto" :rules="editNameRules"
        @cancel="closeEdit()" @submit="submitAddOrEdit">
      </SubmitForm>
    </template>
  </SzycDialog>

  <!-- 作业属性 -->
  <SzycDialog :dialogVisible="visibleUserShow" :close-on-click-modal="false" destroy-on-close title="作业属性" width="25%"
    @close="closeVisibleUser()">
    <template #uname>
      <tableAndPage ref="transDetailRef" :apiUrl="belongToTask" primaryKey="belongToTaskGroup"
        :designTableColumns="visibleUserTableColumns" :showBorder="true" v-bind="{ showBorder: 1, }" :checkBox="false">
      </tableAndPage>
    </template>
  </SzycDialog>

  <SzycDialog :dialogVisible="taskGroupDialogVisible" width="30%" @close="taskGroupDialogVisible = false" title="分配任务组"
    :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <TaskGroupSelector :taskSelectedArray="belongToTask" ref="taskGroupSelectorRef" />
      <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
        <SzycCancel @click="taskGroupDialogVisible = false">取消</SzycCancel>
        <szycButton type="primary" @click="setDist">确定</szycButton>
      </div>
    </template>
  </SzycDialog>
</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import searchForm from "@/components/element/SearchForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";
import {
  updateTaskName,
  assignedTaskGroup,
  transDetail,
  powerExecuteexport,
  deleteTrans
} from "@/api/kettleApi/transManage.js";
import { ElMessage, ElMessageBox } from "element-plus"
import TaskGroupSelector from '../models/component/TaskGroupSelector.vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import SubmitForm from '@/components/element/SubmitForm.vue'
import { useRouter } from "vue-router";
const router = useRouter();

const tableRef = ref(null);
const tableRowData = ref({});
const tableSelectList = ref([]);
//  新增/编辑
const addOrEditShow = ref(false);
const addOrEditTitle = ref("");
const taskAllocationShow = ref(false);
const taskAllocationRef = ref(null);
const visibleUserShow = ref(false);
const visibleUserRef = ref(null);
const transNameShow = ref(false);
const transDetailRef = ref(null);

const taskAllocationShows = ref(false);
const taskAllocationRefs = ref(null);

const allocationData = ref({});
const taskAllSelectedList = ref([]);

const changeName = ref("")
const belongToTask = ref([])
const taskGroupSelectorRef = ref(null) // 任务组选择器引用
const taskGroupDialogVisible = ref(false)

//  查询条件
const queryParams = reactive({
  taskGroupName: "", //  任务组名
  createDate: [], //  创建日期
});

const searchItems = ref([
  {
    component: "el-input",
    label: "转换名称",
    style: { width: "250px" },
    prop: "name",
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    component: "el-date-picker",
    label: "创建时间：",
    style: { width: "250px" },
    prop: "date",
    attrs: {
      placeholder: "请选择",
      clearable: true,
      "value-format": "YYYY-MM-DD",
    },
  },
]);

//  表格数据
const designTableColumns = ref([
  {
    columnLabel: "目录",
    columnName: "directoryName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "转换名",
    columnName: "name",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "创建用户",
    columnName: "createUser",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "创建时间",
    columnName: "createDate",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "最终修改者",
    columnName: "modifiedUser",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "修改时间",
    columnName: "modifiedDate",
    align: "center",
    showOverflowTooltip: true,
  },
]);

//修改转换名称弹窗
const submitParams = reactive({
  oldName: "", // 旧作业名称
  newName: "", // 新作业名称
});

const submitItems = ref([
  {
    component: "el-input",
    label: "转换名称：",
    style: { width: "250px" },
    prop: "newName",
    attrs: { placeholder: "请输入", clearable: true },
  },
]);

const editNameRules = ref({
  newName: [
    { required: true, message: "请输入", trigger: "blur" },
  ],
});

const selectRowList = ref([]);
const taskAllSelectList = ref([]);
const visUserSelectionList = ref([]);

const rowClick = (val) => {
  tableRowData.value = val;
  changeName.value = val.name;
};

const handleSelectionChange = (val) => {
  selectRowList.value = val;
  console.log("选中行val", val);
};

const operationList = ref([
  {
    text: "新增作业",
    btnType: "add",
  },
  {
    text: "编辑作业",
    btnType: "edit",
  },
  {
    text: "编辑名称",
    btnType: "edit",
  },
  {
    text: "作业属性",
    btnType: "detail",
    typeRow: 'rowType',
  },
  // {
  //   text: "结构图",
  //   img: "/ItemImg/jiegou.svg",
  //   typeRow: 'rowType',
  // },
  // {
  //   text: "执行转换配置",
  //   img: "/ItemImg/play.svg",
  //   typeRow: 'rowType',
  // },
  {
    text: "分配任务组",
    img: "/ItemImg/sitemap.svg",
    typeRow: 'rowType',
  },
  // {
  //   text: "智能执行",
  //   img: "/ItemImg/squareplay.svg",
  //   typeRow: 'rowType',
  // },
  {
    btnType: "delete",
  },
]);

//  查询
const handleSearch = () => {
  if (!tableRef.value) return;
  // specialHandle(queryParams.createDate);
  tableRef.value.fetchData("重置");
};

const handleReset = () => {
  if (!tableRef.value) return;
  queryParams.createDate = [];
  // specialHandle(queryParams.createDate);
  tableRef.value.fetchData("重置");
};

const convertStringToArray = (str, keyName = 'belongToTaskGroup') => {
  const items = str?.split(',') || [];
  return items.map(item => ({ [keyName]: item.trim() }));
};

// 按钮事件
const buttonClick = async (val, rowVal) => {
  console.log("val11", val, rowVal);
  belongToTask.value = convertStringToArray(rowVal.belongToTaskGroup);
  // 首次刷新列表获取第一行数据
  tableRowData.value = rowVal;
  switch (val.text) {
    case "新增作业":
      router.push({ path: "/homework" });
      break;
    case "编辑作业":
      router.push({
        path: "/editJob",
        query: {
          directoryName: tableRowData.value.directoryName,
          jobName: tableRowData.value.name
        }
      });
      break;
    case "编辑名称":
      transNameShow.value = true;
      submitParams.oldName = rowVal.name;
      break;
    case "作业属性":
      visibleUserShow.value = true;
      nextTick(() => {
        transDetailRef?.value?.fetchData();
      });
      break;
    case "结构图":

      break;
    case "执行转换配置":
      runTrans();
      break;
    case "分配任务组":
      taskGroupDialogVisible.value = true
      break;
    case "智能执行":
      powerExecute()
      break;
    case "删除":
      ElMessageBox.confirm(
        `此操作将删除所选的作业，无法找回。确定删除吗？`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(async () => {
        try {
          let res = await deleteTrans({ path: selectRowList.value[selectRowList.value.length - 1].directoryName, flag: "job" });
          ElMessage.success("删除成功")
          nextTick(async () => {
            if (tableRef.value) {
              tableRef.value.fetchData();
            }
          });
        } catch {
          ElMessage.error("删除失败")
        }
      })
      break;
  }
};

// 确认修改任务组
const setDist = async () => {
  let selectedTaskGroups = taskGroupSelectorRef.value.getSelectedGroups()
  if (!selectedTaskGroups || selectedTaskGroups.length === 0) {
    ElMessage.warning('请至少选择一个任务组')
    return
  }
  let params = {
    taskId: tableRowData.value.jobId,
    taskName: tableRowData.value.name,
    taskPath: tableRowData.value.directoryName,
    taskGroupNameArray: selectedTaskGroups,
    type: "job"
  }
  let res = await assignedTaskGroup(params)
  if (res == "success") {
    ElMessage.success("任务组分配成功")
    taskGroupDialogVisible.value = false
  } else {
    ElMessage.error("任务组分配失败")
  }
}

// 执行转换配置
const runTrans = async () => {
  let params = {
    taskName: tableRowData.value.directoryName,
    type: "job"
  }
  let res = await transDetail(params)
}

// 智能执行
const powerExecute = async () => {
  let params = {
    path: tableRowData.value.directoryName,
    powerFlag: "transformation"
  }
  let res = powerExecuteexport(params)
}

const closeEdit = () => {
  transNameShow.value = false;
  submitParams.newName = "";
  submitParams.oldName = "";
};

const submitAddOrEdit = async () => {
  let obj = {
    oldName: submitParams.oldName,
    newName: submitParams.newName,
    type: "job"
  };
  let res = await updateTaskName(obj);
  console.log(res);
  if (res == "OK") {
    ElMessage.success("修改成功");
    transNameShow.value = false;
    nextTick(() => {
      tableRef.value?.fetchData();
    });
  }
};

const taskAllSelectionChange = (val) => {
  taskAllSelectList.value = val;
};

const closeTaskAllocation = () => {
  taskAllocationShow.value = false;
};

const submitTaskAllocation = () => {
  taskAllocationShow.value = false;
};

const taskAllocationTableColumns = ref([
  {
    columnLabel: "任务ID",
    columnName: "taskId",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "任务类型",
    columnName: "type",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "任务名",
    columnName: "taskName",
    columnWidth: "250",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "任务全目录名",
    columnName: "taskPath",
    columnWidth: "250",
    align: "center",
    showOverflowTooltip: true,
  },
]);


const closeVisibleUser = () => {
  belongToTask.value = [];
  visibleUserShow.value = false;
};

const visibleUserTableColumns = ref([
  {
    columnLabel: "所属任务组",
    columnName: "belongToTaskGroup",
    showOverflowTooltip: true,
  },
]);

//任务组详情
const transformPropertyShow = ref(false);

const closeTransformProperty = () => {
  transformPropertyShow.value = false;
};

const submitTransformProperty = () => {
  transformPropertyShow.value = false;
};

// 任务组详情
const taskDetailTableColumns = ref([
  {
    columnLabel: "任务类型",
    columnName: "type",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "任务名",
    columnName: "taskName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "任务全目录名",
    columnName: "taskPath",
    showOverflowTooltip: true,
  },
]);
const taskAllocationColumns = ref([
  {
    columnLabel: "任务组名",
    columnName: "taskGroupName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "任务组描述",
    columnName: "taskGroupDesc",
    showOverflowTooltip: true,
  },

])

const allocationBtnList = ref([
  {
    btnType: "cancel",
  },
  {
    btnType: "confirm",
  },
]);
const openAllocation = (val) => {
  allocationData.value = val;
  taskAllocationShows.value = true;
  nextTick(() => {
    taskAllocationRefs.value?.fetchData();
  });
};

const taskAllocationChange = (val) => {
  console.log(val, 5555);
  taskAllSelectedList.value = val;
}

onMounted(async () => {
  nextTick(async () => {
    if (tableRef.value) {
      tableRef.value.fetchData();
    }
  });
});
</script>

<style lang="scss" scoped>
.taskGroupManage-all-class {
  width: 100%;
  height: 100%;

  .taskGroupManage-search-class {
    width: 100%;
    height: 94px;
    display: flex;
    align-items: center;
    background-color: #fff;
  }

  .taskGroupManage-table-class {
    height: calc(99% - 94px);
    margin-top: 1%;
  }
}
</style>