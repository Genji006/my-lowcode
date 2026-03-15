<template>
  <div class="table-config-panel">
    <!-- 配置分组 -->
    <div class="config-section">
      <div class="section-header">
        <h4>基础配置</h4>
      </div>
      <!-- 使用 el-form 包裹配置项 -->
      <el-form :model="formData" :inline="true" label-width="auto" :rules="formRules" class="config-form">
        <el-form-item label="分页显示：" class="config-items">
          <el-switch v-model="formData.pageOpen" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="序号：" class="config-items">
          <el-switch v-model="formData.showIndex" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="复选框：" class="config-items">
          <el-switch v-model="formData.checkBox" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="高亮行：" class="config-items">
          <el-switch v-model="formData.light" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="显示边框：" class="config-items">
          <el-switch v-model="formData.showBorder" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="展示导出：" class="config-items" prop="exportbtn">
          <el-switch v-model="formData.exportbtn" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="主键字段：" class="config-items" prop="primaryKey">
          <el-input v-model="formData.primaryKey" placeholder="请输入" size="small" />
        </el-form-item>
        <el-form-item label="表格类名：" class="config-items">
          <el-input v-model="formData.ClassName" placeholder="请输入" size="small" />
        </el-form-item>
        <el-form-item label="是否树形：" class="config-items" prop="treeModel">
          <el-switch v-model="formData.treeModel" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="树形顶级：" class="config-items" prop="topColumnValue" v-if="formData.treeModel == '1'">
          <el-input v-model="formData.topColumnValue" placeholder="请输入" size="small" />
        </el-form-item>
        <el-form-item label="树形父级：" class="config-items" prop="parentColumn" v-if="formData.treeModel == '1'">
          <el-input v-model="formData.parentColumn" placeholder="请输入" size="small" />
        </el-form-item>
        <el-form-item label="树形子级：" class="config-items" prop="childColumn" v-if="formData.treeModel == '1'">
          <el-input v-model="formData.childColumn" placeholder="请输入" size="small" />
        </el-form-item>
        <!-- <el-form-item label="点击行：" class="config-items">
          <el-select v-model="formData.rowClickData" placeholder="请选择" style="width: 220px">
            <el-option v-for="item in rowClickDataOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
    </div>

    <!-- 数据源配置 -->
    <div class="config-section">
      <div class="section-header">
        <h4>数据源配置</h4>
      </div>
      <el-form :model="formData" class="config-form">
        <!-- <el-form-item label="查询接口：" class="config-item full-width">
          <el-input v-model="formData.apiUrl" placeholder="请输入" class="code-input full-width" />
        </el-form-item> -->
        <el-form-item label="数据来源：" class="config-item full-width">
          <el-select v-model="formData.dsType" placeholder="请选择数据来源" class="full-width">
            <el-option label="SQL查询" value="SQL" />
            <el-option label="API接口" value="API" />
          </el-select>
        </el-form-item>
        <el-form-item :label="`${formData.dsType === 'API' ? '接口路径：' : '查询语句：'}`" class="config-item full-width">
          <el-input v-model="formData.dsConfig" type="textarea" :rows="4" placeholder="请输入SQL查询语句或API配置" class="code-input full-width">
          </el-input>
        </el-form-item>
        <el-button @click="cereteCode()" type="primary" size="small" class="add-btn" v-if="formData.dsType == 'SQL'">解析SQL</el-button>
      </el-form>
    </div>

    <!-- 表格列配置 -->
    <div class="config-section">
      <div class="section-header">
        <h4>列配置</h4>
        <el-button type="primary" size="small" @click="addColumns" class="add-btn">
          <el-icon>
            <Plus />
          </el-icon>
          添加首列
        </el-button>
        <el-button type="primary" size="small" @click="addColumn" class="add-btn">
          <el-icon>
            <Plus />
          </el-icon>
          添加列
        </el-button>
      </div>
      <div class="table-container">
        <el-table :data="formData.designTableColumns" :preserve-expanded-content="true" indent row-key="idRow" border size="small" class="config-table" @expand-change="onTreeExpandChange" default-expand-all>
          <el-table-column prop="indexId" label="序号" width="60" align="center" />
          <el-table-column label="列字段" width="150" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.columnName" placeholder="字段名" size="small" class="table-input" />
            </template>
          </el-table-column>
          <el-table-column label="列名称" width="150" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.columnLabel" placeholder="显示名称" size="small" class="table-input" />
            </template>
          </el-table-column>
          <el-table-column label="对齐方式" width="120" align="center">
            <template #default="scope">
              <el-select v-model="scope.row.textAlign" placeholder="对齐" size="small">
                <el-option label="左对齐" value="left" />
                <el-option label="居中" value="center" />
                <el-option label="右对齐" value="right" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="列宽" width="100" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.columnWidth" placeholder="宽度" size="small" class="table-input" />
            </template>
          </el-table-column>
          <el-table-column label="数据别名" width="150" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.columnDataSourceName" placeholder="英文别名" size="small" class="table-input" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="200">
            <template #default="scope">
              <div class="action-buttons" style="gap: 0px">
                <el-button type="text" size="small" @click="moveUp(scope.$index, scope.row)" class="action-btn">
                  上移
                </el-button>
                <el-button type="text" size="small" @click="moveDown(scope.$index, scope.row, scope)" class="action-btn">
                  下移
                </el-button>
                <el-button type="text" size="small" @click="toggleRow(scope.row, $event)" class="action-btn">
                  详情
                </el-button>
                <el-button type="text" size="small" @click="handAdd(scope.row)" class="action-btn">
                  子级
                </el-button>
                <el-button type="text" size="small" @click="handleDel(scope.row, scope.$index)" class="action-btn delete">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 动态渲染子表格 -->
        <template v-if="currentRow">
          <teleport :to="`tr.gas-add-tr .expand-content`">
            <div style="padding: 10px 5px; background: #f9f9f9; min-height: 60px">
              <el-form :model="currentRow" size="small" :inline="true" label-width="auto">
                <el-form-item label="对齐方式：" style="width: 40%">
                  <el-select v-model="currentRow.textAlign" placeholder="对齐" clearable>
                    <el-option label="左对齐" value="left" />
                    <el-option label="居中" value="center" />
                    <el-option label="右对齐" value="right" />
                  </el-select>
                </el-form-item>
                <!-- <el-form-item label="列宽：" style="width: 40%">
                  <el-input v-model="currentRow.columnWidth" placeholder="请输入" clearable />
                </el-form-item> -->
                <el-form-item label="类型：" style="width: 40%">
                  <el-select v-model="currentRow.fieldFormat" placeholder="请选择" clearable @change="changeFormat(currentRow)">
                    <el-option label="小数" value="number" />
                    <el-option label="文本" value="string" />
                    <el-option label="百分数" value="percent" />
                    <el-option label="千分数" value="thousandpercent" />
                    <el-option label="万分数" value="wanpercent" />
                  </el-select>
                </el-form-item>
                <el-form-item label="保留位数：" style="width: 40%" v-if="
                  currentRow.fieldFormat == 'number' ||
                  currentRow.fieldFormat == 'percent' ||
                  currentRow.fieldFormat == 'thousandpercent' ||
                  currentRow.fieldFormat == 'wanpercent'
                ">
                  <el-input v-model="currentRow.digit" placeholder="请输入" clearable />
                </el-form-item>
                <el-form-item label="是否点击：" style="width: 40%">
                  <el-select v-model="currentRow.isClick" placeholder="请选择" clearable>
                    <el-option label="是" value="1" />
                    <el-option label="否" value="0" />
                  </el-select>
                </el-form-item>
                <el-form-item label="点击类型：" style="width: 40%" v-if="currentRow.isClick == '1'">
                  <el-select v-model="currentRow.clickType" placeholder="请选择" clearable>
                    <el-option label="跳转" value="1" />
                    <el-option label="抽屉" value="2" />
                    <el-option label="弹窗" value="3" />
                  </el-select>
                </el-form-item>
                <el-form-item label="跳转路径：" style="width: 40%" v-if="
                  currentRow.isClick == '1' && currentRow.clickType == '1'
                ">
                  <el-input v-model="currentRow.jumpPath" placeholder="请输入" clearable />
                </el-form-item>
                <el-form-item label="抽屉组件：" style="width: 40%" v-if="
                  currentRow.isClick == '1' && currentRow.clickType == '2'
                ">
                  <el-select v-model="currentRow.drawerComName" placeholder="请选择" clearable>
                    <el-option v-for="itemOpt in staffTypeOpt" :label="itemOpt.label" :value="itemOpt.value" :key="itemOpt.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="弹窗组件：" style="width: 40%" v-if="
                  currentRow.isClick == '1' && currentRow.clickType == '3'
                ">
                  <el-select v-model="currentRow.drawerComName" placeholder="请选择" clearable>
                    <el-option v-for="itemOpt in [{label: '患者360', value: 'patient'}]" :label="itemOpt.label" :value="itemOpt.value" :key="itemOpt.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间格式：" style="width: 40%">
                  <el-select v-model="currentRow.dateType" placeholder="请选择" clearable>
                    <el-option label="年" value="year" />
                    <el-option label="月" value="month" />
                    <el-option label="日" value="day" />
                    <el-option label="时" value="hour" />
                    <el-option label="分" value="minute" />
                    <el-option label="秒" value="second" />
                  </el-select>
                </el-form-item>
                <el-form-item label="固定位置：" style="width: 40%">
                  <el-select v-model="currentRow.fixed" placeholder="固定位置" clearable>
                    <el-option label="左固定" value="left" />
                    <el-option label="右固定" value="right" />
                  </el-select>
                </el-form-item>
                <el-form-item label="合计无下钻" style="width: 40%">
                    <el-switch v-model="currentRow.sumNoDrill" ></el-switch>
                </el-form-item>
              </el-form>
            </div>
          </teleport>
        </template>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <el-button type="primary" @click="onSubmit" class="save-btn">
        <el-icon>
          <Check />
        </el-icon>
        保存配置
      </el-button>
      <el-button @click="resetForm" class="reset-btn">
        <el-icon>
          <Refresh />
        </el-icon>
        重置
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from "vue";
import { parseColumns } from "@/api/tool.js";
import { ElMessage } from "element-plus";

// 定义事件
const emit = defineEmits(["update"]);
// 定义props
const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
});

// 表单数据
const formData = ref({
  pageOpen: "", //  是否需要分页
  ClassName: "", //  表格样式
  showIndex: "", //  是否显示序号列
  checkBox: "", //  是否显示复选框列
  primaryKey: "ASSIGN_KEY", //  行唯一标识字段名
  light: "", //  高亮行
  showBorder: "", //  是否展示边框
  designTableColumns: [], //  表格数据
  sqltextarea: "", //  sql
  datasourceId: "", //  数据源id
  dsType: "", //  来源方式
  dsConfig: "", //  来源配置
  exportbtn: "", // 展示导出按钮
  apiUrl: "/business/design-data/queryDataPage", //  接口地址
  treeModel: "0", //  是否树形结构
  topColumnValue: "", //  顶级列名
  parentColumn: "", //  父级列名
  childColumn: "", //  子级列名
  rowClickData: "", // 0无 1 排行 ， 2 事件
});
const currentRow = ref(null);
// 表单校验规则
const formRules = reactive({
  primaryKey: [
    { required: true, message: "请输入主键字段名", trigger: "blur" },
    {
      pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      message: "主键字段名只能包含字母、数字和下划线，且不能以数字开头",
      trigger: "blur",
    },
    { max: 50, message: "主键字段名长度不能超过50个字符", trigger: "blur" },
  ],
  treeModel: [
    {
      type: "string",
      required: true,
      message: "请选择是否树形结构",
      trigger: "change",
    },
  ],
  topColumnValue: [
    {
      required: () => formData.treeModel === "1",
      message: "请输入顶级列名",
      trigger: ["blur", "change"],
    },
    {
      max: 50,
      message: "顶级列名长度不能超过50个字符",
      trigger: "blur",
      required: false,
    },
  ],
  parentColumn: [
    {
      required: () => formData.treeModel === "1",
      message: "请输入父级列名",
      trigger: ["blur", "change"],
    },
    {
      max: 50,
      message: "父级列名长度不能超过50个字符",
      trigger: "blur",
      required: false,
    },
  ],
  childColumn: [
    {
      required: () => formData.treeModel === "1",
      message: "请输入子级列名",
      trigger: ["blur", "change"],
    },
    {
      max: 50,
      message: "子级列名长度不能超过50个字符",
      trigger: "blur",
      required: false,
    },
  ],
});


const staffTypeOpt = ref([
  { label: "人员详情", value: 'personnelInformation' },
  //{ label: "人员详情", value: 'personnelInformation' },
  // { label: "护士", value: "1", type: 'personnelInformation' },
  // { label: "技师", value: "2", type: 'personnelInformation' },
])


const changeFormat = (val) => {
  currentRow.value.digit = "";
};

const cereteCode = async () => {
  if (formData.value.dsConfig != "") {
    let res = await parseColumns({ bash: formData.value.dsConfig });
    formData.value.designTableColumns = res.map((item) => {
      return {
        columnName: item.columnName,
        columnDataSourceName: "",
        columnLabel: item.columnLabel,
        textAlign: "left",
        columnWidth: "",
        children: item.children ? item.children : [],
        idRow: generateRandomId(),
      };
    });
  } else {
    ElMessage.warning("请输入SQL");
  }
};
// 随机生成ID
const generateRandomId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 删除指定对象
function removeNodeByIdRow(tree, idRow, childrenKey = "children") {
  // 过滤掉根节点中匹配的节点
  const filteredTree = tree.filter((node) => node.idRow !== idRow);
  // 递归处理子节点
  filteredTree.forEach((node) => {
    if (node[childrenKey] && node[childrenKey].length > 0) {
      node[childrenKey] = removeNodeByIdRow(
        node[childrenKey],
        idRow,
        childrenKey
      );
    }
  });

  return filteredTree;
}

const rowClickDataOptions = ref([
  { value: "0", label: "无" },
  { value: "1", label: "图表科室排序" },
  { value: "2", label: "图表科室" },
]);

// 添加列
const addColumn = () => {
  formData.value.designTableColumns.push({
    columnName: "",
    columnDataSourceName: "",
    columnLabel: "",
    textAlign: "left",
    columnWidth: "",
    children: [],
    idRow: generateRandomId(),
  });
};

// 添加列
const addColumns = () => {
  formData.value.designTableColumns.unshift({
    columnName: "",
    columnDataSourceName: "",
    columnLabel: "",
    textAlign: "left",
    columnWidth: "",
    children: [],
    idRow: generateRandomId(),
  });
};
// 添加子级
const handAdd = (row) => {
  if (row.children) {
    row.children.push({
      columnName: "",
      columnLabel: "",
      textAlign: "left",
      columnWidth: "",
      idRow: generateRandomId(),
    });
  } else {
    row.children = [
      {
        columnName: "",
        columnLabel: "",
        textAlign: "left",
        columnWidth: "",
        idRow: generateRandomId(),
      },
    ];
  }
};

// 删除行操作
const handleDel = (row) => {
  formData.value.designTableColumns = removeNodeByIdRow(
    formData.value.designTableColumns,
    row.idRow
  );
};

// 重置表单
const resetForm = () => {
  if (props.component && props.component.bind) {
    try {
      const bindData = JSON.parse(JSON.stringify(props.component.bind));
      // 确保数据类型正确
      formData.value = formDataFn("", bindData);
    } catch (error) {
      console.error("Error resetting form data:", error);
    }
  }
};
// 根据 idRow 在同层级中移动元素
const moveItemInSameLevel = (treeData, idRow, direction) => {
  const findAndMove = (nodes, targetIdRow, moveDirection) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // 找到目标节点
      if (node.idRow === targetIdRow) {
        // 向上移动
        if (moveDirection === "up" && i > 0) {
          [nodes[i - 1], nodes[i]] = [nodes[i], nodes[i - 1]];
          return true;
        }
        // 向下移动
        else if (moveDirection === "down" && i < nodes.length - 1) {
          [nodes[i], nodes[i + 1]] = [nodes[i + 1], nodes[i]];
          return true;
        }
        return false;
      }

      // 递归查找子节点
      if (node.children && node.children.length > 0) {
        if (findAndMove(node.children, targetIdRow, moveDirection)) {
          return true;
        }
      }
    }
    return false;
  };

  findAndMove(treeData, idRow, direction);
  return treeData;
};
// 上移
const moveUp = (index, row) => {
  moveItemInSameLevel(formData.value.designTableColumns, row.idRow, "up");
};

// 下移
const moveDown = (index, row, scope) => {
  moveItemInSameLevel(formData.value.designTableColumns, row.idRow, "down");
};

// 处理formData
const formDataFn = (type, bindData) => {
  if (type == "空") {
    return {
      ...bindData,
      tabIndex: "",
      rowClickData: "",
      pageOpen: "0",
      ClassName: "",
      showIndex: "1",
      checkBox: "0",
      primaryKey: "id",
      light: "0",
      showBorder: "0",
      designTableColumns: [],
      sqltextarea: "",
      datasourceId: "",
      dsType: "",
      dsConfig: "",
      // apiUrl: '',
      exportbtn: "0",
      treeModel: "0",
      topColumnValue: "",
      parentColumn: "",
      childColumn: "",
      defaultGetTable: bindData.defaultGetTable || 1, //  默认展示表格
    };
  } else {
    return {
      ...bindData,
      tabIndex: bindData.tabIndex,
      pageOpen: bindData.pageOpen,
      ClassName: bindData.ClassName,
      showIndex: bindData.showIndex,
      checkBox: bindData.checkBox,
      primaryKey: bindData.primaryKey || "id",
      light: bindData.light,
      rowClickData: bindData.rowClickData,
      showBorder: bindData.showBorder,
      designTableColumns: bindData.designTableColumns || [],
      sqltextarea: bindData.sqltextarea || "",
      datasourceId: bindData.datasourceId || "",
      dsType: bindData.dsType || "",
      dsConfig: bindData.dsConfig || "",
      // apiUrl: bindData.apiUrl || '',
      exportbtn: bindData.exportbtn || "0",
      treeModel: bindData.treeModel || "0",
      topColumnValue: bindData.topColumnValue || "",
      parentColumn: bindData.parentColumn || "",
      childColumn: bindData.childColumn || "",
      defaultGetTable: bindData.defaultGetTable || 1, //  默认展示表格
    };
  }
};

// 树形结合展开
const toggleRow = (row, event) => {
  const idRow = row.idRow;
  const rowElement = event.target.closest("tr");
  if (rowElement && rowElement.closest("table")) {
    const rowsToRemove = rowElement
      .closest("table")
      .querySelectorAll("tr.gas-add-tr");
    rowsToRemove.forEach((row) => row.remove());
  }
  if (currentRow.value && currentRow.value.idRow == idRow) {
    // 如果已经存在，关闭它
    currentRow.value = null;
  } else {
    currentRow.value = null;

    nextTick(() => {
      currentRow.value = row;
      const newRow = document.createElement("tr");
      newRow.classList.add("gas-add-tr");

      const newRowContent = document.createElement("td");
      newRowContent.colSpan = "12";
      newRowContent.innerHTML = `
        <div class="expand-content">
          <!-- 子表格渲染区域 -->
        </div>
      `;
      newRow.appendChild(newRowContent);
      rowElement.parentNode.insertBefore(newRow, rowElement.nextSibling);
    });
  }
};

// 监听组件变化，更新表单数据
watch(
  () => props.component,
  (newComponent) => {
    console.log(newComponent, "newComponent");
    if (newComponent && newComponent.bind) {
      try {
        const bindData = JSON.parse(JSON.stringify(newComponent.bind));
        console.log(bindData, "bindData");
        // 确保数据类型正确
        formData.value = formDataFn("", bindData);
      } catch (error) {
        console.error("Error parsing component bind data:", error);
        // 使用默认值
        formData.value = formDataFn("空");
      }
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => formData.value.treeModel,
  (newVal) => {
    if (newVal === "1") {
      // 当树形结构开启时，设置默认值
      if (!formData.value.topColumnValue) {
        formData.value.topColumnValue = "0";
      }
      if (!formData.value.parentColumn) {
        formData.value.parentColumn = "HOSPITAL_FATHER_CODE";
      }
      if (!formData.value.childColumn) {
        formData.value.childColumn = "H_DPT_CODE";
      }
    }
  },
  { immediate: true }
);

// 提交表单
const onSubmit = () => {
  // 触发父组件更新
  emit("update", {
    idComponent: props.component.uuidC,
    formData: formData.value,
  });
};

// 判断 row 是否是 currentRow 或其祖先
function isRowOrAncestor(row, targetRow) {
  if (!row || !targetRow) return false;
  if (row.idRow === targetRow.idRow) return true;
  if (row.children && row.children.length) {
    return row.children.some((child) => isRowOrAncestor(child, targetRow));
  }
  return false;
}

// el-table 树节点展开/收起事件
const onTreeExpandChange = (row, expanded) => {
  // expanded: true=展开，false=收起
  if (currentRow.value) {
    console.log(11);
    // 如果 currentRow 是被收起的 row 或其子节点，则关闭详情
    currentRow.value = null;
    // 移除 DOM 插入的 tr
    nextTick(() => {
      const rowsToRemove = document.querySelectorAll("tr.gas-add-tr");
      rowsToRemove.forEach((row) => row.remove());
    });
  }
};
</script>

<style scoped>
.table-config-panel {
  padding: 0;
  height: 100%;
  overflow-y: auto;
  background: #f8f9fa;
}

.config-section {
  margin: 10px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.section-header h4 {
  margin: 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.add-btn {
  border-radius: 6px;
  font-size: 13px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.code-input {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
}

.table-container {
  margin-top: 16px;
}

.config-table {
  border-radius: 6px;
  overflow: hidden;
}

.table-input {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  padding: 4px 0px;
  font-size: 12px;
}

.action-btn.delete {
  color: #dc3545;
}

.action-btn.delete:hover {
  color: #c82333;
}

.action-section {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 6px 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 12px;
  justify-content: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 11;
}

.save-btn {
  min-width: 120px;
}

.reset-btn {
  min-width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-section {
    margin: 12px;
    padding: 16px;
  }

  .action-section {
    padding: 12px;
  }
}

/* 滚动条样式 */
.table-config-panel::-webkit-scrollbar {
  width: 6px;
}

.table-config-panel::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 3px;
}

.table-config-panel::-webkit-scrollbar-thumb {
  background: #c1c3c4;
  border-radius: 3px;
}

.table-config-panel::-webkit-scrollbar-thumb:hover {
  background: #a8aaab;
}
</style>

<style lang="less">
.config-table {
  .el-table__expand-icon {
    width: 18px !important;
    height: 18px !important;

    .el-icon {
      font-size: 18px !important;
    }
  }

  // 为不同层级定义样式
  .level-style(@level) {
    .el-table__row--level-@{level} {
      .el-table__cell:nth-child(2) {
        .table-input {
          margin-left: (@level * 5px) !important;
          width: calc(100% - (@level * 5px)) !important;
        }
      }
    }
  }

  // 生成1-10级的样式
  .level-style(1);
  .level-style(2);
  .level-style(3);
  .level-style(4);
  .level-style(5);
  .level-style(6);
  .level-style(7);
  .level-style(8);
  .level-style(9);
  .level-style(10);
}
</style>
