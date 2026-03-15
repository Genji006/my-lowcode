// 所有 kettle 工具组件的集中配置
import { ref } from 'vue';

// 导入所有组件
import excelInput from "./formItems/input/excelInput.vue";
import randomValue from "./formItems/input/randomValue.vue";
import fileInput from "./formItems/input/fileInput.vue";
import dataGrid from "./formItems/input/dataGrid.vue";
import tableInput from "./formItems/input/tableInput.vue";
import systemInfoInput from "./formItems/input/systemInfoInput.vue";
import transInfo from "./formItems/transInfo.vue";
import ExcelOutput from "./formItems/output/excelOutput.vue";
import dataBaseInfo from "./formItems/tools/dataBaseInfo.vue";
import dataBaseSetting from "./formItems/tools/dataBaseSetting.vue";
import tableOutput from "./formItems/output/tableOutput.vue";
import rowGenerator from "./formItems/input/rowGenerator.vue";
import SQLFileOutput from "./formItems/output/sqlOutput.vue";
import DeleteOut from "./formItems/output/deleteOut.vue";
import insertOrupdate from "./formItems/output/insertOrupdate.vue";
import SynchronizeAfterMerge from "./formItems/output/SynchronizeAfterMerge.vue";
import fileOutput from "./formItems/output/fileOutput.vue";
import update from "./formItems/output/update.vue";
import valueMapper from "./formItems/trans/valueMapper.vue";
import Denormaliser from "./formItems/trans/denOrMaliser.vue";
import stringCut from "./formItems/trans/stringCut.vue";
import Unique from "./formItems/trans/uniqueRows.vue";
import constant from "./formItems/trans/constant.vue";
import sequence from "./formItems/trans/sequence.vue";
import flattenTheLines from "./formItems/trans/flattenTheLines.vue";
import rowtoColumn from "./formItems/trans/rowtoColumn.vue";
import checkSum from "./formItems/trans/checkSum.vue";
import sortRows from "./formItems/trans/sortRows.vue";
import selectValues from "./formItems/trans/selectValues.vue";
import replaceString from "./formItems/trans/replaceString.vue";
import WriteToLog from "./formItems/app/writeToLog.vue";
import SwitchCase from "./formItems/process/switchCase.vue";
import dummy from "./formItems/process/dummy.vue";
import javaFilter from "./formItems/process/javaFilter.vue";
import append from "./formItems/process/append.vue";
import filterRows from "./formItems/process/filterRows.vue";
import javaScript from "./formItems/script/javaScript.vue";
import waitForSteps from "./formItems/process/waitForSteps.vue";
import setFieldValue from "./formItems/process/setFieldValue.vue";

import multiwayMergeJoin from "./formItems/connection/multiwayMergeJoin.vue";
import mergeRows from "./formItems/connection/mergeRows.vue";
import sortedMerge from "./formItems/connection/sortedMerge.vue";
import joinRows from "./formItems/connection/joinRows.vue";
import mergeJoin from "./formItems/connection/mergeJoin.vue";

import sampleRows from "./formItems/statistical/sampleRows.vue";

import filesFromResult from "./formItems/work/filesFromResult.vue";
import rowsFromResult from "./formItems/work/rowsFromResult.vue";
import rowsToResult from "./formItems/work/rowsToResult.vue";
import getVariable from "./formItems/work/getVariable.vue";
import setVariable from "./formItems/work/setVariable.vue";
import execSQL from "./formItems/script/execSQL.vue";
import ExecutionResult from "./formItems/tools/ExecutionResult.vue";
import checkStep from "./formItems/tools/checkStep.vue";
import runConfig from "./formItems/tools/runConfig.vue";
import clusterSchemas from "./formItems/tools/clusterSchemas.vue";
import partitionSchemas from './formItems/tools/partitionSchemas.vue';
import groupBy from './formItems/statistical/groupBy.vue';

import getSQL from "./formItems/tools/getSQL.vue";
import hadoop from "./formItems/tools/hadoop.vue";
import preview from "./formItems/tools/preview.vue";
import previewData from "./formItems/tools/previewData.vue";


import start from "./jobItems/universal/start.vue";
import job from "./jobItems/universal/job.vue";
import trans from "./jobItems/universal/trans.vue";
import setJobVariable from "./jobItems/universal/setVariable.vue";
import writeToFile from "./jobItems/fileMa/writeToFile.vue";
import createFolder from "./jobItems/fileMa/createFolder.vue";
import createFile from "./jobItems/fileMa/createFile.vue";
import deleteFile from "./jobItems/fileMa/deleteFile.vue";
import deleteFolders from "./jobItems/fileMa/deleteFolders.vue";
import waitForFile from "./jobItems/fileMa/waitForFile.vue";
import fileExists from "./jobItems/condition/fileExists.vue";
import columnsExist from "./jobItems/condition/columnsExist.vue";
import checkDbConnections from "./jobItems/condition/checkDbConnections.vue";
import tableExists from "./jobItems/condition/tableExists.vue";
import simpleEval from "./jobItems/condition/simpleEval.vue";
import delay from "./jobItems/condition/delay.vue";
import evalTableContent from "./jobItems/condition/evalTableContent.vue";
import sqlQuery from "./jobItems/jobScript/sqlQuery.vue";
import shellScript from "./jobItems/jobScript/shellScript.vue";
import evalScript from "./jobItems/jobScript/evalScript.vue";
import waitForSql from "./jobItems/ItemsApp/waitForSql.vue";
import ftpUpload from "./jobItems/ItemsFileTr/ftpUpload.vue";
import ftpDownload from "./jobItems/ItemsFileTr/ftpDownload.vue";
import ftpDelete from "./jobItems/ItemsFileTr/ftpDelete.vue";
import ftpsUpload from "./jobItems/ItemsFileTr/ftpsUpload.vue";
import sftpUpload from "./jobItems/ItemsFileTr/sftpUpload.vue";
import sftpDownload from "./jobItems/ItemsFileTr/sftpDownload.vue";
import runJobConfig from "./jobItems/runJobConfig.vue";
import jobExcuResult from "./jobItems/jobExcuResult.vue";


// 组件配置列表
// update-step:更新、保存步骤
// editDataBaseSetting:编辑数据库连接
// addDataBaseSetting:添加数据库连接
export const componentList = [
    // 输入组件
    {
        name: 'Excel输入',
        component: excelInput,
        refName: 'excelInputDialog',
        pluginId: 'ExcelInput',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '表输入',
        component: tableInput,
        refName: 'tableInputDialog',
        pluginId: 'TableInput',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: '文本文件输入',
        component: fileInput,
        refName: 'textFileInputDialog',
        pluginId: 'TextFileInput',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '获取系统信息',
        component: systemInfoInput,
        refName: 'systemInfoInputDialog',
        pluginId: 'SystemInfo',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '生成随机数',
        component: randomValue,
        refName: 'randomValueDialog',
        pluginId: 'RandomValue',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '自定义常量数据',
        component: dataGrid,
        refName: 'dataGridDialog',
        pluginId: 'DataGrid',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '生成记录',
        component: rowGenerator,
        refName: 'rowGeneratorDialog',
        pluginId: 'RowGenerator',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },

    // 输出组件
    {
        name: 'Excel输出',
        component: ExcelOutput,
        refName: 'excelOutputDialog',
        pluginId: 'ExcelOutput',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '表输出',
        component: tableOutput,
        refName: 'tableOutputDialog',
        pluginId: 'TableOutput',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: 'SQL文件输出',
        component: SQLFileOutput,
        refName: 'sqlFileOutputDialog',
        pluginId: 'SQLFileOutput',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: '删除',
        component: DeleteOut,
        refName: 'deleteOutDialog',
        pluginId: 'Delete',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: '插入/更新',
        component: insertOrupdate,
        refName: 'insertOrupdateDialog',
        pluginId: 'InsertUpdate',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: '数据同步',
        component: SynchronizeAfterMerge,
        refName: 'SynchronizeAfterMergeDialog',
        pluginId: 'SynchronizeAfterMerge',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: '文本文件输出',
        component: fileOutput,
        refName: 'fileOutputDialog',
        pluginId: 'TextFileOutput',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '更新',
        component: update,
        refName: 'updateDialog',
        pluginId: 'Update',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },

    // 转换组件
    {
        name: '值映射',
        component: valueMapper,
        refName: 'valueMapperDialog',
        pluginId: 'ValueMapper',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '列转行',
        component: Denormaliser,
        refName: 'DenormaliserDialog',
        pluginId: 'Denormaliser',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '剪切字符串',
        component: stringCut,
        refName: 'stringCutDialog',
        pluginId: 'StringCut',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '去除重复记录',
        component: Unique,
        refName: 'uniqueRowsDialog',
        pluginId: 'Unique',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '增加常量',
        component: constant,
        refName: 'constantDialog',
        pluginId: 'Constant',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '增加序列',
        component: sequence,
        refName: 'sequenceDialog',
        pluginId: 'Sequence',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: '行扁平化',
        component: flattenTheLines,
        refName: 'flattenTheLinesDialog',
        pluginId: 'Flattener',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '行转列',
        component: rowtoColumn,
        refName: 'rowtoColumnDialog',
        pluginId: 'Normaliser',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '增加校验列',
        component: checkSum,
        refName: 'CheckSum',
        pluginId: 'CheckSum',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '排序记录',
        component: sortRows,
        refName: 'sortRowsDialog',
        pluginId: 'SortRows',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '字段选择',
        component: selectValues,
        refName: 'selectValuesDialog',
        pluginId: 'SelectValues',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '字符串替换',
        component: replaceString,
        refName: 'replaceStringDialog',
        pluginId: 'ReplaceString',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },

    // 应用
    {
        name: '写日志',
        component: WriteToLog,
        refName: 'WriteToLogDialog',
        pluginId: 'WriteToLog',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },

    // 流程组件
    {
        name: 'Switch / Case',
        component: SwitchCase,
        refName: 'SwitchCaseDialog',
        pluginId: 'SwitchCase',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '根据Java代码过滤记录',
        component: javaFilter,
        refName: 'javaFilterDialog',
        pluginId: 'JavaFilter',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "空操作（什么也不做）",
        component: dummy,
        refName: 'dummyDialog',
        pluginId: 'Dummy',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '追加流',
        component: append,
        refName: 'appendDialog',
        pluginId: 'Append',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },



    // 工具组件
    {
        name: 'transInfo',
        component: transInfo,
        refName: 'transInfoDialog',
        listeners: {}
    },
    {
        name: 'ExecutionResult',
        component: ExecutionResult,
        refName: 'ExecutionResultDialog',
        listeners: {}
    },
    {
        name: '校验',
        component: checkStep,
        refName: 'checkStepDialog',
        listeners: {}
    },
    {
        name: 'runConfig',
        component: runConfig,
        refName: 'runConfigDialog',
        listeners: {
            'update-step': 'configRun'
        }
    },
    {
        name: 'clusterSchemas',
        component: clusterSchemas,
        refName: 'clusterSchemasDialog',
        listeners: {}
    },
    {
        name: 'getSQL',
        component: getSQL,
        refName: 'getSQLDialog',
        listeners: {}
    },
    {
        name: 'hadoop',
        component: hadoop,
        refName: 'hadoopDialog',
        listeners: {}
    },
    {
        name: 'preview',
        component: preview,
        refName: 'previewDialog',
        listeners: {
            'run': 'runPreview'
        }
    },
    {
        name: 'previewData',
        component: previewData,
        refName: 'previewDataDialog',
        listeners: {}
    },
    {
        name: 'partitionSchemas',
        component: partitionSchemas,
        refName: 'partitionSchemasDialog',
        listeners: {}
    },
    {
        name: 'dataBaseInfo',
        component: dataBaseInfo,
        refName: 'dataBaseInfoDialog',
        listeners: {
            'add': 'handleBaseAdd',
            'update': 'handleBaseUpdate'
        }
    },
    {
        name: 'dataBaseSetting',
        component: dataBaseSetting,
        refName: 'dataBaseSettingDialog',
        listeners: {
            'save': 'dataBaseSave'
        }
    },
    {
        name: '过滤记录',
        component: filterRows,
        refName: 'filterRowsDialog',
        pluginId: 'FilterRows',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "JavaScript代码",
        component: javaScript,
        refName: 'javaScriptDialog',
        pluginId: 'ScriptValueMod',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "执行SQL脚本",
        component: execSQL,
        refName: 'execSQLDialog',
        pluginId: 'ExecSQL',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },

    // 连接组件

    {
        name: "Multiway Merge Join",
        component: multiwayMergeJoin,
        refName: 'multiwayMergeJoinDialog',
        pluginId: 'MultiwayMergeJoin',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "合并记录",
        component: mergeRows,
        refName: 'mergeRowsDialog',
        pluginId: 'MergeRows',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "排序合并",
        component: sortedMerge,
        refName: 'sortedMergeDialog',
        pluginId: 'SortedMerge',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "记录关联 (笛卡尔输出)",
        component: joinRows,
        refName: 'joinRowsDialog',
        pluginId: 'JoinRows',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "记录集连接",
        component: mergeJoin,
        refName: 'mergeJoinDialog',
        pluginId: 'MergeJoin',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },

    // 统计组件
    {
        name: "行样本",
        component: sampleRows,
        refName: 'sampleRowsDialog',
        pluginId: 'SampleRows',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },

    // 作业文件
    {
        name: "从结果获取文件",
        component: filesFromResult,
        refName: 'filesFromResultDialog',
        pluginId: 'FilesFromResult',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "从结果获取记录",
        component: rowsFromResult,
        refName: 'rowsFromResultDialog',
        pluginId: 'RowsFromResult',
        listeners: {
            'update-step': 'handleStepUpdate'
        },
    },
    {
        name: "复制记录到结果",
        component: rowsToResult,
        refName: 'rowsToResultDialog',
        pluginId: 'RowsToResult',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "获取变量",
        component: getVariable,
        refName: 'getVariableDialog',
        pluginId: 'GetVariable',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "设置变量",
        component: setVariable,
        refName: 'setVariableDialog',
        pluginId: 'SetVariable',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },




    // 作业模块
    // 通用
    {
        name: "START",
        component: start,
        refName: 'startDialog',
        pluginId: 'SPECIAL',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "作业",
        component: job,
        refName: 'jobDialog',
        pluginId: 'Job',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '转换',
        component: trans,
        refName: 'transDialog',
        pluginId: 'TRANS',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '变量设置',
        component: setJobVariable,
        refName: 'setJobVariableDialog',
        pluginId: 'SET_VARIABLES',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '写入文件',
        component: writeToFile,
        refName: 'writeToFileDialog',
        pluginId: 'WRITE_TO_FILE',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: '创建一个目录',
        component: createFolder,
        refName: 'createFolderDialog',
        pluginId: 'CREATE_FOLDER',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "创建文件",
        component: createFile,
        refName: 'createFileDialog',
        pluginId: 'CREATE_FILE',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "删除一个文件",
        component: deleteFile,
        refName: 'deleteFileDialog',
        pluginId: 'DELETE_FILE',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "删除目录",
        component: deleteFolders,
        refName: 'deleteFoldersDialog',
        pluginId: 'DELETE_FOLDERS',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "等待文件",
        component: waitForFile,
        refName: 'waitForFileDialog',
        pluginId: 'WAIT_FOR_FILE',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "检查一个文件是否存在",
        component: fileExists,
        refName: 'fileExistsDialog',
        pluginId: 'FILE_EXISTS',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "检查列是否存在",
        component: columnsExist,
        refName: 'columnsExistDialog',
        pluginId: 'COLUMNS_EXIST',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: "检查数据库连接",
        component: checkDbConnections,
        refName: 'checkDbConnectionsDialog',
        pluginId: 'CHECK_DB_CONNECTIONS',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "检查表是否存在",
        component: tableExists,
        refName: 'tableExistsDialog',
        pluginId: 'TABLE_EXISTS',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: "检验字段的值",
        component: simpleEval,
        refName: 'simpleEvalDialog',
        pluginId: 'SIMPLE_EVAL',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "等待",
        component: delay,
        refName: 'delayDialog',
        pluginId: 'DELAY',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "计算表中的记录数",
        component: evalTableContent,
        refName: 'evalTableContentDialog',
        pluginId: 'EVAL_TABLE_CONTENT',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: "SQL",
        component: sqlQuery,
        refName: 'sqlQueryDialog',
        pluginId: 'SQL',
        listeners: {
            'update-step': 'handleStepUpdate',
            'editDataBaseSetting': 'handleBaseUpdate',
            'addDataBaseSetting': 'handleBaseAdd'
        }
    },
    {
        name: "执行一个Shell脚本",
        component: shellScript,
        refName: 'shellScriptDialog',
        pluginId: 'SHELL',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "使用JavaScript脚本验证",
        component: evalScript,
        refName: 'evalScriptDialog',
        pluginId: 'EVAL',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "等待SQL",
        component: waitForSql,
        refName: 'waitForSqlDialog',
        pluginId: 'WAIT_FOR_SQL',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "FTP上传",
        component: ftpUpload,
        refName: 'ftpUploadDialog',
        pluginId: 'FTP_PUT',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "FTP下载",
        component: ftpDownload,
        refName: 'ftpDownloadDialog',
        pluginId: 'FTP',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "阻塞数据直到步骤都完成",
        component: waitForSteps,
        refName: 'waitForStepsDialog',
        pluginId: 'BlockUntilStepsFinish',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "设置字段值",
        component: setFieldValue,
        refName: 'setFieldValueDialog',
        pluginId: 'SetValueField',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "FTP删除",
        component: ftpDelete,
        refName: 'ftpDeleteDialog',
        pluginId: 'FTP_DELETE',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "FTPS上传",
        component: ftpsUpload,
        refName: 'ftpsUploadDialog',
        pluginId: 'FTPS_PUT',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "SFTP上传",
        component: sftpUpload,
        refName: 'sftpUploadDialog',
        pluginId: 'SFTPPUT',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: "SFTP下载",
        component: sftpDownload,
        refName: 'sftpDownloadDialog',
        pluginId: 'SFTP',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
    {
        name: 'runJobConfig',
        component: runJobConfig,
        refName: 'runJobConfigDialog',
        listeners: {
            'update-step': 'configRun'
        }
    },
    {
        name: 'jobExcuResult',
        component: jobExcuResult,
        refName: 'jobExcuResultDialog',
        listeners: {}
    },
    {
        name: '分组',
        component: groupBy,
        refName: 'groupByDialog',
        pluginId: 'GroupBy',
        listeners: {
            'update-step': 'handleStepUpdate'
        }
    },
];

// 输入项配置
export const ItemsIn = [
    {
        name: "Excel输入",
        image: "/src/assets/ItemImg/excel.svg",
        pluginId: "ExcelInput",
    },
    {
        name: '文本文件输入',
        image: '/src/assets/ItemImg/word.svg',
        pluginId: "TextFileInput"
    },
    {
        name: '生成记录',
        image: '/src/assets/ItemImg/log.svg',
        pluginId: "RowGenerator"
    },
    {
        name: "生成随机数",
        image: "/src/assets/ItemImg/chart.svg",
        pluginId: "RandomValue",
    },
    {
        name: "自定义常量数据",
        image: "/src/assets/ItemImg/table.svg",
        pluginId: "DataGrid",
    },
    {
        name: "获取系统信息",
        image: "/src/assets/ItemImg/system.svg",
        pluginId: "SystemInfo",
    },
    {
        name: "表输入",
        image: "/src/assets/ItemImg/keyboard.svg",
        pluginId: "TableInput",
    },
];

// 输出项配置
export const ItemsOut = [
    {
        name: "Excel输出",
        image: "/src/assets/ItemImg/excel.svg",
        pluginId: "ExcelOutput",
    },
    {
        name: "SQL文件输出",
        image: "/src/assets/ItemImg/sql.svg",
        pluginId: "SQLFileOutput",
    },
    {
        name: "删除",
        image: "/src/assets/ItemImg/shanchured.svg",
        pluginId: "Delete",
    },
    {
        name: "插入/更新",
        image: "/src/assets/ItemImg/insertUpdate.svg",
        pluginId: "InsertUpdate",
    },
    {
        name: "数据同步",
        image: "/src/assets/ItemImg/synchronize.svg",
        pluginId: "SynchronizeAfterMerge",
    },
    {
        name: "文本文件输出",
        image: "/src/assets/ItemImg/textFileOut.svg",
        pluginId: "TextFileOutput",
    },
    {
        name: "更新",
        image: "/src/assets/ItemImg/update.svg",
        pluginId: "Update",
    },
    {
        name: "表输出",
        image: "/src/assets/ItemImg/keyboard.svg",
        pluginId: "TableOutput",
    },
];

// 转换项配置
export const ItemsTrans = [
    {
        name: "值映射",
        image: "/src/assets/ItemImg/excel.svg",
        pluginId: "ValueMapper",
    },
    {
        name: "列转行",
        image: "/src/assets/ItemImg/sql.svg",
        pluginId: "Denormaliser",
    },
    {
        name: "剪切字符串",
        image: "/src/assets/ItemImg/excel.svg",
        pluginId: "StringCut",
    },
    {
        name: "去除重复记录",
        image: "/src/assets/ItemImg/insertUpdate.svg",
        pluginId: "Unique",
    },
    {
        name: "增加常量",
        image: "/src/assets/ItemImg/system.svg",
        pluginId: "Constant",
    },
    {
        name: "增加序列",
        image: "/src/assets/ItemImg/keyboard.svg",
        pluginId: "Sequence",
    },
    {
        name: "增加校验列",
        image: "/src/assets/ItemImg/textFileOut.svg",
        pluginId: "CheckSum",
    },
    {
        name: "字段选择",
        image: "/src/assets/ItemImg/chart.svg",
        pluginId: "SelectValues",
    },
    {
        name: "字符串替换",
        image: "/src/assets/ItemImg/synchronize.svg",
        pluginId: "ReplaceString",
    },
    {
        name: "排序记录",
        image: "/src/assets/ItemImg/textFileOut.svg",
        pluginId: "SortRows",
    },
    {
        name: "行扁平化",
        image: "/src/assets/ItemImg/update.svg",
        pluginId: "Flattener",
    },
    {
        name: "行转列",
        image: "/src/assets/ItemImg/antOutline.svg",
        pluginId: "Normaliser",
    },
    {
        name: "设置字段值",
        image: "/src/assets/ItemImg/chart.svg",
        pluginId: "SetValueField",
    }
];

// 应用项配置
export const ItemsApps = [
    {
        name: "写日志",
        image: "/src/assets/ItemImg/log.svg",
        pluginId: "WriteToLog",
    },
]

// 流程项配置
export const ItemsProcess = [
    {
        name: "Switch / Case",
        image: "/src/assets/ItemImg/switch.svg",
        pluginId: "SwitchCase",
    },
    {
        name: '根据Java代码过滤记录',
        image: '/src/assets/ItemImg/insertUpdate.svg',
        pluginId: "JavaFilter",
    },
    {
        name: "空操作（什么也不做）",
        image: "/src/assets/ItemImg/textFileOut.svg",
        pluginId: "Dummy",
    },
    {
        name: '追加流',
        image: '/src/assets/ItemImg/antOutline.svg',
        pluginId: "Append",
    },
    {
        name: '过滤记录',
        image: '/src/assets/ItemImg/update.svg',
        pluginId: "FilterRows",
    },
    {
        name: "阻塞数据直到步骤都完成",
        image: "/src/assets/ItemImg/waitForFile.svg",
        pluginId: "BlockUntilStepsFinish",
    },
]

// 脚本项配置
export const ItemsScript = [
    {
        name: "JavaScript代码",
        image: "/src/assets/ItemImg/switch.svg",
        pluginId: "ScriptValueMod",
    },
    {
        name: "执行SQL脚本",
        image: "/src/assets/ItemImg/insertUpdate.svg",
        pluginId: "ExecSQL",
    }
]

// 连接配置
export const ItemsConnection = [
    {
        name: "Multiway Merge Join",
        image: "/src/assets/ItemImg/switch.svg",
        pluginId: "MultiwayMergeJoin",
    },
    {
        name: "合并记录",
        image: "/src/assets/ItemImg/insertUpdate.svg",
        pluginId: "MergeRows",
    },
    {
        name: "排序合并",
        image: "/src/assets/ItemImg/textFileOut.svg",
        pluginId: "SortedMerge",
    },
    {
        name: "记录关联 (笛卡尔输出)",
        image: "/src/assets/ItemImg/insertUpdate.svg",
        pluginId: "JoinRows",
    },
    {
        name: "记录集连接",
        image: "/src/assets/ItemImg/antOutline.svg",
        pluginId: "MergeJoin",
    },
]

// 统计配置
export const ItemsStatistical = [
    {
        name: "行样本",
        image: "/src/assets/ItemImg/switch.svg",
        pluginId: "SampleRows",
    },
    {
        name: "分组",
        image: "/src/assets/ItemImg/insertUpdate.svg",
        pluginId: "GroupBy",
    },
]

// 作业配置
export const ItemsWork = [
    {
        name: "从结果获取文件",
        image: "/src/assets/ItemImg/switch.svg",
        pluginId: "FilesFromResult",
    },
    {
        name: "从结果获取记录",
        image: "/src/assets/ItemImg/insertUpdate.svg",
        pluginId: "RowsFromResult",
    },
    {
        name: "复制记录到结果",
        image: "/src/assets/ItemImg/textFileOut.svg",
        pluginId: "RowsToResult",
    },
    {
        name: '获取变量',
        image: '/src/assets/ItemImg/update.svg',
        pluginId: "GetVariable",
    },
    {
        name: '设置变量',
        image: '/src/assets/ItemImg/antOutline.svg',
        pluginId: "SetVariable",
    }
]






// 作业模块
// 通用配置
export const ItemsUniversal = [
    {
        name: "START",
        image: "/src/assets/ItemImg/START.svg",
        pluginId: "SPECIAL",
    },
    {
        name: "DUMMY",
        image: "/src/assets/ItemImg/DUMMY.svg",
        pluginId: "SPECIAL",
    },
    {
        name: "作业",
        image: "/src/assets/ItemImg/job.svg",
        pluginId: "JOB",
    },
    {
        name: '成功',
        image: "/src/assets/ItemImg/success.svg",
        pluginId: "SUCCESS",
    },
    {
        name: "变量设置",
        image: "/src/assets/ItemImg/paramSet.svg",
        pluginId: "SET_VARIABLES",
    },
    {
        name: "转换",
        image: "/src/assets/ItemImg/trans.svg",
        pluginId: "TRANS",
    },
]

export const ItemsFileMa = [
    {
        name: "写入文件",
        image: "/src/assets/ItemImg/excel.svg",
        pluginId: "WRITE_TO_FILE",
    },
    {
        name: "创建一个目录",
        image: "/src/assets/ItemImg/createFolder.svg",
        pluginId: "CREATE_FOLDER",
    },
    {
        name: "创建文件",
        image: "/src/assets/ItemImg/createFile.svg",
        pluginId: "CREATE_FILE",
    },
    {
        name: "删除一个文件",
        image: "/src/assets/ItemImg/deleteFile.svg",
        pluginId: "DELETE_FILE",
    },
    {
        name: "删除目录",
        image: "/src/assets/ItemImg/deleteFolders.svg",
        pluginId: "DELETE_FOLDERS",
    },
    {
        name: "等待文件",
        image: "/src/assets/ItemImg/waitForFile.svg",
        pluginId: "WAIT_FOR_FILE",
    },
];

export const ItemsCondition = [
    {
        name: "检查一个文件是否存在",
        image: "/src/assets/ItemImg/excel.svg",
        pluginId: "FILE_EXISTS",
    },
    {
        name: "检查列是否存在",
        image: "/src/assets/ItemImg/sql.svg",
        pluginId: "COLUMNS_EXIST",
    },
    {
        name: "检查数据库连接",
        image: "/src/assets/ItemImg/synchronize.svg",
        pluginId: "CHECK_DB_CONNECTIONS",
    },
    {
        name: "检查表是否存在",
        image: "/src/assets/ItemImg/table.svg",
        pluginId: "TABLE_EXISTS",
    },
    {
        name: "检验字段的值",
        image: "/src/assets/ItemImg/insertUpdate.svg",
        pluginId: "SIMPLE_EVAL",
    },
    {
        name: "等待",
        image: "/src/assets/ItemImg/keyboard.svg",
        pluginId: "DELAY",
    },
    {
        name: "计算表中的记录数",
        image: "/src/assets/ItemImg/textFileOut.svg",
        pluginId: "EVAL_TABLE_CONTENT",
    },
];

export const JobScript = [
    {
        name: "SQL",
        image: "/src/assets/ItemImg/synchronize.svg",
        pluginId: "SQL",
    },
    {
        name: "执行一个Shell脚本",
        image: "/src/assets/ItemImg/word.svg",
        pluginId: "SHELL",
    },
    {
        name: "使用JavaScript脚本验证",
        image: "/src/assets/ItemImg/switch.svg",
        pluginId: "EVAL",
    }
];

export const ItemsApp = [
    {
        name: "等待SQL",
        image: "/src/assets/ItemImg/paramSet.svg",
        pluginId: "WAIT_FOR_SQL",
    },
];

export const ItemsFileTr = [
    {
        name: "FTP上传",
        image: "/src/assets/ItemImg/word.svg",
        pluginId: "FTP_PUT",
    },
    {
        name: "FTP下载",
        image: "/src/assets/ItemImg/word.svg",
        pluginId: "FTP",
    },
    {
        name: "FTP删除",
        image: "/src/assets/ItemImg/word.svg",
        pluginId: "FTP_DELETE",
    },
    {
        name: "FTPS上传",
        image: "/src/assets/ItemImg/word.svg",
        pluginId: "FTPS_PUT",
    },
    {
        name: "SFTP上传",
        image: "/src/assets/ItemImg/word.svg",
        pluginId: "SFTPPUT",
    },
    {
        name: "SFTP下载",
        image: "/src/assets/ItemImg/word.svg",
        pluginId: "SFTP",
    },
]






// 创建组件引用的工厂函数
export const createComponentRefs = () => {
    const refs = {};
    componentList.forEach(config => {
        refs[config.refName] = ref(null);
    });
    return refs;
};

// 获取事件处理器映射
export const getEventHandlers = (handlers) => {
    const eventMap = {};
    componentList.forEach(config => {
        if (config.listeners) {
            const listenerMap = {};
            Object.keys(config.listeners).forEach(event => {
                const handlerName = config.listeners[event];
                listenerMap[event] = handlers[handlerName];
            });
            eventMap[config.refName] = listenerMap;
        }
    });
    return eventMap;
};

/**
 * 根据节点类型打开相应的对话框
 * @param {Object} componentRefs - 包含所有组件引用的对象
 * @param {string} nodeType - 节点类型名称
 * @param {Object} dialogParams - 对话框参数
 */
export const openDialogByNodeType = (componentRefs, nodeType, dialogParams) => {
    // // 查找完全匹配的组件配置，优先匹配name字段，然后是pluginId字段
    // let matchedConfig = componentList.find(config => nodeType === config.name);

    // // 如果按name没有找到匹配项，则尝试使用pluginId进行匹配
    // if (!matchedConfig) {
    let matchedConfig = componentList.find(config => nodeType === config.pluginId);
    // }

    if (matchedConfig) {
        const dialogComponent = componentRefs[matchedConfig.refName];
        if (dialogComponent && typeof dialogComponent.openDialog === 'function') {
            dialogComponent.openDialog(dialogParams);
            return true;
        }
    }

    return false;
};