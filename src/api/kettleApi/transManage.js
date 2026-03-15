// 转换管理
import http from "@/utils/request";

// 修改转换名称
export let updateTaskName = (params) => {
    const formData = new FormData();
    let arr = Object.keys(params);
    for (let i = 0; i < arr.length; i++) {
        formData.append(arr[i], params[arr[i]]);
    }
    return http.post(`/task/updateTaskName`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};

// 重新分配任务组

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
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};

// 获取转换配置
export let transDetail = (params) => {
    const formData = new FormData();
    let arr = Object.keys(params);
    for (let i = 0; i < arr.length; i++) {
        formData.append(arr[i], params[arr[i]]);
    }
    return http.post(`/task/detail`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};

// 智能执行
export let powerExecuteexport = (params) => {
    const formData = new FormData();
    let arr = Object.keys(params);
    for (let i = 0; i < arr.length; i++) {
        formData.append(arr[i], params[arr[i]]);
    }
    return http.post(`/task/powerExecuteexport `, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};


export let deleteTrans = (data) => http.post(`/task/delete`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});