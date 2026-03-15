<template>
    <SzycDialog :dialogVisible="dialogVisible" width="60%" @close="handleClose" title="数据库浏览" :destroy-on-close="true"
        :alignCenter="true">
        <template #uname>
            <div class="table-container">
                <tableList ref="tableRef" v-bind="bindData" @btnClick="btnClick">
                </tableList>
            </div>

            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="handleClose">取消</SzycCancel>
                <szycButton type="primary" @click="handleClose">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, defineEmits, nextTick, watch, onMounted, reactive } from 'vue'
import { ElDialog, ElTree, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { checkStep } from '@/api/kettleApi/index'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import tableList from "@/components/table/tableAndPage.vue";
const checkList = ref([])
const dialogVisible = ref(false)
const tableRef = ref(null)
const allXml = ref("")

// 定义组件属性
const props = defineProps({
})

// 定义事件发射
const emit = defineEmits(['add', 'close'])

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}


const openDialog = (data) => {
    dialogVisible.value = true
    allXml.value = data.allXml
    getCheckList(false)
}

const bindData = reactive({
    pageOpen: "0", //  是否需要分页
    checkBox: "0", //  是否需要复选框
    light: "0", //  是否需要高亮
    primaryKey: "name",
    btnList: [
        { text: "显示成功结果", btnType: "add", icon: "Refresh" },
    ], // 表格按钮
    apiUrl: checkList,
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "步骤名称",
            columnName: "name",
            showOverflowTooltip: true,
            align: "center",
        },
        {
            columnLabel: "结果",
            columnName: "typeDesc",
            showOverflowTooltip: true,
            columnWidth: "100",
            align: "center",
        },
        {
            columnLabel: "备注",
            columnName: "text",
            showOverflowTooltip: true,
            align: "center",
        }
    ],
});

const getCheckList = async (val) => {
    try {
        const res = await checkStep({ graphXml: allXml.value, show_successful_results: val })
        checkList.value = res.map(item => ({
            ...item,
            name: item.name.replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
        }))
        nextTick(() => {
            tableRef.value.fetchData()
        })
    } catch (error) {
        console.log(error)
    }
}

const btnClick = (item, row) => {
    console.log(item, row);
    if (item.text == "显示成功结果") {
        getCheckList(true)
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