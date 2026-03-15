<template>
  <div class="menuGroupManage-main-class">
    <div class="menuGroupManage-left-class">
      <div class="menuGroupManage-left-title">
        <img src="@/assets/ItemImg/YYXT.svg" alt="" style="margin-right: 8px" />
        <div>应用系统</div>
      </div>
      <div class="menuGroupManage-left-search">
        <el-input v-model="searchData.cpmc" placeholder="请输入" clearable style="margin-right: 16px"></el-input>
        <configBtn @click="getAppList()"><el-icon>
            <Search />
          </el-icon>
          查询</configBtn>
        <cancelBtn @click="resetSearch"><el-icon>
            <RefreshRight />
          </el-icon>
          重置</cancelBtn>
      </div>
      <div class="menuGroupManage-left-app">
        <div v-for="item in appList" :key="item.menuId" class="menuGroupManage-left-item-app"
          @click="appUuidChange(item)" :class="item.menuId == selectAppUuid ? 'menuGroupManage-active-item' : ''
            ">
          <div class="app-name-text" v-show-tip>
            <el-tooltip :content="item.menuName" placement="top" :show-after="300">
              {{ item.menuName }}
            </el-tooltip>
          </div>
          <div class="menuGroupManage-left-item-source" :style="sourceApplicationFn(item.yyly)">
            {{ appSourceFn(item.yyly, "formatter") }}
          </div>
        </div>
      </div>
    </div>
    <div class="menuGroupManage-right-class">
      <div class="menuGroupManage-right-title">
        <div>应用菜单组</div>
      </div>
      <div class="menuGroupManage-right-content">
        <div class="menuGroupManage-search">
          <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth=""
            @searchVal="getMenuList(selectAppUuid, '查询')" @reset="getMenuList(selectAppUuid, '重置')" :inline="true" />
        </div>
        <div class="menuGroupManage-table">
          <tableList ref="tableRef" :queryParams="searchData" v-bind="bindData" :defaultExpandAll="defaultExpandAll"
            @btnClick="btnClick" @cellClick="tableCellClick">
            <template #menuIco="{ row }">
              <div style="text-align: center">
                <img :src="row.menuIco" style="
                  width: 29px;
                  height: 25px;
                  cursor: pointer;
                  white-space: wrap;
                " v-if="row.menuIco" />
              </div>
            </template>
            <template #status="{ row }">
              <el-switch v-model="row.status" active-value="1" inactive-value="0"
                @change="switchChange(row, row.status)" :disabled="row.menuType != 'M'"></el-switch>
            </template>
          </tableList>
        </div>
      </div>
    </div>
  </div>
  <!-- 新增编辑详情弹窗 -->
  <SzycDialog :dialogVisible="addDialogVisible" width="50%" :title="dialogTitle" class="menuGroupManage-submitDialog"
    :alignCenter="true" @close="closeAddDialog">
    <template #uname>
      <szycSubmitForm :modelValue="addOrEditForm" :items="appItems" ref="addOrEditFormRef" :inline="true"
        labelWidth="auto" :rules="addOrEditRules" :className="'inlineClass'" @submit="addSubmit(addOrEditFormRef)"
        @cancel="closeAddDialog" :formProps="{
          disabled: dialogTitle == '详情',
        }" :showAction="dialogTitle != '详情'">
        <template #menuIco>
          <div style="border: 1px solid #aeb6c5; width: 100%">
            <el-scrollbar height="130px" style="width: 100%">
              <div class="Ground-Grid" style="width: 100%">
                <div class="grid-item" :key="i" v-for="(i, index) in pictures"
                  @click="selectPicture(i.checkedurl, index)">
                  <div :class="index == crtIndex ? 'iconneis' : 'iconnei'">
                    <img :src="i.url" style="
                        width: 29px;
                        height: 25px;
                        cursor: pointer;
                        white-space: wrap;
                      " v-if="index != crtIndex" />
                    <img :src="i.checkedurl" style="
                        width: 27px;
                        height: 25px;
                        cursor: pointer;
                        white-space: wrap;
                      " v-if="index == crtIndex" />
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </template>
      </szycSubmitForm>
    </template>
  </SzycDialog>

  <!--  绑定菜单项弹窗  -->
  <SzycDialog :dialogVisible="bandMenuVisible" width="60%" title="绑定菜单项" :alignCenter="true"
    @close="bandMenuVisible = false">
    <template #uname>
      <div class="menuGroupManage-bindMenu">
        <div class="menuGroupManage-left-bindMenu">
          <div class="menuGroupManage-bindMenu-search">
            <el-input v-model="menuNameData" placeholder="请输入" clearable style="margin-right: 16px"></el-input>
            <el-select v-model="appIdData" placeholder="请选择所属应用平台" style="margin-right: 16px">
              <el-option v-for="item in appList" :key="item.menuId" :label="item.menuName"
                :value="item.menuId"></el-option>
            </el-select>
            <!-- <configBtn><el-icon>
                <Search />
              </el-icon>
              查询</configBtn>
            <cancelBtn><el-icon>
                <RefreshRight />
              </el-icon>
              重置</cancelBtn> -->
          </div>
          <div class="menuGroupManage-bindMenu-menuList">
            <div class="menuGroupManage-bindMenu-allSelect">
              <el-checkbox v-model="selectAll" :indeterminate="isIndeterminate"
                @change="handleSelectAll">全选</el-checkbox>
            </div>
            <div class="menuGroupManage-bindMenu-menuItems">
              <div v-for="menu in menuListFn(menuList, { menuName: menuNameData, cpUuid: appIdData }, ['cpUuid'])"
                :key="menu.menuId" class="menuGroupManage-bindMenu-menuItem"
                :class="{ 'menuGroupManage-active-item': menu.checked }">
                <el-checkbox v-model="menu.checked" @change="handleMenuCheck">
                  <div>{{ menu.menuName }}</div>
                  <div class="menuGroupManage-bindMenu-menuSource" :style="sourceApplicationFn(menu.yyly)">
                    {{ appSourceFn(menu.sourceApplication, "formatter") }}
                  </div>
                  <div class="checkAppCss" v-show-tip>
                    <el-popover placement="top" trigger="hover" :width="250"
                      v-if="(menu?.cpName || []).length > maxCount" popper-class="my-custom-popover">
                      <template #reference>
                        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                          <el-tag v-for="(cp, index) in (menu?.cpName || []).slice(0, maxCount)"
                            :key="'visible-' + index" size="small">
                            <span class="cpName">{{ cp }}</span>
                          </el-tag>
                          <el-tag size="small">
                            +{{ (menu?.cpName || []).length - maxCount }}
                          </el-tag>
                        </div>
                      </template>
                      <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        <el-tag v-for="(cp, index) in (menu?.cpName || []).slice(maxCount)" :key="'popover-' + index"
                          size="small">
                          <span class="cpName">{{ cp }}</span>
                        </el-tag>
                      </div>
                    </el-popover>

                    <div v-else style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                      <el-tag v-for="(cp, index) in (menu?.cpName || [])" :key="'all-' + index" size="small">
                        <span class="cpName">{{ cp }}</span>
                      </el-tag>
                    </div>
                  </div>
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>
        <div class="menuGroupManage-right-bindMenu">
          <div class="menuGroupManage-bindMenu-title">菜单名称</div>
          <div class="menuGroupManage-bindMenu-select">
            <div class="menuGroupManage-bindMenu-selectNum">
              已选： {{ selectedMenus.length }}个菜单项
            </div>
            <div class="menuGroupManage-bindMenu-selectItems">
              <div v-for="item in selectedMenus" :key="item.menuId" class="menuGroupManage-bindMenu-selected-item">
                <div>{{ item.menuName }}</div>
                <div>
                  <el-icon color="rgba(255, 0, 0,1)" style="cursor:pointer;margin-right: 20px;" size="16"
                    @click="removeSelected(item)">
                    <Delete />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:center;">
        <cancelBtn @click="bandMenuVisible = false"> 取消 </cancelBtn>
        <configBtn @click="menuItemSave"> 保存 </configBtn>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycSubmitForm from "@/components/element/SubmitForm.vue";
import { yesOrNoFn, appSourceFn, menuTypeFn } from "@/types/dict/index";
import tableList from "@/components/table/tableAndPage.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import configBtn from "@/components/element/Confirm.vue";
import cancelBtn from "@/components/element/Cancel.vue";
import { useRouter } from "vue-router";
import {
  listIdxCpxxb,
  updateIdxCpxxbStatus,
  deleteIdxCpxxb,
  updateIdxCpxxb,
} from "@/api/appManage/appRegist";
import { menuExport, insert, list, updateMenuGroup, bindMenu, deleteMenu, unBindMenu, updateBindMenu, menuStatus } from "@/api/appManage/menuLibraryManage";
import { appType, sourceApplicationFn, fatherMenuFn, menuListFn } from './index'
const initialized = ref(false);

const isIndeterminate = ref(true)

const router = useRouter();
const appList = ref([]);
const selectAppUuid = ref("");
const selectAppObj = ref({});
const currentMenu = ref('');
const chooseFather = ref(false);
const showFather = ref(true);
const menuFnList = computed(() => {
  return fatherMenuFn(selectAppObj.value?.children);
});

const maxCount = ref(2);

//  查询值
const searchData = reactive({
  menuName: "",
  cpmc: "",
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
const menuListData = ref([]);
const bindData = computed(() => {
  return {
    pageOpen: "1", //  是否需要分页
    checkBox: "1", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "menuId",
    method: "post",
    btnList: [
      { btnType: "add", text: "新增菜单组" }, //  新增
      {
        btnType: "edit", text: "新增子菜单组", icon: "Plus", isDisabled: true, disabledEvent: ({ item, lightData, selectList }) => {
          if (lightData?.menuType == "M") {
            return false;
          }
          return true;
        },
      },
      {
        btnType: "edit", text: "编辑菜单组", isDisabled: true, disabledEvent: ({ item, lightData, selectList }) => {
          if (lightData?.menuType == "M") {
            return false;
          }
          return true;
        },
      }, //  编辑
      {
        btnType: "edit", text: "绑定菜单项", icon: "", img: "/ItemImg/bdcdx.svg", isDisabled: true, disabledEvent: ({ item, lightData, selectList }) => {
          if (lightData?.menuType == "M") {
            return false;
          }
          return true;
        },
      },
      {
        btnType: "delete", text: "解绑菜单项", icon: "", img: "/ItemImg/jbcdx.svg", isDisabled: true, disabledEvent: ({ item, lightData, selectList }) => {
          // 如果没有勾选任何项目，则禁用按钮
          if (selectList.length === 0) {
            return true;
          }
          // 如果所有勾选的项目都是menuType为'M'，则禁用按钮
          return selectList.every(item => item.menuType == 'M');
        }
      },
      { btnType: "delete", text: "删除菜单组" }, //  删除
    ], // 表格按钮
    apiUrl: menuListData.value, //  接口地址
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
        columnLabel: "菜单组类型",
        columnName: "menuType",
        columnWidth: "140",
        showOverflowTooltip: true,
        formatter: (row) => menuTypeFn(row.menuType, "formatter"),
      },
      {
        columnLabel: "请求链接",
        columnName: "path",
        showOverflowTooltip: true,
        isClick: true,
      },
      {
        columnLabel: "菜单组原应用标识",
        columnName: "sourceApplication",
        columnWidth: "180",
        showOverflowTooltip: true,
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
      // {
      //   columnLabel: "启用否",
      //   columnName: "status",
      //   kyf: "1",
      //   columnWidth: "80",
      //   align: "center",
      //   attrs: {
      //     "active-value": "1", "inactive-value": "0", disabled: (row) => {
      //       console.log("row.menuType",row.menuType);
      //       return row.menuType != "M";
      //     },
      //   },
      // }
      {
        columnLabel: "启用否",
        columnName: "status",
        columnWidth: "80",
        align: "center",
        hasSlot: true,
      }
    ],
  };
});

const appUuidChange = (item) => {
  selectAppUuid.value = item.menuId;
  selectAppObj.value = item;
  searchData.cpUuid = item.menuIdid;
  getMenuList(selectAppUuid.value);
};

const switchChange = async (row, val) => {
  if (!initialized.value) {
    return;
  }
  let params = {
    menuId: row.menuId,
    status: val,
  };
  let res = await menuStatus(params);
  if (res.code == 200) {
    ElMessage.success(val == 1 ? "已启用" : "已禁用");
    getAppList(selectAppUuid.value)
  } else {
    getAppList(selectAppUuid.value)
    return;
  }
};

const addDialogVisible = ref(false);
const dialogTitle = ref("新增菜单组");
const addOrEditFormRef = ref(null);
const addOrEditForm = reactive({
  menuName: "",
  yyly: "",
  cpUuid: "",
  menuPid: "",
  cpmc: "",
  menuIco: "",
  remark: "",
  status: "1",
  menuSort: 1,
  isCache: "1",
  isShow: "1",
  menuId: "",
  menuType: "C",
  path: "",
});
let crtIndex = ref(); //当前点击的报告类型索引
const appItems = computed(() => {
  const isExternalApp = addOrEditForm.yyly && addOrEditForm.yyly !== "0";
  return [
    {
      label: "应用来源",
      prop: "yyly",
      component: "el-radio-group",
      options: appSourceFn(),
      disabled: true,
      attrs: {
        disabled: true,
      },
    },
    {
      component: "el-input",
      label: "应用名称",
      prop: "cpmc",
      attrs: {
        maxlength: 50,
        disabled: true,
      },
    },
    {
      component: "el-input",
      label: "AppID",
      prop: "cpUuid", //  应用ID待修改
      attrs: {
        disabled: true,
      },
    },
    {
      label: "父级菜单组",
      prop: "menuPid",
      component: "el-tree-select",
      // options: menuFnList.value,
      // optionLabel: "menuName",
      // optionValue: "menuId",
      attrs: {
        data: menuFnList.value,
        "check-strictly": true,
        "node-key": "menuId",
        props: {
          label: 'menuName',
          children: 'children'
        },
        placeholder: "请选择",
        clearable: true,
        disabled: chooseFather.value,
      },
      show: showFather.value,
    },
    {
      label: "菜单组名称",
      prop: "menuName",
      component: "el-input",
      attrs: {
        placeholder: "请输入（输入字符<=30）",
        clearable: true,
        maxlength: 30,
      },
    },
    {
      label: "菜单组类型",
      prop: "menuType",
      component: "el-select",
      options: menuTypeFn(),
      attrs: {
        placeholder: "请选择",
        clearable: true,
        disabled: true,
      },
    },
    // ...(isExternalApp ? [
    {
      component: "el-input",
      label: "菜单组应用标识",
      prop: "originalApplyUuid",
      attrs: {
        placeholder: "请输入",
        clearable: true,
      },
    },
    // ] : []),
    {
      label: "菜单组图标",
      prop: "menuIco",
    },
    {
      label: "请求链接",
      prop: "path",
      component: "el-input",
      attrs: {
        placeholder: "请输入",
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
      message: "菜单组名称不能为空",
      trigger: ["blur"],
    },
  ],
  menuType: [
    {
      required: true,
      message: "菜单组类型不能为空",
      trigger: ["change"],
    },
  ],
  path: [
    {
      required: true,
      message: "菜单组路径不能为空",
      trigger: ["blur"],
    },
  ],
});

const bandMenuVisible = ref(false);
const menuNameData = ref("");
const appIdData = ref("");

// 菜单列表和选择状态
const menuList = ref([]);
const selectAll = ref(false);

const selectedMenus = computed(() => {
  return menuList.value.filter((menu) => menu.checked);
});

// 全选处理
const handleSelectAll = (value) => {
  const filteredMenuList = menuListFn((menuList.value) || [], { menuName: menuNameData.value, cpUuid: appIdData.value }, ['cpUuid']);
  menuList.value.forEach((menu) => {
    const isInFilteredList = filteredMenuList.some(f => f.menuId == menu.menuId);
    if (isInFilteredList) {
      menu.checked = value;
    }
  });

  // 更新全选状态
  selectAll.value = value;

  const checkedCount = menuList.value.filter(menu => menu.checked).length;
  const totalCount = menuList.value.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < totalCount;
};

const handleMenuCheck = () => {
  const checkedCount = menuList.value.filter((item) => item.checked).length;
  selectAll.value = checkedCount === menuList.value.length && menuList.value.length > 0;
  isIndeterminate.value = checkedCount > 0 && checkedCount < menuList.value.length;
};

const removeSelected = (menu) => {
  menu.checked = false;
  const checkedCount = menuList.value.filter((item) => item.checked).length;
  selectAll.value = checkedCount === menuList.value.length && menuList.value.length > 0;
  isIndeterminate.value = checkedCount > 0 && checkedCount < menuList.value.length;
};



const btnClick = async (item, row) => {
  if (item.text == "新增菜单组") {
    dialogTitle.value = "新增菜单组";
    showFather.value = false;
    let keysData = Object.keys(addOrEditForm);
    keysData.forEach((item) => {
      if (item == "status" || item == "isCache" || item == "isShow") {
        addOrEditForm[item] = "1";
      } else if (item == "menuSort") {
        addOrEditForm[item] = 1;
      } else if (item == "menuType") {
        addOrEditForm[item] = "M";
      } else {
        addOrEditForm[item] = "";
      }
      addOrEditForm.yyly = selectAppObj.value.yyly;
      addOrEditForm.cpUuid = selectAppObj.value.menuId;
      addOrEditForm.cpmc = selectAppObj.value.menuName;
      selectPicture()
    });
    console.log("addOrEditForm", addOrEditForm);
    addDialogVisible.value = true;
    nextTick(() => {
      addOrEditFormRef.value.clearValidate();
    });
  } else if (item.text == "新增子菜单组") {
    dialogTitle.value = "新增子菜单组";
    let keysData = Object.keys(addOrEditForm);
    chooseFather.value = true;
    showFather.value = true;
    keysData.forEach((item) => {
      if (item == "status") {
        addOrEditForm[item] = "1";
      } else if (item == "menuSort") {
        addOrEditForm[item] = 1;
      } else if (item == "menuType") {
        addOrEditForm[item] = "M";
      } else {
        addOrEditForm[item] = "";
      }
    });
    addOrEditForm.yyly = selectAppObj.value.yyly;
    addOrEditForm.cpUuid = selectAppObj.value.menuId;
    addOrEditForm.cpmc = selectAppObj.value.menuName;
    addOrEditForm.menuPid = row.menuId;
    selectPicture()
    addDialogVisible.value = true;
    nextTick(() => {
      addOrEditFormRef.value.clearValidate();
    });
  } else if (item.text == "编辑菜单组") {
    dialogTitle.value = "编辑菜单组";
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
    if (row?.menuPid == '0') {
      showFather.value = false;
    } else {
      showFather.value = true;
    }
    currentMenu.value = row.menuId;
    addOrEditForm.yyly = selectAppObj.value.yyly;
    addOrEditForm.cpUuid = selectAppObj.value.menuId;
    addOrEditForm.cpmc = selectAppObj.value.menuName;
    addDialogVisible.value = true;
  } else if (item.text == "绑定菜单项") {
    dialogTitle.value = "绑定菜单项";
    appIdData.value = selectAppUuid.value;
    bandMenuVisible.value = true;
    menuNameData.value = "";
    currentMenu.value = row.menuId;
    // console.log(selectAppUuid.value,'selectAppUuid.value');
    bindMenu({ cpUuid: selectAppUuid.value, menuPid: row.menuId, pageNum: '1', pageSize: '99999' }).then((res) => {
      menuList.value = (res.rows || []).map((f) => {
        return {
          ...f,
          checked: f.isBinding == '1' ? true : false
        }
      })
      selectAll.value = menuList.value.every((menu) => menu.checked);
      let len = menuList.value.filter((item) => item.checked).length
      isIndeterminate.value = len > 0 && len < menuList.value.length
      // console.log(res.rows, 'rews--')
    })
  } else if (item.text == "解绑菜单项") {
    ElMessageBox.confirm(
      "此记录一旦移除，可能会影响所关联功能的使用，请慎重操作！确定还要进行本操作吗？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }
    )
      .then(() => {
        let arr = row.map((item) => item.menuId)
        unBindMenu({ menuIds: arr, cpId: selectAppObj.value.menuId }).then((res) => {
          if (res.code == 200) {
            ElMessage({
              type: "success",
              message: "解绑成功!",
            });
            getAppList(selectAppUuid.value)
          }
        })
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消",
        });
      });
  } else if (item.text == "删除菜单组") {
    ElMessageBox.confirm(
      "此记录一旦删除，可能会影响所关联功能的使用，请慎重操作！确定还要进行本操作吗？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }
    )
      .then(() => {
        let arr = row.map((item) => item.menuId)
        deleteMenu({ menuIds: arr }).then((res) => {
          if (res.code == 200) {
            ElMessage({
              type: "success",
              message: "删除成功!",
            });
            getAppList(selectAppUuid.value)
          }
        })
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消",
        });
      });
  }
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
      console.log(addOrEditForm, 'ret');
      let obj = {
        ...addOrEditForm,
        cpUuid: [addOrEditForm.cpUuid]
      }
      if (dialogTitle.value == "新增菜单组" || dialogTitle.value == "新增子菜单组") {
        insert(obj).then((res) => {
          if (res.code == 200) {
            ElMessage({
              type: "success",
              message: "新增成功!",
            });
            getAppList(selectAppUuid.value)
            addDialogVisible.value = false;
          }
        });
      } else {
        updateMenuGroup(obj).then((res) => {
          if (res.code == 200) {
            ElMessage({
              type: "success",
              message: "编辑成功!",
            });
            getAppList(selectAppUuid.value)
            addDialogVisible.value = false;
          }
        });
      }
    }
  });
};

const closeAddDialog = () => {
  addDialogVisible.value = false;
  chooseFather.value = false;
}

const getList = async (type) => {
  if (type == "重置") {
    tableRef.value.fetchData("重置");
  } else {
    tableRef.value.fetchData();
  }
};

const getMenuList = async (menuId, type) => {
  if (type == '查询') {
    let res = await list({ ...searchData });
    menuListData.value = res.rows?.find((item) => item.menuId == menuId)?.children || [];
  } else if (type == '重置') {
    searchData.menuName = '';
    searchData.status = ''
    let res = await list({ ...searchData });
    menuListData.value = res.rows?.find((item) => item.menuId == menuId)?.children || [];
  } else {
    menuListData.value = appList.value.find((item) => item.menuId == menuId)?.children || [];
  }
  nextTick(() => {
    tableRef.value.fetchData();
  });
};

const getAppList = async (uuid) => {
  // console.log(uuid,'uuid');
  // console.log(searchData,"searchData");
  // console.log(selectAppUuid,'selectAppUuid');
  let res = await list({ ...searchData });
  if (res.code == 200) {
    appList.value = res.rows || [];
    if (uuid) {
      selectAppUuid.value = uuid
      selectAppObj.value = appList.value?.find((item) => item.menuId == uuid) || {};
      searchData.cpUuid = selectAppUuid.value;
      getMenuList(selectAppUuid.value);
    } else {
      selectAppUuid.value = appList.value[0]?.menuId || "";
      selectAppObj.value = appList.value[0] || {};
      searchData.cpUuid = selectAppUuid.value;
      getMenuList(selectAppUuid.value);
    }

  }
};


// 绑定菜单项保存
const menuItemSave = () => {
  // console.log(selectedMenus.value)
  updateBindMenu({ menuIds: selectedMenus.value.map((item) => item.menuId), menuId: currentMenu.value }).then((res) => {
    if (res.code == 200) {
      ElMessage({
        type: "success",
        message: "绑定成功!",
      });
      getAppList(selectAppUuid.value)
      bandMenuVisible.value = false
    }
  })
}










const resetSearch = () => {
  searchData.menuName = "";
  searchData.cpmc = "";
  searchData.status = "";
  searchData.cpUuid = '';
  getAppList();
}

onMounted(async () => {
  await getAppList();
  nextTick(() => {
    initialized.value = true;
  });
});
</script>

<style lang="less" scoped>
.menuGroupManage-main-class {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  .menuGroupManage-left-class {
    width: 20%;
    height: 100%;
    background-color: #fff;

    .menuGroupManage-left-title {
      height: 50px;
      padding-left: 20px;
      font-weight: 500;
      color: #000;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #bbb;
    }

    .menuGroupManage-left-search {
      width: calc(100% - 16px);
      padding: 0px 8px;
      height: 56px;
      display: flex;
      align-items: center;
    }

    .menuGroupManage-left-app {
      height: calc(100% - 116px);
      overflow-y: auto;
      padding: 0px 8px;

      .menuGroupManage-left-item-app {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 42px;
        padding: 0px 10px;
        box-sizing: border-box;
        cursor: pointer;

        .app-name-text {
          font-weight: 500;
          flex: 1;
          width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 8px;
        }

        .menuGroupManage-left-item-source {
          height: 24px;
          width: 70px;
          flex-shrink: 0;
          font-size: 12px;
          text-align: center;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .menuGroupManage-active-item {
        border-radius: 3px;
        background-color: rgba(64, 158, 255, 0.2);
      }
    }
  }

  .menuGroupManage-right-class {
    width: calc(80% - 12px);
    height: 100%;
    background-color: #fff;

    .menuGroupManage-right-title {
      height: 50px;
      padding-left: 20px;
      font-weight: 500;
      color: #000;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #bbb;
    }

    .menuGroupManage-right-content {
      height: calc(100% - 50px);
      display: flex;
      width: 100%;
      flex-direction: column;

      .menuGroupManage-search {
        background-color: rgba(253, 253, 251);
        display: flex;
        align-items: center; // 垂直居中
        flex-shrink: 0;
      }

      .menuGroupManage-table {
        min-height: 0;
        flex: 1;
      }
    }
  }
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

.menuGroupManage-bindMenu {
  display: flex;
  padding: 20px;
  gap: 20px;

  .menuGroupManage-left-bindMenu {
    width: 60%;
    padding: 20px;
    height: 662px;
    border: 1px solid #bbb;
    box-sizing: border-box;

    .menuGroupManage-bindMenu-search {
      width: 100%;
      height: 56px;
      display: flex;
      align-items: center;
    }

    .menuGroupManage-bindMenu-menuList {
      margin-top: 20px;
      height: calc(100% - 76px);
      overflow-y: auto;
      width: 100%;

      .menuGroupManage-bindMenu-allSelect {
        margin-bottom: 16px;
        padding: 0 8px;
      }

      .menuGroupManage-bindMenu-menuItems {
        width: calc(100% - 16px);

        .menuGroupManage-bindMenu-menuItem {
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        // .menuGroupManage-active-item{
        //   background-color: rgba(230,241,255,1);
        // }

        .menuGroupManage-bindMenu-menuSource {
          margin-left: 12px;
          height: 24px;
          padding: 0 8px;
          font-size: 12px;
          border-radius: 3px;
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .menuGroupManage-right-bindMenu {
    width: calc(40% - 20px);
    height: 660px;
    border: 1px solid #bbb;

    .menuGroupManage-bindMenu-title {
      height: 50px;
      padding-left: 20px;
      font-weight: 500;
      color: #000;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #bbb;
      box-sizing: border-box;
    }

    .menuGroupManage-bindMenu-select {
      height: calc(100% - 50px);
      width: 100%;
      padding: 20px 0 20px 20px;
      box-sizing: border-box;

      .menuGroupManage-bindMenu-selectNum {
        display: flex;
        justify-content: flex-end;
        height: 30px;
        margin-bottom: 20px;
        margin-right: 20px;
      }

      .menuGroupManage-bindMenu-selectItems {
        height: calc(100% - 90px);
        overflow-y: auto;

        .menuGroupManage-bindMenu-selected-item {
          display: flex;
          justify-content: space-between;
          height: 50px;
        }
      }
    }
  }

  .checkAppCss {
    max-width: 400px;
    // border: 1px solid rgba(25, 128, 255, 1);
    color: rgba(25, 128, 255, 1);
    padding: 5px 6px;
    border-radius: 3px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .cpName {
      display: inline-block;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: bottom;
    }
  }
}
</style>

<style lang="less">
.menuGroupManage-submitDialog {
  .menuGroupManage-upload-demo {
    display: flex;
    align-items: center;
  }

  .el-radio.is-disabled {
    background-color: transparent !important;
  }
}

.menuGroupManage-bindMenu-menuItem {
  .el-checkbox {
    width: 100%;
    display: flex;
    align-items: center;

    .el-checkbox__input {
      display: block;
      width: 14px;
      height: 14px;
    }

    .el-checkbox__label {
      width: calc(100% - 22px);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.my-custom-popover .cpName {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
}
</style>