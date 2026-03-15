<template>
    <div class="announcement-class">
        <div class="announcement_header">
            <SzycFormSearch v-model="searchData" :items="searchItems" labelWidth="" @searchVal="getList()"
                @reset="getList('重置')" :inline="true" />
        </div>
        <div class="announcement_table">
            <tableList ref="tableRef" :queryParams="searchData" v-bind="bindData" :defaultExpandAll="defaultExpandAll"
                @btnClick="btnClick">
                <template #status="{ row }">
                    <div :class="changeStatusClass(row.status)" class="status_Box">{{ noticeStatusFn(row.status,
                        'formatter') }}</div>
                </template>
                <template #noticeContent="{ row }">
                    <div v-html="row.noticeContent"></div>
                </template>
                <template #readStatus="{ row }">
                    <div style="color: rgb(25, 128, 255);text-align: center;" v-if="row.readStatus.total_send_count">{{
                        row.readStatus.confirmed_count + '/' +
                        row.readStatus.total_send_count }}</div>
                    <div v-else style="color: rgb(25, 128, 255);text-align: center;">-
                    </div>
                </template>
            </tableList>
        </div>
    </div>
    <!-- 新增修改公告弹窗 -->
    <SzycDialog v-model="addDialogVisible" width="70%" :title="dialogTitle" @close="closeDialog" :alignCenter="true">
        <template #uname>
            <span class="sub_title">基本信息</span>
            <el-form :model="addOrEditForm" :rules="addOrEditRules" ref="addOrEditFormRef" :inline="true"
                labelWidth="110px" class="announcement_form">
                <el-form-item label="升级应用：" prop="targetSystems">
                    <el-select v-model="addOrEditForm.targetSystems" placeholder="请选择升级应用" clearable filterable
                        :disabled="!editAble">
                        <el-option v-for="item in appList" :key="item.uuid" :label="item.cpmc" :value="item.uuid" />
                    </el-select>
                </el-form-item>
                <el-form-item label="升级版本：" prop="version">
                    <el-input v-model="addOrEditForm.version" placeholder="请输入升级版本" clearable :disabled="!editAble" />
                </el-form-item>
                <el-form-item label="升级时间：" prop="effectiveStartTime">
                    <el-date-picker v-model="addOrEditForm.effectiveStartTime" type="datetime" placeholder="请选择升级时间"
                        format="YYYY/MM/DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" clearable :disabled="!editAble"
                        :disabled-date="disabledDate" :disabled-hours="disabledHours"
                        :disabled-minutes="disabledMinutes" :disabled-seconds="disabledSeconds" />
                </el-form-item>
                <el-form-item label="升级包：" prop="updatePackage">
                    <div class="upload-flex-container">
                        <el-upload v-model="fileList" action="/api/data-ops/upload" :headers="headers" multiple
                            :show-file-list="false" :before-upload="beforeUpload" :on-success="handleUploadSuccess"
                            class="upload-trigger-class" :disabled="!editAble">
                            <el-icon class="uploader-icon" v-if="editAble">
                                <UploadFilled />
                            </el-icon>
                        </el-upload>

                        <div class="custom-file-list">
                            <div v-for="(file, index) in fileList" :key="file.uid" class="file-item">
                                <span class="file-name">{{ file.name }}</span>
                                <el-icon class="file-remove" @click="handleRemove(index)" v-if="editAble">
                                    <Delete />
                                </el-icon>
                                <el-icon class="file-download" @click="download(index)" v-else>
                                    <Download />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                    <div class="upload-tips" v-if="editAble">支持格式：ZIP、RAR、7Z、TAR、GZ、TAR.GZ，文件大小不超过300MB</div>
                </el-form-item>
                <br />
                <span class="sub_title">公告内容</span>
                <br />
                <el-form-item label="升级内容：" prop="noticeContent" style="width: 100%; display: block;">
                    <Editor v-model="addOrEditForm.noticeContent" :editorConfig="editorConfig"
                        :toolbarConfig="toolbarConfig" mode="default" @onCreated="handleCreated" :disabled="!editAble"
                        v-if="addDialogVisible" />
                </el-form-item>
            </el-form>

            <div style="display: flex; justify-content: center; margin-top: 20px;" v-if="editAble">
                <CanCelBtn @click="closeDialog"> 取消 </CanCelBtn>
                <buttonDiv @click="addMGSubmit('0')"> 保存 </buttonDiv>
                <buttonDiv @click="addMGSubmit('1')"> 保存并发布 </buttonDiv>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { onMounted, reactive, ref, computed, nextTick, onBeforeUnmount, shallowRef } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycSubmitForm from "@/components/element/SubmitForm.vue";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { noticeStatusFn } from "@/types/dict/index";
import tableList from "@/components/table/tableAndPage.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { UploadFilled, Delete, Download } from '@element-plus/icons-vue';
import { useRouter } from "vue-router";
import Editor from "./editer.vue";
import { insertNotice, updateNotice, deleteNotice } from "@/api/system/announcement";
import {
    listIdxCpxxb
} from "@/api/appManage/appRegist";

import axios from "axios";

const router = useRouter();

const headers = ref({
    Authorization: sessionStorage.getItem("token"),
});

const fileList = ref([]);

//  查询值
const searchData = reactive({
    version: '',
    targetSystems: '',
    createBy: '',
    beginTime: '',
    endTime: '',
});

const appList = ref([]);

const changeStatusClass = (status) => {
    switch (status) {
        case '0':
            return 'status-draft';
        case '1':
            return 'status-published';
        case '2':
            return 'status-revoked';
        case '3':
            return 'status-expired';
        case '4':
            return 'status-pending';
        default:
            return 'status-unknown';
    }
}


//  查询表单
const searchItems = computed(() => [
    {
        label: "升级应用：",
        prop: "targetSystems",
        component: "el-select",
        options: appList.value,
        style: { width: "220px" },
        attrs: { placeholder: "请选择", clearable: true, filterable: true },
        optionValue: "uuid",
        optionLabel: "cpmc",
    },
    {
        label: "升级版本：",
        prop: "version",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "发布时间：",
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
    {
        label: "发布人：",
        prop: "createBy",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
]);

const tableRef = ref(null); //  表格
const tableData = ref([]);
const defaultExpandAll = ref(false); //  是否默认展开
const bindData = reactive({
    pageOpen: "1", //  是否需要分页
    checkBox: "1", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "noticeId",
    method: "post",
    btnList: [
        { btnType: "add", text: "新增公告" }, //  新增
        { btnType: "edit", text: "编辑公告" }, //  编辑
        { btnType: "view", text: "详情", icon: "View", typeRow: "rowType" }, //  详情
        { btnType: "delete" },
    ], // 表格按钮
    apiUrl: "/system/upgradeNotice/list", //  接口地址
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "升级应用",
            columnName: "targetSystems",
            showOverflowTooltip: true,
            formatter: (row) => {
                let app = appList.value.find(item => item.uuid == row.targetSystems);
                return app ? app.cpmc : '';
            }
        },
        {
            columnLabel: "升级版本",
            columnName: "version",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "升级时间",
            columnName: "effectiveStartTime",
            columnWidth: "200",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "升级内容",
            columnName: "noticeContent",
            columnWidth: "500",
            showOverflowTooltip: true,
            hasSlot: true,
        },
        {
            columnLabel: "公告发布时间",
            columnName: "createTime",
            columnWidth: "200",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "发布人",
            columnName: "createBy",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "公告状态",
            columnName: "status",
            columnWidth: "100",
            showOverflowTooltip: true,
            hasSlot: true,
        },
        {
            columnLabel: "阅读状态",
            columnName: "readStatus",
            columnWidth: "100",
            showOverflowTooltip: true,
            hasSlot: true,
            // formatter: (row) => {
            //     return row.readStatus.confirmed_count + '/' + row.readStatus.total_send_count;
            // }
        },
    ],
});

const addDialogVisible = ref(false);
const dialogTitle = ref("新增系统升级公告");
const addOrEditFormRef = ref(null);
const editAble = ref(true);
const addOrEditForm = ref({
    noticeContent: '',
    updateUrl: '',
    targetSystems: '',
    version: '',
    effectiveStartTime: '',
});

const validateFile = (rule, value, callback) => {
    if (fileList.value.length == 0) {
        callback(new Error("请上传升级包"));
    } else {
        callback();
    }
}

// 自定义富文本校验器
const validateContent = (rule, value, callback) => {
    // 1. 处理完全为空的情况
    if (!value) {
        return callback(new Error("请输入公告内容"));
    }

    // 2. 处理 WangEditor 的默认空状态 '<p><br></p>'
    if (value === '<p><br></p>') {
        return callback(new Error("请输入公告内容"));
    }

    // 3. 去除所有 HTML 标签后，如果全是空格也报错
    // 但要注意：如果用户只上传了图片（<img ...>），去除标签后也是空，所以要判断是否有图片
    const text = value.replace(/<[^>]+>/g, "").trim(); // 去掉 HTML 标签取纯文本
    const hasImage = value.includes('<img'); // 判断是否包含图片
    const hasVideo = value.includes('<video'); // 判断是否包含视频

    if (!text && !hasImage && !hasVideo) {
        return callback(new Error("公告内容不能为空"));
    }

    // 校验通过
    callback();
};

//校验
let addOrEditRules = reactive({
    targetSystems: [
        { required: true, message: "请选择升级应用", trigger: ["blur", "change"] },
    ],
    version: [
        { required: true, message: "请输入升级版本", trigger: ["blur"] },
    ],
    effectiveStartTime: [
        { required: true, message: "请选择升级时间", trigger: ["blur"] },
    ],
    noticeContent: [
        { required: true, validator: validateContent, trigger: "change" },
    ],
    updatePackage: [
        { required: true, validator: validateFile, message: "请上传升级包", trigger: ["blur", "change"] },
    ],
});


const makeRange = (start, end) => {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
};

// 1. 禁用过去的日期（天）
const disabledDate = (time) => {
    const today = new Date().setHours(0, 0, 0, 0);
    return time.getTime() < today;
};

// 获取当前面板选中的日期
const getTargetDate = (comparingDate) => {
    if (comparingDate) {
        return comparingDate.toDate();
    }
    return addOrEditForm.effectiveStartTime
        ? new Date(addOrEditForm.effectiveStartTime)
        : new Date();
};

// 2. 禁用小时
const disabledHours = (role, comparingDate) => {
    const targetDate = getTargetDate(comparingDate);
    const now = new Date();
    if (targetDate.toDateString() === now.toDateString()) {
        return makeRange(0, now.getHours() - 1);
    }
    return [];
};

// 3. 禁用分钟
const disabledMinutes = (hour, role, comparingDate) => {
    const targetDate = getTargetDate(comparingDate);
    const now = new Date();

    if (targetDate.toDateString() === now.toDateString()) {
        if (hour === now.getHours()) {
            return makeRange(0, now.getMinutes() - 1);
        }
    }
    return [];
};

// 4. 禁用秒
const disabledSeconds = (hour, minute, role, comparingDate) => {
    const targetDate = getTargetDate(comparingDate);
    const now = new Date();

    if (targetDate.toDateString() === now.toDateString()) {
        if (hour === now.getHours() && minute === now.getMinutes()) {
            return makeRange(0, now.getSeconds() - 1);
        }
    }
    return [];
};

const btnClick = async (item, row) => {
    if (item.text == "新增公告") {
        dialogTitle.value = "新增系统升级公告";
        fileList.value = [];
        let keysData = Object.keys(addOrEditForm.value);
        addDialogVisible.value = true;
        nextTick(() => {
            addOrEditFormRef.value.clearValidate();
        });
    } else if (item.text == "编辑公告") {
        dialogTitle.value = "编辑系统升级公告";
        let keysData = Object.keys(addOrEditForm.value);
        keysData.forEach((item) => {
            addOrEditForm.value[item] = row?.[item] || '';
        });
        addOrEditForm.value.noticeId = row.noticeId;
        if (row.updateUrl) {
            try {
                fileList.value = JSON.parse(row.updateUrl);
            } catch (e) {
                console.error("文件列表解析失败", e);
                fileList.value = [];
            }
        } else {
            fileList.value = [];
        }
        addDialogVisible.value = true;
    } else if (item.text == "删除") {
        ElMessageBox.confirm("确认删除吗?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        })
            .then(() => {
                let noticeIds = row.map((item) => item.noticeId);
                deleteNotice({ noticeIds: noticeIds }).then((res) => {
                    if (res.code == 200) {
                        ElMessage({
                            type: "success",
                            message: "删除成功!",
                        });
                        getList();
                    }
                });
            })
            .catch(() => {
                ElMessage({
                    type: "info",
                    message: "已取消",
                });
            });
    } else if (item.text == "详情") {
        dialogTitle.value = "系统升级公告详情";
        let keysData = Object.keys(addOrEditForm.value);
        keysData.forEach((item) => {
            addOrEditForm.value[item] = row?.[item] || '';
        });
        addOrEditForm.value.noticeId = row.noticeId;
        if (row.updateUrl) {
            try {
                fileList.value = JSON.parse(row.updateUrl);
            } catch (e) {
                fileList.value = [];
            }
        } else {
            fileList.value = [];
        }
        addDialogVisible.value = true;
        editAble.value = false;
    }
};

const handleEdit = (row) => {
    dialogTitle.value = "编辑系统升级公告";
    addDialogVisible.value = true;
};

const closeDialog = () => {
    addDialogVisible.value = false;
    editAble.value = true;
    fileList.value = [];
    addOrEditFormRef.value.resetFields();
    addOrEditForm.value = {
        noticeContent: '',
        updateUrl: '',
        targetSystems: '',
        version: '',
        effectiveStartTime: '',
    }
}

const addMGSubmit = async (type) => {
    addOrEditFormRef.value.validate((valid) => {
        if (valid) {
            addOrEditForm.value.updateUrl = JSON.stringify(fileList.value);
            if (dialogTitle.value == "新增系统升级公告") {
                insertNotice({ ...addOrEditForm.value, status: type }).then((res) => {
                    if (res.code == 200) {
                        if (type == "0") {
                            ElMessage({
                                type: "success",
                                message: "保存成功!",
                            });
                        } else if (type == "1") {
                            ElMessage({
                                type: "success",
                                message: "保存并发布成功!",
                            });
                        }
                        getList();
                        closeDialog();
                    }
                });
            } else {
                updateNotice({ ...addOrEditForm.value, status: type }).then((res) => {
                    if (res.code == 200) {
                        if (type == "0") {
                            ElMessage({
                                type: "success",
                                message: "保存成功!",
                            });
                        } else if (type == "1") {
                            ElMessage({
                                type: "success",
                                message: "保存并发布成功!",
                            });
                        }
                        getList();
                        closeDialog();
                    }
                });
            }
        }
    });
};

const getList = async (type) => {
    if (type == "重置") {
        searchData.version = '';
        searchData.targetSystems = '';
        searchData.createBy = '';
        searchData.beginTime = '';
        searchData.endTime = '';
        tableRef.value.fetchData("重置");
    } else {
        searchData.beginTime = searchData.dateRange ? searchData.dateRange[0] : '';
        searchData.endTime = searchData.dateRange ? searchData.dateRange[1] : '';
        tableRef.value.fetchData();
    }
};

const beforeUpload = (file) => {
    const allowedExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.tar.gz'];
    const fileName = file.name.toLowerCase();
    const isAllowedExt = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowedExt) {
        ElMessage.error(`只能上传压缩包文件！支持的格式: ${allowedExtensions.join(', ')}`);
        return false;
    }

    const maxSize = 300 * 1024 * 1024; // 300MB in bytes
    if (file.size > maxSize) {
        ElMessage.error('上传的文件大小不能超过300MB！');
        return false;
    }

    return true;
};

const handleUploadSuccess = (res) => {
    if (res.code == 200) {
        ElMessage({
            type: "success",
            message: "上传成功!",
        });
        fileList.value.push({
            name: res.fileName,
            url: res.url,
        })
        nextTick(() => {
            if (addOrEditFormRef.value) {
                addOrEditFormRef.value.clearValidate('updatePackage');
            }
        });
    }
};
const handleRemove = (index) => {
    fileList.value.splice(index, 1);
    nextTick(() => {
        if (addOrEditFormRef.value) {
            addOrEditFormRef.value.validateField('updatePackage');
        }
    });
};

const download = (index) => {
    console.log('预览文件:', fileList.value[index]);
    downloadFile(fileList.value[index].url, fileList.value[index].name);
}

const downloadFile = (url, fileName) => {
    axios({
        method: 'get',
        url: url,
        responseType: 'blob',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("token") || ""
                }`
        }
    }).then(res => {
        if (!res || !res.data) return;

        // 创建下载链接
        const blob = new Blob([res.data]);
        const downloadElement = document.createElement('a');
        const href = window.URL.createObjectURL(blob);

        downloadElement.href = href;
        downloadElement.download = fileName; // 下载后的文件名

        document.body.appendChild(downloadElement);
        downloadElement.click();

        document.body.removeChild(downloadElement);
        window.URL.revokeObjectURL(href);
    }).catch(err => {
        console.error(err);
        ElMessage.error('文件下载失败');
    })
}

// 富文本编辑器
const editorRef = shallowRef()
const toolbarConfig = {
    excludeKeys: [
        'emotion',       // 排除：表情
        'insertLink',    // 排除：插入链接
        'group-image',   // 排除：图片组（包含上传图片、网络图片）
        'group-video',   // 排除：视频组（包含上传视频、网络视频）
        'fullScreen',    // 排除：全屏
    ]
}
const editorConfig = {
    placeholder: '',
    MENU_CONF: {
    }
}
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

// 编辑器回调函数
const handleCreated = (editor) => {
    editorRef.value = editor
}

const getAppList = async () => {
    let res = await listIdxCpxxb({
        pageNum: 1,
        pageSize: 999,
    })
    if (res.code == 200) {
        appList.value = res.rows;
    }
}

onMounted(async () => {
    await getAppList();
    getList();
});
</script>

<style lang="less" scoped>
.announcement-class {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px 0;

    .announcement_header {
        background-color: rgba(253, 253, 251);
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    .announcement_table {
        min-height: 0;
        flex: 1;

        .status_Box {
            height: 32px;
            line-height: 32px;
            padding: 0 10px;
            border-radius: 4px;
            text-align: center;
        }

        .status-draft {
            background-color: rgb(242, 242, 243);
            color: rgb(133, 136, 142);
            border: 1px solid rgb(133, 136, 142);
        }

        .status-published {
            color: rgb(122, 199, 86);
            background: rgb(238, 248, 232);
            border: 1px solid rgb(122, 199, 86);
        }

        .status-revoked {
            color: rgb(255, 102, 102);
            background-color: rgb(255, 242, 242);
            border: 1px solid rgb(255, 102, 102);
        }

        .status-expired {
            color: rgb(255, 165, 0);
            background-color: rgb(255, 242, 242);
            border: 1px solid rgb(255, 165, 0);
        }

        .status-pending {
            color: rgb(226, 152, 54);
            background-color: rgb(253, 245, 233);
            border: 1px solid rgb(226, 152, 54);
        }

        .status-unknown {
            color: rgb(133, 136, 142);
            background-color: rgb(242, 242, 243);
            border: 1px solid rgb(133, 136, 142);
        }
    }
}

.sub_title {
    color: rgba(25, 128, 255, 1);
    font-weight: 700;
    font-size: 16px;
}

.announcement_form {
    :deep(.el-form-item) {
        margin: 8px 15px !important;
    }

    :deep(.el-form-item__label) {
        font-size: 16px !important;
    }

    :deep(.el-input__wrapper) {
        width: 265px;
    }

    :deep(.el-select__wrapper) {
        width: 265px;
    }
}

.menuIndex-operate-btn {
    color: rgba(0, 115, 237, 1);
    cursor: pointer;
    display: flex;
    align-items: center;
}

.upload-flex-container {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
    max-width: 100%;
    min-width: 400px;
    gap: 10px;
    padding-bottom: 5px;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }

    .upload-trigger-class {
        display: flex;
        align-items: center;

        .uploader-icon {
            font-size: 20px;
            color: #409eff;
            cursor: pointer;
            border: 1px dashed #d9d9d9;
            padding: 5px;
            border-radius: 4px;
            transition: all 0.3s;

            &:hover {
                border-color: #409eff;
                background-color: #ecf5ff;
            }
        }
    }

    .custom-file-list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;

        .file-item {
            display: flex;
            align-items: center;
            padding: 2px 8px;
            transition: all 0.3s;
            flex-shrink: 0;

            .file-name {
                margin-right: 5px;
                cursor: pointer;
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .file-remove {
                cursor: pointer;
                font-size: 16px;
                color: red;

                :hover {
                    color: #ff4d4f;
                }
            }

            .file-download {
                cursor: pointer;
                font-size: 16px;
                color: #409eff;

                :hover {
                    color: #66b1ff;
                }
            }
        }
    }
}

.upload-tips {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
    margin-left: 10px;
}
</style>