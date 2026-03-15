<template>
  <div class="authUser">
    <div class="authUser_header">
      <SzycFormSearch
        v-model="searchData"
        :items="searchItems"
        labelWidth=""
        @searchVal="getList()"
        @reset="getList('重置')"
        :inline="true"
      />
    </div>
    <div style="flex: 1; margin-top: 16px; height: 60%">
      <tableList
        ref="tableRef"
        :queryParams="searchData"
        v-bind="bindData"
        @statusClick="switchChange"
        :defaultExpandAll="defaultExpandAll"
        @btnClick="btnClick"
      >
        <template #operate="{ row }">
          <div style="display: flex; justify-content: center">
            <div class="authUser-operate-btn" @click="handleCancel(row)">
              <img
                src="@/assets/ItemImg/close.svg"
                alt=""
                style="margin-right: 5px"
              />
              取消授权
            </div>
          </div>
        </template>
        <template #status="{ row }">
          <div style="width: 76px; display: flex; justify-content: center">
            <div
              :class="
                row.status === '0'
                  ? 'authUser-status-class'
                  : row.status === '1'
                  ? 'authUser-statuss-class'
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
  <SzycDialog
    :dialogVisible="editShow"
    :close-on-click-modal="false"
    destroy-on-close
    title="新增用户"
    width="80%"
    top="40px"
    @close="editShow = false"
  >
    <template #uname>
      <div class="authUser_header">
        <SzycFormSearch
          v-model="searchDialogData"
          :items="searchDialogItems"
          labelWidth=""
          @searchVal="getDialogList()"
          @reset="getDialogList('重置')"
          :inline="true"
        />
      </div>
      <div style="flex: 1; margin-top: 16px; height: 500px">
        <tableList
          ref="tableDialogRef"
          :queryParams="searchDialogData"
          v-bind="bindDialogData"
          @btnBottomClick="btnDialogClick"
        >
          <template #status="{ row }">
            <div style="width: 76px; display: flex; justify-content: center">
              <div
                :class="
                  row.status === '0'
                    ? 'authUser-status-class'
                    : row.status === '1'
                    ? 'authUser-statuss-class'
                    : ''
                "
              >
                {{ yesOrNoFns(row.status, "formatter") }}
              </div>
            </div>
          </template>
        </tableList>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import tableList from "@/components/table/tableAndPage.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { yesOrNoFns, dataItemTypeList } from "@/types/dict/index";
import { ElMessage, ElMessageBox } from "element-plus";
import { selectAll, authUserCancel, authUserCancelAll } from "@/api/system/role.js";

import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

//  查询值
const searchData = reactive({
  userName: "", // 角色名称
  phonenumber: "", // 权限字符
  roleId: "", // 角色ID
});

//  查询表单
const searchItems = computed(() => [
  {
    label: "用户名称：",
    prop: "userName",
    component: "el-input",
    attrs: { placeholder: "请输入" },
  },
  {
    label: "手机号码：",
    prop: "phonenumber",
    component: "el-input",
    attrs: { placeholder: "请输入" },
  },
]);

const tableRef = ref(null); //  表格
const tableData = ref([]);
const defaultExpandAll = ref(false); //  是否默认展开
const bindData = reactive({
  pageOpen: "1", //  是否需要分页
  checkBox: "1", //  是否需要复选框
  light: "1", //  是否需要高亮
  primaryKey: "userId",
  method: "get",
  btnList: [
    {
      text: "添加用户",
      btnType: "add",
      icon: "plus",
    },
    {
      text: "批量取消授权",
      btnType: "delete",
      typeRow: "selectType",
      icon: "",
      img: "/ItemImg/jspljb.svg",
    },
  ], // 表格按钮
  apiUrl: "/system/role/authUser/allocatedList", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "用户名称",
      columnName: "userName",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "用户昵称",
      columnName: "nickName",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "邮箱",
      columnName: "email",
      columnWidth: "200",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "手机",
      columnName: "phonenumber",
      columnWidth: "150",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "状态",
      columnName: "status",
      align: "center",
      columnWidth: "100",
      hasSlot: true,
    },
    {
      columnLabel: "创建时间",
      columnName: "createTime",
      align: "center",
      columnWidth: "200",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "操作",
      columnName: "operate",
      align: "center",
      columnWidth: "200",
      showOverflowTooltip: true,
      hasSlot: true,
    },
  ],
});

const switchChange = (row) => {
  let text = row.status === "0" ? "启用" : "停用";
  ElMessageBox.confirm(`确认要"${text}""${row.row.roleName}"角色吗?`, "提示", {
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

const titleData = ref("新增角色");
const editShow = ref(false);
const searchDialogData = reactive({
  userName: "", // 角色名称
  phonenumber: "", // 权限字符
  roleId: "", // 角色ID
});

const handleCancel = async (row) => {
  ElMessageBox.confirm(`确认要取消该用户""${row.userName}""角色授权吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let res = await authUserCancel({
        userId: row.userId,
        roleId: route.query.roleId,
      });
      if (res.code == 200) {
        ElMessage({
          type: "success",
          message: "取消授权成功!",
        });
        getList("重置");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};

//  查询表单
const searchDialogItems = computed(() => [
  {
    label: "用户名称：",
    prop: "userName",
    component: "el-input",
    attrs: { placeholder: "请输入" },
  },
  {
    label: "手机号码：",
    prop: "phonenumber",
    component: "el-input",
    attrs: { placeholder: "请输入" },
  },
]);

const tableDialogRef = ref(null); //  表格
const bindDialogData = reactive({
  pageOpen: "1", //  是否需要分页
  checkBox: "1", //  是否需要复选框
  light: "1", //  是否需要高亮
  primaryKey: "userId",
  method: "get",
  bottomBtnList: [
    {
      btnType: "cancel",
    },
    {
      text: "保存",
      btnType: "add",
      typeRow: "selectType",
      icon: "",
      img: "",
    },
  ], // 表格按钮
  apiUrl: "/system/role/authUser/unallocatedList", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "用户名称",
      columnName: "userName",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "用户昵称",
      columnName: "nickName",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "邮箱",
      columnName: "email",
      columnWidth: "200",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "手机",
      columnName: "phonenumber",
      columnWidth: "150",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "状态",
      columnName: "status",
      align: "center",
      columnWidth: "100",
      hasSlot: true,
    },
    {
      columnLabel: "创建时间",
      columnName: "createTime",
      align: "center",
      columnWidth: "200",
      showOverflowTooltip: true,
    },
  ],
});

const btnClick = async (item, row) => {
  if (item.text == "添加用户") {
    editShow.value = true;
    nextTick(() => {
      tableDialogRef.value.fetchData();
    });
  } else if (item.text == "批量取消授权") {
    ElMessageBox.confirm(`确认要取消选中用户角色授权`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let userIdList = row?.map((item) => item.userId);
      const formData = new FormData();
      formData.append("roleId", route?.query?.roleId || "");
      formData.append("userIds", userIdList);
      let res = await authUserCancelAll(formData);
      if (res.code == 200) {
        ElMessage({
          type: "success",
          message: "取消授权成功!",
        });
        getList("重置");
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
  }
};

const getDialogList = async (type) => {
  if (type == "重置") {
    searchDialogData.userName = "";
    searchDialogData.phonenumber = "";
    tableDialogRef.value.fetchData("重置");
  } else {
    tableDialogRef.value.fetchData();
  }
};

const btnDialogClick = async (item, row) => {
  if (item.text == "保存") {
    console.log(row, 12);
    let userIdList = row?.map((item) => item.userId);
    const formData = new FormData();
    formData.append("roleId", route?.query?.roleId || "");
    formData.append("userIds", userIdList);
    let res = await selectAll(formData);
    if (res.code == 200) {
      ElMessage({
        type: "success",
        message: "添加成功!",
      });
      editShow.value = false;
      nextTick(() => {
        getList("重置");
      });
    }
  }
};

const getList = async (type) => {
  if (type == "重置") {
    searchData.userName = ""; // 角色名称
    searchData.phonenumber = ""; // 权限字符
    tableRef.value.fetchData("重置");
  } else {
    tableRef.value.fetchData();
  }
};
onMounted(async () => {
  searchData.roleId = route?.query?.roleId || "";
  searchDialogData.roleId = route?.query?.roleId || "";
  await getList();
});
</script>

<style lang="less" scoped>
.authUser {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .authUser_header {
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
  }
}

.tree-border {
  margin-top: 5px;
  border: 1px solid var(--el-border-color-light, #e5e6e7);
  background: var(--el-bg-color, #ffffff) none;
  border-radius: 4px;
  width: 100%;
  height: 350px;
  overflow-y: auto;
}

.authUser-status-class {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: rgb(235, 243, 253);
  color: #409eff;
}

.authUser-statuss-class {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #fef0f0;
  color: #f56c6c;
}
.authUser-operate-btn {
  display: flex;
  align-items: center;
  color: #547ffb;
  cursor: pointer;
}
</style>