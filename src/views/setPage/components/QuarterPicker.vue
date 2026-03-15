<template>
  <div class="el-quarter-wrap">
    <el-popover title="" content="" width="320" :visible="visible">
      <template #reference>
        <el-input
          v-model="quarterDate"
          placeholder="请选择季度"
          clearable
          :prefix-icon="Calendar"
          readonly
          @click.native="visible = true"
          @change="quarterDateChange"
        >
          <template #suffix>
            <el-icon
              v-if="quarterDate"
              class="el-quarter-clear"
              @click="clearData"
            >
              <Close />
            </el-icon>
          </template>
        </el-input>
      </template>

      <div class="el-quarter__header">
        <span
          class="el-quarter-btn el-quarter-btn__pre"
          @click="changeShowYear(-1)"
        >
          <el-icon>
            <DArrowLeft />
          </el-icon>
        </span>
        <div class="el-quarter__header-text" @click="showYearList">
          {{ quarterTitle }}
        </div>

        <span
          class="el-quarter-btn el-quarter-btn__next"
          @click="changeShowYear(1)"
        >
          <el-icon>
            <DArrowRight />
          </el-icon>
        </span>
      </div>

      <div class="el-quarter__content" v-if="!isEditYear">
        <div class="el-quarter__row">
          <span
            class="quarter-index"
            :class="{
              'is-active': showYear === pickerYear && quarterIndex === 1,
            }"
            @click="pickerQuarte(1)"
            >第一季度</span
          >
          <span
            class="quarter-index"
            :class="{
              'is-active': showYear === pickerYear && quarterIndex === 2,
            }"
            @click="pickerQuarte(2)"
            >第二季度</span
          >
        </div>
        <div class="el-quarter__row">
          <span
            class="quarter-index"
            :class="{
              'is-active': showYear === pickerYear && quarterIndex === 3,
            }"
            @click="pickerQuarte(3)"
            >第三季度</span
          >
          <span
            class="quarter-index"
            :class="{
              'is-active': showYear === pickerYear && quarterIndex === 4,
            }"
            @click="pickerQuarte(4)"
            >第四季度</span
          >
        </div>
      </div>

      <div class="el-year__content" v-else>
        <div class="el-year-item" v-for="item in yearList">
          <div
            class="cell"
            :class="{ 'is-active': showYear == item }"
            @click="selectYear(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import {
  DArrowLeft,
  DArrowRight,
  Close,
  Calendar,
} from "@element-plus/icons-vue";

import { computed, onMounted, reactive, ref } from "vue";
let visible = ref(false);

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["update:modelValue", "change"]);

// 绑定日期
let quarterDate = ref("");
// 选择的年
let pickerYear = ref("") as any;
// 展示的年
let showYear = ref("") as any;
// 选择的季度
let quarterIndex = ref();

// 是否展示年份列表
let isEditYear = ref(false);

// 年份列表开始年份
let startYear = ref("") as any;

// 年份列表
let yearList = reactive([] as any);

const quarterTitle = computed(() => {
  if (isEditYear.value) {
    return startYear.value + "年 - " + (startYear.value + 9) + "年";
  } else {
    return showYear.value + "年";
  }
});

// 选择某季度
function pickerQuarte(index: number) {
  quarterIndex.value = index;
  pickerYear.value = showYear.value;
  visible.value = false;
  const quarterLabels = ["第一季度", "第二季度", "第三季度", "第四季度"];
  quarterDate.value = pickerYear.value + quarterLabels[index - 1];

  // 计算季度的开始和结束时间
  const year = parseInt(pickerYear.value);
  const quarter = index;

  // 计算季度的开始和结束月份
  const quarterStartMonth = (quarter - 1) * 3;
  const quarterEndMonth = quarterStartMonth + 2;

  // 开始时间：季度第一天 00:00:00
  const startDate = `${year}-${String(quarterStartMonth + 1).padStart(2, "0")}-01 00:00:00`;

  // 结束时间：季度最后一天 23:59:59
  const quarterEndDate = new Date(year, quarterEndMonth + 1, 0);
  const quarterEndDay = quarterEndDate.getDate();
  const endDate = `${year}-${String(quarterEndMonth + 1).padStart(2, "0")}-${String(quarterEndDay).padStart(2, "0")} 23:59:59`;

  // 发送包含开始和结束时间的事件
  emits("update:modelValue", {
    STARTDATE: startDate,
    ENDDATE: endDate,
  });
}

// 更改展示的年
function changeShowYear(num: number) {
  if (isEditYear.value) {
    startYear.value = startYear.value + num * 10;
    changeYearList();
  } else {
    showYear.value = showYear.value + num;
  }
}

// 清空选择的数据
function clearData() {
  quarterDate.value = "";
  pickerYear.value = "";
  showYear.value = new Date().getFullYear();
  quarterIndex.value = 0;
}

// 选择的数据
function quarterDateChange(value: any) {
  // 解析季度值，格式如：2026-第一季度
  const match = value.match(/^(\d{4})-第([1-4])季度$/);
  if (match) {
    pickerYear.value = match[1];
    showYear.value = match[1];
    quarterIndex.value = parseInt(match[2]);
  } else {
    // 解析失败，重置为当前年份和季度
    pickerYear.value = "";
    showYear.value = new Date().getFullYear();
    quarterIndex.value = 0;
  }
}

// 更改年份列表函数
function changeYearList() {
  yearList = [];
  let year = startYear.value;
  for (let i = 0; i < 10; i++) {
    yearList.push(year++);
  }
}

// 切换展示年份列表 和 季度
function showYearList() {
  if (!isEditYear.value) {
    startYear.value = Number(Math.floor(showYear.value / 10) + "0");
    changeYearList();
    isEditYear.value = true;
  } else {
    isEditYear.value = false;
  }
}

// 选中某个年份列表
function selectYear(item: any) {
  showYear.value = item;
  isEditYear.value = false;
}

onMounted(() => {
  // 初始化展示的年为当前年份
  showYear.value = new Date().getFullYear();
  startYear.value = Number(Math.floor(showYear.value / 10) + "0");
  changeYearList();

  // 初始化默认值为当前季度
  if (props.modelValue) {
    quarterDateChange(props.modelValue);
  } else {
    // 设置当前季度为默认值
    const now = new Date();
    const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
    quarterIndex.value = currentQuarter;
    pickerYear.value = showYear.value;
  }
});
</script>
<style lang="scss" scoped>
.el-quarter__header {
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .el-quarter-btn {
    font-size: 12px;
  }
  .el-quarter__header-text {
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
  }
}
.el-quarter__content {
  min-height: 100px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  .el-quarter__row {
    display: flex;
    justify-content: space-around;

    .quarter-index {
      display: flex;
      padding: 4px 10px;
      width: fit-content;
      cursor: pointer;

      &:hover {
        color: #337ecc;
      }
    }

    .is-active {
      color: #409eff;
    }
  }
}
.el-quarter-clear {
  position: relative;
  color: #909399;
  display: none;
  height: 12px;
  width: 12px;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    height: 14px;
    width: 14px;
    margin: auto;
    border-radius: 50%;
    border: 1px solid #909399;
  }
}
.el-input {
  &:hover {
    .el-quarter-clear {
      display: flex;
    }
  }
}
.el-year__content {
  min-height: 100px;
  display: flex;
  padding: 10px 0;
  flex-wrap: wrap;
  .el-year-item {
    width: calc(100% / 4);
    display: flex;
    align-items: center;
    justify-content: center;
    .cell {
      padding: 4px 10px;
      width: fit-content;
      cursor: pointer;
      cursor: pointer;
      white-space: nowrap;
      &:hover {
        color: #337ecc;
      }
    }
    .is-active {
      color: #409eff;
    }
  }
}
</style>
