<!-- 任务组管理 -->
<template>
  <div class="taskGroupManage-all-class">
    <div class="taskGroupManage-search-class">
      <searchForm
        :modelValue="queryParams"
        :items="searchItems"
        :inline="true"
        labelWidth=""
        @reset="handleReset"
        @searchVal="handleSearch"
      >
      </searchForm>
    </div>
    <div class="taskGroupManage-table-class">
      <tableAndPage
        ref="tableRef"
        apiUrl="/taskGroup/AlltaskGroup"
        :queryParams="queryParams"
        :btnList="operationList"
        :designTableColumns="designTableColumns"
        :showBorder="true"
        :light="true"
        @btnClick="buttonClick"
        @selectionChange="handleSelectionChange"
        @rowClick="rowClick"
        primaryKey="taskGroupId"
        :reserveSelection="true"
        v-bind="{ showBorder: 1, pageOpen: 1 }"
        :interfaceType="{ type: 'POST', parameterType: 'special' }"
      >
      </tableAndPage>
    </div>
  </div>
  <!-- 新增-->
  <SzycDialog
    :dialogVisible="addOrEditShow"
    :close-on-click-modal="false"
    destroy-on-close
    :title="addOrEditTitle"
    width="25%"
    @close="closeAddOrEdit()"
  >
    <template #uname>
      <SubmitForm
        :modelValue="submitParams"
        :buttonName="addOrEditTitle === '新增' ? '下一步' : '确定'"
        :items="submitItems"
        :inline="true"
        :labelWidth="auto"
        :rules="addOrEditRules"
        @cancel="closeAddOrEdit()"
        @submit="submitAddOrEdit"
      >
      </SubmitForm>
    </template>
  </SzycDialog>
  <!-- 任务分配 -->
  <SzycDialog
    :dialogVisible="taskAllocationShow"
    :close-on-click-modal="false"
    destroy-on-close
    title="选择需要分配的任务"
    width="80%"
    @close="closeTaskAllocation()"
  >
    <template #uname>
      <tableAndPage
        ref="taskAllocationRef"
        apiUrl="/taskGroup/getAllTaskBeforeAdd"
        :bottomBtnList="bottomBtnList"
        :designTableColumns="taskAllocationTableColumns"
        :showBorder="true"
        @btnBottomClick="btnBottomClick"
        @selectionChange="taskAllSelectionChange"
        @rowClick="taskAllrowClick"
        :isKey="true"
        :reserveSelection="true"
        v-bind="{ showBorder: 1 }"
        style="height: 620px"
      >
      </tableAndPage>
    </template>
  </SzycDialog>
  <!-- 可见用户 -->
  <SzycDialog
    :dialogVisible="visibleUserShow"
    :close-on-click-modal="false"
    destroy-on-close
    title="选择可见用户组"
    width="80%"
    @close="closeVisibleUser()"
  >
    <template #uname>
      <tableAndPage
        ref="visibleUserRef"
        apiUrl="/userGroup/beforeAdd"
        :bottomBtnList="bottomBtnLists"
        :designTableColumns="visibleUserTableColumns"
        :showBorder="true"
        @btnBottomClick="btnBottomClicks"
        @selectionChange="visUserSelectionChange"
        @rowClick="visUserRowClick"
        primaryKey="userGroupId"
        :reserveSelection="true"
        v-bind="{ showBorder: 1 }"
        style="height: 600px"
      >
      </tableAndPage>
    </template>
  </SzycDialog>
  <!-- 任务组详情 -->
  <SzycDialog
    :dialogVisible="taskDetailShow"
    :close-on-click-modal="false"
    destroy-on-close
    title="任务组详情"
    width="80%"
    @close="taskDetailShow = false"
  >
    <template #uname>
      <tableAndPage
        ref="taskDetailRef"
        apiUrl="/taskGroup/selectTaskGroup"
        :queryParams="{ taskGroupName: tableRowData?.taskGroupName }"
        :designTableColumns="taskDetailTableColumns"
        :showBorder="true"
        :showActionColumn="true"
        @selectionChange="taskDetailSelectionChange"
        @rowClick="taskDetailClick"
        primaryKey="infoId"
        :checkBox="false"
        :reserveSelection="true"
        :pageOpen="false"
        v-bind="{ showBorder: 1 }"
        style="height: 600px"
        :interfaceType="{ type: 'POST', parameterType: 'special' }"
      >
        <template #action="{ row }">
          <img
            src="/src/assets/ItemImg/xiangqing.svg"
            @click.stop="openAllocation(row)"
          />
        </template>
      </tableAndPage>
    </template>
  </SzycDialog>
  <!-- 任务组分配 -->
  <SzycDialog
    :dialogVisible="taskAllocationShows"
    :close-on-click-modal="false"
    destroy-on-close
    title="任务组分配"
    width="80%"
    @close="taskAllocationShows = false"
  >
    <template #uname>
      <tableAndPage
        ref="taskAllocationRefs"
        apiUrl="/taskGroup/isContainsTaskBeforeAssigned"
        :queryParams="{ name: allocationData.taskName, type: allocationData.type }"
        :designTableColumns="taskAllocationColumns"
        :showBorder="true"
        :bottomBtnList="allocationBtnList"
        @btnBottomClick="allocationBottomClicks"
        @selectionChange="taskAllocationChange"
        @rowClick="taskAllocationClick"
        primaryKey="taskGroupId"
        :reserveSelection="true"
        v-bind="{ showBorder: 1 }"
        style="height: 600px"
        :selectSettings="{ key:'isContainsTask', label:'YES' }"
        :interfaceType="{ type: 'POST', parameterType: 'special' }"
      >
      </tableAndPage>
    </template>
  </SzycDialog>
</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import searchForm from "@/components/element/SearchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";
import {
  decideGroupNameExist,
  addTaskGroup,
  addTaskGroups,
  updateTaskGroup,
  selectTaskGroup,
  deleteTaskGroup,
  assignedTaskGroup,
} from "@/api/kettleApi/taskGroupManage.js";
import { ElMessage, ElMessageBox } from "element-plus";
// import {
//   loginTypeFn,
//   loginFromFn,
// } from "@/types/dict/index";

const fnRow = (data) => {
  console.log(data, "data");
};

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
const taskDetailShow = ref(false);
const taskDetailRef = ref(null);

const taskAllocationShows = ref(false);
const taskAllocationRefs = ref(null);

const allocationData = ref({});
const taskAllSelectedList = ref([]);

//  查询条件
const queryParams = reactive({
  taskGroupName: "", //  任务组名
  createDate: [], //  创建日期
});

const searchItems = ref([
  {
    component: "el-input",
    label: "任务组名：",
    style: { width: "250px" },
    prop: "taskGroupName",
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    component: "el-date-picker",
    label: "创建时间：",
    style: { width: "250px" },
    prop: "createDate",
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
    columnLabel: "任务组名",
    columnName: "taskGroupName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "任务组描述",
    columnName: "taskGroupDesc",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "创建时间",
    columnName: "createDate",
    columnWidth: "250",
    align: "center",
    showOverflowTooltip: true,
  },
]);

//新增编辑弹窗
const submitParams = reactive({
  taskGroupName: "", //  任务组名
  taskGroupDesc: "", //  任务组描述
});

const submitItems = ref([
  {
    component: "el-input",
    label: "任务组名：",
    style: { width: "250px" },
    prop: "taskGroupName",
    attrs: { placeholder: "请选择", clearable: true },
  },
  {
    component: "el-input",
    label: "任务组描述：",
    style: { width: "250px" },
    prop: "taskGroupDesc",
    attrs: {
      placeholder: "请选择",
      clearable: true,
      type: "textarea",
      rows: 3,
    },
  },
]);

const addOrEditRules = ref({
  taskGroupName: [
    { required: true, message: "请输入任务组名", trigger: "blur" },
  ],
});

const selectRowList = ref([]);
const taskAllSelectList = ref([]);
const visUserSelectionList = ref([]);

const rowClick = (val) => {
  tableRowData.value = val;
  console.log("高亮行val11", val);
};

const handleSelectionChange = (val) => {
  selectRowList.value = val;
  console.log("选中行val", val);
};

const operationList = ref([
  {
    btnType: "add",
    bind: { type: "base" },
  },
  {
    btnType: "edit",
  },
  {
    text: "任务组详情",
    btnType: "detail",
  },
  {
    btnType: "deletes",
  },
]);

const specialHandle = (val) => {
  if (val?.length) {
    queryParams.beginTime = val[0];
    queryParams.endTime = val.length > 1 ? val[1] : "";
  } else {
    queryParams.beginTime = "";
    queryParams.endTime = "";
  }
};

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

// 按钮事件
const buttonClick = async (val, lightVal) => {
  tableRowData.value = lightVal;
  console.log("val11", val);
  if (val.btnType === "add") {
    addOrEditShow.value = true;
    addOrEditTitle.value = "新增";
  } else if (val.btnType === "edit") {
    addOrEditShow.value = true;
    addOrEditTitle.value = "编辑";
    submitParams.taskGroupName = tableRowData.value?.taskGroupName;
    submitParams.taskGroupDesc = tableRowData.value?.taskGroupDesc;
  } else if (val.btnType === "detail") {
    taskDetailShow.value = true;
    nextTick(() => {
      taskDetailRef?.value?.fetchData();
    });
  } else if (val.btnType === "deletes") {
    let res = await selectTaskGroup({ taskGroupName: tableRowData.value?.taskGroupName });
    if(res.length == 0){
      let ress = await deleteTaskGroup({ name: tableRowData.value?.taskGroupName });
      if(ress == 'success'){
        ElMessage.success('删除成功');
        tableRef.value?.fetchData();
      }
    } else {
      ElMessage.error('该任务组下存在任务,请至任务组详情功能中移除!');
    }
  }
};

const closeAddOrEdit = () => {
  addOrEditShow.value = false;
  submitParams.taskGroupName = "";
  submitParams.taskGroupDesc = "";
};

const submitAddOrEdit = async (val, type) => {
  console.log(val, type, 11);
  if (type == "下一步") {
    let res = await decideGroupNameExist({ name: val.taskGroupName });
    console.log(res, 22);
    if (res == "Y") {
      ElMessage.error("该任务组名已存在");
    } else if (res == "N") {
      taskAllocationShow.value = true;
      nextTick(() => {
        if (taskAllocationRef.value) {
          taskAllocationRef.value.fetchData();
        }
      });
    }
  } else if (type == "确定") {
    let obj = {
      name: submitParams.taskGroupName,
      id: tableRowData.value.taskGroupId,
      desc: submitParams.taskGroupDesc,
    };
    let res = await updateTaskGroup(obj);
    if (res == "success") {
      ElMessage.success("修改成功");
      addOrEditShow.value = false;
      nextTick(() => {
        tableRef.value?.fetchData();
      });
    }
  }
};

//任务分配

const bottomBtnList = ref([
  {
    btnType: "last",
  },
  {
    btnType: "next",
  },
]);

const btnBottomClick = async (val) => {
  if (val.text === "下一步") {
    visibleUserShow.value = true;
    nextTick(() => {
      if (visibleUserRef.value) {
        visibleUserRef.value.fetchData();
      }
    });
  } else if (val.text === "上一步") {
    taskAllocationShow.value = false;
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

//可见用户
const bottomBtnLists = ref([
  {
    btnType: "last",
  },
  {
    btnType: "confirm",
  },
]);

const btnBottomClicks = async (val) => {
  if (val.text === "上一步") {
    visibleUserShow.value = false;
  } else if (val.text === "确定") {
    let userGroupNamelist = visUserSelectionList.value?.map((item) => {
      return item.userGroupName;
    });
    let obj = {
      taskGroupName: submitParams.taskGroupName,
      taskGroupDesc: submitParams.taskGroupDesc,
      taskArray: taskAllSelectList.value,
      userGroupNameArray: userGroupNamelist,
    };
    let objs = {};
    console.log(obj, "obj", userGroupNamelist);
    let res = await addTaskGroups(obj);
    if (res.code == 200) {
      visibleUserShow.value = false;
      taskAllocationShow.value = false;
      addOrEditShow.value = false;
      nextTick(() => {
        tableRef.value?.fetchData();
      });
    }
  }
};

const visUserSelectionChange = (val) => {
  console.log(val, 55);
  visUserSelectionList.value = val;
};

const closeVisibleUser = () => {
  visibleUserShow.value = false;
};

const visibleUserTableColumns = ref([
  {
    columnLabel: "用户组名",
    columnName: "userGroupName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "用户组描述",
    columnName: "userGroupDesc",
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
  console.log(val,5555);
  taskAllSelectedList.value = val;
}

const allocationBottomClicks = async (val) => {
  if(val.btnType == 'confirm'){
    if(taskAllSelectedList.value.length == 0){
      ElMessage.warning('必须为该任务分配至少一个任务组!');
      return
    }
    let obj = {
      taskId: allocationData.value.taskId,
      taskName: allocationData.value.taskName,
      taskPath: allocationData.value.taskPath,
      type: allocationData.value.type,
      taskGroupNameArray: taskAllSelectedList.value.map(item => item.taskGroupName)
    }
    let res = await assignedTaskGroup(obj);
    if(res == 'success'){
      taskAllocationShows.value = false;
      taskDetailShow.value = false;
      ElMessage.success('任务组分配成功');
      tableRef.value?.fetchData();
    }
  } else if(val.btnType == 'cancel'){ 
    taskAllocationShows.value = false;
  }
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