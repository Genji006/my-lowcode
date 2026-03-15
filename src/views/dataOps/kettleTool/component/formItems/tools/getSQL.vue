<template>
    <SzycDialog :dialogVisible="dialogVisible" width="60%" @close="handleClose" title="生成SQL语句" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="table-container">
                <tableList ref="tableRef" v-bind="bindData" >
                    <template #sql="{row}">
                        <div class="sql-container">
                            {{decodeURIComponent(row.sql)}}
                        </div>
                    </template>
                </tableList>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, defineEmits, nextTick, watch, onMounted, reactive } from 'vue'
import { ElDialog, ElTree, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { getSQL } from '@/api/kettleApi/index'
import tableList from "@/components/table/tableAndPage.vue";
const sqlList = ref([])
const dialogVisible = ref(false)
const tableRef = ref(null)

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}

const getSqlList = async (data) => {
    try {
        const res = await getSQL({ graphXml: data})
        sqlList.value = res
        nextTick(() => {
            tableRef.value.fetchData()
        })
    } catch (error) {
        console.log(error)
    }
}

const openDialog = (data) => {
    getSqlList(data)
    dialogVisible.value = true
}

const bindData = reactive({
    pageOpen: "0", //  是否需要分页
    checkBox: "0", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "userId",
    btnList: [], // 表格按钮
    apiUrl: sqlList,
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "步骤名称",
            columnName: "name",
            columnWidth: "100",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "数据源",
            columnName: "databaseName",
            columnWidth: "100",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "SQL语句",
            columnName: "sql",
            showOverflowTooltip: true,
            align: "center",
            hasSlot: true,
        }
    ],
});



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