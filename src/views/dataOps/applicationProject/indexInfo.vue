// 应用项目管理
<template>
  <div class="applicationProjectCss">
    <div class="appProject_header">
      <!-- currentPage = 1;pageSize = PageListData()[0]; -->
      <SzycFormSearch
        v-model="searchData"
        :items="searchItems"
        labelWidth=""
        @searchVal="ListFn()"
        @reset="ListFn()"
        :inline="true"
      />
    </div>
    <div class="appProject_content">
      <div style="display: flex; height: 50px; align-items: center">
        <szycButton @click="addOrEditDptClick('add', '新增项目')"
          ><el-icon class="bmr">
            <Plus />
          </el-icon>
          新增
        </szycButton>
        <szycButton
          @click="addOrEditDptClick('edit', '编辑项目')"
          :disabled="rowDataList.length == 0"
          ><el-icon class="bmr">
            <EditPen />
          </el-icon>
          编辑</szycButton
        >
        <szycButton
          type="delete"
          @click="handDelete"
          :disabled="rowDataList.length == 0"
          ><el-icon class="bmr">
            <Delete />
          </el-icon>
          删除</szycButton
        >
      </div>
      <!-- style="height:calc(100% - 50px);" -->
      <div style="height: calc(100% - 50px)">
        <el-table
          :data="tableData"
          ref="tableRef"
          style="width: 100%; height: 100%"
          header-cell-class-name="headerTable"
          v-loading="loading"
          border
          highlight-current-row
          @rowClick="handleRowClick"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center"
          />
          <el-table-column
            prop="projectName"
            label="项目名称"
            width="220"
            show-overflow-tooltip
          />
          <el-table-column
            prop="code"
            label="项目英文名"
            width="150"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column label="所属数据源" show-overflow-tooltip>
            <template #default="scope">
              {{ sourceIdFn(scope.row.dataSourceIds) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="state"
            label="启用否"
            width="100"
            align="center"
          >
            <!-- <template #default="scope">
              <el-switch @change="updateStatus($event, scope.row)" v-model="scope.row.state" active-color="#165DFF" inactive-color="#C9CDD4" active-value="0" inactive-value="1" />
            </template> -->
            <template #default="scope">
              <el-switch
                @change="updateStatus($event, scope.row)"
                v-model="scope.row.state"
                active-color="#165DFF"
                inactive-color="#C9CDD4"
                active-value="1"
                inactive-value="0"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="备注"
            width="180"
            show-overflow-tooltip
          />
          <el-table-column
            prop="updateBy"
            label="操作人"
            width="150"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="updateTime"
            label="操作时间"
            width="220"
            show-overflow-tooltip
          />
        </el-table>
        <!-- <div class="pagination">
          <el-pagination v-model:current-page="currentPage" class="pSelect" v-model:page-size="pageSize" :page-sizes="PageListData()" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" :prev-text="'上一页'" :next-text="'下一页'" />
        </div> -->
      </div>
    </div>

    <SzycDialog
      :dialogVisible="showDialog"
      width="40%"
      @close="showDialog = false"
      :title="tableTitle"
      :destroy-on-close="true"
      :alignCenter="true"
    >
      <template #uname>
        <SubmitForm
          v-model="formData"
          :items="formItems"
          :rules="rules"
          :inline="false"
          @submit="handleSubmit"
          @cancel="showDialog = false"
        />
      </template>
    </SzycDialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import szycButton from "@/components/element/Confirm.vue";
// import { PageListData } from '@/types/dict/pagination'  //  分页条数
import {
  listDataSourceApi,
  getMrmsProjectInfo,
  insertMrmsProject,
  updateMrmsProject,
  deleteMrmsProject,
  enableAppProjectApi,
} from "@/api/tool.js";
// import { dictStore } from '@/store/dict'
import { heightLight } from "@/types/rule/heightLight";
import { yesOrNoFn } from "@/types/dict/index";

// const dictList = dictStore()
// console.log(dictList.dict['db_type'], '字典数据');

const sourceFn = ref([]);

//  查询值
const searchData = reactive({
  projectName: "",
  state: "",
});
//  查询表单
const searchItems = ref([
  {
    label: "项目名称",
    prop: "projectName",
    component: "el-input",
    attrs: { placeholder: "请输入名称" },
    style: { width: "200px" },
  },
  {
    label: "启用否",
    prop: "state",
    component: "el-select",
    options: yesOrNoFn(),
    attrs: { placeholder: "请选择" },
    style: { width: "200px" },
  },
]);

const formData = reactive({
  projectName: "", //  项目名称
  code: "", //  项目英文名
  defaultDatasourceId: [], //  所属数据源
  state: "", //  状态
  remark: "", //  备注
});

// 新增编辑表单
const formItems = ref([
  {
    label: "项目名称：",
    prop: "projectName",
    component: "el-input",
    attrs: { placeholder: "请输入项目名称" },
  },
  {
    label: "项目英文名：",
    prop: "code",
    component: "el-input",
    attrs: { placeholder: "请输入项目英文名" },
  },
  {
    label: "所属数据源：",
    prop: "defaultDatasourceId",
    component: "el-select",
    attrs: { placeholder: "请选择所属数据源", multiple: true },
    options: [],
    optionValue: "id",
    optionLabel: "connName",
  },
  {
    label: "备注：",
    prop: "remark",
    component: "el-input",
    attrs: { placeholder: "请输入", type: "textarea", rows: 6, resize: "none" },
  },
  {
    label: "启用否：",
    prop: "state",
    component: "el-switch",
    attrs: {
      "active-color": "#165DFF",
      "inactive-color": "#C9CDD4",
      "active-value": "1",
      "inactive-value": "0",
    },
  },
]);

// 表单校验规则
const rules = {
  projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入项目英文名", trigger: "blur" }],
  defaultDatasourceId: [
    { required: true, message: "请选择所属数据源", trigger: "change" },
    {
      type: "array",
      min: 1,
      message: "请至少选择一个所属数据源",
      trigger: "change",
    },
  ],
};

const tableRef = ref(null); // 表格实例

const rowDataList = ref([]); // 选中的行数据
const tableData = ref([]); // 表格数据
const loading = ref(false); // 加载状态
const tableTitle = ref(""); // 表格标题
const tableType = ref(""); // 表格类型(新增/编辑)
const showDialog = ref(false); // 弹窗状态

// const currentPage = ref(1) // 当前页码
// const pageSize = ref(PageListData()[0]) // 每页显示条数
// const total = ref(0) // 总数据条数

//  列表接口
const ListFn = () => {
  loading.value = true;
  let obj = {
    projectName: searchData.projectName,
    state: searchData.state,
    // pageNum: currentPage.value,
    // pageSize: pageSize.value,
  };
  getMrmsProjectInfo(obj).then((res) => {
    console.log(res, "数据源列表");
    tableData.value = res.rows || [];
    // total.value = res.total
    if (res.rows.length > 0) {
      rowDataList.value = [res.rows[0]];
      heightLight(tableRef.value, res?.rows[0]);
    } else {
      rowDataList.value = [];
    }
    loading.value = false;
  });
};

const handleRowClick = (row) => {
  //   console.log(row, '行数据');
  rowDataList.value = [row];
};

// 新增/编辑
const addOrEditDptClick = (type, title) => {
  tableTitle.value = title;
  tableType.value = type;
  showDialog.value = true;
  if (type == "add") {
    formData.projectName = ""; //  项目名称
    formData.code = ""; //  项目名称英文名
    formData.defaultDatasourceId = []; //  所属数据源
    formData.state = "1"; //  状态
  } else {
    formData.projectName = rowDataList.value[0].projectName; //  项目名称
    formData.code = rowDataList.value[0].code; //  项目名称英文名
    formData.defaultDatasourceId = Array.isArray(
      rowDataList.value[0].dataSourceIds
    )
      ? rowDataList.value[0].dataSourceIds
      : rowDataList.value[0].dataSourceIds
      ? [rowDataList.value[0].dataSourceIds]
      : []; //  所属数据源
    formData.state = rowDataList.value[0].state || "1"; //  状态
    formData.remark = rowDataList.value[0].remark || ""; //  备注
  }
  //   console.log(formData.state, '状态');
};

//  提交数据
const handleSubmit = (data) => {
  //   console.log(data, 'data');
  //   console.log(123);
  addDataSource(tableType.value);
};

// 数据类型
const sourceIdFn = (data) => {
  if (Array.isArray(data)) {
    return data
      .map((id) => sourceFn.value.find((item) => item.id == id)?.connName)
      .filter(Boolean)
      .join(", ");
  }
  return sourceFn.value.find((item) => item.id == data)?.connName;
  //   return dictList.dict['db_type'].find((item) => item.dictValue == data)?.dictLabel
};

//  新增数据源
const addDataSource = (type) => {
  if (type == "add") {
    let obj = { 
      ...formData,
      dataSourceIds:formData.defaultDatasourceId,
    };
    delete obj.defaultDatasourceId
    insertMrmsProject({ ...obj }).then((res) => {
      if (res.code == 200) {
        ElMessage.success(res.msg);
        ListFn();
        showDialog.value = false;
      }
    });
  } else {
      let obj = { 
      ...formData,
      dataSourceIds:formData.defaultDatasourceId,
    };
    delete obj.defaultDatasourceId
    updateMrmsProject({ id: rowDataList.value[0].id, ...obj }).then(
      (res) => {
        if (res.code == 200) {
          ElMessage.success(res.msg);
          ListFn();
          showDialog.value = false;
        }
      }
    );
  }
};

// 批量删除数据
const handDelete = () => {
  let arr = tableRef.value.getSelectionRows() || [];
  if (arr.length > 0) {
    ElMessageBox.confirm("是否确认删除勾选的数据源？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    })
      .then(async () => {
        let list = [];
        for (let i = 0; i < arr.length; i++) {
          list.push({id:arr[i].id});
        }
        deleteMrmsProject(list).then((res) => {
          if (res.code == 200) {
            ElMessage.success(res.msg);
            ListFn();
          }
        });
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "删除取消",
        });
      });
  } else {
    ElMessage.warning("请先勾选需要删除的数据源!");
  }
};

// 切换按钮
// function updateStatus($event, row) {
//   if ($event == 1) {
//     //判断启用否
//     ElMessageBox.confirm("确定启用吗?", "提示", {
//       confirmButtonText: "确定",
//       cancelButtonText: "取消",
//       type: "warning",
//     })
//       .then(async () => {
//         let res = await enableAppProjectApi({
//           id: row.id,
//           kyf: $event,
//         })
//         if (res.code === 200) {
//           ElMessage({
//             type: "success",
//             message: "已启用",
//           })
//           ListDataFn()
//           // await getStaffInfoData()
//         }
//       })
//       .catch(() => {
//         row.kyf = "0"
//       })
//   } else if ($event == 0) {
//     //禁用
//     ElMessageBox.confirm("确定禁用吗?", "提示", {
//       confirmButtonText: "确定",
//       cancelButtonText: "取消",
//       type: "warning",
//     })
//       .then(async () => {
//         // loading.value = true
//         let res = await enableAppProjectApi({
//           id: row.id,
//           kyf: $event,
//         })
//         if (res.code === 200) {
//           ElMessage({
//             type: "success",
//             message: "已禁用",
//           })
//           ListDataFn()
//           // await getStaffInfoData()
//         }
//       })
//       .catch(() => {
//         row.kyf = "1"
//       })
//   }
// }

const updateStatus = ($event, row) => {
  let obj = {
    ...row,
    state: $event,
  };
  updateMrmsProject(obj).then((res) => {
    if (res.code == 200) {
      ElMessage.success(res.msg);
      ListFn();
    }
  });
};

onMounted(async () => {
  let res = await listDataSourceApi({ pageSize: 99999 });
  let index = formItems.value.findIndex(
    (item) => item.prop == "defaultDatasourceId"
  );
  formItems.value[index].options = res.rows || [];
  sourceFn.value = res.rows || [];
  await ListFn();

  //   dictApi().then(res => {
  //     console.log(res, '字典数据');
  //     searchItems.value[1].options = res.data || []
  //     formItems.value[1].options = res.data || []
  //   })
});
</script>

<style lang="scss" scoped>
.applicationProjectCss {
  width: 100%;
  height: 100%;
  background-color: rgba(231, 231, 233);
  .appProject_header {
    height: 80px;
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
  }
  .appProject_content {
    margin-top: 10px;
    height: calc(100% - 90px);
    background-color: rgba(253, 253, 251);
    padding: 10px;
    box-sizing: border-box;
  }
  //   .pagination {
  //     display: flex;
  //     justify-content: flex-end;
  //     align-items: center;
  //     margin-top: 10px;
  //   }
}
</style>
