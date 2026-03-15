<!-- 应用用户管理 -->
<template>
  <div class="appUserManage-class">
    <div class="appUserManage-left">
      <div class="appUserManage-search">
        <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="auto" @searchVal="getList()" @reset="getList('重置')" :inline="true" />
      </div>
      <div class="appUserManage-table">
        <tableList ref="tableRef" :queryParams="searchData" v-bind="bindData" @rowClick="tableCellClick" @cellClick="cellClick" @btnClick="btnClick" @statusClick="switchChange">
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
        </tableList>
      </div>
    </div>
    <div class="appUserManage-right">
      <div class="appUserManage-top-right">
        <!-- <div class="appUserManage-btn-main"> -->
        <div class="permissionBtn-class">
          权限信息
        </div>
      </div>
      <div class="appUserManage-right-bottom">
        <el-tree :data="treeData" ref="treeDataRef" show-checkbox node-key="menuId" :default-checked-keys="defaultCheckedKeysList" :props="{ label:'menuName',children:'children', disabled: 'menuId'}" default-expand-all />
      </div>
    </div>
  </div>
  <!-- 批量新增用户弹窗  -->
  <SzycDialog v-model="bandMenuVisible" width="98%" title="批量新增用户" :alignCenter="true">
    <template #uname>
      <div class="batch-add-user-dialog">
        <div class="batchTable">
          <div style="width:100%;height:calc(100%);">
            <tableList ref="tableDialogRef" style="padding:0" v-bind="bindDialogTable" :apiUrl="userList" @btnClick="userMore" />
          </div>
        </div>
        <div style="width:400px;box-sizing:border-box;">
          <div class="headerTitleIcon">
            <el-icon size="20" class="bmr">
              <User />
            </el-icon> 权限配置
          </div>
          <div style="overflow: auto;height:">
            <el-form :model="dialogForm" label-width="auto" style="max-width: 600px">
              <el-form-item label="数据权限：">
                <el-switch v-model="dialogForm.dataScope" active-value="1" inactive-value="0" />
              </el-form-item>
              <el-form-item label="授权方式：">
                <el-radio-group v-model="dialogForm.authType">
                  <el-radio value="2"> 角色授权 </el-radio>
                  <el-radio value="1"> 快速授权 </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="权限信息：">
                <div v-if="dialogForm.authType == '2'">
                  <chekbox-c v-model="dialogForm.roleIds" :Prop="{ label:'roleName',value:'roleId',children:'children' }" :items="roleListArr">
                    <template #children="{item}">
                      <el-tree :data="item.children" :props="{ label:'menuName',children:'children' }" />
                    </template>
                  </chekbox-c>
                </div>
                <div v-if="dialogForm.authType == '1'">
                  <el-tree ref="treeRef" :data="menuList" :default-checked-keys="defaultCheckKey" node-key="menuId" :props="{label:'menuName',children:'children'}" show-checkbox />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <div style="margin-top:20px;display: flex;justify-content: center;">
        <configBtn type="cancel" @click="bandMenuVisible = false"> 取消 </configBtn>
        <configBtn @click="saveBatchUser">保存</configBtn>
      </div>
    </template>
  </SzycDialog>
  <!-- 新增用户 -->
  <SzycDialog v-model="userDialog" :width="`${titleUserDialog !='权限管理' ? '60%': '30%'}`" :title="titleUserDialog" :alignCenter="true" :destroy="true" @close="userDialog = false">
    <template #uname>
      <div class="userDialogCss">
        <div style="width:calc(100% - 470px);margin-right:20px;height:100%;" v-if="titleUserDialog !='权限管理'">
          <div style="height:40px;display:flex;align-items:center;">
            <p class="titleNameHeader"></p>
            <p class="titleNameText"> 基础信息 </p>
          </div>
          <szycSubmitForm :showAction="false" :modelValue="addOrEditForm" :items="appItems" ref="addOrEditFormRef" labelWidth="auto" :rules="addOrEditRules"> </szycSubmitForm>
        </div>
        <div style="width:450px;height:100%;">
          <div style="height:40px;display:flex;align-items:center;" v-if="titleUserDialog !='权限管理'">
            <p class="titleNameHeader"></p>
            <p class="titleNameText"> 角色配置 </p>
          </div>
          <div style="height:calc(100% - 40px);overflow:auto">
            <el-form :model="dialogForm" label-width="auto">
              <el-form-item label="数据权限：">
                <el-switch v-model="dialogForm.dataScope" active-value="1" inactive-value="0" />
              </el-form-item>
              <el-form-item label="授权方式：">
                <el-radio-group v-model="dialogForm.authType">
                  <el-radio value="2"> 角色授权 </el-radio>
                  <el-radio value="1"> 快速授权 </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="权限信息：">
                <div v-if="dialogForm.authType == '2'">
                  <chekbox-c v-model="dialogForm.roleIds" :Prop="{ label:'roleName',value:'roleId',children:'children' }" :items="roleListArr">
                    <template #children="{item}">
                      <el-tree :data="item.children" :props="{ label:'menuName',children:'children' }" />
                    </template>
                  </chekbox-c>
                  <!-- <el-checkbox-group v-model="dialogForm.roleIds">
                  <el-checkbox v-for="item in roleListArr" :key="item.roleId" :label="item.roleName" :value="item.roleId" style="width:100%;">
                    <el-tree :data="item.children" :props="{ label:'menuName',children:'children' }" />
                  </el-checkbox>
                </el-checkbox-group> -->
                </div>
                <div v-if="dialogForm.authType == '1'">
                  <el-tree ref="treeRef" :data="menuList" :default-checked-keys="defaultCheckKey" node-key="menuId" :props="{label:'menuName',children:'children'}" show-checkbox />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <div style="margin-top:20px;display: flex;justify-content: center;">
        <configBtn type="cancel" @click="userDialog = false"> 取消 </configBtn>
        <configBtn @click="userSave">保存</configBtn>
      </div>
    </template>
  </SzycDialog>
  <!-- 人员详情 -->
  <SzycDialog v-model="userInfoDialog" width="90%" title="人员信息" :destroy="true" :alignCenter="true">
    <template #uname>
      <div class="userInfoCss">
        <div class="searchCss">
          <SzycFormSearch v-model="userInfoForm" :items="userInfoItems" labelWidth="auto" @searchVal="userInfoRef.fetchData()" @reset="userInfoRef.fetchData()" :inline="true" />
        </div>
        <div class="tableCss">
          <tableList ref="userInfoRef" :queryParams="userInfoForm" v-bind="userInfoBind" @btnBottomClick="userInfoSave">
          </tableList>
        </div>
      </div>
    </template>
  </SzycDialog>
  <!-- 密码重置 -->
  <SzycDialog v-model="infoShow" width="35%" title="密码重置" :destroy="true" :alignCenter="true">
    <template #uname>
      <div style="width:90%;margin:0 5%;display: flex;">
        <p style="padding-top:3px;box-sizing: border-box;">
          <el-icon size="20" color="#ff8500">
            <InfoFilled />
          </el-icon>
        </p>
        <p style="font-size:16px;font-weight:600;padding-left:10px;box-sizing: border-box;line-height: 25px;color: #000;"> 尊敬的用户，您即将对所选用户密码进行重置操作。为确保操作安全，请输入您当前登录账号的密码以完成授权。 </p>
      </div>
      <div style="width:90%;margin:0 5%;">
        <szycSubmitForm ref="resetPwRef" :modelValue="resetPwForm" buttonName="确定" @submit="btnConfim(resetPwRef)" @cancel="infoShow = false" :items="passWordItem" labelWidth="auto" :rules="resetPwRules" />
      </div>
    </template>
  </SzycDialog>
  <!-- 角色详情 -->
  <SzycDialog v-model="roleMessage" width="30%" title="角色权限查看" :destroy="true" :alignCenter="true">
    <template #uname>
      <el-tree :data="treeRoleList" ref="treeRoleRef" style="height:700px;overflow: auto;" show-checkbox node-key="menuId" :default-checked-keys="defaultKeyList" :props="{ label:'menuName',children:'children', disabled: 'menuId'}" default-expand-all />
    </template>
  </SzycDialog>

</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycSubmitForm from "@/components/element/SubmitForm.vue";
import { yesOrNoFn, yesOrNoFns, userTypeFn, idcardTypeFn, authTypeFn, sexFn, postFn } from "@/types/dict/index";
import tableList from "@/components/table/tableAndPage.vue";
import { ElMessage, ElMessageBox } from "element-plus";

import configBtn from "@/components/element/Confirm.vue";
import chekboxC from './chekboxC.vue'
import { getRoleMenuListApi, listRoleApi, insertSysUserApi, updateSysUserApi, deleteSysUserApi, statusSysUserApi, resetSysUserPwdApi, batchInsertSysUserApi, authorityManagementApi } from '@/api/appManage/appRegist'
import { list } from "@/api/appManage/menuLibraryManage"
import { searchItems, userInfoItems, bindData, userInfoBind, bindDialogTable, addOrEditRules, passWordItem, resetPwRules, appItems } from './index.js'

const roleMessage = ref(false)
const treeRoleRef = ref(null)
const treeRoleList = ref([])

const defaultKeyList = ref([])



const treeDataRef = ref([])
const treeData = ref([])
const meunIdKey = ref([])
const defaultCheckedKeysList = ref([])

// 菜单组
const listFn = () => {
  list({ pageSize: '99999' }).then((res) => {
    treeData.value = res?.rows || []
    meunIdKey.value = res.rows[0]?.menuId || []
    nextTick(() => {
      getList()
    })
  })
}


const tableCellClick = (data) => {
  treeDataRef.value.setCheckedKeys(data?.map?.menuIds, true)
}

const cellClick = ({ row, column, $index }) => {
  if (column.columnLabel == '所属角色') {
    getRoleMenuListApi({ roleIds: row.map.roleIds }).then((res) => {
      // console.log(res, 'res=');
      treeRoleList.value = res.data
      defaultKeyList.value = row.map?.menuIds || []
      roleMessage.value = true
    })
  }
}

const resetPwRef = ref(null)
const selectRowList = ref([])
// 密码重置
const resetPwForm = reactive({
  password: '',
})

//  查询值
const searchData = reactive({
  nickName: "",
  gh: "",
  userType: "",
  phonenumber: "",
  status: "",
  hdptCode: "",
});



const tableRef = ref(null); //  表格
const defaultExpandAll = ref(false); //  是否默认展开


const bandMenuVisible = ref(false)
const tableDialogRef = ref(null)

const dialogForm = reactive({
  dataScope: '0',   // 数据权限
  authType: '2',    // 授权方式 1 快速授权 2 角色授权
  roleIds: [],       // 角色列表
})
const roleListArr = ref([])  // 角色列表
const userList = ref([])


const permissionBtnList = ref([
  {
    uuid: "1",
    name: "应用功能权限详情",
  },
  {
    uuid: "2",
    name: "数据权限详情",
  },
]);

const userDialog = ref(false);
const titleUserDialog = ref("");
const addOrEditForm = reactive({
  nickName: '',     // 姓名
  dptCode: '',     //  标准科室
  hdptCode: '',     // 实际科室
  idCardType: '',   // 证件类型
  idCode: '',       // 证件号码
  sex: '',          // 性别
  gh: '',           // 工号
  phonenumber: '',  // 联系电话
  medicalType: '',   // 人员类型
  postCode: '',     // 行政管理职务（职称）
  email: '',        // 邮箱
  status: '',       // 启用否
  remark: '',       // 备注
})
const treeRef = ref(null);


const userInfoDialog = ref(false)  // 人员详情弹出
const userInfoRef = ref(null)      // 用户管理
const userInfoForm = reactive({
  name: '',   // 姓名
  jobId: '',   // 工号
  medicalType: '',   // 人员类型
  dptCode: '',   // 科室代码
  postCode: '',   // 行政管理职务（职称）
})

// 启用禁用
const switchChange = async (val) => {
  let params = {
    userId: val.row.userId,
    status: val.value,
  };
  let res = await statusSysUserApi(params);
  if (res.code == 200) {
    ElMessage.success(val.value == 1 ? "已启用" : "已禁用");
    getList()
  } else {
    getList()
  }
};




const addOrEditFormRef = ref(null);
const menuList = ref([])  // 产品菜单列表
const defaultCheckKey = ref([])  // 默认选中的菜单
const rowId = ref('')
const selectList = ref([])  // 选中的用户
const infoShow = ref(false)


const permissionActiveBtn = ref("1");
const handleBtnClick = (item) => {
  permissionActiveBtn.value = item.uuid;
};

const getList = (type) => {
  tableRef.value?.fetchData().then((res) => {
    if (res && res.length > 0) {
      defaultCheckedKeysList.value = res[0]?.map?.menuIds || []
    } else {
      defaultCheckedKeysList.value = []
    }
  })
};

// 表格上方按钮事件
const btnClick = (itemBtn, data) => {
  // console.log(itemBtn, 'itemBtn');
  if (itemBtn.text == '批量用户新增') {
    bandMenuVisible.value = true;
    userList.value = []
    dialogForm.roleIds = []   // 授权角色
    dialogForm.authType = '2'  // 授权方式
    defaultCheckKey.value = [] // 默认选中的菜单
    dialogForm.dataScope = '0'  // 数据权限
    listRoleApi({ pageSize: 99999, getType: '0' }).then((res) => {
      console.log(res, 'res1');
      roleListArr.value = res.data
    })
    list({ pageSize: 99999 }).then((res) => {
      console.log(res, 'res2');
      menuList.value = res?.rows || []
    })
    nextTick(() => {
      tableDialogRef.value?.fetchData()
    })
  } else if (itemBtn.text == '新增用户' || itemBtn.text == '编辑用户') {
    let flag = itemBtn.text == '新增用户' ? true : false
    userDialog.value = true;
    rowId.value = data?.userId || ''
    titleUserDialog.value = itemBtn.text;
    dialogForm.dataScope = data?.dataScope || '0'  // 数据权限
    dialogForm.roleIds = flag ? [] : (data?.map.roleIds || []);
    dialogForm.authType = data?.authType || '2'
    let objData = {}
    for (let key in addOrEditForm) {
      objData[key] = flag ? '' : data[key]
    }
    Object.assign(addOrEditForm, objData)
    defaultCheckKey.value = flag ? [] : (data.map?.menuIds || [])
    listRoleApi({ pageSize: 99999, getType: '0' }).then((res) => {
      // console.log(res, 'res');
      roleListArr.value = res.data
    })
    list({ pageSize: 99999 }).then((res) => {
      menuList.value = res?.rows || []
    })
  } else if (itemBtn.text == '权限管理') {
    userDialog.value = true
    selectList.value = data
    titleUserDialog.value = itemBtn.text
    dialogForm.dataScope = '0'  // 数据权限
    dialogForm.roleIds = []
    dialogForm.authType = data?.authType || '2'
    defaultCheckKey.value = []
    listRoleApi({ pageSize: 99999, getType: '0' }).then((res) => {
      // console.log(res, 'res');
      roleListArr.value = res.data
    })
    list({ pageSize: 99999 }).then((res) => {
      menuList.value = res?.rows || []
    })

  } else if (itemBtn.text == '密码重置') {
    infoShow.value = true
    resetPwForm.password = ''
    selectRowList.value = data
  } else if (itemBtn.text == '删除') {
    ElMessageBox.confirm(
      "是否删除当前所勾选用户？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }
    )
      .then(() => {
        let arr = data.map((item) => item.userId)
        deleteSysUserApi({ userIds: arr }).then((res) => {
          if (res.code === 200) {
            ElMessage.success('删除成功！')
            getList()
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
}

// 新增/编辑用户保存
const userSave = () => {
  console.log(1);
  if (titleUserDialog.value == '权限管理') {
    let obj = {
      ...dialogForm,
      appSysMenuList: treeRef.value?.getCheckedKeys() || [],
      userIds: selectList.value.map((item)=>item.userId),
    }
    authorityManagementApi(obj).then((res) => {
      if (res.code === 200) {
        ElMessage.success('保存成功！')
        userDialog.value = false
        getList()
      }
    })
  } else {
    addOrEditFormRef.value?.validate((valid) => {
      if (valid) {
        let obj = {
          ...addOrEditForm,
          ...dialogForm,
          appSysMenuList: treeRef.value?.getCheckedKeys() || [],
        }
        if (titleUserDialog.value == '新增用户') {
          insertSysUserApi(obj).then((res) => {
            if (res.code === 200) {
              ElMessage.success('新增成功！')
              userDialog.value = false
              getList()
            }
          })
        } else if (titleUserDialog.value == '编辑用户') {
          obj.userId = rowId.value
          updateSysUserApi(obj).then((res) => {
            if (res.code === 200) {
              ElMessage.success('编辑成功！')
              userDialog.value = false
              getList()
            }
          })
        }
        console.log('表单校验通过');
      } else {
        console.log('表单校验不通过');
      }
    })
  }
}


// 批量新增用户(添加人员)
const userMore = (itemBtn, data) => {
  if (itemBtn.text === '添加人员') {
    userInfoDialog.value = true
    for (let key in userInfoForm) {
      userInfoForm[key] = ''
    }
    nextTick(() => {
      userInfoForm.humanIds = userList.value.map((item) => item.id)
      userInfoRef.value.fetchData()
    })
  } else {
    console.log(data, 'data');
    userList.value = userList.value.filter((item) => !data.find((f) => f.id == item.id))
    nextTick(() => {
      tableDialogRef.value.fetchData()
    })
  }
}

// 保存批量新增的用户
const saveBatchUser = () => {
  let obj = {
    ...dialogForm,
    appSysMenuList: treeRef.value?.getCheckedKeys() || [],
    humanResourcesManagementEntities: userList.value,
  }
  batchInsertSysUserApi(obj).then((res) => {
    if (res.code == 200) {
      ElMessage.success('批量新增成功！')
      bandMenuVisible.value = false
      getList()
    }
  })
}



// 保存已经勾选的人员
const userInfoSave = (item, selectRow) => {
  // console.log(item, 'items');
  // console.log(selectRow, 'adata');
  if(item.text == "保存"){
    userList.value.push(...selectRow)
    userInfoDialog.value = false
    nextTick(() => {
      tableDialogRef.value?.fetchData()
    })
  }else{
    userInfoDialog.value = false
  }
  
}


// 重置密码
const btnConfim = (ref) => {
  let arr = selectRowList?.value || []
  resetSysUserPwdApi({ userIds: arr.map(item => item.userId), ...resetPwForm }).then((res) => {
    if (res.code === 200) {
      ElMessage.success('密码重置成功！')
      getList()
      infoShow.value = false
    }
  })
}



onMounted(() => {
  // getList();
  listFn()
});
</script>

<style  scoped>
@import "./appUserManage.scss";
</style>