<!-- 菜单管理 -->
<template>
  <div class="menuIndex">
    <div class="menuIndex_header">
      <SzycFormSearch
        v-model="searchData"
        :items="searchItems"
        labelWidth=""
        @searchVal="listMenuFn()"
        @reset="listMenuFn('重置')"
        :inline="true"
      />
    </div>
    <div style="flex: 1; margin-top: 16px; height: 60%">
      <tableList
        ref="tableRef"
        :queryParams="searchData"
        v-bind="bindData"
        :defaultExpandAll="defaultExpandAll"
        @btnClick="btnClick"
      >
        <template #icon="{ row }"> 
         <img v-if="row.icon" width="20" height="20" :src="`/icons/svg/${row.icon}.svg`"  alt="">
          <span v-else></span>
        </template>
        <template #operate="{ row }">
          <div style="display: flex; justify-content: space-between">
            <div class="menuIndex-operate-btn" @click="handleEdit(row)">
              编辑
            </div>
            <div class="menuIndex-operate-btn" @click="handleAdd(row)" >新增</div>
            <div class="menuIndex-operate-btn" @click="handleDelete(row)">删除</div>
          </div>
        </template>
        <template #status="{ row }">
          <div style="width: 76px; display: flex; justify-content: center;">
            <div :class="row.status === '0' ? 'menuIndex-status-class' : row.status === '1' ? 'menuIndex-statuss-class' : '' ">
              {{yesOrNoFns(row.status, 'formatter')}}
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
    :title="titleData"
    width="50%"
    @close="editShow = false"

  >
    <template #uname>
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="auto"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="editForm.parentId"
                :data="menuOptions"
                :props="{
                  value: 'menuId',
                  label: 'menuName',
                  children: 'children',
                }"
                value-key="menuId"
                placeholder="选择上级菜单"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="editForm.menuType">
                <el-radio value="M">目录</el-radio>
                <el-radio value="C">菜单</el-radio>
                <el-radio value="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType != 'F'">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover placement="bottom-start" :width="540" trigger="click">
                <template #reference>
                  <el-input
                    v-model="editForm.icon"
                    placeholder="点击选择图标"
                    @blur="showSelectIcon"
                    readonly
                  >
                    <template #prefix>
                      <img v-if="editForm.icon" width="20" height="20" :src="`/icons/svg/${editForm.icon}.svg`"  alt="">
                      <el-icon v-else style="height: 32px; width: 16px"
                        ><search
                      /></el-icon>
                    </template>
                  </el-input>
                </template>
                <div style="display: flex; flex-direction: column;">
                  
                  <div style=" height: 50px; display: flex; align-items: center; margin-bottom: 20px;">
                    <el-input type="text" v-model="iconNameData" placeholder="请输入图标名称" clearable style="width: 100%; height: 32px; border-radius: 4px; " @input="handleIconName" />
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 10px 10px; height: 300px; overflow-y: auto">
                    <div v-for="item in iconList" :key="item" style="display: flex; width: calc(32% - 6px); cursor: pointer" @click="handleIconClick(item)">
                      <img width="20" height="20" :src="`/icons/svg/${item}.svg`" alt="" style="margin-right: 5px;">{{item}}
                    </div>
                  </div>
                  
                </div>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="editForm.orderNum"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="editForm.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType == 'C'">
            <el-form-item prop="routeName">
              <template #label>
                <span>
                  <el-tooltip
                    content="默认不填则和路由地址相同：如地址为：`user`，则名称为`User`（注意：因为router会删除名称相同路由，为避免名字的冲突，特殊情况下请自定义，保证唯一性）"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由名称
                </span>
              </template>
              <el-input v-model="editForm.routeName" placeholder="请输入路由名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType != 'F'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择是外链则路由地址需要以`http(s)://`开头"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  是否外链
                </span>
              </template>
              <el-radio-group v-model="editForm.isFrame">
                <el-radio value="0">是</el-radio>
                <el-radio value="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType != 'F'">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
              <el-input v-model="editForm.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType == 'C'">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="editForm.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType != 'M'">
            <el-form-item>
              <el-input
                v-model="editForm.perms"
                placeholder="请输入权限标识"
                maxlength="100"
              />
              <template #label>
                <span>
                  <el-tooltip
                    content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType == 'C'">
            <el-form-item>
              <el-input
                v-model="editForm.query"
                placeholder="请输入路由参数"
                maxlength="255"
              />
              <template #label>
                <span>
                  <el-tooltip
                    content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由参数
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType == 'C'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  是否缓存
                </span>
              </template>
              <el-radio-group v-model="editForm.isCache">
                <el-radio value="0">缓存</el-radio>
                <el-radio value="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editForm.menuType != 'F'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择隐藏则路由将不会出现在导航栏，但仍然可以访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  显示状态
                </span>
              </template>
              <el-radio-group v-model="editForm.visible">
                <el-radio
                  v-for="dict in yesOrNoFns()"
                  :key="dict.value"
                  :value="dict.value"
                  >{{ dict.name }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择停用则路由将不会出现在导航栏，也不能被访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  菜单状态
                </span>
              </template>
              <el-radio-group v-model="editForm.status">
                <el-radio
                  v-for="dict in yesOrNoFns()"
                  :key="dict.value"
                  :value="dict.value"
                  >{{ dict.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="dialog-horizontal-line">
      </div>
      <div class="dialog-btn-class">
        <CanCelBtn @click="editShow = false">取 消</CanCelBtn>
        <buttonDiv type="primary" @click="submitForm">保存</buttonDiv>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import SubmitForm from "@/components/element/SubmitForm.vue";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { yesOrNoFns, dataItemTypeList } from "@/types/dict/index";
import tableList from "@/components/table/tableAndPage.vue";
import {
  listAppProjectApi,
  deleteDataItemApi,
  updateDataItemUpdateStatusApi,
} from "@/api/tool.js";
import { ElMessage, ElMessageBox } from 'element-plus'
import { listMenu, getMenu, updateMenu, delMenu, addMenu } from "@/api/system/menu.js";
import { useRouter } from "vue-router";

const router = useRouter();

const appList = ref([]); // 所属应用
//  查询值
const searchData = reactive({
  menuName: "", // 菜单名称
  status: "", // 启用否
});

//  查询表单
const searchItems = computed(() => [
  {
    label: "菜单名称：",
    prop: "menuName",
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
]);
// 点击某个单元格
const handDataClick = ({ row, column, $index }) => {
  console.log("row:", row);
  console.log("column:", column);
  console.log("$index:", $index);
};

const appLicationOptions = ref([]); //  来源应用选项


const tableRef = ref(null); //  表格
const tableData = ref([]);
const defaultExpandAll = ref(false); //  是否默认展开
const bindData = reactive({
  // pageOpen: "1", //  是否需要分页
  checkBox: "1", //  是否需要复选框
  light: "1", //  是否需要高亮
  primaryKey: "menuId",
  method: "get",
  btnList: [
    { btnType: "add" }, //  新增
    { btnType: "add", text: '展开/折叠', icon: 'Sort' }, //  编辑
  ], // 表格按钮
  apiUrl: tableData, //  接口地址
  showBorder: true, //  是否需要边框
  designTableColumns: [
    {
      columnLabel: "菜单名称",
      columnName: "menuName",
      // columnWidth: "160",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "图标",
      columnName: "icon",
      align: "center",
      columnWidth: "100",
      hasSlot: true,
    },
    {
      columnLabel: "排序",
      columnName: "orderNum",
      columnWidth: "60",
      align: "center",
      showOverflowTooltip: true,
    },
    { columnLabel: "权限标识", columnName: "perms", showOverflowTooltip: true },
    {
      columnLabel: "组件路径",
      columnName: "component",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "创建时间",
      columnName: "createTime",
      align: "center",
      columnWidth: "180",
      showOverflowTooltip: true,
    },
    {
      columnLabel: "启用否",
      columnName: "status",
      columnWidth: "100",
      align: "center",
      hasSlot: true,
    },
    {
      columnLabel: "操作",
      columnName: "operate",
      align: "center",
      columnWidth: "210",
      showOverflowTooltip: true,
      hasSlot: true,
    },
  ],
});

const titleData = ref("新增菜单");
//  表格按钮点击事件
const btnClick = (item, row) => {
  if (item.text == "新增") {
    titleData.value = "新增菜单";
    Object.assign(editForm, editFormTs);
    editShow.value = true;
    nextTick(() => {
      editFormRef.value.resetFields();
    })
  } else if (item.text == "展开/折叠") {
    
    defaultExpandAll.value = !defaultExpandAll.value;
  }
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
function handleTree(data, id, parentId, children) {
  let config = {
    id: id || "id",
    parentId: parentId || "parentId",
    childrenList: children || "children",
  };

  var childrenListMap = {};
  var tree = [];
  for (let d of data) {
    let id = d[config.id];
    childrenListMap[id] = d;
    if (!d[config.childrenList]) {
      d[config.childrenList] = [];
    }
  }

  for (let d of data) {
    let parentId = d[config.parentId];
    let parentObj = childrenListMap[parentId];
    if (!parentObj) {
      tree.push(d);
    } else {
      parentObj[config.childrenList].push(d);
    }
  }
  return tree;
}

const editShow = ref(false);
const editFormRef = ref(null);
const menuOptions = ref([]);
const editForm = reactive({
  menuId: undefined,
  parentId: 0,
  menuName: undefined,
  icon: undefined,
  menuType: "M",
  orderNum: undefined,
  isFrame: "1",
  isCache: "0",
  visible: "0",
  status: "0",
  path: undefined,
});
const editFormTs = reactive({
  menuId: undefined,
  parentId: 0,
  menuName: undefined,
  icon: undefined,
  menuType: "M",
  orderNum: undefined,
  isFrame: "1",
  isCache: "0",
  visible: "0",
  status: "0",
  path: undefined,
});
const editFormRules = reactive({
  menuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
  orderNum: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
  path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }],
});

const svgModules = import.meta.glob('/public/icons/svg/*.svg');
const iconNameData = ref('')
const iconList = computed(() => 
  Object.keys(svgModules)
    .map(path => path.split('/').pop().replace('.svg', ''))
    .filter(iconName => iconNameData.value ? iconName?.includes(iconNameData.value ) : iconName )
);



const handleIconClick = (iconName) => {
  editForm.icon = iconName;

}
async function getTreeselect() {
  menuOptions.value = [];
  listMenu().then(response => {
    const menu = { menuId: 0, menuName: "主类目", children: [] };
    menu.children = handleTree(response.data, "menuId");
    menuOptions.value.push(menu);
    console.log(menuOptions.value, "menuOptions.value");
  });
}

const handleEdit = async (row) => {
  titleData.value = "编辑菜单";
  let res = await getMenu(row.menuId);
  if (res.code == 200) {
    Object.assign(editForm, res.data);
    if(editForm.parentId === '0'){
      editForm.parentId = 0
    }
    editShow.value = true;
  }
}

const handleAdd = (row) => {
  titleData.value = "新增菜单";
  Object.assign(editForm, editFormTs);
  editForm.parentId = row.menuId;
  editShow.value = true;
  nextTick(() => {
    editFormRef.value.resetFields();
  })
}

const handleDelete = async (row) => {
  ElMessageBox.confirm(
    '是否确认删除名称为"' + row.menuName + '"的数据项?',
    "删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    let res = await delMenu(row.menuId);
    if (res.code == 200) {
      ElMessage.success("删除成功");
      await listMenuFn();
    }
  });
}

const submitForm = async () => {
  await editFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (editForm.menuId != undefined) {
        updateMenu(editForm).then(response => {
          if (response.code == 200) {
            ElMessage.success("编辑成功");
            editShow.value = false;
            listMenuFn();
          }
        });
      } else {
        addMenu(editForm).then(response => {
          if (response.code == 200) {
            editShow.value = false;
            ElMessage.success("新增成功");
            listMenuFn();
          }
          
        });
      }
    }
  })
}
const listMenuFn = async (type) => {
  if(type == '重置'){
    searchData.menuName = '';
    searchData.status = ''
  }
  console.log("searchData", searchData);
  let res = await listMenu(searchData);
  if (res.code == 200) {
    tableData.value = handleTree(res.data, "menuId");
    nextTick(() => {
      tableRef.value?.fetchData();
    });
  }
};

onMounted(async () => {
  await listMenuFn();
  await getTreeselect();
});
</script>


<style lang="scss" scoped>
.menuIndex {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .menuIndex_header {
    background-color: rgba(253, 253, 251);
    display: flex;
    align-items: center; // 垂直居中
  }
}
.menuIndex-operate-btn {
  color: rgba(0, 115, 237, 1);
  cursor: pointer;
  text-decoration: underline;
}

.menuIndex-status-class{
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: rgb(235, 243, 253);
  color: #409eff;
}

.menuIndex-statuss-class{
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #fef0f0;
  color: #f56c6c;

}
</style>
<style lang="scss">
.groupDialogCss {
  .el-overlay-dialog {
    overflow: hidden !important;
  }
}
</style>