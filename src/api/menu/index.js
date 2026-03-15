import http from "@/utils/request";

let prefix = "/plat";

//===============管理端菜单组=====================
// 分页查询菜单组
export let pageMenuGroups = (data) =>
  http.post(`${prefix}/menu/pageMenuGroups`, {
    ...data,
  });
// 新增菜单组
export let insertMenuGroup = (data) =>
  http.post(`${prefix}/menu/insertMenuGroup`, {
    ...data,
  });
// 修改菜单组
export let updateMenuGroup = (data) =>
  http.post(`${prefix}/menu/updateMenuGroup`, {
    ...data,
  });
// 查询菜单项绑定情况
export let selectMenuOptions = (data) =>
  http.post(`${prefix}/menu/selectMenuOptions`, {
    ...data,
  });
// 重置菜单组与菜单项关联关系
export let updateGroupItemRelation = (data) =>
  http.post(`${prefix}/menu/updateGroupItemRelation`, {
    ...data,
  });
// 菜单组移除菜单项
export let groupRemoveItem = (data) =>
  http.post(`${prefix}/menu/groupRemoveItem`, {
    ...data,
  });

//==========管理端菜单项==============
// 分页查询菜单项
export let pageMenuItems = (data) =>
  http.post(`${prefix}/menu/pageMenuItems`, {
    ...data,
  });
// 菜单状态修改
export let changeStatus = (data) =>
  http.post(`${prefix}/menu/changeStatus`, {
    ...data,
  });
// 新增菜单项
export let insertMenuItem = (data) =>
  http.post(`${prefix}/menu/insertMenuItem`, {
    ...data,
  });
// 修改菜单项
export let updateMenuItem = (data) =>
  http.post(`${prefix}/menu/updateMenuItem`, {
    ...data,
  });
// 删除菜单项或菜单组_批量
export let deleteMenuList = (data) =>
  http.post(`${prefix}/menu/deleteMenuList`, {
    ...data,
  });
