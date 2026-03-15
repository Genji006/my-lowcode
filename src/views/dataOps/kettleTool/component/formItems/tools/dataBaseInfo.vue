<template>
    <SzycDialog :dialogVisible="dialogVisible" width="60%" @close="handleClose" title="数据库浏览" :destroy-on-close="true"
        :alignCenter="true">
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

            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="handleClose">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, defineEmits, nextTick, watch, onMounted, reactive } from 'vue'
import { ElDialog, ElTree, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { getAllDatabases, deleteDatabaseConn } from '@/api/kettleApi/index'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import tableList from "@/components/table/tableAndPage.vue";
const dataBaseList = ref([])
const dialogVisible = ref(false)
const tableRef = ref(null)

// 定义组件属性
const props = defineProps({
})

// 定义事件发射
const emit = defineEmits(['add', 'close'])

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}

const getDataBase = async () => {
    try {
        const res = await getAllDatabases({ _dc: Date.now() })
        dataBaseList.value = res
        nextTick(() => {
            tableRef.value.fetchData()
        })
    } catch (error) {
        console.log(error)
    }
}

const openDialog = (data) => {
    getDataBase()
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
    apiUrl: dataBaseList,
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "连接名",
            columnName: "name",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "主机名",
            columnName: "hostName",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "端口",
            columnName: "port",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "数据库名",
            columnName: "databaseName",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "数据库类型",
            columnName: "databaseType",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "操作",
            columnName: "operate",
            align: "center",
            columnWidth: "100",
            showOverflowTooltip: true,
            hasSlot: true,
        },
    ],
});

const handleAdd = () => {
    emit('add')
}

const handleUpdate = (row) => {
    emit('update', row)
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        deleteDatabaseConn({
            id: row.databaseId
        }).then(res => {
            ElMessage.success('删除成功！')
            getDataBase()
        })
    })
}

const btnClick = (item, row) => {
    if (item.text == "新增") {
        handleAdd()
    } else if (item.text == "刷新") {
        getDataBase()
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

.userIndex-operate-btn {
    color: rgba(0, 115, 237, 1);
    cursor: pointer;
    text-decoration: underline;
}
</style>