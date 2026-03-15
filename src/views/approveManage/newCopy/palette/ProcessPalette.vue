<template>
  <div class="my-process-palette">
    <el-collapse>
      <el-collapse-item title="任务" name="1">
        <!--  可以简化。。。 -->
        <div class="custom-button" @click="createElement($event, 'Task')" @mousedown="createElement($event, 'Task')">
          任务
        </div>
        <div class="custom-button" @click="createElement($event, 'UserTask')" @mousedown="createElement($event, 'UserTask')">
          用户任务
        </div>
        <div class="custom-button" @click="createElement($event, 'SendTask')" @mousedown="createElement($event, 'SendTask')">
          发送任务
        </div>
        <div class="custom-button" @click="createElement($event, 'ReceiveTask')" @mousedown="createElement($event, 'ReceiveTask')">
          接收任务
        </div>
        <div class="custom-button" @click="createElement($event, 'ScriptTask')" @mousedown="createElement($event, 'ScriptTask')">
          脚本任务
        </div>
        <div class="custom-button" @click="createElement($event, 'ServiceTask')" @mousedown="createElement($event, 'ServiceTask')">
          服务任务
        </div>
      </el-collapse-item>
      <el-collapse-item title="网关" name="2">
        <div class="custom-button" @click="createElement($event, 'Gateway')" @mousedown="createElement($event, 'Gateway')">
          网关
        </div>
      </el-collapse-item>
      <el-collapse-item title="开始" name="3">
        <div class="custom-button" @click="createElement($event, 'StartEvent')" @mousedown="createElement($event, 'StartEvent')">
          开始
        </div>
      </el-collapse-item>
      <el-collapse-item title="结束" name="4">
        <div class="custom-button" @click="createElement($event, 'EndEvent')" @mousedown="createElement($event, 'EndEvent')">
          结束
        </div>
      </el-collapse-item>
      <el-collapse-item title="工具" name="5">
        <div class="custom-button" @click="startTool($event, 'handTool')" @mousedown="startTool($event, 'handTool')">
          手型工具
        </div>
        <div class="custom-button" @click="startTool($event, 'lassoTool')" @mousedown="startTool($event, 'lassoTool')">
          框选工具
        </div>
        <div class="custom-button" @click="startTool($event, 'connectTool')" @mousedown="startTool($event, 'connectTool')">
          连线工具
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { assign } from 'min-dash';

/**
 * 创建BPMN元素
 * @param {Event} event - 事件对象
 * @param {string} type - 元素类型
 * @param {Object} options - 可选配置项
 */
const createElement = (event, type, options = {}) => {
  const ElementFactory = window.bpmnInstances.elementFactory;
  const create = window.bpmnInstances.modeler.get('create');
  const shape = ElementFactory.createShape(assign({ type: `bpmn:${type}` }, options));

  if (options && options.isExpanded !== undefined) {
    shape.businessObject.di.isExpanded = options.isExpanded;
  }

  create.start(event, shape);
};

/**
 * 启动工具
 * @param {Event} event - 事件对象
 * @param {string} type - 工具类型
 */
const startTool = (event, type) => {
  const modeler = window.bpmnInstances.modeler;

  if (!modeler) {
    console.error('BPMN modeler 未初始化');
    return;
  }

  switch (type) {
    case 'handTool':
      modeler.get('handTool').activateHand(event);
      break;
    case 'lassoTool':
      modeler.get('lassoTool').activateSelection(event);
      break;
    case 'connectTool':
      modeler.get('globalConnect').toggle(event);
      break;
    default:
      console.warn('未知的工具类型:', type);
  }
};

// 组件挂载时执行
onMounted(() => {
  // 可以在这里添加初始化逻辑
  console.log('ProcessPalette 组件已挂载');
});
</script>

<style scoped lang="scss">
.my-process-palette {
  box-sizing: border-box;
  padding: 80px 8px 8px 8px;
  .custom-button {
    box-sizing: border-box;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid rgba(24, 144, 255, 0.8);
    cursor: pointer;
    margin-bottom: 8px;
    &:first-child {
      margin-top: 8px;
    }
  }
}
</style>
