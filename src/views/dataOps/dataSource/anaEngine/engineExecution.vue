<template>
    <div class="engine-execution cardShadow">
        <!-- 顶部信息栏 -->
        <div class="header-info">
            <div class="info-item">
                <span>引擎名称：</span>
                <span>{{ props.engineName }}</span>
            </div>
            <div class="info-item">
                <span>关联模型：</span>
                <span>{{ props.model }}</span>
            </div>
            <div class="info-item">
                <span>模型类型：</span>
                <span>{{ props.modelType }}</span>
            </div>
            <div class="info-item">
                <span>模型类别：</span>
                <span>{{ props.modelCategory }}</span>
            </div>
        </div>

        <!-- 进度展示区 -->
        <div class="progress-section">
            <!-- <div class="progress-circle">
                <ProgressRound :data="overallProgress" />
            </div> -->
            <div class="status-info">
                <div class="status-title" v-if="engineStatus == 1">智能分析计算中 <img src="/src/assets/image/jiantou.png"
                        alt="" style="margin-left: -15px;"></div>
                <div class="status-title0" v-if="engineStatus == 0">智能分析已取消</div>
                <div class="status-title0" v-if="engineStatus == 3">智能分析发生异常</div>
                <div class="status-title2" v-if="engineStatus == 2">智能分析已完成
                </div>
                <div class="status-desc" v-if="engineStatus == 1">正在计算分析指标分子分母数据项</div>
                <div class="metrics-stats">
                    <div class="stat-item">
                        <img src="@/assets/image/gyzb.png" alt="" style="width: 90px; height: 90px;">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="label" style="margin: 0 0 0 25px;">共有指标</div>
                            <div class="value" style="color: rgba(6, 177, 226, 1);margin-left: 10px">{{ totalMetrics }}
                            </div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <img src="@/assets/image/yjszb.png" alt="" style="width: 90px; height: 90px;">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="label" style="margin: 0 0 0 12px;">已计算指标</div>
                            <div class="value" style="color: rgba(61, 255, 189, 1);">{{ calculatedMetrics }}</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <img src="@/assets/image/syzb.png" alt="" style="width: 90px; height: 90px;">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="label" style="margin: 0 0 0 25px;">剩余指标</div>
                            <div class="value" style="color: rgba(255, 198, 24, 1);margin-left: 10px">{{ totalMetrics -
                                calculatedMetrics }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="time-and-controls">
                <span class="elapsed-time">分析已用时：{{ elapsedTime }}</span>
                <div class="control-buttons">
                    <!-- <div class="pause-btn btn-div ">暂停分析</div> -->
                    <div class="cancel-btn btn-div" @click="cancelEngine"
                        :class="{ 'disabled': engineStatus == 0 || engineStatus == 2 || engineStatus == 3 }">取消分析</div>
                </div>
            </div>
        </div>


        <!-- 整体进度条 -->
        <div class="overall-progress">
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: overallProgress + '%' }">
                    <div class="progress-label" v-if="overallProgress > 0">{{ overallProgress }}%</div>
                    <div class="progress-label1" v-else>{{ overallProgress }}%</div>
                </div>
            </div>
        </div>

        <!-- 分析章节列表 -->
        <div class="analysis-chapters">
            <!-- <img src="/src/assets/image/kuangdi.png" alt="Log Item" class="background-image"> -->
            <div class="analysis-content">
                <div v-for="(chapter, index) in chapters" :key="index" class="chapter-item">
                    <div class="chapter-header" @click="toggleChapter(index)">
                        <span class="chapter-title">{{ chapter.title }}</span>
                        <span class="chapter-stats">
                            <span class="chapter-text">共有指标：<div style="color: rgba(97, 232, 255, 1);width: 35px;">{{
                                chapter.total
                                    }}项</div></span>
                            <span class="chapter-text">已计算指标：<div style="color: rgba(97, 232, 255, 1);width: 35px;">{{
                                chapter.calculated }}项</div></span>
                            <span class="chapter-text">剩余指标：<div style="color: rgba(97, 232, 255, 1);width: 35px;">{{
                                chapter.remaining }}项</div></span>
                            <img v-if="chapter.expanded" :src="up" alt="" class="arrow-icon">
                            <img v-else :src="down" alt="" class="arrow-icon">
                        </span>
                    </div>
                    <div v-if="chapter.expanded" class="chapter-content">
                        <div v-for="(item, itemIndex) in chapter.items" :key="itemIndex" class="item-row"
                            :class="getJobStatus(item.status)">
                            <img v-if="item.status === '2'" :src="loading" alt="" class="custom-loading-icon"
                                style="margin-right: 10px;">
                            <el-icon v-if="item.status === '1'" style="margin-right: 10px;" :size="24">
                                <SuccessFilled />
                            </el-icon>
                            <el-icon v-if="item.status === '3'" style="margin-right: 10px;" :size="24">
                                <CircleCloseFilled />
                            </el-icon>
                            <span class="item-name">{{ item.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import ProgressRound from "./ProgressEcharts.vue";
import up from "@/assets/ItemImg/wup.svg";
import down from "@/assets/ItemImg/wdown.svg";
import loading from "@/assets/image/loading.png";
import {
    analysisEngineExecuteDetail,
    analysisEngineCancel
} from "@/api/modelIndexManage/anaEngineManagement.js";
import { ElMessage } from 'element-plus';

// 数据定义
const elapsedTime = ref('');
const totalMetrics = ref(0);
const calculatedMetrics = ref(0);
const remainingMetrics = ref(0);
const overallProgress = ref(0);

const props = defineProps({
    // 引擎基本信息
    engineName: {
        type: String,
        default: "",
    },
    model: {
        type: String,
        default: "",
    },
    modelType: {
        type: String,
        default: "",
    },
    modelCategory: {
        type: String,
        default: "",
    },
    uuid: {
        type: String,
        default: "",
    }
})

const getJobStatus = (val) => {
    switch (val) {
        case '1': // 已分析
            return 'job_status0';
        case '3': // 分析失败
            return 'job_status1';
        case '2': // 分析中
            return 'job_status2';
        default:
            return 'job_status3';
    }
}

// 章节数据
const chapters = ref([]);

// 控制章节展开/收起
const toggleChapter = (index) => {
    chapters.value[index].expanded = !chapters.value[index].expanded;
};

// 轮询定时器
let pollingTimer = null;

// 获取引擎执行详情
const fetchEngineExecutionDetail = async () => {
    if (!props.uuid) return;
    let res = await analysisEngineExecuteDetail({ uuid: props.uuid });
    if (res.code == 200) {
        overallProgress.value = res.data.completeCount
        elapsedTime.value = res.data.completeTime
        totalMetrics.value = res.data.completeCount
        calculatedMetrics.value = res.data.ktrRunLogCompleteCount
        chapters.value = res.data.scriptExeLogList.map(item => {
            return {
                title: item.scriptName,
                total: item.indexTotalCount,
                calculated: item.indexExecutedCount,
                remaining: item.indexTotalCount - item.indexExecutedCount,
                expanded: true,
                items: item.subLogRecordList.map(item1 => {
                    return {
                        name: item1.transName,
                        status: item1.executeStatus
                    }
                })
            }
        })
        switch (res.data.dataAnalysisEngineLog.implementState) {
            case '1': // 已执行
                engineStatus.value = 2
                stopPolling()
                break;
            case '4': // 已取消
                engineStatus.value = 0
                stopPolling()
                break;
            case '9': // 发生异常
                engineStatus.value = 3
                stopPolling()
                break;
        }

    } else {
        ElMessage.error("分析失败")
        stopPolling()
    }
};

// 开始轮询
const startPolling = () => {
    if (pollingTimer) {
        clearInterval(pollingTimer);
    }

    if (props.uuid) {
        // 立即执行一次
        fetchEngineExecutionDetail();
        // 设置定时轮询
        pollingTimer = setInterval(fetchEngineExecutionDetail, 1000);
    }
};

// 停止轮询
const stopPolling = () => {
    if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
    }
};

const engineStatus = ref(1)
// 取消引擎
const cancelEngine = async () => {
    if (engineStatus.value == 0 || engineStatus.value == 2) {
        return;
    }
    if (!props.uuid) return;
    let res = await analysisEngineCancel({ uuid: props.uuid });
    if (res.code == 200) {
        ElMessage.success("取消成功")
        stopPolling()
        engineStatus.value = 0
    }
}

// 监听uuid变化
watch(
    () => props.uuid,
    (newUuid) => {
        if (newUuid) {
            startPolling();
        } else {
            stopPolling();
        }
    },
    { immediate: true }
);

// 组件销毁时停止轮询
onMounted(() => {
    console.log(props.uuid);
    // 组件挂载时根据是否有uuid决定是否开始轮询
    if (props.uuid) {
        startPolling();
    }
});
onUnmounted(() => {
    stopPolling();
});
defineExpose({
    stopPolling
});
</script>


<style lang="scss" scoped>
.engine-execution {
    background-image: url("/src/assets/image/enginBack.gif");
    background-size: cover;

    .header-info {
        margin: 0 30px;
        padding-top: 20px;
        display: flex;
        margin-bottom: 20px;
        font-size: 16px;
        color: #fff;
        justify-content: space-between;
    }

    .progress-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        // background-color: rgba(229, 236, 255, 1);
        height: 220px;

        .progress-circle {
            width: 240px;
            height: 200px;
            overflow: hidden;
            background-image: url("/src/assets/image/kuangdi.png");
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;

            .echarts-container {
                width: 100%;
                height: 100%;
                z-index: 999;
            }
        }

        .status-info {
            flex: 1;
            margin-left: 400px;
            display: flex;
            flex-direction: column;
            // margin-top: -40px;

            .status-title {
                font-family: 'YouSheBiaoTiHei';
                font-size: 36px;
                margin-left: 20px;
                color: rgba(7, 255, 255, 1);
                font-weight: 400;
            }

            .status-title0 {
                font-family: 'YouSheBiaoTiHei';
                font-size: 36px;
                margin-left: 20px;
                color: rgba(255, 87, 51, 1);
                font-weight: 400;
            }

            .status-title2 {
                font-family: 'YouSheBiaoTiHei';
                font-size: 36px;
                margin-left: 20px;
                color: rgba(61, 255, 189, 1);
                font-weight: 400;
            }

            .status-desc {
                font-size: 16px;
                margin-left: 20px;
                color: rgba(226, 246, 255, 0.8);
                margin-top: 4px;
                position: absolute;
                top: 23%;
            }

            .metrics-stats {
                display: flex;
                margin-top: 50px;
                gap: 30px;

                .stat-item {
                    display: flex;
                    align-items: center;
                    margin-left: 20px;
                    background-image: url("/src/assets/image/kuang.png");
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 200px;
                    height: 95px;


                    .label {
                        color: rgba(226, 246, 255, 1);
                        margin-right: 16px;
                        font-size: 13px;
                    }

                    .value {
                        font-family: 'YouSheBiaoTiHei';
                        font-weight: 400;
                        color: #333;
                        font-size: 24px;
                        margin-top: 10px;
                    }
                }
            }
        }

        .time-and-controls {
            // display: flex;
            // flex-direction: column;
            position: relative;
            margin-top: -100px;
            // margin-right: 50px;
            // width: 300px;

            .elapsed-time {
                position: absolute;
                right: 0;
                top: -10px;
                font-size: 16px;
                color: rgba(226, 246, 255, 0.8);
                font-weight: 400;
            }

            .control-buttons {
                display: flex;
                margin-top: 28px;

                .btn-div {
                    width: 130px;
                    height: 45px;
                    line-height: 40px;
                    font-size: 18px;
                    text-align: center;
                    cursor: pointer;
                    background-image: url("/src/assets/image/anniu.png");
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                }

                .cancel-btn {
                    // border: 2px solid rgba(255, 87, 51, 1);
                    color: rgba(226, 246, 255, 1);
                    // box-shadow: 0px 2px 10px rgba(83, 128, 253, 0.2);
                    margin-left: 60px;

                    // &:hover {
                    //     background: rgba(255, 87, 51, 1);
                    //     color: #fff;
                    // }

                    &.disabled {
                        // border: 2px solid #ccc;
                        color: #ccc;
                        cursor: not-allowed;
                        // box-shadow: none;

                        // &:hover {
                        //     background: transparent;
                        //     color: #ccc;
                        // }
                    }
                }


            }
        }
    }

    .overall-progress {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        margin-top: 50px;

        .progress-bar {
            height: 20px;
            flex: 1;
            background: linear-gradient(90deg, rgba(24, 144, 255, 0.2) 0%, rgba(24, 144, 255, 0.2) 26.39%, rgba(30, 231, 231, 0.2) 100%);
            // 添加斜线图案
            // background-image: linear-gradient(135deg, rgba(163, 188, 255, 0.5) 25%, transparent 25%, transparent 50%, rgba(163, 188, 255, 0.5) 50%, rgba(163, 188, 255, 0.5) 75%, transparent 75%, transparent);
            // background-size: 10px 10px;
            margin: 0px 20px;
            border-radius: 10px;
            position: relative;
            display: flex;
            align-items: center;
            padding: 0 2px;
        }

        .progress-fill {
            height: 80%;
            // background-color: rgba(83, 128, 253, 1);
            background-image: url("/src/assets/image/progress.png");
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            // background-size: 100% 100%;
            border-radius: 10px;
            transition: width 0.6s ease;
            width: 0;
            position: relative;
            top: unset;
            transform: none;
        }

        .progress-label {
            position: absolute;
            right: -25px;
            top: -50px;
            font-size: 16px;
            color: rgba(255, 255, 255, 1);
            font-weight: 500;
            white-space: nowrap;
            // line-height: 20px;
            z-index: 999;
            width: 60px;
            height: 45px;
            background-image: url("/src/assets/image/shuzhi.png");
            background-repeat: no-repeat;
            background-size: 100% 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .progress-label1 {
            position: absolute;
            right: 30;
            top: -50px;
            font-size: 16px;
            color: rgba(255, 255, 255, 1);
            font-weight: 500;
            white-space: nowrap;
            line-height: 20px;
            z-index: 999;
            width: 60px;
            height: 45px;
            background-image: url("/src/assets/image/shuzhi.png");
            background-repeat: no-repeat;
            background-size: 100% 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .analysis-chapters {
        height: 350px;
        // width: 100%;
        // position: relative;
        margin: 30px 20px 10px 20px;
        padding: 20px 3px 10px 20px;
        background-image: url("/src/assets/image/kuangdi.png");
        background-repeat: no-repeat;
        background-size: 100% 100%;
        overflow-y: auto;

        &::-webkit-scrollbar {
            display: none;
        }

        /* Firefox */
        -ms-overflow-style: none;
        scrollbar-width: none;

        .background-image {
            position: absolute;
            top: -5%;
            // left: 50%;
            // transform: translateX(-50%);
            width: 98%;
            height: 100%;
            z-index: 1;
            left: 1%;
        }

        .analysis-content {
            // margin: 25px 20px 0 30px;
        }

        .chapter-item {
            margin-top: 20px;

            .chapter-header {
                display: flex;
                padding: 0 12px;
                // background: linear-gradient(0deg, rgba(174, 195, 252, 0.4) 0%, rgba(126, 220, 251, 0) 100%, rgba(209, 221, 255, 0) 100%);
                background-image: url("/src/assets/image/wenzidi.png");
                background-repeat: no-repeat;
                background-size: 100% 100%;

                // justify-content: space-between;
                cursor: pointer !important;
                position: relative;
                z-index: 10;

                .chapter-title {
                    // margin-left: 20px;
                    font-size: 18px;
                    font-weight: 400;
                    background: linear-gradient(180deg, rgba(86, 209, 237, 1) 6.6%, rgba(202, 246, 255, 1) 88.19%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    top: -10px;
                    position: relative;
                    width: 40%;
                }

                .chapter-stats {
                    font-size: 16px;
                    // margin-right: 110px;
                    color: rgba(102, 102, 102, 1);
                    display: flex;
                    align-items: center;
                    top: -10px;
                    position: relative;
                    margin: 0 0px 0px 240px;

                    .chapter-text {
                        margin-right: 20px;
                        color: #fff;
                        margin: 0 20px;
                        display: flex;
                    }
                }

            }

            .chapter-content {
                // background-color: rgba(229, 229, 229, 0.25);
                border-top: none;

                // 已分析
                .job_status0 {
                    background-color: rgba(7, 91, 116, 1);
                    color: rgba(61, 255, 189, 1);
                }

                // 分析失败
                .job_status1 {
                    background-color: rgba(242, 201, 196, 0.24);
                    color: rgba(255, 87, 51, 1);
                    ;
                }

                // 分析中
                .job_status2 {
                    background-color: rgba(15, 55, 111, 1);
                    color: rgba(7, 205, 255, 1);
                }

                // 待分析
                .job_status3 {
                    background-color: rgba(15, 55, 111, 0.6);
                    color: #fff
                }

                .item-row {
                    display: flex;
                    align-items: center;
                    padding: 5px 40px;
                    font-size: 16px;
                    font-weight: 400;
                    margin-bottom: 2px;
                    margin-right: 30px;

                    .custom-loading-icon {
                        animation: spin 2s linear infinite;
                        width: 24px;
                        height: 24px;
                    }

                    @keyframes spin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }
                }
            }
        }
    }
}
</style>