<template>
  <div class="process-panel__mian" style="position: relative;" :style="{ width: `${widthBtn?'0':width}px` }">
    <div class="process-panel__container">
      <el-collapse v-model="activeTab" accordion>
        <el-collapse-item name="base" title="常规">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <info-filled />
              </el-icon>
              常规
            </div>
          </template>
          <element-base-info :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject" :type="elementType" />
        </el-collapse-item>
        <el-collapse-item name="nodeProcess" key="nodeProcess" title="节点属性" v-show="bpmnElement?.type  && bpmnElement.type == 'bpmn:UserTask'">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <Share />
              </el-icon>
              节点
            </div>
          </template>
          <ElementNodeProcess :id="elementId" :business-object="elementBusinessObject" :type="elementType" :userTaskList="userTaskList" ref="nodeRef" />
        </el-collapse-item>
        <el-collapse-item name="condition" v-if="elementType === 'Process'" key="message" title="消息与信号">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <Comment />
              </el-icon>
              消息与信号
            </div>
          </template>
          <signal-and-massage />
        </el-collapse-item>
        <el-collapse-item name="condition" v-if="conditionFormVisible" key="condition" title="流转条件">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <Ticket />
              </el-icon>
              流转条件
            </div>
          </template>
          <flow-condition :businessObject="elementBusinessObject" :type="elementType" />
        </el-collapse-item>
        <el-collapse-item name="condition" v-if="formVisible" key="form" title="表单">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <List />
              </el-icon>
              表单
            </div>
          </template>
          <element-form :id="elementId" :type="elementType" />
        </el-collapse-item>
        <el-collapse-item name="task" v-if="elementType.indexOf('Task') !== -1" key="task" title="任务">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <Checked />
              </el-icon>
              任务
            </div>
          </template>
          <element-task :id="elementId" :type="elementType" />
        </el-collapse-item>
        <el-collapse-item name="multiInstance" v-if="elementType.indexOf('Task') !== -1" key="multiInstance" title="多实例">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <HelpFilled />
              </el-icon>
              多实例
            </div>
          </template>
          <element-multi-instance :business-object="elementBusinessObject" :type="elementType" />
        </el-collapse-item>
        <el-collapse-item name="listeners" key="listeners" title="执行监听器">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <BellFilled />
              </el-icon>
              执行监听器
            </div>
          </template>
          <element-listeners :id="elementId" :type="elementType" />
        </el-collapse-item>
        <el-collapse-item name="taskListeners" v-if="elementType === 'UserTask'" key="taskListeners" title="任务监听器">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <BellFilled />
              </el-icon>
              任务监听器
            </div>
          </template>
          <user-task-listeners :id="elementId" :type="elementType" />
        </el-collapse-item>
        <el-collapse-item name="extensions" key="extensions" title="扩展属性">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <CirclePlusFilled />
              </el-icon>
              扩展属性
            </div>
          </template>
          <element-properties :id="elementId" :type="elementType" />
        </el-collapse-item>
        <el-collapse-item name="other" key="other" title="其他">
          <template #title>
            <div class="title-wrapper">
              <el-icon size="18" style="margin-right: 5px;">
                <Promotion />
              </el-icon>
              其他
            </div>
          </template>
          <element-other-config :id="elementId" />
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- <div class="process-panel-submit">
      <el-button @click="submitNodeProcess()">确定</el-button>
    </div> -->
    <div class="lineBtn" @click="widthBtn=!widthBtn">
       {{ widthBtn ? '《' : '》' }}
    </div>
  </div>

</template>
<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, provide } from 'vue'
import ElementBaseInfo from "./base/ElementBaseInfo.vue"
import ElementOtherConfig from "./other/ElementOtherConfig.vue"
import ElementTask from "./task/ElementTask.vue"

import ElementMultiInstance from "./multi-instance/ElementMultiInstance.vue"
import FlowCondition from "./flow-condition/FlowCondition.vue"
import SignalAndMassage from "./signal-message/SignalAndMessage.vue"
import ElementListeners from "./listeners/ElementListeners.vue"
import ElementProperties from "./properties/ElementProperties.vue"
import ElementForm from "./form/ElementForm.vue"
import UserTaskListeners from "./listeners/UserTaskListeners.vue"
import ElementNodeProcess from "./node-process/ElementNodeProcess.vue"

import Log from "../Log"



// Props
const props = defineProps({
  bpmnModeler: Object,
  prefix: {
    type: String,
    default: "camunda"
  },
  width: {
    type: Number,
    default: 400
  },
  idEditDisabled: {
    type: Boolean,
    default: false
  }
})

// 提供给子组件的值
provide('prefix', props.prefix)
provide('width', props.width)

const widthBtn = ref(false)

// 响应式数据
const activeTab = ref("base")
const elementId = ref("")
const elementType = ref("")
const elementBusinessObject = reactive({})
const conditionFormVisible = ref(false)
const formVisible = ref(false)
let bpmnElement = null
let timer = null
const userTaskList = ref([])

// 监听 elementId 变化，重置 activeTab
watch(elementId, () => {
  activeTab.value = "base"
})

const nodeRef = ref(null)
const submitNodeProcess = () => {
  nodeRef.value?.submitProcess()

}

// 初始化模型
const initModels = () => {
  // 初始化 modeler 以及其他 moddle
  if (!props.bpmnModeler) {
    // 避免加载时 流程图 并未加载完成
    timer = setTimeout(() => initModels(), 10)
    return
  }
  if (timer) clearTimeout(timer)
  window.bpmnInstances = {
    modeler: props.bpmnModeler,
    modeling: props.bpmnModeler.get("modeling"),
    moddle: props.bpmnModeler.get("moddle"),
    eventBus: props.bpmnModeler.get("eventBus"),
    bpmnFactory: props.bpmnModeler.get("bpmnFactory"),
    elementFactory: props.bpmnModeler.get("elementFactory"),
    elementRegistry: props.bpmnModeler.get("elementRegistry"),
    replace: props.bpmnModeler.get("replace"),
    selection: props.bpmnModeler.get("selection")
  }
  getActiveElement()
}

// 获取活动元素
const getActiveElement = () => {
  // 初始第一个选中元素 bpmn:Process
  initFormOnChanged(null)
  props.bpmnModeler.on("import.done", e => {
    initFormOnChanged(null)
  })
  // 监听选择事件，修改当前激活的元素以及表单
  props.bpmnModeler.on("selection.changed", ({ newSelection }) => {
    initFormOnChanged(newSelection[0] || null)
  })
  props.bpmnModeler.on("element.changed", ({ element }) => {
    // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
    if (element && element.id === elementId.value) {
      initFormOnChanged(element)
    }
  })
}

// 初始化表单数据
/**
 * 初始化表单并处理元素变更
 * @param {Object} element - 当前选中的BPMN图元素
 * @description 当用户在BPMN图中选择不同元素时，更新属性面板显示内容
 */
const initFormOnChanged = (element) => {
  // 1. 获取当前激活元素
  let activatedElement = element
  // 如果没有传入元素（如初始加载时），尝试获取根元素
  if (!activatedElement) {
    activatedElement =
      // 优先获取Process类型元素
      window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Process") ??
      // 其次获取Collaboration类型元素
      window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Collaboration")
  }

  // 安全检查：如果仍未找到元素，直接返回避免后续操作错误
  if (!activatedElement) return

  // 2. 获取所有bpmn:UserTask类型的元素
  const allUserTaskElements = window.bpmnInstances.elementRegistry.filter(el => el.type === "bpmn:UserTask");
  userTaskList.value = []
  userTaskList.value = allUserTaskElements.map(task => ({
    id: task.id,
    name: task.businessObject.name || ''
  }));
  console.log("所有UserTask元素:", allUserTaskElements, userTaskList.value);

  // 2. 记录调试信息
  Log.printBack(`select element changed: id: ${activatedElement.id} , type: ${activatedElement.businessObject.$type}`)
  Log.prettyInfo("businessObject", activatedElement.businessObject)

  // 3. 更新全局和局部状态
  // 更新全局实例中的当前选中元素
  window.bpmnInstances.bpmnElement = activatedElement
  // 更新局部变量
  bpmnElement = activatedElement

  // 4. 提取并更新元素基本信息
  elementId.value = activatedElement.id
  // 从完整类型（如"bpmn:UserTask"）中提取具体类型名称（如"UserTask"）
  elementType.value = activatedElement.type.split(":")[1] || ""

  // 5. 清空并深拷贝元素的业务对象
  // 清空现有属性对象
  Object.keys(elementBusinessObject).forEach(key => delete elementBusinessObject[key])
  // 使用JSON序列化与反序列化进行深拷贝，避免引用问题
  Object.assign(elementBusinessObject, JSON.parse(JSON.stringify(activatedElement.businessObject)))

  // 6. 控制条件表单显示状态
  // 仅当元素是SequenceFlow类型，且其源节点不是StartEvent时显示条件表单
  conditionFormVisible.value = !!(elementType.value === "SequenceFlow" &&
    activatedElement.source &&
    activatedElement.source.type.indexOf("StartEvent") === -1)

  // 7. 控制用户任务表单显示状态
  // 仅当元素是UserTask或StartEvent类型时显示表单
  formVisible.value = elementType.value === "UserTask" || elementType.value === "StartEvent"
}

// 组件挂载时初始化
onMounted(() => {
  initModels()
})

// 组件卸载前清理
onBeforeUnmount(() => {
  window.bpmnInstances = null
  if (timer) {
    clearTimeout(timer)
  }
})

// 暴露组件名称（如果需要）
defineExpose({
  name: "MyPropertiesPanel",
  componentName: "MyPropertiesPanel"
})
</script>

<style scoped>
.title-wrapper {
  font-size: 16px;
  display: flex;
  align-items: center;
}
.lineBtn {
  width: 25px;
  position: absolute;
  height: 40px;
  left: 0;
  background: #409eff;
  left: -25px;
  color: white;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  border-bottom-left-radius: 5px;
  border-top-left-radius: 5px;
  cursor: pointer;
  top: calc(50% - 20px);
  box-sizing: border-box;
  justify-content: center;
}
</style>