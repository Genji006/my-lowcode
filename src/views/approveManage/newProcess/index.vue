<template>
  <div>
    <div style="height: 40px; padding: 5px">
      <el-button-group class="mr-20">
        <el-upload ref="uploadRef" class="upload-demo" action="/api/data-ops/flow/getXmlFromUploadedFile" :show-file-list="false" :pageOpen="false" :headers="{ Authorization: token }" :on-change="handleUploadChanged" :auto-upload="true" :before-upload="beforeUpload" :on-success="handleUploadSuccess" :with-credentials="true" :on-error="handleUploadError" accept=".bpmn,.bpmn20.xml,.BPMN" :on-progress="handleUploadProgress" style="float: left">
          <template #trigger>
            <el-button :size="headerButtonSize" :type="headerButtonType" :icon="FolderOpened">导入文件</el-button>
          </template>
        </el-upload>
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
        <el-button :size="headerButtonSize" :type="headerButtonType" :icon="Cpu" @click="depolyProcess">保存并部署</el-button>

        <!-- <el-tooltip v-if="simulation" effect="light" :content="simulationStatus ? '退出模拟' : '开启模拟'">
          <el-button :size="headerButtonSize" :type="headerButtonType" icon="el-icon-cpu" @click="processSimulation">
            模拟
          </el-button>
        </el-tooltip> -->
      </el-button-group>
      <el-button-group key="scale-control" class="mr-20">
        <el-tooltip effect="light" content="缩小视图">
          <el-button :size="headerButtonSize" :disabled="defaultZoom < 0.2" :icon="ZoomOut" @click="processZoomOut()" />
        </el-tooltip>
        <el-button :size="headerButtonSize">{{
          Math.floor(defaultZoom * 10 * 10) + "%"
        }}</el-button>
        <el-tooltip effect="light" content="放大视图">
          <el-button :size="headerButtonSize" :disabled="defaultZoom > 4" :icon="ZoomIn" @click="processZoomIn()" />
        </el-tooltip>
        <el-tooltip effect="light" content="重置视图并居中">
          <el-button :size="headerButtonSize" :icon="ScaleToOriginal" @click="processReZoom" />
        </el-tooltip>
      </el-button-group>
      <el-button-group key="stack-control">
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
      <!-- 用于打开本地文件-->
      <input id="files" ref="refFileRef" type="file" style="display: none" accept=".xml, .bpmn" @change="importLocalFile" />
      <el-dialog title="预览" width="60%" v-model="previewModelVisible" append-to-body destroy-on-close>
        <highlightjs :language="previewType" :code="previewResult" />
      </el-dialog>
    </div>
    <div ref="canvasRef" class="canves" />
    <div id="js-properties-panel" class="panel" />
  </div>
  <!-- 新增-->
  <SzycDialog :dialogVisible="addShow" :close-on-click-modal="false" destroy-on-close title="保存并部署" width="30%" class="indexAllocation--indRuleExpr-dialog" @close="closeAdd()">
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
        <el-form-item label="启用否：" prop="enabled">
          <el-switch v-model="addForm.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input placeholder="请输入" v-model="addForm.remark" type="textarea" rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <div style="display: flex; justify-content: center; margin-top: 10px">
        <CanCelBtn @click="closeAdd"> 取消 </CanCelBtn>
        <buttonDiv @click="submitAddForm"> 保存 </buttonDiv>
      </div>
    </template>
  </SzycDialog>
</template>
<script setup>
import { ref, reactive, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage as notify } from "element-plus";
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css"; // 左边工具栏以及编辑节点的样式
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import { getXmlStr } from "./xmlData.js";
import minimapModule from "diagram-js-minimap";
import "diagram-js-minimap/assets/diagram-js-minimap.css";
// 模拟流转流程
// import tokenSimulation from 'bpmn-js-token-simulation'
import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css"; // 右边工具栏样式
import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda.json";
import customTranslate from "./components/customTranslate";
// import translations from './components/translations'
import DefaultEmptyXML from "./plugins/defaultEmpty";
import { deploymentProcess, getXmlString } from "@/api/workflow";

// 引入json转换与高亮
import X2JS from "x2js";

import {
  FolderOpened,
  Download,
  View,
  Cpu,
  ZoomOut,
  ZoomIn,
  ScaleToOriginal,
  RefreshLeft,
  RefreshRight,
  Refresh,
} from "@element-plus/icons-vue";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { dictStore } from "@/store/dict";

const dictList = dictStore(); //  字典接口
const router = useRouter();
// 定义props
const props = defineProps({
  events: {
    type: Array,
    default: () => ["element.click"],
  },
  simulation: {
    type: Boolean,
    default: true,
  },
});

const uploadRef = ref(null);
const token = sessionStorage.getItem("token");

// 获取路由
const route = useRoute();

// 定义refs
const canvasRef = ref(null);
const refFileRef = ref(null);
const bpmnModeler = ref(null);
const defaultZoom = ref(1);
const headerButtonSize = ref("mini");
const headerButtonType = ref("primary");
const previewModelVisible = ref(false);
const simulationStatus = ref(false);
const previewResult = ref("");
const previewType = ref("xml");
const recoverable = ref(false);
const revocable = ref(false);
const processTitle = ref("");
const currentRecord = ref(undefined);

//保存部署弹窗
const addShow = ref(false);
const addFormRef = ref(null);
const addForm = reactive({
  // file: "",
  name: "",
  category: "",
  enabled: 1,
  remark: "",
});
const addFormRules = {
  name: [{ required: true, message: "请输入流程名称", trigger: "blur" }],
  category: [{ required: true, message: "请选择流程类型", trigger: "change" }],
};

const closeAdd = () => {
  addShow.value = false;
};

const submitAddForm = async () => {
  addFormRef.value.validate(async (valid) => {
    if (valid) {
      // 获取 BPMN XML 数据
      const elementRegistry = bpmnModeler.value.get("elementRegistry");
      const modeling = bpmnModeler.value.get("modeling");
      const processEl = elementRegistry.find((e) => e.type === "bpmn:Process");

      console.log(elementRegistry, "elementRegistry", processEl);
      if (processEl) {
        modeling.updateProperties(processEl, { name: addForm.name });
      }
      const { err, xml } = await bpmnModeler.value.saveXML({ format: true });
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
      param.append("remark", addForm.remark);
      // 调用部署接口
      let res = await deploymentProcess(param);
      if (res.code == 200) {
        ElMessage.success("流程部署成功");
        addShow.value = false;
        router.push({ path: "/approve" });
      } else {
        ElMessage.error(res.msg);
      }
    } else {
      ElMessage.error("请您填写必填信息");
      return;
    }
  });
};

// 定义emits
const emit = defineEmits([
  "init-finished",
  "commandStack-changed",
  "input",
  "change",
  "canvas-viewbox-changed",
]);

// 监听路由变化
watch(
  () => route,
  (val, oldval) => {
    console.log(val);
  },
  { deep: true }
);

// 初始化模型监听
const initModelListeners = () => {
  const EventBus = bpmnModeler.value.get("eventBus");

  // 注册需要的监听事件, 将. 替换为 - , 避免解析异常
  props.events.forEach((event) => {
    EventBus.on(event, function (eventObj) {
      const eventName = event.replace(/\./g, "-");
      const element = eventObj ? eventObj.element : null;
      emit(eventName, element, eventObj);
    });
  });

  // 监听图形改变返回xml
  EventBus.on("commandStack.changed", async (event) => {
    try {
      recoverable.value = bpmnModeler.value.get("commandStack").canRedo();
      revocable.value = bpmnModeler.value.get("commandStack").canUndo();
      const { xml } = await bpmnModeler.value.saveXML({ format: true });
      emit("commandStack-changed", event);
      emit("input", xml);
      emit("change", xml);
    } catch (e) {
      console.error(`[Process Designer Warn]: ${e.message || e}`);
    }
  });

  // 监听视图缩放变化
  bpmnModeler.value.on("canvas.viewbox.changed", ({ viewbox }) => {
    emit("canvas-viewbox-changed", { viewbox });
    const { scale } = viewbox;
    defaultZoom.value = Math.floor(scale * 100) / 100;
  });
};

// 部署流程
const depolyProcess = async () => {
  const elementRegistry = bpmnModeler.value.get("elementRegistry");
  const modeling = bpmnModeler.value.get("modeling");
  const processEl = elementRegistry.find((e) => e.type === "bpmn:Process");

  console.log(elementRegistry, "elementRegistry", processEl);
  if (processEl) {
    console.log(processEl.businessObject, "processEl");
    addForm.name = processEl?.businessObject?.name || "";
  }
  addShow.value = true;
  // // 若没有文件名，弹出输入框
  // const deploy = async (name) => {
  //   // 新增时（无 deploymentId）需要确保 process 的 id 唯一/符合预期
  //   const isNew = !route.query || !route.query.deploymentId;
  //   if (isNew) {
  //     const elementRegistry = bpmnModeler.value.get("elementRegistry");
  //     const modeling = bpmnModeler.value.get("modeling");
  //     // 找到 bpmn:Process 根元素
  //     let processEl = elementRegistry.find((e) => e.type === "bpmn:Process");
  //     if (processEl) {
  //       const bo = processEl.businessObject;
  //       // 以名称或时间生成一个 key，去除空格和非法字符
  //       const base = (name && name.trim()) || `process_${Date.now()}`;
  //       // 确保符合 XML NCName 规范：字母开头，可包含字母数字下划线连字符
  //       let newKey = base.replace(/[^a-zA-Z0-9_\-]/g, "_");
  //       // 如果以数字开头，添加前缀
  //       if (/^[0-9]/.test(newKey)) {
  //         newKey = "process_" + newKey;
  //       }
  //       // 如果为空或只有特殊字符，使用默认值
  //       if (!newKey || newKey === "_") {
  //         newKey = `process_${Date.now()}`;
  //       }
  //       // 仅当当前 id 为默认生成的或用户希望覆盖时才更新
  //       if (!bo.id || /^Process_/.test(bo.id)) {
  //         modeling.updateProperties(processEl, {
  //           id: newKey,
  //           name,
  //           isExecutable: true,
  //         });
  //       } else {
  //         // 仍把名称同步一下，避免名称缺失，并强制设置为可执行
  //         modeling.updateProperties(processEl, { name, isExecutable: true });
  //       }
  //     }
  //   }
  //   const { err, xml } = await bpmnModeler.value.saveXML();
  //   if (err) {
  //     console.error(`[Process Designer Warn ]: ${err.message || err}`);
  //   }
  //   const filename = name && name.trim() ? name.trim() : "diagram";
  //   const param = new FormData();
  //   param.append(
  //     "file",
  //     new Blob([xml], { type: "text/xml" }),
  //     filename + ".bpmn"
  //   );
  //   deploymentProcess(filename, param)
  //     .then((_) => {
  //       notify({
  //         title: "通知",
  //         message: "部署成功",
  //         type: "success",
  //       });
  //     })
  //     .catch((_) => {
  //       console.log(_);
  //       notify({
  //         title: "通知",
  //         message: "部署失败",
  //         type: "error",
  //       });
  //     });
  // };
  // // 从右侧属性面板读取流程名称（process.name）
  // let defaultName = processTitle.value || "";
  // try {
  //   const elementRegistry = bpmnModeler.value.get("elementRegistry");
  //   const processEl = elementRegistry.find((e) => e.type === "bpmn:Process");
  //   if (
  //     processEl &&
  //     processEl.businessObject &&
  //     processEl.businessObject.name
  //   ) {
  //     defaultName = processEl.businessObject.name;
  //   }
  // } catch (e) {}
  // if (!defaultName || !defaultName.trim()) {
  //   // 这里需要根据Element Plus的方式重写$prompt
  //   // 简化版本，实际项目中需要使用Element Plus的ElMessageBox.prompt
  //   const value = prompt("请输入部署文件名", "");
  //   if (value && value.trim()) {
  //     processTitle.value = value;
  //     deploy(value);
  //   }
  // } else {
  //   deploy(defaultName);
  // }
};

// 上传之前的回调(限制文件类型)
function beforeUpload(file) {
  const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
  const whiteList = ["bpmn", "bpmn20.xml", "BPMN"];
  if (whiteList.indexOf(fileSuffix) === -1) {
    ElMessage({
      message: "上传文件只能是bpmn或bpmn20.xml格式",
      type: "error",
    });
    return false;
  }
  // 检查文件大小（不能大于10MB）
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    ElMessage({
      message: "上传文件大小不能超过10MB",
      type: "error",
    });
    return false;
  }
}

// 导入成功
const handleUploadSuccess = async (data, uploadFile, uploadFiles) => {
  console.log(data, "导入成功");
  if (data.data) {
    createNewDiagram(data.data);
  }
};

// // 加载本地文件
// const importLocalFile = () => {
//   const file = refFileRef.value?.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.readAsText(file);
//   reader.onload = function () {
//     const xmlStr = this.result;
//     createNewDiagram(xmlStr);
//   };
// };

/* 创建新的流程图 */
const createNewDiagram = async (xml) => {
  // 将字符串转换成图显示出来
  const newId = `Process_${new Date().getTime()}`;
  const newName = `业务流程_${new Date().getTime()}`;
  console.log(newId + " " + newName);
  const xmlString = xml || DefaultEmptyXML(newId, newName);
  try {
    const { warnings } = await bpmnModeler.value.importXML(xmlString);

    // 创建新流程后，默认勾选"可执行文件"
    const elementRegistry = bpmnModeler.value.get("elementRegistry");
    const modeling = bpmnModeler.value.get("modeling");
    const processEl = elementRegistry.find((e) => e.type === "bpmn:Process");

    console.log(elementRegistry, "elementRegistry", processEl);
    if (processEl) {
      modeling.updateProperties(processEl, { isExecutable: true });
    }

    // 调整在正中间
    bpmnModeler.value.get("canvas").zoom("fit-viewport", "auto");
    bpmnModeler.value.get("canvas").zoom(0.8);
    if (warnings && warnings.length) {
      warnings.forEach((warn) => console.warn(warn));
    }
  } catch (e) {
    console.error(`[Process Designer Warn]: ${e?.message || e}`);
  }
};

// 下载流程图到本地
const downloadProcess = async (type, name) => {
  try {
    // 按需要类型创建文件并下载
    if (type === "xml" || type === "bpmn") {
      const { err, xml } = await bpmnModeler.value.saveXML();
      // 读取异常时抛出异常
      if (err) {
        console.error(`[Process Designer Warn ]: ${err.message || err}`);
      }
      const { href, filename } = setEncoded(type.toUpperCase(), name, xml);
      downloadFunc(href, filename);
    } else {
      const { err, svg } = await bpmnModeler.value.saveSVG();
      // 读取异常时抛出异常
      if (err) {
        return console.error(err);
      }
      const { href, filename } = setEncoded("SVG", name, svg);
      downloadFunc(href, filename);
    }
  } catch (e) {
    console.error(`[Process Designer Warn ]: ${e.message || e}`);
  }

  // 文件下载方法
  function downloadFunc(href, filename) {
    if (href && filename) {
      const a = document.createElement("a");
      a.download = filename; // 指定下载的文件名
      a.href = href; //  URL对象
      a.click(); // 模拟点击
      URL.revokeObjectURL(a.href); // 释放URL 对象
    }
  }
};

const downloadProcessAsXml = () => {
  downloadProcess("xml");
};

const downloadProcessAsBpmn = () => {
  downloadProcess("bpmn");
};

const downloadProcessAsSvg = () => {
  downloadProcess("svg");
};

// 根据所需类型进行转码并返回下载地址
const setEncoded = (type, filename = "diagram", data) => {
  const encodedData = encodeURIComponent(data);
  return {
    filename: `${filename}.${type}`,
    href: `data:application/${type === "svg" ? "text/xml" : "bpmn20-xml"
      };charset=UTF-8,${encodedData}`,
    data: data,
  };
};

// 预览XML
const previewProcessXML = () => {
  bpmnModeler.value.saveXML({ format: true }).then(({ xml }) => {
    console.log(xml, "xm;");
    previewResult.value = xml;
    previewType.value = "xml";
    previewModelVisible.value = true;
  });
};

// 预览JSON
const previewProcessJson = () => {
  const newConvert = new X2JS();
  bpmnModeler.value.saveXML({ format: true }).then(({ xml }) => {
    const { definitions } = newConvert.xml2js(xml);
    if (definitions) {
      previewResult.value = JSON.stringify(definitions, null, 4);
    } else {
      previewResult.value = "";
    }

    previewType.value = "json";
    previewModelVisible.value = true;
  });
};

// 重新绘制
const processRestart = () => {
  recoverable.value = false;
  revocable.value = false;
  createNewDiagram(null);
};

// 缩小视图
const processZoomOut = (zoomStep = 0.1) => {
  const newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100;
  if (newZoom < 0.2) {
    throw new Error(
      "[Process Designer Warn ]: The zoom ratio cannot be less than 0.2"
    );
  }
  defaultZoom.value = newZoom;
  bpmnModeler.value.get("canvas").zoom(newZoom);
};

// 放大视图
const processZoomIn = (zoomStep = 0.1) => {
  const newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100;
  if (newZoom > 4) {
    throw new Error(
      "[Process Designer Warn ]: The zoom ratio cannot be greater than 4"
    );
  }
  defaultZoom.value = newZoom;
  bpmnModeler.value.get("canvas").zoom(newZoom);
};

// 重置视图并居中
const processReZoom = () => {
  defaultZoom.value = 1;
  bpmnModeler.value.get("canvas").zoom("fit-viewport", "auto");
};

// 恢复
const processRedo = () => {
  bpmnModeler.value.get("commandStack").redo();
};

// 撤销
const processUndo = () => {
  bpmnModeler.value.get("commandStack").undo();
};

// 模拟（未使用）
const processSimulation = () => {
  console.log(props.simulation);
  console.log(bpmnModeler.value.get("toggleMode"));
  simulationStatus.value = !simulationStatus.value;
  props.simulation && bpmnModeler.value.get("toggleMode").toggleMode();
};


import magicPropertiesProviderModule from './plugins/index.js';
import magicModdleDescriptor from './plugins/magic.json';

// 组件挂载时初始化
onMounted(async () => {
  await nextTick();

  bpmnModeler.value = new Modeler({
    container: canvasRef.value,
    // 添加控制板
    propertiesPanel: {
      parent: "#js-properties-panel",
    },
    additionalModules: [
      propertiesProviderModule,
      propertiesPanelModule,
      // minimapModule,
      {
        translate: ["value", customTranslate],
      },
      magicPropertiesProviderModule,
    ],
    moddleExtensions: {
      camunda: camundaModdleDescriptor,
      magic: magicModdleDescriptor
    },
  });
  console.log(bpmnModeler.value, "bpmnModeler");


  emit("init-finished", bpmnModeler.value);
  initModelListeners();

  try {
    console.log(route.query);
    console.log("-----------");
    if (route.query.id) {
      const res = await getXmlString({ deploymentId: route.query.id });
      addForm.name = route.query.name;
      addForm.category = route.query.category;
      addForm.enabled = route.query.enabled;
      addForm.remark = route.query.remark;
      if (res.code == 200) {
        const { warnings } = await bpmnModeler.value.importXML(res.data);
        nextTick(() => {
          bpmnModeler.value.get("canvas").zoom("fit-viewport", "auto");
        });
      }

      console.log(warnings);
    } else {
      const { warnings } = await bpmnModeler.value.importXML(getXmlStr());
      console.log(warnings);
    }
    // 调整在正中间
    nextTick(() => {
      bpmnModeler.value.get("canvas").zoom("fit-viewport", "auto");
    });
    console.log("rendered");
    // 打开 minimap, 默认不打开
    // bpmnModeler.value.get("minimap").open();
  } catch (err) {
    console.log("error rendering", err);
  }
});
</script>
<style scoped lang="scss">
.canves {
  width: 80%;
  height: calc(100vh - 60px); /* 铺满窗口(减去顶部工具条高度) */
  background-color: rgb(245, 249, 255);
  /* 淡淡网格线 */
  background-image: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.06) 0,
      rgba(0, 0, 0, 0.06) 1px,
      transparent 1px,
      transparent 20px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.06) 0,
      rgba(0, 0, 0, 0.06) 1px,
      transparent 1px,
      transparent 20px
    );
}
.panel {
  height: calc(100vh - 60px); /* 与画布同步高度 */
  top: 40px;
  right: 0;
  position: absolute;
  width: 20%;
  overflow-y: scroll;
}
.mr-20 {
  margin-right: 20px;
}
</style>