<template>
  <div class="my-process-designer">
    <div class="my-process-designer__header">
      <slot name="control-header"></slot>
      <template v-if="!$slots['control-header']">
        <el-button-group>
          <el-button :size="headerButtonSize" :type="headerButtonType" :icon="FolderOpened" @click="refFile.click()">打开文件</el-button>
          <el-tooltip effect="light">
            <template #content>
              <el-button :size="headerButtonSize" type="text" @click="downloadProcessAsXml">下载为XML文件</el-button>
              <br />
              <el-button :size="headerButtonSize" type="text" @click="downloadProcessAsSvg">下载为SVG文件</el-button>
              <br />
              <el-button :size="headerButtonSize" type="text" @click="downloadProcessAsBpmn">下载为BPMN文件</el-button>
            </template>
            <el-button :size="headerButtonSize" :type="headerButtonType" :icon="Download">下载文件</el-button>
          </el-tooltip>
          <el-tooltip effect="light">
            <template #content>
              <el-button :size="headerButtonSize" type="text" @click="previewProcessXML">预览XML</el-button>
              <br />
              <el-button :size="headerButtonSize" type="text" @click="previewProcessJson">预览JSON</el-button>
            </template>
            <el-button :size="headerButtonSize" :type="headerButtonType" :icon="View">预览</el-button>
          </el-tooltip>
          <el-tooltip v-if="simulation" effect="light" :content="simulationStatus ? '退出模拟' : '开启模拟'">
            <el-button :size="headerButtonSize" :type="headerButtonType" :icon="Cpu" @click="processSimulation">
              模拟
            </el-button>
          </el-tooltip>
          <el-button :size="headerButtonSize" :type="headerButtonType" :icon="SwitchButton" @click="depolyProcess">
            保存并部署
          </el-button>
        </el-button-group>
        <!-- 保存并部署 -->

        <el-button-group>
          <el-tooltip effect="light" content="向左对齐">
            <el-button :size="headerButtonSize" class="align align-left" :icon="Histogram" @click="() => elementsAlign('left')" />
          </el-tooltip>
          <el-tooltip effect="light" content="向右对齐">
            <el-button :size="headerButtonSize" class="align align-right" :icon="Histogram" @click="() => elementsAlign('right')" />
          </el-tooltip>
          <el-tooltip effect="light" content="向上对齐">
            <el-button :size="headerButtonSize" class="align align-top" :icon="Histogram" @click="() => elementsAlign('top')" />
          </el-tooltip>
          <el-tooltip effect="light" content="向下对齐">
            <el-button :size="headerButtonSize" class="align align-bottom" :icon="Histogram" @click="() => elementsAlign('bottom')" />
          </el-tooltip>
          <el-tooltip effect="light" content="水平居中">
            <el-button :size="headerButtonSize" class="align align-center" :icon="Histogram" @click="() => elementsAlign('center')" />
          </el-tooltip>
          <el-tooltip effect="light" content="垂直居中">
            <el-button :size="headerButtonSize" class="align align-middle" :icon="Histogram" @click="() => elementsAlign('middle')" />
          </el-tooltip>
        </el-button-group>
        <el-button-group>
          <el-tooltip effect="light" content="缩小视图">
            <el-button :size="headerButtonSize" :disabled="defaultZoom < 0.2" :icon="ZoomOut" @click="processZoomOut()" />
          </el-tooltip>
          <el-button :size="headerButtonSize">{{ Math.floor(defaultZoom * 10 * 10) + "%" }}</el-button>
          <el-tooltip effect="light" content="放大视图">
            <el-button :size="headerButtonSize" :disabled="defaultZoom > 4" :icon="ZoomIn" @click="processZoomIn()" />
          </el-tooltip>
          <el-tooltip effect="light" content="重置视图并居中">
            <el-button :size="headerButtonSize" :icon="ScaleToOriginal" @click="processReZoom" />
          </el-tooltip>
        </el-button-group>
        <el-button-group>
          <el-tooltip effect="light" content="撤销">
            <el-button :size="headerButtonSize" :disabled="!revocable" :icon="RefreshLeft" @click="processUndo" />
          </el-tooltip>
          <el-tooltip effect="light" content="恢复">
            <el-button :size="headerButtonSize" :disabled="!recoverable" :icon="RefreshRight" @click="processRedo" />
          </el-tooltip>
          <el-tooltip effect="light" content="重新绘制">
            <el-button :size="headerButtonSize" :icon="Refresh" @click="processRestart" />
          </el-tooltip>
        </el-button-group>
      </template>
      <!-- 用于打开本地文件-->
      <input type="file" id="files" ref="refFile" style="display: none" accept=".xml, .bpmn" @change="importLocalFile" />
    </div>
    <div class="my-process-designer__container">
      <div class="my-process-designer__canvas" ref="bpmnCanvas"></div>
    </div>
    <el-dialog title="预览" width="60%" v-model="previewModelVisible" append-to-body destroy-on-close>
      <div style="background:#282c34">
        <highlightjs :language="previewType" :code="previewResult" />
      </div>
    </el-dialog>
    <!-- 新增-->
    <SzycDialog :dialogVisible="addShow" :close-on-click-modal="false" destroy-on-close title="保存并部署" width="30%" class="indexAllocation--indRuleExpr-dialog" @close="addShow = false">
      <template #uname>
        <el-form :label-position="labelPosition" label-width="auto" :model="addForm" ref="addFormRef" :rules="addFormRules">
          <el-form-item label="流程名称：" prop="name">
            <el-input placeholder="请输入" v-model="addForm.name"> </el-input>
          </el-form-item>
          <el-form-item label="流程类型：" prop="category">
            <el-select placeholder="请选择" v-model="addForm.category">
              <el-option v-for="item in dictList.dict['flow_category']" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="任务触发" prop="dueDays" style="display: flex;" class="el-form-dueDays-item">
             <el-input v-model="addForm.dueDays" @change="handleChange" placeholder="请输入大于0的整数" style="width: calc(100% - 80px);" />
             <div style="margin-left: 10px; width: 70px; font-family: Microsoft YaHei;font-size: 17px; color: #000;">天后关闭</div>
          </el-form-item>
          <el-form-item label="启用否：" prop="enabled">
            <el-switch v-model="addForm.enabled" active-value="1" inactive-value="0" />
          </el-form-item>
          <el-form-item label="备注：" prop="remark">
            <el-input placeholder="请输入" v-model="addForm.remark" type="textarea" rows="3">
            </el-input>
          </el-form-item>
        </el-form>
        <div style="display: flex; justify-content: center; margin-top: 10px">
          <CanCelBtn @click="addShow = false"> 取消 </CanCelBtn>
          <buttonDiv @click="submitAddForm"> 保存 </buttonDiv>
        </div>
      </template>
    </SzycDialog>
  </div>
</template>

<script setup>

import { FolderOpened, Download, View, Cpu, Histogram, ZoomOut, ZoomIn, ScaleToOriginal, RefreshLeft, RefreshRight, Refresh, SwitchButton } from "@element-plus/icons-vue";
import { ref, computed, onMounted, onBeforeUnmount, defineProps, defineEmits, nextTick, reactive,inject } from 'vue';
import BpmnModeler from "bpmn-js/lib/Modeler";
import DefaultEmptyXML from "./plugins/defaultEmpty";
// 翻译方法
import customTranslate from "./plugins/translate/customTranslate";
import translationsCN from "./plugins/translate/zh";
import tokenSimulation from 'bpmn-js-token-simulation';
// 导入token simulation CSS样式
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';

// 标签解析构建器
// import bpmnPropertiesProvider from "bpmn-js-properties-panel/lib/provider/bpmn";
// 标签解析 Moddle
import camundaModdleDescriptor from "./plugins/descriptor/camundaDescriptor.json";
import activitiModdleDescriptor from "./plugins/descriptor/activitiDescriptor.json";
import flowableModdleDescriptor from "./plugins/descriptor/flowableDescriptor.json";
// 标签解析 Extension
import camundaModdleExtension from "./plugins/extension-moddle/camunda";
import activitiModdleExtension from "./plugins/extension-moddle/activiti";
import flowableModdleExtension from "./plugins/extension-moddle/flowable";
// 引入json转换与高亮
import X2JS from "x2js";

import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { deploymentProcess, getXmlString, listFlowExtConfig, updateFlowExtConfig } from "@/api/workflow";
import { useRoute, useRouter } from 'vue-router'
import { dictStore } from "@/store/dict";
import { panelStore } from "@/store/panel";
const panelList = panelStore();
const dictList = dictStore(); //  字典接口

const route = useRoute()
const router = useRouter()

// 定义props
const props = defineProps({
  value: String, // xml 字符串
  processId: String,
  processName: String,
  translations: Object, // 自定义的翻译文件
  additionalModel: [Object, Array], // 自定义model
  moddleExtension: Object, // 自定义moddle
  onlyCustomizeAddi: {
    type: Boolean,
    default: false
  },
  onlyCustomizeModdle: {
    type: Boolean,
    default: false
  },
  simulation: {
    type: Boolean,
    default: true
  },
  keyboard: {
    type: Boolean,
    default: true
  },
  prefix: {
    type: String,
    default: "camunda"
  },
  events: {
    type: Array,
    default: () => ["element.click"]
  },
  headerButtonSize: {
    type: String,
    default: "small",
    validator: value => ["default", "medium", "small", "mini"].indexOf(value) !== -1
  },
  headerButtonType: {
    type: String,
    default: "primary",
    validator: value => ["default", "primary", "success", "warning", "danger", "info"].indexOf(value) !== -1
  }
});

// 定义emits
const emit = defineEmits([
  'init-finished',
  'destroy',
  'commandStack-changed',
  'input',
  'change',
  'canvas-viewbox-changed'
]);


//保存部署弹窗
const addShow = ref(false);
const addFormRef = ref(null);
const addForm = reactive({
  // file: "",
  name: "",
  category: "",
  enabled: "1",
  dueDays: "",
  remark: "",
});
const addFormRules = {
  name: [{ required: true, message: "请输入流程名称", trigger: "blur" }],
  category: [{ required: true, message: "请选择流程类型", trigger: "change" }],

};

const handleChange = (value) => {
  const positiveIntegerRegex = /^[1-9]\d*$/;
  if (!positiveIntegerRegex.test(value)){
    addForm.dueDays = parseInt(value) || null
  }
}


// 响应式数据
const bpmnCanvas = ref(null);
const refFile = ref(null);
const defaultZoom = ref(1);
const previewModelVisible = ref(false);
const simulationStatus = ref(false);
const previewResult = ref("");
const previewType = ref("xml");
const recoverable = ref(false);
const revocable = ref(false);
let bpmnModeler = null;

// 计算属性
const additionalModules = computed(() => {
  const Modules = [];
  // 仅保留用户自定义扩展模块
  if (props.onlyCustomizeAddi) {
    if (Array.isArray(props.additionalModel)) {
      return props.additionalModel || [];
    }
    return [props.additionalModel];
  }

  // 插入用户自定义扩展模块
  if (Array.isArray(props.additionalModel)) {
    Modules.push(...props.additionalModel);
  } else {
    props.additionalModel && Modules.push(props.additionalModel);
  }

  // 翻译模块
  const TranslateModule = {
    translate: ["value", customTranslate(props.translations || translationsCN)]
  };
  Modules.push(TranslateModule);
  if (props.simulation && tokenSimulation) {
    Modules.push(tokenSimulation);
  }

  // 根据需要的流程类型设置扩展元素构建模块
  // if (props.prefix === "bpmn") {
  //   Modules.push(bpmnModdleExtension);
  // }
  if (props.prefix === "camunda") {
    Modules.push(camundaModdleExtension);
  }
  if (props.prefix === "flowable") {
    Modules.push(flowableModdleExtension);
  }
  if (props.prefix === "activiti") {
    Modules.push(activitiModdleExtension);
  }
  return Modules;
});

const moddleExtensions = computed(() => {
  const Extensions = {};
  // 仅使用用户自定义模块
  if (props.onlyCustomizeModdle) {
    return props.moddleExtension || null;
  }

  // 插入用户自定义模块
  if (props.moddleExtension) {
    for (let key in props.moddleExtension) {
      Extensions[key] = props.moddleExtension[key];
    }
  }

  // 根据需要的 "流程类型" 设置 对应的解析文件
  if (props.prefix === "activiti") {
    Extensions.activiti = activitiModdleDescriptor;
  }
  if (props.prefix === "flowable") {
    Extensions.flowable = flowableModdleDescriptor;
  }
  if (props.prefix === "camunda") {
    Extensions.camunda = camundaModdleDescriptor;
  }

  return Extensions;
});

// 方法
async function initBpmnModeler() {
  if (bpmnModeler) return;
  bpmnModeler = new BpmnModeler({
    container: bpmnCanvas.value,
    keyboard: props.keyboard ? { bindTo: document } : null,
    additionalModules: additionalModules.value,
    moddleExtensions: moddleExtensions.value
  });
  emit('init-finished', bpmnModeler);
  initModelListeners();
  // try {
  //   console.log(route.query);
  //   console.log("-----------");
  if (route.query.id) {
    if (route.query.key) {
      console.log(route.query.key, '---route.query.key');
      const ress = await listFlowExtConfig({
        configId: route.query.configId,
      });
      if (ress.code == 200) {
        panelList.panelData.userNodeConfigList = ress.data || [];
      }
    }
    const res = await getXmlString({ deploymentId: route.query.id });
    console.log(res, '---');
    addForm.name = route.query.name;
    addForm.category = route.query.category;
    addForm.enabled = route.query.enabled;
    addForm.remark = route.query.remark;
    addForm.dueDays = route.query?.dueDays || '';

    if (res.code == 200) {
      const { warnings } = await bpmnModeler.importXML(res.data);
      nextTick(() => {
        bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
      });
    }

  } else {
    panelList.panelData.userNodeConfigList = [];
    // const { warnings } = await bpmnModeler.importXML(getXmlStr());
    // console.log(warnings);
  }
  // 调整在正中间
  nextTick(() => {
    bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
  });
  // 打开 minimap, 默认不打开
  // bpmnModeler.value.get("minimap").open();
  // } catch (err) {
  //   console.log("error rendering", err);
  // }
}

function initModelListeners() {
  const EventBus = bpmnModeler.get("eventBus");
  // 注册需要的监听事件, 将. 替换为 - , 避免解析异常
  props.events.forEach(event => {
    EventBus.on(event, function (eventObj) {
      let eventName = event.replace(/\./g, "-");
      let element = eventObj ? eventObj.element : null;
      emit(eventName, element, eventObj);
    });
  });

  // 监听图形改变返回xml
  EventBus.on("commandStack.changed", async (event) => {
    try {
      recoverable.value = bpmnModeler.get("commandStack").canRedo();
      revocable.value = bpmnModeler.get("commandStack").canUndo();
      let { xml } = await bpmnModeler.saveXML({ format: true });
      emit('commandStack-changed', event);
      emit('input', xml);
      emit('change', xml);
    } catch (e) {
      console.error(`[Process Designer Warn]: ${e.message || e}`);
    }
  });

  // 监听视图缩放变化
  bpmnModeler.on("canvas.viewbox.changed", ({ viewbox }) => {
    emit('canvas-viewbox-changed', { viewbox });
    const { scale } = viewbox;
    defaultZoom.value = Math.floor(scale * 100) / 100;
  });
}

/* 创建新的流程图 */
async function createNewDiagram(xml) {
  // 将字符串转换成图显示出来
  let newId = props.processId || `Process_${new Date().getTime()}`;
  let newName = props.processName || `业务流程_${new Date().getTime()}`;
  let xmlString = xml || DefaultEmptyXML(newId, newName, props.prefix);
  try {
    let { warnings } = await bpmnModeler.importXML(xmlString);
    if (warnings && warnings.length) {
      warnings.forEach(warn => console.warn(warn));
    }
  } catch (e) {
    console.error(`[Process Designer Warn]: ${e?.message || e}`);
  }
}

// 下载流程图到本地
async function downloadProcess(type, name) {
  try {
    // 按需要类型创建文件并下载
    if (type === "xml" || type === "bpmn") {
      const { err, xml } = await bpmnModeler.saveXML();
      // 读取异常时抛出异常
      if (err) {
        console.error(`[Process Designer Warn ]: ${err.message || err}`);
      }
      let { href, filename } = setEncoded(type.toUpperCase(), name, xml);
      downloadFunc(href, filename);
    } else {
      const { err, svg } = await bpmnModeler.saveSVG();
      // 读取异常时抛出异常
      if (err) {
        return console.error(err);
      }
      let { href, filename } = setEncoded("SVG", name, svg);
      downloadFunc(href, filename);
    }
  } catch (e) {
    console.error(`[Process Designer Warn ]: ${e.message || e}`);
  }

  // 文件下载方法
  function downloadFunc(href, filename) {
    if (href && filename) {
      let a = document.createElement("a");
      a.download = filename; //指定下载的文件名
      a.href = href; //  URL对象
      a.click(); // 模拟点击
      URL.revokeObjectURL(a.href); // 释放URL 对象
    }
  }
}

// 根据所需类型进行转码并返回下载地址
function setEncoded(type, filename = "diagram", data) {
  const encodedData = encodeURIComponent(data);
  return {
    filename: `${filename}.${type}`,
    href: `data:application/${type === "svg" ? "text/xml" : "bpmn20-xml"};charset=UTF-8,${encodedData}`,
    data: data
  };
}


// 部署流程
const depolyProcess = async () => {

  console.log(inject('nodeProcess'),'==');

  const elementRegistry = bpmnModeler.get("elementRegistry");
  // const modeling = bpmnModeler.get("modeling");
  const processEl = elementRegistry.find((e) => e.type === "bpmn:Process");
  if (processEl) {
    console.log(processEl.businessObject, "processEl");
    addForm.name = processEl?.businessObject?.name || "";
  }
  addShow.value = true;
};


const submitAddForm = async () => {
  addFormRef.value.validate(async (valid) => {
    if (valid) {
      // let invalidItem
      // console.log(panelList.panelData?.userNodeConfigList, "panelList.panelData.userNodeConfigList");
      // if (panelList.panelData?.userNodeConfigList?.length) {
      //  invalidItem = panelList.panelData.userNodeConfigList.find(item => !item.associatedRole);

      // }
      // if (invalidItem) {
      //   ElMessage.error(`请选择关联角色`);
      //   return;
      // }
      // 获取 BPMN XML 数据
      const elementRegistry = bpmnModeler.get("elementRegistry");
      const modeling = bpmnModeler.get("modeling");
      const processEl = elementRegistry.find((e) => e.type === "bpmn:Process");

      console.log(elementRegistry, "elementRegistry", processEl);
      if (processEl) {
        modeling.updateProperties(processEl, { name: addForm.name });
      }
      const { err, xml } = await bpmnModeler.saveXML({ format: true });
      if (err) {
        ElMessage.error("获取流程图数据失败");
        return;
      }

      // 创建文件名（使用流程名称或默认名称）
      const filename =
        addForm.name && addForm.name.trim()
          ? `${addForm.name.trim()}.bpmn`
          : `process_${new Date().getTime()}.bpmn`;

      // 创建包含XML数据的文件对象
      // 创建 FormData 并添加文件
      const param = new FormData();
      param.append(
        "file",
        new Blob([xml], { type: "text/xml" }),
        filename + ".bpmn"
      );
      param.append("name", addForm.name);
      param.append("category", addForm.category);
      param.append("enabled", addForm.enabled);
      param.append("remark", addForm.remark || '');
      param.append("dueDays", addForm.dueDays || '');
      // 调用部署接口
      let res = await deploymentProcess(param);
      if (res.code == 200) {
        if(panelList.panelData?.userNodeConfigList?.length){
          console.log(panelList.panelData, "panelList.panelData")
          panelList.panelData.configId = res.data;
          let updateRes = await updateFlowExtConfig({...panelList.panelData})
          if (updateRes.code == 200) {
            ElMessage.success("流程部署成功");
            addShow.value = false;
            router.push({ path: "/approve" });
          }
        } else {
          ElMessage.success("流程部署成功");
          addShow.value = false;
          router.push({ path: "/approve" });
        }
        console.log(panelList.panelData, "panelList.panelData");

      } else {
        ElMessage.error(res.msg);
      }
    } else {
      ElMessage.error("请您填写必填信息");
      return;
    }
  });
};
// 加载本地文件
function importLocalFile() {
  const file = refFile.value.files[0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    let xmlStr = this.result;
    console.log(xmlStr, '--')
    createNewDiagram(xmlStr);
  };
}

/* ------------------------------------------------ refs methods ------------------------------------------------------ */
function downloadProcessAsXml() {
  downloadProcess("xml");
}

function downloadProcessAsBpmn() {
  downloadProcess("bpmn");
}

function downloadProcessAsSvg() {
  downloadProcess("svg");
}

function processSimulation() {
  simulationStatus.value = !simulationStatus.value;
  // console.log('模拟状态切换:', simulationStatus.value);
  props.simulation && bpmnModeler.get("toggleMode").toggleMode(simulationStatus.value);
}

function processRedo() {
  bpmnModeler.get("commandStack").redo();
}

function processUndo() {
  bpmnModeler.get("commandStack").undo();
}

function processZoomIn(zoomStep = 0.1) {
  let newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100;
  if (newZoom > 4) {
    throw new Error("[Process Designer Warn ]: The zoom ratio cannot be greater than 4");
  }
  defaultZoom.value = newZoom;
  bpmnModeler.get("canvas").zoom(defaultZoom.value);
}

function processZoomOut(zoomStep = 0.1) {
  let newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100;
  if (newZoom < 0.2) {
    throw new Error("[Process Designer Warn ]: The zoom ratio cannot be less than 0.2");
  }
  defaultZoom.value = newZoom;
  bpmnModeler.get("canvas").zoom(defaultZoom.value);
}

function processZoomTo(newZoom = 1) {
  if (newZoom < 0.2) {
    throw new Error("[Process Designer Warn ]: The zoom ratio cannot be less than 0.2");
  }
  if (newZoom > 4) {
    throw new Error("[Process Designer Warn ]: The zoom ratio cannot be greater than 4");
  }
  defaultZoom.value = newZoom;
  bpmnModeler.get("canvas").zoom(newZoom);
}

function processReZoom() {
  defaultZoom.value = 1;
  bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
}

function processRestart() {
  recoverable.value = false;
  revocable.value = false;
  createNewDiagram(null);
}

function elementsAlign(align) {
  const Align = bpmnModeler.get("alignElements");
  const Selection = bpmnModeler.get("selection");
  const SelectedElements = Selection.get();
  if (!SelectedElements || SelectedElements.length <= 1) {
    // 这里使用了el-message，需要确保在Vue 3中正确引入和使用
    console.warn("请按住 Ctrl 键选择多个元素对齐");
    return;
  }

  // 确认对话框在Vue 3中需要单独处理
  // 这里简化为直接执行对齐操作
  Align.trigger(SelectedElements, align);
}

/*-----------------------------    方法结束     ---------------------------------*/
function previewProcessXML() {
  bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
    previewResult.value = xml;
    previewType.value = "xml";
    previewModelVisible.value = true;
  });
}

function previewProcessJson() {
  const newConvert = new X2JS();
  bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
    const { definitions } = newConvert.xml2js(xml);
    if (definitions) {
      previewResult.value = JSON.stringify(definitions, null, 4);
    } else {
      previewResult.value = "";
    }

    previewType.value = "json";
    previewModelVisible.value = true;
  });
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initBpmnModeler();
    createNewDiagram(props.value);
  });
});

onBeforeUnmount(() => {
  if (bpmnModeler) {
    bpmnModeler.destroy();
    emit('destroy', bpmnModeler);
    bpmnModeler = null;
  }
});
</script>

