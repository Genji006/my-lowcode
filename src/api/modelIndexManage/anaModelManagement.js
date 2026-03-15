import http from "@/utils/request";

//  生成编码
export let returnPinYin = (data) => http.post(`/business/analyticalModel/returnPinYin`, { ...data });

// 新增模型
export let insertFxmx = (data) => http.post(`/business/analyticalModel/insertFxmx`, data);

// 删除模型
export let deleteFxmx = (data) => http.post(`/business/analyticalModel/delete`, data);

// 编辑模型
export let updateFxmx = (data) => http.post(`/business/analyticalModel/update`, data);

// 复制模型
export let copyFxmx = (data) => http.post(`/business/analyticalModel/copyFxmx`, data);

// 查询关联条款组
export let listTermGroupUseInfo = (data) => http.post(`/business/analyticalModel/listTermGroupUseInfo`, data);

// 获取配置指标列表
export let listAllIndexWithTerm = (data) => http.post(`/business/ZbConfig/pageListInfo`, data);

// 保存配置指标
export let updateTermIndexRelation = (data) => http.post(`/business/analyticalModel/updateTermIndex`, data);

// 查询配置指标
export let listAllIndexWithModel = (data) => http.post(`/business/ZbConfig/modelIndexInfo`, data);

// 保存指标配置
export let updateIndexModelRelation = (data) => http.post(`/business/analyticalModel/updatemodelIndex`, data);

export let updateTk = (data) => http.post(`/business/TKXXB/V2/updateTk`, data);

// 保存结构配置
export let updateTermName = (data) => http.post(`/business/analyticalModel/updateTermName`, data);

