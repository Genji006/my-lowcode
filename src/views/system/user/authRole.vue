<template>
   <div class="app-container">
      <div class="base_form">
         <span class="form-header">基本信息</span>
         <el-form :model="form" label-width="80px">
            <el-row>
               <el-col :span="8" :offset="2">
                  <el-form-item label="用户昵称" prop="nickName">
                     <el-input v-model="form.nickName" disabled />
                  </el-form-item>
               </el-col>
               <el-col :span="8" :offset="2">
                  <el-form-item label="登录账号" prop="userName">
                     <el-input v-model="form.userName" disabled />
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
      </div>
      <span class="form-header">角色信息</span>
      <!-- <el-table v-loading="loading" :row-key="getRowKey" @row-click="clickRow" ref="roleRef"
         @selection-change="handleSelectionChange" :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)">
         <el-table-column label="序号" width="55" type="index" align="center">
            <template #default="scope">
               <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
</el-table-column>
<el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
<el-table-column label="角色编号" align="center" prop="roleId" />
<el-table-column label="角色名称" align="center" prop="roleName" />
<el-table-column label="权限字符" align="center" prop="roleKey" />
<el-table-column label="创建时间" align="center" prop="createTime" width="180">
</el-table-column>
</el-table>

<pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" /> -->
      <tableList ref="roleRef" v-bind="bindData" @selectionChange="handleSelectionChange" style="height: 600px;"
         :selectSettings="{ key: 'flag', label: true }">
      </tableList>

      <el-form label-width="100px">
         <div style="display: flex; width: 100%; justify-content: center; margin-top: 10px;">
            <szycButton type="primary" @click="submitForm()">提交</szycButton>
            <CanCelBtn @click="close()">返回</CanCelBtn>
         </div>
      </el-form>
   </div>
</template>

<script setup name="AuthRole">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAuthRole, updateAuthRole } from "@/api/system/user"
import tableList from "@/components/table/tableAndPage.vue";
import szycButton from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";

// 获取路由和路由器实例
const route = useRoute()
const router = useRouter()

// 表格引用
const roleRef = ref(null)

// 数据定义
const loading = ref(true)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const roleIds = ref([])
const roles = ref([])
const form = ref({
   nickName: undefined,
   userName: undefined,
   userId: undefined
})

const bindData = reactive({
   pageOpen: "1", //  是否需要分页
   checkBox: "1", //  是否需要复选框
   light: "0", //  是否需要高亮
   primaryKey: "roleId",
   apiUrl: roles,
   showBorder: true, //  是否需要边框
   designTableColumns: [
      {
         columnLabel: "角色编号",
         columnName: "roleId",
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
         showOverflowTooltip: true,
      },
      {
         columnLabel: "创建时间",
         columnName: "createTime",
         align: "center",
         showOverflowTooltip: true,
      },
   ],
});


/**
 * 多选框选中数据
 */
function handleSelectionChange(selection) {
   roleIds.value = selection.map(item => item.roleId)
}

/**
 * 关闭按钮
 */
function close() {
   router.push("/user")
}

/**
 * 提交按钮
 */
function submitForm() {
   const userId = form.value.userId
   const rIds = roleIds.value.join(",")
   updateAuthRole({ userId: userId, roleIds: rIds }).then(response => {
      ElMessage.success("授权成功")
      close()
   })
}

// 初始化
onMounted(async () => {
   const userId = route.query.userId
   if (userId) {
      loading.value = true
      try {
         const response = await getAuthRole(userId)
         form.value = response.user
         roles.value = response.roles
         total.value = roles.value.length
         nextTick(() => {
            roleRef.value.fetchData();
         })
      } finally {
         loading.value = false
      }
   }
})
</script>
<style scoped lang="less">
.app-container {
   height: 95%;
   background-color: #fff;
   padding: 20px;
   border-radius: 4px;

   .form-header {
      font-size: 18px;
      margin-bottom: 5px;
   }
   :deep(.cardShadow) {
      box-shadow: none!important;
   }
}
</style>