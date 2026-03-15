<template>
  <div class="drag-container">
    <!-- 加载遮罩层 -->
    <div v-if="saveLoading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>保存中...</span>
      </div>
    </div>
    <!-- 右侧内容区 - 添加拖拽功能 -->
    <div class="content-area" ref="contentArea" @mousedown="startDrag">
      <div class="area-header" style="display: flex">
        <!-- <div
          style="display: flex; align-items: center; width: calc(100% - 180px)"
        >
          <el-tooltip effect="light">
            <template #content>
              <div class="list-content">
                <div
                  v-for="item in filterFn(componentsList, 'base')"
                  :key="item.id"
                  class="component-item"
                  draggable="true"
                  @dragstart="handleDragStart($event, item)"
                >
                  {{ item.name }}
                </div>
              </div>
            </template>
            <p style="margin-right: 20px">基础组件</p>
          </el-tooltip>
          <el-tooltip effect="light">
            <template #content>
              <div class="list-content">
                <div
                  v-for="item in filterFn(componentsList, 'echart')"
                  :key="item.id"
                  class="component-item"
                  draggable="true"
                  @dragstart="handleDragStart($event, item)"
                >
                  {{ item.name }}
                </div>
              </div>
            </template>
            <p style="margin-right: 20px">图表组件</p>
          </el-tooltip>
        </div> -->
        <div style="display: flex; align-items: center; width: 180px">
          <el-button type="primary" style="margin-right: 10px" color="#deecfd">
            <el-icon class="bmr">
              <View />
            </el-icon>
            预览
          </el-button>

          <!-- <el-button type="primary" @click="handleSavePage"> -->
          <el-button type="primary" @click="saveConfig">
            <el-icon class="bmr">
              <Wallet />
            </el-icon>
            保存
          </el-button>
        </div>
      </div>
      <div class="drop-container" @dragover.prevent @drop="handleDrop">
        <!-- 报表详情数据 -->
        <div class="detail-data" :class="{ hidden: !isdetailAreaVisible }">
          <!-- 收起按钮 -->
          <div class="detail-btn" @click="toggleDetailArea">
            <el-icon>
              <ArrowLeft v-if="isdetailAreaVisible" />
              <ArrowRight v-else />
            </el-icon>
          </div>
          <!-- 详情数据 -->
          <div class="detail-content">
            <el-container>
              <el-header v-if="dataSource.length == 0">
                <!-- <span class="header-title">报表名称</span>
                <el-input></el-input> -->
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    height: 30px;
                    border: 1px solid #ccc;
                    padding: 0 10px;
                    box-sizing: border-box;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 5px;
                  "
                >
                  <span>数据报表信息</span>
                  <el-icon
                    style="color: #409eff; cursor: pointer"
                    @click="handleAddDataSource"
                    ><Plus
                  /></el-icon>
                </div>
              </el-header>
              <el-main>
                <span class="header-title">数据表信息</span>
                <div style="overflow: auto; height: 88%">
                  <el-tree
                    ref="treeRef2"
                    :data="dataSource"
                    node-key="id"
                    default-expand-all
                    :expand-on-click-node="false"
                    :highlight-current="true"
                    @node-click="handleNodeClick"
                    ><template #default="{ node, data }">
                      <div
                        style="display: flex; flex: 1"
                        :class="{ 'tree-node-selected': node.isCurrent }"
                      >
                        <span>{{ node.label }}</span>
                        <div
                          style="
                            display: flex;
                            flex: 1;
                            justify-content: flex-end;
                            padding-right: 10px;
                          "
                        >
                          <el-icon
                            color="#409eff"
                            @click.stop="handleAddDataSource(data)"
                          >
                            <Plus />
                          </el-icon>
                          <el-icon
                            @click="deleteDataSource(data)"
                            style="margin-left: 15px"
                            color="#F56C6C"
                          >
                            <Delete />
                          </el-icon>
                        </div>
                      </div>
                    </template>
                  </el-tree>
                </div>
              </el-main>
              <el-footer>
                <span class="header-title">组件信息</span>
                <div>
                  <p style="margin-right: 20px">基础组件</p>
                  <div class="list-content">
                    <div
                      v-for="item in filterFn(componentsList, 'base')"
                      :key="item.id"
                      class="component-item"
                      draggable="true"
                      @dragstart="handleDragStart($event, item)"
                    >
                      {{ item.name }}
                    </div>
                  </div>
                  <p style="margin-right: 20px">图表组件</p>
                  <div class="list-content">
                    <div
                      v-for="item in filterFn(componentsList, 'echart')"
                      :key="item.id"
                      class="component-item"
                      draggable="true"
                      @dragstart="handleDragStart($event, item)"
                    >
                      {{ item.name }}
                    </div>
                  </div>
                </div>
              </el-footer>
            </el-container>
          </div>
        </div>
        <!-- 抽屉组件详情区域 -->
        <div
          class="message-area"
          :style="{ width: messageAreaWidth + '%' }"
          :class="{ hidden: !isMessageAreaVisible }"
        >
          <!-- 收起按钮 -->
          <div class="collapse-btn" @click="toggleMessageArea">
            <el-icon>
              <ArrowRight v-if="isMessageAreaVisible" />
              <ArrowLeft v-else />
            </el-icon>
          </div>
          <!-- 拖拽手柄 -->
          <div class="resize-handle" @mousedown="startResize($event)"></div>
          <!-- 抽屉内容 -->
          <div class="message-content">
            <!-- 内容区域 -->
            <div class="tab-content">
              <div v-if="activeTab === 'data'" class="tab-panel">
                <!-- 表格组件 -->
                <tableSet
                  v-if="selectedComponent && typeKey == 'TABLE'"
                  :component="selectedComponent"
                  @update="handleUpdate"
                />
                <YLtableSet
                  ref="YLtableSetRef"
                  v-if="selectedComponent && typeKey == 'YLTABLE'"
                  :component="selectedComponent"
                  :current-tree-node="currentTreeNode"
                  @update="handleUpdate"
                />
                <!-- 表单组件 -->
                <formSet
                  v-if="selectedComponent && typeKey == 'searchform'"
                  :component="selectedComponent"
                  @update="handleUpdate"
                />
                <YLformSet
                  ref="YLformSetRef"
                  v-if="selectedComponent && typeKey == 'YLsearchform'"
                  :component="selectedComponent"
                  @update="handleUpdate"
                />
                <!-- 图表组件 -->
                <chartSet
                  ref="styleConfigRef"
                  v-if="selectedComponent && typeKey == 'CHART'"
                  :data="currentConfig"
                  :chartType="selectedComponent?.chartType || ''"
                  @config-change="handleConfigChange"
                />
                <!-- 表格组件 -->
                <divLabelSet
                  v-if="selectedComponent && typeKey == 'DIV_TAB'"
                  :component="selectedComponent"
                  @update="handleUpdate"
                />
              </div>
              <div v-if="activeTab === 'style'" class="tab-panel">
                <h3>样式配置</h3>
                <p>这里是样式配置的内容</p>
              </div>
            </div>
          </div>
        </div>
        <div
          v-for="(item, index) in showFn(droppedComponents, tabIndexDefault)"
          @click.capture="selectComponent(index, item)"
          :key="item.uuidC"
          class="dropped-item-wrapper"
          :style="{
            left: item.c_left + '%',
            top: item.c_top + '%',
            width: item.width + '%',
            height: item.height + '%',
          }"
          @mousedown="startComponentDrag($event, item, index)"
        >
          <!-- 组件容器 - 使用百分比单位 -->
          <div
            class="dropped-item"
            style="width: 100%; height: 100%; position: relative"
            :class="{ selected: item.isSelected }"
            :style="{ cursor: resizeCursor }"
            @mousemove="handleMouseMove($event, item, index)"
            @mousedown="handleResizeStart($event, item, index)"
            @mouseleave="resetResizeState"
          >
            <component
              :is="isComponent(item)"
              v-bind="item.bind"
              @addTab="addTab"
              @changTab="changTab"
            ></component>
          </div>

          <!-- 组件宽高信息显示 -->
          <div v-if="item.isSelected" class="component-size-info">
            {{ item.width }}% × {{ item.height }}%
          </div>
          <!-- 删除按钮 - 仅在选中时显示 -->
          <div
            v-if="item.isSelected"
            class="delete-component-btn"
            @click.stop="deleteComponent(index, item)"
          >
            ×
          </div>
        </div>
      </div>
    </div>
  </div>
  <SzycDialog
    :dialogVisible="save_show"
    :title="`${route.query.code ? '编辑' : '新增'}` + save_title"
    width="40%"
    @close="save_show = false"
  >
    <template #uname>
      <submitPage
        v-model="save_formData"
        :items="save_formItems"
        :rules="save_formRules"
        @cancel="save_show = false"
        @submit="saveConfig"
      />
    </template>
  </SzycDialog>

  <!-- 新增数据表对话框 -->
  <el-dialog
    v-model="addDataSourceDialogVisible"
    title="新增数据表"
    width="40%"
    @close="closeAddDataSourceDialog"
  >
    <div class="add-data-source-form">
      <el-form
        :model="addDataSourceForm"
        :rules="addDataSourceRules"
        ref="addDataSourceFormRef"
        label-width="120px"
      >
        <el-form-item label="数据表名称" prop="pageName">
          <el-input v-model="addDataSourceForm.pageName" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="数据表编码" prop="pageCode">
          <el-input v-model="addDataSourceForm.pageCode" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="父数据表" prop="parentId">
          <el-select
            v-model="addDataSourceForm.parentId"
            placeholder="请选择"
            clearable
            @change="handleParentChange"
          >
            <!-- <el-select
            v-model="addDataSourceForm.parentId"
            placeholder="请选择"
            clearable
          > -->
            <!-- <el-option label="无父级" value="" /> -->
            <el-option
              v-for="item in getParentDataSourceOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="下钻字段" prop="inKeyword">
          <el-select
            :disabled="!addDataSourceForm.parentId"
            v-model="addDataSourceForm.inKeyword"
            placeholder="请选择"
            clearable
          > -->
        <!-- <el-option label="无父级" value="" /> -->
        <!-- <el-option
              v-for="item in downyWordOptions"
              :key="item.idRow"
              :label="item.columnLabel"
              :value="item.columnName"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label="关键字段" prop="keyWord">
          <el-input
            :disabled="!addDataSourceForm.parentId"
            v-model="addDataSourceForm.keyWord"
            placeholder="请输入"
          />
          <!-- <el-select v-model="addDataSourceForm.keyWord" placeholder="请选择" clearable>
            <el-option label="无关键字段" value="" /> -->
          <!-- 这里可以根据父表动态生成字段选项 -->
          <!-- </el-select> -->
        </el-form-item>
        <el-form-item label="所属应用" prop="projectId">
          <el-select
            v-model="addDataSourceForm.projectId"
            placeholder="请选择"
            clearable
            @change="handleProjectChange"
          >
            <el-option label="无应用" value="" />
            <el-option
              v-for="item in appList"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="页面路径" prop="pagePath">
          <el-input v-model="addDataSourceForm.pagePath" placeholder="请输入" />
        </el-form-item> -->
      </el-form>
    </div>

    <template #footer>
      <div
        class="dialog-footer"
        style="
          width: 100%;
          text-align: center;
          height: 60px;
          line-height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
        "
      >
        <el-button @click="closeAddDataSourceDialog">取消</el-button>
        <el-button type="primary" @click="handleSaveDataSource">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed, nextTick } from "vue";

import TableComponent from "@/components/table/tableAndPage.vue";
import YLTableComponent from "@/components/table/ylTableDrag.vue"; //医疗信息化表格组件
import searchFormComponent from "@/components/element/SearchFormC.vue";
import YLformComponent from "@/components/element/YLformC.vue"; //医疗信息化表单组件
import divCharts from "@/components/Echarts/base/divCharts.vue";
import divLabel from "@/components/table/divLabel.vue";

import {
  addPageApi,
  pageUpdate,
  updateMrmsTableMangerInfo,
  pageDetailApi,
  addMrmsTableMangerInfo,
  getMrmsTableMangerInfo,
} from "@/api/settings/index";
import { useRoute, useRouter } from "vue-router";

import submitPage from "@/components/element/SubmitForm.vue";
import { listAppProjectApi, getMrmsProjectInfoSelect } from "@/api/tool.js";
// 导入状态管理
// import { useDesignStore } from "@/store/designStore";
import {
  bindTable,
  bindForm,
  bindDivCharts,
  bindBarEchart,
  isNeedDetailApi,
  removeNodeByIdRow,
  addParamToArrayRecursively,
  generateRandomId,
  filterFn,
  componentsList,
} from "./index";

import tableSet from "../setPage/s_component/table.vue"; //  表格配置
import YLtableSet from "../setPage/s_component/YLtable.vue"; //  医疗信息化表格配置
import YLformSet from "../setPage/s_component/yiliaoform.vue"; //  医疗信息化表单配置
import formSet from "../setPage/s_component/form.vue"; //  表单配置
import chartSet from "@/components/Echarts/ChartStyleConfig.vue"; //  图表配置
import divLabelSet from "../setPage/s_component/divLabelSet.vue"; // div标签配置
import { themeStoreMenu } from "@/store/theme";
const storeTheme = themeStoreMenu(); //  主题存储
const { removeTab } = storeTheme.tabsFn;
import {
  BarChart,
  LineChart,
  ScatterChart,
  RadarChart,
  PieChart,
  FunnelChart,
} from "@/components/Echarts/index"; //  图表配置
import {
  Delete,
  Plus,
  ArrowLeft,
  ArrowRight,
  View,
  Wallet,
  Loading,
} from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { dataTool } from "echarts";
const downyWordOptions = ref([]); //  下钻字段选项
const tabIndexDefault = ref(""); //  默认的值
const YLtableSetRef = ref(null);
const YLformSetRef = ref(null);
const route = useRoute();
const router = useRouter();
const selectedComponent = ref(null); // 选中的组件
const typeKey = ref(""); // 组件类型
const idKey = ref(""); // 添加idKey变量定义

const isMessageAreaVisible = ref(false);
const isdetailAreaVisible = ref(false);
const treeRef2 = ref(null); // 树形组件引用
const messageAreaWidth = ref(40); // 消息区域宽度，默认40%
const saveLoading = ref(false); // 保存加载状态

const dataSource = ref([]); //  数据源
const activeTab = ref("data"); // 当前激活的标签页
const d_title = ref("表格组件配置");
const d_show = ref(false);
const isTreeNodeClicked = ref(false); // 记录是否点击了树形节点
const currentTreeNode = ref(null); // 记录当前选中的树形节点

// 拖拽调整消息区域宽度
// const isResizing = ref(false);

const startResize = (event) => {
  isResizing.value = true;
  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
  event.preventDefault();
};

const handleResize = (event) => {
  if (!isResizing.value) return;

  const containerWidth = document.querySelector(".content-area").offsetWidth;
  const newWidth = ((containerWidth - event.clientX) / containerWidth) * 100;

  // 限制最小宽度为40%
  if (newWidth >= 40) {
    messageAreaWidth.value = newWidth;
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
};

const save_show = ref(false); //  保存当前页面弹窗
const save_title = ref("页面"); //  新增页面
const appList = ref([]); //  所属应用

const save_formData = reactive({
  pageName: "", //  页面名称
  projectId: "", //  所属应用
  pageCode: "", //  页面路径
  kyf: "1", //  是否启用  0 否  1是
});
const dataSourceEntity = ref(null);
// 处理项目选择变化
const handleProjectChange = (value) => {
  // 根据选中的projectId从appList中获取完整的项目数据
  if (value) {
    const selectedProject = appList.value.find((item) => item.id === value);
    if (selectedProject) {
      console.log("选中的项目完整数据:", selectedProject);
      // addDataSourceForm.pageLabel = selectedProject.label;
      // 只有当selectedComponent存在时才更新其属性
      // 确保selectedComponent有dataSourceEntity属性
      dataSourceEntity.value = selectedProject.dataSourceEntity || {};
      // 可以在这里使用选中的项目数据进行其他操作
    }
  }
};

// 根据id在dataSource中查找完整的父数据表数据
const findDataSourceById = (id, dataSource) => {
  for (const item of dataSource) {
    if (item.id === id) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findDataSourceById(id, item.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
};
const parentIdCopy = ref(null);
// 处理父数据表选择变化
const handleParentChange = (value) => {
  // 根据选中的父数据表id获取完整的父数据表数据
  if (value) {
    const selectedParent = getParentDataSourceOptions.value.find(
      (item) => item.id == value,
    );
    addDataSourceForm.pageLabel = selectedParent.label;
    console.log(
      "选中的父数据表完整数据:",
      selectedParent,
      addDataSourceForm.pageLabel,
    );
  }
};
//关闭弹框
const closeAddDataSourceDialog = () => {
  addDataSourceDialogVisible.value = false;
  ifFinish.value = false;
};
// 当前配置
const currentConfig = reactive({
  basic: {
    jumPathEchart: "", // 跳转路径
    jumPathEchartParams: [], // 跳转携带参数
    noKs: false, // 参数dptCode为空值时处理
    scaleShow: false, //  刻度展示重合时处理
    radarMaxValue: "", //  雷达图最大值
    rowClickData: "", // 0 无  1 排行 ，2 暂定
    hasRequired: false, //  必填参数是否
    paramsValueList: "", //  必填参数（表格联动）
    rotate: "0", // 旋转角度
    theme: "light", //  主题
    showToolbox: true, //  显示工具箱
    direction: "value", //  方向
    title: "图表样式配置示例", //  标题
    subtitle: "实时预览样式效果",
    showLegend: true, //  是否显示图例
    doubleBar: false, // 是否双向柱形图
    inverse: false, // 是否反转
    legendPosition: "", //  图例位置
    legendLeft: "", //  图例左边距
    legendRight: "", //  图例右边距
    legendTop: "", //  图例上边距
    legendBottom: "", //  图例下边距
    showGrid: true, //  是否显示网格
    gridLeft: "", //  图表左侧距离
    gridRight: "", //  图表右侧距离
    gridTop: "", //  图表顶部距离
    gridBottom: "", //  图表底部距离
    autoResize: true,
    renderer: "canvas",
  },
  colors: {
    primaryColor: "#5470c6",
    colorScheme: "default",
    customColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"],
  },
  dataConfig: {
    dsType: "", //  数据源类型
    dsConfig: "", //  数据源配置sql
    designChartConfigList: [], //  x轴数据
  },
});

const ifFinish = ref(false); //是否已经完成当前页面配置
// 新增数据表对话框相关
const addDataSourceDialogVisible = ref(false);
const addDataSourceFormRef = ref(null);
const addDataSourceForm = reactive({
  pageLabel: "",
  pageName: "", // 数据表名称
  pageCode: "", // 数据表编码
  parentId: "", // 父数据表ID
  keyWord: "", // 关键字段
  projectId: "",
  // pagePath: "", // 页面路径
});

// 新增数据表表单验证规则
const addDataSourceRules = reactive({
  pageName: [{ required: true, message: "请输入数据表名称", trigger: "blur" }],
  pageCode: [{ required: true, message: "请输入数据表编码", trigger: "blur" }],
  parentId: [{ required: false }],
  keyWord: [
    {
      validator: (rule, value, callback) => {
        if (addDataSourceForm.parentId && !value) {
          callback(new Error("请选择关联字段"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  // pagePath: [{ required: false }],
});

// 获取父数据表选项（扁平化处理dataSource）
const getParentDataSourceOptions = computed(() => {
  const options = [];

  const flattenTree = (nodes, level = 0) => {
    nodes.forEach((node) => {
      options.push({
        id: node.id || generateRandomId(),
        label: " ".repeat(level * 2) + node.label,
        level,
      });

      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1);
      }
    });
  };

  flattenTree(dataSource.value);
  return options;
});

// 打开新增数据表对话框
const handleAddDataSource = (nodeData = null) => {
  // 检查所有组件是否都已保存
  const unsavedComponents = droppedComponents.value.filter(
    (item) => item.isSave !== true,
  );

  if (unsavedComponents.length > 0) {
    // 有未保存的组件，收集组件名称
    const componentNames = unsavedComponents.map((item) => {
      // 尝试获取组件名称，如果没有则使用组件类型
      return item.name || item.componentType || "未知组件";
    });

    // 生成提示信息
    const message = `请先保存以下组件配置，再切换节点：\n${componentNames.join("、")}`;
    ElMessage.warning(message);
    return;
  }
  if (ifFinish.value) {
    ElMessage.error("请先完成当前页面配置");
    return;
  }
  ifFinish.value = true;
  addDataSourceDialogVisible.value = true;
  // 重置表单
  Object.keys(addDataSourceForm).forEach((key) => {
    addDataSourceForm[key] = "";
  });
  // 如果有节点数据，设置默认父节点ID
  // if (nodeData && nodeData.id) {
  //   addDataSourceForm.parentId = nodeData.id;
  // }
};

// 保存新增数据表
const handleSaveDataSource = async () => {
  if (!addDataSourceFormRef.value) return;

  try {
    await addDataSourceFormRef.value.validate();

    // 创建新的数据表节点
    const newNode = {
      id: generateRandomId(),
      label: addDataSourceForm.pageName,
      children: [],
      pageName: addDataSourceForm.pageName,
      pageCode: addDataSourceForm.pageCode,
      parentId: addDataSourceForm.parentId,
      keyWord: addDataSourceForm.keyWord,
      projectId: addDataSourceForm.projectId,
      pageLabel: addDataSourceForm.pageLabel,
      // pagePath: addDataSourceForm.pagePath,
    };

    // 如果有父节点，添加到父节点的children中
    if (addDataSourceForm.parentId) {
      const findParentNode = (nodes) => {
        for (const node of nodes) {
          if (node.id === addDataSourceForm.parentId) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const found = findParentNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const parentNode = findParentNode(dataSource.value);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(newNode);
      } else {
        // 如果找不到父节点，添加到根节点
        dataSource.value.push(newNode);
      }
    } else {
      // 没有父节点，添加到根节点
      dataSource.value.push(newNode);
    }

    // 关闭对话框
    addDataSourceDialogVisible.value = false;

    // 默认选择新增的节点
    nextTick(() => {
      if (treeRef2.value) {
        treeRef2.value.setCurrentKey(newNode.id);
        currentTreeNode.value = newNode;
        // 执行节点点击事件
        handleNodeClick(newNode, { isCurrent: true });
        // 清空页面的选中组件
        selectedComponent.value = null;

        // 重置所有组件的选中状态
        droppedComponents.value = droppedComponents.value.filter(
          (comp) => comp.uuidC == false,
        );
      }
    });
  } catch (error) {
    console.error("表单验证失败：", error);
  }
};

// 处理树形节点点击事件
const handleNodeClick = (data, node) => {
  console.log(
    data,
    getParentDataSourceOptions.value,
    droppedComponents.value,
    "YLtableSetRef.value11111",
  );
  console.log(
    droppedComponents.value,
    "YLtableSetRef.value77777777777777777777777777777777777",
  );
  // 如果有route.query.pageId，跳过未保存组件的检查
  if (!route.query.pageId) {
    // 检查所有组件是否都已保存
    const unsavedComponents = droppedComponents.value.filter(
      (item) => item.isSave !== true,
    );

    if (unsavedComponents.length > 0) {
      // 有未保存的组件，收集组件名称
      const componentNames = unsavedComponents.map((item) => {
        // 尝试获取组件名称，如果没有则使用组件类型
        return item.name || item.componentType || "未知组件";
      });

      // 生成提示信息
      const message = `请先保存以下组件配置，再切换节点：\n${componentNames.join("、")}`;
      ElMessage.warning(message);

      // 重置树形节点选中状态为当前节点
      if (treeRef2.value && currentTreeNode.value) {
        treeRef2.value.setCurrentKey(currentTreeNode.value.id);
      }
      return;
    }
  }
  ifFinish.value = false;
  droppedComponents.value = [];
  isTreeNodeClicked.value = true;
  droppedComponents.value =
    data.droppedComponents ||
    pageDetailShowFn(data.mrmsDesignCompoentEntitys) ||
    [];
  currentTreeNode.value = data;
  // 清空右侧伸缩框内容
  selectedComponent.value = null;

  if (data.formData) {
    console.log(data, "data.formData6666666666666666666666666666");
    if (route.query.pageId) {
      selectedComponent.value = { bind: data };
      selectedComponent.value.currentTreeNode = data;
      addDataSourceForm.pageLabel =
        getParentDataSourceOptions.value.find(
          (item) => item.id === data.pageFatherCode,
        )?.label || "";
      selectedComponent.value.currentTreeNode.parentId =
        addDataSourceForm.pageLabel;
      console.log(
        selectedComponent.value,
        "data.formData8888888888888888888888888888",
      );
    } else {
      selectedComponent.value = { bind: data.formData };
    }

    console.log(selectedComponent.value, data, "897897897897898");
  }
};

// 删除数据表节点
const deleteDataSource = (data) => {
  if (!data || !data.id) return;

  ElMessageBox.confirm("确定要删除这个数据表吗?", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const removeNodeById = (nodes, id, childrenKey = "children") => {
        return nodes.filter((node) => {
          if (node.id === id) {
            return false;
          }
          if (node[childrenKey] && node[childrenKey].length > 0) {
            node[childrenKey] = removeNodeById(
              node[childrenKey],
              id,
              childrenKey,
            );
          }
          return true;
        });
      };

      dataSource.value = removeNodeById(dataSource.value, data.id);
      // 清空页面的选中组件
      selectedComponent.value = null;

      // 重置所有组件的选中状态
      droppedComponents.value = droppedComponents.value.filter(
        (comp) => comp.uuidC == false,
      );
    })
    .catch(() => {
      // 用户取消删除操作
      console.log("删除已取消");
    });
};

//  提交配置
const save_formItems = computed(() => [
  {
    label: "页面名称",
    prop: "pageName",
    component: "el-input",
    placeholder: "请输入页面名称",
  },
  {
    label: "所属应用",
    prop: "projectId",
    component: "el-select",
    placeholder: "请选择所属应用",
    options: appList.value,
  },
  {
    label: "页面路径",
    prop: "pageCode",
    component: "el-input",
    placeholder: "请输入页面路径",
  },
  // { label: '页面名称', prop: 'pageCode', component: 'el-input', placeholder: '请输入页面路径' },
]);

//  提交校验
const save_formRules = reactive({
  pageName: [{ required: true, message: "请输入页面名称", trigger: "blur" }],
  projectId: [{ required: true, message: "请选择所属应用", trigger: "change" }],
  pageCode: [{ required: true, message: "请输入页面路径", trigger: "blur" }],
});

let minValue = 5; // 最小值
let maxValue = 100; // 最大值
// 增大边缘检测范围，使更容易触发 resize 操作
const edgeSize = 18; // 从 8 增加到 12，扩大检测区域
// 添加组件类型映射关系const designStore = useDesignStore();

// 添加组件类型映射关系
const componentMap = {
  TABLE: TableComponent, // 表格
  YLTABLE: YLTableComponent, // 医疗信息化表格
  searchform: searchFormComponent, // 表单
  YLsearchform: YLformComponent, // 医疗信息化表单
  divCharts: divCharts, //  图表
  DIV_TAB: divLabel, //  侧边栏
  CHART: {
    BAR: BarChart, //  柱形图
    LINE: LineChart, //  折线图
    SCATTER: ScatterChart, //  散点图
    RADAR: RadarChart, //  雷达图
    PIE: PieChart, //  饼图
    FUNNEL: FunnelChart, //  漏斗图
  },
};

// 页面组件数组
const droppedComponents = ref([]);

// 修改拖拽开始事件，确保数据正确传递
const handleDragStart = (e, item) => {
  console.log("item", item);
  e.dataTransfer.setData("componentId", item.id);
};

// 修改放置事件，使用百分比默认值
// 修改组件数据结构，添加x和y坐标
// 修改放置事件，使用鼠标位置作为初始坐标
const handleDrop = (e) => {
  try {
    // 检查是否点击了树形节点
    if (!isTreeNodeClicked.value) {
      ElMessage.warning("请先选择数据报表再添加组件");
      return;
    }
    const componentId = e.dataTransfer.getData("componentId");
    const component = componentsList.find((c) => c.id === Number(componentId));
    if (component) {
      const containerRect = document
        .querySelector(".drop-container")
        .getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // 计算初始位置百分比
      const rawX = e.clientX - containerRect.left;
      const rawY = e.clientY - containerRect.top;
      const xPercent = Number(
        Math.min(maxValue, Math.max(0, (rawX / containerWidth) * 100)).toFixed(
          2,
        ),
      ); // 限制在0-100%之间
      const yPercent = Number(
        Math.min(maxValue, Math.max(0, (rawY / containerHeight) * 100)).toFixed(
          2,
        ),
      );
      if (component.componentType == "CHART") {
        let obj = JSON.parse(JSON.stringify(component.bind));
        component.bind["echartCopy"] = obj;
      }

      // 根据组件类型设置不同的默认宽度和高度
      let defaultWidth = 50.0; // 默认宽度50%
      let defaultHeight = 30.0; // 默认高度30%

      if (
        component.componentType === "TABLE" ||
        component.componentType === "YLTABLE"
      ) {
        defaultWidth = 70.0; // 表格组件宽度70%
        defaultHeight = 45.0; // 表格组件高度45%
      } else if (
        component.componentType === "searchform" ||
        component.componentType == "YLsearchform"
      ) {
        defaultWidth = 80.0; // 表单组件宽度80%
        defaultHeight = 15.0; // 表单组件高度15%
      }

      droppedComponents.value.push({
        ...component,
        width: defaultWidth,
        height: defaultHeight,
        c_left: xPercent, // 使用百分比位置
        c_top: yPercent, // 使用百分比位置
        isSelected: false,
        uuidC: generateRandomId(),
      });
      console.log(droppedComponents.value, "droppedComponents.value");
      const length = droppedComponents.value.length - 1;
      selectComponent(length, droppedComponents.value[length]);
      // Object.assign(currentConfig, component.bind.echartCopy);
    }
  } catch (error) {
    //  console.error("拖拽数据解析失败:", error);
  }
};

// 展示对应组件
const showFn = (data, valueTab) => {
  if (data.find((f) => f.componentType == "DIV_TAB")) {
    return data.filter(
      (f) => f.componentType == "DIV_TAB" || f.bind.tabIndex == valueTab,
    );
  } else {
    return data;
  }
};

// 添加组件拖拽相关变量
let isComponentDragging = false;
let currentComponentIndex = -1;
let componentInitialX, componentInitialY, componentOffsetX, componentOffsetY;
// 组件拖拽移动
const handleComponentMouseMove = (e) => {
  if (
    !isComponentDragging ||
    currentComponentIndex === -1 ||
    !droppedComponents.value[currentComponentIndex]
  )
    return;
  e.preventDefault();
  const containerRect = document
    .querySelector(".drop-container")
    .getBoundingClientRect();
  const component = droppedComponents.value[currentComponentIndex];

  // 计算容器宽度和高度
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  const stepPercent = 1; // 1%为步长

  // 计算鼠标位置百分比并四舍五入到最近的步长
  const rawX = e.clientX - containerRect.left - componentOffsetX;
  const rawY = e.clientY - containerRect.top - componentOffsetY;
  const rawXPercent = (rawX / containerWidth) * 100;
  const rawYPercent = (rawY / containerHeight) * 100;
  const snappedX = Math.round(rawXPercent / stepPercent) * stepPercent;
  const snappedY = Math.round(rawYPercent / stepPercent) * stepPercent;

  // 边界限制（确保组件不会超出容器）
  const maxX = 100 - component.width;
  const maxY = 100 - component.height;
  const boundedX = Number(Math.max(0, Math.min(snappedX, maxX)).toFixed(2));
  const boundedY = Number(Math.max(0, Math.min(snappedY, maxY)).toFixed(2));

  // 更新组件位置百分比
  component.c_left = boundedX;
  component.c_top = boundedY;
};

// 组件拖拽结束
const stopComponentDrag = () => {
  if (isComponentDragging) {
    isComponentDragging = false;
    if (
      currentComponentIndex !== -1 &&
      droppedComponents.value[currentComponentIndex]
    ) {
      // Find the wrapper element using the component's uuidC
      const elements = document.querySelectorAll(".dropped-item-wrapper");
      for (let el of elements) {
        // Get the key attribute which should be the uuidC
        const keyAttr = el.getAttribute("key");
        if (
          keyAttr &&
          keyAttr === droppedComponents.value[currentComponentIndex].uuidC
        ) {
          el.style.zIndex = 1; // 恢复默认层级
          break;
        }
      }
      currentComponentIndex = -1;
    }
  }
};

// 切换抽屉显示/隐藏
const toggleMessageArea = () => {
  isMessageAreaVisible.value = !isMessageAreaVisible.value;
};

// 切换报表显示/隐藏
const toggleDetailArea = () => {
  isdetailAreaVisible.value = !isdetailAreaVisible.value;
};

// 修改选择组件方法，确保状态正确更新
const selectComponent = (index, itemData) => {
  idKey.value = itemData.uuidC;
  typeKey.value = itemData.componentType;
  // 重置所有选中状态
  droppedComponents.value.forEach((item) => (item.isSelected = false));
  // 直接使用itemData来设置选中状态，不再通过索引查找
  selectedComponent.value = itemData;
  if (currentTreeNode.value) {
    selectedComponent.value.currentTreeNode = currentTreeNode.value;
    selectedComponent.value.dataSourceEntity = dataSourceEntity.value;
  }

  console.log(
    selectedComponent.value,
    "selectedComponent111111111111111111111111111111111111111111",
  );
  itemData.isSelected = true;

  // 处理图表组件的配置复制
  if (itemData.componentType === "CHART") {
    Object.assign(currentConfig, itemData.bind?.echartCopy || {});
  }
};

// 添加删除组件方法
const deleteComponent = (index, item) => {
  console.log(index, item);
  console.log(droppedComponents.value, "droppedComponents");

  // return
  if (confirm("确定要删除这个组件吗?")) {
    droppedComponents.value = droppedComponents.value.filter(
      (comp) => comp.uuidC !== item.uuidC,
    );

    // 从数组中移除组件
    // droppedComponents.value.splice(index, 1);
    // 更新store中的数据
    // designStore.components = [...droppedComponents.value];
  }
};

// 添加尺寸调整相关变量
const isResizing = ref(false);
const resizeDirection = ref("");
const resizeCursor = ref("");
const currentResizeIndex = ref(-1);
let initialWidth,
  initialHeight,
  initialX,
  initialY,
  containerWidth,
  containerHeight,
  initialLeft,
  initialTop;

// 添加0.5%步长对齐函数
const roundToHalfPercent = (value) => {
  // 先乘以2，四舍五入到整数，再除以2，实现0.5%步长对齐
  return Number((Math.round(value * 2) / 2).toFixed(2));
};

// 优化鼠标移动检测边缘函数
const handleMouseMove = (e, item, index) => {
  if (isResizing.value || !item.isSelected) return;
  // 使用 getBoundingClientRect 获取元素位置，不受内容影响
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const width = rect.width;
  const height = rect.height;

  // 检测边缘区域 - 优化逻辑，确保即使在组件内容上方也能正确检测
  // 右边缘
  if (x >= width - edgeSize) {
    // 上边缘
    if (y < edgeSize) {
      resizeDirection.value = "top-right";
      resizeCursor.value = "nesw-resize";
    }
    // 下边缘
    else if (y >= height - edgeSize) {
      resizeDirection.value = "corner";
      resizeCursor.value = "nwse-resize";
    }
    // 仅右边缘
    else {
      resizeDirection.value = "right";
      resizeCursor.value = "ew-resize";
    }
  }
  // 左边缘
  else if (x < edgeSize) {
    // 上边缘
    if (y < edgeSize) {
      resizeDirection.value = "top-left";
      resizeCursor.value = "nwse-resize";
    }
    // 下边缘
    else if (y >= height - edgeSize) {
      resizeDirection.value = "bottom-left";
      resizeCursor.value = "nesw-resize";
    }
    // 仅左边缘
    else {
      resizeDirection.value = "left";
      resizeCursor.value = "ew-resize";
    }
  }
  // 上边缘（非左右角）
  else if (y < edgeSize) {
    resizeDirection.value = "top";
    resizeCursor.value = "ns-resize";
  }
  // 下边缘（非左右角）
  else if (y >= height - edgeSize) {
    resizeDirection.value = "bottom";
    resizeCursor.value = "ns-resize";
  }
  // 不在边缘区域
  else {
    resizeDirection.value = "";
    resizeCursor.value = "";
  }
};

// 开始调整尺寸
const handleResizeStart = (e, item, index) => {
  if (!resizeDirection.value) return;
  e.stopPropagation(); // 阻止与移动拖拽冲突

  isResizing.value = true;
  // 关键修复：使用uuidC在原始数组中查找正确的索引，而不是使用过滤后的索引
  const actualIndex = droppedComponents.value.findIndex(
    (comp) => comp.uuidC === item.uuidC,
  );
  currentResizeIndex.value = actualIndex !== -1 ? actualIndex : index;
  const containerRect = document
    .querySelector(".drop-container")
    .getBoundingClientRect();
  containerWidth = containerRect.width;
  containerHeight = containerRect.height;

  // 记录初始状态
  initialWidth = item.width;
  initialHeight = item.height;
  initialLeft = item.c_left;
  initialTop = item.c_top;
  initialX = e.clientX;
  initialY = e.clientY;

  // 添加全局事件监听
  window.addEventListener("mousemove", handleResizing);
  window.addEventListener("mouseup", handleResizeEnd);
};

// 调整尺寸过程
const handleResizing = (e) => {
  if (!isResizing.value || currentResizeIndex.value === -1) return;
  const item = droppedComponents.value[currentResizeIndex.value];
  const deltaX = e.clientX - initialX;
  const deltaY = e.clientY - initialY;

  // 根据方向计算新尺寸（百分比）
  switch (resizeDirection.value) {
    case "right":
      item.width = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialWidth + (deltaX / containerWidth) * 100),
        ),
      );
      break;
    case "bottom":
      item.height = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialHeight + (deltaY / containerHeight) * 100),
        ),
      );
      break;
    case "corner":
      item.width = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialWidth + (deltaX / containerWidth) * 100),
        ),
      );
      item.height = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialHeight + (deltaY / containerHeight) * 100),
        ),
      );
      break;
    // 上边缘调整
    case "top": {
      const newHeight = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialHeight - (deltaY / containerHeight) * 100),
        ),
      );
      item.height = newHeight;
      item.c_top = roundToHalfPercent(
        Math.max(
          0,
          Math.min(maxValue, initialTop + (initialHeight - newHeight)),
        ),
      );
      break;
    }
    // 左边缘调整
    case "left": {
      const newWidth = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialWidth - (deltaX / containerWidth) * 100),
        ),
      );
      item.width = newWidth;
      item.c_left = roundToHalfPercent(
        Math.max(0, Math.min(100, initialLeft + (initialWidth - newWidth))),
      );
      break;
    }
    // 左上角调整
    case "top-left": {
      const newWidthTL = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialWidth - (deltaX / containerWidth) * 100),
        ),
      );
      const newHeightTL = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialHeight - (deltaY / containerHeight) * 100),
        ),
      );
      item.width = newWidthTL;
      item.height = newHeightTL;
      item.c_left = roundToHalfPercent(
        Math.max(
          0,
          Math.min(maxValue, initialLeft + (initialWidth - newWidthTL)),
        ),
      );
      item.c_top = roundToHalfPercent(
        Math.max(
          0,
          Math.min(maxValue, initialTop + (initialHeight - newHeightTL)),
        ),
      );
      break;
    }
    // 右上角调整
    case "top-right": {
      item.width = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialWidth + (deltaX / containerWidth) * 100),
        ),
      );
      const newHeightTR = roundToHalfPercent(
        Math.min(
          maxValue,
          Math.max(minValue, initialHeight - (deltaY / containerHeight) * 100),
        ),
      );
      item.height = newHeightTR;
      item.c_top = roundToHalfPercent(
        Math.max(
          0,
          Math.min(maxValue, initialTop + (initialHeight - newHeightTR)),
        ),
      );
      break;
    }
  }
};

// 结束调整尺寸
const handleResizeEnd = () => {
  isResizing.value = false;
  currentResizeIndex.value = -1;
  resizeDirection.value = "";
  resizeCursor.value = "";
  window.removeEventListener("mousemove", handleResizing);
  window.removeEventListener("mouseup", handleResizeEnd);
};

// 鼠标离开时重置状态
const resetResizeState = () => {
  if (!isResizing.value) {
    resizeDirection.value = "";
    resizeCursor.value = "";
  }
};

//  点击保存页面
const handleSavePage = () => {
  save_show.value = true;
  if (route.query.pageId) {
    save_formData.pageName = route.query.pageName;
    save_formData.pageCode = route.query.code;
    save_formData.projectId = route.query.projectId;
    save_formData.pageStatus = route.query.pageStatus;
  } else {
    save_formData.pageName = "";
    save_formData.pageCode = "";
    save_formData.projectId = "";
    save_formData.pageStatus = "";
  }
};

// 优化组件配置处理函数
const processComponentConfig = (component) => {
  const config = deepClone(component);
  const { dsConfig, dsType, designChartConfigList } = config.bind;
  // 删除不需要的属性
  delete config.bind.dsConfig;
  delete config.bind.dsType;
  // 删除可能导致循环引用的属性
  delete config.currentTreeNode;
  delete config.parentNode;

  console.log(config, "config");

  // 基础配置对象
  const baseConfig = {
    componentType: config.componentType,
    extendAttr: JSON.stringify(config),
  };

  // 根据组件类型添加特定配置
  if (
    component.componentType === "TABLE" ||
    component.componentType === "YLTABLE" ||
    component.componentType === "searchform" ||
    component.componentType === "YLsearchform"
  ) {
    baseConfig.tableConfigParam = {
      pageOpen: config.bind.pageOpen ?? "",
      treeModel: config.bind.treeModel ?? "",
      topColumnValue: config.bind.topColumnValue ?? "",
      parentColumn: config.bind.parentColumn ?? "",
      childColumn: config.bind.childColumn ?? "",
      exportbtn: config.bind.exportbtn ?? "",
    };
  } else if (component.componentType === "CHART") {
    baseConfig.designChartConfigParam = {
      chartType: config.chartType,
      chartTitle: config.bind.chartTitle || "图表标题", // 使用动态标题
      designChartConfigList: designChartConfigList || [], // 使用组件绑定的配置
    };
  }
  // 添加数据源配置（如果存在）
  if (dsType) {
    baseConfig.designDatasourceParam = {
      datasourceType: dsType,
      datasourceConfig: JSON.stringify({ bash: dsConfig }),
    };
  }
  // 处理顶部按钮，全部去除
  if (
    baseConfig.componentType === "TABLE" ||
    baseConfig.componentType === "YLTABLE"
  ) {
    let strValue = JSON.parse(baseConfig.extendAttr);
    strValue.bind.btnList = [];
    baseConfig.extendAttr = JSON.stringify(strValue);
  }
  return baseConfig;
};

const columnInfocopy = ref(null);
const scriptInfoCopy = ref(null);
// 优化后的保存配置函数
const saveConfig = () => {
  if (!route.query.pageId) {
    // 检查所有组件是否都已保存
    const unsavedComponents = droppedComponents.value.filter(
      (item) => item.isSave !== true,
    );

    if (unsavedComponents.length > 0) {
      // 有未保存的组件，收集组件名称
      const componentNames = unsavedComponents.map((item) => {
        // 尝试获取组件名称，如果没有则使用组件类型
        return item.name || item.componentType || "未知组件";
      });

      // 生成提示信息
      const message = `请先保存以下组件配置，再切换节点：\n${componentNames.join("、")}`;
      ElMessage.warning(message);

      // 重置树形节点选中状态为当前节点
      if (treeRef2.value && currentTreeNode.value) {
        treeRef2.value.setCurrentKey(currentTreeNode.value.id);
      }
      return;
    }
  }
  // 开始保存，设置loading状态
  saveLoading.value = true;
  try {
    // 处理所有组件配置
    console.log(dataSource, "dataSource2312312312323");
    // 扁平化处理designTableColumns函数

    // 处理dataSource到childrenPage的转换函数
    const transformDataSource = (dataSource) => {
      console.log(dataSource, "dataSource0000000000000000000");
      // 只有在dataSource.droppedComponents存在且是数组时才执行循环
      if (
        dataSource.droppedComponents &&
        Array.isArray(dataSource.droppedComponents)
      ) {
        dataSource.droppedComponents.forEach((item) => {
          if (item.componentType == "YLTABLE") {
            console.log(item, "item.currentTreeNode11111111111111111111111111");
            columnInfocopy.value = item.bind.designTableColumns; // 深拷贝
            scriptInfoCopy.value = item.bind.dsConfig
              ? item.bind.dsConfig
              : JSON.stringify(dataSource.scriptInfo); //详情表格没有dsConfig的话取JSON.stringify(dataSource.scriptInfo)值，否则取item.bind.dsConfig
          }
        });
      }

      // 扁平化处理函数
      const flatten = (columns) => {
        if (!columns || columns.length === 0) {
          return [];
        }
        return columns.reduce((result, column) => {
          result.push(column);
          if (column.children && column.children.length > 0) {
            result.push(...flatten(column.children));
          }
          return result;
        }, []);
      };
      // 执行扁平化处理
      const flattenedColumns = flatten(columnInfocopy.value);
      let columnInfocopy2 = [];
      flattenedColumns.forEach((item) => {
        columnInfocopy2.push({
          columnId: item.idRow,
          columnName: item.columnLabel,
          columnCode: item.columnName,
          lineNumber: item.lineNumber,
          columnNumber: item.columnNumber,
          isNeedSum: item.isNeedSum,
          isHeader: item.isHeader,
          rowSpan: item.rowSpan,
          colSpan: item.colSpan,
          parentColumnId: item.parentColumnId,
          columnWidth: item.columnWidth,
          formula: { scriptText: item.columnFormula },
        });
      });
      console.log("扁平化后的列数据:", flattenedColumns);
      let scriptInfo = [];
      console.log(scriptInfoCopy.value,"scriptInfoCopy.value");
      // 安全处理scriptInfo
      if (
        scriptInfoCopy.value &&
        typeof scriptInfoCopy.value === "string" &&
        scriptInfoCopy.value.length > 0
      ) {
        try {
          const parsedConfig = JSON.parse(scriptInfoCopy.value);
          if (Array.isArray(parsedConfig)) {
            parsedConfig.forEach((item) => {
              scriptInfo.push({
                scriptText: item.queryStatement||item.scriptText,
                scriptType: item.dsType||item.scriptType,
                scriptDatasourceUuid: item.dataSourceType||item.scriptDatasourceUuid,
                columnInfo: item.columnName||item.columnInfo,
              });
            });
          }
        } catch (error) {
          console.error("解析scriptInfo失败:", error);
        }
      }
      // 获取组件配置实体的函数
      const getComponentEntities = (dataSource) => {
        console.log(
          dataSource,
          dataSource.droppedComponents,
          "dataSourcedroppedComponents的值",
        );
        // 检查droppedComponents是否存在且是数组
        if (
          !dataSource.droppedComponents ||
          !Array.isArray(dataSource.droppedComponents)
        ) {
          return [];
        }

        // 安全处理每个组件
        const entities = [];
        for (const component of dataSource.droppedComponents) {
          try {
            // 处理单个组件配置
            const entity = processComponentConfig(component);
            if (entity) {
              entities.push(entity);
            }
          } catch (error) {
            console.error("处理组件配置失败:", error);
            // 单个组件处理失败不影响整体
            continue;
          }
        }
        console.log(entities, "entities");
        return entities;
      };
      console.log(
        dataSource.droppedComponents,
        dataSource,
        dataSource.scriptInfo,
        "dataSource4444444444444444444444444444444",
      );
      const transformed = {
        pageId: dataSource.formData?.pageId || dataSource.pageId || "",
        projectId: dataSource.formData?.projectId || dataSource.projectId || "",
        pageName: dataSource.formData?.pageName || dataSource.pageName || "",
        pageCode: dataSource.formData?.pageCode || dataSource.pageCode || "",
        pageStatus:
          dataSource.formData?.pageStatus || dataSource.pageStatus || "",
        pageAddr: dataSource.formData?.pageAddr || dataSource.pageAddr || "",
        columnTotalAlways:
          dataSource.formData?.columnTotalAlways ||
          dataSource.columnTotalAlways ||
          "",
        keyWord: dataSource.formData?.keyWord || dataSource.keyWord || "",
        isPage: dataSource.formData?.isPage || dataSource.isPage || "",
        mrmsDesignCompoentEntitys: dataSource.droppedComponents
          ? getComponentEntities(dataSource)
          : dataSource.mrmsDesignCompoentEntitys,
        columnInfo: dataSource.droppedComponents
          ? columnInfocopy2
          : dataSource.columnInfo,
        scriptInfo: dataSource.droppedComponents
          ? scriptInfo
          : dataSource.scriptInfo,
        childrenPage: [],
      };

      // 递归处理children
      if (dataSource.children && dataSource.children.length > 0) {
        transformed.childrenPage = dataSource.children.map((child) =>
          transformDataSource(child),
        );
      }
      return transformed;
    };
    // 构建请求参数
    console.log(dataSource.value[0], "dataSource.value[0]");
    const requestParams = transformDataSource(dataSource.value[0]);

    // 判断是更新还是新增
    if (route.query.pageId) {
      requestParams.pageId = route.query.pageId;
      console.log(requestParams, "requestParams");
      updateMrmsTableMangerInfo(requestParams)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("保存成功！");
            // 跳转到/pageListBusiness路由
            removeTab('医疗信息化-配置页面');
            router.push("/pageListBusiness");
          }
          // 保存完成，关闭loading状态
          saveLoading.value = false;
        })
        .catch((error) => {
          console.error("更新失败:", error);
          ElMessage.error("保存失败，请重试！");
          // 保存失败，关闭loading状态

          saveLoading.value = false;
        });
    } else {
      addMrmsTableMangerInfo(requestParams)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("保存成功！");
            // 跳转到/pageListBusiness路由
            removeTab("医疗信息化-配置页面");
            router.push("/pageListBusiness");
          }
          // 保存完成，关闭loading状态
          saveLoading.value = false;
        })
        .catch((error) => {
          console.error("新增失败:", error);
          ElMessage.error("保存失败，请重试！");
          // 保存失败，关闭loading状态
          saveLoading.value = false;
        });
    }
  } catch (error) {
    console.error("配置处理异常:", error);
    ElMessage.error("配置处理异常，请检查组件配置！");
    // 发生异常，关闭loading状态
    saveLoading.value = false;
  }
};

// 应用项目
const appLicationOptionsFn = () => {
  let obj = {};
  getMrmsProjectInfoSelect(obj).then((res) => {
    appList.value = res.data.map((item) => {
      return {
        ...item,
        label: item.projectName,
        value: item.id,
      };
    });
  });
};
const styleConfigRef = ref(null);
//  处理每个类型的数据
function pageDetailShowFn(arr) {
  console.log(arr, "arr99999999999999999999999999");
  // 非空检查
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return [];
  }

  let dataList = []; //  定义一个空数组
  let queryDataForm = [];
  tabIndexDefault.value = "";
  for (let i = 0, len = arr.length; i < len; i++) {
    let type = arr[i].componentType; //  组件类型
    let objRow = arr[i]; //  当前行内容
    let objPush = JSON.parse(objRow.extendAttr); //  解析组件配置
    objPush.bind["apiParms"] = { componentId: objRow.componentId }; //  给接口传参（额外参数）
    // 是否存在数据来源
    console.log(objRow, "523452342342342342342");
    if (objRow.dsType) {
      objPush.bind["dsConfig"] = JSON.parse(objRow?.dsConfig)?.bash;
      objPush.bind["dsType"] = objRow.dsType;
    }
    // 判断组件类型
    if (type == "CHART") {
      // 图表组件处理逻辑
      objPush.bind["title"] = objPush.bind.title || "";
      objPush.bind["subtitle"] = objPush.bind.subtitle || "";
      objPush.bind["theme"] = objPush.bind.theme || "";
      objPush.bind["showLegend"] = objPush.bind.showLegend || false;
      objPush.bind["doubleBar"] = objPush.bind.doubleBar || false; // 是否双向展示
      objPush.bind["inverse"] = objPush.bind.inverse || false; // 是否反转
      objPush.bind["showToolbox"] = objPush.bind.showToolbox || false;
      objPush.bind["showGrid"] = objPush.bind.showGrid || false;
      objPush.bind["colors"] = objPush.bind.colors || [
        "#5470c6",
        "#91cc75",
        "#fac858",
        "#ee6666",
        "#73c0de",
      ];
      objPush.bind["stack"] = objPush.bind.stack; //  是否堆叠
      objPush.bind["rowClickData"] = objPush.bind.rowClickData;
      objPush.bind["jumPathEchart"] = objPush.bind.jumPathEchart;
      objPush.bind["jumPathEchartParams"] = objPush.bind.jumPathEchartParams;
      objPush.bind["noKs"] = objPush.bind.noKs;
      objPush.bind["scaleShow"] = objPush.bind.scaleShow;
      objPush.bind["radarMaxValue"] = objPush.bind.radarMaxValue;
      objPush.bind["paramsValueList"] = objPush.bind.paramsValueList;
      ((objPush.bind["hasRequired"] = objPush.bind.hasRequired || false), //  必填参数是否
        // objPush.bind["xAxis"] = objPush.bind.xAxis || [];
        // objPush.bind["series"] = objPush.bind.series || [];
        // objPush.bind["xAxis"] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        // objPush.bind["series"] = [{ name: '谷歌', data: [1, 2, 3, 4, 5, 6, 7] }, { name: '360', data: [1, 2, 3, 4, 5, 6, 7] }];
        // 图表组件接口路径
        // objPush.bind['apiUrl'] = '/business/design-data/queryDataPage';
        Object.assign(currentConfig, objPush.bind.echartCopy));
      const designChartConfigListTs =
        currentConfig?.dataConfig?.designChartConfigList;
      currentConfig.dataConfig.designChartConfigList = designChartConfigListTs
        ? designChartConfigListTs
        : [];
    } else if (type == "TABLE" || type == "YLtable") {
      //  给表格每一行添加idRow唯一值
      objPush.bind["designTableColumns"] = addParamToArrayRecursively(
        objPush.bind?.designTableColumns || [],
        "idRow",
      );
      // 表格组件接口路径
      objPush.bind["apiUrl"] = "/business/design-data/queryDataPage";
    } else if (type == "searchform" || type == "YLsearchform") {
      queryDataForm = objPush.bind?.items || [];
    } else if (type == "DIV_TAB") {
      tabIndexDefault.value = objPush.bind.listPath[0].value;
    }
    dataList.push(objPush);
  }
  nextTick(() => {
    for (let i = 0, len = dataList.length; i < len; i++) {
      let type = arr[i].componentType; //  组件类型
      if (type == "TABLE" || type == "YLtable") {
        dataList[i].bind.apiParms["queryDataForm"] = queryDataForm;
      }
    }
  });
  return dataList;
}
const dataSourceEntityCopy = ref(null);
//  页面详情
const pageDetailApiFn = (code) => {
  console.log(code, "code0000000000000000000000000");
  let obj = {
    pageId: code,
  };
  getMrmsTableMangerInfo(obj).then((res) => {
    if (res.code == 200) {
      let arr = res.data?.mrmsDesignCompoentEntitys || [];
      console.log(arr, "arrrr");
      droppedComponents.value = [];
      droppedComponents.value = pageDetailShowFn(arr);
      // droppedComponents.value.forEach((item) => {
      //    console.log(res.data,item.componentType,'res.data213423434234234')
      //   if (item.componentType == "YLTABLE") {
      //     item.bind.designTableColumns.forEach((item2) => {
      //       res.data.columnInfo.forEach((item1) => {
      //       if(item2.columnLabel == item1.columnLabel){
      //         item2.idRow = item1.culumnId
      //       }
      //     })
      //     })
          
      //     console.log(item.bind.designTableColumns,res.data.columnInfo,'res.data99999999')
      //   }
      // })
      // console.log(droppedComponents.value, "droppedComponents.valuedroppedComponents.valuedroppedComponents.value");
      // 处理arr数据，转换为tree组件所需的格式
      const convertToTreeData = (items) => {
        console.log(items, "itwems111");
        const nodeMap = new Map();
        const rootNodes = [];

        // 递归处理节点和子节点
        const processNode = (item) => {
          if (item.projectId) {
            const selectedProject = appList.value.find(
              (item1) => item1.id === item.projectId,
            );
            if (selectedProject) {
              console.log("选中的项目完整数据:", selectedProject);
              // 只有当selectedComponent存在时才更新其属性
              // 确保selectedComponent有dataSourceEntity属性
              dataSourceEntityCopy.value =
                selectedProject.dataSourceEntity || {};
              // 可以在这里使用选中的项目数据进行其他操作
            }
          }
          console.log(item, item.childrenPage, "item9999999999999999999");
          const node = {
            ...item,
            id: item.pageId || item.id || generateRandomId(),
            label: item.pageName,
            children: [], // 初始化为空数组
            pageName: item.pageName,
            pageCode: item.pageCode || "",
            parentId: item.parentId || "",
            projectId: item.projectId || "",
            pageLabel: item.pageLabel || "",
            dataSourceEntity: dataSourceEntityCopy.value || {},
          };

          // 存储节点到map
          nodeMap.set(node.id, node);

          // 递归处理子节点
          if (item.childrenPage && item.childrenPage.length > 0) {
            item.childrenPage.forEach((childItem) => {
              const childNode = processNode(childItem);
              node.children.push(childNode);
            });
          }

          return node;
        };

        // 处理所有顶层节点
        items.forEach((item) => {
          const node = processNode(item);
          if (!node.parentId) {
            // 没有parentId的节点作为根节点
            rootNodes.push(node);
          }
        });

        return rootNodes;
      };

      // 执行转换并更新dataSource
      const treeData = convertToTreeData([res.data]);
      dataSource.value = treeData;
      console.log("转换后的tree数据:", dataSource.value);

      // 默认点击第一个节点
      nextTick(() => {
        if (treeData && treeData.length > 0) {
          const firstNode = treeData[0];
          handleNodeClick(firstNode);
          // 设置树形组件当前选中节点，显示选中颜色
          if (treeRef2.value && firstNode.id) {
            treeRef2.value.setCurrentKey(firstNode.id);
          }
          console.log("默认点击了第一个节点:", firstNode);
        }
      });

      // 组件加载完成后，延迟设置配置确保DOM已更新
      // setTimeout(() => {
      //   if (styleConfigRef.value && selectedComponent.value && typeKey.value === 'CHART') {
      //     styleConfigRef.value.setConfig(currentConfig);
      //   }
      // }, 100);
    }
  });
};

// 添加组件拖拽事件监听
onMounted(() => {
  if (route.query.pageId) {
    pageDetailApiFn(route.query.pageId);
  }
  appLicationOptionsFn();
  // 修复事件监听注册问题
  window.addEventListener("mousemove", handleComponentMouseMove);
  window.addEventListener("mouseup", stopComponentDrag);

  // 添加拖拽功能相关变量
  const contentArea = ref(null);
  let isDragging = false;
  let initialX, initialY, offsetX, offsetY;
  // 拖拽开始
  const startDrag = (e) => {
    // 确保只有点击内容区头部才触发内容区拖拽
    if (e.target.classList.contains("area-header")) {
      isDragging = true;
      const rect = contentArea.value.getBoundingClientRect();
      initialX = e.clientX;
      initialY = e.clientY;
      offsetX = initialX - rect.left;
      offsetY = initialY - rect.top;
      contentArea.value.style.cursor = "grabbing";
      e.stopPropagation(); // 阻止事件冒泡
    }
  };

  // 拖拽移动
  const handleMouseMoveContent = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    const c_left = e.clientX - offsetX;
    const c_top = e.clientY - offsetY;

    // 限制在窗口内
    const maxX = window.innerWidth - contentArea.value.offsetWidth - 20;
    const maxY = window.innerHeight - contentArea.value.offsetHeight - 20;
    const boundedX = Math.max(20, Math.min(c_left, maxX));
    const boundedY = Math.max(20, Math.min(c_top, maxY));

    contentArea.value.style.left = `${boundedX}px`;
    contentArea.value.style.top = `${boundedY}px`;
  };

  // 拖拽结束
  const stopDrag = () => {
    if (isDragging) {
      isDragging = false;
      contentArea.value.style.cursor = "grab";
    }
  };

  // 注册内容区拖拽事件
  if (contentArea.value) {
    contentArea.value.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", handleMouseMoveContent);
    window.addEventListener("mouseup", stopDrag);
  }
});

// 组件拖拽开始 - 增强目标检测
const startComponentDrag = (e, item, index) => {
  // 检查是否点击了树形节点
  if (!isTreeNodeClicked.value) {
    ElMessage.warning("请先选择数据报表再添加组件");
    return;
  }
  // 阻止事件冒泡到内容区拖拽
  e.stopPropagation();
  const wrapper = e.target.closest(".dropped-item-wrapper");
  const itemElement = e.target.closest(".dropped-item");

  if (wrapper && itemElement) {
    isComponentDragging = true;
    // 关键修复：使用uuidC在原始数组中查找正确的索引，而不是使用过滤后的索引
    const actualIndex = droppedComponents.value.findIndex(
      (comp) => comp.uuidC === item.uuidC,
    );
    currentComponentIndex = actualIndex !== -1 ? actualIndex : index;

    const component = droppedComponents.value[currentComponentIndex];
    const rect = wrapper.getBoundingClientRect();
    componentInitialX = e.clientX;
    componentInitialY = e.clientY;
    componentOffsetX = componentInitialX - rect.left;
    componentOffsetY = componentInitialY - rect.top;
    wrapper.style.zIndex = 5; // 拖拽时置于顶层
  }
};

//  处理渲染组件
const isComponent = (item, tabIndex, list) => {
  if (item.componentType == "CHART") {
    // 图表类型（例：柱形图、折线图、饼图等）
    return componentMap.CHART[item.chartType];
  } else {
    return componentMap[item.componentType];
  }
};

// 处理循环引用的深拷贝函数
const deepClone = (obj, visited = new Map()) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (visited.has(obj)) {
    return visited.get(obj);
  }
  let clone;
  if (obj instanceof Array) {
    clone = [];
    visited.set(obj, clone);
    for (let i = 0; i < obj.length; i++) {
      clone[i] = deepClone(obj[i], visited);
    }
  } else {
    clone = {};
    visited.set(obj, clone);
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = deepClone(obj[key], visited);
      }
    }
  }
  return clone;
};

// 递归遍历树形节点，更新匹配的节点
const updateTreeNode = (nodes, formData, droppedComponents) => {
  console.log( formData, "nodesfgegwergwergwegeg");
  for (const node of nodes) {
    // 比较节点id和formData中的id是否相等
    if (node.id === formData.id) {
      console.log(node, droppedComponents, formData, "node");
      // 更新节点的pageName
      node.pageName = formData.pageName || formData.titleName || "";
      node.label = formData.pageName || formData.titleName || "";
      node.pageCode = formData.pageCode || "";
      node.pageAddr = formData.pageAddr || "";
      node.pageStatus = formData.pageStatus || "";

      // 在节点中保存formData
      node.formData = deepClone(formData);
      node.droppedComponents = deepClone(droppedComponents);
      console.log(node, "node99999999999999999");
      // if(route.query.pageId){
      //   node.currentTreeNode=droppedComponents
      // }
    }
    // if(formData=='echarts'){
    //    node.droppedComponents = deepClone(droppedComponents);
    //    alert(3423423423)
    //    console.log(node.droppedComponents, "droppedComponentsnode99999999999999999");
    // }
    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      updateTreeNode(node.children, formData, droppedComponents);
    }
  }
};

//  表格、表单控件保存
const handleUpdate = (data) => {
  // console.log(selectedComponent.value, 'selectedComponent');
  const { idComponent, formData } = data;
  console.log(idComponent, formData, "formData222222222222222222");
  for (let i = 0, len = droppedComponents.value.length; i < len; i++) {
    if (droppedComponents.value[i].uuidC == idComponent) {
      droppedComponents.value[i].isSave = true;
      droppedComponents.value[i].bind = deepClone(formData) ?? {};
    }
  }
  console.log(droppedComponents.value, "droppedComponents.value12");

  // 更新树形节点数据
  updateTreeNode(dataSource.value, formData, droppedComponents.value);
  //  droppedComponents.value = [];
  isMessageAreaVisible.value = false;
  ifFinish.value = false;
};

// 处理配置变化(echarts)
const handleConfigChange = (config) => {
  for (let i = 0, len = droppedComponents.value.length; i < len; i++) {
    if (droppedComponents.value[i].uuidC == selectedComponent.value.uuidC) {
      droppedComponents.value[i].bind = {
        ...droppedComponents.value[i].bind,
        topConfig: config.topConfig, //  配置标题
        title: config.basic.title, //  标题
        direction: config.basic.direction,
        subtitle: config.basic.subtitle, // 副标题
        theme: config.basic.theme, //  主题
        showLegend: config.basic.showLegend, //  是否显示图例
        doubleBar: config.basic.doubleBar, // 是否双向展示
        inverse: config.basic.inverse, // 是否反转
        legendPosition: config.basic.legendPosition, // 图例位置
        showToolbox: config.basic.showToolbox,
        colors: config.colors.customColors,
        showGrid: config.basic.showGrid, // 是否展示网格线
        gridLeft: config.basic.gridLeft, //  // 网格线样式  左
        gridRight: config.basic.gridRight, //  // 网格线样式  右
        gridTop: config.basic.gridTop, //  // 网格线样式  上
        gridBottom: config.basic.gridBottom, //  // 网格线样式  下
        legendLeft: config.basic.legendLeft, //  // 图例样式  左
        legendRight: config.basic.legendRight, //  // 图例样式  右
        legendTop: config.basic.legendTop, //  // 图例样式  上
        legendBottom: config.basic.legendBottom, //  // 图例样式  下
        stack: config.basic?.stack || "", //  是否堆叠
        rowClickData: config.basic.rowClickData, //  点击事件
        jumPathEchart: config.basic.jumPathEchart, // 跳转
        paramsValueList: config.basic.paramsValueList, //  必填参数（表格联动）
        hasRequired: config.basic.hasRequired || false, //  必填参数是否
        jumPathEchartParams: config.basic.jumPathEchartParams, // 跳转携带参数
        noKs: config.basic.noKs,
        scaleShow: config.basic.scaleShow, // 刻度处理
        radarMaxValue: config.basic.radarMaxValue, // 雷达图对比
        rotate: config.basic.rotate, // 旋转角度
        echartCopy: config,
        dsType: config.dataConfig.dsType,
        dsConfig: config.dataConfig.dsConfig,
        designChartConfigList: config.dataConfig.designChartConfigList || [],
      };
    }
  }
  // Object.assign(currentConfig, config)
   console.log(droppedComponents.value, "droppedComponents.value11");
    // updateTreeNode(dataSource.value, 'echarts', droppedComponents.value);
  console.log("配置已更新:", config);
};

//  添加组件右击
const addTab = ({ tab, item, index }) => {
  // 如果传入了tab参数，使用它作为组件配置
  if (tab) {
    try {
      const containerRect = document
        .querySelector(".drop-container")
        .getBoundingClientRect();
      // 计算初始位置百分比（默认位置，可以根据需要调整）
      // 这里使用固定位置，可以根据实际需求修改为鼠标位置或其他逻辑
      const xPercent = 10; // 默认左侧10%
      const yPercent = 10; // 默认顶部10%
      // 深拷贝组件配置，避免引用问题
      const component = JSON.parse(JSON.stringify(tab));
      component.bind["tabIndex"] = item.value;
      // 如果是图表组件，添加echartCopy配置
      if (component.componentType == "CHART") {
        let obj = JSON.parse(JSON.stringify(component.bind));
        component.bind["echartCopy"] = obj;
      }
      // 添加新组件到droppedComponents数组
      droppedComponents.value.push({
        ...component,
        width: 50.0, // 默认宽度50%
        height: 30.0, // 默认高度30%
        c_left: xPercent, // 使用百分比位置
        c_top: yPercent, // 使用百分比位置
        isSelected: false,
        uuidC: generateRandomId(),
      });

      // 自动选中新添加的组件
      const length = droppedComponents.value.length - 1;
      selectComponent(length, droppedComponents.value[length]);
    } catch (error) {
      console.error("添加组件失败:", error);
    }
  }
};

const changTab = ({ item, index }) => {
  console.log(item, index);
  tabIndexDefault.value = item.value;
};
</script>

<style lang="scss" scoped>
.drag-container {
  font-size: 12px !important;
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #fff;
}

/* 树形节点选中样式 */
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff !important;
  color: #409eff !important;
}

.tree-node-selected {
  color: #409eff !important;
}

.component-list {
  width: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.list-header {
  padding: 10px;
  background-color: #f5f5f5;
  font-weight: bold;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
}

.list-content {
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.component-item {
  padding: 8px;
  width: 45%;
  text-align: center;
  margin-bottom: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: move;
  box-sizing: border-box;
  transition: background-color 0.2s;
}

.component-item:hover {
  background-color: #e0e0e0;
}

.content-area {
  width: 100%;
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: absolute;
  /* 可通过修改此值调整水平位置 */
  /* left: 210px; */
  top: 0px; /* 可通过修改此值调整垂直位置 */
  right: 0px;
  bottom: 0px;
  cursor: grab;
  transition: all 0.1s ease;
}

.area-header {
  justify-content: flex-end;
  padding: 10px;
  background-color: #f5f5f5;
  font-weight: bold;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
  height: 45px;
  box-sizing: border-box;
}
.detail-data {
  position: absolute;
  background-color: #f5f7fa;
  left: 0;
  top: 0;
  height: 100%;
  width: 15%;
  transition: transform 0.3s ease;
  transform: translateX(0);
  display: flex;
  flex-direction: column;
  z-index: 6;
}
.drop-container {
  /* 确保父容器有明确尺寸，使百分比单位生效 */
  width: 100%;
  height: calc(100% - 45px); /* 可根据需要调整固定高度或使用vh单位 */
  position: relative;
  background-color: #ece9e9;
  background-image:
    linear-gradient(to right, #ccc 1px, transparent 1px),
    linear-gradient(to bottom, #ccc 1px, transparent 1px);
  background-size: 4% 4%; /* 调整为5%的网格间距 */
  background-position: 0 0;
}

.dropped-item-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
}

.dropped-item {
  border: 1px dashed #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  min-width: auto;
  min-height: auto;
  /* 添加用户选择禁止，防止文本选中影响点击 */
  user-select: none;
}

/* 增强选中状态样式 */
.dropped-item.selected {
  /* border-color: #409eff; */
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  background-color: rgba(64, 158, 255, 0.05);
}

.size-controls {
  position: absolute;
  bottom: 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  display: flex;
  width: 100%;
  box-sizing: border-box;
  z-index: 99;
  gap: 10px;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.size-input {
  width: 80px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

/* 添加删除按钮样式 */
.delete-component-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.delete-component-btn:hover {
  background-color: #ff7875;
}

/* 调整光标样式 */
.ew-resize {
  cursor: ew-resize !important;
}
.ns-resize {
  cursor: ns-resize !important;
}
.nwse-resize {
  cursor: nwse-resize !important;
}
.nesw-resize {
  cursor: nesw-resize !important;
}

/* 抽屉样式 */
.message-area {
  position: absolute;
  background-color: #f5f7fa;
  right: 0;
  top: 0;
  height: 100%;
  width: 40%;
  transition: transform 0.3s ease;
  transform: translateX(0);
  display: flex;
  flex-direction: column;
  z-index: 6;
}

/* 拖拽手柄样式 */
.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 5px;
  height: 100%;
  cursor: ew-resize;
  background-color: transparent;
  z-index: 10;
}

.resize-handle:hover {
  background-color: rgba(64, 158, 255, 0.2);
}

.resize-handle:active {
  background-color: rgba(64, 158, 255, 0.4);
}

/* 加载遮罩层样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-icon {
  animation: rotate 1s linear infinite;
  font-size: 20px;
  color: #409eff;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.message-area.hidden {
  transform: translateX(100%);
  z-index: 6;
}

/* 收起按钮样式 */
.collapse-btn {
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 40px;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px 0 0 4px;
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
  font-size: 10px;
}
.detail-btn {
  position: absolute;
  right: -20px;
  top: 45%;
  transform: translateY(50%);
  width: 20px;
  height: 40px;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
  font-size: 10px;
}

.detail-data.hidden {
  transform: translateX(-100%);
  z-index: 6;
}
.detail-content {
  height: 100%;
  .header-title {
    font-size: 16px;
    font-weight: bold;
    display: flex;
    margin-bottom: 10px;
  }
  .el-container {
    display: flex;
    padding: 0 10px;
    flex-direction: column;
    justify-content: space-around;
    background-color: #fff;
    height: 100%;
    .el-header {
      padding: 10px 0;
      height: auto;
      box-sizing: content-box;
    }
    .el-main {
      min-height: 30%;
      height: auto;
      flex: none;
      max-height: 40%;
      padding: 10px 0 !important;
      background-color: #fff;
    }
    .el-footer {
      flex: 1;
    }
    :deep(.el-tree-node__content) {
      height: 40px;
    }
  }
}
.collapse-btn:hover {
  background-color: #66b1ff;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
}

/* 抽屉内容样式 */
.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 标签页头部样式 */
.tab-header {
  border-bottom: 1px solid #e4e7ed;
  background-color: #fff;
}

.tab-buttons {
  display: flex;
  width: 100%;
  overflow: hidden;
  border-radius: 3px;
  background-color: #f5f7fa;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background-color: transparent;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  position: relative;
}

.tab-btn:hover {
  color: #5380fd;
  background-color: rgba(64, 158, 255, 0.1);
}

.tab-btn.active {
  color: #fff;
  background-color: #5380fd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.tab-btn.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #5380fd;
}

/* 内容区域样式 */
.tab-content {
  flex: 1;
  overflow-y: hidden;
}

.tab-panel {
  height: 100%;
}

.tab-panel h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.tab-panel p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}
/* 添加组件宽高信息显示样式 */
.component-size-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: #409eff;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 5;
}
</style>
