<template>
  <div class="panel-tab__content">
    <div class="panel-tab__class">
      <div class="panel-tab__titles">环节分类：</div>
      <el-select
        v-model="nodeProcess.nodeCategory"
        placeholder="请选择"
        clearable
      >
        <el-option
          v-for="item in dictList.dict['node_category']"
          :key="item.dictValue"
          :label="item.dictLabel"
          :value="item.dictValue"
        >
        </el-option>
      </el-select>
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">展示排序：</div>
      <el-input
        v-model="nodeProcess.displayOrder"
        placeholder="请选择"
        clearable
        @change="handleChange"
      >
      </el-input>
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">关联角色：</div>
      <el-select
        v-model="nodeProcess.associatedRole"
        placeholder="请选择"
        @change="handleSelectChange"
        clearable
      >
        <el-option
          v-for="item in dictList.dict['flow_role']"
          :key="item.dictValue"
          :label="item.dictLabel"
          :value="item.dictValue"
        >
        </el-option>
      </el-select>
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">处理反馈：</div>
      <el-switch
        v-model="nodeProcess.feedbackEnabled"
        active-color="#165DFF"
        inactive-color="#c9cdd4"
        :active-value="1"
        :inactive-value="0"
      />
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">当触发一下操作时，处理反馈必填：</div>
      <el-checkbox-group v-model="nodeProcess.feedbackRequiredOperationList">
        <el-checkbox label="通过" value="1" />
        <el-checkbox label="驳回" value="2" />
      </el-checkbox-group>
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">节点人员调配：</div>
      <el-switch
        v-model="nodeProcess.personnelAdjustmentEnabled"
        active-color="#165DFF"
        inactive-color="#c9cdd4"
        :active-value="1"
        :inactive-value="0"
      />
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">节点数据编辑：</div>
      <el-switch
        v-model="nodeProcess.dataEditEnabled"
        active-color="#165DFF"
        inactive-color="#c9cdd4"
        :active-value="1"
        :inactive-value="0"
      />
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">流程回撤：</div>
      <el-switch
        v-model="nodeProcess.rollbackEnabled"
        active-color="#165DFF"
        inactive-color="#c9cdd4"
        :active-value="1"
        :inactive-value="0"
      />
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">流程驳回：</div>
      <el-switch
        v-model="nodeProcess.rejectEnabled"
        active-color="#165DFF"
        inactive-color="#c9cdd4"
        :active-value="1"
        :inactive-value="0"
      />
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">回退范围：</div>
      <div class="rejectScope-box">
        <el-select
          placeholder="请选择"
          v-model="nodeProcess.rejectScope"
          disabled
        >
          <el-option
            v-for="item in rejectScopeList"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          ></el-option>
        </el-select>
      </div>
    </div>
    <div class="panel-tab__class">
      <div class="panel-tab__titles">被回退的数据重新提交后：</div>
      <div class="resubmitStrategy-box">
        <el-select
          placeholder="请选择"
          v-model="nodeProcess.resubmitStrategy"
          disabled
        >
          <el-option
            v-for="item in resubmitStrategyList"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          ></el-option>
        </el-select>
        <div>
          <el-icon class="resubmitStrategy-icon-class" @click="handleClick"
            ><Edit
          /></el-icon>
        </div>
      </div>
    </div>
  </div>
  <!-- 流程回退 -->
  <SzycDialog
    :dialogVisible="backShow"
    :close-on-click-modal="false"
    destroy-on-close
    title="流程回退"
    width="25%"
    class="ElementNodeProcess-dialog"
    @close="closeBack()"
  >
    <template #uname>
      <el-form
        :label-position="labelPosition"
        :model="backForm"
        ref="backFormRef"
        :rules="backFormRules"
      >
        <el-form-item label="回退范围" prop="rejectScope">
          <el-select
            placeholder="请选择"
            v-model="backForm.rejectScope"
            @change="rejectScopeChange"
          >
            <el-option
              v-for="item in rejectScopeList"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <div
          v-if="rejectScopeSelected?.length"
          class="ElementNodeProcess-selected-class"
        >
          <div
            v-for="item in rejectScopeSelected"
            :key="item.id"
            class="ElementNodeProcess-selected-item-class"
            @mouseenter="nodeHover(item)"
            @mouseleave="nodeLeave"
          >
            {{ item.name }}
            <el-icon
              v-if="hoverId == item.id"
              @click="removeRejectScope(item)"
              style="color: rgb(192, 0, 0)"
              ><Delete
            /></el-icon>
          </div>
        </div>
        <el-dropdown
          class="ElementNodeProcess-dropdown-class"
          popper-class="ElementNodeProcess-dropdown-class"
          trigger="click"
          v-if="backForm.rejectScope == '3'"
        >
          <div class="ElementNodeProcess-add-class" @click="handleAdd">
            <el-icon class="ElementNodeProcess-icon"><Plus /></el-icon> 添加节点
          </div>
          {{ userTaskList }}
          <template #dropdown>
            <el-dropdown-menu style="width: 34.2em">
              <el-dropdown-item
                v-for="item in userTaskList"
                :key="item.id"
                @click="addRejectScope(item)"
                >{{ item.name }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-form-item label="被回退的数据重新提交后" prop="resubmitStrategy">
          <el-select placeholder="请选择" v-model="backForm.resubmitStrategy">
            <el-option
              v-for="item in resubmitStrategyList"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="display: flex; justify-content: center; margin-top: 10px">
        <CanCelBtn @click="closeBack"> 取消 </CanCelBtn>
        <buttonDiv @click="submitBackForm"> 保存 </buttonDiv>
      </div>
    </template>
  </SzycDialog>
</template>

<script setup>
import { ref, reactive, inject, watch, nextTick, onBeforeUnmount } from "vue";
import { arrList } from "./index.js";
import { dictStore } from "@/store/dict";
import { panelStore } from "@/store/panel";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { ElMessage, ElMessageBox } from "element-plus";
const panelList = panelStore();
const dictList = dictStore(); //  字典接口

let bpmnElement;
// 定义props
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  type: String,
  userTaskList: {
    type: Array,
    default: () => [],
  },
});

const nodeProcessTs = reactive({
  nodeCategory: "",
  displayOrder: undefined,
  associatedRole: "", //  关联角色
  feedbackEnabled: 1, //  处理反馈
  feedbackRequiredOperationList: ["2"], //  必填反馈操作
  personnelAdjustmentEnabled: 0, //  节点人员调配
  dataEditEnabled: 0, //  节点数据编辑
  rollbackEnabled: 0, //  流程回撤
  rejectEnabled: 0, //  流程驳回
  rejectScope: "", //  回退范围
  resubmitStrategy: "", //  被回退的数据重新提交后
  rejectNode: "", //  指定回退节点
});

const nodeProcess = reactive({
  nodeCategory: "",
  displayOrder: undefined,
  associatedRole: "", //  关联角色
  feedbackEnabled: 1, //  处理反馈
  feedbackRequiredOperationList: ["2"], //  必填反馈操作
  personnelAdjustmentEnabled: 0, //  节点人员调配
  dataEditEnabled: 0, //  节点数据编辑
  rollbackEnabled: 0, //  流程回撤
  rejectEnabled: 0, //  流程驳回
  rejectScope: "", //  回退范围
  resubmitStrategy: "", //  被回退的数据重新提交后
  rejectNode: "", //  指定回退节点
});

const options = ref([{ value: "指标填报", label: "指标填报" }]);

const handleChange = (value) => {
  const positiveIntegerRegex = /^[1-9]\d*$/;
  if (!positiveIntegerRegex.test(value)) {
    nodeProcess.displayOrder = parseInt(value) || null;
  }
};

/**
 * 监听元素ID变化，加载对应节点属性
 * @param {string} newId - 新的元素ID
 */
watch(
  () => props.id,
  (newId, oldId) => {
    // console.log("nodeProcess", nodeProcess, newId, oldId);
    if (newId && newId.length) {
      // console.log("newId", newId);
      // console.log("bpmnElement", bpmnElement);
      console.log("props", props);
      if (panelList.panelData?.userNodeConfigList?.length) {
        let attrObj = panelList.panelData.userNodeConfigList.find(
          (item) => item.nodeId == newId
        );
        if (attrObj) {
          Object.keys(nodeProcess).forEach((key) => {
            if (attrObj.hasOwnProperty(key)) {
              nodeProcess[key] = attrObj[key];
            }
          });
        } else {
          Object.assign(nodeProcess, nodeProcessTs);
          if (props.type == "UserTask" && props.userTaskList.length) {
            const nodeConfig = {
              nodeId: props.id,
              nodeName: props.userTaskList.find((item) => item.id == props.id)
                .name,
              ...nodeProcess,
            };
            panelList.panelData.userNodeConfigList?.push(nodeConfig);
          }
        }
      } else {
        Object.assign(nodeProcess, nodeProcessTs);
        if (props.type == "UserTask" && props.userTaskList.length) {
          const nodeConfig = {
            nodeId: props.id,
            nodeName: props.userTaskList.find((item) => item.id == props.id)
              .name,
            ...nodeProcess,
          };
          panelList.panelData.userNodeConfigList?.push(nodeConfig);
        }
      }
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => nodeProcess,
  (newnodeProcess) => {
    if (props.type == "UserTask" && props.userTaskList.length) {
      if (panelList.panelData?.userNodeConfigList?.length == 0) {
        const nodeConfig = {
          nodeId: props.id,
          nodeName: props.userTaskList.find((item) => item.id == props.id).name,
          ...nodeProcess,
        };
        panelList.panelData.userNodeConfigList?.push(nodeConfig);
      } else {
        const nodeConfig = {
          nodeId: props.id,
          nodeName: props.userTaskList.find((item) => item.id == props.id).name,
          ...nodeProcess,
        };
        const index = panelList.panelData.userNodeConfigList.findIndex(
          (item) => item.nodeId === props.id
        );
        if (index > -1) {
          panelList.panelData.userNodeConfigList.splice(index, 1, nodeConfig);
        } else {
          panelList.panelData.userNodeConfigList.push(nodeConfig);
        }
      }
      console.log(
        "panelList.panelData?.userNodeConfigList",
        panelList.panelData?.userNodeConfigList
      );
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.userTaskList,
  (newnodeProcess) => {
    if (props.type == "UserTask" && props.userTaskList.length) {
      if (panelList.panelData?.userNodeConfigList?.length != 0) {
        const index = panelList.panelData.userNodeConfigList.findIndex(
          (item) => item.nodeId === props.id
        );

        if (index > -1) {
          const nodeName =
            props.userTaskList.find((item) => item.id == props.id)?.name || "";
          const updatedConfig = {
            ...panelList.panelData.userNodeConfigList[index],
            nodeName: nodeName,
          };
          panelList.panelData.userNodeConfigList.splice(
            index,
            1,
            updatedConfig
          );
        }
      }
    }
  },
  { immediate: true, deep: true }
);

const submitProcess = async () => {
  if (panelList.panelData?.userNodeConfigList?.length) {
    if (!panelList.panelData?.userNodeConfigList) {
      panelList.panelData.userNodeConfigList = [];
    }
    const nodeConfig = {
      nodeId: props.id,
      nodeName: props.userTaskList.find((item) => item.id == props.id).name,
      ...nodeProcess,
    };
    const index = panelList.panelData.userNodeConfigList.findIndex(
      (item) => item.nodeId === props.id
    );
    if (index > -1) {
      panelList.panelData.userNodeConfigList.splice(index, 1, nodeConfig);
    } else {
      panelList.panelData.userNodeConfigList.push(nodeConfig);
    }
  } else {
    const nodeConfig = {
      nodeId: props.id,
      nodeName: props.userTaskList.find((item) => item.id == props.id).name,
      ...nodeProcess,
    };
    panelList.panelData.userNodeConfigList?.push(nodeConfig);
  }
};

const backShow = ref(false);
const backForm = reactive({
  rejectScope: "",
  resubmitStrategy: "",
});
const backFormRef = ref(null);
const selectFlag = ref(false);
const rejectScopeList = ref([
  {
    dictValue: "1",
    dictLabel: "全部节点回退",
  },
  {
    dictValue: "2",
    dictLabel: "上一节点回退",
  },
  {
    dictValue: "3",
    dictLabel: "指定节点回退",
  },
]);
const resubmitStrategyList = ref([
  {
    dictValue: "1",
    dictLabel: "按流程顺序审批",
  },
  {
    dictValue: "2",
    dictLabel: "直达当前节点审批",
  },
]);
const rejectScopeSelected = ref([]);
const hoverId = ref("");
const handleClick = () => {
  backShow.value = true;
  backForm.rejectScope = nodeProcess.rejectScope;
  backForm.resubmitStrategy = nodeProcess.resubmitStrategy;
  const matchedTasks = props.userTaskList.filter(
    (item) => item.id == nodeProcess.rejectNode
  );
  rejectScopeSelected.value = Array.isArray(matchedTasks) ? matchedTasks : [];
  nextTick(() => {
    backFormRef.value.resetFields();
  });
};

const handleAdd = () => {
  selectFlag.value = !selectFlag.value;
};

const addRejectScope = (item) => {
  rejectScopeSelected.value = [];
  rejectScopeSelected.value.push(item);
};

const nodeHover = (item) => {
  hoverId.value = item.id;
};

const nodeLeave = () => {
  hoverId.value = "";
};

const removeRejectScope = (item) => {
  rejectScopeSelected.value = rejectScopeSelected.value.filter(
    (el) => el.id !== item.id
  );
};

const closeBack = () => {
  backShow.value = false;
};

const rejectScopeChange = (val) => {
  if (val != "3") {
    rejectScopeSelected.value = [];
  }
};

const submitBackForm = () => {
  if (backForm.rejectScope == "3" && rejectScopeSelected.value.length == 0) {
    ElMessage.warning("请选择指定回退的节点");
  } else {
    nodeProcess.rejectNode =
      rejectScopeSelected.value.length > 0
        ? rejectScopeSelected.value[0].id
        : "";
    nodeProcess.rejectScope = backForm.rejectScope;
    nodeProcess.resubmitStrategy = backForm.resubmitStrategy;
    backShow.value = false;
  }
};

// 暴露方法给父组件
defineExpose({
  submitProcess,
});

/**
 * 更新节点属性到BPMN XML中
 * @description 将选中的节点属性保存到当前BPMN元素中
 * 使用扩展属性方式存储自定义字段
 */
function handleSelectChange() {}

// 组件销毁前清理
onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>

<style>
</style>