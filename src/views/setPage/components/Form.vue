<template>
  <div class="dynamic-form">
    <el-form
      ref="formRef"
      :model="formData"
      :label-position="config.labelPosition || 'left'"
      :label-width="config.bind.labelWidth || ''"
      :inline="config.bind.isInline || true"
      class="form-container"
    >
      <!-- 动态生成表单字段 -->
      <template
        v-for="(field, index) in config.bind.items"
        :key="field.key || index"
      >
        <el-form-item
          :label="field.label"
          :prop="field.prop"
          :required="field.isValidate"
        >
          <div
            v-if="field.component === 'el-radio-date'"
            style="
              display: flex;
              align-items: center;
              gap: 10px;
              flex-wrap: wrap;
            "
          >
            <el-radio-group
              v-model="checkValue"
              @change="handleChange(field.prop)"
            >
              <el-radio
                :value="item.value"
                v-for="item in timeType"
                :key="item.value"
                v-show="field?.defaultType.includes(item.value)"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <!-- 时间选择组件 -->
            <el-date-picker
              :disabled="!checkValue"
              v-if="
                field.component === 'el-radio-date' && checkValue !== 'quarter'
              "
              v-model="formData[field.prop]"
              :type="getTimePickerType(checkValue)"
              :placeholder="`请选择${getPeriodText(checkValue)}`"
              style="flex: 1; min-width: 200px"
              :format="formDataShow()"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledDate"
            ></el-date-picker>
            <QuarterPicker
              v-model="formData[field.prop]"
              v-else
            ></QuarterPicker>
          </div>

          <!-- 下拉选择组件 -->
          <el-select
            v-else-if="field.component === 'el-select'"
            v-model="formData[field.prop]"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="option in field.options || []"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <!-- 文本输入组件 -->
          <el-input
            v-else-if="field.component === 'input'"
            v-model="formData[field.prop]"
            :placeholder="`请输入${field.label}`"
          />

          <!-- 开关组件 -->
          <el-switch
            v-else-if="field.component === 'switch'"
            v-model="formData[field.prop]"
          />

          <!-- 单选框组件 -->
          <el-radio-group
            v-else-if="field.component === 'radio'"
            v-model="formData[field.prop]"
          >
            <el-radio
              v-for="option in field.options || []"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>

          <!-- 多选框组件 -->
          <el-checkbox-group
            v-else-if="field.component === 'checkbox'"
            v-model="formData[field.prop]"
          >
            <el-checkbox
              v-for="option in field.options || []"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </template>
      <el-form-item v-if="config.showButtons !== false">
        <conFirm @click="handleSubmit">
          <el-icon style="margin-right: 8px">
            <Search />
          </el-icon>
          {{ config.bind.saveText || "保存" }}
        </conFirm>
        <canCel @click="handleCancel" v-if="config.showCancel !== false">
          <el-icon style="margin-right: 8px">
            <RefreshLeft />
          </el-icon>
          {{ config.bind.cancleText || "取消" }}
        </canCel>
      </el-form-item>
    </el-form>
    <div>
      <conFirm @click="handleExport" v-if="props.btnType == '1'">
        <el-icon>
          <UploadFilled />
        </el-icon>
        导出
      </conFirm>
    </div>
  </div>
</template>

<script setup>
import canCel from "./CancelButton.vue";
import conFirm from "./ConfirmButton.vue";
import { ref, watch, onMounted, computed } from "vue";
import QuarterPicker from "./QuarterPicker.vue";
// 组件配置参数
const props = defineProps({
  // 组件配置
  config: {
    type: Object,
    default: () => ({}),
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false,
  },
  // 搜索参数
  searchParams: {
    type: Object,
    default: () => ({}),
  },
  // 分页信息
  pagination: {
    type: Object,
    default: () => ({
      pageNum: 1,
      pageSize: 10,
      total: 0,
    }),
  },
  // 按钮类型
  btnType: {
    type: String,
    default: "1",
  },
});

// 表单数据
const formData = ref({});
// 表单引用
const formRef = ref(null);

const checkValue = ref();

const timeType = ref([
  {
    label: "年",
    value: "year",
  },
  {
    label: "季",
    value: "quarter",
  },
  {
    label: "月",
    value: "months",
  },
  {
    label: "日",
    value: "date",
  },
]);
// 根据radio值获取时间选择器类型
const getTimePickerType = (value) => {
  switch (value) {
    case "year": // 年
      return "yearrange";
    case "quarter": // 季
      return "year";
    case "months": // 月
      return "monthrange";
    case "date": // 日
      return "daterange";
    default:
      return "month";
  }
};

// 根据radio值获取时间段文本
const getPeriodText = (value) => {
  switch (value) {
    case "year": // 年
      return "年份";
    case "quarter": // 季
      return "季度";
    case "months": // 月
      return "月份";
    case "date": // 日
      return "日期";
    default:
      return "时间";
  }
};

// 获取当前时间的默认值
// 返回格式根据 timeType 不同：
// - year   → [start, end]
// - months → [start, end]
// - date   → [start, end]
// - quarter→ ""（交由 QuarterPicker 自己初始化当前季度）
const getDefaultTimeValue = (timeType) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();
  const pad2 = (n) => String(n).padStart(2, "0");

  switch (timeType) {
    case "year": {
      // 当前整年
      const start = `${year}-01-01 00:00:00`;
      const end = `${year}-12-31 23:59:59`;
      return [start, end];
    }
    case "months": {
      // 当前整月
      const start = `${year}-${pad2(month + 1)}-01 00:00:00`;
      const monthEndDate = new Date(year, month + 1, 0);
      const endDay = monthEndDate.getDate();
      const end = `${year}-${pad2(month + 1)}-${pad2(endDay)} 23:59:59`;
      return [start, end];
    }
    case "date": {
      // 当前这一天
      const dateStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const start = `${dateStr} 00:00:00`;
      const end = `${dateStr} 23:59:59`;
      return [start, end];
    }
    case "quarter": {
      // 让 QuarterPicker 自己在 onMounted 中初始化当前季度
      return "";
    }
    default:
      return "";
  }
};

const formDataShow = () => {
  switch (checkValue.value) {
    case "year": // 年
      return "YYYY";
    case "quarter": // 季
      return "YYYY" + "第一季度";
    case "months": // 月
      return "YYYY-MM";
    case "date": // 日
      return "YYYY-MM-DD";
    default:
      return "YYYY-MM-DD";
  }
};

// 时间禁用规则
// - 选择年（year）：不能选择「今年之后」的年份
// - 选择月（months）：不能选择「当前月之后」的月份
// - 选择日（date）：不能选择「今天之后」的日期
const disabledDate = (time) => {
  if (!checkValue.value) return false;

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth(); // 0-11
  const todayEnd = new Date(
    nowYear,
    nowMonth,
    now.getDate(),
    23,
    59,
    59,
    999,
  ).getTime();

  switch (checkValue.value) {
    case "year":
      // 年：禁用大于当前年的年份
      return time.getFullYear() > nowYear;
    case "months":
      // 月：禁用「当前年之后」的所有月份，
      // 以及「当前年中当前月之后」的月份
      return (
        time.getFullYear() > nowYear ||
        (time.getFullYear() === nowYear && time.getMonth() > nowMonth)
      );
    case "date":
      // 日：禁用今天之后的日期
      return time.getTime() > todayEnd;
    default:
      return false;
  }
};
// 初始化时间字段默认值
const initTimeFields = () => {
  // 初始化 STARTDATE 和 ENDDATE 为空字符串
  formData.value.STARTDATE = "";
  formData.value.ENDDATE = "";

  // 设置默认时间值为当前年
  if (props.config.bind && props.config.bind.items) {
    props.config.bind.items.forEach((field) => {
      if (field.component === "el-radio-date") {
        checkValue.value = field.defaultType?.[0] || "year";
        formData.value[field.prop] = getDefaultTimeValue(checkValue.value);
      }
    });
  }
};

watch(
  () => formData.value,
  () => {
    console.log(formData.value, "formData.value");

    let field = props.config.bind.items.find(
      (item) => item.component === "el-radio-date",
    );
    if (formData.value[field.prop] == "") {
      props.searchParams.STARTDATE = "";
      props.searchParams.ENDDATE = "";
      return;
    }
    const { startDate, endDate } = generateTimeRange(
      formData.value[field.prop],
      checkValue.value,
    );
    formData.value.STARTDATE = startDate;
    formData.value.ENDDATE = endDate;
    props.searchParams.STARTDATE = startDate;
    props.searchParams.ENDDATE = endDate;
  },
  {
    deep: true,
  },
);
initTimeFields();

// 事件
const emit = defineEmits([
  "handleSearch",
  "submit",
  "cancel",
  "handleSubmit",
  "export",
]);

// 生成时间范围
// dateValue 的格式：
// - year:   ['2022-02-04 16:10:54', '2035-02-04 16:10:55']
// - months: ['2026-03-01 00:00:00', '2027-06-01 00:00:00']
// - date:   ['2026-02-04 00:00:00', '2026-03-03 00:00:00']
// - quarter: { STARTDATE: '2026-01-01 00:00:00', ENDDATE: '2026-03-31 23:59:59' }（由 QuarterPicker 返回）
const generateTimeRange = (dateValue, timeType) => {
  let startDate, endDate;

  switch (timeType) {
    case "year": {
      // 年度范围：取数组两端的年份，拼成整年的起止时间
      const [start, end] = dateValue || [];
      if (!start || !end) return { startDate: "", endDate: "" };
      const startYear = new Date(start).getFullYear();
      const endYear = new Date(end).getFullYear();
      startDate = `${startYear}-01-01 00:00:00`;
      endDate = `${endYear}-12-31 23:59:59`;
      break;
    }
    case "quarter": {
      // 季度：QuarterPicker 已经返回 STARTDATE / ENDDATE
      if (!dateValue || !dateValue.STARTDATE || !dateValue.ENDDATE) {
        return { startDate: "", endDate: "" };
      }
      startDate = dateValue.STARTDATE;
      endDate = dateValue.ENDDATE;
      break;
    }
    case "months": {
      // 月度范围：数组两端为每月的 1 号，拼成整月起止时间
      const [start, end] = dateValue || [];
      if (!start || !end) return { startDate: "", endDate: "" };

      const startDateObj = new Date(start);
      const endDateObj = new Date(end);

      const startYear = startDateObj.getFullYear();
      const startMonth = startDateObj.getMonth() + 1;

      const endYear = endDateObj.getFullYear();
      const endMonth = endDateObj.getMonth() + 1;

      // 起始月：该月 1 号 00:00:00
      startDate = `${startYear}-${String(startMonth).padStart(2, "0")}-01 00:00:00`;
      // 结束月：该月最后一天 23:59:59
      const monthEndDate = new Date(endYear, endMonth, 0); // 下月第 0 天 = 本月最后一天
      const monthEndDay = monthEndDate.getDate();
      endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-${String(
        monthEndDay,
      ).padStart(2, "0")} 23:59:59`;
      break;
    }
    case "date": {
      // 日范围：直接取数组首尾日期，起为 00:00:00，止为 23:59:59
      const [start, end] = dateValue || [];
      if (!start || !end) return { startDate: "", endDate: "" };

      const startStr = start.split(" ")[0];
      const endStr = end.split(" ")[0];

      startDate = `${startStr} 00:00:00`;
      endDate = `${endStr} 23:59:59`;
      break;
    }
    default: {
      return { startDate: "", endDate: "" };
    }
  }

  return { startDate, endDate };
};

const handleChange = (value) => {
  formData.value[value] = "";
};
// 提交表单
const handleSubmit = async () => {
  if (formRef.value) {
    try {
      await formRef.value.validate();
      // 触发搜索事件，传递搜索参数给父组件
      emit("handleSearch");
    } catch (error) {
      console.error("表单验证失败:", error);
      // 验证失败，不触发搜索
    }
  } else {
    emit("handleSearch");
  }
};

//导出
const handleExport = () => {
  emit("export");
};

// 取消操作
const handleCancel = () => {
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 清空所有字段
  Object.keys(formData.value).forEach((key) => {
    formData.value[key] = "";
  });
  checkValue.value = "";
  props.pagination.pageNum = 1;
  props.pagination.pageSize = 10;
  // 重新初始化时间字段默认值
  emit("handleSearch");
  // 触发取消事件
};

onMounted(() => {
  handleSubmit();
});
</script>

<style scoped lang="scss">
.dynamic-form {
  border: 1px solid #e3e3e3;
  padding: 0 1%;
  height: 100%;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 4px;
}

.form-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  text-align: center;
}
.form-container {
  background: #ffffff;
  padding: 20px;
  border-radius: 4px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-form-item__content) {
  min-width: 240px;
}
/* 响应式设计 */
@media screen and (max-width: 768px) {
  .dynamic-form {
    padding: 10px;
  }

  .form-container {
    padding: 15px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .form-actions .el-button {
    width: 100%;
    margin-left: 0 !important;
  }
}
::v-deep(.el-form) {
  padding: 0;
  flex: 1;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
::v-deep(.el-form-item) {
  margin-bottom: 0;
}
::v-deep(.el-date-editor.el-input__wrapper) {
  width: 300px;
}
</style>
