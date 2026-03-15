import http from "@/utils/request";

//  删除数据项
export let deleteDataItem = (data) =>
  http.post(`/business/dataItem/deleteDataItem`, {
    ...data,
  });

// 新增
export let insertDataItem = (data) =>
  http.post(`/business/dataItem/insert`, {
    ...data,
  });

// 编辑
export let updateDataItem = (data) =>
  http.post(`/business/dataItem/update`, {
    ...data,
  });

// 复制
export let copyCodyDataItem = (data) =>
  http.post(`/business/dataItem/copyCody`, {
    ...data,
  });

// 指标树形查询
export let getIndexTree = (data) =>
  http.post(`/business/index/getIndexTree`, {
    ...data,
  });
