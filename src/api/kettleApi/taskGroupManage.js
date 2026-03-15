import http from "@/utils/request";

//  任务组名重复查询
// export let decideGroupNameExist = (params) =>
//   http.post(`/taskGroup/decideGroupNameExist`, null, { params });
export let decideGroupNameExist = (params) => {
  const formData = new FormData();
  let arr = Object.keys(params);
  for (let i = 0; i < arr.length; i++) {
    formData.append(arr[i], params[arr[i]]);
  }
  return http.post(`/taskGroup/decideGroupNameExist`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//  新增任务组
export let addTaskGroup = (params) => {
  const formData = new FormData();
  for (let key in params) {
    if (Array.isArray(params[key])) {
      if (key === "userGroupNameArray") {
        for (let i = 0; i < params[key].length; i++) {
          formData.append(key, params[key][i]);
        }
      } else {
        let arrList = [];
        for (let i = 0; i < params[key].length; i++) {
          arrList.push(params[key][i]);
        }
        formData.append(key, JSON.stringify(arrList));
      }
    } else {
      formData.append(key, params[key]);
    }
  }
  return http.post(`/taskGroup/addTaskGroup`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export let addTaskGroups = (data) =>
  http.post(`/taskGroup/v1/addTaskGroup`, { ...data });

// 编辑任务组
export let updateTaskGroup = (params) => {
  const formData = new FormData();
  let arr = Object.keys(params);
  for (let i = 0; i < arr.length; i++) {
    formData.append(arr[i], params[arr[i]]);
  }
  return http.post(`/taskGroup/updateTaskGroup`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 判断任务组下是否有任务
export let selectTaskGroup = (params) => {
  const formData = new FormData();
  let arr = Object.keys(params);
  for (let i = 0; i < arr.length; i++) {
    formData.append(arr[i], params[arr[i]]);
  }
  return http.post(`/taskGroup/selectTaskGroup`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 删除任务组
export let deleteTaskGroup = (params) => {
  const formData = new FormData();
  let arr = Object.keys(params);
  for (let i = 0; i < arr.length; i++) {
    formData.append(arr[i], params[arr[i]]);
  }
  return http.post(`/taskGroup/deleteTaskGroup`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//  分配任务组
export let assignedTaskGroup = (params) => {
  const formData = new FormData();
  for (let key in params) {
    if (Array.isArray(params[key])) {
      if (key === "taskGroupNameArray") {
        for (let i = 0; i < params[key].length; i++) {
          formData.append(key, params[key][i]);
        }
      } else {
        let arrList = [];
        for (let i = 0; i < params[key].length; i++) {
          arrList.push(params[key][i]);
        }
        formData.append(key, JSON.stringify(arrList));
      }
    } else {
      formData.append(key, params[key]);
    }
  }
  return http.post(`/taskGroup/assignedTaskGroup`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
