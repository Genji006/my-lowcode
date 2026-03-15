<template>
  <div class="el-quarter-picker">
    <el-popover
      :visible="visible"
      :width="datePickerType == 'quarter' ? 322 : 644"
      trigger="click"
    >
      <div v-if="datePickerType == 'quarter'">
        <div class="top-box">
          <el-icon @click="preYear">
            <DArrowLeft />
          </el-icon>
          <span>{{ currYear }} 年</span>
          <el-icon @click="nextYear">
            <DArrowRight />
          </el-icon>
        </div>
        <div class="content-box">
          <div
            :style="{ color: i.color }"
            @click="handleQuart(i)"
            v-for="i in quartlist"
            :key="i.id"
            class="content-item-box"
          >
            {{ i.label }}
          </div>
        </div>
      </div>

      <div
        v-else
        style="display: flex"
        tabindex="0"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <div>
          <div class="top-boxs">
            <el-icon @click="preYears" class="left-icon">
              <DArrowLeft />
            </el-icon>
            <span>{{ currYear }} 年</span>
          </div>
          <div class="content-box">
            <div
              :style="{
                color: leftFn(i) ? '#409EFF' : '',
                backgroundColor: leftFns(i) ? '#ecf5ff' : '',
              }"
              @click="handleQuartLeft(i)"
              v-for="i in quartlist"
              :key="i.id"
              class="content-item-box"
            >
              {{ i.label }}
            </div>
          </div>
        </div>
        <div>
          <div class="top-boxs">
            <span>{{ currYear + 1 }} 年</span>
            <el-icon @click="nextYears" class="right-icon">
              <DArrowRight />
            </el-icon>
          </div>
          <div class="content-box">
            <div
              :style="{
                color: rightFn(i) ? '#409EFF' : '',
                backgroundColor: rightFns(i) ? '#ecf5ff' : '',
              }"
              @click="handleQuartRight(i)"
              v-for="i in quartlist"
              :key="i.id"
              class="content-item-box"
            >
              {{ i.label }}
            </div>
          </div>
        </div>
      </div>
      <template #reference>
        <el-input
          v-model="innerValue"
          @focus="onFocus"
          ref="inputRef"
          @blur="onBlur"
          :placeholder="placeholder"
          :prefix-icon="Calendar"
          :readonly="false"
          style="width: 200px"
        >
          <template #suffix>
            <el-icon @click="clear" v-show="clearVisble"
              ><CircleClose
            /></el-icon>
          </template>
        </el-input>
      </template>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from "vue";

const props = defineProps({
  placeholder: {
    type: String,
    default: "选择季度",
  },
  modelValue: {
    type: String,
    default: "",
  },
  datePickerType: {
    type: String,
    default: "quarter",
  },
});

const emit = defineEmits(["change", "update:modelValue"]);

// v-model 双向绑定

const innerValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

// 提取年份的辅助函数
const extractYear = (quarterValue) => {
  if (!quarterValue) return "";
  return parseInt(quarterValue?.split("-")[0], 10);
};


const leftFn = (i) => {
  return (
    (leftId.value == i.id &&
      extractYear(innerValueLeft.value) == currYear.value) ||
    (extractYear(innerValueRight.value) == currYear.value &&
      rightId.value == i.id) ||
    (leftId.value == i.id && !innerValueLeft.value && !innerValueRight.value)
  );
};

const leftFns = (i) => {
  return (
    (leftId.value == i.id &&
      extractYear(innerValueLeft.value) == currYear.value) ||
    (extractYear(innerValueRight.value) == currYear.value &&
      rightId.value == i.id)
  );
};
const rightFn = (i) => {
  return (
    (leftId.value == i.id &&
      extractYear(innerValueLeft.value) == currYear.value + 1) ||
    (extractYear(innerValueRight.value) == currYear.value + 1 &&
      rightId.value == i.id) ||
    (rightId.value == i.id && !innerValueLeft.value && !innerValueRight.value)
  );
};

const rightFns = (i) => {
  return (
    (leftId.value == i.id &&
      extractYear(innerValueLeft.value) == currYear.value + 1) ||
    (extractYear(innerValueRight.value) == currYear.value + 1 &&
      rightId.value == i.id)
  );
};

const visible = ref(false);
const currYear = ref("");
const currYearTs = ref("");
const quartlist = ref([
  {
    label: "第1季度",
    id: 1,
    color: "var(--el-datepicker-text-color)",
  },
  {
    label: "第2季度",
    id: 2,
    color: "var(--el-datepicker-text-color)",
  },
  {
    label: "第3季度",
    id: 3,
    color: "var(--el-datepicker-text-color)",
  },
  {
    label: "第4季度",
    id: 4,
    color: "var(--el-datepicker-text-color)",
  },
]);

const currQuart = ref({});
const currQuartLeft = ref({});
const currQuartRight = ref({});
const innerValueLeft = ref("");
const innerValueRight = ref("");
const leftId = ref("");
const rightId = ref("");

currQuart.value = quartlist.value[0];

const getCurrYear = () => {
  let date = new Date();
  currYear.value = date.getFullYear();
  currYearTs.value = date.getFullYear();
};

getCurrYear();

// 获取现在的年份季度

function getCurrQuarter() {
  const now = new Date();
  const month = now.getMonth() + 1; // 月份从 0 开始计数，需要加 1
  let index = 0;
  if (month <= 3) {
    index = 0;
  } else if (month <= 6) {
    index = 1;
  } else if (month <= 9) {
    index = 2;
  } else {
    index = 3;
  }
  // 高亮当前季度
  quartlist.value[index].color = "var(--el-color-primary)";
  leftId.value = quartlist.value[index].id;
}

getCurrQuarter();

// const startDate = ref(["-01-01", "-04-01", "-07-01", "-10-01"]);
// const endDate = ref(["-03-31", "-06-30", "-09-30", "-12-31"]);
const startDate = ref(["-01", "-04", "-07", "-10"]);
const endDate = ref(["-03", "-06", "-09", "-12"]);
// 可以根据传来的默认日期 进行回显 自行拓展
// const setCurrQuart = ()=>{
//   console.log(innerValue.value);
// }
// setCurrQuart()

const inputRef = ref(null);

const inputFocus = () => {
  inputRef.value?.focus();
};

defineExpose({
  inputFocus,
});

const nextYear = () => {
  // 获取焦点防止丢失焦点隐藏
  inputFocus();
  let year = new Date(new Date().setFullYear(currYear.value + 1)).getFullYear();
  currYear.value = year;
  innerValue.value = currYear.value + "-" + currQuart.value.label;
  let emitDate = {
    startDate: currYear.value + startDate.value[currQuart.value.id - 1],
    endDate: currYear.value + endDate.value[currQuart.value.id - 1],
  };
  emit("change", emitDate);
};

const preYear = () => {
  inputFocus();
  let year = new Date(new Date().setFullYear(currYear.value - 1)).getFullYear();
  currYear.value = year;
  innerValue.value = currYear.value + "-" + currQuart.value.label;
  let emitDate = {
    startDate: currYear.value + startDate.value[currQuart.value.id - 1],
    endDate: currYear.value + endDate.value[currQuart.value.id - 1],
  };
  emit("change", emitDate);
};

function getCurrQuarters() {
  const now = new Date();
  const month = now.getMonth() + 1; // 月份从 0 开始计数，需要加 1
  let index = 0;
  if (month <= 3) {
    index = 0;
  } else if (month <= 6) {
    index = 1;
  } else if (month <= 9) {
    index = 2;
  } else {
    index = 3;
  }
  return quartlist.value[index].id;
}

// 更新年份并处理选中状态的通用函数
const updateYearsAndSelection = (newYear) => {
  inputFocus();
  currYear.value = newYear;
  if (!innerValueLeft.value && !innerValueRight.value) {
    const currentYear = new Date().getFullYear();
    if (currYear.value === currentYear) {
      leftId.value = getCurrQuarters();
      rightId.value = "";
    } else if (currYear.value + 1 === currentYear) {
      rightId.value = getCurrQuarters();
      leftId.value = "";
    } else {
      leftId.value = "";
      rightId.value = "";
    }
    return;
  }
  // 处理已选择的情况
  handleSelectedQuarters();
};

// 处理已选择季度的逻辑
const handleSelectedQuarters = () => {
  const leftYear = extractYear(innerValueLeft.value);
  const rightYear = extractYear(innerValueRight.value);

  // 重置选中状态
  // 如果左右都未选择，则根据当前年份设置默认选中
  if (innerValueLeft.value && innerValueRight.value) {
    // 左右都已选择
    leftId.value = currQuartLeft.value?.id;
    rightId.value = currQuartRight.value?.id;
  } else if (innerValueLeft.value && !innerValueRight.value) {
    leftId.value = currQuartLeft.value?.id;
  } else if (!innerValueLeft.value && innerValueRight.value) {
    rightId.value = currQuartRight.value?.id;
  }
};

const nextYears = () => {
  const newYear = new Date(
    new Date().setFullYear(currYear.value + 1)
  ).getFullYear();
  updateYearsAndSelection(newYear);
};

const preYears = () => {
  const newYear = new Date(
    new Date().setFullYear(currYear.value - 1)
  ).getFullYear();
  updateYearsAndSelection(newYear);
};

const handleQuart = (item) => {
  quartlist.value.forEach((v) => {
    v.color = "var(--el-datepicker-text-color)";
    if (v.id == item.id) {
      v.color = "var(--el-color-primary)";
    }
  });
  currQuart.value = item;
  let emitDate = {
    startDate: currYear.value + startDate.value[currQuart.value.id - 1],
    endDate: currYear.value + endDate.value[currQuart.value.id - 1],
  };

  innerValue.value = currYear.value + "-" + currQuart.value.label;
  emit("change", emitDate);

  nextTick(() => {
    visible.value = false;
  });
};

const handleQuartLeft = (item) => {
  // 情况1: 左右都未选择 - 直接选择左侧
  if (!innerValueLeft.value && !innerValueRight.value) {
    leftId.value = item.id;
    currQuartLeft.value = item;
    innerValueLeft.value = currYear.value + "-" + currQuartLeft.value.label;
  }
  // 情况2: 左右都已选择 - 重新开始选择范围
  else if (innerValueLeft.value && innerValueRight.value) {
    // 无论点击哪个年份区域，都重新开始选择
    leftId.value = item.id;
    currQuartLeft.value = item;
    innerValueLeft.value = currYear.value + "-" + currQuartLeft.value.label;

    // 清空右侧选择
    rightId.value = "";
    currQuartRight.value = {};
    innerValueRight.value = "";
  }
  // 情况3: 只选择了左侧
  else if (innerValueLeft.value && !innerValueRight.value) {
    const leftYear = extractYear(innerValueLeft.value);

    if (currYear.value === leftYear) {
      if (item.id < leftId.value) {
        rightId.value = currQuartLeft.value.id;
        currQuartRight.value = currQuartLeft.value;
        innerValueRight.value = innerValueLeft.value;
        leftId.value = item.id;
        currQuartLeft.value = item;
        innerValueLeft.value = currYear.value + "-" + currQuartLeft.value.label;
      } else if (item.id == leftId.value) {
      } else {
        rightId.value = item.id;
        currQuartRight.value = item;
        innerValueRight.value =
          currYear.value + "-" + currQuartRight.value.label;
      }
    } else if (currYear.value < leftYear) {
      // 更新左侧选择
      rightId.value = currQuartLeft.value.id;
      currQuartRight.value = currQuartLeft.value;
      innerValueRight.value = innerValueLeft.value;
      leftId.value = item.id;
      currQuartLeft.value = item;
      innerValueLeft.value = currYear.value + "-" + currQuartLeft.value.label;
    } else {
      rightId.value = item.id;
      currQuartRight.value = item;
      innerValueRight.value = currYear.value + "-" + currQuartRight.value.label;
    }
  }
  // 情况4: 只选择了右侧
  else if (!innerValueLeft.value && innerValueRight.value) {
    const rightYear = extractYear(innerValueRight.value);

    if (currYear.value === rightYear) {
      // 如果点击的季度小于等于右侧季度
      if (item.id < currQuartRight.value.id) {
        leftId.value = item.id;
        currQuartLeft.value = item;
        innerValueLeft.value = currYear.value + "-" + currQuartLeft.value.label;
      }
      // 否则更新为左侧选择（在当前年份）
      else if (item.id == currQuartRight.value.id) {
      } else {
        leftId.value = currQuartRight.value.id;
        currQuartLeft.value = currQuartRight.value;
        innerValueLeft.value = innerValueRight.value;
        rightId.value = item.id;
        currQuartRight.value = item;
        innerValueRight.value =
          currYear.value + "-" + currQuartRight.value.label;
      }
    }
    // 如果点击下一年区域
    else if (currYear.value < rightYear) {
      leftId.value = item.id;
      currQuartLeft.value = item;
      innerValueLeft.value = currYear.value + "-" + currQuartLeft.value.label;
    } else {
      leftId.value = currQuartRight.value.id;
      currQuartLeft.value = currQuartRight.value;
      innerValueLeft.value = innerValueRight.value;
      rightId.value = item.id;
      currQuartRight.value = item;
      innerValueRight.value = currYear.value + "-" + currQuartRight.value.label;
    }
  }
  if (innerValueLeft.value && innerValueRight.value) {
    // 更新整体值
    innerValue.value = innerValueLeft.value + "-" + innerValueRight.value;
  }

  nextTick(() => {
    // 当左右都选择完成时，发送变更事件并关闭弹窗
    if (innerValueLeft.value && innerValueRight.value) {
      const leftYear = extractYear(innerValueLeft.value);
      const rightYear = extractYear(innerValueRight.value);

      const emitDate = {
        startDate: leftYear + startDate.value[currQuartLeft.value.id - 1],
        endDate: rightYear + endDate.value[currQuartRight.value.id - 1],
      };
      emit("change", emitDate);
    }
  });
};

const handleQuartRight = (item) => {
  // 情况1: 左右都未选择 - 将选择转换为左侧选择
  if (!innerValueLeft.value && !innerValueRight.value) {
    rightId.value = item.id;
    currQuartRight.value = item;
    innerValueRight.value =
      currYear.value + 1 + "-" + currQuartRight.value.label;
  }
  // 情况2: 左右都已选择 - 更新右侧选择
  else if (innerValueLeft.value && innerValueRight.value) {
    rightId.value = item.id;
    currQuartRight.value = item;
    innerValueRight.value =
      currYear.value + 1 + "-" + currQuartRight.value.label;

    // 清空右侧选择
    leftId.value = "";
    currQuartLeft.value = {};
    innerValueLeft.value = "";
  }
  // 情况3: 只选择了左侧
  else if (innerValueLeft.value && !innerValueRight.value) {
    const leftYear = extractYear(innerValueLeft.value);

    // 如果左侧在当前年份
    if (currYear.value + 1 === leftYear) {
      if (item.id < leftId.value) {
        rightId.value = currQuartLeft.value.id;
        currQuartRight.value = currQuartLeft.value;
        innerValueRight.value = innerValueLeft.value;
        leftId.value = item.id;
        currQuartLeft.value = item;
        innerValueLeft.value =
          currYear.value + 1 + "-" + currQuartLeft.value.label;
      } else if (item.id == leftId.value) {
      } else {
        rightId.value = item.id;
        currQuartRight.value = item;
        innerValueRight.value =
          currYear.value + 1 + "-" + currQuartRight.value.label;
      }
    } else if (currYear.value + 1 < leftYear) {
      // 更新左侧选择
      rightId.value = currQuartLeft.value.id;
      currQuartRight.value = currQuartLeft.value;
      innerValueRight.value = innerValueLeft.value;
      leftId.value = item.id;
      currQuartLeft.value = item;
      innerValueLeft.value =
        currYear.value + 1 + "-" + currQuartLeft.value.label;
    } else {
      rightId.value = item.id;
      currQuartRight.value = item;
      innerValueRight.value =
        currYear.value + 1 + "-" + currQuartRight.value.label;
    }
  }
  // 情况4: 只选择了右侧
  else if (!innerValueLeft.value && innerValueRight.value) {
    const rightYear = extractYear(innerValueRight.value);

    if (currYear.value + 1 === rightYear) {
      // 如果点击的季度小于等于右侧季度
      if (item.id < currQuartRight.value.id) {
        leftId.value = item.id;
        currQuartLeft.value = item;
        innerValueLeft.value =
          currYear.value + 1 + "-" + currQuartLeft.value.label;
      }
      // 否则更新为左侧选择（在当前年份）
      else if (item.id == currQuartRight.value.id) {
      } else {
        leftId.value = currQuartRight.value.id;
        currQuartLeft.value = currQuartRight.value;
        innerValueLeft.value = innerValueRight.value;
        rightId.value = item.id;
        currQuartRight.value = item;
        innerValueRight.value =
          currYear.value + 1 + "-" + currQuartRight.value.label;
      }
    } else if (currYear.value < rightYear) {
      // 更新为左侧选择（在下一年）
      leftId.value = item.id;
      currQuartLeft.value = item;
      innerValueLeft.value =
        currYear.value + 1 + "-" + currQuartLeft.value.label;
    } else {
      leftId.value = currQuartRight.value.id;
      currQuartLeft.value = currQuartRight.value;
      innerValueLeft.value = innerValueRight.value;
      rightId.value = item.id;
      currQuartRight.value = item;
      innerValueRight.value =
        currYear.value + 1 + "-" + currQuartRight.value.label;
    }
  }

  if (innerValueLeft.value && innerValueRight.value) {
    // 更新整体值
    innerValue.value = innerValueLeft.value + "-" + innerValueRight.value;
  }

  nextTick(() => {
    // 当左右都选择完成时，发送变更事件并关闭弹窗
    if (innerValueLeft.value && innerValueRight.value) {
      const leftYear = extractYear(innerValueLeft.value);
      const rightYear = extractYear(innerValueRight.value);

      const emitDate = {
        startDate: leftYear + startDate.value[currQuartLeft.value.id - 1],
        endDate: rightYear + endDate.value[currQuartRight.value.id - 1],
      };
      emit("change", emitDate);
    }
  });
};
const clearVisble = ref(false);

const clear = () => {
  innerValue.value = "";
  let emitDate = {
    startDate: "",
    endDate: "",
  };
  emit("change", emitDate);
};

const onFocus = () => {
  visible.value = true;
  if(innerValue.value && typeof innerValue.value === 'string' && props.datePickerType == 'quarterrange'){
    const numbers = innerValue.value.match(/\d+/g)
    leftId.value = numbers[1]
    rightId.value = numbers[3]
    const match = innerValue.value.match(/^(\d+-第\d季度)-(\d+-第\d季度)$/);
    if (match) {
      let firstQuarter = match[1];  // "2025-第2季度"
      let secondQuarter = match[2]; // "2025-第3季度"
      console.log(firstQuarter, secondQuarter);
      innerValueLeft.value = firstQuarter;
      innerValueRight.value = secondQuarter;
    }
    
    currQuartLeft.value = quartlist.value.find((item) => item.id == leftId.value);
    currQuartRight.value = quartlist.value.find((item) => item.id == rightId.value);
  }
};

const onBlur = () => {
  visible.value = false;
};

const onBlurs = () => {
  visible.value = false;
};
const handleFocus = () => {
  console.log("handleFocus");
  visible.value = true;
};

const handleBlur = () => {
  console.log("handleBlur");
  visible.value = false;
};

watch(
  () => innerValue.value,
  (val) => {
    // 内容不为空时显示清除
    nextTick(() => {
      clearVisble.value = !!val;
    });
  }
);
</script>

<style scoped>
.el-quarter-picker {
  display: inline-block;
}

.top-box {
  font-size: 16px;
  cursor: pointer;
  display: flex;
  padding-bottom: 12px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.top-boxs {
  font-size: 16px;
  cursor: pointer;
  display: flex;
  padding-bottom: 12px;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;
}

.left-icon {
  position: absolute;
  left: 0;
}

.right-icon {
  position: absolute;
  right: 0;
}

.content-box {
  width: 100%;
  height: 100px;
  display: flex;
  padding-top: 12px;
  flex-wrap: wrap;
}

.content-box > div {
  width: 148px;
  height: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.content-box > div:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.content-box {
  width: 100%;
  height: 100px;
  display: flex;
  padding-top: 12px;
  flex-wrap: wrap;
}

.content-box > div {
  width: 148px;
  height: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>