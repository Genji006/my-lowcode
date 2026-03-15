<template>
  <div class="roleIndex">
    <div class="roleIndex_header">
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
            <!-- <el-tooltip content="编辑" placement="top" v-if="row.roleId != 1">
              <div class="roleIndex-operate-btn" @click="handleEdit(row)">
                <img src="@/assets/ItemImg/ZKBJ.svg" alt="" />
              </div>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" v-if="row.roleId != 1">
              <div class="roleIndex-operate-btn" @click="handleDelete(row)">
                <img src="@/assets/ItemImg/ZKSC.svg" alt="" />
              </div>
            </el-tooltip> -->
            <!-- <el-tooltip
              content="数据权限"
              placement="top"
              v-if="row.roleId != 1"
            >
              <div class="roleIndex-operate-btn" @click="handleDataScope(row)">
                <el-icon
                  style="
                    color: rgba(84, 127, 255, 1);
                    font-size: 18px;
                    font-weight: 700;
                  "
                  ><CircleCheck
                /></el-icon>
              </div>
            </el-tooltip> -->
            <el-tooltip
              content="分配用户"
              placement="top"
              v-if="row.roleId != 1"
            >
              <div class="roleIndex-operate-btn" @click="handleAuthUser(row)">
                <el-icon
                  style="
                    color: rgba(84, 127, 255, 1);
                    font-size: 18px;
                    font-weight: 700;
                  "
                  ><User
                /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </template>
      </tableList>
    </div>
  </div>
  <SzycDialog
    :dialogVisible="editShow"
    :close-on-click-modal="false"
    destroy-on-close
    :title="titleData"
    width="50%"
    top="40px"
    @close="editShow = false"
  >
    <template #uname>
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="auto"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="editForm.roleName"
            clearable
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip
                content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
                placement="top"
              >
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input
            v-model="editForm.roleKey"
            clearable
            placeholder="请输入权限字符"
          />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number
            v-model="editForm.roleSort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio
              v-for="dict in yesOrNoFns()"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <div style="margin-bottom: 10px">
            <el-checkbox
              v-model="editForm.menuExpand"
              @change="handleCheckedTreeExpand($event, 'menu')"
              >展开/折叠</el-checkbox
            >
            <el-checkbox
              v-model="editForm.menuNodeAll"
              @change="handleCheckedTreeNodeAll($event, 'menu')"
              >全选/全不选</el-checkbox
            >
            <el-checkbox
              v-model="editForm.menuCheckStrictly"
              @change="handleCheckedTreeConnect($event, 'menu')"
              >父子联动</el-checkbox
            >
          </div>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuRef"
            node-key="id"
            :check-strictly="!editForm.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editForm.remark"
            clearable
            type="textarea"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-horizontal-line"></div>
      <div class="dialog-btn-class">
        <CanCelBtn @click="editShow = false">取 消</CanCelBtn>
        <buttonDiv type="primary" @click="submitForm">保存</buttonDiv>
      </div>
    </template>
  </SzycDialog>
  <SzycDialog
    :dialogVisible="permissionShow"
    :close-on-click-modal="false"
    destroy-on-close
    title="分配数据权限"
    width="50%"
    @close="permissionShow = false"
  >
    <template #uname>
      <el-form :model="editForm" label-width="auto">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="editForm.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="editForm.dataScope" @change="dataScopeSelectChange">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限" v-show="editForm.dataScope == 2">
          <el-checkbox
            v-model="deptExpand"
            @change="handleCheckedTreeExpand($event, 'dept')"
            >展开/折叠</el-checkbox
          >
          <el-checkbox
            v-model="deptNodeAll"
            @change="handleCheckedTreeNodeAll($event, 'dept')"
            >全选/全不选</el-checkbox
          >
          <el-checkbox
            v-model="editForm.deptCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'dept')"
            >父子联动</el-checkbox
          >
          <el-tree
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            ref="deptRef"
            node-key="id"
            :check-strictly="!editForm.deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
      </el-form>
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
import {
  changeStatus,
  treeselect,
  addRole,
  updateRole,
  roleMenuTreeselect,
  getRole,
  delRole,
  exportRole,
  deptTreeSelect,
} from "@/api/system/role.js";

import { useRouter } from "vue-router";
const router = useRouter();

//  查询值
const searchData = reactive({
  roleName: "", // 角色名称
  roleKey: "", // 权限字符
  status: "", // 启用否
  dateRange: [], // 创建时间
  params: {
    beginTime: "",
    endTime: "",
  },
});

//  查询表单
const searchItems = computed(() => [
  {
    label: "角色名称：",
    prop: "roleName",
    component: "el-input",
    attrs: { placeholder: "请输入" },
  },
  {
    label: "权限字符：",
    prop: "roleKey",
    component: "el-input",
    attrs: { placeholder: "请输入" },
  },
  {
    label: "启用否：",
    prop: "status",
    component: "el-select",
    options: yesOrNoFns(),
    style: { width: "220px" },
    attrs: { placeholder: "请选择" },
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
  primaryKey: "roleId",
  method: "get",
  btnList: [
    { btnType: "add" }, //  新增
    { btnType: "edit" }, //  编辑
    { btnType: "delete" },
    { btnType: "add", text: "导出", icon: "", img: "/ItemImg/pldc.svg" },
  ], // 表格按钮
  apiUrl: "/system/role/list", //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "角色编号",
      columnName: "roleId",
      columnWidth: "150",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "角色名称",
      columnName: "roleName",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "权限字符",
      columnName: "roleKey",
      columnWidth: "150",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "显示顺序",
      columnName: "roleSort",
      columnWidth: "150",
      align: "center",
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
      columnLabel: "创建时间",
      columnName: "createTime",
      columnWidth: "200",
      align: "center",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "操作",
      columnName: "operate",
      columnWidth: "100",
      align: "center",
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
const editFormRef = ref(null);
const menuExpand = ref(false);
const menuNodeAll = ref([]);
const menuOptions = ref([]);
const menuRef = ref(null);
const editForm = reactive({
  roleName: undefined,
  roleKey: undefined,
  roleSort: undefined,
  status: "0",
  menuExpand: false,
  menuNodeAll: false,
  menuCheckStrictly: false,
  remark: undefined,
  menuIds: [],
  roleId: undefined,
});
const editFormTs = reactive({
  roleName: undefined,
  roleKey: undefined,
  roleSort: undefined,
  status: "0",
  menuExpand: false,
  menuNodeAll: false,
  menuCheckStrictly: false,
  remark: undefined,
  menuIds: [],
  roleId: undefined,
});
const editFormRules = reactive({
  roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
  roleKey: [{ required: true, message: "权限字符不能为空", trigger: "blur" }],
  roleSort: [{ required: true, message: "角色顺序不能为空", trigger: "blur" }],
});

/** 查询菜单树结构 */
const getMenuTreeselect = async () => {
  let res = await treeselect({});
  if (res.code == 200) {
    menuOptions.value = res.data;
    return res;
  }
};

const btnClick = async (item, row) => {
  if (item.text == "新增") {
    titleData.value = "新增角色";
    editShow.value = true;
    Object.assign(editForm, editFormTs);
  } else if (item.text == "编辑") {
    handleEdit(row);
  } else if (item.text == "删除") {
    let ids = row.map(item => item.roleId);
    console.log(ids);
    ElMessageBox.confirm(
      '是否确认删除角色编号为"' + ids + '"的数据项?',
      "删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    ).then(async () => {
      let res = await delRole(ids);
      if (res.code == 200) {
        ElMessage.success("删除成功");
        await getList('重置');
      }
    });
  } else if (item.text == "导出") {
    const formData = new FormData();
    formData.append("roleName", searchData.roleName || "");
    formData.append("roleKey", searchData.roleKey || "");
    formData.append("status", searchData.status || "");
    formData.append("beginTime", searchData.params.beginTime || "");
    formData.append("endTime", searchData.params.endTime || "");
    let res = await exportRole(formData);
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '是否确认删除角色编号为"' + row.roleId + '"的数据项?',
    "删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    let res = await delRole(row.roleId);
    if (res.code == 200) {
      ElMessage({
        message: "删除成功",
        type: "success",
      });
      getList('重置');
    }
  })
}

const handleEdit = async (row) => {
  titleData.value = "编辑角色";
  let res = await roleMenuTreeselect(row.roleId);
  if (res.code == 200) {
    menuOptions.value = res.menus;
    let ress = await getRole(row.roleId);
    if (ress.code == 200) {
      editShow.value = true;
      Object.assign(editForm, ress.data);
      editForm.roleSort = Number(ress.data.roleSort);
      nextTick(() => {
        let checkedKeys = res.checkedKeys;
        checkedKeys.forEach((el) => {
          nextTick(() => {
            menuRef.value.setChecked(el, true, false);
          });
        });
      });
    }
  }
};

/** 分配数据权限操作 */
const  handleDataScope = async (row) => {
  Object.assign(editForm, editFormTs);
  let res = await deptTreeSelect(row.roleId);
  if( res.code === 200){
    let response = await getRole(row.roleId);
    if (response.code == 200) {
      Object.assign(editForm, response.data);
      permissionShow.value = true;
      nextTick(() => {
        if (deptRef.value) {
          deptRef.value.setCheckedKeys(res.checkedKeys);
        }
      });
    }
  }
}

/** 分配用户 */
const  handleAuthUser = (row) => {
  router.push({ path: "/authUser", query: {roleId: row.roleId} } );
}

/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value, type) {
  if (type == "menu") {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  } else if (type == "dept") {
    let treeList = deptOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
}

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value, type) {
  if (type == "menu") {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
  } else if (type == "dept") {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : []);
  }
}

/** 树权限（父子联动） */
function handleCheckedTreeConnect(value, type) {
  if (type == "menu") {
    editForm.value.menuCheckStrictly = value ? true : false;
  } else if (type == "dept") {
    editForm.value.deptCheckStrictly = value ? true : false;
  }
}

/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}

const submitForm = async () => {
  await editFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (editForm.roleId != undefined) {
        editForm.menuIds = getMenuAllCheckedKeys();
        updateRole(editForm).then((response) => {
          if (response.code == 200) {
            ElMessage.success("编辑成功");
            editShow.value = false;
            getList();
          }
        });
      } else {
        editForm.menuIds = getMenuAllCheckedKeys();
        addRole(editForm).then((response) => {
          if (response.code == 200) {
            editShow.value = false;
            ElMessage.success("新增成功");
            getList();
          }
        });
      }
    }
  });
};

const permissionShow = ref(false);

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
onMounted(async () => {
  await getList();
  await getMenuTreeselect();
});
</script>

<style lang="less" scoped>
.roleIndex {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .roleIndex_header {
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
</style>