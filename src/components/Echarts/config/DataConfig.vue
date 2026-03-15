<!-- 字体配置组件 -->
<template>
  <el-form :model="config" label-width="120px">
    <el-row :gutter="24">
      <el-col :span="24">
        <el-form-item label="数据来源：" class="config-item full-width">
          <el-select
            v-model="config.dsType"
            placeholder="请选择数据来源"
            class="full-width"
            clearable
          >
            <el-option label="SQL查询" value="SQL" />
            <el-option label="API接口" value="API" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item  :label="`${config.dsType === 'API' ? '接口路径：' : '查询语句：'}`" class="config-item full-width">
          <el-input
            v-model="config.dsConfig"
            type="textarea"
            :rows="4"
            resize="none"
            placeholder="请输入SQL查询语句或API配置"
            class="code-input full-width"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <configBtn @click="addConfig()"> 添加 </configBtn>
        <el-table
            :data="config.designChartConfigList"
            border
            :header-row-style="{ 'text-align': 'center !important' }"
            class="headerTable"
        >
          <el-table-column label="描述" width="120">
            <template #default="{ row, index }">
              <el-select
                v-model="row.chartType"
                placeholder=""
                @change="changeChartType(row, index)"
                clearable
              >
                <el-option label="分类" value="category" />
                <el-option label="值" value="value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字段值">
            <template #default="{ row }">
              <el-input v-model="row.field" placeholder="请输入字段值" clearable />
            </template>
          </el-table-column>
          <el-table-column label="字段名称">
            <template #default="{ row }">
              <el-input v-model="row.fieldName" placeholder="请输入字段名称" clearable />
            </template>
          </el-table-column>
          <el-table-column label="图表类型(柱形图)">
            <template #default="{ row, index }">
            <el-select
                v-model="row.barChartType"
                placeholder=""
                clearable
              >
                <el-option label="折线" value="line" />
                <el-option label="柱形" value="bar" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="格式化">
            <template #default="{ row }">
              <el-input v-model="row.dataFormat" placeholder="请输入格式化方式" clearable />
            </template>
          </el-table-column>
          <el-table-column label="是否排序" width="120">
            <template #default="{ row, index }">
              <el-select
                v-model="row.sortType"
                placeholder=""
                clearable
              >
                <el-option label="正序" value="1" />
                <el-option label="倒序" value="-1" />
                <el-option label="不排序" value="0" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ $index }">
              <el-button
                type="danger"
                size="small"
                @click="deleteConfig($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="24" >
        <el-form-item label="需要标签：" class="config-item full-width">
          <el-switch v-model="config.NeedTags" />
        </el-form-item>
      </el-col>
      <el-col :span="24" v-if="config.NeedTags">
        <configBtn @click="addtag()"> 添加 </configBtn>
        <el-table
          :data="config.tagConfigList"
          border
          :header-row-style="{ 'text-align': 'center !important' }"
          class="headerTable"
        >
        <el-table-column label="标签名称">
            <template #default="{ row }">
              <el-input v-model="row.tagName" placeholder="请输入" clearable />
            </template>
          </el-table-column>
          <el-table-column label="标签值">
            <template #default="{ row }">
              <el-input v-model="row.tagValue" placeholder="请输入" clearable />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ $index }">
              <el-button
                type="danger"
                size="small"
                @click="deleteTags($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { computed } from "vue";
import configBtn from "@/components/element/Confirm.vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const addConfig = () => {
  if (config.value && config.value.designChartConfigList) {
    // 创建新数组，避免直接修改原数组
    const newList = [...config.value.designChartConfigList];
    newList.push({
      field: "",
      fieldName: "",
      chartType: "value",
      dataFormat: "",
      barChartType: "",
    });
    // 更新数据
    config.value.designChartConfigList = newList;
  }
};

// 添加删除方法
const deleteConfig = (index) => {
  if (config.value && config.value.designChartConfigList) {
    // 创建新数组，避免直接修改原数组
    const newList = [...config.value.designChartConfigList];
    // 删除指定索引的项
    newList.splice(index, 1);
    // 更新数据
    config.value.designChartConfigList = newList;
  }
};

const changeChartType = (row) => {
  // 检查是否将当前行改为category类型
  // if (row.chartType === "category") {
  //   // 确保config和designChartConfigList存在
  //   if (config.value && config.value.designChartConfigList) {
  //     // 遍历数组，将其他所有category类型改为value
  //     config.value.designChartConfigList.forEach((item) => {
  //       // 排除当前行
  //       if (item !== row && item.chartType === "category") {
  //         item.chartType = "value";
  //       }
  //     });
  //   }
  // }
};

const addtag = () => {
  if (config.value) {
    // 确保 tagConfigList 存在
    if (!config.value.tagConfigList) {
      config.value.tagConfigList = [];
    }

    // 创建新数组，避免直接修改原数组
    const newList = [...config.value.tagConfigList];
    // 添加标签数据结构
    newList.push({
      tagName: "",
      tagValue: ""
    });
    // 更新数据
    config.value.tagConfigList = newList;
  }
};

// 为标签切换部分删除功能添加的新方法
const deleteTags = (index) => {
  if (config.value && config.value.tagConfigList) {
    // 创建新数组，避免直接修改原数组
    const newList = [...config.value.tagConfigList];
    // 删除指定索引的项
    newList.splice(index, 1);
    // 更新数据
    config.value.tagConfigList = newList;
  }
};

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>
