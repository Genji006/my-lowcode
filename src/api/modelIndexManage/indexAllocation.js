import http from "@/utils/request";

//  获取分析模型
export let listModel = (data) => http.post(`/business/ZbConfig/listModel`, { ...data });


//  指标查询
export let pageSearch = (data) => http.post(`/business/ZbConfig/pageList`, { ...data });


//  启用否，适用否
export let changeState = (data) => http.post(`/business/ZbConfig/changeState`, { ...data });

//  下拉选择选项
export let getZbType = (data) => http.post(`/business/zbglpzb/getZbType`, { ...data });

//  医院类别查询
export let distinguish = (data) => http.post(`/business/ZbConfig/distinguish`, { ...data });

//  新增指标
export let saveInfo = (data) => http.post(`/business/ZbConfig/saveInfo`, { ...data });

//  编辑指标
export let updateInfo = (data) => http.post(`/business/ZbConfig/updateInfo`, { ...data });

//  删除指标
export let deleteIndex = (data) => http.post(`/business/ZbConfig/delete`, { ...data });

//  还原指标
export let deleteRecover = (data) => http.post(`/business/ZbConfig/deleteRecover`, { ...data });

//  永久删除指标
export let deleteForce = (data) => http.post(`/business/ZbConfig/deleteForce`, { ...data });

//  生成编码
export let generateZbCode = (data) => http.post(`/business/ZbConfig/generateZbCode`, { ...data });

//  选择来源应用和分析模型
export let selectSourceApp = (data) => http.post(`/business/index/selectSourceApp`, { ...data });

//  父级指标
export let listFjzb = (data) => http.post(`/business/ZbConfig/listFjzb`, { ...data });

//  父级指标
export let listZb = (data) => http.post(`/business/zbglpzb/listZb`, { ...data });

//指标名称下拉选择
export let listZbDefine = (data) => http.post(`/business/ZbConfig/listZbDefine`, { ...data });

//责任科室下拉框
export let dptList = (data) => http.post(`/business/DEPTMAPINFO/dptList`, { ...data });