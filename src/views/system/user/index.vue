<template>
    <div class="app-container">
        <div class="pane-container">
            <!--部门数据-->
            <div class="pane-aside">
                <div class="head-container">
                    <el-input v-model="deptName" placeholder="请输入部门名称" clearable prefix-icon="Search"
                        style="margin-bottom: 20px" />
                </div>
                <div class="head-container" style="font-size: 16px;">
                    <el-tree :data="deptOptions" :props="{ label: 'label', children: 'children' }"
                        :expand-on-click-node="false" :filter-node-method="filterNode" ref="deptTreeRef" node-key="id"
                        highlight-current default-expand-all @node-click="handleNodeClick" />
                </div>
            </div>

            <!--用户数据-->
            <div class="pane-main">
                <div style="height: 100%;">
                    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px"
                        class="pane-form">
                        <el-form-item label="用户名称" prop="userName">
                            <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable
                                style="width: 200px" @keyup.enter="handleQuery" />
                        </el-form-item>
                        <el-form-item label="手机号码" prop="phonenumber">
                            <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable
                                style="width: 200px" @keyup.enter="handleQuery" />
                        </el-form-item>
                        <el-form-item label="状态" prop="status">
                            <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 200px">
                                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="创建时间" style="width: 308px">
                            <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange"
                                range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
                        </el-form-item>
                        <el-form-item>
                            <szycButton type="primary" icon="Search" @click="handleQuery">搜索</szycButton>
                            <CanCelBtn icon="Refresh" @click="resetQuery">重置</CanCelBtn>
                        </el-form-item>
                    </el-form>

                    <div class="pane-table">
                        <tableList ref="tableRef" :queryParams="queryParams" v-bind="bindData" @btnClick="btnClick"
                            @statusClick="handleStatusChange" @selectionChange="handleSelectionChange">
                            <template #operate="{ row }">
                                <div style="display: flex; justify-content: space-between">
                                    <!-- <div class="userIndex-operate-btn" @click="handleUpdate(row)">
                                        编辑
                                    </div>
                                    <div class="userIndex-operate-btn" @click="handleDelete(row)">删除</div> -->
                                    <div class="userIndex-operate-btn" @click="handleResetPwd(row)">
                                        重置密码
                                    </div>
                                    <div class="userIndex-operate-btn" @click="handleAuthRole(row)">
                                        分配角色
                                    </div>
                                </div>
                            </template>
                        </tableList>
                    </div>
                </div>
            </div>
        </div>
        <SzycDialog :dialogVisible="open" :close-on-click-modal="false" destroy-on-close :title="title" width="40%"
            @close="cancel">
            <template #uname>
                <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="用户昵称" prop="nickName">
                                <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="归属部门" prop="deptId">
                                <el-tree-select v-model="form.deptId" :data="enabledDeptOptions"
                                    :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id"
                                    placeholder="请选择归属部门" check-strictly />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="手机号码" prop="phonenumber">
                                <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="邮箱" prop="email">
                                <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
                                <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
                                <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20"
                                    show-password />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="用户性别">
                                <el-select v-model="form.sex" placeholder="请选择">
                                    <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label"
                                        :value="dict.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="状态">
                                <el-radio-group v-model="form.status">
                                    <el-radio v-for="dict in sys_normal_disable" :key="dict.value"
                                        :value="dict.value">{{
                                            dict.label
                                        }}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="岗位">
                                <el-select v-model="form.postIds" multiple placeholder="请选择">
                                    <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName"
                                        :value="item.postId" :disabled="item.status == 1"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="角色">
                                <el-select v-model="form.roleIds" multiple placeholder="请选择">
                                    <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName"
                                        :value="item.roleId" :disabled="item.status == 1"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item label="备注">
                                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <div class="dialog-horizontal-line">
                </div>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </SzycDialog>

        <SzycDialog :dialogVisible="upload.open" :close-on-click-modal="false" destroy-on-close :title="upload.title"
            width="40%" @close="upload.open = false">
            <template #uname>
                <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
                    :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
                    :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <template #tip>
                        <div class="el-upload__tip text-center">
                            <div class="el-upload__tip" style="font-size: 14px;">
                                <el-checkbox style="margin-right: 10px;" v-model="upload.updateSupport" />是否更新已经存在的用户数据
                            </div>
                            <span style="font-size: 14px;">仅允许导入xls、xlsx格式文件。</span>
                            <el-link type="primary" :underline="false" style="font-size: 14px; vertical-align: baseline"
                                @click="importTemplate">下载模板</el-link>
                        </div>
                    </template>
                </el-upload>
                <div class="dialog-horizontal-line">
                </div>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitFileForm">确 定</el-button>
                    <el-button @click="upload.open = false">取 消</el-button>
                </div>
            </template>
        </SzycDialog>
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, watch, getCurrentInstance, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user"
import { yesOrNoFns } from "@/types/dict/index";
import SubmitForm from "@/components/element/SubmitForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import tableList from "@/components/table/tableAndPage.vue";
import {
    downloadTemplateApi,
} from "@/api/tool"

const router = useRouter()
const queryRef = ref(null)
const userRef = ref(null)
const deptTreeRef = ref(null)
const uploadRef = ref(null)

const sys_user_sex = [
    {
        label: "男",
        value: "0"
    },
    {
        label: "女",
        value: "1"
    },
    {
        label: "未知",
        value: "2"
    }
]

const sys_normal_disable = [
    {
        label: "启用",
        value: "0"
    },
    {
        label: "停用",
        value: "1"
    }
]

const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const deptName = ref("")
const deptOptions = ref(undefined)
const enabledDeptOptions = ref(undefined)
const initPassword = ref(undefined)
const postOptions = ref([])
const roleOptions = ref([])
const tableRef = ref(null)
/*** 用户导入参数 */
const upload = reactive({
    // 是否显示弹出层（用户导入）
    open: false,
    // 弹出层标题（用户导入）
    title: "",
    // 是否禁用上传
    isUploading: false,
    // 是否更新已经存在的用户数据
    updateSupport: 0,
    // 设置上传的请求头部
    headers: { Authorization: "Bearer " + sessionStorage.getItem("token") },
    // 上传的地址
    url: "/api/data-ops/system/user/importData"
})

// 列显隐信息
const columns = ref([
    { key: 0, label: `用户编号`, visible: true },
    { key: 1, label: `用户名称`, visible: true },
    { key: 2, label: `用户昵称`, visible: true },
    { key: 3, label: `部门`, visible: true },
    { key: 4, label: `手机号码`, visible: true },
    { key: 5, label: `状态`, visible: true },
    { key: 6, label: `创建时间`, visible: true }
])

const bindData = reactive({
    pageOpen: "1", //  是否需要分页
    checkBox: "1", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "userId",
    btnList: [
        { btnType: "add" }, //  新增
        { btnType: "edit" }, //  编辑
        { btnType: "delete" }, //  删除
        // { btnType: "export" }, //  导出
        { text: "导出", btnType: "edit", icon: "Download" },
        { btnType: "import" }, //  导入
    ], // 表格按钮
    apiUrl: userList,
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "用户编号",
            columnName: "userId",
            // columnWidth: "160",
            showOverflowTooltip: true,
        },
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
            columnLabel: "部门",
            columnName: "deptName",
            showOverflowTooltip: true
        },
        {
            columnLabel: "手机号码",
            columnName: "phonenumber",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "状态",
            columnName: "status",
            align: "center",
            kyf: 1,
            columnWidth: "100",
            attrs: { "active-value": "0", "inactive-value": "1" },
        },
        {
            columnLabel: "创建时间",
            columnName: "createTime",
            align: "center",
            columnWidth: "180",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "操作",
            columnName: "operate",
            align: "center",
            columnWidth: "160",
            showOverflowTooltip: true,
            hasSlot: true,
        },
    ],
});

//  表格按钮点击事件
const btnClick = (item, row) => {
    if (item.text == "新增") {
        handleAdd()
    } else if (item.text == "编辑") {
        handleUpdate(row)
    } else if (item.text == "删除") {
        handleDelete(row)
    } else if (item.text == "导入") {
        handleImport()
    } else if (item.text == "导出") {
        handleExport()
    }
};

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 9999,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined
    },
    rules: {
        userName: [{ required: true, message: "用户名称不能为空", trigger: "blur" }, { min: 2, max: 20, message: "用户名称长度必须介于 2 和 20 之间", trigger: "blur" }],
        nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
        password: [{ required: true, message: "用户密码不能为空", trigger: "blur" }, { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" }, { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }],
        email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
        phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
    }
})

const { queryParams, form, rules } = toRefs(data)

/** 日期格式化函数 */
const parseTime = (time, pattern) => {
    if (arguments.length === 0 || !time) {
        return null
    }
    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time)
        } else if (typeof time === 'string') {
            time = time.replace(new RegExp(/-/gm), '/').replace('T', ' ').replace(new RegExp(/\.[\d]{3}/gm), '');
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000
        }
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        // Note: getDay() returns 0 on Sunday
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return time_str
}

/** 表单重置 */
const resetForm = (formEl) => {
    if (formEl && formEl.value) {
        formEl.value.resetFields();
    }
}

/** 添加日期范围 */
const addDateRange = (params, dateRange, propName) => {
    let search = params;
    search.params = typeof (search.params) === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};
    dateRange = Array.isArray(dateRange) ? dateRange : [];
    if (typeof (propName) === 'undefined') {
        search.params['beginTime'] = dateRange[0];
        search.params['endTime'] = dateRange[1];
    } else {
        search.params['begin' + propName] = dateRange[0];
        search.params['end' + propName] = dateRange[1];
    }
    return search;
}

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
    if (!value) return true
    return data.label.indexOf(value) !== -1
}

/** 根据名称筛选部门树 */
watch(deptName, val => {
    deptTreeRef.value.filter(val)
})

/** 查询用户列表 */
const getList = () => {
    loading.value = true
    let params = addDateRange(queryParams.value, dateRange.value)
    listUser(params).then(res => {
        loading.value = false
        userList.value = res.rows.map(item => ({
            ...item,
            deptName: item.dept?.deptName
        }))
        total.value = res.total
        nextTick(() => {
            console.log(3333, userList.value);
            tableRef.value?.fetchData();
            // const addedKeys = new Set(); // 用于跟踪已添加的键
            // Object.keys(params).forEach(key => {
            //     // 避免重复添加相同的键
            //     if (addedKeys.has(key)) return;
            //     addedKeys.add(key);

            //     const value = params[key];
            //     if (value !== undefined) {
            //         // 处理对象类型的值，将其转换为 JSON 字符串
            //         if (typeof value === 'object' && value !== null && !(value instanceof File)) {
            //             formData.append(key, JSON.stringify(value));
            //         } else {
            //             formData.append(key, value);
            //         }
            //     }
            // })
        });
    })
}

/** 查询部门下拉树结构 */
const getDeptTree = () => {
    deptTreeSelect().then(response => {
        deptOptions.value = response.data
        enabledDeptOptions.value = filterDisabledDept(JSON.parse(JSON.stringify(response.data)))
    })
}

/** 过滤禁用的部门 */
const filterDisabledDept = (deptList) => {
    return deptList.filter(dept => {
        if (dept.disabled) {
            return false
        }
        if (dept.children && dept.children.length) {
            dept.children = filterDisabledDept(dept.children)
        }
        return true
    })
}

/** 节点单击事件 */
const handleNodeClick = (data) => {
    queryParams.value.deptId = data.id
    handleQuery()
}

/** 搜索按钮操作 */
const handleQuery = () => {
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
    dateRange.value = []
    resetForm(queryRef)
    queryParams.value.deptId = undefined
    deptTreeRef.value.setCurrentKey(null)
    handleQuery()
}

/** 删除按钮操作 */
const handleDelete = (row) => {
    const userIds = row.userId || ids.value
    ElMessageBox.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return delUser(userIds)
    }).then(() => {
        getList()
        ElMessage.success("删除成功")
    }).catch(() => { })
}

const handleExport = () => {
    downloadTemplateApi(addDateRange(queryParams.value, dateRange.value), 'system/user/export', { name: `用户信息` })
}

/** 用户状态修改  */
const handleStatusChange = ({ row, column, value }) => {
    let text = row.status === "0" ? "启用" : "停用"
    ElMessageBox.confirm('确认要"' + text + '""' + row.userName + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        return changeUserStatus(row.userId, row.status)
    }).then(() => {
        ElMessage.success(text + "成功")
    }).catch(function () {
        row.status = row.status === "0" ? "1" : "0"
    })
}


/** 跳转角色分配 */
const handleAuthRole = (row) => {
    const userId = row.userId
    router.push({ path: "/system/user-auth", query: { userId: userId } });
}

/** 重置密码按钮操作 */
const handleResetPwd = (row) => {
    ElMessageBox.prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
        inputValidator: (value) => {
            if (/<|>|"|'|\||\\/.test(value)) {
                return "不能包含非法字符：< > \" ' \\\ |"
            }
        },
        customClass: 'auto-height-message-box'
    }).then(({ value }) => {
        resetUserPwd(row.userId, value).then(response => {
            ElMessage.success("修改成功，新密码是：" + value)
        })
    }).catch(() => { })
}

/** 选择条数  */
const handleSelectionChange = (selection) => {
    ids.value = selection.map(item => item.userId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 导入按钮操作 */
const handleImport = () => {
    upload.title = "用户导入"
    upload.open = true
}

/** 下载模板操作 */
const importTemplate = () => {
    downloadTemplateApi({}, '/schema-manager/datasource/downTemplate', { name: `用户导入模板` })
}

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
    upload.isUploading = true
}

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
    upload.open = false
    upload.isUploading = false
    uploadRef.value.handleRemove(file)
    ElMessageBox.alert("<div>" + response.msg + "</div>", "导入结果", {
        dangerouslyUseHTMLString: true,
        customStyle: {
            height: '240px'
        }
    })
    getList()
}

/** 提交上传文件 */
const submitFileForm = () => {
    uploadRef.value.submit()
}

/** 重置操作表单 */
const reset = () => {
    form.value = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: []
    }
    resetForm(userRef)
}

/** 取消按钮 */
const cancel = () => {
    open.value = false
    reset()
}

/** 新增按钮操作 */
const handleAdd = () => {
    reset()
    getUser().then(response => {
        postOptions.value = response.posts
        roleOptions.value = response.roles
        open.value = true
        title.value = "添加用户"
        form.value.password = initPassword.value
    })
}

/** 修改按钮操作 */
const handleUpdate = (row) => {
    reset()
    const userId = row.userId || ids.value
    getUser(userId).then(response => {
        form.value = response.data
        postOptions.value = response.posts
        roleOptions.value = response.roles
        form.value.postIds = response.postIds
        form.value.roleIds = response.roleIds
        open.value = true
        title.value = "修改用户"
        form.password = ""
    })
}

/** 提交按钮 */
const submitForm = () => {
    userRef.value.validate(valid => {
        if (valid) {
            if (form.value.userId != undefined) {
                updateUser(form.value).then(response => {
                    ElMessage.success("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addUser(form.value).then(response => {
                    ElMessage.success("新增成功")
                    open.value = false
                    getList()
                })
            }
        }
    })
}

getDeptTree()
getList()
</script>

<style scoped lang="scss">
.app-container {
    height: 100%;
    width: 100%;
}

.pane-container {
    display: flex;
    height: 100%;
    justify-content: space-between;
}

.pane-aside {
    padding: 10px;
    border-radius: 4px;
    flex: 1;
    width: 20%;
    background-color: #fff;

    :deep(.el-tree-node__content) {
        font-size: 16px;
    }
}

.pane-main {
    height: 100%;
    flex: 5;
    width: 80%;
    margin-left: 10px;

    .pane-form {
        background-color: #fff;
        border-radius: 4px;
    }

    .pane-table {
        margin-top: 10px;
        height: calc(100% - 70px);
    }
}

.userIndex-operate-btn {
    color: rgba(0, 115, 237, 1);
    cursor: pointer;
    text-decoration: underline;
}

.dialog-horizontal-line {
    width: calc(100% + 40px);
    height: 1px;
    margin: 20px 0 20px -20px;
    background-color: rgba(201, 201, 201, 1) !important;
}

.dialog-footer {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>