<template>
  <div>
    <el-card shadow="always" class="dashboard" :style="style">
      <img style="margin-top: -1px; margin-left: 82px" v-if="item.indexDefinitionEntity?.isFill == 1"
        src="@/assets/ItemImg/luruicon.svg" class="isFill" />
      <img style="margin-top: -1px; margin-left: 82px" v-if="item.indexDefinitionEntity?.isFill == 2"
        src="@/assets/ItemImg/and.png" class="isFill" />
      <div class="card-header">
        <el-popover trigger="hover" placement="top" width="300">
          <div class="header-title">
            {{ item.indexDefinitionEntity?.indexName }}
          </div>
          <template v-slot:reference>
            <span class="header-title">{{ item.indexDefinitionEntity?.indexName }}</span></template>
        </el-popover>
        <div class="icons">
          <el-tooltip effect="dark" content="收藏关注" placement="top">
            <img v-if="item.isFollow" style="cursor: pointer" src="@/assets/ItemImg/index-love.svg"
              @click.stop="lovestates(item)" />
            <img v-if="!item.isFollow" style="cursor: pointer" src="@/assets/ItemImg/index-notFollow.svg"
              @click.stop="lovestates(item)" />
          </el-tooltip>
          <el-tooltip style="font-size: 16px" popper-class="box-item" placement="right" effect="light" width="400">
            <template #content>
              <div class="contentIndex">
                <div class="DivTitle">
                  <p class="IndexTitle">指标名称：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.indexName }}
                  </p>
                </div>
                <div class="DivTitle">
                  <p class="IndexTitle">计算方法：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.calculationMethod }}
                  </p>
                </div>
                <div class="DivTitle">
                  <p class="IndexTitle">指标意义：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.indexSignificance }}
                  </p>
                </div>

                <div class="DivTitle">
                  <p class="IndexTitle">指标定义：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.indexDefinition }}
                  </p>
                </div>
                <div class="DivTitle">
                  <p class="IndexTitle">详细说明：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.detailedDescription }}
                  </p>
                </div>
                <div class="DivTitle">
                  <p class="IndexTitle">评审方法：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.evaluationMethod }}
                  </p>
                </div>
                <div class="DivTitle">
                  <p class="IndexTitle">数据来源：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.dataSource }}
                  </p>
                </div>

                <div class="DivTitle">
                  <p class="IndexTitle">统计周期：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.statisticalPeriod == "1" ? "年" :
                      item.indexDefinitionEntity?.statisticalPeriod == "0" ? "月" : "" }}
                  </p>
                </div>
                <div class="DivTitle">
                  <p class="IndexTitle">指标导向：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.indexOrientation }}
                  </p>
                </div>
                <div class="DivTitle" style="margin-bottom: 10px">
                  <p class="IndexTitle">计量单位：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.unitOfMeasurement }}
                  </p>
                </div>
                <div class="DivTitle" style="margin-bottom: 10px">
                  <p class="IndexTitle">指标属性：</p>
                  <p class="IndexContent">
                    {{ item.indexDefinitionEntity?.indexAttribute }}
                  </p>
                </div>
                <div class="DivTitle" style="margin-bottom: 10px">
                  <p class="IndexTitle">责任科室：</p>
                  <p class="IndexContent">
                    {{ item.indexRelationInfo ? item.indexRelationInfo?.relatedDepartCode + " " +
                      item.indexRelationInfo?.relatedDepartName : "" }}
                  </p>
                </div>
                <div class="DivTitle" style="margin-bottom: 10px">
                  <p class="IndexTitle">联络员：</p>
                  <p class="IndexContent">
                    {{ item.indexRelationInfo?.specialistHumanGeneralName }}
                  </p>
                </div>
                <div class="DivTitle" style="margin-bottom: 10px">
                  <p class="IndexTitle">科室负责人：</p>
                  <p class="IndexContent">
                    {{ item.indexRelationInfo?.relatedHumanGeneralName }}
                  </p>
                </div>
              </div>
            </template>
            <img style="cursor: pointer; margin-left: 10px" src="@/assets/ItemImg/index-detail.svg" /></el-tooltip>
        </div>
      </div>
      <div class="card-body">
        <div class="body-left" style="width: 150px">
          <div class="now">
            <el-tooltip class="box-item" effect="light" :content="item.children ? '暂无' : item.currentValueFormat"
              placement="top">
              {{ item.currentYear + "年" }}：{{ currentyearType(item) }}
            </el-tooltip>
          </div>
          <div class="past">
            <el-tooltip class="box-item" effect="light" :content="item.children ? '暂无' : item.historyValueFormat"
              placement="top">
              {{ item.historyYear + "年" }}：{{ historyyearType(item) }}
            </el-tooltip>
          </div>
          <div class="past">
            <el-tooltip class="box-item" effect="light"
              :content="item.indexDefinitionEntity?.targetValue ? item.indexDefinitionEntity?.targetValue : '-'"
              placement="top">
              目标值：
              {{ item.indexDefinitionEntity?.targetValue ? item.indexDefinitionEntity?.targetValue : "-" }}
            </el-tooltip>
          </div>
        </div>
        <div class="body-right">
          <!-- <slot name="chart"></slot> -->
          <cardCharts :id="'myEchart'" :datas="echartData" />
        </div>
      </div>
      <div class="card-footer" v-if="type != 1 && type != 2">
        <div class="footer-left">
          <el-tooltip class="box-item" effect="light" :content="meanOfValuesType(item)" placement="top">
            平均数值：
            {{ meanOfValuesType(item) }}
          </el-tooltip>
        </div>
        <div class="footer-right">
          <el-tooltip class="box-item" effect="light" :content="medianOfValuesType(item)" placement="top">
            中位数值：
            {{ medianOfValuesType(item) }}
          </el-tooltip>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { nextTick, ref, onMounted, computed, inject, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { followIndexApi, unfollowIndexApi, queryIndexDataApi, EChartsByIndexDefinitionResult } from "@/api/settings";
import { useRoute } from 'vue-router';
import cardCharts from './Echarts.vue'

const route = useRoute();

const emit = defineEmits(['update-data']);
const isPreview = inject('isPreview', true);
const echartData = ref({});

const props = defineProps({
  conf: { type: Object, default: () => ({ props: {} }) },
  apiParams: { type: Object, default: () => ({}) }
});


const getCharts = async () => {
  try {
    if (isPreview) {
      const res = await EChartsByIndexDefinitionResult({
        indexDefinitionUuid: route.query.indexUuid || "",
        newestPatchNo: route.query.processingNumber || "",
        productUuid: sessionStorage.getItem("menuCode") || "",
        dataType: '1',
        statisticalPeriod: 1,
        yearStart: route.query.yearStart || "",
        yearEnd: route.query.yearEnd || "",
        year: route.query.yearStart || "",
      });
      if (res.code === 200) {
        echartData.value = res.data || {};
        console.log(echartData.value, 'echartData.value')
      }
    } else {
      echartData.value = {
        unitOfMeasurement: "%",
        yAxis: [
          {
            unitOfMeasurement: "%",
            data: [
              "1",
              "2",
              "3",
              "4",
              "5",
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
              "-"
            ],
            name: "出院患者四级手术比例"
          }
        ],
        xAxis: [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月"
        ],
        format: null
      }
    }
  } catch (error) {
    console.error("获取图表数据失败:", error);
  }
}

// === 2. 完美桥接原有的 Props (保证模板不需要修改任何一行) ===
const type = computed(() => props.conf.props.type ?? 0);

// === 3. 数据状态 ===
const item = ref({}); // 把原来的 prop.item 变成了内部响应式数据
const loading = ref(false);
let MenuCode = ref();
const codes = ref("");
let Arr = ["3.1.3.1", "1.6.2.1", "1.5.3.3"];

// === 4. 固定接口获取数据逻辑 ===
const loadData = async () => {
  loading.value = true;
  try {
    // [编辑模式]：生成极其逼真的占位数据，方便在画布里看效果
    if (!isPreview) {
      item.value = {
        indexDefinitionEntity: {
          indexName: '示例指标(编辑态)', isFill: 1, targetValue: '100', calculationMethod: 'A/B*100%',
          indexSignificance: '这只是一个测试数据', evaluationMethod: '系统自动考核',
          dataSource: 'HIS系统', statisticalPeriod: '0', unitOfMeasurement: '%'
        },
        indexRelationInfo: {
          relatedDepartCode: '1001', relatedDepartName: '信息科',
          specialistHumanGeneralName: '张三', relatedHumanGeneralName: '李四'
        },
        currentYear: '2026', currentValueFormat: '85.00%', currentValue: 0.85,
        historyYear: '2025', historyValueFormat: '80.00%', historyValue: 0.80,
        meanOfValuesFormat: '82.00%', medianOfValuesFormat: '83.00%',
        isFollow: false
      };
      return;
    }

    // [预览/运行模式]：将联动的参数发给您的固定接口
    const requestPayload = {
      ...props.apiParams,
      indexDefinitionUuid: route.query.indexUuid || "",
      newestPatchNo: route.query.processingNumber || "",
      productUuid: sessionStorage.getItem("menuCode") || "",
      dataItemType: 0,
      dataType: 1,
    };
    const res = await queryIndexDataApi(requestPayload);
    if (res.code === 200) {
      item.value = res.data || {};
      let outData = {
        indexName: item.value.indexDefinitionEntity?.indexName || '',
        operationExpressionExt: item.value.operationExpression || '',
      }
      emit('update-data', outData);
    } else {
      emit('update-data', {});
    }

  } catch (err) {
    console.error('指标卡片数据加载失败:', err);
  } finally {
    loading.value = false;
  }
};

// === 5. 监听联动参数变化 ===
watch(() => props.apiParams, () => {
  if (isPreview) loadData(); // 当页面其他筛选条件改变时，自动重新请求
}, { deep: true });

onMounted(() => {
  MenuCode.value = sessionStorage.getItem("menuCode");
  loadData(); // 初始化加载
  getCharts();
});

// === 6. 完美保留您的所有业务处理逻辑 ===

function currentyearType(val) {
  // 注意：原先的 prop.type 统一改为了 type.value
  if (type.value == 1) {
    return val.currentValue == 1 ? "是" : val.currentValue == 0 ? "否" : "暂无";
  } else if (type.value == 2) {
    return lv(val.currentValue);
  } else {
    if (val.indexRelationInfo?.termCode == "3.1.3.1") {
      return val.currentValue == 1 ? "是" : val.currentValue == 0 ? "否" : "暂无";
    } else if (val.indexRelationInfo?.termCode == "1.6.2.1") {
      return val.currentValue == 1 ? "协同" : val.currentValue == 0 ? "否" : "是";
    } else {
      if (val.children) {
        return "暂无";
      } else {
        return val.currentValueFormat;
      }
    }
  }
}

function lv(data) {
  if (data) {
    if (data >= 85 && data <= 100) return "优级（A）";
    else if (data >= 65 && data < 85) return "良级（B）";
    else if (data >= 45 && data < 65) return "中级（C）";
    else if (data >= 0 && data < 45) return "差级（D）";
    else return "";
  }
}

function historyyearType(val) {
  if (type.value == 1) {
    return val.historyValue == 1 ? "是" : val.historyValue == 0 ? "否" : "暂无";
  } else if (type.value == 2) {
    return lv(val.historyValue);
  } else {
    if (val.indexRelationInfo?.termCode == "3.1.3.1") {
      return val.historyValue == 1 ? "是" : val.historyValue == 0 ? "否" : "暂无";
    } else if (val.indexRelationInfo?.termCode == "1.6.2.1") {
      return val.historyValue == 1 ? "协同" : val.historyValue == 0 ? "否" : "是";
    } else {
      if (val.children) return "暂无";
      else return val.historyValueFormat;
    }
  }
}

function meanOfValuesType(val) {
  if (Arr.includes(val.indexRelationInfo?.termCode)) return "暂无";
  else {
    if (val.children) return "暂无";
    else return val.meanOfValuesFormat;
  }
}

function medianOfValuesType(val) {
  if (Arr.includes(val.indexRelationInfo?.termCode)) return "暂无";
  else {
    if (val.children) return "暂无";
    else return val.medianOfValuesFormat;
  }
}

function currentValue_1(data) {
  if (data == null) return "-";
  else if (Number(data) < 1) return (Number(data) * 100).toFixed(2) + "%";
  else if (data % 1 === 0) return data;
  else return Number(data).toFixed(2);
}

function historyValue_1(data) {
  if (Number(data) < 1) return (Number(data) * 100).toFixed(2) + "%";
  else if (data % 1 === 0) return data;
  else return Number(data).toFixed(2);
}

function changeRatio_1(data) {
  if (Number(data).toString().indexOf("0.") != -1) return (Number(data) * 100).toFixed(2) + "%";
  else if (data % 1 === 0) return data;
  else return Number(data).toFixed(2);
}

function medianOfValues(data) {
  if (Number(data).toString().indexOf("0.") != -1) return (Number(data) * 100).toFixed(2) + "%";
  else if (data % 1 === 0) return data;
  else return Number(data).toFixed(2);
}

let lovestates = async a => {
  if (a.isFollow) {
    let res = await unfollowIndexApi({
      indexUuid: a.indexDefinitionEntity.uuid,
      productUuid: MenuCode.value,
    });
    if (res.data.data == false) {
      ElMessageBox.confirm("该指标为责任分配指标，无法取消关注，如有疑问请联系管理员", "提示", {
        confirmButtonText: "确定",
        type: "warning",
      });
      return;
    } else {
      a.isFollow = false;
    }
  } else {
    followIndexApi({
      indexUuid: a.indexDefinitionEntity.uuid,
      productUuid: MenuCode.value,
    });
    a.isFollow = true;
  }
};
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 8px;
  margin-top: 12px;
}

::-webkit-scrollbar-thumb {
  background: #ccc; // 滑块颜色
  border-radius: 5px; // 滑块圆角
}

// Dashboard为仪表板card样式
.dashboard {
  width: 100%;
  // height: 200px;
  box-sizing: border-box;
  // border-top: 2px solid var(--btn_stroke, #fff);
  // border-left: 2px solid var(--btn_stroke, #fff);
  border-radius: 4px;
  background: #5380fd;
  box-shadow: 0px 5.33333px 5.33333px 0px rgba(255, 255, 255, 0.1) inset,
    0px -10.66667px 10.66667px 0px rgba(0, 0, 0, 0.05) inset,
    10.66667px 0px 10.66667px 0px rgba(0, 0, 0, 0.02) inset,
    -10.66667px 0px 10.66667px 0px rgba(0, 0, 0, 0.02) inset,
    0px 4px 4px 0px rgba(88, 122, 244, 0.2),
    12px 12px 16px 0px rgba(88, 150, 244, 0.2),
    -4px -4px 14px 0px rgba(88, 160, 244, 0.1);
  padding: 24px 24px 12px 24px;
  color: #fff;
  font-family: "Microsoft Yahei";
  font-style: normal;
  font-weight: 400;
  position: relative;

  .isFill {
    position: absolute;
    left: 7px;
    top: 0;
  }
}

.card-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  line-height: 24px;
  font-size: 18px;
  font-weight: 600;
  align-items: center;
  font-family: "Microsoft Yahei";

  .header-title {
    width: 194px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .icons {
    display: flex;
    align-items: center;
  }
}

.card-body {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-family: "Microsoft Yahei";
  margin-top: 16px;

  .now {
    line-height: 24px;
    font-size: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .past {
    margin-top: 8px;
    line-height: 24px;
    font-size: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .body-right {
    width: 88px;
    // height: 25px;
    // border: 1px solid;
  }
}

.card-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 24px;
  font-size: 14px;
  font-family: "Microsoft Yahei";
  margin-top: 12px;
  color: #fff;
}

:deep(.el-card__body) {
  padding: 0;
}

.IndexTitle {
  font-weight: bold;
  color: #1d2129;
  width: 30%;
  font-size: 16px;
  white-space: nowrap;
}

.IndexContent {
  width: 70%;
  font-size: 16px;
  color: rgba(29, 33, 41, 0.7);
}

.contentIndex {
  font-size: 15px;
  padding: 1%;
  font-family: "Microsoft YaHei";
  width: 400px;
  max-height: 700px;
  overflow: auto;
}

.DivTitle {
  display: flex;
  margin-top: 10px;
}

.footer-left {
  width: 49%;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* 显示省略号 */
}

.footer-right {
  margin-left: 1%;
  width: 50%;
  overflow: hidden;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* 显示省略号 */
}
</style>