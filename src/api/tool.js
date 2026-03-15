import http from "../utils/request";

let prefix = `/getApi`;

export let getapptableApi = (data) =>
  http.get(`${prefix}/getapptables`, {
    ...data,
  });
//  表数据
export let getapptablebyidApi = (data) =>
  http.post(`${prefix}/getapptablebyid`, {
    ...data,
  });
//  执行sql语句
export let executesqlApi = (data) =>
  http.post(`${prefix}/exesql_qurey_top100_ora`, {
    ...data,
  });

//  -------------------------------------------------------------------------------------------------   数据源接口  ---------------
//  数据源管理（列表）
export let listDataSourceApi = (data) =>
  http.post(`/schema-manager/datasource/listDataSource`, {
    ...data,
  });

//  数据源管理（新增）
export let addDataSourceApi = (data) =>
  http.post(`/schema-manager/datasource/addDateSource`, {
    ...data,
  });

//  数据源管理（修改）
export let updateDataSourceApi = (data) =>
  http.post(`/schema-manager/datasource/updateDateSource`, {
    ...data,
  });

//  数据源管理（批量删除）
export let deleteDataSourceApi = (data) =>
  http.post(`/schema-manager/datasource/deleteDateSource`, {
    ...data,
  });

// 数据源管理（测试连接）
export let testConnectApi = (data) =>
  http.post(`/schema-manager/datasource/testDateSource`, {
    ...data,
  });

//  -------------------------------------------------------------------------------------------------   应用项目管理接口  ---------------
// 应用项目管理（列表）
export let listAppProjectApi = (data) =>
  http.post(`/business/management/list`, {
    ...data,
  });
export let getMrmsProjectInfoSelect = (data) =>
  http.post(`/business/mrmsProject/getMrmsProjectInfoSelect`, {
    ...data,
  });
// 医疗信息化事业部应用项目管理（列表）
export let getMrmsProjectInfo = (data) =>
  http.post(`/business/mrmsProject/getMrmsProjectInfo`, {
    ...data,
  });
// 应用项目管理（新增）
export let addAppProjectApi = (data) =>
  http.post(`/business/management/insert`, {
    ...data,
  });
// 医疗信息化事业部应用项目管理（新增）
export let insertMrmsProject = (data) =>
  http.post(`/business/mrmsProject/insertMrmsProject`, {
    ...data,
  });
// 应用项目管理（修改）
export let updateAppProjectApi = (data) =>
  http.post(`/business/management/update`, {
    ...data,
  });
// 医疗信息化事业部应用项目管理（修改）
export let updateMrmsProject = (data) =>
  http.post(`/business/mrmsProject/updateMrmsProject`, {
    ...data,
  });
// 应用项目管理（批量删除）
export let deleteAppProjectApi = (data) =>
  http.post(`/business/management/deleteDelFlag`, data);
// 医疗信息化事业部应用项目管理（批量删除）
export let deleteMrmsProject = (data) =>
  http.post(`/business/mrmsProject/deleteMrmsProject`, data);
// 应用项目管理（启用）
export let enableAppProjectApi = (data) =>
  http.post(`/business/management/updateState`, data);

//  --------------------------------------------------------------------------------------------------   库表结构管理   --------------------------
//  根据数据源，获取全量数据表（所以表）
export let listAllTablesApi = (data) =>
  http.post(`/schema-manager/datasource/listTable`, {
    ...data,
  });

//  项目表数据集合左侧
export let listTableColumnsApi = (data) =>
  http.post(`/schema-manager/datasource/listProjectTable`, {
    ...data,
  });

//  列出表中的全部字段
export let listTableColumnsDetailApi = (data) =>
  http.post(`/schema-manager/datasource/listTableField`, {
    ...data,
  });

//  导入页确定导入表
export let importTableApi = (data) =>
  http.post(`/schema-manager/datasource/importTable`, data);

//  保存表结构
export let saveTableStructureApi = (data) =>
  http.post(`/schema-manager/datasource/saveTable`, {
    ...data,
  });

//  保存并应用
export let saveAndApplyTableStructureApi = (data) =>
  http.post(`/schema-manager/datasource/saveApplyTable`, {
    ...data,
  });

//  获取数据库字段的字段类型
export let listTableStructureApi = (data) =>
  http.post(`/schema-manager/datasource/getDataTypes`, {
    ...data,
  });

//  操作日志
export let listOperationLogApi = (data) =>
  http.post(`/schema-manager/datasource/listOperationLog`, {
    ...data,
  });

//  下载文件通用
export function downloadTemplateApi(params, url, file) {
  http({
    method: "POST",
    url: url,
    data: params,
    headers: {
      Authorization: sessionStorage.getItem("ks-token"),
    },
    responseType: "blob",
  })
    .then((res) => {
      const link = document.createElement("a"); // 创建元素
      let blob = new Blob([res], { type: "application/x-download" });
      link.style.display = "none";
      link.href = URL.createObjectURL(blob); // 创建下载的链接
      link.setAttribute(
        "download",
        file.name + (file.type ? file.type : ".xlsx"),
      ); // 给下载后的文件命名
      document.body.appendChild(link);
      link.click(); // 点击下载
      document.body.removeChild(link); //  下载完成移除元素
      window.URL.revokeObjectURL(link.href); // 释放掉blob对象
    })
    .catch((err) => {});
}

// 表同步
export let tableSyncApi = (data) =>
  http.post(`/schema-manager/datasource/syncTable`, {
    ...data,
  });

//  建表用脚本
export let createTableScriptApi = (data) =>
  http.post(`/schema-manager/datasource/getddl`, {
    ...data,
  });

//  --------------------------------------------------------------------------------------------------   编码分组   --------------------------
//  编码分组（列表）
export let listCodeGroupApi = (data) =>
  http.post(`/index-man/business/group-info/page`, {
    ...data,
  });

//  编码分组（新增）
export let addCodeGroupApi = (data) =>
  http.post(`/index-man/business/group-info/add`, {
    ...data,
  });

//  编码分组（修改）
export let updateCodeGroupApi = (data) =>
  http.post(`/index-man/business/group-info/edit`, {
    ...data,
  });

//  编码分组（批量删除）
export let deleteCodeGroupApi = (data) =>
  http.post(`/index-man/business/group-info/delete`, data);

//  编码分组（启用）
export let enableCodeGroupApi = (data) =>
  http.post(`/index-man/business/group-info/update-status`, {
    ...data,
  });

//  编码分组配置树（诊断）
export let codeGroupTreeApi = (data) =>
  http.post(`/index-man/business/group-info/listDiagnosticInfo`, {
    ...data,
  });

//  编码分组配置树（手术）
export let codeGroupTreeOperationApi = (data) =>
  http.post(`/index-man/business/group-info/listOperationInfo`, {
    ...data,
  });

// 编码分组保存
export let saveCodeGroupApi = (data) =>
  http.post(`/index-man/business/group-info/save`, data);

//  编码分组规则配置
export let getConditionRuleDataApi = (data) =>
  http.post(
    `/index-man/business/group-relevance-condition/getConditionRuleData`,
    data,
  );

// 编码分组双击保存
export let saveCodeGroupDoubleApi = (data) =>
  http.post(
    `/index-man/business/group-relevance-condition/getDoubleClickData`,
    data,
  );

//   --------------------------------------------------------------------------------------------------   数据项配置   ----------
// 数据项修改状态
export let updateDataItemStatusApi = (data) =>
  http.post(
    `/index-man/business/definition-indicator-item/updateDataState`,
    data,
  );

//  删除项目页面配置
export let deleteDataItemApi = (data) =>
  http.post(`/business/design-page/deleteBatch`, data);
//  更新项目页面配置（是否启用）
export let updateDataItemUpdateStatusApi = (data) =>
  http.post(`/business/design-page/updateStatus`, data);

// 解析sql
export let parseColumns = (data) =>
  http.post(`/business/design-page/parseColumns`, data);

/*
 * 报表配置列表
 */
// 复制项目页面
export let copyPageApi = (data) =>
  http.post(`/business/mrmsTableManger/copyMrmsTableMangerInfo`, data);

// 删除项目页面
export let deletePageApi = (data) =>
  http.post(`/business/mrmsTableManger/deleteMrmsTableMangerInfo`, data);

// 更新项目页面配置（是否启用）
export let updatePageUpdateStatusApi = (data) =>
  http.post(`/business/mrmsTableManger/updateMrmsTableMangerInfoStatus`, data);

// 根据path查询组件构造
export let queryComponentApi = (data) =>
  http.post(`/business/mrmsTableManger/commonQueryCompent`, {
    ...data,
  });

// 通用查询数据源接口
export let commonQueryApi = (data) =>
  http.post(`/business/mrmsTableManger/commonQuery`, {
    ...data,
  });

// 通用导出数据源接口
export let commonExportApi = (data) =>
  http.post(`/business/mrmsTableManger/commonExportReport`, {
    ...data,
  }, {
    responseType: 'blob',
  });
