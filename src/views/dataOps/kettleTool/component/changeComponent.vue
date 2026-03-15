<template>
  <div class="cardShadow" v-show="!showWhitePage">
    <!-- 左侧控制台 -->
    <div class="left-panel" ref="generalToolItems">
      <div class="panel-title">核心对象</div>
      <el-input v-model="searchKeyword" placeholder="请输入关键字搜索" style="margin-bottom: 10px;" />
      <!-- 输入部分 -->
      <div class="sub-panel">
        <div class="sub-title" @click="toggleSection('input')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          输入
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.input" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.input">
            <div v-for="tool in filteredToolItems" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'input')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>

        <div class="sub-title" @click="toggleSection('output')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          输出
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.output" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.output">
            <div v-for="tool in filteredToolItemsOut" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'output')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>

        <div class="sub-title" @click="toggleSection('trans')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          转换
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.trans" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.trans">
            <div v-for="tool in filteredToolItemsTrans" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'trans')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>

        <div class="sub-title" @click="toggleSection('app')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          应用
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.app" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.app">
            <div v-for="tool in filteredToolItemsApp" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'app')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>


        <div class="sub-title" @click="toggleSection('process')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          流程
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.process" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.process">
            <div v-for="tool in filteredToolItemsProcess" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'process')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>

        <div class="sub-title" @click="toggleSection('script')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          脚本
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.script" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.script">
            <div v-for="tool in filteredToolItemsScript" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'script')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>

        <div class="sub-title" @click="toggleSection('connection')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          连接
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.connection" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.connection">
            <div v-for="tool in filteredToolItemsConnection" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'connection')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>


        <div class="sub-title" @click="toggleSection('statistical')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          统计
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.statistical" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.statistical">
            <div v-for="tool in filteredToolItemsStatistical" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'statistical')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>

        <div class="sub-title" @click="toggleSection('work')">
          <img src="/src/assets/ItemImg/folderItem.svg" alt="" style="width: 18px; height: 18px;">
          作业
          <el-icon class="toggle-icon">
            <ArrowDown v-if="expandedSections.work" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-if="expandedSections.work">
            <div v-for="tool in filteredToolItemsWork" :key="tool.name" class="tool-item" draggable="true"
              @dragstart="handleDragStart($event, tool.name, 'work')">
              <img :src="tool.image" style="margin-right: 10px" /> {{ tool.name }}
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>

    <!-- 右侧 mxGraph 容器 -->
    <div class="kettleToolCss">
      <div class="toolbar">
        <span style="padding-left: 15px; color: #5380fd">{{
          transformationName
        }}</span>
        <el-button-group>
          <el-button size="small" v-for="(item, index) in buttonList" :key="index" @click="handleButtonClick(item.name)"
            :class="item.name == buttonActiveName ? 'activeButton' : ''" :disabled="item.disabled">
            <img :src="item.image" style="margin-right: 10px" />
            {{ item.name }}
          </el-button>
        </el-button-group>
      </div>
      <div ref="graphContainer" class="graph-container"></div>
    </div>

    <!-- 加载提示 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">保存中...</div>
    </div>


    <!-- <template v-for="componentConfig in componentList" :key="componentConfig.name">
      <component :is="componentConfig.component" :ref="(el) => setComponentRef(componentConfig.refName, el)"
        v-bind="componentConfig.props || {}" v-on="getEventListeners(componentConfig.listeners || {})" />
    </template> -->
    <component v-for="componentConfig in componentList" :key="componentConfig.name" :is="componentConfig.component"
      :ref="(el) => setComponentRef(componentConfig.refName, el)" v-bind="componentConfig.props || {}"
      v-on="getEventListeners(componentConfig.listeners || {})" />



    <!-- <SzycDialog :dialogVisible="resultDialogVisible" title="运行结果" width="50%" @close="resultDialogVisible = false">
      <template #uname>
        <div style="max-height: 500px; overflow-y: auto;">
          <el-tabs v-model="resultTabActiveName">
            <el-tab-pane label="运行日志" name="log">
              <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ resultLog }}</pre>
            </el-tab-pane>
            <el-tab-pane label="运行结果" name="result">
              <el-table :data="resultTableData" height="400" style="width: 100%" border>
                <el-table-column v-for="column in resultTableColumns" :key="column" :prop="column" :label="column"
                  min-width="120" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div style="display:flex;width:100%;justify-content: center;margin-top: 20px;">
          <SzycCancel @click="resultDialogVisible = false">取消</SzycCancel>
          <szycButton @click="getFile">完成</szycButton>
        </div>
      </template>
</SzycDialog> -->
    <!-- <el-drawer v-model="resultDialogVisible" title="运行结果" direction="btt" size="40%"
      @close="resultDialogVisible = false" :modal="false" :close-on-click-modal="false">
      <el-tabs v-model="resultTabActiveName">
        <el-tab-pane label="运行日志" name="log" style="max-height: 300px; overflow-y: auto">
          <pre style="white-space: pre-wrap; word-wrap: break-word">{{
            resultLog
          }}</pre>
        </el-tab-pane>
        <el-tab-pane label="运行结果" name="result">
          <el-table :data="resultTableData" style="width: 100%" border>
            <el-table-column v-for="column in resultTableColumns" :key="column" :prop="column" :label="column"
              min-width="120" align="center" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-drawer> -->
  </div>
  <div v-show="showWhitePage"></div>
  <SzycDialog :dialogVisible="taskGroupDialogVisible" width="30%" @close="cancelSetup"
    :title="setupStep == 1 ? `新建转换` : `分配任务组`" :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <!-- 第一步：输入转换名称 -->
      <div v-if="setupStep === 1">
        <el-form>
          <el-form-item label="转换名称">
            <el-input v-model="transformationName" placeholder="请输入转换名称"></el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 第二步：选择任务组 -->
      <div v-if="setupStep === 2">
        <TaskGroupSelector ref="taskGroupSelectorRef" />
      </div>

      <div style="
          display: flex;
          width: 100%;
          justify-content: center;
          margin-top: 20px;
        ">
        <SzycCancel @click="cancelSetup">取消</SzycCancel>
        <SzycCancel v-if="setupStep === 2" @click="prevStep">上一步</SzycCancel>
        <szycButton @click="nextStep">{{
          setupStep === 1 ? "下一步" : "完成"
        }}</szycButton>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  createTrans,
  saveTrans,
  openTrans,
  newStep,
  initRun,
  thenRun,
  thenResult,
  addBaseSetting,
  stopRun,
  pauseOrResumeRun
} from "@/api/kettleApi/index";
import TaskGroupSelector from "../models/component/TaskGroupSelector.vue";

import { componentList, createComponentRefs, getEventHandlers, ItemsIn, ItemsOut, ItemsTrans, ItemsApps, ItemsProcess, ItemsScript, ItemsConnection, ItemsStatistical, ItemsWork, openDialogByNodeType } from './kettleComponents';

const {
  mxCodec,
  mxUtils,
  mxGraph,
  mxRubberband,
  mxKeyHandler,
  mxEditor,
  mxConnectionHandler,
  mxOutline,
  mxPopupMenuHandler,
  mxCell,
  mxGeometry,
  mxPoint,
  mxRectangle,
  mxConstants,
  mxEvent,
  mxClient,
  mxUndoManager,
  mxUndoableEdit,
  mxConstraintHandler,
  mxImage,
  mxClipboard,
  mxCellOverlay,
  mxPopupMenu
} = window.mx;
import { ElMessage, ElMessageBox } from "element-plus";
import chart from "@/assets/itemImg/chart.svg";
import excel from "@/assets/itemImg/excel.svg";
import keyboard from "@/assets/itemImg/keyboard.svg";
import log from "@/assets/itemImg/log.svg";
import system from "@/assets/itemImg/system.svg";
import table from "@/assets/itemImg/table.svg";
import word from "@/assets/itemImg/word.svg";

import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";

const route = useRoute();
const graphContainer = ref(null);
const generalToolItems = ref(null);
const loading = ref(false);
const executionResultRef = ref(null);

// 节流函数
const throttle = (fn, delay) => {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    // 如果距离上次执行时间超过了 delay，则执行
    if (now - lastTime > delay) {
      lastTime = now;
      fn(...args);
    }
  };
};

// 创建组件引用存储对象
const componentRefs = ref(createComponentRefs());

// 设置组件引用的方法
const setComponentRef = (refName, el) => {
  if (el) {
    componentRefs.value[refName] = el;
  }
};

// 获取事件监听器映射
const getEventListeners = (listeners) => {
  const eventMap = {};
  Object.keys(listeners).forEach(event => {
    const handlerName = listeners[event];
    switch (handlerName) {
      // 步骤更新/保存
      case 'handleStepUpdate':
        eventMap[event] = handleStepUpdate;
        break;
      // 呼出编辑数据库弹窗
      case 'handleBaseUpdate':
        eventMap[event] = handleBaseUpdate;
        break;
      // 呼出新增数据库连接弹窗
      case 'handleBaseAdd':
        eventMap[event] = handleBaseAdd;
        break;
      // 保存sql
      case 'handleSave':
        eventMap[event] = handleSave;
        break;
      // 新增数据库链接
      case 'dataBaseSave':
        eventMap[event] = dataBaseSave;
        break;
      // 新增数据库连接
      case 'configRun':
        eventMap[event] = secondRun;
        break;
      // 运行预览
      case 'runPreview':
        eventMap[event] = runPreview;
        break;
      default:
        break;
    }
  });
  return eventMap;
};


const transInfoDialog = computed(() => componentRefs.value.transInfoDialog);
const sqlEditorDialog = computed(() => componentRefs.value.sqlEditorDialog);
const dataBaseInfoDialog = computed(() => componentRefs.value.dataBaseInfoDialog);
const dataBaseSettingDialog = computed(() => componentRefs.value.dataBaseSettingDialog);
const ExecutionResultDialog = computed(() => componentRefs.value.ExecutionResultDialog);
const checkStepDialog = computed(() => componentRefs.value.checkStepDialog);
const runConfigDialog = computed(() => componentRefs.value.runConfigDialog);
const clusterSchemasDialog = computed(() => componentRefs.value.clusterSchemasDialog);
const partitionSchemasDialog = computed(() => componentRefs.value.partitionSchemasDialog);
const getSQLDialog = computed(() => componentRefs.value.getSQLDialog);
const hadoopDialog = computed(() => componentRefs.value.hadoopDialog);
const previewDialog = computed(() => componentRefs.value.previewDialog);
const previewDataDialog = computed(() => componentRefs.value.previewDataDialog);

const selectedCells = ref([]);
const searchKeyword = ref("");
const taskGroupDialogVisible = ref(false); // 控制任务组选择弹窗显示
const selectedTaskGroups = ref([]); // 选中的任务组
const transformationName = ref(""); // 转换名称
const showWhitePage = ref(true); // 控制页面遮罩显示
const setupStep = ref(1); // 设置步骤 (1: 输入转换名称, 2: 选择任务组)
const taskGroupSelectorRef = ref(null); // 任务组选择器引用

const resultDialogVisible = ref(false);
const resultLog = ref(null);
const resultTableData = ref([]);
const resultTabActiveName = ref("log");
// SQL代码
const sqlCode = ref("SELECT * FROM users;");

let graph,
  parent,
  editor = null;
let undoManager = null;

const buttonList = ref([
  { name: "保存", image: "/src/assets/ItemImg/baocun.svg" },
  { name: "运行", image: "/src/assets/ItemImg/yunxing.svg" },
  { name: "暂停/恢复", image: "/src/assets/ItemImg/zanting.svg", disabled: computed(() => !executionId.value) },
  { name: "停止", image: "/src/assets/ItemImg/tingzhi.svg", disabled: computed(() => !executionId.value) },
  { name: "预览", image: "/src/assets/ItemImg/yulan.svg" },
  // { name: "调试", image: "/src/assets/ItemImg/tiaoshi.svg" },
  { name: "校验", image: "/src/assets/ItemImg/jiaoyan.svg" },
  { name: "生成运行SQL", image: "/src/assets/ItemImg/shengchengsql.svg" },
  { name: "集群schema", image: "/src/assets/ItemImg/jiqunschema.svg" },
  { name: "数据分区", image: "/src/assets/ItemImg/shujufenqu.svg" },
  { name: "数据库连接", image: "/src/assets/ItemImg/shujukulianjie.svg" },
  { name: "Hadoop Cluster", image: "/src/assets/ItemImg/HadoopCluster.svg" },
  { name: "执行结果面板", image: "/src/assets/ItemImg/gengduo.svg" },
]);

const buttonActiveName = ref("");



// 添加展开/收起状态管理
const expandedSections = ref({
  input: false,
  output: false,
  trans: false,
  app: false,
  process: false,
  script: false,
  connection: false,
  statistical: false,
  work: false,
});

// 切换指定模块的展开/收起状态
const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

watch(searchKeyword, (newKeyword) => {
  if (!newKeyword) {
    // 如果清空搜索关键词，不自动关闭已展开的节点，保持现状
    return;
  }

  // 将所有有匹配项的节点展开
  const lowerKeyword = newKeyword.toLowerCase();

  // 检查各个分类是否有匹配项，如果有则展开对应节点
  if (toolItems.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.input = true;
  }

  if (toolItemsOut.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.output = true;
  }

  if (toolItemsTrans.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.trans = true;
  }

  if (toolItemsApp.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.app = true;
  }

  if (toolItemsProcess.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.process = true;
  }

  if (toolItemsScript.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.script = true;
  }

  if (toolItemsConnection.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.connection = true;
  }

  if (toolItemsStatistical.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.statistical = true;
  }

  if (toolItemsWork.value.some(item => item.name.toLowerCase().includes(lowerKeyword))) {
    expandedSections.value.work = true;
  }
}, { immediate: false });

// 计算属性，用于过滤输入项
const filteredToolItems = computed(() => {
  if (!searchKeyword.value) {
    return toolItems.value;
  }
  return toolItems.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 计算属性，用于过滤输出项
const filteredToolItemsOut = computed(() => {
  if (!searchKeyword.value) {
    return toolItemsOut.value;
  }
  return toolItemsOut.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 计算属性，用于过滤转换项
const filteredToolItemsTrans = computed(() => {
  if (!searchKeyword.value) {
    return toolItemsTrans.value;
  }
  return toolItemsTrans.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 计算属性，用于过滤应用项
const filteredToolItemsApp = computed(() => {
  if (!searchKeyword.value) {
    return toolItemsApp.value;
  }
  return toolItemsApp.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});


// 计算属性，用于过滤流程项
const filteredToolItemsProcess = computed(() => {
  if (!searchKeyword.value) {
    return toolItemsProcess.value;
  }
  return toolItemsProcess.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 计算属性，用于过滤脚本项
const filteredToolItemsScript = computed(() => {
  if (!searchKeyword.value) {
    return toolItemsScript.value;
  }
  return toolItemsScript.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 计算属性，用于过滤连接项
const filteredToolItemsConnection = computed(() => {
  if (!searchKeyword.value) {
    return toolItemsConnection.value;
  }
  return toolItemsConnection.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 计算属性，用于过滤流程项
const filteredToolItemsStatistical = computed(() => {
  if (!searchKeyword.value) {
    return toolItemsStatistical.value;
  }
  return toolItemsStatistical.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 计算属性，用于过滤作业项
const filteredToolItemsWork = computed(() => {
  if (!searchKeyword.value) {
    return toolItemsWork.value;
  }
  return toolItemsWork.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 节流函数，用于限制按钮点击事件的触发频率
const handleButtonClick = throttle((name) => {
  buttonActiveName.value = name;
  switch (name) {
    case "保存":
      saveGraph();
      break;
    case "停止":
      stop();
      break;
    case "暂停/恢复":
      pauseOrResume();
      break;
    case "运行":
      initRuns();
      break;
    case "数据库连接":
      openDatabaseExplorerDialog();
      break;
    case "执行结果面板":
      if (ExecutionResultDialog.value) {
        ExecutionResultDialog.value.open();
      }
      break;
    case "校验":
      if (checkStepDialog.value) {
        checkStepDialog.value.openDialog({ allXml: getCurrentXmlStructure() });
      }
      break;
    case "集群schema":
      if (clusterSchemasDialog.value) {
        clusterSchemasDialog.value.openDialog(getCurrentXmlStructure());
      }
      break;
    case "数据分区":
      if (partitionSchemasDialog.value) {
        partitionSchemasDialog.value.openDialog(getCurrentXmlStructure());
      }
      break;
    case "生成运行SQL":
      if (getSQLDialog.value) {
        getSQLDialog.value.openDialog(getCurrentXmlStructure());
      }
      break;
    case "Hadoop Cluster":
      if (hadoopDialog.value) {
        hadoopDialog.value.openDialog(getCurrentXmlStructure());
      }
      break;
    case "预览":
      if (previewDialog.value) {
        previewDialog.value.openDialog({
          graphXml: getCurrentXmlStructure(),
          selectedCells: encodeURIComponent(JSON.stringify(selectedCells.value))
        });
      }
      break;
    default:
      // sqlEditorDialog.value.openDialog(sqlCode.value)
  }
}, 2000);

// 处理保存事件
const handleSave = (sql) => {
  console.log("保存SQL:", sql);
  sqlCode.value = sql;
};

// 定义工具项数组
const toolItems = ref(ItemsIn);

const toolItemsOut = ref(ItemsOut);
const toolItemsTrans = ref(ItemsTrans)
const toolItemsApp = ref(ItemsApps)
const toolItemsProcess = ref(ItemsProcess)
const toolItemsScript = ref(ItemsScript)
const toolItemsConnection = ref(ItemsConnection)
const toolItemsStatistical = ref(ItemsStatistical)
const toolItemsWork = ref(ItemsWork)

// 清除所有节点的状态图标（每次运行前调用）
const clearStatus = () => {
  const cells = graph.getChildVertices(graph.getDefaultParent());
  graph.getModel().beginUpdate();
  try {
    cells.forEach((cell) => {
      graph.removeCellOverlays(cell);
    });
  } finally {
    graph.getModel().endUpdate();
  }
};

// 根据接口返回的 stepStatus 更新节点图标
const updateGraphStatus = (statusList) => {
  if (!statusList || !Array.isArray(statusList)) return;

  // 1. 将状态数组转为 Map，方便通过名称快速查找状态
  // Map 结构: "步骤名称" => status (0 或其他)
  const statusMap = new Map();
  statusList.forEach((item) => {
    statusMap.set(item.stepName, item.stepStatus);
  });

  // 2. 获取画布上所有节点
  const cells = graph.getChildVertices(graph.getDefaultParent());

  graph.getModel().beginUpdate();
  try {
    cells.forEach((cell) => {
      // 获取当前节点的名称 (Label)
      const cellName = cell.value;

      // 如果接口返回的数据中包含该节点
      if (statusMap.has(cellName)) {
        const status = statusMap.get(cellName);
        let overlay = null;

        // 3. 根据 status 判断显示什么图标
        if (status === 0) {
          // --- 成功状态 (stepStatus: 0) ---
          const image = new mxImage('/src/assets/ItemImg/true.svg', 16, 16);
          overlay = new mxCellOverlay(image, '运行成功', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP);
        } else {
          // --- 失败状态 (stepStatus != 0) ---
          const image = new mxImage('/src/assets/ItemImg/false.svg', 16, 16);
          overlay = new mxCellOverlay(image, '运行异常', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP);
        }

        // 可选：添加偏移量，让图标稍微突出一点
        // overlay.offset = new mxPoint(-2, 2);

        // 可选：添加点击事件
        // overlay.addListener(mxEvent.CLICK, (sender, evt) => {
        //   ElMessage.info(`查看步骤 [${cellName}] 的详情`);
        // });

        graph.removeCellOverlays(cell);
        graph.addCellOverlay(cell, overlay);
      }
    });
  } finally {
    graph.getModel().endUpdate();
  }
};


// 初始化 mxGraph
const createGraph = () => {
  // 创建编辑器
  editor = new mxEditor();
  editor.setGraphContainer(graphContainer.value);
  graph = editor.graph;
  parent = graph.getDefaultParent();

  // 启用框选
  new mxRubberband(graph);

  // 禁用浏览器默认的右键菜单栏
  mxEvent.disableContextMenu(graphContainer.value);

  // 设置默认缩放级别
  graph.getView().setScale(1);

  // 设置字体缩放
  mxConstants.DEFAULT_FONTSIZE = 12;
  // 启用连线功能
  graph.setConnectable(true);
  graph.connectionHandler.enabled = true;

  // 启用撤销/重做功能
  undoManager = new mxUndoManager();
  const listener = (sender, evt) => {
    undoManager.undoableEditHappened(evt.getProperty("edit"));
  };
  graph.getModel().addListener(mxEvent.UNDO, listener);
  graph.getView().addListener(mxEvent.UNDO, listener);

  // 设置节点可调整大小
  graph.setCellsResizable(true);

  // 设置节点可移动
  graph.setCellsMovable(true);

  // 设置允许复制
  graph.setTooltips(false);
  graph.setMultigraph(false); // 禁止重复连接

  // 启用网格对齐
  graph.setGridEnabled(true);
  graph.setGridSize(10);

  // 禁止默认的双击事件
  graph.setCellsEditable(false);

  graph.container.style.overflow = "auto";
  graph.setPanning(true); // 启用平移功能
  graph.panningHandler.useLeftButtonForPanning = false; // 使用左键拖动画布
  graph.setAllowNegativeCoordinates(true); // 允许负坐标，这样节点可以拖出左上边界

  graph.setResizeContainer(false); // 不自动调整容器大小
  graph.container.style.overflow = "auto";

  graph.getSelectionModel().addListener(mxEvent.CHANGE, (sender, evt) => {
    selectedCells.value = graph.getSelectionCells().filter((cell) => cell.value !== '')?.map((cell) => cell.value);
  });
  // 启用连接点显示
  mxConstraintHandler.prototype.pointColor = "#4385F5";
  // 配置节点中心的连接图标(注釋掉即可指定錨點連接到另一個節點的錨點上)
  // mxConnectionHandler.prototype.connectImage = new mxImage('/public/svg/radio.svg', 14, 14);
  // graph.connectionHandler.setCreateTarget(true);

  // 配置连接点样式
  const edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
  edgeStyle[mxConstants.STYLE_STROKECOLOR] = "#4385F5";
  edgeStyle[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
  edgeStyle[mxConstants.STYLE_ENDSIZE] = 8;
  edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
  // 设置连线风格(设置为正交折线)
  // edgeStyle['edgeStyle'] = 'orthogonalEdgeStyle'

  // 创建默认节点样式
  const defaultVertexStyle = graph.getStylesheet().getDefaultVertexStyle();
  defaultVertexStyle[mxConstants.STYLE_ROUNDED] = true;
  defaultVertexStyle[mxConstants.STYLE_STROKECOLOR] = "#000000";
  defaultVertexStyle[mxConstants.STYLE_FONTSIZE] = 12;
  defaultVertexStyle[mxConstants.STYLE_FONTSTYLE] = 0;
  defaultVertexStyle[mxConstants.STYLE_FONTSIZE] = 12;
  // 设置节点双击事件
  graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {
    const cell = evt.getProperty('cell')
    if (cell && cell.value) {
      openStepEditDialog(cell);
    }
    evt.consume(); // 阻止事件冒泡
  })

  // 监听连接事件，在用户通过鼠标或手动创建连接时进行处理
  graph.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
    const edge = evt.getProperty("cell");
    const source = edge.source;
    const target = edge.target;
    if (!source || !target) {
      // 如果任一端没有连接到节点，则删除这条无效连线
      graph.getModel().beginUpdate();
      try {
        graph.removeCells([edge]);
      } finally {
        graph.getModel().endUpdate();
      }
      return;
    }
    addEdge(source, target);
  });
};
// 拖拽开始事件
const handleDragStart = (e, nodeType, source) => {
  e.dataTransfer.setData("nodeType", nodeType);
  e.dataTransfer.setData("source", source); // 添加来源信息：'input' 或 'output'
};

// 拖拽到元素方法
const initDragAndDrop = () => {
  const container = graphContainer.value;
  if (!container) {
    console.error("画布容器未找到");
    return;
  }

  container.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  container.addEventListener("drop", async (e) => {
    e.preventDefault();

    const nodeType = e.dataTransfer.getData("nodeType");
    const source = e.dataTransfer.getData("source"); // 获取来源信息
    if (!nodeType) return;

    const pt = graph.getPointForEvent(e);
    pt.x -= 40;
    pt.y -= 15;
    // 根据来源查找对应的工具项
    let toolItem;
    if (source === "input") {
      toolItem = toolItems.value.find((item) => item.name === nodeType);
    } else if (source === "output") {
      toolItem = toolItemsOut.value.find((item) => item.name === nodeType);
    } else if (source === "trans") {
      toolItem = toolItemsTrans.value.find((item) => item.name === nodeType);
    } else if (source === "app") {
      toolItem = toolItemsApp.value.find((item) => item.name === nodeType);
    } else if (source === "process") {
      toolItem = toolItemsProcess.value.find((item) => item.name === nodeType);
    } else if (source === "script") {
      toolItem = toolItemsScript.value.find((item) => item.name === nodeType);
    } else if (source === "connection") {
      toolItem = toolItemsConnection.value.find((item) => item.name === nodeType);
    } else if (source === "statistical") {
      toolItem = toolItemsStatistical.value.find((item) => item.name === nodeType);
    } else if (source === "work") {
      toolItem = toolItemsWork.value.find((item) => item.name === nodeType);
    }
    let stepInfo = await getNewStep(toolItem);

    graph.getModel().beginUpdate();
    try {
      // 根据节点类型设置不同的图标样式
      let vertexStyle =
        "shape=label;verticalLabelPosition=bottom;verticalAlign=top;fontColor=#000000;align=center;imageAlign=center;imageVerticalAlign=middle;spacingTop=6;fillColor=#ffffff;imageAspect=1;fontSize=12;";

      // 查找拖拽的工具项以获取图像路径
      if (toolItem && toolItem.image) {
        vertexStyle += `image=${toolItem.image};`;
      } else {
        // 默认图像
        vertexStyle += "image=/public/svg/404.svg;";
      }

      // 获取当前同类型节点数量，用于编号
      // const existingNodes = graph.getChildVertices(graph.getDefaultParent()).filter(
      //   cell => cell.value && cell.value.toString().startsWith(nodeType)
      // );

      // 确定节点显示名称
      let displayName = newStepName.value;
      // if (existingNodes.length > 0) {
      //   displayName = `${nodeType} ${existingNodes.length + 1}`;
      // }
      // 统一使用37x37的尺寸，与保存的XML一致
      const vertex = graph.insertVertex(
        parent,
        null,
        displayName,
        pt.x,
        pt.y,
        37,
        37,
        vertexStyle
      );

      vertex.setValue(displayName);
      // 使用自定义属性存储stepInfo
      vertex.stepInfo = stepInfo;
      graph.setSelectionCell(vertex);
    } finally {
      graph.getModel().endUpdate();
    }
  });
};

// 打开步骤编辑对话框的通用方法
const openStepEditDialog = (cell) => {
  const nodeType = getNodeTypeFromStepInfo(cell.stepInfo);
  const dialogParams = {
    cell: cell,
    graph: graph,
    xml: getCellXmlStructure(cell),
    allXml: getCurrentXmlStructure(),
    transName: transformationName.value,
  };
  openDialogByNodeType(componentRefs.value, nodeType, dialogParams);
};
// 配置右键菜单栏
const configMenu = () => {
  graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => {
    // 获取当前所有选中的元素
    const selectionCells = graph.getSelectionCells();

    // =========================================================
    // 【新增】通用功能：如果当前有选中的对象（且大于0个），允许批量删除
    // 逻辑：如果用户先框选了多个，然后右键，应该允许一次性删除所有选中的
    // =========================================================
    if (selectionCells.length > 0) {
      // 判断当前右键点击的 cell 是否包含在选中集合中
      // 如果包含，说明用户想操作这批选中的对象
      const isCellSelected = cell && selectionCells.includes(cell);

      // 只有当没有特定cell（点空白处）或者点的cell就在选中堆里时，才显示
      if (!cell || isCellSelected) {
        menu.addItem(`删除已选对象 (${selectionCells.length}个)`, null, () => {
          graph.getModel().beginUpdate();
          try {
            graph.removeCells(selectionCells);
          } finally {
            graph.getModel().endUpdate();
          }
        });
        menu.addSeparator();
      }
    }
    if (cell) {
      if (cell.vertex) {
        // 点击了节点
        menu.addItem("编辑步骤", null, () => {
          openStepEditDialog(cell);
        });

        menu.addItem("编辑步骤描述", null, () => {
          ElMessageBox.prompt("请输入步骤名称", "编辑步骤", {
            inputValue: cell.value || "",
            confirmButtonText: "确定",
            cancelButtonText: "取消",
          })
            .then(({ value }) => {
              graph.getModel().setValue(cell, value);
            })
            .catch(() => {
              // 用户取消操作
            });
        });

        // 1. 添加主入口
        const dataSendItem = menu.addItem("数据发送......", null, null);

        // 2. 定义子菜单工厂函数
        const submenuFactory = (menuObj, targetCell, targetEvt) => {
          // 获取当前分发状态，默认为 'Y' (Round-Robin)
          console.log("数据发送", targetCell);
          const isDistribute = targetCell.distribute !== 'N';

          // --- 选项 1: Round-Robin (轮询) ---
          const labelRR = isDistribute ? '[√] Round-Robin' : 'Round-Robin';
          menuObj.addItem(labelRR, null, () => {
            if (isDistribute) return; // 已经是轮询，无需操作

            graph.getModel().beginUpdate();
            try {
              targetCell.distribute = 'Y'; // 设置为轮询
              updateStepOutputIcons(targetCell); // 更新连线图标
            } finally {
              graph.getModel().endUpdate();
            }
            menuObj.hideMenu();
            menu.hideMenu();
          });

          // --- 选项 2: 复制发送模式 ---
          const labelCopy = !isDistribute ? '[√] 复制发送模式' : '复制发送模式';
          // 如果你有 copy.svg，可以作为第二个参数传入
          menuObj.addItem(labelCopy, '/src/assets/ItemImg/copy-hop.svg', () => {
            if (!isDistribute) return; // 已经是复制模式

            graph.getModel().beginUpdate();
            try {
              targetCell.distribute = 'N'; // 设置为复制
              updateStepOutputIcons(targetCell); // 更新连线图标
            } finally {
              graph.getModel().endUpdate();
            }
            menuObj.hideMenu();
            menu.hideMenu();
          });
        };

        // 3. 实例化子菜单
        const submenu = new mxPopupMenu(submenuFactory);
        let closeTimer = null; // 用于存储定时器

        // 辅助函数：启动关闭定时器
        const startCloseTimer = () => {
          if (closeTimer) clearTimeout(closeTimer);
          closeTimer = setTimeout(() => {
            submenu.hideMenu();
          }, 250); // 250毫秒延迟，给用户移动鼠标的时间
        };

        // 辅助函数：取消关闭定时器
        const clearCloseTimer = () => {
          if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
          }
        };

        // 4. 绑定主菜单项事件

        // 移入主菜单项：显示子菜单，并清除可能的关闭定时器
        mxEvent.addListener(dataSendItem, 'mouseenter', (evt) => {
          clearCloseTimer(); // 如果刚准备关，又移回来了，取消关闭

          const rect = dataSendItem.getBoundingClientRect();
          submenu.popup(rect.right, rect.top, cell, evt);

          // 【关键】子菜单弹出后，必须给子菜单的容器也绑定事件
          if (submenu.div) {
            // 移入子菜单：取消关闭（说明用户想操作子菜单）
            mxEvent.addListener(submenu.div, 'mouseenter', () => {
              clearCloseTimer();
            });
            // 移出子菜单：开始关闭
            mxEvent.addListener(submenu.div, 'mouseleave', () => {
              startCloseTimer();
            });
          }
        });

        // 移出主菜单项：开始延时关闭
        mxEvent.addListener(dataSendItem, 'mouseleave', (evt) => {
          startCloseTimer();
        });

        // 5. 级联关闭逻辑 (点击外部时)
        const originHideMenu = menu.hideMenu;
        menu.hideMenu = function () {
          clearCloseTimer(); // 清理定时器防止内存泄漏
          submenu.hideMenu();
          originHideMenu.apply(this, arguments);
        };

        menu.addItem("预览", null, () => {
          graph.setSelectionCell(cell); // 选中节点

          // 打开预览弹窗
          if (previewDialog.value) {
            previewDialog.value.openDialog({
              graphXml: getCurrentXmlStructure(),
              // 传参：将当前节点的 value (通常是步骤名) 包装成数组传过去
              selectedCells: encodeURIComponent(JSON.stringify([cell.value]))
            });
          }
        });


        menu.addSeparator(); // 添加分割线
        // menu.addItem('改变开始复制的数量...', null, () => {
        // })
        // menu.addSeparator() // 添加分割线
        // menu.addItem('复制到剪切板', null, () => {
        //   let selectionCells = graph.getSelectionCells();
        //   mxClipboard.copy(graph, selectionCells);
        // })
        // menu.addItem('复制步骤', null, () => {
        //   // 复制选中的单元格
        //   let selectionCells = graph.getSelectionCells();
        //   mxClipboard.copy(graph, selectionCells);

        //   // 直接粘贴到画布上，偏移一定位置
        //   let pasteCells = mxClipboard.paste(graph);
        //   if (pasteCells && pasteCells.length > 0) {
        //     let dx = 20, dy = 20; // 偏移量
        //     graph.moveCells(pasteCells, dx, dy);
        //     graph.setSelectionCells(pasteCells);
        //   }
        // })
        menu.addItem("删除步骤", null, () => {
          graph.removeCells([cell]);
        });
        // menu.addItem('隐藏步骤', null, () => {

        // }, null, null, false)
        // menu.addItem('分离步骤', null, () => {

        // })
        // menu.addSeparator() // 添加分割线
        // menu.addItem('显示输入字段', null, () => {

        // })
        // menu.addItem('显示输出字段', null, () => {

        // })
        // menu.addSeparator() // 添加分割线
        // menu.addItem('定义错误处理', null, () => {

        // }, null, null, false)

        // menu.addSeparator() // 添加分割线
        // menu.addItem('分区', null, () => {

        // }, null, null, false)
        // menu.addItem('集群', null, () => {

        // })
      } else {
        // menu.addItem('编辑连接', null, () => {
        // })
        // menu.addItem('使节点连接失效', null, () => {
        // })
        const isEnabled = cell.enabled !== false;
        const enableLabel = isEnabled ? '使节点连接失效' : '使节点连接生效';

        menu.addItem(enableLabel, null, () => {
          graph.getModel().beginUpdate();
          try {
            // 切换状态
            cell.enabled = !isEnabled;
            // 更新视觉样式
            updateEdgeStyle(cell);
          } finally {
            graph.getModel().endUpdate();
          }
        });
        menu.addItem("删除节点连接", null, () => {
          graph.removeCells([cell]);
        });
        menu.addItem('反转方向', null, () => {
          if (cell && cell.edge) {
            const source = cell.source
            const target = cell.target
            const model = graph.getModel()
            model.beginUpdate()
            try {
              model.setTerminal(cell, target, true)   // 设置新的源点为原来的目标点
              model.setTerminal(cell, source, false)  // 设置新的目标点为原来的源点
            } finally {
              model.endUpdate()
            }
          }
        })
      }
    } else {
      // 点击了画布
      // menu.addItem('粘贴', null, () => {
      //   mxClipboard.paste(graph);
      // }, null, null, !mxClipboard.isEmpty())

      menu.addItem("全选", null, () => {
        graph.selectAll();
      });

      menu.addItem("转换设置", null, () => {
        transInfoDialog.value.openDialog();
      });
    }

    menu.addItem('清空画布', null, () => {
      clearGraph()
    })
  };
};

const updateEdgeStyle = (cell) => {
  if (!cell || !cell.edge) return;

  // 获取启用状态 (默认为 true)
  // 注意：我们在 cell 对象上挂载 enabled 属性 (boolean)
  const isEnabled = cell.enabled !== false;

  // 定义颜色
  const COLOR_DEFAULT = '#4385F5'; // 默认蓝色
  const COLOR_DISABLED = '#AAAAAA'; // 失效灰色

  let targetColor = COLOR_DEFAULT;

  if (!isEnabled) {
    targetColor = COLOR_DISABLED;
    // 可选：失效变成虚线
    // graph.setCellStyles(mxConstants.STYLE_DASHED, 1, [cell]);
  } else {
    targetColor = COLOR_DEFAULT;
    // 恢复实线
    // graph.setCellStyles(mxConstants.STYLE_DASHED, 0, [cell]);
  }

  // 应用颜色
  graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, targetColor, [cell]);
};


// 【新增】更新步骤输出连线的图标（处理分发/复制模式）
const updateStepOutputIcons = (stepCell) => {
  if (!stepCell || !stepCell.vertex) return;

  // 获取该节点的所有“输出”连线
  const outgoingEdges = graph.getOutgoingEdges(stepCell);

  // 判断当前模式：distribute='Y' (默认/轮询) vs distribute='N' (复制)
  // 注意：Kettle默认是 'Y'，只有 'N' 时才是复制模式
  const isCopyMode = stepCell.distribute === 'N';

  graph.getModel().beginUpdate();
  try {
    outgoingEdges.forEach(edge => {
      // 1. 先移除该连线现有的 Overlay (避免重复叠加)
      // 注意：这里只移除我们添加的复制图标，如果你有其他图标逻辑需谨慎
      // 这里简单处理，先移除所有，如果需要保留之前的 disable 样式，需要重新应用
      graph.removeCellOverlays(edge);

      // 2. 如果是复制模式，添加图标
      if (isCopyMode) {
        // 图标路径，请确保文件存在
        const image = new mxImage('/src/assets/ItemImg/copy-hop.svg', 16, 16);
        // 图标显示在连线源头附近
        const overlay = new mxCellOverlay(image, '复制发送模式', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP);
        // 调整位置偏移量，让它显示在连线出来的地方
        overlay.offset = new mxPoint(0, 0);

        graph.addCellOverlay(edge, overlay);
      }

      // 3. 顺便确保连线颜色正确（如果之前有失效逻辑）
      updateEdgeStyle(edge); // 如果你有这个函数，最好调用一下保持状态一致
    });
  } finally {
    graph.getModel().endUpdate();
  }
};

// 实现连线创建逻辑
// const createConnection = () => {
//   const selectedCells = graph.getSelectionCells().filter(cell => cell.vertex)
//   if (selectedCells.length >= 2) {
//     addEdge(selectedCells[0], selectedCells[1])
//     ElMessage.success('已创建连线')
//   } else {
//     ElMessage.warning('至少需要两个节点才能创建连线')
//   }
// }

// 新增连线函数
const addEdge = (source, target) => {
  graph.getModel().beginUpdate();
  try {
    // 检查是否已经存在相同的连接
    const existingEdges = graph.getEdgesBetween(source, target);
    if (existingEdges.length > 0) {
      // 如果已经存在连接，则不创建新的
      return;
    }

    // 插入连线
    const edge = graph.insertEdge(parent, null, "", source, target);

    // 为连线添加自定义属性，用于在生成XML时识别
    edge.customType = "TransHop";
    edge.customId = Date.now().toString(); // 简单的ID生成方式
    edge.enable = "Y";
    edge.from = source.value;
    edge.to = target.value;
  } finally {
    graph.getModel().endUpdate();
    // console.log("getCurrentXmlStructure", getCurrentXmlStructure());
  }
};
// 鼠标事件处理
const configMouseEvent = () => {
  graph.addMouseListener({
    currentState: null,
    mouseDown: (sender, evt) => {
      if (!evt.state) {
        // 点击了画布
      } else if (evt.state.cell && evt.state.cell.edge) {
        // 点击了连线
      } else if (evt.state.cell) {
        // 点击了节点
      }
    },
    mouseMove: (sender, me) => {
      // 处理鼠标移动事件
      const cell = me.getCell();
    },
    mouseUp: (sender, evt) => {
      // 处理鼠标抬起事件
    },
  });
};

// 清空画布
const clearGraph = () => {
  ElMessageBox.confirm("确定要清空画布吗？此操作不可恢复", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      graph.getModel().beginUpdate();
      try {
        const cells = graph.getChildVertices(graph.getDefaultParent());
        const edges = graph.getChildEdges(graph.getDefaultParent());
        graph.removeCells(cells.concat(edges));
      } finally {
        graph.getModel().endUpdate();
      }
      ElMessage.success("画布已清空");
    })
    .catch(() => {
      // 用户取消操作
    });
};

const newStepName = ref("")

function getAttributeFromStepXml(xmlString, attributeName) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const stepElement = xmlDoc.querySelector("Step");
  if (stepElement) {
    return stepElement.getAttribute(attributeName);
  }
  return null;
}

const getNewStep = async (val) => {
  try {
    // 获取流程图数据
    let params = {
      graphXml: getCurrentXmlStructure(),
      pluginId: val.pluginId,
      name: val.name,
    };
    let res = await newStep(params);
    newStepName.value = getAttributeFromStepXml(res.replace(/^<\?xml[^>]*\?>\s*/i, ""), "label")
    return res.replace(/^<\?xml[^>]*\?>\s*/i, "");
  } catch {
    ElMessage.error("获取失败");
  }
};

// 获取当前完整的XML结构
const getCurrentXmlStructure = () => {
  // 获取流程图数据
  const encoder = new mxCodec();
  const node = encoder.encode(graph.getModel());

  // 找到 root 节点
  const root = node.getElementsByTagName("root")[0];

  if (root) {
    // 清空 root 节点中的内容
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }

    // 创建默认的 mxCell 元素 (id="0")
    const defaultCell = node.ownerDocument.createElement("mxCell");
    defaultCell.setAttribute("id", "0");
    root.appendChild(defaultCell);

    // 配置info属性
    let infoElement = transInfoDialog.value.createInfoElementWithParams(
      node.ownerDocument,
      { transName: transformationName.value },
      databaseSaveInfo.value
    );
    let changeClusterSchemas = clusterSchemasDialog.value.changeClusterSchemas(infoElement)
    let changePartitionSchemas = partitionSchemasDialog.value.saveToXml(changeClusterSchemas)
    root.appendChild(changePartitionSchemas);

    // 添加所有步骤节点
    const cells = graph.getChildVertices(graph.getDefaultParent());
    cells.forEach((cell, index) => {
      // 如果cell中有stepInfo，则直接添加到root中
      if (cell && cell.stepInfo) {
        try {
          const stepXmlDoc = mxUtils.parseXml(cell.stepInfo);
          if (stepXmlDoc.documentElement) {
            const importedNode = node.ownerDocument.importNode(
              stepXmlDoc.documentElement,
              true
            );
            importedNode.setAttribute("id", cell.id);
            // 查找step元素中的mxCell并更新其属性
            const stepMxCells = importedNode.getElementsByTagName("mxCell");
            if (stepMxCells.length > 0) {
              const stepMxCell = stepMxCells[0];
              stepMxCell.setAttribute("style", cell.style);
              stepMxCell.setAttribute("vertex", "1");
              stepMxCell.setAttribute("parent", "1");
              // Kettle 标准：distribute 属性在 <Step> 标签上
              const distributeVal = cell.distribute === 'N' ? 'N' : 'Y';
              importedNode.setAttribute("distribute", distributeVal);

              // 更新或创建 mxGeometry 子元素
              let geometryElement =
                stepMxCell.getElementsByTagName("mxGeometry")[0];
              if (!geometryElement) {
                geometryElement =
                  node.ownerDocument.createElement("mxGeometry");
                geometryElement.setAttribute("as", "geometry");
                stepMxCell.appendChild(geometryElement);
              }

              geometryElement.setAttribute("x", cell.geometry.x);
              geometryElement.setAttribute("y", cell.geometry.y);
              geometryElement.setAttribute("width", cell.geometry.width);
              geometryElement.setAttribute("height", cell.geometry.height);
            } else {
              // 如果没有mxCell元素，创建一个新的
              const stepMxCell = node.ownerDocument.createElement("mxCell");
              stepMxCell.setAttribute("style", cell.style);
              stepMxCell.setAttribute("vertex", "1");
              stepMxCell.setAttribute("parent", "1");
              // Kettle 标准：distribute 属性在 <Step> 标签上
              const distributeVal = cell.distribute === 'N' ? 'N' : 'Y';
              importedNode.setAttribute("distribute", distributeVal);

              // 创建 mxGeometry 子元素
              const geometryElement =
                node.ownerDocument.createElement("mxGeometry");
              geometryElement.setAttribute("x", cell.geometry.x);
              geometryElement.setAttribute("y", cell.geometry.y);
              geometryElement.setAttribute("width", cell.geometry.width);
              geometryElement.setAttribute("height", cell.geometry.height);
              geometryElement.setAttribute("as", "geometry");

              stepMxCell.appendChild(geometryElement);
              importedNode.appendChild(stepMxCell);
            }
            root.appendChild(importedNode);
          }
        } catch (e) {
          console.error("Error parsing stepInfo XML:", e);
        }
      }
    });
    // 添加连接信息 (TransHop elements)
    const edges = graph.getChildEdges(graph.getDefaultParent());
    edges.forEach((edge) => {
      console.log("edge", edge);
      // 创建 TransHop 元素
      const transHop = node.ownerDocument.createElement("TransHop");
      const isEnabled = edge.enabled !== false;
      transHop.setAttribute("enable", isEnabled ? "Y" : "N");
      transHop.setAttribute("from", edge.source?.value || "");
      transHop.setAttribute("to", edge.target?.value || "");
      transHop.setAttribute("id", edge.id);

      // 创建 mxCell 元素
      const mxCell = node.ownerDocument.createElement("mxCell");
      mxCell.setAttribute("edge", "1");
      mxCell.setAttribute("parent", "1");
      mxCell.setAttribute("source", edge.source?.id || "");
      mxCell.setAttribute("target", edge.target?.id || "");

      // 创建 mxGeometry 元素
      const mxGeometry = node.ownerDocument.createElement("mxGeometry");
      mxGeometry.setAttribute("as", "geometry");
      mxGeometry.setAttribute("relative", "1");

      // 组装元素结构
      mxCell.appendChild(mxGeometry);
      transHop.appendChild(mxCell);

      root.appendChild(transHop);
    });
  }
  console.log(node);
  return mxUtils.getPrettyXml(node);
};
// 保存流程
const saveGraph = async () => {
  // loading.value = true
  getCurrentXmlStructure();
  const res = await saveTrans({
    graphXml: encodeURIComponent(getCurrentXmlStructure()),
  });
  if (res.code == 500) {
    ElMessage.error("保存失败");
    return;
  } else {
    ElMessage.success("保存成功");
    loading.value = false;
  }
};

const initRuns = async () => {
  clearStatus();// 清空节点状态
  await saveGraph()
  let res = await initRun({ graphXml: getCurrentXmlStructure() });
  if (res.code == 500) {
    ElMessage.error("初始化失败");
    return;
  } else {
    setRunConfig(res);
  }
};

const openDatabaseExplorerDialog = () => {
  dataBaseInfoDialog.value.openDialog();
};

const secondRun = async (val) => {
  try {
    let params = {
      graphXml: getCurrentXmlStructure(),
      executionConfiguration: JSON.stringify(val),
    };
    let res = await thenRun(params);
    getResult(res);
  } catch {
    ElMessage.error("运行失败");
  }
};

const runPreview = (val) => {
  ExecutionResultDialog.value.open(val);
  previewDataDialog.value.openDialog(val);
};

const setRunConfig = (data) => {
  if (runConfigDialog.value) {
    runConfigDialog.value.openDialog(data);
  }
}

const executionId = ref("");

const pollingState = ref({
  isActive: false,           // 是否正在轮询
  isPaused: false,           // 是否已暂停
  pollFunction: null,        // 轮询函数引用
  timeoutId: null           // 定时器ID
});

const stop = async () => {
  let params = {
    executionId: executionId.value,
  };
  let res = await stopRun(params);
  if (res.code == 500) {
    ElMessage.error("停止失败");
    return;
  } else {
    ElMessage.success("停止成功");
    // 停止轮询
    if (pollingState.value.timeoutId) {
      clearTimeout(pollingState.value.timeoutId);
      pollingState.value.isActive = false;
      pollingState.value.isPaused = false;
      pollingState.value.timeoutId = null;
    }
  }
}


const pauseOrResume = async () => {
  // 如果当前没有在轮询，直接返回
  if (!pollingState.value.isActive) {
    ElMessage.warning("当前没有轮询任务");
    return;
  }

  let params = {
    executionId: executionId.value,
  };

  // 切换暂停/恢复状态
  if (pollingState.value.isPaused) {
    // 当前是暂停状态，尝试恢复
    try {
      let res = await pauseOrResumeRun(params);
      if (res.code == 500) {
        ElMessage.error("恢复失败");
        return;
      } else {
        ElMessage.success("恢复成功");
        pollingState.value.isPaused = false;
        // 重新启动轮询
        if (pollingState.value.pollFunction) {
          pollingState.value.pollFunction();
        }
      }
    } catch (error) {
      ElMessage.error("恢复过程中出现错误");
    }
  } else {
    // 当前是运行状态，尝试暂停
    try {
      let res = await pauseOrResumeRun(params);
      if (res.code == 500) {
        ElMessage.error("暂停失败");
        return;
      } else {
        ElMessage.success("暂停成功");
        pollingState.value.isPaused = true;
        // 暂停轮询
        if (pollingState.value.timeoutId) {
          clearTimeout(pollingState.value.timeoutId);
          pollingState.value.timeoutId = null;
        }
      }
    } catch (error) {
      ElMessage.error("暂停过程中出现错误");
    }
  }
}

const getResult = async (val) => {
  try {
    executionId.value = val.message;
    let params = {
      executionId: val.message,
    };

    // 存储上一次的状态，用于比较是否需要更新
    let previousStepStatus = null;
    let firstUpdate = true; // 标记是否是首次更新

    // 创建一个轮询函数
    const pollForResult = async () => {
      // 检查是否被暂停，如果暂停则不再继续轮询
      if (pollingState.value.isPaused) {
        return;
      }

      let res = await thenResult(params);

      // 检查stepStatus是否有变化，只有变化时才更新图形状态，避免闪烁
      if (res && res.stepStatus) {
        if (JSON.stringify(res.stepStatus) !== JSON.stringify(previousStepStatus)) {
          updateGraphStatus(res.stepStatus);
          previousStepStatus = JSON.parse(JSON.stringify(res.stepStatus)); // 深拷贝
        }
      }

      console.log('运行', res);

      // 更新执行结果面板 - 首次调用open，后续调用update
      if (ExecutionResultDialog.value) {
        if (firstUpdate) {
          ExecutionResultDialog.value.open(res);
          firstUpdate = false;
        } else {
          ExecutionResultDialog.value.update(res);
        }
      }

      // 检查是否完成
      if (!res.finished) {
        // 如果未完成，延迟一段时间后继续轮询
        if (!pollingState.value.isPaused) {
          pollingState.value.timeoutId = setTimeout(pollForResult, 100); // 每100ms轮询一次
        }
      } else {
        if (res && res.stepStatus) {
          updateGraphStatus(res.stepStatus);
        }
        // 任务完成后清理轮询状态
        pollingState.value.isActive = false;
        pollingState.value.isPaused = false;
        if (pollingState.value.timeoutId) {
          clearTimeout(pollingState.value.timeoutId);
          pollingState.value.timeoutId = null;
        }
      }
    };

    // 设置轮询状态
    pollingState.value.isActive = true;
    pollingState.value.isPaused = false;
    pollingState.value.pollFunction = pollForResult;

    // 开始轮询
    await pollForResult();

  } catch (error) {
    ElMessage.error("获取结果失败");
    console.error("轮询过程中发生错误:", error);
    // 出错时也要清理轮询状态
    pollingState.value.isActive = false;
    pollingState.value.isPaused = false;
    if (pollingState.value.timeoutId) {
      clearTimeout(pollingState.value.timeoutId);
      pollingState.value.timeoutId = null;
    }
  }
};

// 获取输出的文件（临时）
const getFile = () => {
  resultDialogVisible.value = false;
};
// 下一步
const nextStep = async () => {
  if (setupStep.value === 1) {
    // 验证转换名称
    if (!transformationName.value || transformationName.value.trim() === "") {
      ElMessage.warning("请输入转换名称");
      return;
    }
    setupStep.value = 2; // 进入第二步
  } else if (setupStep.value === 2) {
    // 验证任务组选择
    if (taskGroupSelectorRef.value) {
      selectedTaskGroups.value = taskGroupSelectorRef.value.getSelectedGroups();
      if (!selectedTaskGroups.value || selectedTaskGroups.value.length === 0) {
        ElMessage.warning("请至少选择一个任务组");
        return;
      }
      let params = {
        dir: "/",
        transName: transformationName.value,
        taskGroupArray: selectedTaskGroups.value,
      };
      let res = await createTrans(params);
      if (res.success) {
        // 完成设置，关闭弹窗并显示页面
        taskGroupDialogVisible.value = false;
        showWhitePage.value = false;
        openTransInfo(res.message);
      } else {
        ElMessage.error(res.message);
      }
    }
  }
};

const openTransInfo = async (val) => {
  let params = {
    path: val,
    type: "transformation",
  };

  try {
    let res = await openTrans(params);
    if (res) {
      try {
        // 使用mxUtils解析XML
        let xmlDocument = mxUtils.parseXml(decodeURIComponent(res));
        let decoder = new mxCodec();
        let graphModel = decoder.decode(xmlDocument.documentElement);
        transInfoDialog.value.populateFromXml(graphModel);
      } catch (error) {
        ElMessage.error("XML解码或解析失败");
      }
    }
  } catch (error) {
    ElMessage.error("请求失败");
  }
};

const getImageByCtype = (ctype) => {
  // 根据ctype查找对应的工具项
  const toolItem = [...toolItems.value, ...toolItemsOut.value, ...toolItemsTrans.value, ...toolItemsApp.value, ...toolItemsProcess.value, ...toolItemsScript.value, ...toolItemsConnection.value, ...toolItemsStatistical.value, ...toolItemsWork.value].find(
    item => item.pluginId === ctype
  );

  // 如果找到对应的工具项，返回其图像路径，否则返回默认图像
  return toolItem ? toolItem.image : '/public/svg/404.svg';
};

// 打开转换详情
const openTransdetail = async (val) => {
  let params = {
    path: val,
    type: "transformation",
  };

  try {
    let res = await openTrans(params);
    if (res) {
      try {
        // 使用mxUtils解析XML
        let xmlDocument = mxUtils.parseXml(decodeURIComponent(res));
        let decoder = new mxCodec(xmlDocument);
        let node = xmlDocument.documentElement;
        console.log("node", node);

        // 清空当前图形
        graph.getModel().beginUpdate();
        try {
          // 清空现有内容
          const cells = graph.getChildVertices(graph.getDefaultParent());
          const edges = graph.getChildEdges(graph.getDefaultParent());
          graph.removeCells(cells.concat(edges));

          // 解析XML并重建图形
          const root = node.getElementsByTagName("root")[0];
          if (root) {
            // 处理Info节点（转换属性）
            const infoElements = root.getElementsByTagName("Info");
            if (infoElements.length > 0) {
              const infoElement = infoElements[0];
              transformationName.value = infoElement.getAttribute("name") || "";
              if (transInfoDialog.value) {
                transInfoDialog.value.populateFromXml(node);
              }
            }

            // 处理Step节点
            const vertices = {}; // 用于存储顶点，以便后续创建连接
            const stepElements = root.getElementsByTagName("Step");
            for (let i = 0; i < stepElements.length; i++) {
              const step = stepElements[i];
              const label = step.getAttribute("label") || "Unknown";
              const ctype = step.getAttribute("ctype") || "";
              const stepId = step.getAttribute("id");
              const distribute = step.getAttribute("distribute") || "Y";

              const mxCell = step.getElementsByTagName("mxCell")[0];

              if (mxCell) {
                const geometry = mxCell.getElementsByTagName("mxGeometry")[0];
                if (geometry) {
                  const x = parseFloat(geometry.getAttribute("x")) || 0;
                  const y = parseFloat(geometry.getAttribute("y")) || 0;
                  const width =
                    parseFloat(geometry.getAttribute("width")) || 37;
                  const height =
                    parseFloat(geometry.getAttribute("height")) || 37;
                  // 根据ctype设置图像
                  let image = "/public/svg/404.svg";
                  if (ctype) {
                    image = getImageByCtype(ctype);
                  }

                  // 创建节点样式，明确指定字体大小为12px
                  let vertexStyle =
                    "shape=label;verticalLabelPosition=bottom;verticalAlign=top;fontColor=#000000;align=center;imageAlign=center;imageVerticalAlign=middle;spacingTop=6;fillColor=#ffffff;imageAspect=1;fontSize=12;";
                  vertexStyle += `image=${image};`;

                  // 插入节点
                  const vertex = graph.insertVertex(
                    graph.getDefaultParent(),
                    stepId, // 使用XML中的ID
                    label,
                    x,
                    y,
                    width,
                    height,
                    vertexStyle
                  );

                  // 保存step信息
                  vertex.stepInfo = new XMLSerializer().serializeToString(step);
                  vertex.distribute = distribute;
                  // 存储顶点引用，以便后续创建连接
                  vertices[stepId] = vertex;
                  vertices[label] = vertex; // 同时以label为键存储
                }
              }
            }

            // 处理TransHop节点（连接关系）
            const transHopElements = root.getElementsByTagName("TransHop");
            for (let i = 0; i < transHopElements.length; i++) {
              const transHop = transHopElements[i];
              const from = transHop.getAttribute("from");
              const to = transHop.getAttribute("to");
              const enable = transHop.getAttribute("enable") || "Y";
              const hopId = transHop.getAttribute("id");

              const mxCell = transHop.getElementsByTagName("mxCell")[0];
              if (mxCell) {
                const sourceId = mxCell.getAttribute("source");
                const targetId = mxCell.getAttribute("target");

                // 尝试通过ID查找源和目标节点
                let sourceVertex = vertices[sourceId] || vertices[from];
                let targetVertex = vertices[targetId] || vertices[to];

                // 如果通过ID找不到，尝试通过label查找
                if (!sourceVertex && from) {
                  sourceVertex = vertices[from];
                }
                if (!targetVertex && to) {
                  targetVertex = vertices[to];
                }

                if (sourceVertex && targetVertex) {
                  // 创建连接
                  const edge = graph.insertEdge(
                    graph.getDefaultParent(),
                    hopId,
                    "",
                    sourceVertex,
                    targetVertex
                  );

                  // 设置连接属性
                  edge.customType = "TransHop";
                  edge.enable = enable;
                  edge.from = from;
                  edge.to = to;
                }
              }
            }
          }
        } finally {
          graph.getModel().endUpdate();
        }

        // 刷新图形显示
        graph.refresh();
        graph.zoomActual(); // 调整视图以适应所有元素
        // 遍历所有步骤节点，初始化连线上的复制图标
        const allCells = graph.getChildVertices(graph.getDefaultParent());
        allCells.forEach(cell => {
          updateStepOutputIcons(cell);
        });
      } catch (error) {
        ElMessage.error("XML解码或解析失败");
        console.error(error);
      }
    }
  } catch (error) {
    ElMessage.error("请求失败");
  }
};

// 上一步
const prevStep = () => {
  if (setupStep.value === 2) {
    setupStep.value = 1;
  }
};

const handleStepUpdate = (data) => {
  const { cell, updatedXml } = data;
  // 更新节点的 stepInfo 属性
  cell.stepInfo = updatedXml;

  // 如果需要立即更新 XML 结构，可以调用 getCurrentXmlStructure
  getCurrentXmlStructure();
};

// / 从stepInfo中提取节点类型
// const getNodeTypeFromStepInfo = (stepInfo) => {
//   if (!stepInfo) return null;

//   try {
//     const xmlDoc = mxUtils.parseXml(stepInfo);
//     const stepElements = xmlDoc.getElementsByTagName("Step");
//     if (stepElements.length > 0) {
//       // 从Step元素的属性中获取类型信息
//       const stepElement = stepElements[0];
//       const ctype = stepElement.getAttribute("ctype");
//       const label = stepElement.getAttribute("label");

//       // 根据ctype或label判断节点类型
//       if (ctype) {
//         // 根据ctype映射到中文名称
//         switch (ctype) {
//           case "ExcelInput":
//             return "Excel输入";
//           case "TableInput":
//             return "表输入";
//           case "SystemInfo":
//             return "获取系统信息";
//           case "ExcelOutput":
//             return "Excel输出";
//           default:
//             return label || ctype;
//         }
//       }

//       return label;
//     }
//   } catch (error) {
//     console.error("解析stepInfo失败:", error);
//   }

//   return null;
// };
const getNodeTypeFromStepInfo = (stepInfo) => {
  if (!stepInfo) return null;

  try {
    const xmlDoc = mxUtils.parseXml(stepInfo);
    const stepElements = xmlDoc.getElementsByTagName("Step");
    if (stepElements.length > 0) {
      // 从Step元素的属性中获取类型信息
      const stepElement = stepElements[0];
      const ctype = stepElement.getAttribute("ctype");  // 插件ID
      const label = stepElement.getAttribute("label");  // 显示名称
      // 优先返回ctype（插件ID），如果ctype不存在则返回label（显示名称）
      return ctype;
    }
  } catch (error) {
    console.error("解析stepInfo失败:", error);
  }

  return null;
};

const handleBaseAdd = async () => {
  try {
    const res = await addBaseSetting({ graphXml: getCurrentXmlStructure() });
    dataBaseSettingDialog.value.openDialog(res, 'add', transformationName.value);
  } catch (error) {
    console.log(error);
  }
};

const handleBaseUpdate = async (data) => {
  try {
    const res = await addBaseSetting({ graphXml: getCurrentXmlStructure(), name: data.name });
    dataBaseSettingDialog.value.openDialog(res, 'update', transformationName.value);
  } catch (error) {
    console.log(error);
  }
};

const databaseSaveInfo = ref([]);
const dataBaseSave = (data) => {
  databaseSaveInfo.value.push(data);
  saveGraph()
}

// 获取单个节点的XML结构
const getCellXmlStructure = (cell) => {
  if (cell && cell.stepInfo) {
    // 如果cell.stepInfo存在，我们基于它创建完整的XML结构
    try {
      const xmlDoc = mxUtils.parseXml(cell.stepInfo);
      const stepElement = xmlDoc.documentElement;
      // 查找或创建mxCell元素
      let mxCell = stepElement.getElementsByTagName("mxCell")[0];
      if (!mxCell) {
        mxCell = xmlDoc.createElement("mxCell");
        stepElement.appendChild(mxCell);
      }

      // 设置mxCell属性
      mxCell.setAttribute("style", cell.style);
      mxCell.setAttribute("vertex", "1");
      mxCell.setAttribute("parent", "1");

      // 查找或创建mxGeometry元素
      let mxGeometry = mxCell.getElementsByTagName("mxGeometry")[0];
      if (!mxGeometry) {
        mxGeometry = xmlDoc.createElement("mxGeometry");
        mxGeometry.setAttribute("as", "geometry");
        mxCell.appendChild(mxGeometry);
      }

      // 设置mxGeometry属性
      mxGeometry.setAttribute("x", cell.geometry.x);
      mxGeometry.setAttribute("y", cell.geometry.y);
      mxGeometry.setAttribute("width", cell.geometry.width);
      mxGeometry.setAttribute("height", cell.geometry.height);

      // 将cell.id添加到stepInfo中
      stepElement.setAttribute("id", cell.id);

      return new XMLSerializer().serializeToString(stepElement);
    } catch (e) {
      console.error("Error generating cell XML structure:", e);
    }

    // 如果出现错误，返回原始stepInfo
    return cell.stepInfo;
  }
  return "";
};

// 取消设置
const cancelSetup = () => {
  taskGroupDialogVisible.value = false;
};

onMounted(() => {
  // 部署mxgraph基础配置
  createGraph();
  initDragAndDrop();
  configMenu();
  configMouseEvent();
  // 页面加载时弹出转换名称输入框
  taskGroupDialogVisible.value = true;
  // 监听路由参数变化
  watch(
    () => route.query,
    (newQuery) => {
      if (newQuery.directoryName && newQuery.transName) {
        openTransdetail(newQuery.directoryName);
        taskGroupDialogVisible.value = false;
        showWhitePage.value = false;
      }
    },
    { immediate: true }
  );
});

onBeforeUnmount(() => {
  if (graph) {
    graph.destroy();
  }
});
</script>

<style lang="scss" scoped>
.cardShadow {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  position: relative;
  background: none;

  :deep(.el-drawer__header) {
    padding: 20px 20px 0;
    margin-bottom: 0px;
  }
}

.left-panel {
  width: 14%;
  background-color: #f5f5f7;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  user-select: none;
  transition: all 0.3s ease;
  z-index: 10;
}

.panel-title {
  padding: 16px 16px 8px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #86868b;
  margin: 0;
  border: none;
  flex-shrink: 0;
}

.left-panel :deep(.el-input) {
  padding: 0 12px 6px 12px;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
}

.left-panel :deep(.el-input__wrapper) {
  // background-color: rgba(118, 118, 128, 0.12);
  box-shadow: none !important;
  border-radius: 8px;
  padding: 1px 11px;
  transition: all 0.2s;
}

.left-panel :deep(.el-input__wrapper.is-focus) {
  background-color: #fff;
  box-shadow: 0 0 0 1px #007aff !important;
}

.left-panel :deep(.el-input__inner) {
  height: 28px;
  font-size: 13px;
}

.toggle-icon {
  font-size: 12px;
  color: #98989d;
  margin-left: auto;
  margin-right: 0;
}

.sub-panel {
  flex: 1;
  overflow-y: overlay;
  overflow-x: hidden;
  padding: 0 12px 20px 12px;
  margin: 0;
  border: none;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0);
    border-radius: 4px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.sub-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 32px;
  line-height: 32px;
  padding: 0 8px;
  margin-top: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: background-color 0.15s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  /* 左侧文件夹图标样式 */
  img {
    width: 16px;
    height: 16px;
    margin: 0 8px 0 0;
    opacity: 0.8;
    flex-shrink: 0;
  }
}

.tool-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #424245;
  padding: 6px 8px;
  margin-left: 12px;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  background-color: transparent;

  img {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));
  }

  &:hover {
    background-color: #fff;
    color: #000;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transform: translateX(2px);
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.98);
    background-color: #f0f0f0;
  }
}

.kettleToolCss {
  height: 100%;
  width: 85.5%;
  background-color: #f7f9fc;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 顶部工具栏容器 */
.toolbar {
  height: 56px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  z-index: 100;
  transition: all 0.3s ease;

  /* 转换名称样式优化 */
  &>span {
    font-size: 16px;
    font-weight: 600;
    color: #303133 !important;
    margin-right: 24px;
    padding-left: 0 !important;
    position: relative;
    display: flex;
    align-items: center;

    &::after {
      content: "";
      display: block;
      width: 1px;
      height: 16px;
      background-color: #dcdfe6;
      margin-left: 20px;
    }
  }

  :deep(.el-button-group) {
    display: flex;
    gap: 8px;

    &>.el-button:not(:first-child),
    &>.el-button:not(:last-child) {
      margin-left: 0;
      border-left: 1px solid transparent;
    }

    &>.el-button:first-child {
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    &>.el-button:last-child {
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }
  }

  /* 按钮通用样式 */
  :deep(.el-button) {
    border: 1px solid transparent;
    background-color: transparent;
    color: #606266;
    height: 34px;
    padding: 0 12px;
    border-radius: 6px !important;
    /* 圆角矩形 */
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    /* 丝滑的贝塞尔曲线 */

    /* 图标样式 */
    img {
      width: 16px;
      height: 16px;
      margin-right: 6px;
      transition: transform 0.3s ease;
      filter: grayscale(100%);
      /* 默认图标灰色，更统一 */
      opacity: 0.7;
    }

    /* 悬停状态 (Hover) */
    &:hover {
      background-color: #eff6ff;
      /* 浅蓝色背景 */
      color: #409eff;
      transform: translateY(-1px);
      /* 轻微上浮 */
      box-shadow: 0 2px 6px rgba(64, 158, 255, 0.15);
      /* 悬浮阴影 */

      img {
        filter: grayscale(0%);
        opacity: 1;
        transform: scale(1.1);
      }
    }

    &:active {
      transform: translateY(0);
      background-color: #ecf5ff;
      box-shadow: none;
    }

    &.activeButton {
      background-color: #ecf5ff;
      color: #409eff;
      border-color: rgba(64, 158, 255, 0.2);

      img {
        filter: grayscale(0%);
        opacity: 1;
      }
    }
  }
}

.graph-container {
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: #fff;
  background-image: linear-gradient(to right, #e0e0e0 1px, transparent 1px),
    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  font-weight: bold;
}
</style>

<style lang="scss">
.mxRubberband {
  position: absolute;
  background: #0077ff;
  opacity: 0.2;
}

.mxPopupMenu {
  position: absolute;
  background: #fff;
  border: 1px solid #ededed;
  border-radius: 4px;
  font-size: 14px;
  min-width: 100px;
}

.mxPopupMenu .mxPopupMenuItem {
  white-space: nowrap;
  cursor: pointer;
  border-radius: 2px;
  margin: 1px 0;

  &:hover {
    color: #409eff;
  }
}

.mxPopupMenu .mxDisabled {
  color: #bbb;
  cursor: default;
}

.mxPopupMenu .mxDisabled:hover {
  color: #bbb;
  cursor: default;
}

// 添加连接点样式
.mxConnectionConstraint {
  background-color: #4385f5 !important;
  border-color: #2d5aac !important;
  width: 8px !important;
  height: 8px !important;
}

.mxConnectionHandler {
  stroke: #4385f5 !important;
  stroke-width: 2 !important;
}

// 连接点样式优化
.mxConstraintHandler {
  cursor: pointer;
}

.kettleToolCss {
  .toolbar {
    .el-button-group {
      display: flex;
      gap: 5px;
    }

    .el-button {
      border: none !important;
      font-size: 14px !important;

      span {
        padding: 5px 0px !important;
      }
    }

    .activeButton {
      color: #409eff !important;
      background-color: #ecf3fd !important;
    }
  }
}
</style>