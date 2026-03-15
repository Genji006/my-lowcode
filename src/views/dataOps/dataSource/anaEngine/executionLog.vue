<!-- 执行日志 -->
<template>
    <div class="logManagement-main-class normalSize">
        <div class="logManagement-left-class">
            <div class="logManagement-left-content-class">
                <div class="content-list" v-for="(item, index) in logArr" :key="index"
                    :class="{ 'selected': item.selected }" @click="handlelogItemClick(item, index)">
                    <span>{{ item.name }}</span>
                </div>
            </div>
            <div class="black-divider"></div>
        </div>
        <div class="logManagement-right-class">
            <div class="logManagement-right-bottoms-class">
                <div class="logManagement-userList-search-class">
                    <searchForm :modelValue="queryParam" :items="searchItems" :inline="true" labelWidth=""
                        @reset="handleReset" @searchVal="handleSearch" class="logManagement-userList-searchForm-class">
                    </searchForm>
                </div>
                <div class="logManagement-userList--table-class">
                    <tableAndPageComponent ref="tableRef" apiUrl="/business/dataAnalysisEngineLog/page"
                        :queryParams="queryParam" primaryKey="uuid"
                        class="logManagement-userList-tableAndPageComponent-class" :designTableColumns="designTableUserColumns"
                        @selection-change="handleSelectionChange" @row-click="rowClick" :light="true"
                        v-bind="{ showBorder: 1, pageOpen: 1 }">
                        <template #implementState="{ row }">
                            <div :class="getExecuteStatusClass(row.implementState)" class="execute-default">{{
                                logStatusFn(row.implementState, "formatter") }}
                            </div>
                        </template>
                        <template #operation="{ row }">
                            <div style="display:flex;">
                                <div class="clickable-blue-class" @click.stop="buttonClick('执行进度',row)">
                                    执行进度
                                </div>
                                <div class="clickable-blue-class" @click.stop="buttonClick('查看',row)">
                                    查看
                                </div>
                                <div class="clickable-red-class" @click.stop="buttonClick('删除',row)">
                                    删除
                                </div>
                            </div>
                        </template>
                    </tableAndPageComponent>
                </div>
            </div>
        </div>

        <SzycDialog :dialogVisible="logDetailShow" :close-on-click-modal="false" destroy-on-close title="执行日志信息"
            width="85%" @close="logDetailShow = false" top="20px">
            <template #uname>
                <div class="logManagement-top-title-class">
                    <!-- <div class="logManagement-top-title-line"></div> -->
                    <span>日志基本信息</span>
                </div>
                <div class="logManagement-top-class">
                    <el-form label-position="right" label-width="auto" :inline="true" :model="logDetail"
                        class="log-detail-form">
                        <el-form-item label="日志名称：">
                            <p class="form-item-content">{{ logDetail.logName }}</p>
                        </el-form-item>
                        <el-form-item label="关联模型：">
                            <p class="form-item-content">{{ logDetail.modelName }}</p>
                        </el-form-item>
                        <el-form-item label="模型版本号：">
                            <p class="form-item-content">{{ logDetail.modelVersion }}</p>
                        </el-form-item>
                        <el-form-item label="执行状态：">
                            <p class="form-item-content">{{ logStatusFn(logDetail.implementState, "formatter") }}
                            </p>
                        </el-form-item>
                        <el-form-item label="开始时间：">
                            <p class="form-item-content">{{ logDetail.operateStartTime }}</p>
                        </el-form-item>
                        <el-form-item label="结束时间：">
                            <p class="form-item-content">{{ logDetail.operateEndTime }}</p>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="logManagement-bottom-title-class">
                    <!-- <div class="logManagement-top-title-line"></div> -->
                    <span>指标日志详情</span>
                </div>
                <div class="logManagement-bottom-class" style="height: 550px;overflow-y: auto;">
                    <tableAndPageComponent ref="logDetailRef" :apiUrl="logDetailArr" :queryParams="logDetailParams"
                        :designTableColumns="logDetailTableColumns" :checkBox="false" :light="true" primaryKey="uuid"
                        :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 0 }">
                        <template #operation="{ row }">
                            <div style="display:flex;">
                                <div class="clickable-blue-class" @click.stop="getInfo(row)">
                                    查看
                                </div>
                                <div class="clickable-blue-class" @click.stop="getDetail(row)">
                                    指标名称明细
                                </div>
                                <div class="clickable-blue-class" @click.stop="downFile(row.logField)">
                                    下载
                                </div>
                            </div>
                        </template>
                    </tableAndPageComponent>
                </div>
                <div class="el-dialog-HorizontalLine"></div>
                <div class="el-dialog-buttons">
                    <CanCelBtn @click="logDetailShow = false">返回 </CanCelBtn>
                </div>
            </template>
        </SzycDialog>
        <SzycDialog :dialogVisible="logInfoShow" :close-on-click-modal="false" destroy-on-close title="执行日志信息"
            width="85%" @close="logInfoShow = false" top="50px">
            <template #uname>
                <pre
                    style="white-space: pre-wrap; word-wrap: break-word; height: 700px; overflow-y: auto;">{{ resultLog }}</pre>
            </template>
        </SzycDialog>
        <SzycDialog :dialogVisible="indicatorShow" :close-on-click-modal="false" destroy-on-close title="指标名称明细"
            width="85%" @close="indicatorShow = false" top="50px">
            <template #uname>
                <div class="logManagement-bottom-class" style="height: 600px;overflow-y: auto;">
                    <tableAndPageComponent ref="indicatorRef" :apiUrl="logInfoList" :queryParams="indicatorParams"
                        :designTableColumns="indicatorTableColumns" :checkBox="false" :light="true" primaryKey="uuid"
                        :reserveSelection="true" v-bind="{ showBorder: 1, pageOpen: 0 }">
                    </tableAndPageComponent>
                </div>
                <div class="el-dialog-HorizontalLine"></div>
                <div class="el-dialog-buttons">
                    <CanCelBtn @click="indicatorShow = false">返回 </CanCelBtn>
                </div>
            </template>
        </SzycDialog>
        <SzycDialog :dialogVisible="engineShow" :close-on-click-modal="false" destroy-on-close title="执行进度" width="80%"
            @close="closeEngineExecution" :alignCenter="true">
            <template #uname>
                <EngineExecution :engine-name="engineinfo.analysisName" :model="engineinfo.modelName"
                    :model-type="engineinfo.enginemodelType" :model-category="engineinfo.enginemodelCategory"
                    :uuid="propsUuid" ref="engineExecutionRef" />
                <div class="el-dialog-HorizontalLine"></div>
                <div class="el-dialog-buttons">
                    <CanCelBtn @click="closeEngineExecution">返回 </CanCelBtn>
                </div>
            </template>
        </SzycDialog>
    </div>
</template>
<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed, h, markRaw } from "vue";
import tableAndPageComponent from "@/components/table/tableAndPage.vue";
import searchForm from "@/components/element/SearchForm.vue";
import edit from "@/assets/ItemImg/edit.svg";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from '@element-plus/icons-vue';
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import {
    yesOrNoFn,
    isStandardModelFn,
    analysisCycleTypeFn,
    scriptConfigFn,
    logStatusFn,
    jobStatusFn
} from "@/types/dict/index.js";
import { useRouter } from "vue-router";
import {
    dataAnalysisEngineIndexLogDetail,
    deleteLog,
    analysisEngineExecuteDetail,
    getAnalyticalModel
} from "@/api/modelIndexManage/anaEngineManagement.js";
import EngineExecution from "./engineExecution.vue";
import { dictStore } from '@/store/dict'

const DeleteIconComponent = {
    setup() {
        return () => h('img', {
            src: '/src/assets/ItemImg/deleteIcon.svg',
            style: {
                width: '30px',
                height: '25px'
            }
        });
    }
};

const dictKey = dictStore()
const router = useRouter();

const engineExecutionRef = ref(null)
const engineShow = ref(false)
const tableRef = ref(null);
const logDetailRef = ref(null);
const indicatorRef = ref(null);
const logDetailShow = ref(false);
const logInfoShow = ref(false);
const indicatorShow = ref(false);
const logDetail = reactive({})
const resultLog = ref("")
const logArray = ref([])

const handleSelectionChange = (val) => {
    logArray.value = val
}

const logArr = ref([
    // { name: "质控分析日志", selected: false },
    { name: "指标分析日志", selected: true }
]);

const handlelogItemClick = (item, index) => {
    logArr.value.forEach((logItem) => {
        logItem.selected = false;
    });
    item.selected = true;
}

const logDetailBtnList = ref([
    {
        label: "返回",
        btnType: "cancel",
    },
]);

const queryParam = reactive({
    beginTime: "",
    endTime: "",
    modelUuid: '',
    implementState: null,
})

const searchItems = computed(() => [
    {
        label: '指标分析日期：',
        prop: 'dateRange',
        rangeFields: ['beginTime', 'endTime'],
        component: 'el-date-picker',
        style: { width: '280px' },
        attrs: {
            'start-placeholder': "",
            'end-placeholder': "",
            'value-format': 'YYYY-MM-DD',
            "range-separator": "至",
            "type": "daterange",
        }
    },
    {
        component: "el-select",
        label: "关联模型：",
        style: { width: "250px" },
        prop: "modelUuid",
        optionLabel: "modelName",
        optionValue: "uuid",
        attrs: { placeholder: "请选择", clearable: true },
        options: modelList.value,
    },
    {
        component: "el-select",
        label: "执行状态：",
        style: { width: "250px" },
        prop: "implementState",
        attrs: { placeholder: "请选择", clearable: true },
        options: logStatusFn(),
    },
]);

const getExecuteStatusClass = (status) => {
    switch (status) {
        case '0': // 未分析
            return 'execute_status0';
        case '1': // 已分析
            return 'execute_status1';
        case '2': // 分析中
            return 'execute_status2';
        case '3': // 暂停中
            return 'execute_status3';
        default:
            return '';
    }
}

//  表格数据
const designTableUserColumns = ref([
    {
        columnLabel: "日志名称",
        columnName: "logName",
        columnWidth: "250",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "关联模型",
        columnName: "modelName",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "模型版本号",
        columnName: "modelVersion",
        columnWidth: "180",
        align: "center",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "执行状态",
        columnName: "implementState",
        showOverflowTooltip: true,
        columnWidth: "180",
        hasSlot: true,
    },
    {
        columnLabel: "开始时间",
        columnName: "operateStartTime",
        align: "center",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "结束时间",
        columnName: "operateEndTime",
        align: "center",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "操作",
        columnName: "operation",
        columnWidth: "180",
        hasSlot: true,
    },
]);

// 查看进度
const propsUuid = ref("")
const engineinfo = reactive({})
const showProgress = async (val) => {
    console.log("val", val);
    val.enginemodelType = isStandardModelFn(val.standardModel, "formatter")
    val.enginemodelCategory = modelTypeList.value.find(item => item.dictValue === val.modelType)?.dictLabel
    Object.assign(engineinfo, val)
    // let res = await analysisEngineExecuteDetail({ uuid: val.uuid })
    engineShow.value = true
    propsUuid.value = val.uuid
}

// 关闭执行进度弹窗时的处理
const closeEngineExecution = () => {
    engineExecutionRef.value.stopPolling();
    engineShow.value = false
    // 重置当前执行的引擎信息
    propsUuid.value = ""
}

// 删除
const deleteItem = async (val) => {
    ElMessageBox.confirm(
        `确定删除吗？`,
        "删除",
        {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: 'custom-confirm-box',
            icon: markRaw(DeleteIconComponent),
        }
    ).then(async () => {
        let params = {
            uuidList: val.map(item => {
                return item.uuid
            })
        }
        let res = await deleteLog(params)
        if (res.code == 200) {
            ElMessage.success("删除成功")
            if (tableRef.value) {
                tableRef.value.fetchData();
                tableRef.value?.clearSelection();
            }
        }
    })
}

let logDetailArr = ref([])
// 查看详情
const showView = async (val) => {
    logDetailParams.dataAnalysisEngineLogUuid = val.uuid
    Object.assign(logDetail, val)
    let res = await dataAnalysisEngineIndexLogDetail(logDetailParams)
    if (res.code == 200) {
        logDetailArr.value = res.data.filter(item => item.ktrjobLog).map(item => { return { ...item.ktrjobLog, implementResult: item.implementResult } })
        logDetailShow.value = true
        console.log(logDetailArr.value);
        nextTick(() => {
            if (logDetailRef.value) {
                logDetailRef.value.fetchData();
            }
        });
    }

}

//  查询
const handleReset = () => {
    if (!tableRef.value) return;
    tableRef.value.fetchData();
};

const handleRefresh = () => {
    searchText.value = ""
    getlistGroup();
}


const handleSearch = () => {
    console.log("重置");
    if (!tableRef.value) return;
    tableRef.value.fetchData("重置");
};


// 执行日志信息
const logDetailParams = reactive({
    dataAnalysisEngineLogUuid: ""
})

const operationList = ref([
    {
        text: "执行进度",
        btnType: "add",
        icon: "",
        typeRow: "rowType",
        img: "/ItemImg/yinqingzhixing1.svg",
        bind: { type: "baseSpecial" },
        permission: 'fxrz-zxjd'
    },
    {
        text: "查看",
        btnType: "view", icon: 'View',
        typeRow: "rowType",
        bind: { type: "baseSpecial" },
        permission: 'fxrz-view'
    },
    {
        btnType: "delete",
        bind: { type: "deleteSpecial" },
        permission: 'fxrz-del'
    },
]);

// 按钮事件
const buttonClick = async (val, lightVal) => {
    console.log("val11",val, lightVal);
    if (val === "执行进度") {
        showProgress(lightVal)
    } else if (val === "查看") {
        showView(lightVal)
    } else if (val === "删除") {
        deleteItem(logArray.value)
    }
};

const logDetailTableColumns = ref([
    {
        columnLabel: "脚本名称",
        columnName: "jobname",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "执行结果",
        columnName: "implementResult",
        showOverflowTooltip: true,
        formatter: (row, cloumn, index) => {
            return jobStatusFn(row.implementResult, "formatter");
        },
    },
    {
        columnLabel: "开始时间",
        columnName: "logdate",
        columnWidth: "250",
        align: "center",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "结束时间",
        columnName: "logdate",
        columnWidth: "250",
        align: "center",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "操作",
        columnName: "operation",
        columnWidth: "200",
        hasSlot: true,
    },
])

const getInfo = (val) => {
    logInfoShow.value = true;
    console.log(val);
    resultLog.value = val.logField
}

const downFile = (val) => {
    // 创建一个Blob对象，将字符串转换为文件内容
    const blob = new Blob([val], { type: 'text/plain;charset=utf-8' });

    // 创建一个临时的a标签用于下载
    const link = document.createElement('a');

    // 创建文件名，可以使用当前时间戳确保唯一性
    const fileName = `日志信息.txt`;

    // 创建对象URL
    const url = URL.createObjectURL(blob);

    // 设置下载属性
    link.href = url;
    link.download = fileName;

    // 添加到页面并触发点击事件
    document.body.appendChild(link);
    link.click();

    // 下载完成后清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

const logInfoList = ref([])
// 指标名称明细
const getDetail = (val) => {
    indicatorShow.value = true
    logInfoList.value = val.ktrjobTransLogList
    nextTick(() => {
        if (indicatorRef.value) {
            indicatorRef.value.fetchData();
        }
    });
}

const indicatorParams = reactive({})
const resultList = ref([
    {
        result: 'true',
        label: '正常'
    },
    {
        result: 'false',
        label: '异常'
    },
])

const indicatorTableColumns = ref([
    {
        columnLabel: "脚本名称",
        columnName: "stepname",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "执行结果",
        columnName: "result",
        showOverflowTooltip: true,
        formatter: (row, cloumn, index) => {
            return resultList.value.find(item => item.result === row.result)?.label || "";
        },
    },
    {
        columnLabel: "开始时间",
        columnName: "replayDate",
        columnWidth: "250",
        align: "center",
        showOverflowTooltip: true,
    },
    {
        columnLabel: "结束时间",
        columnName: "logDate",
        columnWidth: "250",
        align: "center",
        showOverflowTooltip: true,
    },
])

const modelList = ref([])
const modelTypeList = ref([])
const getModel = async () => {
    let params = {
        pageNum: 1,
        pageSize: 9999
    }
    let res = await getAnalyticalModel(params)
    if (res.code == 200) {
        modelList.value = res.rows
    }
}


onMounted(async () => {
    getModel()
    if (tableRef.value) {
        tableRef.value.fetchData();
    }
    modelTypeList.value = dictKey.dict.fxmx_category
});
</script>
<style lang="scss" scoped>
.logManagement-main-class {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    .black-divider {
        width: 100%;
        height: 1px;
        background: #ccc;
    }

    .logManagement-left-class {
        width: 100%;
        height: 40px;
        border-radius: 4px;
        padding: 10px 0;
        margin-top: -14px;
        margin-bottom: -5px;

        .logManagement-left-content-class {
            display: flex;

            .content-list {
                padding: 2px 16px;
                border-left: 3px solid transparent;
                cursor: pointer;

            }

            .selected {
                color: rgba(0, 115, 237, 1);
                border-bottom: solid rgba(0, 115, 237, 1);
            }
        }
    }

    .logManagement-right-class {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .logManagement-right-bottoms-class {
            background-color: #fff;
            height: 100%;
            width: 100%;

            .logManagement-userList-search-class {
                width: 100%;
                // height: 58px;
                display: flex;
                align-items: center;

                :deep(.formContentCss .el-form-item) {
                    margin-right: 30px !important;
                }

                .logManagement-userList-searchForm-class {
                    box-shadow: none !important;
                    background: none !important;
                }

            }

            .logManagement-userList--table-class {
                height: calc(99% - 60px);

                // :deep(.tableExpand) {
                //     padding: 0 16px 12px;
                // }

                .logManagement-userList-tableAndPageComponent-class {
                    box-shadow: none !important;
                    background: none !important;
                }
            }
        }
    }

    .logManagement-top-class {
        width: 100%;
        height: 58px;
        display: flex;
        align-items: center;
    }

    .logManagement-bottom-class {
        height: calc(99% - 58px);
        margin-top: 0.5%;
    }

    .log-detail-form {
        width: 100%;

        :deep(.el-form-item) {
            margin: 5px 15px !important;
        }

        :deep(.el-form-item__label) {
            font-size: 16px !important;
            color: rgba(102, 102, 102, 1) !important;
        }

        .form-item-content {
            width: 250px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: rgba(0, 0, 0, 1) !important;
        }
    }

    .logManagement-top-title-class {
        padding: 0 0 10px;
        margin: 0 10px 10px;
        font-size: 16px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(201, 201, 201, 1);
        color: rgba(0, 0, 0, 1);
    }

    .logManagement-bottom-title-class {
        margin: 20px 10px 0;
        padding: 0 0 10px;
        font-size: 16px;
        border-bottom: 1px solid rgba(201, 201, 201, 1);
        display: flex;
        color: rgba(0, 0, 0, 1);
    }

    .logManagement-top-title-line {
        border: 2px solid rgba(0, 115, 237, 1);
        height: 18px;
        border-radius: 1px;
        margin-right: 4px;
    }

    .clickable-blue-class {
        color: rgba(0, 115, 237, 1);
        cursor: pointer;
        text-decoration: underline;
        text-decoration-color: rgba(0, 115, 237, 1);
        text-decoration-style: solid;
        text-underline-offset: 4px;
        margin-right: 10px;
        /* 添加下划线与文字的间距 */
    }

    .clickable-red-class {
        color: rgba(192, 0, 0, 1);
        cursor: pointer;
        text-decoration: underline;
        // text-decoration-color: rgba(83, 128, 253, 1);
        text-decoration-style: solid;
        text-underline-offset: 4px;
        /* 添加下划线与文字的间距 */
    }
}
</style>