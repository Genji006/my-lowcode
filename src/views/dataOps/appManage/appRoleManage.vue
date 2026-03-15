<template>
  <div class="appRoleManageCss">
    <!-- 查询表格 -->
    <div class="searchTable">
      <!-- 查询 -->
      <div class="app_form">
        <SzycFormSearch v-model="searchData" :items="searchRoleItems" labelWidth="auto" @searchVal="getList()"
          @reset="getList('重置')" :inline="true" />
      </div>
      <!-- 表格 -->
      <div class="app_table">
        <tableList ref="tableRef" :queryParams="searchData" v-bind="bindRoleData" @btnClick="btnClick"
          @rowClick="tableCellClick" @statusClick="switchChange" />
      </div>
    </div>
    <!-- 应用信息 -->
    <div class="appMessage">
      <div class="card-header">
        <p>应用信息</p>
      </div>
      <div class="card-body">
        <el-tooltip v-for="item in treeData" :key="item.menuId" :content="item.menuName" placement="top"
          :show-after="200">
          <div @click="meunIdKey = item.menuId"
            :style="meunIdKey == item.menuId ? 'background-color: #dfeafa;color:#005eff;' : ''" class="treeDataCss">
            {{ item.menuName }}
          </div>
        </el-tooltip>
      </div>
    </div>
    <!-- 功能权限信息 -->
    <div class="authority">
      <div class="card-header">
        <p>功能权限信息</p>
      </div>
      <div class="card-body">
        <el-tree ref="treeDataRef" :data="treeDataFn(treeData, meunIdKey)" show-checkbox node-key="menuId"
          :default-checked-keys="defaultCheckedKeysList"
          :props="{ label: 'menuName', children: 'children', disabled: 'menuId', }" default-expand-all />
      </div>
    </div>
  </div>
  <!-- 新增/编辑角色 -->
  <SzycDialog v-model="addAndEditRole" width="60%" :title="titleDialog" :destroy="true" :alignCenter="true">
    <template #uname>
      <div class="addRoleCss">
        <div class="addRoleLeft">
          <div class="titleRole">
            <el-icon size="18" class="bmr" color="#005eff">
              <Collection />
            </el-icon> 角色基本信息
          </div>
          <div class="contentRole">
            <szycSubmitForm :showAction="false" :modelValue="addOrEditForm" :items="roleItemsSubmit"
              ref="addOrEditFormRef" labelWidth="auto" :rules="roleRules"> </szycSubmitForm>
          </div>
        </div>
        <div class="addRoleRight">
          <div class="titleRole">
            <el-icon size="18" class="bmr" color="#005eff">
              <User />
            </el-icon> 角色权限信息
          </div>
          <div class="contentRole">
            <el-tree style="width:100%;height:100%;" ref="treeRef" default-expand-all :data="treeData" show-checkbox
              node-key="menuId" :default-checked-keys="defaultCheckedKeys" :props="propsData" />
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:center;margin-top:20px;">
        <cancelBtn @click="addAndEditRole = false"> 取消 </cancelBtn>
        <configBtn @click="menuItemSave"> 保存 </configBtn>
      </div>
    </template>
  </SzycDialog>
  <!-- 绑定用户 -->
  <SzycDialog v-model="bindUserList" width="80%" title="绑定用户" :destroy="true" :alignCenter="true">
    <template #uname>
      <div class="bindUserListCss">
        <div class="searchUser">
          <SzycFormSearch v-model="searchUser" :items="userItems" labelWidth="auto"
            @searchVal="userTableRef.fetchData()" @reset="userTableRef.fetchData()" :inline="true" />
        </div>
        <div class="userListCss">
          <tableList ref="userTableRef" style="padding:0; height: 600px;" :queryParams="searchUser" v-bind="bindUserData"
            @btnClick="userBtn" />
        </div>
      </div>
    </template>
  </SzycDialog>
  <!-- 添加用户 -->
  <SzycDialog v-model="bindUserListInfo" width="80%" title="添加用户" :destroy="true" :alignCenter="true">
    <template #uname>
      <div class="bindUserListCss">
        <div class="searchUser">
          <SzycFormSearch v-model="searchUserInfo" :items="userItemsInfo" labelWidth="auto"
            @searchVal="userTableInfoRef.fetchData()" @reset="userTableInfoRef.fetchData()" :inline="true" />
        </div>
        <div class="userListCss">
          <tableList ref="userTableInfoRef" style="padding:0; height: 600px;" :queryParams="searchUserInfo" v-bind="bindUserDataInfo"
            @btnBottomClick="btnBottomClick" />
        </div>
      </div>
    </template>
  </SzycDialog>

</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import tableList from "@/components/table/tableAndPage.vue";
import szycSubmitForm from "@/components/element/SubmitForm.vue";
import { getRoleMenuListApi, insertRoleApi, updateRoleApi, deleteRoleApi, updateRoleStatusApi, bindUserToRoleApi, unBindUserToRoleApi } from '@/api/appManage/appRegist'
import { list } from "@/api/appManage/menuLibraryManage";
import configBtn from "@/components/element/Confirm.vue";
import cancelBtn from "@/components/element/Cancel.vue";
import { bindRoleData, searchRoleItems, roleItemsSubmit, roleRules, userItems, bindUserData, userItemsInfo, bindUserDataInfo, treeDataFn } from './index'


const treeDataRef = ref([])
const defaultCheckedKeysList = ref([])
const meunIdKey = ref('')

const propsData = {
  label: 'menuName',
  children: 'children'
}

// 响应式数据
const searchData = reactive({
  roleName: "",
  roleStatus: "",
  getType: '1'
});

const tableRef = ref(null);
const addAndEditRole = ref(false);
const addOrEditFormRef = ref(null)
const titleDialog = ref('')
const treeRef = ref(null)
const defaultCheckedKeys = ref([])
const addOrEditForm = reactive({
  roleName: '',    //  角色名称
  roleNameEn: '',  //  角色名称英文
  roleSort: '',    //  角色排序
  roleStatus: '',  //  角色状态
  roleDesc: '',    //  角色描述
})
const treeData = ref([])
const roleId = ref('')

const bindUserList = ref(false)

const searchUser = reactive({
  queryUserIdentifier: '0',    // 0为绑定的用户  1 查询为未绑定
  roleId: '',  // 	角色id
  nickName: '',   // 用户名
  phonenumber: '',  // 联系电话
  dptCode: '',  // 标准科室
  hdptCode: '',  // 实际科室
  postCode: '',  // 管理职务
})
const userTableRef = ref(null)
const roleIs = ref('')  // 当前角色id

const userTableInfoRef = ref(null)
const bindUserListInfo = ref(false)
const searchUserInfo = reactive({
  queryUserIdentifier: '1',    // 0为绑定的用户  1 查询为未绑定
  roleId: '',  // 	角色id
  nickName: '',   // 用户名
  phonenumber: '',  // 联系电话
  dptCode: '',  // 标准科室
  hdptCode: '',  // 实际科室
  postCode: '',  // 管理职务
})


const tableCellClick = (data) => {
  treeDataRef.value.setCheckedKeys(data?.menuIds, true)
}


// 方法
const getList = (type) => {
  tableRef.value.fetchData().then((res) => {
    if (res && res.length > 0) {
      defaultCheckedKeysList.value = res[0].menuIds || []
    } else {
      defaultCheckedKeysList.value = []
    }
  })
};

// 启用禁用
const switchChange = async (val) => {
  let params = {
    roleId: val.row.roleId,
    roleStatus: val.value,
  };
  let res = await updateRoleStatusApi(params);
  if (res.code == 200) {
    ElMessage.success(val.value == 1 ? "已启用" : "已禁用");
    getList()
  } else {
    getList()
  }
};

// 按钮事件
const btnClick = (item, data) => {
  // console.log('按钮点击', data);
  if (item.text == '新增角色' || item.text == '编辑角色') {
    let flag = item.text == '新增角色' ? true : false
    titleDialog.value = item.text;
    addAndEditRole.value = true;
    roleId.value = flag ? '' : data.roleId;
    defaultCheckedKeys.value = flag ? [] : data.menuIds
    let objData = {}
    for (let key in addOrEditForm) {
      objData[key] = flag ? '' : data[key]
    }
    objData.roleStatus = flag ? '1' : data.roleStatus
    Object.assign(addOrEditForm, objData)
    list({ pageSize: '99999' }).then((res) => {
      treeData.value = res?.rows || []
    })
  } else if (item.text == '绑定用户') {
    for (let key in searchUser) {
      searchUser[key] = ''
    }
    searchUser.roleId = data.roleId
    searchUser.queryUserIdentifier = '0'
    bindUserList.value = true
    nextTick(() => {
      userTableRef.value.fetchData()
    })
  } else if (item.text == '删除') {
    ElMessageBox.confirm(
      "是否删除当前所勾选角色？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }
    )
      .then(() => {
        let arr = data.map((item) => item.roleId)
        deleteRoleApi({ roleIds: arr }).then((res) => {
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
};
// 保存角色权限
const menuItemSave = () => {
  addOrEditFormRef.value.validate((valid) => {
    if (valid) {
      let obj = {
        ...addOrEditForm, menuIds: treeRef.value.getCheckedKeys()
      }
      if (titleDialog.value == '新增角色') {
        insertRoleApi(obj).then((res) => {
          if (res.code == 200) {
            ElMessage.success('新增成功！')
            addAndEditRole.value = false
            getList()
          }
        })
      } else {
        obj.roleId = roleId.value
        updateRoleApi(obj).then((res) => {
          if (res.code == 200) {
            ElMessage.success('编辑成功！')
            addAndEditRole.value = false
            getList()
          }
        })
      }
    } else {
      console.log('表单校验不通过');
    }
  })
}



// 绑定用户按钮事件
const userBtn = (item, data) => {
  if (item.text == '添加用户') {
    for (let key in searchUserInfo) {
      searchUserInfo[key] = ''
    }
    searchUserInfo.roleId = JSON.parse(JSON.stringify(searchUser.roleId))
    searchUserInfo.queryUserIdentifier = '1'
    bindUserListInfo.value = true
    nextTick(() => {
      userTableInfoRef.value.fetchData()
    })
  } else if (item.text == '解绑用户') {
    ElMessageBox.confirm(
      "所选用户一旦解绑角色，可能会影响功能的使用，请谨慎操作！确定还有进行本操作吗？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }
    )
      .then(() => {
        let obj = {
          roleId: searchUser.roleId,
          userIds: data.map((item) => item.userId)
        }
        unBindUserToRoleApi(obj).then((res) => {
          if (res.code === 200) {
            ElMessage.success('解绑成功！')
            userTableRef.value?.fetchData()
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

// 菜单组
const listFn = () => {
  list({ pageSize: '99999' }).then((res) => {
    treeData.value = res?.rows || []
    meunIdKey.value = res.rows[0]?.menuId || []
    getList()
  })
}


// 保存
const btnBottomClick = (item, selectData, row) => {
  // console.log("item：", item);
  // console.log("select", data);
  // console.log("row", row);
  if (item.btnType == 'cancel') {
    bindUserListInfo.value = false
  } else {
    let obj = {
      roleId: searchUserInfo.roleId,
      userIds: selectData.map((item) => item.userId)
    }
    bindUserToRoleApi(obj).then((res) => {
      if (res.code == 200) {
        ElMessage.success('绑定成功！')
        bindUserListInfo.value = false
        nextTick(() => {
          userTableRef.value?.fetchData()
        })
      }
    })
  }

}











onMounted(() => {
  listFn()
});
</script>

<style lang="scss">
.appRoleManageCss {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;

  .searchTable {
    width: calc(100% - 720px);
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;

    .app_form {
      flex-shrink: 0;
      min-height: 50px;
      background: #fff;
    }

    .app_table {
      flex: 1;
      margin-top: 10px;
      background: #fff;
      overflow: auto;
    }
  }

  .appMessage {
    height: 100%;
    margin-left: 10px;
    width: 350px;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  .authority {
    height: 100%;
    margin-left: 10px;
    width: 350px;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  /* 卡片头部 */
  .card-header {
    padding: 12px 15px;
    border-bottom: 1px solid #e4e7ed;
    // background: #f5f7fa;
    flex-shrink: 0;
    box-sizing: border-box;
    font-weight: 600;
  }

  /* 卡片内容 */
  .card-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    box-sizing: border-box;

    .treeDataCss {
      /* display: flex;        注销或删除这行 */
      /* align-items: center;  注销或删除这行 */
      display: block;
      line-height: 30px;
      height: 30px;
      width: 100%;
      cursor: pointer;
      padding: 0 10px;
      box-sizing: border-box;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.addRoleCss {
  width: 100%;
  height: 650px;
  display: flex;

  .addRoleLeft {
    width: calc(60% - 10px);
    height: 100%;
  }

  .addRoleRight {
    margin-left: 20px;
    width: calc(40% - 10px);
    height: 100%;
  }

  .titleRole {
    height: 40px;
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #000;
  }

  .contentRole {
    border: 1px solid #e4e7ed;
    box-sizing: border-box;
    border-radius: 3px;
    width: 100%;
    height: calc(100% - 40px);
    overflow: auto;
  }
}

.bindUserListCss {
  width: 100%;
  height: 700px;
  display: flex;
  flex-direction: column;

  .searchUser {
    flex-shrink: 0;
    background: #fff;
  }

  .userListCss {
    flex: 1;
    margin-top: 10px;
    background: #fff;
  }
}
</style>