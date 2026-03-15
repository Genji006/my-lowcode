<template>
  <div style="display: flex; align-items: center" class="radio-group-container">
    <el-radio-group
      v-model="dataDefaultType"
      class="radio-group-style"
    >
      <el-radio
        label="year"
        :disabled="!defaultType?.includes('year') && defaultType?.length"
        >年</el-radio
      >
      <el-radio label="quarter" :disabled="!defaultType?.includes('quarter')"
        >季</el-radio
      >
      <el-radio label="months" :disabled="!defaultType?.includes('months')"
        >月</el-radio
      >
    </el-radio-group>
    <el-date-picker
      v-model="dateValue"
      v-bind="attrs"
      type="year"
      placeholder="请选择"
      :align-center="true"
      style="display: flex; align-items: center; margin-left: 10px"
      value-format="YYYY"
      v-if="dataDefaultType == 'year'"
    ></el-date-picker>
    <el-date-picker
      v-model="dateValue"
      v-bind="attrs"
      type="months"
      placeholder="请选择"
      :align-center="true"
      style="display: flex; align-items: center; margin-left: 10px"
      v-if="dataDefaultType == 'months'"
      value-format="YYYY-MM"
      popper-class="el-month-picker-popper-class"
      ref="monthRef"
    >
      <template #prev-year>
        <el-icon @click="preYearChange">
          <DArrowLeft />
        </el-icon>
      </template>
      <template #next-year>
        <el-icon @click="nextYearChange">
          <DArrowRight />
        </el-icon>
      </template>
    </el-date-picker>
    <div class="el-quarter-picker" v-if="dataDefaultType == 'quarter'">
      <el-popover :visible="visible" :width="322" trigger="click">
        <div>
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
        <template #reference>
          <el-input
            v-model="dateValue"
            @focus="onFocus"
            ref="inputRef"
            @blur="onBlur"
            placeholder="请选择"
            :prefix-icon="Calendar"
            :readonly="false"
            style="width: 220px; margin-left: 10px"
          >
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
            <template #suffix>
              <el-icon @click="clear" v-show="clearVisble"
                ><CircleClose
              /></el-icon>
            </template>
          </el-input>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { computed, ref, onMounted, watch, nextTick } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  defaultType: {
    type: Array,
  },
  attrs: {
    type: Object,
  },
});

const emit = defineEmits(["defaultTypeChange", "update:modelValue"]);

const dataDefaultType = ref("");
const dateValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const visible = ref(false);
const currYear = ref("");
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

const dateValueChange = (val) => {
  console.log(val, "value", dataDefaultType.value);
  if(dataDefaultType.value === "year"){
    if(!val){
      dateValue.value = "Y_";
    }
  } else if(dataDefaultType.value === "quarter"){

  } else if(dataDefaultType.value === "months"){
    if(!val || val.length == 0){
      dateValue.value = ['_', '_']
    }
  }
}

const currQuart = ref({});

currQuart.value = quartlist.value[0];

const getCurrYear = () => {
  let date = new Date();
  currYear.value = date.getFullYear();
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
}

getCurrQuarter();

const startDate = ref(["-01-01", "-04-01", "-07-01", "-10-01"]);
const endDate = ref(["-03-31", "-06-30", "-09-30", "-12-31"]);
// const startDate = ref(["-01", "-04", "-07", "-10"]);
// const endDate = ref(["-03", "-06", "-09", "-12"]);
// 可以根据传来的默认日期 进行回显 自行拓展
// const setCurrQuart = ()=>{
//   console.log(dateValue.value);
// }
// setCurrQuart()

const inputRef = ref(null);

const inputFocus = () => {
  inputRef.value?.focus();
};



const nextYear = () => {
  // 获取焦点防止丢失焦点隐藏
  inputFocus();
  let year = new Date(new Date().setFullYear(currYear.value + 1)).getFullYear();
  currYear.value = year;
  dateValue.value = currYear.value + "-" + currQuart.value.label;
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
  dateValue.value = currYear.value + "-" + currQuart.value.label;
  let emitDate = {
    startDate: currYear.value + startDate.value[currQuart.value.id - 1],
    endDate: currYear.value + endDate.value[currQuart.value.id - 1],
  };
  emit("change", emitDate);
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

  dateValue.value = currYear.value + "-" + currQuart.value.label;
  emit("change", emitDate);

  nextTick(() => {
    inputRef.value?.blur();
    visible.value = false;
    console.log(inputRef.value?.blur);
  });
};

const clearVisble = ref(false);
const monthFlag = ref(false);
const monthRef = ref(null);
const clear = () => {
  dateValue.value = "";
  let emitDate = {
    startDate: "",
    endDate: "",
  };
  emit("change", emitDate);
};

const onFocus = () => {
  visible.value = true;
};

const onBlur = () => {
  visible.value = false;
};

watch(
  () => dataDefaultType.value,
  (val) => {
    // 内容不为空时显示清除
    dateValue.value = "";
    if(val == "year"){
      dateValue.value = "Y_";
    } else if(val == "quarter"){
      dateValue.value = ''
    } else if(val == "months"){
      dateValue.value = ['-','-'];
    }
  }
);

watch(
  () => dateValue.value,
  (val) => {
    console.log(val, "value1111", dataDefaultType.value);
    // 内容不为空时显示清除
    if(dataDefaultType.value == "year"){
      if(!val){
        dateValue.value = "Y_";
      }
    }
    if (dataDefaultType.value == "quarter") {
      if(!val || val.length == 0){
        dateValue.value = ''
      }
      nextTick(() => {
        clearVisble.value = !!val;
      });
    }
    if (dataDefaultType.value == "months" && val && val.length > 2) {

      dateValue.value = [dateValue.value[dateValue.value?.length - 1]];
    } else if(dataDefaultType.value == "months" && val && val.length == 2) {
      console.log("val111", val);
      const sortedMonths = [...val].sort((a, b) => {
        // 处理空值情况
        if (!a && !b) return 0;
        if (!a) return -1;
        if (!b) return 1;

        // 将 YYYY-MM 格式的字符串转换为可比较的日期
        const dateA = new Date(a + '-01'); // 补充为 YYYY-MM-DD 格式
        const dateB = new Date(b + '-01');

        return dateA - dateB;
      });

      // 更新排序后的值
      if (JSON.stringify(sortedMonths) !== JSON.stringify(val)) {
        dateValue.value = sortedMonths;
      }
      nextTick(() => {
        monthRef.value?.handleClose();
      });
    } else if(dataDefaultType.value == "months" && ( !val || val.length == 0)){
      console.log("val222", val);
      dateValue.value = ['_', '_']
    }
  },{ immediate: true, deep: true}
);

watch(
  () => props.defaultType,
  (val) => {
    if(props.defaultType?.includes('year')){
      dataDefaultType.value = 'year';
    } else if(props.defaultType?.includes('quarter')){
      dataDefaultType.value = 'quarter';
    } else {
      dataDefaultType.value = 'months';
    }
  },
  { immediate: true, deep: true}
);

const preYearChange = () => {
  dateValue.value = [];
};

const nextYearChange = () => {
  dateValue.value = [];
};


const resetData = () => {
  console.log('重置数据');
  // 重置数据逻辑
  if(props.defaultType?.includes('year')){
    dataDefaultType.value = 'year';
  } else if(props.defaultType?.includes('quarter')){
    dataDefaultType.value = 'quarter';
  } else {
    dataDefaultType.value = 'months';
  }
};


// 暴露方法给父组件
defineExpose({
  resetData,
});

onMounted(() => {

});


</script>

<style lang="scss" scoped>
.el-quarter-picker {
  display: flex;
  align-items: center;
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

<style lang="scss">
.radio-group-style {
  .el-radio.is-disabled {
    background: none !important;
  }
}
.radio-group-container {
  .el-input {
    height: 32px !important;

    .el-input__wrapper{
      height: 32px !important;
    }
  }
}

.el-month-picker-popper-class{
  .el-picker-panel__footer{
    display: none !important;
  }
}
</style>