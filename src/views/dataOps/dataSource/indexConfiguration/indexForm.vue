<!-- 指标管理-表单组件 -->
<template>
  <div class="indexLoactionComponent">
    <div style="display: flex; align-items: center; height: 48px">
      <div
        style="
          display: flex;
          align-items: center;
          color: #000;
          font-weight: 500;
          font-size: 16px;
        "
      >
        <div v-if="!isDialog" class="blue-vertical-line"></div>
        指标基础信息
      </div>
      <div v-if="!isDialog" class="radioList">
        <el-radio-group
          :disabled="false"
          v-model="patternRadio"
          fill="#0073ED"
          size="default "
          @change="callParentPatternClick"
        >
          <el-radio-button label="1">列表模式</el-radio-button>
          <el-radio-button label="2">详情模式</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <el-form
      :label-position="labelPosition"
      label-width="auto"
      :inline="true"
      :model="addOrEditForm"
      ref="addOrEditFormRef"
      :rules="addOrEditFormRules"
      :disabled="disabledForm || addOrEditTitle == '指标详情'"
    >
      <div>
        <div class="black-divider"></div>
        <div class="el-form-item-class" style="margin-right: 30px">
          <el-form-item
            label="指标名称："
            prop="zbName"
            style="width: calc(50% - 15px)"
          >
            <el-input
              v-model="addOrEditForm.zbName"
              placeholder="请输入"
              clearable
            >
            </el-input>
            <!-- <el-select
              v-model="addOrEditForm.zbNameList"
              placeholder="请选择"
              clearable
              filterable
              allow-create
              default-first-option
              @change="zbNameChange"
            >
              <el-option
                v-for="item in zbDefineList"
                :key="item.uuid"
                :label="item.zbmc"
                :value="item.uuid"
              />
            </el-select> -->
          </el-form-item>
          <el-form-item
            label="指标编码："
            prop="zbCode"
            style="width: calc(50% - 14px)"
          >
            <el-input
              placeholder="请点击生成编码按钮"
              v-model="addOrEditForm.zbCode"
              style="width: 82%"
              disabled
            >
              <template #suffix> </template>
            </el-input>
            <el-button class="el-input-botton" @click="generatingCodes()">
              <img src="/src/assets/ItemImg/shengchengbianma.svg" /> 生成编码
            </el-button>
          </el-form-item>
          <!-- <el-form-item label="指标版本号：" prop="version">
            <el-select
              v-model="addOrEditForm.version"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in zbVerNumList"
                :key="index"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="脚本执行类型：" prop="scriptType">
            <el-select
              v-model="addOrEditForm.scriptType"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in scriptTypeList"
                :key="index"
                :label="item.label"
                :value="item.key"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="采集方式：" prop="colType">
            <el-select
              v-model="addOrEditForm.colType"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in colTypeFn()"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="国家监测否：" prop="isNation">
            <el-select
              v-model="addOrEditForm.isNation"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in isNationFn()"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指标类型：" prop="zbTypeUuid">
            <el-select
              v-model="addOrEditForm.zbTypeUuid"
              placeholder="请选择"
              clearable
              @change="handleZbTypeChange"
            >
              <el-option
                v-for="(item, index) in zbTypeList"
                :key="index"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指标属性：" prop="zbAttrUuid">
            <el-select
              v-model="addOrEditForm.zbAttrUuid"
              placeholder="请选择"
              clearable
              @change="handleZbAttrChange"
            >
              <el-option
                v-for="(item, index) in zbAttrList"
                :key="index"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指标导向：" prop="zbDirUuid">
            <el-select
              v-model="addOrEditForm.zbDirUuid"
              placeholder="请选择"
              clearable
              @change="handleZbDirChange"
            >
              <el-option
                v-for="(item, index) in zbDirList"
                :key="index"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="统计周期：" prop="statPer">
            <el-select
              v-model="addOrEditForm.statPer"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in statPerFn()"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="责任科室：" prop="respDpt">
            <el-tree-select
              v-model="addOrEditForm.respDpt"
              :data="respDptList"
              placeholder="请选择"
              clearable
              filterable
              checkStrictly
            />
          </el-form-item>
          <!-- <el-form-item label="分析周期：" prop="analPer">
            <el-select
              v-model="addOrEditForm.analPer"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in analPerList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="延伸指标否：" prop="isZbExt">
            <el-select
              v-model="addOrEditForm.isZbExt"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in yesOrNoFn()"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据格式：" prop="dataFmtUuid">
            <el-select
              v-model="addOrEditForm.dataFmtUuid"
              placeholder="请选择"
              clearable
              @change="handleDataFmtChange"
            >
              <el-option
                v-for="(item, index) in dataFmtList"
                :key="index"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="计量单位：" prop="unit">
            <el-select
              v-model="addOrEditForm.unit"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in unitList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="指标版本号：" prop="version">
            <el-select
              v-model="addOrEditForm.version"
              placeholder="请选择"
              clearable
              disabled
            >
              <el-option
                v-for="(item, index) in zbVerNumList"
                :key="index"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="小数保留位数：" prop="decSc">
            <el-input-number
              v-model="addOrEditForm.decSc"
              :min="0"
              :max="10"
              @change="handleChange"
            />
          </el-form-item> -->
          <!-- <el-form-item label="来源应用：" prop="zbSource">
            <el-select
              v-model="addOrEditForm.zbSource"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in zbSourceList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="数据来源：" prop="dataSrc">
            <el-select
              v-model="addOrEditForm.dataSrc"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="(item, index) in sourceAppFn()"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="可用否：" prop="state">
            <el-switch
              v-model="addOrEditForm.state"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
          <el-form-item label="适用否：" prop="isAppl">
            <el-switch
              v-model="addOrEditForm.isAppl"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
        </div>
      </div>
      <div
        :style="{ height: disabledForm ? '480px' : '415px' }"
        style="overflow-y: auto"
      >
        <div
          style="
            display: flex;
            align-items: center;
            margin: 16px 0 10px;
            color: #000;
            font-weight: 500;
          "
        >
          <div v-if="!isDialog" class="blue-vertical-line"></div>
          指标配置信息
        </div>
        <div class="black-divider"></div>
        <div class="el-form-item-class" style="padding: 5px 30px">
          <el-form-item
            label="已绑分析模型："
            prop="bndAnlzMod"
            style="width: 100%"
          >
            <el-select
              v-model="addOrEditForm.bndAnlzMod"
              clearable
              style="width: 89%"
              placeholder=""
              @change="zbSrcChange"
              disabled
            >
              <el-option
                v-for="(item, index) in bndAnlzModList"
                :key="index"
                :label="item.modelName"
                :value="item.uuid"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="适用医院类别："
            prop="applHospName"
            style="width: 100%"
          >
            <el-input
              v-model="addOrEditForm.applHospName"
              style="width: 89%"
              disabled
            >
              <template #suffix> </template>
            </el-input>
            <el-button class="el-input-botton" @click="openApplHosp()">
              <img src="/src/assets/ItemImg/peizhi.svg" /> 配置
            </el-button>
          </el-form-item>
          <el-form-item
            label="指标运算配置："
            prop="indRuleName"
            style="width: 100%"
          >
            <el-input
              v-model="addOrEditForm.indRuleName"
              style="width: 89%"
              disabled
            >
              <template #suffix> </template>
            </el-input>
            <el-button class="el-input-botton" @click="openIndRuleExpr()">
              <img src="/src/assets/ItemImg/yunsuanpeizhi.svg" /> 运算配置
            </el-button>
          </el-form-item>
          <el-form-item
            label="绑定父级指标："
            prop="zbFatherName"
            style="width: 100%"
          >
            <el-input
              v-model="addOrEditForm.zbFatherName"
              style="width: 89%"
              disabled
            >
              <template #suffix> </template>
            </el-input>
            <el-button class="el-input-botton" @click="bindParentIndex()">
              <img src="/src/assets/ItemImg/fujizhibiao.svg" />
              绑定父级指标
            </el-button>
          </el-form-item>
          <el-form-item
            label="指标跳转路径："
            prop="selectedJmpPath"
            style="width: 100%"
          >
            <el-input
              v-model="addOrEditForm.selectedJmpPath"
              style="width: 89%"
              disabled
            >
              <template #suffix> </template>
            </el-input>
            <el-button class="el-input-botton" @click="openJumpPath()">
              <img src="/src/assets/ItemImg/tiaozhuanlujing.svg" /> 配置跳转路径
            </el-button>
          </el-form-item>
          <el-form-item
            label="赋分规则配置："
            prop="scoRuleCfg"
            style="width: 100%"
          >
            <el-input
              v-model="addOrEditForm.scoRuleCfg"
              style="width: 89%"
              disabled
            >
              <template #suffix> </template>
            </el-input>
            <!-- @click="configurationRules()" -->
            <el-button class="el-input-botton">
              <img src="/src/assets/ItemImg/peizhiguize.svg" /> 配置规则
            </el-button>
          </el-form-item>
        </div>
        <div>
          <div
            style="
              display: flex;
              align-items: center;
              margin: 16px 0 10px;
              color: #000;
              font-weight: 500;
            "
          >
            <div v-if="!isDialog" class="blue-vertical-line"></div>
            指标口径信息
          </div>
          <div class="black-divider"></div>
          <div
            class="el-form-item-class"
            style="margin-right: 30px; margin-left: 30px"
          >
            <el-form-item
              label="指标定义："
              prop="zbDefine"
              class="textarea-class"
            >
              <el-input
                placeholder="请输入"
                v-model="addOrEditForm.zbDefine"
                style="width: 100%"
                type="textarea"
                rows="3"
              >
              </el-input>
            </el-form-item>
            <el-form-item
              label="计算方法："
              prop="calcMethod"
              class="textarea-class"
            >
              <el-input
                v-model="addOrEditForm.calcMethod"
                style="width: 100%"
                type="textarea"
                rows="3"
              >
              </el-input>
            </el-form-item>
            <el-form-item
              label="指标说明："
              prop="zbDesc"
              class="textarea-class"
            >
              <el-input
                placeholder="请输入"
                v-model="addOrEditForm.zbDesc"
                style="width: 100%"
                type="textarea"
                rows="3"
              >
              </el-input>
            </el-form-item>
            <el-form-item
              label="指标意义："
              prop="zbMeaning"
              class="textarea-class"
            >
              <el-input
                placeholder="请输入"
                v-model="addOrEditForm.zbMeaning"
                style="width: 100%"
                type="textarea"
                rows="3"
              >
              </el-input>
            </el-form-item>
            <el-form-item label="指标依据：" prop="zbyj" class="textarea-class">
              <el-input
                placeholder="请输入"
                v-model="addOrEditForm.zbyj"
                style="width: 100%"
                type="textarea"
                rows="3"
              >
              </el-input>
            </el-form-item>
            <!-- <el-form-item
              label="指标解释："
              prop="zbExplain"
              class="textarea-class"
            >
              <el-input
                placeholder="请输入"
                v-model="addOrEditForm.zbExplain"
                style="width: 100%"
                type="textarea"
                rows="3"
              >
              </el-input>
            </el-form-item> -->
            <el-form-item
              label="赋分原则："
              prop="scPrinciple"
              class="textarea-class"
            >
              <el-input
                placeholder="请输入"
                v-model="addOrEditForm.scPrinciple"
                style="width: 100%"
                type="textarea"
                rows="3"
              >
              </el-input>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
  </div>
  <teleport to="body">
    <!-- 适用医院类别配置-->
    <SzycDialog
      :dialogVisible="applHospShow"
      :close-on-click-modal="false"
      top="3%"
      destroy-on-close
      title="适用医院类别配置"
      width="70%"
      @close="closeApplHosp()"
    >
      <template #uname>
        <!--  border: 1px solid rgba(173, 183, 199, 1);
            border-radius: 4px; -->
        <div class="applyHospitalCss">
          <div class="applyHospitalCssLeft">
            <div class="topHeader">医院类别</div>
            <div style="display: flex; align-items: center; height: 70px">
              <div>医院类别：</div>
              <el-input
                placeholder="请输入"
                style="width: 180px"
                v-model="hospitalType"
                clearable
              />
              <div style="margin-left: 20px">医院大类代码：</div>
              <el-select
                placeholder="请选择"
                clearable
                style="width: 180px"
                v-model="applHospKind"
              >
                <el-option
                  v-for="(item, index) in applHospKindList"
                  :key="index"
                  :label="item.typeName"
                  :value="item.typeCode"
                ></el-option>
              </el-select>
              <buttonDiv
                @click="searchApplHosp"
                style="display: flex; align-items: center; margin-left: 20px"
              >
                <img
                  src="/src/assets/ItemImg/chaxun.svg"
                  style="margin-right: 4px"
                />
                查询
              </buttonDiv>
            </div>
            <div class="contentApply">
              <div style="padding: 0 15px">
                <el-checkbox
                  :indeterminate="isIndApplHosp"
                  :key="checkAllApp"
                  :checked="checkAllApp"
                  @change="handleAllApplHosp"
                  v-if="applHospList?.length"
                  >全选</el-checkbox
                >
              </div>
              <el-checkbox-group
                v-model="checkboxGroupList"
                size="large"
                class="indexAllocation-checkbox-group"
              >
                <el-checkbox
                  v-for="(item, index) in applHospList"
                  :key="index"
                  :value="item"
                  :checked="item.exist == 1"
                  style="
                    display: flex;
                    width: 100%;
                    margin-right: 0px;
                    background: rgba(0, 115, 237, 0.05);
                    padding: 0px 15px;
                    box-sizing: border-box;
                    margin-bottom: 10px;
                  "
                >
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      width: 100%;
                    "
                  >
                    <div>{{ item.hospitalCategoryName }}</div>
                    <div>
                      医院大类代码：{{ item.typeCode }} 医院类别代码：{{
                        item.hospitalCategoryCode
                      }}
                    </div>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
          <div class="applyHospitalCssRight">
            <div class="topHeader">医院类别</div>
            <div>
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  height: 70px;
                "
              >
                <div>
                  已选：<span style="color: rgba(83, 128, 253, 1)">
                    {{ checkboxGroupList.length }}
                  </span>
                  条数据
                </div>
                <el-button
                  class="el-input-bottons"
                  @click="clearApplHosp"
                  style="
                    display: flex;
                    align-items: center;
                    color: rgba(245, 101, 101, 1);
                    cursor: pointer;
                  "
                >
                  <img
                    src="/src/assets/ItemImg/qingchu.svg"
                    style="margin-right: 4px"
                  />
                  清除
                </el-button>
              </div>
            </div>
            <div class="contentApply">
              <div
                v-for="(item, index) in checkboxGroupList"
                :key="index"
                class="checkboxData"
              >
                <div>
                  {{ item.hospitalCategoryName }}
                  <span style="margin-left: 20px">{{
                    item.hospitalCategoryCode
                  }}</span>
                </div>
                <div style="display: flex; align-items: center">
                  <img
                    src="/src/assets/ItemImg/shanchured.svg"
                    style="margin-right: 4px; cursor: pointer"
                    @click="delApplHosp(item)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style="display: flex; justify-content: center"
          class="lineColorCss_Dialog"
        >
          <CanCelBtn @click="closeApplHosp"> 取消 </CanCelBtn>
          <buttonDiv @click="applHospSubmit"> 确定 </buttonDiv>
        </div>
      </template>
    </SzycDialog>
    <!-- 指标运算配置-->
    <SzycDialog
      :dialogVisible="indRuleExprShow"
      :close-on-click-modal="false"
      destroy-on-close
      title="指标运算配置"
      width="76%"
      top="2%"
      class="indexAllocation-indRuleExpr-dialog"
      @close="closeIndRuleExpr()"
    >
      <template #uname>
        <div
          style="
            width: 100%;
            display: flex;
            justify-content: space-between;
            border-radius: 4px;
          "
        >
          <div style="width: 28%; background: #fff">
            <div
              style="
                height: 380px;
                width: 100%;
                border-bottom: 1px solid rgba(83, 128, 253, 1);
              "
            >
              <div
                style="
                  height: 48px;
                  width: clac(100% - 30px);
                  margin: 0 15px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                "
              >
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-weight: 600;
                    color: #333;
                  "
                >
                  指标数据项
                </div>
                <buttonDiv
                  type="baseSpecial"
                  style="margin-bottom: 10px"
                  @click="openDataItem"
                >
                  <img
                    src="@/assets/ItemImg/ZKXZ.svg"
                    alt=""
                    class="buttonDivImg"
                  />新增指标
                </buttonDiv>
                <!-- <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                  "
                  @click="openDataItem"
                >
                  <img
                    src="/src/assets/ItemImg/xinzenss.svg"
                    style="margin-right: 4px"
                  />新增指标
                </div> -->
              </div>
              <div style="height: calc(100% - 48px); overflow-y: auto">
                <div
                  v-for="(item, index) in dataItemSelectList"
                  :key="index"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                  "
                  :class="
                    item.uuid == dataItemId
                      ? 'dataItemSelected dataItemDefault'
                      : 'dataItemDefault'
                  "
                >
                  <div
                    @dblclick="selectIndicator(item)"
                    draggable="true"
                    @dragstart="onDragStart($event, item, 'indicator')"
                    @dragend="onDragEnd"
                  >
                    <img
                      src="/src/assets/ItemImg/yunsuanfu.svg"
                      style="margin-right: 4px"
                    />
                    {{ item.dataItemName }}
                  </div>
                  <div>
                    <img
                      src="/src/assets/ItemImg/shanchured.svg"
                      style="cursor: pointer"
                      @click="deleteDataItem(item)"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div style="width: 100%; height: 310px">
              <div
                style="
                  height: 48px;
                  width: calc(100% - 30px);
                  margin: 0 15px;
                  display: flex;
                  align-items: center;
                "
              >
                <div
                  style="
                    display: flex;
                    align-items: center;
                    width: 100%;
                    font-weight: 600;
                    color: #333;
                  "
                >
                  指标运算符
                </div>
              </div>
              <div
                style="
                  overflow-y: auto;
                  width: 100%;
                  display: flex;
                  flex-wrap: wrap;
                "
              >
                <div
                  v-for="(item, index) in operatorList"
                  :key="index"
                  style="
                    display: flex;
                    align-items: center;
                    margin: 5px;
                    padding: 10px;
                    flex: 1 1 20%;
                  "
                  @dblclick="selectOperator(item)"
                  draggable="true"
                  @dragstart="
                    onDragStart(
                      $event,
                      item,
                      item.id == '8' ? 'value' : 'operator'
                    )
                  "
                  @dragend="onDragEnd"
                  :class="
                    item.id == operatorId
                      ? 'dataItemSelected dataItemDefault'
                      : 'dataItemDefault'
                  "
                >
                  <img
                    src="/src/assets/ItemImg/yunsuanfu.svg"
                    style="margin-right: 4px; width: 14px"
                  />{{ item.text }}
                </div>
              </div>
            </div>
          </div>
          <div style="width: 71%; background: #fff">
            <div style="margin: 0 15px" class="indexAllocation-addOrEdit">
              <el-form
                :label-position="labelPosition"
                label-width="auto"
                :inline="true"
                :model="basicInfForm"
                ref="basicInfFormRef"
                :rules="basicInfFormRules"
              >
                <div>
                  <div
                    style="
                      height: 48px;
                      display: flex;
                      align-items: center;
                      border-bottom: 1px solid rgba(229, 229, 229, 1);
                      margin-bottom: 10px;
                      font-weight: 600;
                      color: #333;
                    "
                  >
                    <!-- <img src="/src/assets/ItemImg/peizhi.svg" style="margin-right: 4px" /> -->
                    基础信息
                  </div>
                  <div class="el-form-item-class">
                    <el-form-item
                      label="指标名称："
                      prop="zbName"
                      style="width: calc(50% - 12.5px)"
                    >
                      <el-input
                        v-model="basicInfForm.zbName"
                        placeholder="请输入"
                        style="width: 100%"
                        disabled
                      />
                    </el-form-item>
                    <el-form-item
                      label="计量单位："
                      prop="zbCode"
                      style="width: calc(50% - 12.5px)"
                    >
                      <el-input
                        placeholder="请输入"
                        v-model="basicInfForm.unit"
                        style="width: 100%"
                        disabled
                      >
                      </el-input>
                    </el-form-item>
                    <el-form-item
                      label="计算方法："
                      prop="version"
                      style="width: 100%"
                    >
                      <el-input
                        v-model="basicInfForm.calcMethod"
                        clearable
                        style="width: 100%"
                        type="textarea"
                        rows="3"
                        disabled
                      >
                      </el-input>
                    </el-form-item>
                  </div>
                  <div
                    style="
                      height: 48px;
                      display: flex;
                      align-items: center;
                      border-bottom: 1px solid rgba(229, 229, 229, 1);
                      margin-bottom: 10px;
                      font-weight: 600;
                      color: #333;
                    "
                  >
                    <!-- <img src="/src/assets/ItemImg/peizhi.svg" style="margin-right: 4px" /> -->
                    运算配置
                  </div>
                  <div class="el-form-item-class">
                    <el-form-item
                      label="指标计算："
                      prop="applHospType"
                      style="width: 100%"
                    >
                      <div class="formula-builder">
                        <div
                          class="formula-display"
                          @dragover="onDragOver"
                          @drop="onDrop"
                          :class="{ 'drag-over': isDragOver }"
                        >
                          <div
                            class="formula-item"
                            v-for="(item, index) in formulaItems"
                            :key="index"
                            draggable="true"
                            @dragstart="onFormulaItemDragStart($event, index)"
                            @dragend="onDragEnd"
                            @dragover="handleDragOverItem($event, index)"
                            @drop="onDrop"
                            :class="{ 'drag-over-item': dropIndex === index }"
                          >
                            <div class="formula-item-content">
                              <span
                                v-if="item.type === 'operator'"
                                class="formula-operator"
                                >{{ item.value }}</span
                              >
                              <el-tooltip
                                popper-class="formula-item-tooltip"
                                v-else-if="item.type === 'indicator'"
                                effect="light"
                              >
                                <template #content>
                                  {{ item?.value }}<br />数据项说明：{{
                                    item?.dataItemExplain
                                  }}<br />数据项类型：{{
                                    dataItemTypeFn(
                                      item?.dataItemType,
                                      "formatter"
                                    )
                                  }}<br />分析周期：{{ item?.analysisCycle
                                  }}<br />统计周期：{{
                                    statPerFn(
                                      item?.statisticalPeriod,
                                      "formatter"
                                    )
                                  }}
                                </template>
                                <el-button
                                  class="formula-indicator"
                                  @click="editFormulaItem(index)"
                                >
                                  {{ item.value }}
                                </el-button>
                              </el-tooltip>

                              <span
                                v-else-if="item.type === 'value'"
                                class="formula-value"
                                ><el-input
                                  v-model="item.value"
                                  clearable
                                  style="width: 150px"
                              /></span>
                              <el-button
                                class="remove-btn"
                                @click="removeFormulaItem(index)"
                              >
                                x
                              </el-button>
                            </div>
                          </div>
                          <div
                            class="formula-placeholder"
                            v-if="formulaItems.length === 0"
                          >
                            拖拽左侧数据项和运算符到此处构建公式
                          </div>
                        </div>
                        <div class="formula-actions">
                          <el-button
                            class="el-input-bottons"
                            @click="clearFormula"
                          >
                            <img
                              src="/src/assets/ItemImg/qingchu.svg"
                              style="margin-right: 4px"
                            />
                            清除
                          </el-button>
                        </div>
                      </div>
                    </el-form-item>
                  </div>
                </div>
              </el-form>
            </div>
          </div>
        </div>
        <div
          style="display: flex; justify-content: center"
          class="lineColorCss_Dialog"
        >
          <CanCelBtn @click="closeIndRuleExpr"> 取消 </CanCelBtn>
          <buttonDiv @click="indRuleExprSubmit"> 保存 </buttonDiv>
        </div>
      </template>
    </SzycDialog>
    <!-- 添加数据项-->
    <SzycDialog
      :dialogVisible="dataItemShow"
      :close-on-click-modal="false"
      destroy-on-close
      title="添加数据项"
      width="90%"
      top="30px"
      @close="closeDataItem()"
    >
      <template #uname>
        <div style="width: 100%; border-radius: 4px; background: #fff">
          <div>
            <searchForm
              :modelValue="dataItemParams"
              :items="dataItemItems"
              :inline="true"
              labelWidth=""
              @reset="dataItemReset"
              @searchVal="dataItemSearch"
            >
            </searchForm>
          </div>
          <div style="height: 700px">
            <tableAndPage
              ref="dataItemRef"
              apiUrl="/business/dataItem/page"
              :queryParams="dataItemParams"
              :designTableColumns="dataItemTableColumns"
              :bottomBtnList="dataItemBtnList"
              :showBorder="true"
              :light="true"
              @btnBottomClick="dataItemBtnClick"
              @selectionChange="dataItemSelectChange"
              primaryKey="uuid"
              :reserveSelection="true"
              :selectShowFlag="true"
              v-bind="{ showBorder: 1, pageOpen: 1 }"
            >
            </tableAndPage>
          </div>
        </div>
      </template>
    </SzycDialog>
    <!-- 绑定父级指标-->
    <SzycDialog
      :dialogVisible="parentIndexShow"
      :close-on-click-modal="false"
      destroy-on-close
      title="绑定父级指标"
      width="76%"
      top="30px"
      @close="closeParentIndex"
    >
      <template #uname>
        <div style="width: 100%; border-radius: 4px; background: #fff">
          <div style="display: flex; align-items: center; padding: 12px 16px">
            <div style="margin-right: 10px">指标编码</div>
            <div>
              <el-input
                v-model="parentIndexParams.zbCode"
                placeholder="请输入"
                clearable
                style="width: 250px; margin-right: 10px"
              />
            </div>
            <div style="margin-right: 10px">指标名称</div>
            <div>
              <el-input
                v-model="parentIndexParams.zbName"
                placeholder="请输入"
                clearable
                style="width: 400px; margin-right: 10px"
              />
            </div>
            <div style="margin-right: 10px">版本号</div>
            <div>
              <el-select
                v-model="parentIndexParams.version"
                placeholder="请输入"
                clearable
                style="width: 250px; margin-right: 10px"
              >
                <el-option
                  v-for="item in zbVerNumList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
            <div style="display: flex">
              <buttonDiv type="primary" @click="onSearch">
                <el-icon>
                  <Search />
                </el-icon>
                查询
              </buttonDiv>
              <CanCelBtn @click="onReset">
                <el-icon>
                  <RefreshRight />
                </el-icon>
                重置
              </CanCelBtn>
            </div>
          </div>
          <div style="height: 650px; padding: 0 16px; width: calc(100% - 32px)">
            <el-table
              :data="fatherTableData"
              border
              height="590"
              header-cell-class-name="headerTable"
            >
              <el-table-column width="80" align="center" label="选择">
                <template #default="scope">
                  <el-radio
                    v-model="scope.row.fjxz"
                    label="1"
                    @input="clickChanges(scope.row, scope.$index)"
                    >{{}}</el-radio
                  >
                </template>
              </el-table-column>
              <el-table-column
                type="index"
                label="序号"
                align="center"
                width="100"
              />
              <el-table-column
                label="指标编号"
                prop="zbbh"
                align="center"
                width="240"
              >
              </el-table-column>
              <el-table-column label="指标名称" prop="zbmc"> </el-table-column>
              <el-table-column
                label="指标版本号"
                prop="bbh"
                align="center"
                width="240"
              >
              </el-table-column>
            </el-table>
            <div
              style="
                margin-top: 10px;
                width: 100%;
                display: flex;
                justify-content: flex-end;
              "
            >
              <el-pagination
                class="pSelect pageStyle"
                v-model:current-page="currentPage"
                v-model:page-size="pageSizes"
                :page-sizes="pageArr"
                :total="total"
                :prev-text="'上一页'"
                :next-text="'下一页'"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </div>
          <div
            style="display: flex; justify-content: center"
            class="lineColorCss_Dialog"
          >
            <CanCelBtn @click="closeParentIndex">取消</CanCelBtn>
            <buttonDiv @click="submitParentIndex()">确定</buttonDiv>
          </div>
        </div>
      </template>
    </SzycDialog>
    <!-- 配置跳转路径-->
    <SzycDialog
      :dialogVisible="jumpPathShow"
      :close-on-click-modal="false"
      title="配置跳转路径"
      width="90%"
      top="30px"
      @close="closeJumpPath()"
    >
      <template #uname>
        <div style="background: #fff">
          <buttonDiv
            style="margin-bottom: 10px"
            @click="addJumpPath"
            type="baseSpecial"
            class="buttonDivImg"
          >
            <img
              src="@/assets/ItemImg/xinzenghang.svg"
              style="margin-right: 5px"
              alt=""
            />新增行
          </buttonDiv>
          <el-table
            :data="jumpPathTableData"
            border
            height="600"
            header-cell-class-name="headerTable"
          >
            <el-table-column width="120" align="center" label="默认路径">
              <template #default="scope">
                <el-radio
                  v-model="scope.row.valid"
                  label="1"
                  @input="clickChange(scope.row, scope.$index)"
                  >{{}}</el-radio
                >
              </template>
            </el-table-column>
            <el-table-column
              type="index"
              label="序号"
              align="center"
              width="100"
            />
            <el-table-column label="路径地址">
              <template #default="scoped">
                <p
                  @click="valueIndex = scoped.$index"
                  v-if="valueIndex != scoped.$index"
                  style="width: 100%; height: 25px"
                >
                  {{ scoped.row?.tzlj }}
                </p>
                <el-input
                  v-model="scoped.row.tzlj"
                  v-else
                  @blur="valueIndex = -1"
                  style="height: 40px"
                />
              </template>
            </el-table-column>
            <!-- <el-table-column label="关联风格">
              <template #default="scoped">
                <p
                  @click="valueIndexs = scoped.$index"
                  v-if="valueIndexs != scoped.$index"
                  style="width: 100%; height: 25px"
                >
                  {{
                    sysTypeList?.find((f) => f.key == scoped.row.ymzstype)
                      ?.label
                  }}
                </p>
                <el-select
                  v-model="scoped.row.ymzstype"
                  placeholder="请选择"
                  v-else
                  @change="selectChange"
                  style="line-height: 40px"
                >
                  <el-option
                    v-for="item in sysTypeList"
                    :key="item.key"
                    :value="item.key"
                    :label="item.label"
                    :disabled="
                      jumpPathTableData?.find(
                        (f) => f.ymzstype === item.ymzstype
                      )
                        ? true
                        : false
                    "
                  />
                </el-select>
              </template>
            </el-table-column> -->
            <el-table-column label="风格描述">
              <template #default="scoped">
                <el-input v-model="scoped.row.fgms" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scoped">
                <span
                  style="color: red; cursor: pointer"
                  v-if="scoped.row.defaultShowType != 1"
                  @click="deletePath(scoped.row, scoped.$index)"
                >
                  删除
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div
            style="display: flex; justify-content: center"
            class="lineColorCss_Dialog"
          >
            <CanCelBtn @click="closeJumpPath()">取消</CanCelBtn>
            <buttonDiv @click="submitJumpPath()">确定</buttonDiv>
          </div>
        </div>
      </template>
    </SzycDialog>
  </teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import searchForm from "@/components/element/SearchForm.vue";
import tableAndPage from "@/components/table/tableAndPage.vue";
import {
  colTypeFn,
  statPerFn,
  yesOrNoFn,
  isNationFn,
  dataItemTypeFn,
  sourceAppFn,
} from "@/types/dict/index.js";
import {
  changeState,
  getZbType,
  saveInfo,
  updateInfo,
  deleteIndex,
  deleteRecover,
  deleteForce,
  distinguish,
  generateZbCode,
  selectSourceApp,
  listFjzb,
} from "@/api/modelIndexManage/indexAllocation.js";
import buttonDiv from "@/components/element/Confirm.vue";
import CanCelBtn from "@/components/element/Cancel.vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 定义组件接收的 Props
const props = defineProps({
  disabledForm: {
    type: Boolean,
    default: true,
  },
  zbVerNumList: {
    type: Array,
    default: () => [],
  },
  scriptTypeList: {
    type: Array,
    default: () => [],
  },
  zbTypeList: {
    type: Array,
    default: () => [],
  },
  zbAttrList: {
    type: Array,
    default: () => [],
  },
  zbDirList: {
    type: Array,
    default: () => [],
  },
  respDptList: {
    type: Array,
    default: () => [],
  },
  analPerList: {
    type: Array,
    default: () => [],
  },
  dataFmtList: {
    type: Array,
    default: () => [],
  },
  dataSrcOptions: {
    type: Array,
    default: () => [],
  },
  unitList: {
    type: Array,
    default: () => [],
  },
  zbSourceList: {
    type: Array,
    default: () => [],
  },
  formData: {
    type: Object,
    default: () => {},
  },
  addOrEditTitle: {
    type: String,
    default: "",
  },
  resetFlag: {
    type: Number,
    default: 0,
  },
  sysTypeList: {
    type: Array,
    default: () => [],
  },
  bndAnlzModList: {
    type: Array,
    default: () => [],
  },
  zbDefineList: {
    type: Array,
    default: () => [],
  },
  isDialog: {
    type: Boolean,
    default: false,
  },
});

const addOrEditFormRef = ref(null);
const applHospShow = ref(false);
const hospitalType = ref("");
const applHospKind = ref("");
const indRuleExprShow = ref(false);
const dataItemShow = ref(false);
const dataItemRef = ref(null);
const dataItemSelectList = ref([]);
const dataItemSelectListTs = ref([]);
const dataItemId = ref("");
const operatorId = ref("");

const parentIndexShow = ref(false);
const parentIndexRef = ref(null);
const parentIndexRow = ref({});

const checkAllApp = ref(false); //  全选
const isIndApplHosp = ref(false); //  中间
const checkboxGroupList = ref([]);
const applHospList = ref([]);
const applHospKindList = ref([]);

const jumpPathShow = ref(false);
const loadingForparentTable = ref(true);
const jumpPathLoading = ref(true);
const changState = ref(0);
const currentFactorChange = ref({});
const styleType = ref([]); //  风格数组
const styleTypeSelect = ref([]); //  风格下拉框数组
const jumpPathObj = ref({}); //  默认风格对象
const jumpPathTableData = ref([]); //  风格列表
const valueIndex = ref(-1);
const valueIndexs = ref(-1);

const fatherTableData = ref([]); //  父级指标列表
const currentPage = ref(1);
const pageSizes = ref(10);
const total = ref(0);
const pageArr = [10, 15, 30, 45, 60, 75, 90]; //  每页显示数量

//指标配置
const selectedIndicator = ref(null);
const selectedOperator = ref(null);
const formulaItems = ref([]);
const isDragOver = ref(false);
const draggedItem = ref(null);
const draggedType = ref("");
const draggedIndex = ref(-1); // 记录被拖拽的公式项索引
const dropIndex = ref(-1); // 记录放置位置的索引

const operatorList = ref([
  {
    id: "1",
    value: "1",
    label: "(",
    text: "左括号'('",
  },
  {
    id: "2",
    value: "2",
    label: ")",
    text: "右括号')",
  },
  {
    id: "3",
    value: "3",
    label: "/",
    text: "/",
  },
  {
    id: "4",
    value: "4",
    label: "*",
    text: "*",
  },
  {
    id: "8",
    value: "8",
    label: "数值",
    text: "数值",
  },
  {
    id: "9",
    value: "9",
    label: "%",
    text: "百分号",
  },
  {
    id: "10",
    value: "10",
    label: "‰",
    text: "千分号",
  },
  {
    id: "7",
    value: "7",
    label: "=",
    text: "=",
  },
  {
    id: "5",
    value: "5",
    label: "+",
    text: "+",
  },
  {
    id: "6",
    value: "6",
    label: "-",
    text: "-",
  },
]);

const addOrEditForm = reactive({
  zbUuid: "",
  zbName: "", // 指标名称
  zbNameList: "", // 指标英文名称
  zbCode: "", // 指标编码
  version: "", // 指标版本号
  // scriptType: "", // 脚本执行类型
  colType: "", // 采集方式
  isNation: "", // 国家监测否
  zbType: "", // 指标类型
  zbTypeUuid: "", // 指标类型
  zbAttr: "", // 指标属性
  zbAttrUuid: "", // 指标属性
  zbDir: "", // 指标导向
  zbDirUuid: "", // 指标导向
  statPer: "", // 统计周期
  respDpt: "", // 责任科室
  // analPer: "", // 分析周期
  isZbExt: "", // 延伸指标否
  dataFmt: "", // 数据格式
  dataFmtUuid: "", // 数据格式
  // unit: "", // 计量单位
  decSc: 0, // 小数保留位数
  // zbSource: "", // 来源应用
  dataSrc: "", // 数据来源
  state: 1, // 启用否
  isAppl: 1, // 适用否
  zbDefine: "", // 指标定义
  bndAnlzMod: "", // 已绑分析模型
  applHospType: [], // 适用医院类别
  applHospName: "", // 适用医院名称
  indRuleExpr: [], // 指标运算配置
  indRuleName: "", // 指标运算配置
  indRule: "", //
  zbFather: "", // 绑定父级指标
  zbFatherName: "",
  indJmpPath: [], // 指标跳转路径
  selectedJmpPath: "", // 选中的指标跳转路径
  scoRuleCfg: "", // 赋分规则配置
  calcMethod: "", // 计算方法
  zbDesc: "", // 指标说明
  zbMeaning: "", // 指标意义
  // zbExplain: "", // 计算解释
  scPrinciple: "", // 赋分原则
  zbyj: "", // 分析脚本，
  sjxInfoList: [], // 数据项信息
});
const patternRadio = ref("2");
const zbNameFlag = ref(false);

// 定义emit
const emit = defineEmits(["pattern-click-type"]);

// 调用父组件patternClick函数，传参为2
const callParentPatternClick = () => {
  emit("pattern-click-type", { id: "1" });
};

const addOrEditFormRules = reactive({
  zbName: [{ required: true, message: "指标名称不能为空", trigger: "blur" }],
  zbCode: [{ required: true, message: "指标编码不能为空", trigger: "blur" }],
  // version: [
  //   { required: true, message: "指标版本号不能为空", trigger: "change" },
  // ],
  // zbSource: [{ required: true, message: "来源应用不能为空", trigger: "change" }],
});

// const zbNameChange = (val) => {
//   const targetItem = props.zbDefineList.find((item) => item.uuid === val);
//   console.log(targetItem, val, "targetItem-val");
//   addOrEditForm.zbName = targetItem?.zbmc || val;
//   if (props.addOrEditTitle == "新增") {
//     addOrEditForm.zbCode = targetItem?.zbbh || "";
//     addOrEditForm.zbUuid = targetItem?.uuid || "";
//     addOrEditForm.zbDefine = targetItem?.zbdy || "";
//     addOrEditForm.zbAttr = targetItem?.zbsxuuid || "";
//     addOrEditForm.zbMeaning = targetItem?.zbMeaning || "";
//   } else {
//     if (targetItem) {
//       addOrEditForm.zbCode = targetItem?.zbbh;
//       addOrEditForm.zbUuid = targetItem?.uuid;
//       addOrEditForm.zbDefine = targetItem?.zbdy;
//       addOrEditForm.zbAttr = targetItem?.zbsxuuid;
//       addOrEditForm.zbMeaning = targetItem?.zbMeaning;
//     }
//   }
// };

const handleZbTypeChange = (val) => {
  if (val) {
    addOrEditForm.zbType =
      props.zbTypeList.find((item) => item.dictValue === val)?.dictLabel || "";
  } else {
    addOrEditForm.zbType = "";
  }
};

const handleZbAttrChange = (val) => {
  if (val) {
    addOrEditForm.zbAttr =
      props.zbAttrList.find((item) => item.dictValue === val)?.dictLabel || "";
  } else {
    addOrEditForm.zbAttr = "";
  }
};

const handleZbDirChange = (val) => {
  if (val) {
    addOrEditForm.zbDir =
      props.zbDirList.find((item) => item.dictValue === val)?.dictLabel || "";
  } else {
    addOrEditForm.zbDir = "";
  }
};

const handleDataFmtChange = (val) => {
  if (val) {
    addOrEditForm.dataFmt =
      props.dataFmtList.find((item) => item.dictValue === val)?.dictLabel || "";
  } else {
    addOrEditForm.dataFmt = "";
  }
};

// 切换已绑分析模型
const zbSrcChange = (val) => {
  parentIndexParams.bndAnlzMod = addOrEditForm.bndAnlzMod;
  addOrEditForm.zbFatherName = "";
  addOrEditForm.zbFather = "";
  addOrEditForm.indRuleExpr = [];
  addOrEditForm.indRuleName = "";
  addOrEditForm.indRule = "";
  addOrEditForm.sjxInfoList = [];
  addOrEditForm.indJmpPath = [];
  addOrEditForm.selectedJmpPath = "";
};

const generatingCodes = async () => {
  let res = await generateZbCode();
  if (res.code == 200) {
    addOrEditForm.zbCode = res.msg;
  } else {
    addOrEditForm.zbCode = "";
  }
};

// 适用医院
const ApplHospFn = (res, type) => {
  if (res.length) {
    applHospList.value = res;

    const uuidArray =
      addOrEditForm.applHospType?.map((item) => item.uuid) || [];
    // 处理医院列表，添加 exist 属性
    applHospList.value = applHospList.value?.map((item) => ({
      ...item,
      exist: uuidArray.includes(item.uuid) ? 1 : item.exist || 0,
    }));
    if (type == 1) {
      applHospKindList.value = [];
      const typeCodeMap = new Map();
      // 处理医院大类列表
      applHospList.value?.forEach((item) => {
        if (!typeCodeMap.has(item.typeCode)) {
          typeCodeMap.set(item.typeCode, item);
          applHospKindList.value.push(item);
        }
      });
    }
  } else {
    if (type == 1) {
      applHospKindList.value = [];
    }
    applHospList.value = [];
  }
  applHospShow.value = true;
};
const openApplHosp = async () => {
  let res = await distinguish();
  console.log(res, "res");
  ApplHospFn(res, "1");
};

const openIndRuleExpr = async () => {
  if (addOrEditForm.bndAnlzMod) {
    indRuleExprShow.value = true;
    basicInfForm.zbName = addOrEditForm.zbName;
    basicInfForm.unit =
      props.unitList?.find((item) => item.value == addOrEditForm.unit)?.label ||
      "";
    basicInfForm.calcMethod = addOrEditForm.calcMethod;
    basicInfForm.indRuleExpr = addOrEditForm.indRuleExpr;
    dataItemSelectList.value = addOrEditForm.sjxInfoList || [];
    formulaItems.value = JSON.parse(JSON.stringify(addOrEditForm.indRuleExpr)) || [];
  } else {
    ElMessage.warning("请您先去分析模型管理模块绑定分析模型！");
  }
};

const closeApplHosp = () => {
  // 取消时清除没保存的选中数据的影响
  checkboxGroupList.value = [];
  applHospShow.value = false;
};

const applHospSubmit = () => {
  applHospShow.value = false;
  addOrEditForm.applHospType = JSON.parse(
    JSON.stringify(checkboxGroupList.value)
  );
  if (Array.isArray(addOrEditForm.applHospType)) {
    addOrEditForm.applHospType =
      addOrEditForm.applHospType?.map((item) => ({
        ...item,
        exist: 1,
      })) || [];
  } else {
    // 如果不是数组，初始化为空数组
    addOrEditForm.applHospType = [];
  }
  addOrEditForm.applHospName = checkboxGroupList.value
    ?.map((item) => item.hospitalCategoryName)
    ?.join(",");
};

const searchApplHosp = async () => {
  let res = await distinguish({
    typeCode: applHospKind.value,
    hospitalCategoryName: hospitalType.value,
  });
  ApplHospFn(res, "2");
};

const handleAllApplHosp = (val) => {
  checkAllApp.value = val;
  checkboxGroupList.value = val ? [...applHospList.value] : [];
  isIndApplHosp.value = false;
};

watch(
  () => checkboxGroupList.value,
  (val) => {
    // 过滤掉uuid相同的项目，确保checkboxGroupList中没有重复项
    const uniqueVal = val?.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.uuid === item.uuid)
    );

    // 如果过滤后数组长度发生变化，说明有重复项被移除
    if (uniqueVal.length !== val.length) {
      checkboxGroupList.value = uniqueVal;
      return; // 重新触发watch，使用去重后的值
    }
    nextTick(() => {
      const checkedCount = val?.length;
      checkAllApp.value =
        checkedCount == applHospList.value?.length && checkedCount > 0;
      isIndApplHosp.value =
        checkedCount > 0 && checkedCount < applHospList.value?.length;
    });
  },
  {
    deep: true,
    immediate: true,
  }
);

const delApplHosp = (val) => {
  checkboxGroupList.value = checkboxGroupList.value?.filter((item) => {
    return item.uuid != val.uuid;
  });
};

const clearApplHosp = () => {
  checkboxGroupList.value = [];
};

// 指标运算配置

const basicInfForm = reactive({
  zbName: "", // 指标名称
  unit: "", // 计量单位
  calcMethod: "", // 计量方法
  indRuleExpr: "", // 指标运算配置
});
const closeIndRuleExpr = () => {
  indRuleExprShow.value = false;
};

const indRuleExprSubmit = () => {
  addOrEditForm.indRuleExpr = formulaItems.value;
  addOrEditForm.indRuleName =
    addOrEditForm.indRuleExpr
      ?.filter((item) => item?.value)
      ?.map((item) => item.value)
      ?.join(" ") || "";
  addOrEditForm.indRule =
    addOrEditForm.indRuleExpr
      ?.filter((item) => item?.value)
      ?.map((item) =>
        item.dataItemEnName ? `{${item.dataItemEnName}}` : item?.value
      )
      ?.join("") || "";
  addOrEditForm.sjxInfoList = dataItemSelectList.value || [];
  console.log(dataItemSelectList.value, "dataItemSelectList.value");
  if (dataItemSelectList.value?.length) {
    addOrEditForm.version = dataItemSelectList.value?.find(
      (item) => (item.issourcezb && item.issourcezb == "1") || (item.version && item.version != "-")
    )?.version;
  }
  indRuleExprShow.value = false;
};

// 拖拽开始

const onDragStart = (event, item, type) => {
  draggedItem.value = item;
  draggedType.value = type;
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", JSON.stringify({ item, type }));
  // 添加拖拽样式
  event.target.style.opacity = "0.5";
};

// 拖拽结束

const onDragEnd = (event) => {
  event.target.style.opacity = "1";
  isDragOver.value = false;
  draggedIndex.value = -1;
  dropIndex.value = -1;
};

// 拖拽悬停

const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = draggedIndex.value !== -1 ? "move" : "copy";
  isDragOver.value = true;
};

// 拖拽放置

const onDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;
  if (draggedIndex.value !== -1) {
    // 公式区域内调整顺序
    if (dropIndex.value !== -1 && draggedIndex.value !== dropIndex.value) {
      const newItems = [...formulaItems.value];
      const [movedItem] = newItems.splice(draggedIndex.value, 1);
      newItems.splice(dropIndex.value, 0, movedItem);
      formulaItems.value = newItems;
    }
  } else if (draggedItem.value && draggedType.value) {
    // 从左侧面板拖拽到公式区域
    if (draggedType.value === "indicator") {
      dataItemId.value = draggedItem.value.uuid;
    } else {
      operatorId.value = draggedItem.value.id;
    }
    const newItem =
      draggedType.value === "indicator"
        ? {
            type: "indicator",
            value: draggedItem.value.dataItemName,
            uuid: draggedItem.value.uuid,
            dataItemType: draggedItem.value.dataItemType,
            dataItemExplain: draggedItem.value.dataItemExplain,
            analysisCycle: draggedItem.value.analysisCycle,
            statisticalPeriod: draggedItem.value.statisticalPeriod,
            dataItemEnName: draggedItem.value.dataItemEnName,
          }
        : draggedType.value === "operator"
        ? {
            type: "operator",
            value: draggedItem.value.label,
            uuid: draggedItem.value.id,
          }
        : {
            type: "value",
            value: draggedItem.value.label,
            uuid: draggedItem.value.id,
          };

    if (dropIndex.value !== -1) {
      // 插入到指定位置
      formulaItems.value = [
        ...formulaItems.value.slice(0, dropIndex.value),
        newItem,
        ...formulaItems.value.slice(dropIndex.value),
      ];
    } else {
      // 添加到末尾
      formulaItems.value.push(newItem);
    }
  }

  // 重置拖拽状态
  draggedItem.value = null;
  draggedType.value = "";
  draggedIndex.value = -1;
  dropIndex.value = -1;
};

// 公式项拖拽开始

const onFormulaItemDragStart = (event, index) => {
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", index.toString());
  event.target.style.opacity = "0.5";
};

// 计算放置位置的索引

const handleDragOverItem = (event, index) => {
  event.preventDefault();
  dropIndex.value = index;
  isDragOver.value = true;
};

// 选择数据项

const selectIndicator = (item) => {
  dataItemId.value = item.uuid;
  formulaItems.value.push({
    type: "indicator",
    value: item.dataItemName,
    dataItemType: item.dataItemType,
    dataItemExplain: item.dataItemExplain,
    analysisCycle: item.analysisCycle,
    statisticalPeriod: item.statisticalPeriod,
    uuid: item.uuid,
    dataItemEnName: item.dataItemEnName,
  });
};

// 删除数据项
const deleteDataItem = (item) => {
  // 从 dataItemSelectList 中删除指定项
  dataItemSelectList.value = dataItemSelectList.value?.filter(
    (dataItem) => dataItem.uuid !== item.uuid
  );
  addOrEditForm.sjxInfoList = dataItemSelectList.value || [];
  // 如果删除的是当前选中的项，清除选中状态
  if (dataItemId.value === item.uuid) {
    dataItemId.value = "";
  }

  // 从 formulaItems 中删除相关的公式项
  formulaItems.value = formulaItems.value?.filter(
    (formulaItem) =>
      formulaItem.uuid !== item.uuid || formulaItem.type !== "indicator"
  );
};

// 选择运算符

const selectOperator = (item) => {
  operatorId.value = item.id;
  if (item.id == "8") {
    formulaItems.value.push({
      type: "value",
      value: item.label,
      uuid: item.id,
    });
  } else {
    formulaItems.value.push({
      type: "operator",
      value: item.label,
      uuid: item.id,
    });
  }
};

// 编辑公式项

const editFormulaItem = (index) => {
  // 可以在这里添加编辑逻辑
  // console.log("编辑公式项:", index);
};

// 移除公式项

const removeFormulaItem = (index) => {
  formulaItems.value.splice(index, 1);
};

// 清空公式

const clearFormula = () => {
  formulaItems.value = [];
};

// 关闭模态框

const closeModal = () => {
  // 可以在这里添加关闭逻辑
  // console.log("关闭模态框");
};

//添加数据项
const openDataItem = () => {
  dataItemShow.value = true;
  dataItemParams.fxmxUuid = addOrEditForm.bndAnlzMod;
  dataItemParams.uuids = dataItemSelectList.value?.map((item) => item.uuid);
  nextTick(async () => {
    dataItemRef.value?.fetchData();
  });
};

const zbAttrFn = (val) => {
  return props.zbAttrList?.find((item) => item.dictValue == val)?.dictLabel;
};

const dataItemParams = reactive({
  dataItemName: "", // 数据项名称
  versionNumber: "", // 版本号
  fxmxUuid: "", // 分析模型id
  uuids: [], // 数据项id
  manualEntryApplicable: "", // 采集方式
  analysisCycle: "", // 分析周期
  statisticalPeriod: "", // 统计周期
});

const dataItemItems = computed(() => [
  {
    component: "el-input",
    label: "数据项名称：",
    style: { width: "200px" },
    prop: "dataItemName",
    attrs: { placeholder: "请输入", clearable: true },
  },
  {
    component: "el-select",
    label: "版本号：",
    style: { width: "164px" },
    prop: "versionNumber",
    optionValue: "label",
    attrs: { placeholder: "请选择", clearable: true },
    options: props.zbVerNumList,
  },
  {
    component: "el-select",
    label: "采集方式：",
    style: { width: "164px" },
    prop: "manualEntryApplicable",
    attrs: { placeholder: "请选择", clearable: true },
    options: colTypeFn(),
  },
  {
    component: "el-select",
    label: "分析周期：",
    style: { width: "164px" },
    prop: "analysisCycle",
    optionValue: "label",
    attrs: { placeholder: "请选择", clearable: true },
    options: props.analPerList,
  },
  {
    component: "el-select",
    label: " 频次：",
    style: { width: "164px" },
    prop: "statisticalPeriod",
    attrs: { placeholder: "请选择", clearable: true },
    options: statPerFn(),
  },
]);

const dataItemTableColumns = ref([
  {
    columnLabel: "数据项编号",
    columnName: "dataItemCode",
    columnWidth: "150",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "数据项名称",
    columnName: "dataItemName",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "数据项版本号",
    columnName: "version",
    columnWidth: "130",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "数据项类型",
    columnName: "dataItemType",
    columnWidth: "120",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return dataItemTypeFn(row.dataItemType, "formatter");
    },
  },
  {
    columnLabel: "采集方式",
    columnName: "manualEntryApplicable",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return colTypeFn(row.manualEntryApplicable, "formatter");
    },
  },
  {
    columnLabel: "分析周期",
    columnName: "analysisCycle",
    columnWidth: "100",
    align: "center",
    showOverflowTooltip: true,
  },
  {
    columnLabel: "频次",
    columnName: "statisticalPeriod",
    columnWidth: "100",
    showOverflowTooltip: true,
    formatter: (row, cloumn, index) => {
      return statPerFn(row.statisticalPeriod, "formatter");
    },
  },
  // {
  //   columnLabel: "对应物理表结构数据项",
  //   columnName: "physicalTableDataItems",
  //   columnWidth: "200",
  //   showOverflowTooltip: true,
  // },
]);

const dataItemBtnList = ref([
  {
    btnType: "cancel",
  },
  {
    btnType: "confirm",
  },
]);

const dataItemBtnClick = async (val) => {
  if (val.text === "确定") {
    dataItemShow.value = false;
    console.log(dataItemSelectListTs.value, 6666);
    let sjxInfoListTs = JSON.parse(JSON.stringify(addOrEditForm.sjxInfoList))
    console.log(sjxInfoListTs, 7777);
    dataItemSelectListTs.value?.forEach((item) => {
      sjxInfoListTs.push(item);
    });
    addOrEditForm.sjxInfoList = JSON.parse(JSON.stringify(sjxInfoListTs))
    dataItemSelectList.value = addOrEditForm.sjxInfoList;
  } else if (val.text === "取消") {
    dataItemShow.value = false;
    dataItemSelectList.value = addOrEditForm.sjxInfoList || [];
  }
};

const dataItemSelectChange = (val) => {
  //当前页面选中
  dataItemSelectListTs.value = val;
};

const dataItemSearch = () => {
  if (!dataItemRef.value) return;
  dataItemRef.value.fetchData("重置");
};

const dataItemReset = () => {
  if (!dataItemRef.value) return;
  dataItemRef.value.fetchData("重置");
};

const closeDataItem = () => {
  dataItemShow.value = false;
};

// 绑定父级指标
const listFjzbFn = async () => {
  let res = await listFjzb({
    ...parentIndexParams,
    pageNum: currentPage.value,
    pageSize: pageSizes.value,
  });
  if (res.code == 200) {
    fatherTableData.value = res.rows;
    if (addOrEditForm.zbFather) {
      fatherTableData.value?.forEach((item) => {
        if (item.uuid == addOrEditForm.zbFather) {
          item.fjxz = "1";
        }
      });
    }
    total.value = res.total;
  } else {
    fatherTableData.value = [];
    total.value = 0;
  }
};

const onSearch = () => {
  listFjzbFn();
};

const onReset = () => {
  parentIndexParams.zbCode = "";
  parentIndexParams.zbName = "";
  parentIndexParams.version = "";
  listFjzbFn();
};

const handleSizeChange = (val) => {
  currentPage.value = 1; // 重置为第一页
  pageSizes.value = val; // 更新每页条数
  listFjzbFn();
};
const handlePageChange = (val) => {
  currentPage.value = val;
  listFjzbFn();
};

const bindParentIndex = async () => {
  if (addOrEditForm.bndAnlzMod) {
    parentIndexParams.bndAnlzMod = addOrEditForm.bndAnlzMod;
    parentIndexShow.value = true;
    listFjzbFn();
  } else {
    ElMessage.warning("请您先去分析模型管理模块绑定分析模型！");
  }
};

const closeParentIndex = () => {
  parentIndexShow.value = false;
  // 取消时清除暂存选中父级指标
  zbFatherData.value = {};
};

const submitParentIndex = () => {
  parentIndexShow.value = false;
  // 保存时变更选中父级指标
  addOrEditForm.zbFatherName = zbFatherData.value.zbmc;
  addOrEditForm.zbFather = zbFatherData.value.uuid;
};

const parentIndexParams = reactive({
  zbUuid: "", // 指标id
  bndAnlzMod: "", // 分析模型id
  zbCode: "", // 指标编码
  zbName: "", // 指标名称
  version: "", // 版本号
});

const parentIndexBtnList = ref([
  {
    btnType: "cancel",
  },
  {
    btnType: "confirm",
  },
]);

const parentIndexSelectChange = (val) => {};

const parentIndexReset = () => {
  if (!parentIndexRef.value) return;
  parentIndexRef.value.fetchData("重置");
};

const parentIndexSearch = () => {
  if (!parentIndexRef.value) return;
  parentIndexRef.value.fetchData("重置");
};

// 配置跳转路径
const openJumpPath = () => {
  if (addOrEditForm.bndAnlzMod) {
    jumpPathTableData.value =
      JSON.parse(JSON.stringify(addOrEditForm.indJmpPath)) || [];
    jumpPathObj.value =
      addOrEditForm?.indJmpPath?.find((f) => f.valid == 1) || {};
    jumpPathShow.value = true;
  } else {
    ElMessage.warning("请您先去分析模型管理模块绑定分析模型！");
  }
};

// 新增行
const addJumpPath = () => {
  jumpPathTableData.value.push({
    valid: "0", //  默认选中
    tzlj: "", //  跳转路径
    ymzstype: "", //  关联风格
    zbdyxxuuid: addOrEditForm.zbUuid, //  指标Uuid
    fgms: "", //  关联风格名称
  });
  if (jumpPathTableData.value.length == 1) {
    jumpPathObj.value = jumpPathTableData.value[0];
    jumpPathTableData.value[0].valid = "1";
  }
};

//  删除当前行数据
const deletePath = (data, index) => {
  jumpPathTableData.value.splice(index, 1);
};

const closeJumpPath = () => {
  jumpPathShow.value = false;
};

const submitJumpPath = () => {
  addOrEditForm.indJmpPath = jumpPathTableData.value;
  addOrEditForm.selectedJmpPath = jumpPathTableData.value?.find(
    (item) => item.valid == 1
  )?.tzlj;
  jumpPathShow.value = false;
};

const zbFatherData = ref({});
const clickChanges = (item, index) => {
  fatherTableData.value?.forEach((e, i) => {
    if (i == index) {
      e.fjxz = "1";
      zbFatherData.value = e;
    } else {
      e.fjxz = "0";
    }
  });
};

const clickChange = (item, index) => {
  jumpPathTableData.value?.forEach((e, i) => {
    if (i == index) {
      e.valid = "1";
    } else {
      e.valid = "0";
    }
  });
};



const addOrEditFormFn = (data) => {
  console.log("data", data, 1111);
  const deepCopiedData = JSON.parse(JSON.stringify(data));
  Object.assign(addOrEditForm, deepCopiedData);
  addOrEditForm.zbNameList = addOrEditForm.zbUuid;
  addOrEditForm.sjxInfoList = data.sjxInfoList || [];
  addOrEditForm.applHospName = addOrEditForm.applHospType
    ?.map((item) => item.hospitalCategoryName)
    ?.join(",");
  addOrEditForm.selectedJmpPath = data?.indJmpPath?.find(
    (item) => item.valid == 1
  )?.tzlj;
  if (addOrEditForm?.indRuleExpr && addOrEditForm?.indRuleExpr?.length) {
    addOrEditForm.indRuleName =
      addOrEditForm?.indRuleExpr
        ?.filter((item) => item?.value)
        ?.map((item) => item.value)
        ?.join(" ") || "";
  }
};

watch(
  () => props.formData,
  (newValue, oldValue) => {
    const oldObj = oldValue || {};
    const newObj = newValue || {};
    console.log("newValue", newValue, oldValue, newObj, oldObj);
    addOrEditFormFn(newValue);
  },
  { immediate: true, deep: true }
);
watch(
  () => props.resetFlag,
  (newValue) => {
    console.log("props.resetFlag", newValue);
    addOrEditFormFn(props.formData);
  },
  { immediate: true, deep: true }
);

// 暴露方法给父组件
defineExpose({
  addOrEditForm,
  addOrEditFormRef, // 同时暴露表单引用
  callParentPatternClick, // 暴露调用父组件patternClick的函数
  validateForm: () => {
    return new Promise((resolve, reject) => {
      if (addOrEditFormRef.value) {
        addOrEditFormRef.value.validate((valid, fields) => {
          if (valid) {
            resolve(true);
          } else {
            reject(fields);
          }
        });
      } else {
        resolve(false);
      }
    });
  },
  resetForm: () => {
    if (addOrEditFormRef.value) {
      addOrEditFormRef.value.resetFields();
    }
  },
});
</script>

<style lang="scss" scoped>
.indexLoactionComponent {
  .radioList {
    margin: 0 0 0 auto;
    padding-right: 30px;
  }
}

.textarea-class {
  width: 100% !important;
}

.vertical-line-class {
  width: 2px;
  height: 16px;
  opacity: 1;
  border-radius: 63px;
  background: rgba(83, 128, 253, 1);
  margin-right: 4px;
}

.blue-vertical-line {
  width: 2px;
  height: 26px;
  background: rgba(83, 128, 253, 1);
  border-radius: 1px;
  margin-right: 4px;
  position: relative;
  top: 1px;
}

.black-divider {
  width: 100%;
  height: 1px;
  background: #ccc;
  margin-bottom: 15px;
}

.dataItemDefault {
  background: rgba(0, 115, 237, 0.05);
  padding: 0 15px;
  height: 29px;
  border-left: 3px solid transparent;
  cursor: pointer;
}

.dataItemSelected {
  border-left: 3px solid rgba(83, 128, 253, 1);
  background: rgba(83, 128, 253, 0.15);
}

.formula-builder {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  width: 100%;
  display: flex;
  align-items: center;
}

.formula-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 60px;
  padding: 5px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 2px dashed transparent;
  transition: all 0.3s ease;
  width: calc(100% - 70px);
}

.formula-display.drag-over {
  border-color: #007bff;
  background: #e3f2fd;
}

.formula-item {
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
  user-select: none;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.formula-item.drag-over-item {
  border: 2px dashed #007bff;
  background-color: #e3f2fd;
}

.formula-item-content {
  position: relative;
  display: inline-block;
}

.formula-operator {
  font-size: 16px;
  font-weight: bold;
  color: #666;
  padding: 6px 10px;
  background: #e9ecef;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.formula-indicator {
  color: #333;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #0056b3;
}

.formula-indicator:hover {
  border: 1px solid #0056b3;
}

.formula-value {
  // background: #28a745;
  // color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  // border: 1px solid #1e7e34;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: absolute;
  top: -6px;
  right: -6px;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.formula-item-content:hover .remove-btn {
  display: flex;
}

.remove-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.formula-placeholder {
  color: #999;
  font-style: italic;
  font-size: 13px;
  text-align: center;
  width: 100%;
}

.formula-actions {
  display: flex;
  justify-content: flex-end;
  height: 24px;
  width: 70px;
}

.clear-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #c82333;
}

.trash-icon {
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-save {
  background: #007bff;
  color: white;
}

.btn-save:hover {
  background: #0056b3;
}

.save-icon {
  font-size: 12px;
}

/* 滚动条样式 */

.data-list::-webkit-scrollbar {
  width: 6px;
}

.data-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.data-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.data-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 拖拽相关样式 */

.data-item[draggable="true"] {
  cursor: grab;
}

.data-item[draggable="true"]:active {
  cursor: grabbing;
}

.formula-item[draggable="true"] {
  cursor: grab;
}

.formula-item[draggable="true"]:active {
  cursor: grabbing;
}
</style>

<style lang="scss">
.indexAllocation-checkbox-group {
  .el-checkbox__label {
    width: 100%;
  }
}

.el-input-botton {
  height: 34px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  padding: 0 6px;

  img {
    margin-right: 6px;
  }
}

.el-input-bottons {
  padding: 0 6px;
  display: flex;
  align-items: center;
  background: rgba(249, 65, 68, 0.1);
  border: 1px solid rgba(249, 65, 68, 0.5);
  color: rgba(249, 65, 68, 1);
}

.formula-item-tooltip {
  max-width: 400px;
}
.applyHospitalCss {
  width: 100%;
  display: flex;
  .applyHospitalCssLeft {
    width: 55%;
    .contentApply {
      width: 100%;
      padding: 10px 15px;
      background: #f8f8f8;
      overflow: auto;
      height: 500px;
      box-sizing: border-box;
    }
  }
  .applyHospitalCssRight {
    width: 41%;
    margin-left: 3%;
    .contentApply {
      width: 100%;
      padding: 10px 15px;
      background: #f8f8f8;
      overflow: auto;
      height: 500px;
      box-sizing: border-box;
    }
    .checkboxData {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0, 115, 237, 0.05);
      margin-bottom: 10px;
      padding: 10px 15px;
      box-sizing: border-box;
    }
  }
  .topHeader {
    font-size: 16px;
    display: flex;
    align-items: center;
    height: 36px;
    color: #000;
    font-weight: 600;
    border-bottom: 1px solid #ccc;
  }
}
</style>