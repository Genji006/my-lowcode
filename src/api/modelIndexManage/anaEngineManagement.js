import http from "@/utils/request";

//  生成编码
export let genCode = (data) => http.post(`/business/dataAnalysisEngineInfo/genCode`, data);

// 关联模型
export let getAnalyticalModel = (data) => http.post(`/business/analyticalModel/page`, data);

// 新增引擎
export let insertEngine = (data) => http.post(`/business/dataAnalysisEngineInfo/insert`, data);

// 删除引擎
export let deleteEngine = (data) => http.post(`/business/dataAnalysisEngineInfo/delete`, data);

// 更新引擎
export let updateEngine = (data) => http.post(`/business/dataAnalysisEngineInfo/update`, data);

// 复制
export let copyDataAnalysisEngineInfo = (data) => http.post(`/business/dataAnalysisEngineInfo/copyDataAnalysisEngineInfo`, data);

// 执行引擎
export let analysisEngineExecute = (data) => http.post(`/business/dataAnalysisEngineInfo/analysisEngineExecute`, data);

// 日志查询
export let dataAnalysisEngineIndexLogDetail = (data) => http.post(`/business/dataAnalysisEngineLog/dataAnalysisEngineIndexLogDetail`, data);

// 日志查询
export let deleteLog = (data) => http.post(`/business/dataAnalysisEngineLog/delete`, data);

// 执行进度
export let analysisEngineExecuteDetail = (data) => http.post(`/business/dataAnalysisEngineLog/analysisEngineExecuteDetail`, data);

// 取消引擎
export let analysisEngineCancel = (data) => http.post(`/business/dataAnalysisEngineInfo/analysisEngineCancel`, data);
