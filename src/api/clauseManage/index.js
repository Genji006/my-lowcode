import http from "@/utils/request";

// 查询条款组
export let listGroup = (data) => http.post(`/business/TKXXB/listGroup`, data);

// 新增条款组
export let insertGroup = (data) => http.post(`/business/TKXXB/insertGroup`, data);

// 生成条款组编码
export let getTkbm = (data) => http.post(`/business/TKXXB/getTkbm`, data);

// 修改条款组状态
export let changeGroupStatus = (data) => http.post(`/business/TKXXB/changeGroupStatus`, data);
// 获取机构等级信息
export let getJgLevel = (data) => http.post(`/business/TKXXB/getJgLevel`, data);

// 修改条款组信息
export let updateGroup = (data) => http.post(`/business/TKXXB/updateGroup`, data);

// 删除条款组信息
export let deleteGroup = (data) => http.post(`/business/TKXXB/deleteGroup`, data);

// 查询条款组信息
export let listTkzDetail = (data) => http.post(`/business/TKXXB/listTkzDetail`, data);

// 新增条款明细
export let insertTk = (data) => http.post(`/business/TKXXB/insertTk`, data);

// 新增子条款明细
export let insertZtk = (data) => http.post(`/business/TKXXB/insertZtk`, data);

// 删除条款明细
export let deleteTk = (data) => http.post(`/business/TKXXB/deleteTk`, data);

// 编辑条款明细
export let updateTk = (data) => http.post(`/business/TKXXB/updateTk`, data);
