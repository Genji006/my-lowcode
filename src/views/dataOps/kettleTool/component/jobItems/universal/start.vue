<template>
    <SzycDialog :dialogVisible="dialogVisible" width="30%" @close="handleDialogClose" title="作业定时调度"
        :destroy-on-close="true" :alignCenter="true">
        <template #uname>
            <div class="mxgraphForm">
                <el-form :model="formData" label-width="130px">
                    <el-form-item label="重复">
                        <el-checkbox v-model="formData.repeat"></el-checkbox>
                    </el-form-item>

                    <el-form-item label="类型">
                        <el-select v-model="formData.schedulerType" placeholder="请选择调度类型">
                            <el-option label="不需要定时" value="0" />
                            <el-option label="时间间隔" value="1" />
                            <el-option label="天" value="2" />
                            <el-option label="周" value="3" />
                            <el-option label="月" value="4" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="以秒计算的间隔">
                        <el-input v-model="formData.intervalSeconds" />
                    </el-form-item>

                    <el-form-item label="以分钟计算的间隔">
                        <el-input v-model="formData.intervalMinutes" />
                    </el-form-item>


                    <el-form-item label="每天">
                        <div class="time-composite">
                            <el-input v-model="formData.hour" placeholder="小时"
                                style="width: calc(50% - 10px); margin-right: 10px;" />
                            <el-input v-model="formData.minutes" placeholder="分钟" style="width: calc(50% - 0px);" />
                        </div>
                    </el-form-item>

                    <el-form-item label="每周">
                        <el-input v-model="formData.weekDay" />
                    </el-form-item>

                    <el-form-item label="每月">
                        <el-input v-model="formData.dayOfMonth" />
                    </el-form-item>
                </el-form>
            </div>
            <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
                <SzycCancel @click="handleDialogClose">取消</SzycCancel>
                <szycButton type="primary" @click="handleConfirm">确定</szycButton>
            </div>
        </template>
    </SzycDialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import szycButton from "@/components/element/Confirm.vue"
import SzycCancel from "@/components/element/Cancel.vue"
import { ElMessage } from 'element-plus'

// 获取 mxUtils
const { mxUtils } = window.mx;
// 定义 emits
const emit = defineEmits(['update-step'])

const dialogVisible = ref(false)
const defaultLogDataRow = ref({});
const activeTab = ref('fields')
const formData = reactive({
    stepName: '',
    repeat: false,
    intervalMinutes: '',
    intervalSeconds: '',
    hour: '',
    minutes: '',
    weekDay: '',
    dayOfMonth: '',
    schedulerType: '0',
})


// 存储当前编辑的节点信息
let currentCell = null
let currentGraph = null
let currentXml = null
let allXml = null
let jobName = ref("")

// 打开对话框
const openDialog = (data) => {
    if (data && data.cell) {
        currentCell = data.cell
        currentGraph = data.graph
        currentXml = data.xml
        allXml = data.allXml
        jobName.value = data.jobName
        parseStepInfoAndPopulateForm(currentXml);
        console.log("data", data);
    }
    dialogVisible.value = true
}

// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
    try {
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        let stepElements = xmlDoc.getElementsByTagName('JobEntry');
        if (stepElements.length > 0) {
            const special = stepElements[0];
            // 填充表单字段
            formData.stepName = special.getAttribute('label') || '';
            formData.repeat = special.getAttribute('repeat') === 'Y';
            formData.intervalMinutes = special.getAttribute('intervalMinutes') || '';
            formData.intervalSeconds = special.getAttribute('intervalSeconds') || '';
            formData.hour = special.getAttribute('hour') || '';
            formData.minutes = special.getAttribute('minutes') || '';
            formData.weekDay = special.getAttribute('weekDay') || '';
            formData.dayOfMonth = special.getAttribute('dayOfMonth') || '';
            formData.schedulerType = special.getAttribute('schedulerType') || '0'

        }
    } catch (error) {
        console.error('解析stepInfo XML失败:', error);
        ElMessage.error("解析stepInfo XML数据失败");
    }
}

// 更新stepInfo XML中的数据
const updateStepInfoXml = (stepInfoXml) => {
    try {
        let xmlDoc = mxUtils.parseXml(stepInfoXml);
        const stepElements = xmlDoc.getElementsByTagName('JobEntry');
        if (stepElements.length > 0) {
            const special = stepElements[0];

            // 更新属性
            special.setAttribute('label', formData.stepName);
            special.setAttribute('repeat', formData.repeat ? 'Y' : 'N');
            special.setAttribute('intervalMinutes', formData.intervalMinutes);
            special.setAttribute('intervalSeconds', formData.intervalSeconds);
            special.setAttribute('hour', formData.hour);
            special.setAttribute('minutes', formData.minutes);
            special.setAttribute('weekDay', formData.weekDay);
            special.setAttribute('dayOfMonth', formData.dayOfMonth);
            special.setAttribute('schedulerType', formData.schedulerType);

            // 返回更新后的XML
            return mxUtils.getPrettyXml(special);
        }

        return stepInfoXml;
    } catch (error) {
        console.error('更新stepInfo XML失败:', error);
        ElMessage.error("更新stepInfo XML数据失败");
        return stepInfoXml;
    }
}

const handleConfirm = () => {
    if (currentCell && currentGraph && currentXml) {
        // 更新节点名称
        currentGraph.getModel().setValue(currentCell, formData.stepName);

        // 更新节点的 step（XML结构）
        currentXml = updateStepInfoXml(currentXml);
        console.log("currentXml", currentXml);

        // 将更新后的 XML 数据传递回父组件
        emit('update-step', {
            cell: currentCell,
            updatedXml: currentXml
        });
    }
    dialogVisible.value = false
}

const handleDialogClose = () => {
    dialogVisible.value = false
}


onMounted(() => {
})

// 暴露方法给父组件使用
defineExpose({
    openDialog
})
</script>

<style lang="scss" scoped></style>
