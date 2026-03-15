<template>
  <SzycDialog :dialogVisible="dialogVisible" width="45%" @close="dialogVisible = false" title="文本文件输入"
    :destroy-on-close="true" :alignCenter="true">
    <template #uname>
      <el-form :model="form" label-width="100px">
        <el-form-item label="步骤名称：">
          <el-input v-model="form.stepName" placeholder="请输入"></el-input>
        </el-form-item>
        <!-- 其他表单项 -->
        <el-tabs type="border-card" v-model="activeTab" class="tabItem" @tab-click="handleTabClick">
          <div class="dialog-content-wrapper">
            <el-tab-pane label="文件" name="file">
              <el-form label-position="right" label-width="160px" :disabled="form.acceptingFilenames"
                style="margin-right: 30px">
                <el-form-item label="文件名称：">
                  <el-input v-model="form.fileName" placeholder="请输入" style="width: 76%"></el-input>
                  <el-button @click="addFile" style="margin-left: 5px;">增加</el-button>
                  <el-button @click="browseFile('file')" style="margin-left: 5px;">浏览</el-button>
                </el-form-item>
                <el-form-item label="规则表达式：">
                  <el-input v-model="form.fileMask" placeholder="请输入" style="width: 100%"></el-input>
                </el-form-item>
                <el-form-item label="正则表达式(排除)：">
                  <el-input v-model="form.excludeFileMask" placeholder="请输入" style="width: 100%"></el-input>
                </el-form-item>
                <el-form-item label="选中的文件：">
                  <RightClickTable ref="fileTableRef" v-model="form.fileDataList" :columns="fileDataColumns"
                    :defaultRow="defaultFileDataRow" :showIndex="true" :height="200" style="width: 100%">
                  </RightClickTable>
                </el-form-item>
              </el-form>
              <el-divider content-position="left">从上一步骤获取文件</el-divider>
              <el-form label-position="right" label-width="220px" style="margin-right: 30px">
                <el-form-item label="从以前步骤接收文件名：">
                  <el-checkbox v-model="form.acceptingFilenames" @change="handleGetFromFileStepChange"></el-checkbox>
                </el-form-item>
                <el-form-item label="从以前步骤接受字段名：">
                  <el-checkbox v-model="form.passingThruFields" :disabled="!form.acceptingFilenames"
                    class="checkBox"></el-checkbox>
                </el-form-item>
                <el-form-item label="步骤读取的文件名来自：">
                  <el-input v-model="form.acceptingField" :disabled="!form.acceptingFilenames" placeholder="请输入"
                    style="width: 100%"></el-input>
                </el-form-item>
                <el-form-item label="在输入里的字段被当做文件名：">
                  <el-input v-model="form.acceptingStepName" :disabled="!form.acceptingFilenames" placeholder="请输入"
                    style="width: 100%"></el-input>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="内容" name="content">
              <el-form :model="form" label-width="220px" style="margin-right: 30px">
                <el-form-item label="文件类型：">
                  <el-select v-model="form.fileType" placeholder="请选择">
                    <el-option label="CSV" value="CSV"></el-option>
                    <el-option label="Fixed" value="Fixed"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="分割符：">
                  <el-input v-model="form.separator" style="width: 80.5%" placeholder=""></el-input>
                  <el-button @click="insertTab" style="margin-left: 10px">插入TAB</el-button>
                </el-form-item>
                <el-form-item label="文本限定符：">
                  <el-input v-model="form.enclosure" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="在文本里允许换行：">
                  <el-checkbox v-model="form.breakInEnclosureAllowed"></el-checkbox>
                </el-form-item>
                <el-form-item label="逃逸字符：">
                  <el-input v-model="form.escapeCharacter" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="头部：">
                  <div class="checkbox-input-container">
                    <div class="checkbox-wrapper">
                      <el-checkbox v-model="form.header"></el-checkbox>
                    </div>
                    <div class="input-wrapper">
                      <span class="input-label">头部行数:</span>
                      <el-input v-model="form.nrHeaderLines" class="flex-input" :disabled="!form.header"
                        placeholder=""></el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="尾部：">
                  <div class="checkbox-input-container">
                    <div class="checkbox-wrapper">
                      <el-checkbox v-model="form.footer"></el-checkbox>
                    </div>
                    <div class="input-wrapper">
                      <span class="input-label">尾部行数:</span>
                      <el-input v-model="form.nrFooterLines" class="flex-input-number" :disabled="!form.footer"
                        placeholder="请输入"></el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="包装行：">
                  <div class="checkbox-input-container">
                    <div class="checkbox-wrapper">
                      <el-checkbox v-model="form.lineWrapped"></el-checkbox>
                    </div>
                    <div class="input-wrapper">
                      <span class="input-label">以时间包装的行数:</span>
                      <el-input v-model="form.nrWraps" class="flex-input-number" :disabled="!form.lineWrapped"
                        placeholder="请输入"></el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="分页布局(pointout)：">
                  <div class="checkbox-input-container">
                    <div class="checkbox-wrapper">
                      <el-checkbox v-model="form.layoutPaged"></el-checkbox>
                    </div>
                    <div class="input-wrapper">
                      <span class="input-label">每页记录行数:</span>
                      <el-input v-model="form.nrLinesPerPage" class="flex-input-number short"
                        :disabled="!form.layoutPaged" placeholder="请输入"></el-input>
                      <span class="input-label" style="margin-left: 5px">文档头部行:</span>
                      <el-input v-model="form.nrLinesDocHeader" class="flex-input-number short"
                        :disabled="!form.layoutPaged" placeholder="请输入"></el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="压缩：">
                  <el-select v-model="form.fileCompression" placeholder="">
                    <el-option label="Zip" value="Zip"></el-option>
                    <el-option label="Gzip" value="Gzip"></el-option>
                    <el-option label="Hadoop-snappy" value="Hadoop-snappy"></el-option>
                    <el-option label="None" value="None"></el-option>
                    <el-option label="Snappy" value="Snappy"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="没有空行：">
                  <el-checkbox v-model="form.noEmptyLines"></el-checkbox>
                </el-form-item>
                <el-form-item label="在输出包括字段名：">
                  <div class="checkbox-input-container">
                    <div class="checkbox-wrapper">
                      <el-checkbox v-model="form.includeFilename"></el-checkbox>
                    </div>
                    <div class="input-wrapper">
                      <span class="input-label">包含字段名名称:</span>
                      <el-input v-model="form.fieldNamesFieldName" class="flex-input-number"
                        :disabled="!form.includeFilename" placeholder=""></el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="输出包含行数：">
                  <div class="checkbox-input-container">
                    <div class="checkbox-wrapper">
                      <el-checkbox v-model="form.includeRowNumber"></el-checkbox>
                    </div>
                    <div class="input-wrapper">
                      <span class="input-label">行数字段名称:</span>
                      <el-input v-model="form.rowNumberField" class="flex-input-number"
                        :disabled="!form.includeRowNumber" placeholder=""></el-input>
                    </div>
                  </div>
                  <span style="margin-left: 35px">按文件取行号:</span>
                  <el-checkbox style="margin-left: 20px;" v-model="form.rowNumberByFile"
                    :disabled="!form.includeRowNumber"></el-checkbox>
                </el-form-item>
                <el-form-item label="格式：">
                  <el-select v-model="form.fileFormat" placeholder="">
                    <el-option v-for="item in lineTerminatorOptions" :key="item.name" :label="item.name"
                      :value="item.name"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="编码：">
                  <el-select v-model="form.encoding" placeholder="" filterable>
                    <el-option v-for="item in charsetOptionList" :key="item.name" :label="item.name"
                      :value="item.name"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="记录数量限制：">
                  <el-input-number v-model="form.rowLimit" :min="0"></el-input-number>
                </el-form-item>
                <el-form-item label="解析日期的时候是否严格要求：">
                  <el-checkbox v-model="form.dateFormatLenient"></el-checkbox>
                </el-form-item>
                <el-form-item label="本地日期格式：">
                  <el-select v-model="form.dateFormatLocale" placeholder="">
                    <el-option label="zh_CN" value="zh_CN"></el-option>
                    <el-option label="en_US" value="en_US"></el-option>
                  </el-select>
                </el-form-item>
                <el-divider content-position="left">结果文件名</el-divider>
                <el-form-item label="添加文件名：">
                  <el-checkbox v-model="form.addresult"></el-checkbox>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="错误处理" name="error">
              <el-form label-position="right" label-width="160px">
                <el-form-item label="忽略错误：">
                  <el-checkbox v-model="form.errorIgnored"></el-checkbox>
                </el-form-item>
                <el-form-item label="忽略错误文件：">
                  <el-checkbox v-model="form.skipBadFiles" :disabled="!form.errorIgnored"></el-checkbox>
                </el-form-item>
                <el-form-item label="错误文件字段名：">
                  <el-input v-model="form.fileErrorField" placeholder="" :disabled="!form.skipBadFiles"></el-input>
                </el-form-item>
                <el-form-item label="文件错误信息字段名：">
                  <el-input v-model="form.fileErrorMessageField" placeholder=""
                    :disabled="!form.skipBadFiles"></el-input>
                </el-form-item>
                <el-form-item label="跳过错误行：">
                  <el-checkbox v-model="form.errorLineSkipped" :disabled="!form.errorIgnored"></el-checkbox>
                </el-form-item>
                <el-form-item label="错误计数制度：">
                  <el-input v-model="form.errorCountField" placeholder="" :disabled="!form.errorIgnored"></el-input>
                </el-form-item>
                <el-form-item label="错误字段文件名：">
                  <el-input v-model="form.errorFieldsField" placeholder="" :disabled="!form.errorIgnored"></el-input>
                </el-form-item>
                <el-form-item label="错误文本字段：">
                  <el-input v-model="form.errorTextField" placeholder="" :disabled="!form.errorIgnored"></el-input>
                </el-form-item>
                <el-form-item label="告警文件目录：">
                  <div style="display: flex;">
                    <el-input v-model="form.warningFilesDestinationDirectory" style="flex: 15;"
                      :disabled="!form.errorIgnored"></el-input>
                    <span style="width: 90px; flex: 2;margin-left: 20px;">拓展名</span>
                    <el-input v-model="form.warningFilesExtension" style="flex: 4;"
                      :disabled="!form.errorIgnored"></el-input>
                    <el-button @click="browseFile('warningFilesDestinationDirectory')"
                      style="margin-left: 10px; flex: 1;" :disabled="!form.errorIgnored">浏览</el-button>
                  </div>
                </el-form-item>
                <el-form-item label="错误文件目录：">
                  <div style="display: flex;">
                    <el-input v-model="form.errorFilesDestinationDirectory" style="flex: 15;"
                      :disabled="!form.errorIgnored"></el-input>
                    <span style="width: 90px; flex: 2;margin-left: 20px;">拓展名</span>
                    <el-input v-model="form.errorFilesExtension" style="flex: 4;"
                      :disabled="!form.errorIgnored"></el-input>
                    <el-button @click="browseFile('errorFilesDestinationDirectory')" style="margin-left: 10px; flex: 1;"
                      :disabled="!form.errorIgnored">浏览</el-button>
                  </div>
                </el-form-item>
                <el-form-item label="失败行数文件目录：">
                  <div style="display: flex;">
                    <el-input v-model="form.lineNumberFilesDestinationDirectory" style="flex: 15;"
                      :disabled="!form.errorIgnored"></el-input>
                    <span style="width: 90px; flex: 2;margin-left: 20px;">拓展名</span>
                    <el-input v-model="form.lineNumberFilesExtension" style="flex: 4;"
                      :disabled="!form.errorIgnored"></el-input>
                    <el-button @click="browseFile('lineNumberFilesDestinationDirectory')"
                      style="margin-left: 10px; flex: 1;" :disabled="!form.errorIgnored">浏览</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="过滤" name="filter">
              <RightClickTable ref="filterDataTableRef" v-model="form.filter" :columns="filterDataColumns"
                :defaultRow="defaultFilterDataRow" :showIndex="true" :height="550" style="width: 100%">
              </RightClickTable>
            </el-tab-pane>
            <el-tab-pane label="字段" name="field">
              <RightClickTable ref="fieldDataTableRef" :modelValue="form.field" :columns="fieldDataColumns"
                :showIndex="true" :height="550" style="width: 100%" :needSpecialFunction="true"
                :specialFunction="'获取变量'" @parent-function="fieldParentFunction">
              </RightClickTable>
            </el-tab-pane>
            <el-tab-pane label="其他输出字段" name="otherField">
              <el-form label-position="right" label-width="200px">
                <el-form-item label="文件名字段：">
                  <el-input v-model="form.shortFilenameField" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="扩展名字段：">
                  <el-input v-model="form.extensionField" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="路径字段：">
                  <el-input v-model="form.pathField" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="文件大小字段：">
                  <el-input v-model="form.sizeField" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="是否为隐藏文件字段：">
                  <el-input v-model="form.hiddenField" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="最后修改时间字段：">
                  <el-input v-model="form.lastModificationField" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="Uri字段：">
                  <el-input v-model="form.uriField" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="Root uri字段：">
                  <el-input v-model="form.rootUriField" placeholder=""></el-input>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </div>
        </el-tabs>
      </el-form>
      <div style="
          display: flex;
          width: 100%;
          justify-content: center;
          margin-top: 20px;
        ">
        <SzycCancel @click="dialogVisible = false">取消</SzycCancel>
        <szycButton type="primary" @click="handleConfirm">确定</szycButton>
      </div>
    </template>
  </SzycDialog>
  <FileExplorerWindow v-model:visible="showFileExplorer" :extension="0" @ok="handleFileSelected" />

</template>

<script setup>
import { ref, reactive, computed, nextTick } from "vue";
import SzycFormSearch from "@/components/element/searchForm.vue";
import szycButton from "@/components/element/Confirm.vue";
import SzycCancel from "@/components/element/Cancel.vue";
import RightClickTable from "../tools/rightClickTable.vue";
import FileExplorerWindow from "../tools/FileExplorerWindow.vue";
import { systemFormatMapperLineTerminator, systemDateTimeFormats, systemAvailableCharsets, systemDataTypes, valueMeta, valueFormat, inputOutputFields } from "@/api/kettleApi";
const dialogVisible = ref(false);
const activeTab = ref("file");
const fileTableRef = ref(null);
const filterDataTableRef = ref(null);
const showFileExplorer = ref(false);
const lineTerminatorOptions = ref([])
const charsetOptionList = ref([])
const valueMetaList = ref([]);
const valueFormatList = ref([]);
const form = reactive({
  stepName: "",
  name: "",
  fileMask: "",
  excludeFileMask: "",
  acceptingFilenames: false,
  passingThruFields: false,
  acceptingField: "",
  acceptingStepName: "",

  // 文件选项卡新增属性
  fileDataList: [],

  // 内容选项卡属性
  fileType: "",
  separator: "",
  enclosure: "",
  breakInEnclosureAllowed: false,
  escapeCharacter: "",
  header: false,
  nrHeaderLines: 0,
  footer: false,
  nrFooterLines: 0,
  lineWrapped: false,
  nrWraps: 0,
  layoutPaged: false,
  nrLinesPerPage: 0,
  nrLinesDocHeader: 0,
  fileCompression: "",
  noEmptyLines: true,
  includeFilename: false,
  fieldNamesFieldName: "",
  includeRowNumber: false,
  rowNumberField: "",
  rowNumberByFile: false,
  fileFormat: "",
  encoding: "",
  rowLimit: 0,
  dateFormatLenient: false,
  dateFormatLocale: "",
  addresult: false,

  // 错误处理选项卡属性
  errorIgnored: false,
  skipBadFiles: false,
  fileErrorField: "",
  fileErrorMessageField: "",
  errorLineSkipped: false,
  errorCountField: "",
  errorFieldsField: "",
  errorTextField: "",
  warningFilesDestinationDirectory: "",
  warningFilesExtension: "",
  errorFilesDestinationDirectory: "",
  errorFilesExtension: "",
  lineNumberFilesDestinationDirectory: "",
  lineNumberFilesExtension: "",

  // 过滤选项卡属性
  filter: [],

  // 字段选项卡属性
  field: [],

  // 其他输出字段属性
  shortFilenameField: "",
  extensionField: "",
  pathField: "",
  sizeField: "",
  hiddenField: "",
  lastModificationField: "",
  uriField: "",
  rootUriField: "",
});

const { mxUtils } = window.mx;
const emit = defineEmits(['update-step'])

// 存储当前编辑的节点信息
let currentCell = null;
let currentGraph = null;
let currentXml = null
// 获取完整xml
let allXml = null
let transName = ref("")

const openDialog = (data) => {
  // 接收节点信息
  if (data && data.cell) {
    currentCell = data.cell;
    currentGraph = data.graph;
    currentXml = data.xml
    allXml = data.allXml
    transName.value = data.transName
    stepName.value = data.cell.value || ''
    parseStepInfoAndPopulateForm(currentXml);
    getvalueMeta()
    getvalueFormat()
  }

  dialogVisible.value = true;
};


// 解析stepInfo并填充表单
const parseStepInfoAndPopulateForm = (stepInfoXml) => {
  try {
    // 使用 mxUtils 解析 XML 字符串
    let xmlDoc = mxUtils.parseXml(stepInfoXml);
    // 查找 step 元素
    let stepElements = xmlDoc.getElementsByTagName('Step');
    if (stepElements.length > 0) {
      const fileInput = stepElements[0];

      // 基本信息
      form.stepName = fileInput.getAttribute('label') || '';

      // 文件选项卡
      form.fileName = fileInput.getAttribute('fileName') || '';
      form.fileMask = fileInput.getAttribute('fileMask') || '';
      form.excludeFileMask = fileInput.getAttribute('excludeFileMask') || '';
      form.acceptingFilenames = fileInput.getAttribute('acceptingFilenames') === 'Y';
      form.passingThruFields = fileInput.getAttribute('passingThruFields') === 'Y';
      form.acceptingField = fileInput.getAttribute('acceptingField') || '';
      form.acceptingStepName = fileInput.getAttribute('acceptingStepName') || '';

      // 内容选项卡
      form.fileType = fileInput.getAttribute('fileType') || 'CSV';
      form.separator = fileInput.getAttribute('separator') || '';
      form.enclosure = fileInput.getAttribute('enclosure') || '';
      form.breakInEnclosureAllowed = fileInput.getAttribute('breakInEnclosureAllowed') === 'Y';
      form.escapeCharacter = fileInput.getAttribute('escapeCharacter') || '';
      form.header = fileInput.getAttribute('header') === 'Y';
      form.nrHeaderLines = parseInt(fileInput.getAttribute('nrHeaderLines')) || 0;
      form.footer = fileInput.getAttribute('footer') === 'Y';
      form.nrFooterLines = parseInt(fileInput.getAttribute('nrFooterLines')) || 0;
      form.lineWrapped = fileInput.getAttribute('lineWrapped') === 'Y';
      form.nrWraps = parseInt(fileInput.getAttribute('nrWraps')) || 0;
      form.layoutPaged = fileInput.getAttribute('layoutPaged') === 'Y';
      form.nrLinesPerPage = parseInt(fileInput.getAttribute('nrLinesPerPage')) || 0;
      form.nrLinesDocHeader = parseInt(fileInput.getAttribute('nrLinesDocHeader')) || 0;
      form.fileCompression = fileInput.getAttribute('fileCompression') || 'None';
      form.noEmptyLines = fileInput.getAttribute('noEmptyLines') !== 'N'; // 默认为true
      form.includeFilename = fileInput.getAttribute('includeFilename') === 'Y';
      form.fieldNamesFieldName = fileInput.getAttribute('fieldNamesFieldName') || '';
      form.includeRowNumber = fileInput.getAttribute('includeRowNumber') === 'Y';
      form.rowNumberField = fileInput.getAttribute('rowNumberField') || '';
      form.rowNumberByFile = fileInput.getAttribute('rowNumberByFile') === 'Y';
      form.fileFormat = fileInput.getAttribute('fileFormat') || '';
      form.encoding = fileInput.getAttribute('encoding') || '';
      form.rowLimit = parseInt(fileInput.getAttribute('rowLimit')) || 0;
      form.dateFormatLenient = fileInput.getAttribute('dateFormatLenient') === 'Y';
      form.dateFormatLocale = fileInput.getAttribute('dateFormatLocale') || '';
      form.addresult = fileInput.getAttribute('addresult') === 'Y';

      form.field = JSON.parse(fileInput.getAttribute('inputFields')) || [];
      form.filter = JSON.parse(fileInput.getAttribute('filter')) || [];
      form.valueMeta = JSON.parse(fileInput.getAttribute('valueMeta')) || [];
      // 错误处理选项卡
      form.errorIgnored = fileInput.getAttribute('errorIgnored') === 'Y';
      form.skipBadFiles = fileInput.getAttribute('skipBadFiles') === 'Y';
      form.fileErrorField = fileInput.getAttribute('fileErrorField') || '';
      form.fileErrorMessageField = fileInput.getAttribute('fileErrorMessageField') || '';
      form.errorLineSkipped = fileInput.getAttribute('errorLineSkipped') === 'Y';
      form.errorCountField = fileInput.getAttribute('errorCountField') || '';
      form.errorFieldsField = fileInput.getAttribute('errorFieldsField') || '';
      form.errorTextField = fileInput.getAttribute('errorTextField') || '';
      form.warningFilesDestinationDirectory = fileInput.getAttribute('warningFilesDestinationDirectory') || '';
      form.warningFilesExtension = fileInput.getAttribute('warningFilesExtension') || '';
      form.errorFilesDestinationDirectory = fileInput.getAttribute('errorFilesDestinationDirectory') || '';
      form.errorFilesExtension = fileInput.getAttribute('errorFilesExtension') || '';
      form.lineNumberFilesDestinationDirectory = fileInput.getAttribute('lineNumberFilesDestinationDirectory') || '';
      form.lineNumberFilesExtension = fileInput.getAttribute('lineNumberFilesExtension') || '';

      // 其他输出字段
      form.shortFilenameField = fileInput.getAttribute('shortFilenameField') || '';
      form.extensionField = fileInput.getAttribute('extensionField') || '';
      form.pathField = fileInput.getAttribute('pathField') || '';
      form.sizeField = fileInput.getAttribute('sizeField') || '';
      form.hiddenField = fileInput.getAttribute('hiddenField') || '';
      form.lastModificationField = fileInput.getAttribute('lastModificationField') || '';
      form.uriField = fileInput.getAttribute('uriField') || '';
      form.rootUriField = fileInput.getAttribute('rootUriField') || '';
    }
  } catch (error) {
    console.error('解析stepInfo XML失败:', error);
    ElMessage.error("解析stepInfo XML数据失败");
  }
}

// 更新stepInfo XML中的数据
const updateStepInfoXml = (stepInfoXml) => {
  try {
    let xmlDoc = mxUtils.parseXml(stepInfoXml);
    // 查找 step 元素
    const stepElements = xmlDoc.getElementsByTagName('Step');

    if (stepElements.length > 0) {
      const fileInput = stepElements[0];
      // 基本信息
      fileInput.setAttribute('label', form.stepName);

      // 文件选项卡
      fileInput.setAttribute('fileName', form.fileName);
      fileInput.setAttribute('fileMask', form.fileMask);
      fileInput.setAttribute('excludeFileMask', form.excludeFileMask);
      fileInput.setAttribute('acceptingFilenames', form.acceptingFilenames ? 'Y' : 'N');
      fileInput.setAttribute('passingThruFields', form.passingThruFields ? 'Y' : 'N');
      fileInput.setAttribute('acceptingField', form.acceptingField);
      fileInput.setAttribute('acceptingStepName', form.acceptingStepName);

      // 内容选项卡
      fileInput.setAttribute('fileType', form.fileType);
      fileInput.setAttribute('separator', form.separator);
      fileInput.setAttribute('enclosure', form.enclosure);
      fileInput.setAttribute('breakInEnclosureAllowed', form.breakInEnclosureAllowed ? 'Y' : 'N');
      fileInput.setAttribute('escapeCharacter', form.escapeCharacter);
      fileInput.setAttribute('header', form.header ? 'Y' : 'N');
      fileInput.setAttribute('nrHeaderLines', form.nrHeaderLines.toString());
      fileInput.setAttribute('footer', form.footer ? 'Y' : 'N');
      fileInput.setAttribute('nrFooterLines', form.nrFooterLines.toString());
      fileInput.setAttribute('lineWrapped', form.lineWrapped ? 'Y' : 'N');
      fileInput.setAttribute('nrWraps', form.nrWraps.toString());
      fileInput.setAttribute('layoutPaged', form.layoutPaged ? 'Y' : 'N');
      fileInput.setAttribute('nrLinesPerPage', form.nrLinesPerPage.toString());
      fileInput.setAttribute('nrLinesDocHeader', form.nrLinesDocHeader.toString());
      fileInput.setAttribute('fileCompression', form.fileCompression);
      fileInput.setAttribute('noEmptyLines', form.noEmptyLines ? 'Y' : 'N');
      fileInput.setAttribute('includeFilename', form.includeFilename ? 'Y' : 'N');
      fileInput.setAttribute('fieldNamesFieldName', form.fieldNamesFieldName);
      fileInput.setAttribute('includeRowNumber', form.includeRowNumber ? 'Y' : 'N');
      fileInput.setAttribute('rowNumberField', form.rowNumberField);
      fileInput.setAttribute('rowNumberByFile', form.rowNumberByFile ? 'Y' : 'N');
      fileInput.setAttribute('fileFormat', form.fileFormat);
      fileInput.setAttribute('encoding', form.encoding);
      fileInput.setAttribute('rowLimit', form.rowLimit.toString());
      fileInput.setAttribute('dateFormatLenient', form.dateFormatLenient ? 'Y' : 'N');
      fileInput.setAttribute('dateFormatLocale', form.dateFormatLocale);
      fileInput.setAttribute('addToResultFilenames', form.addresult ? 'Y' : 'N');
      // 字段
      fileInput.setAttribute('inputFields', form.field);
      // 过滤
      fileInput.setAttribute('filter', form.filter);
      // 错误处理选项卡
      fileInput.setAttribute('errorIgnored', form.errorIgnored ? 'Y' : 'N');
      fileInput.setAttribute('skipBadFiles', form.skipBadFiles ? 'Y' : 'N');
      fileInput.setAttribute('fileErrorField', form.fileErrorField);
      fileInput.setAttribute('fileErrorMessageField', form.fileErrorMessageField);
      fileInput.setAttribute('errorLineSkipped', form.errorLineSkipped ? 'Y' : 'N');
      fileInput.setAttribute('errorCountField', form.errorCountField);
      fileInput.setAttribute('errorFieldsField', form.errorFieldsField);
      fileInput.setAttribute('errorTextField', form.errorTextField);
      fileInput.setAttribute('warningFilesDestinationDirectory', form.warningFilesDestinationDirectory);
      fileInput.setAttribute('warningFilesExtension', form.warningFilesExtension);
      fileInput.setAttribute('errorFilesDestinationDirectory', form.errorFilesDestinationDirectory);
      fileInput.setAttribute('errorFilesExtension', form.errorFilesExtension);
      fileInput.setAttribute('lineNumberFilesDestinationDirectory', form.lineNumberFilesDestinationDirectory);
      fileInput.setAttribute('lineNumberFilesExtension', form.lineNumberFilesExtension);

      // 其他输出字段
      fileInput.setAttribute('shortFilenameField', form.shortFilenameField);
      fileInput.setAttribute('extensionField', form.extensionField);
      fileInput.setAttribute('pathField', form.pathField);
      fileInput.setAttribute('sizeField', form.sizeField);
      fileInput.setAttribute('hiddenField', form.hiddenField);
      fileInput.setAttribute('lastModificationField', form.lastModificationField);
      fileInput.setAttribute('uriField', form.uriField);
      fileInput.setAttribute('rootUriField', form.rootUriField);

      // 返回更新后的XML
      return mxUtils.getPrettyXml(fileInput);
    }

    return stepInfoXml; // 如果没有找到step元素，返回原始XML
  } catch (error) {
    console.error('更新stepInfo XML失败:', error);
    ElMessage.error("更新stepInfo XML数据失败");
    return stepInfoXml;
  }
}

const handleConfirm = () => {
  if (currentCell && currentGraph && currentXml) {
    // 更新节点名称
    currentGraph.getModel().setValue(currentCell, form.stepName);

    // 更新节点的 step（XML结构）
    currentXml = updateStepInfoXml(currentXml);
    console.log("currentXml", currentXml);
    // 将更新后的 XML 数据传递回父组件
    emit('update-step', {
      cell: currentCell,
      updatedXml: currentXml
    });
  }
  dialogVisible.value = false
}


const stepName = ref('')
const fieldParentFunction = async (data) => {
  let params = {
    stepName: stepName.value,
    graphXml: allXml,
    before: true
  };
  let res = await inputOutputFields(params);
  nextTick(() => {
    form.field = res;
  })
}

const fileDataColumns = computed(() => [
  { prop: 'fileName', label: '文件/目录' },
  { prop: 'filemask', label: '通配符' },
  { prop: 'excludeFileMask', label: '通配符号(排除)' },
  { prop: 'fileRequired', label: '要求' },
  { prop: 'includeSubFolders', label: '包含子目录' },
]);


// 模拟添加文件和浏览文件的功能
const addFile = () => {
  if (fileTableRef.value) {
    fileTableRef.value.addRow();
  }
};

const fileType = ref("")
const browseFile = (data) => {
  showFileExplorer.value = true
  fileType.value = data
};

const handleFileSelected = (path) => {
  switch (fileType.value) {
    case 'file':
      form.name = path + form.name
      break;
    case 'lineNumberFilesDestinationDirectory':
      form.lineNumberFilesDestinationDirectory = path
      break;
    case 'errorFilesDestinationDirectory':
      form.errorFilesDestinationDirectory = path
      break;
    case 'warningFilesDestinationDirectory':
      form.warningFilesDestinationDirectory = path
      break;
    default:
      break;
  }
};

const handleGetFromFileStepChange = (val) => {
  fileTableRef.value.toggleEdit(val)
}

const insertTab = () => {
  form.separator = '\t' + form.separator
}

const getLineTerminatorOptions = () => {
  systemFormatMapperLineTerminator({}).then(res => {
    lineTerminatorOptions.value = res
  })
}

const getAvailableCharsets = () => {
  systemAvailableCharsets({}).then(res => {
    charsetOptionList.value = res
  })
}

// 处理tab点击事件
const handleTabClick = (tab) => {
  console.log(tab.paneName);
  if (tab.paneName == 'content') {
    getLineTerminatorOptions()
    getAvailableCharsets()
  }
}

const filterDataColumns = computed(() => [
  { prop: 'filterString', label: '过滤器字符串' },
  { prop: 'filterPosition', label: '过滤器位置' },
  { prop: 'filterLastLine', label: '停止在过滤器' },
  { prop: 'filterPositive', label: '积极匹配' },
]);

const defaultFilterDataRow = ref({
  filterString: '',
  filterPosition: '',
  filterLastLine: '',
  filterPositive: '',
})

const fieldDataColumns = computed(() => [
  { prop: "name", label: "名称", width: 120 },
  {
    prop: "type",
    label: "类型",
    type: "select",
    options: valueMetaList.value,
    valueKey: "name",
    labelKey: "name",
    width: 120
  },
  {
    prop: "format",
    label: "格式",
    type: "select",
    options: valueFormatList.value,
    valueKey: "name",
    labelKey: "name",
    width: 200
  },
  { prop: "length", label: "长度", width: 120 },
  { prop: "precision", label: "精度", width: 120 },
  { prop: "currencyType", label: "货币", width: 120 },
  { prop: "decimal", label: "小数", width: 120 },
  { prop: "group", label: "分组", width: 120 },
  { prop: "nullif", label: "Null if", width: 120 },
  { prop: "ifnull", label: "默认", width: 120 },
  {
    prop: "nullable",
    label: "去除空字符串方式",
    type: "select",
    options: [{ name: "不去掉空格" }, { name: "去掉左空格" }, { name: "去掉右空格" }, { name: "去掉左右两端空格" }],
    valueKey: "name",
    labelKey: "name",
    width: 200
  },
  { prop: "repeat", label: "重复", width: 120 },

]);



const defaultFieldDataRow = ref({
  fieldName: '',
  fieldType: '',
  fieldLength: '',
  fieldPrecision: '',
})

const getvalueMeta = async () => {
  let res = await valueMeta({});
  valueMetaList.value = res;
};
const getvalueFormat = async () => {
  let res = await valueFormat({ valueType: 'all' });
  valueFormatList.value = res;
}



// 暴露方法给父组件使用
defineExpose({
  openDialog,
});
</script>


<style lang="scss" scoped>
:deep(.el-form-item) {
  margin: 10px 30px !important;
}

.dialog-content-wrapper {
  height: 550px;
  overflow-y: auto;
}

.tabItem {
  margin-top: 10px;

  :deep(.el-tabs__content) {
    font-size: 14px;
    padding: 0 !important;
  }

  :deep(.el-tab-pane) {
    font-size: 14px;
  }

  :deep(.el-form-item__label) {
    font-size: 14px !important;
  }

  :deep(.el-button) {
    font-size: 14px;
  }

  :deep(.el-table .el-table__cell) {
    font-size: 14px !important;
  }

  :deep(.el-table th.el-table__cell) {
    font-size: 14px !important;
    font-weight: bold;
  }

  :deep(.el-checkbox) {
    font-size: 14px;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
  }

  :deep(.el-checkbox.is-disabled) {
    background: none !important;
  }

  .checkbox-input-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .checkbox-wrapper {
    display: flex;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    margin-left: 20px;
  }

  .input-label {
    margin-right: 10px;
    white-space: nowrap;
  }

  .flex-input {
    flex: 1;
  }

  .flex-input-number {
    flex: 1;
  }

  .flex-input-number.short {
    flex: 0.5;
  }
}
</style>