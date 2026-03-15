import http from "@/utils/request";


//  应用查询
export let listIdxCpxxb = (data) => http.post(`/business/idxCpxx/listIdxCpxxb`, {
  ...data,
});

//  新增应用
export let insertIdxCpxxb = (data) => http.post(`/business/idxCpxx/insertIdxCpxxb`, {
  ...data,
});

//状态修改
export let updateIdxCpxxbStatus = (data) => http.post(`/business/idxCpxx/updateIdxCpxxbStatus`, {
  ...data,
});
export let updateMenuStatus = (data) => http.post(`/business/menu/V2/updateStatus`, {
  ...data,
});

//编辑
export let updateIdxCpxxb = (data) => http.post(`/business/idxCpxx/updateIdxCpxxb`, {
  ...data,
});


//删除
export let deleteIdxCpxxb = (data) => http.post(`/business/idxCpxx/deleteIdxCpxxb`, {
  ...data,
});


// 实际科室
export let listHosDptApi = (data) => http.post(`/business/DEPTMAPINFO/hosDptList`, {
  ...data,
});
// 标准科室
export let listStandDptApi = (data) => http.post(`/business/DEPTMAPINFO/standDptList`, {
  ...data,
});

// start  用户管理 ----------------------------------------------------------------------------------------
// 用户管理新增
export let insertSysUserApi = (data) => http.post(`/business/SysUser/insert`, data);

// 用户管理编辑
export let updateSysUserApi = (data) => http.post(`/business/SysUser/update`, data)

// 用户管理删除
export let deleteSysUserApi = (data) => http.post('/business/SysUser/delete', data)

// 密码重置
export let resetSysUserPwdApi = (data) => http.post(`/business/SysUser/resetUserPassword`, {
  ...data,
});

// 人员状态
export let statusSysUserApi = (data) => http.post(`/business/SysUser/updateStatus`, data)

// 批量新增用户
export let batchInsertSysUserApi = (data) => http.post(`/business/SysUser/insertAppSysUserHuman`, data)

// 权限管理（快速授权、角色授权）
export let authorityManagementApi = (data) => http.post(`/business/SysUser/authorityManagement`, data)


// end  用户管理 ----------------------------------------------------------------------------------------


//  start 角色管理----------------------------------------------------------------------------------------------
// 角色列表
export let listRoleApi = (data) => http.post(`/business/SysRole/page`, {
  ...data,
});

// 获取当前角色菜单权限列表
export let getRoleMenuListApi = (data) => http.post(`/business/SysRole/getRoleMenu`, data)

// 角色新增
export let insertRoleApi = (data) => http.post(`/business/SysRole/insert`, data)

// 角色编辑
export let updateRoleApi = (data) => http.post(`/business/SysRole/update`, data)

// 角色删除
export let deleteRoleApi = (data) => http.post(`/business/SysRole/delete`, data)

// 角色状态
export let updateRoleStatusApi = (data) => http.post(`/business/SysRole/updateRoleStatus`, data)

// 角色绑定用户
export let bindUserToRoleApi = (data) => http.post(`/business/SysRole/bindUser`, data)

// 角色解绑用户
export let unBindUserToRoleApi = (data) => http.post(`/business/SysRole/removeBinDingUser`, data)

// 标准科室(改)
export let listTreeBmksApi = (data) => http.post(`/business/DEPTMAPINFO/listTreeBmks`, {
  ...data,
});

// 供应商数据
export let getGysNameApi = (data) => http.post(`/business/idxCpxx/getGysName`, {
  ...data,
});

//  end 角色管理----------------------------------------------------------------------------------------------



// 脚本库管理
export let parseFolderApi = (data) => http.post(`/business/ScriptLibrary/parseFolder`, {
  ...data,
});

// 脚本文件树形查询
export let listScriptTreeApi = (data) => http.post(`/business/config/getTreeFile`, {
  ...data,
});

// 文件重命名
export let renameScriptFileApi = (data) => http.post(`/business/config/updateScriptRename`, {
  ...data,
});

// 文件拖拽
export let moveScriptFileApi = (data) => http.post(`/business/config/replaceFile`, {
  ...data,
});

// 文件夹创建同级/下级
export let createScriptFolderApi = (data) => http.post(`/createFolder`, {
  ...data,
});

// 文件夹删除
export let deleteScriptFolderApi = (data) => http.post(`/business/config/delete`, {
  ...data,
});