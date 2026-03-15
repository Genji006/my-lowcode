<template>
    <SzycDialog :dialogVisible="dialogVisible" width="60%" @close="handleClose" title="Hadoop Cluster"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="table-container">
                <tableList ref="tableRef" v-bind="bindData" @btnClick="btnClick">
                    <template #operate="{ row }">
                        <div style="display: flex; justify-content: space-between">
                            <div class="userIndex-operate-btn" @click="handleUpdate(row)">
                                编辑
                            </div>
                            <div class="userIndex-operate-btn" @click="handleDelete(row)">删除</div>
                        </div>
                    </template>
                </tableList>
            </div>
        </template>
    </SzycDialog>
    <SzycDialog :dialogVisible="infoDialog" width="50%" @close="infoClose" title="Hadoop Cluster"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <el-form :model="formData" label-width="140px">
                <!-- 集群名称和MapR客户端选项 -->
                <el-form-item label="Cluster Name">
                    <el-input v-model="formData.name" />
                </el-form-item>

                <el-form-item>
                    <el-checkbox v-model="formData.useMapRClient" label="Use MapR Client" />
                </el-form-item>
            </el-form>

            <!-- HDFS 表单 -->
            <el-divider content-position="left">HDFS</el-divider>
            <el-form :model="formData" :disabled="formData.useMapRClient" label-width="140px">
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label="Hostname">
                            <el-input v-model="formData.hdfsHost" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="port">
                            <el-input v-model="formData.hdfsPort" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label="username">
                            <el-input v-model="formData.hdfsUsername" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="password">
                            <el-input v-model="formData.hdfsPassword" type="password" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <!-- JobTracker 表单 -->
            <el-divider content-position="left">JobTracker</el-divider>
            <el-form :model="formData" :disabled="formData.useMapRClient" label-width="140px">
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label="Hostname">
                            <el-input v-model="formData.jobTrackerHost" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="port">
                            <el-input v-model="formData.jobTrackerPort" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <!-- ZooKeeper 表单 -->
            <el-divider content-position="left">ZooKeeper</el-divider>
            <el-form :model="formData" label-width="140px">
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label="Hostname">
                            <el-input v-model="formData.zooKeeperHost" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="port">
                            <el-input v-model="formData.zooKeeperPort" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <!-- Oozie 表单 -->
            <el-divider content-position="left">Oozie</el-divider>
            <el-form :model="formData" label-width="140px">
                <el-form-item label="URL">
                    <el-input v-model="formData.oozieUrl" />
                </el-form-item>
            </el-form>

            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="infoClose">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm()">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, defineEmits, nextTick, watch, onMounted, reactive } from 'vue'
import { ElDialog, ElTree, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { getHadoopList, getOneCluster, deleteCluster, addHadoopCluster, updateCluster } from '@/api/kettleApi/index'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import tableList from "@/components/table/tableAndPage.vue";
const hadoopList = ref([])
const dialogVisible = ref(false)
const tableRef = ref(null)
const infoDialog = ref(false)
const infoStatus = ref('add')
const formData = ref({
    name: '',
    useMapRClient: false,
    hdfsHost: 'localhost',
    hdfsPort: '8020',
    hdfsUsername: 'user',
    hdfsPassword: '123456',
    jobTrackerHost: 'localhost',
    jobTrackerPort: '8032',
    zooKeeperHost: 'localhost',
    zooKeeperPort: '2181',
    oozieUrl: 'http://localhost:8080/oozie',
    mapr: false,
    elementId: ''
})

// 定义组件属性
const props = defineProps({
})

// 定义事件发射
const emit = defineEmits(['add', 'close'])

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}

const infoClose = () => {
    infoDialog.value = false
}

const getHadoop = async () => {
    try {
        const res = await getHadoopList({ _dc: Date.now() })
        hadoopList.value = res
        nextTick(() => {
            tableRef.value.fetchData()
        })
    } catch (error) {
        console.log(error)
    }
}


const openDialog = (data) => {
    getHadoop()
    dialogVisible.value = true
}

const bindData = reactive({
    pageOpen: "0", //  是否需要分页
    checkBox: "0", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "userId",
    btnList: [
        { btnType: "add" }, //  新增
        { text: "刷新", btnType: "edit", icon: "Refresh" },
    ], // 表格按钮
    apiUrl: hadoopList,
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "name",
            columnName: "name",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "hdfsUsername",
            columnName: "hdfsUsername",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "hdfsHost",
            columnName: "hdfsHost",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "hdfsPort",
            columnName: "hdfsPort",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "操作",
            columnName: "operate",
            align: "center",
            columnWidth: "120",
            showOverflowTooltip: true,
            hasSlot: true,
        },
    ],
});

const handleAdd = () => {
    infoDialog.value = true
    infoStatus.value = 'add'
}

const handleUpdate = async (row) => {
    try {
        const res = await getOneCluster({
            clusterName: row.name
        })
        formData.value = res
        infoDialog.value = true
        infoStatus.value = 'update'
    } catch (error) {
        console.log(error)
    }
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        deleteCluster({
            clusterName: row.name
        }).then(res => {
            ElMessage.success('删除成功！')
            getHadoop()
        })
    })
}

const handleConfirm = async () => {
    try {
        if (infoStatus.value == 'add') {
            let res = await addHadoopCluster({ cluster: JSON.stringify(formData.value) })
            if (res == faile) {
                ElMessage.success('添加失败，已存在同名集群配置')
            } else {
                ElMessage.success('添加成功')
            }
        } else if (infoStatus.value == 'update') {
            let res = await updateCluster({ cluster: JSON.stringify({ ...formData.value, elementId: formData.value.elementId }) })
            if (res == faile) {
                ElMessage.success('更新失败，已存在同名集群配置')
            } else {
                ElMessage.success('更新成功')
            }
        }
        infoClose()
        getHadoop()
    } catch (error) {
        console.log(error)
    }
}
const btnClick = (item, row) => {
    if (item.text == "新增") {
        handleAdd()
    } else if (item.text == "刷新") {
        getHadoop()
    }
};

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
    height: 400px;
    overflow: auto;
}

:deep(.el-form-item__label) {
    font-size: 14px !important;
}

.userIndex-operate-btn {
    color: rgba(0, 115, 237, 1);
    cursor: pointer;
    text-decoration: underline;
}
</style>