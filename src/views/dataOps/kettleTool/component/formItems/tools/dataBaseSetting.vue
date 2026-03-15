<template>
    <SzycDialog :dialogVisible="dialogVisible" width="55%" @close="handleClose" title="数据库连接" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="table-container">
                <div class="sidebar">
                    <el-menu :default-active="activeTab" class="el-menu-vertical-demo" @select="handleMenuSelect"
                        text-color="#000" active-text-color="#409eff">
                        <el-menu-item index="yb">一般</el-menu-item>
                        <el-menu-item index="gj">高级</el-menu-item>
                        <el-menu-item index="xx">选项</el-menu-item>
                        <el-menu-item index="ljc">连接池</el-menu-item>
                        <el-menu-item index="jq">集群</el-menu-item>
                    </el-menu>
                </div>
                <div class="main-content">
                    <div v-if="activeTab === 'yb'">
                        <div class="yb_title">
                            <div style="width: 80px; font-size: 16px; height: 30px; line-height: 30px;">连接名称：</div>
                            <el-input v-model="ybformData.name" placeholder="" style="width: 60%;" />
                        </div>
                        <div style="display: flex;">
                            <div style="flex: 1;">
                                <div class="form-group">
                                    <div class="list-title">连接类型</div>
                                    <div class="dbTypes-list">
                                        <div v-for="type in dbTypes" :key="type.value" @click="getMethods(type.value)"
                                            :class="{ 'dbTypes-items': true, 'selected-item': selectedDbType === type.value }">
                                            {{ type.text }}
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group" style="margin-top: 10px;">
                                    <div class="list-title">连接方式</div>
                                    <div class="method-list">
                                        <div v-for="item in connectionMethods" :key="item.value"
                                            @click="getSettings(item.value)"
                                            :class="{ 'mdTypes-items': true, 'selected-item': selectedMdType === item.value }">
                                            {{ item.text }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="settings-form">
                                <div class="settings-title">设置</div>
                                <el-form v-model="ybformData" ref="formRef" label-width="160px">
                                    <el-form-item label="主机名称：" prop="host" v-if="selectedMdType == 0">
                                        <el-input v-model="ybformData.hostname" />
                                    </el-form-item>
                                    <el-form-item label="数据库名称：" prop="dbName" v-if="selectedMdType == 0">
                                        <el-input v-model="ybformData.databaseName" />
                                    </el-form-item>
                                    <el-form-item label="端口号：" prop="port" v-if="selectedMdType == 0">
                                        <el-input v-model="ybformData.port" />
                                    </el-form-item>
                                    <el-form-item label="ODBC DSN源名称：" prop="odbcDsnName" v-if="selectedMdType == 1">
                                        <el-input v-model="ybformData.databaseName" type="databaseName" />
                                    </el-form-item>
                                    <el-form-item label="SID：" prop="sidbaseName" v-if="selectedMdType == 2">
                                        <el-input v-model="ybformData.databaseName" type="databaseName" />
                                    </el-form-item>
                                    <el-form-item label="JNDI名称：" prop="jndiName" v-if="selectedMdType == 4">
                                        <el-input v-model="ybformData.databaseName" />
                                    </el-form-item>
                                    <el-form-item label="数据表空间：" prop="dataTablespace">
                                        <el-input v-model="ybformData.dataTablespace" type="dataTablespace" />
                                    </el-form-item>
                                    <el-form-item label="索引表空间：" prop="indexTablespace">
                                        <el-input v-model="ybformData.indexTablespace" type="indexTablespace" />
                                    </el-form-item>
                                    <el-form-item label="用户名：" prop="username"
                                        v-if="selectedMdType == 0 || selectedMdType == 1 || selectedMdType == 2">
                                        <el-input v-model="ybformData.username" />
                                    </el-form-item>
                                    <el-form-item label="密码：" prop="password"
                                        v-if="selectedMdType == 0 || selectedMdType == 1 || selectedMdType == 2">
                                        <el-input v-model="ybformData.password" type="password" show-password/>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTab == 'gj'" style="margin: -10px;">
                        <el-form v-model="ybformData" ref="formRef" label-width="0px" class="gj-form">
                            <el-form-item prop="supportBooleanDataType">
                                <el-checkbox v-model="ybformData.supportBooleanDataType" label="支持布尔数据类型" />
                            </el-form-item>
                            <el-form-item prop="supportTimestampDataType">
                                <el-checkbox v-model="ybformData.supportTimestampDataType" label="支持Timestamp数据类型" />
                            </el-form-item>
                            <el-form-item prop="quoteIdentifiersCheck">
                                <el-checkbox v-model="ybformData.quoteIdentifiersCheck" label="标识符使用引号括起来" />
                            </el-form-item>
                            <el-form-item prop="lowerCaseIdentifiersCheck">
                                <el-checkbox v-model="ybformData.lowerCaseIdentifiersCheck" label="强制标识符使用小写字母" />
                            </el-form-item>
                            <el-form-item prop="upperCaseIdentifiersCheck">
                                <el-checkbox v-model="ybformData.upperCaseIdentifiersCheck" label="强制标识符使用大写字母" />
                            </el-form-item>
                            <el-form-item prop="preserveReservedCaseCheck">
                                <el-checkbox v-model="ybformData.preserveReservedCaseCheck"
                                    label="Preserve case of reserved words" />
                            </el-form-item>
                        </el-form>
                        <div style="margin-left: 15px;">
                            <div style="font-size: 16px; height: 30px; line-height: 30px;">
                                默认模式名称.在没有其他模式名时使用</div>
                            <el-input v-model="ybformData.preferredSchemaName" placeholder="" style="width: 75%;" />
                        </div>
                        <div style="margin-left: 15px;">
                            <div style="font-size: 16px; height: 30px; line-height: 30px;">
                                请输入连接成功后要执行的SQL语句，用分号(;)隔开</div>
                            <el-input v-model="ybformData.connectSQL" placeholder="" type="textarea" rows="3"
                                style="width: 75%;" />
                        </div>
                    </div>
                    <div v-if="activeTab == 'xx'" style="margin: -20px;">
                        <GenericTable v-model="ybformData.extraOptions" :columns="dependencyColumns"
                            :default-row="dependencyDefaultRow" ref="dependencyTableRef" />
                    </div>
                    <div v-if="activeTab == 'ljc'" style="margin: -10px;" class="ljc_content">
                        <el-checkbox v-model="poolingCheck" label="使用连接池" />
                        <div class="settings-form" style="margin-left: 0px;">
                            <div class="settings-title">连接池大小</div>
                            <el-form v-model="ybformData" label-width="110px" class="ljc-form">
                                <el-form-item label="初始大小:" prop="initialPoolSize">
                                    <el-input v-model="ybformData.initialPoolSize" style="width: 75%;" size="small"
                                        :disabled="!poolingCheck" />
                                </el-form-item>
                                <el-form-item label="最大空闲空间:" prop="maximumPoolSize">
                                    <el-input v-model="ybformData.maximumPoolSize" style="width: 75%;" size="small"
                                        :disabled="!poolingCheck" />
                                </el-form-item>
                            </el-form>
                        </div>
                        <tableList ref="tableRef" v-bind="bindData" @selectionChange="handleSelectionChange"
                            style="height: 350px;overflow-y: auto;" @row-click="handleRowClick">
                            <template #defValue="{ row }">
                                <div class="pool_input">
                                    <el-input v-model="row.defValue" :disabled="!poolingCheck" />
                                </div>
                            </template>
                        </tableList>
                        <el-input v-model="description" type="textarea" rows="3" disabled style="margin-top: 10px;" />
                    </div>
                    <div v-if="activeTab == 'jq'" class="ljc_content" style="margin: -10px;">
                        <el-checkbox v-model="partitioned" label="使用集群" />
                        <div class="form-group ">
                            <div class="list-title">命名参数</div>
                            <!-- <GenericTable v-model="ybformData.partitionInfo" :columns="jqColumns"
                                :default-row="dependencyDefaultRow" ref="dependencyTableRef" :is-disabled="true" /> -->
                            <RightClickTable ref="filterDataTableRef" v-model="ybformData.partitionInfo"
                                :columns="jqColumns" :defaultRow="dependencyDefaultRow" :showIndex="true" :height="525"
                                style="width: 100%" :disableEdit="!partitioned">
                            </RightClickTable>
                        </div>

                    </div>
                </div>
            </div>

            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="handleClose">取消</SzycCancel>
                <szycButton type="primary" @click="handleTest">测试</szycButton>
                <szycButton type="primary" @click="getFeatures">特征列表</szycButton>
                <szycButton type="primary" v-if="showExplorer" @click="handlePreview">浏览</szycButton>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
    <SzycDialog :dialogVisible="testVisible" width="55%" @close="testVisible = false" title="数据库连接测试"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="table-container" style="padding: 10px">
                <div style="height: 600px; overflow-y: auto;">
                    <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ testLog }}</pre>
                </div>
            </div>
        </template>
    </SzycDialog>
    <SzycDialog :dialogVisible="featureVisible" width="55%" @close="featureVisible = false" title="特征列表"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <tableList ref="featureTableRef" v-bind="featureData" style="height: 600px; overflow-y: auto;">
            </tableList>
        </template>
    </SzycDialog>
    <database-explorer-dialog v-model="showDatabaseExplorer" :database-info="databaseInfo" :include-element="15"
        :trans-Name="transNameInfo" @close="showDatabaseExplorer = false" />
</template>

<script setup>
import { ref, defineEmits, nextTick, watch, onMounted, reactive } from 'vue'
import { ElDialog, ElTree, ElButton, ElMessage } from 'element-plus'
import { getAccessData, getAccessMethod, getAccessSettings, databaseTest, getDatabaseFeatures, checkDatabaseSave } from '@/api/kettleApi/index'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import tableList from "@/components/table/tableAndPage.vue";
import GenericTable from '../tools/genericTable.vue'
import DatabaseExplorerDialog from './DatabaseExplorerDialog.vue'
import RightClickTable from "../tools/rightClickTable.vue";

const dataBaseList = ref([])
const tableRef = ref(null)
const featureTableRef = ref(null)
const dialogVisible = ref(false)
const activeTab = ref('yb')
const poolingCheck = ref(false)
const partitioned = ref(false)
const testVisible = ref(false)
const featureVisible = ref(false)
const showExplorer = ref(false)
const showDatabaseExplorer = ref(false)
const databaseInfo = ref({})
const ybformData = reactive({
    initialPoolSize: '5',
    maximumPoolSize: '10',
    partitionInfo: [],
    pool_params: [],
})


const bindData = reactive({
    pageOpen: false, //  是否需要分页
    checkBox: "1", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "name",
    btnList: [],
    apiUrl: [],
    checkBoxDisabled: (row, index) => {
        if (poolingCheck.value) {
            return true;
        }
        return false;
    },
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "参数名",
            columnName: "name",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "值",
            columnName: "defValue",
            showOverflowTooltip: true,
            align: "center",
            hasSlot: true,
        }
    ],
});

const featureData = reactive({
    pageOpen: false, //  是否需要分页
    checkBox: "0", //  是否需要复选框
    light: "0", //  是否需要高亮
    primaryKey: "Parameter",
    btnList: [],
    apiUrl: [],
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "Parameter",
            columnName: "Parameter",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "值",
            columnName: "Value",
            showOverflowTooltip: true,
            align: "Value",
        }
    ],
});

const description = ref('')
const handleRowClick = (row) => {
    description.value = decodeURIComponent(row.description)
}

const dbTypes = ref([])
const connectionMethods = ref([])
const selectedDbType = ref('ORACLE')
const selectedMdType = ref('')

const getMethods = async (value) => {
    try {
        selectedDbType.value = value // 设置当前选中项
        ybformData.type = value
        let res = await getAccessMethod({ accessData: value })
        connectionMethods.value = res || []
        // 如果有连接方式数据，默认选中第一个
        if (connectionMethods.value.length > 0 && !selectedMdType.value) {
            nextTick(() => {
                getSettings(connectionMethods.value[0].value)
                selectedMdType.value = connectionMethods.value[0].value
            })
        }
    } catch (error) {
        console.error('获取数据库连接方式失败:', error)
    }
}

const getSettings = async (value) => {
    try {
        selectedMdType.value = value // 设置当前选中项
        ybformData.access = value
        let res = await getAccessSettings({ accessData: selectedDbType.value, accessMethod: value })

    } catch (error) {
        console.error('获取数据库设置失败:', error)
    }
}

const detableData = ref([
    { name: '', value: '' },
])

const dependencyColumns = ref([
    { prop: 'name', label: '命名参数' },
    { prop: 'value', label: '值' }
])
const dependencyDefaultRow = ref({ name: '', value: '' })


const jqColumns = ref([
    { prop: 'partitionId', label: '分区ID' },
    { prop: 'hostName', label: '主机名称' },
    { prop: 'port', label: '端口' },
    { prop: 'databaseName', label: '数据库名称' },
    { prop: 'username', label: '用户名' },
    { prop: 'password', label: '密码' },
])
const jqDefaultRow = ref({ partitionId: '', hostName: '', port: '', databaseName: '', username: '', password: '' })

// 定义组件属性
const props = defineProps({
})

// 菜单点击事件
const handleMenuSelect = (key) => {
    activeTab.value = key
    if (key === 'ljc') {
        nextTick(() => {
            tableRef.value.fetchData()
        })
    }
}

// 定义事件发射
const emit = defineEmits(['add', 'close'])

const handleClose = () => {
    dialogVisible.value = false
    showExplorer.value = false
    // 初始化数据
    activeTab.value = 'yb'
    poolingCheck.value = false
    partitioned.value = false
    selectedDbType.value = 'ORACLE'
    selectedMdType.value = ''

    // 重置表单数据
    Object.assign(ybformData, {
        name: '',
        type: 'ORACLE',
        access: '',
        hostname: '',
        databaseName: '',
        port: '',
        odbcDsnName: '',
        sidbaseName: '',
        jndiName: '',
        dataTablespace: '',
        indexTablespace: '',
        username: '',
        password: '',
        supportBooleanDataType: false,
        supportTimestampDataType: false,
        quoteIdentifiersCheck: false,
        lowerCaseIdentifiersCheck: false,
        upperCaseIdentifiersCheck: false,
        preserveReservedCaseCheck: false,
        preferredSchemaName: '',
        connectSQL: '',
        extraOptions: [],
        initialPoolSize: '5',
        maximumPoolSize: '10',
        partitionInfo: [],
        pool_params: [],
        usingConnectionPool: 'N',
        partitioned: 'N'
    })

    // 清空描述信息
    description.value = ''

    // 重置表格数据
    if (tableRef.value) {
        tableRef.value.fetchData()
    }
}

const transNameInfo = ref('')
const openDialog = (data, type, transName) => {
    dialogVisible.value = true
    getDbTypes()
    getMethods(selectedDbType.value)
    if (data.type) {
        selectedDbType.value = data.type
        getMethods(data.type)
    } else {
        getMethods(selectedDbType.value)
    }

    // 设置连接方式
    if (data.access !== undefined) {
        selectedMdType.value = data.access
    }
    bindData.apiUrl = data.pool_params
    // ybformData = { ...ybformData, ...data }
    Object.keys(data).forEach(key => {
        if (key !== 'pool_params') {
            ybformData[key] = data[key]
        }
    })

    // 根据数据设置连接池和集群的checkbox状态
    if (data.usingConnectionPool === "Y") {
        poolingCheck.value = true
    }
    if (data.partitioned === "Y") {
        partitioned.value = true
    }
    if (type == 'update') {
        showExplorer.value = true
    }
    transNameInfo.value = transName
    console.log(transNameInfo.value);
}

const getDbTypes = async () => {
    try {
        const res = await getAccessData({})
        dbTypes.value = res || []
    } catch (error) {
        console.error('获取数据库类型失败:', error)
    }
}


const handleConfirm = async () => {
    ybformData.usingConnectionPool = poolingCheck.value ? "Y" : "N"
    ybformData.partitioned = partitioned.value ? "Y" : "N"
    let res = await checkDatabaseSave({ databaseInfo: JSON.stringify(ybformData) })
    if (res.success == false) {
        ElMessage.error("保存失败")
        return
    }
    emit('save', { ...ybformData })
    handleClose()
}

const handlePreview = () => {
    showDatabaseExplorer.value = true
    databaseInfo.value = Object.assign(ybformData)
}

const handleSelectionChange = (selection) => {
    ybformData.pool_params = selection.map(item => ({
        ...item,
        enable: true
    }))
}

const testLog = ref('')
// 测试数据库连接
const handleTest = async () => {
    ybformData.usingConnectionPool = poolingCheck.value ? "Y" : "N"
    ybformData.partitioned = partitioned.value ? "Y" : "N"
    try {
        let res = await databaseTest({ databaseInfo: JSON.stringify(ybformData) })
        if (res.success == false) {
            ElMessageBox.alert(res.message, res.title, {
                confirmButtonText: '确认'
            })
        } else {
            testVisible.value = true
            testLog.value = decodeURIComponent(res.message)
        }
    } catch (error) {
        console.error('数据库连接测试失败:', error)
    }
}

const getFeatures = async () => {
    ybformData.usingConnectionPool = poolingCheck.value ? "Y" : "N"
    ybformData.partitioned = partitioned.value ? "Y" : "N"
    try {
        let res = await getDatabaseFeatures({ databaseInfo: JSON.stringify(ybformData) })
        featureData.apiUrl = res.firstRecords
        featureVisible.value = true
        nextTick(() => {
            featureTableRef.value.fetchData()
        })
    } catch (error) {
        console.error('获取数据库连接特征失败:', error)
    }
}

// 暴露方法给父组件
defineExpose({
    openDialog,
})

// 组件初始化时调用
onMounted(() => {
})
</script>

<style scoped lang="less">
.table-container {
    display: flex;
    height: 600px;
    border: 1px solid #e4e7ed;

    .pool_input {
        :deep(.el-input .el-input__wrapper) {
            border: none !important;
        }

        :deep(.el-input.is-disabled) {
            background: transparent !important;
        }
    }

    .sidebar {
        flex: 1;
        flex-shrink: 0;

        .el-menu-vertical-demo {
            height: 100%;
            overflow-y: auto;

            :deep(.el-menu) {
                font-size: 16px !important;
            }

            :deep(.el-menu-item) {
                font-size: 16px !important;
                height: 40px;
            }
        }
    }

    .main-content {
        flex: 5;
        padding: 20px;

        .yb_title {
            display: flex;
            margin-bottom: 20px;
        }

        .form-group {
            // width: 100%;
            border: 1px solid #e4e7ed;
            border-radius: 2px;

            .list-title {
                font-size: 16px;
                height: 30px;
                line-height: 30px;
                width: 100%;
                background-color: #ecf3fd;
            }
        }

        .dbTypes-list {
            height: 300px;
            overflow-y: auto;

            .dbTypes-items {
                height: 30px;
                line-height: 30px;
                padding-left: 10px;
                cursor: pointer;
            }

            .selected-item {
                background-color: #409eff;
                color: white;
            }
        }

        .method-list {
            height: 150px;
            overflow-y: auto;

            .mdTypes-items {
                height: 30px;
                line-height: 30px;
                padding-left: 10px;
                cursor: pointer;
            }

            .selected-item {
                background-color: #409eff;
                color: white;
            }
        }

        .settings-form {
            flex: 2;

            :deep(.el-form-item__label) {
                font-size: 15px !important;
            }

            margin-left: 20px;
            border: 1px solid #e4e7ed;

            .settings-title {
                font-size: 16px;
                height: 30px;
                line-height: 30px;
                width: 100%;
                background-color: #ecf3fd;
            }
        }

        .gj-form {
            :deep(.el-form-item) {
                margin: 5px 15px !important;
            }
        }

        .ljc_content {
            :deep(.el-checkbox__label) {
                font-size: 16px !important;
            }

            .ljc-form {
                :deep(.el-form-item__label) {
                    font-size: 14px !important;
                }

                :deep(.el-form-item) {
                    margin: 5px 15px !important;
                }
            }
        }
    }
}
</style>