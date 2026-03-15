import http from "@/utils/request";

//  模型（新建转换）
export let newChangeApi = (data) => http.post(`/kettle/trans/doAdd.do`, { ...data });

//  模型（任务列表）
export let listTaskApi = (data) => http.get(`/taskGroup/getAllTaskGroupBeforeCreate`);




// 新建转换
export let createTrans = (params) => {
    console.log("params", params);
    const urlSearchParams = new URLSearchParams();

    for (let key in params) {
        if (Array.isArray(params[key])) {
            if (key === "taskGroupArray") {
                for (let i = 0; i < params[key].length; i++) {
                    urlSearchParams.append(key, params[key][i]);
                }
            } else {
                let arrList = [];
                for (let i = 0; i < params[key].length; i++) {
                    arrList.push(params[key][i]);
                }
                urlSearchParams.append(key, JSON.stringify(arrList));
            }
        } else {
            urlSearchParams.append(key, params[key]);
        }
    }

    return http.post(`/repository/createTrans`, urlSearchParams, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};

// 保存转换流程图
export let saveTrans = (data) => http.post(`/trans/save`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取Info基础信息
export let openTrans = (data) => http.post(`/repository/open`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取新增步骤的step配置
export let newStep = (data) => http.post(`/trans/newStep`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取所有编码类型

export let Encodings = (data) => http.post(`/commonStep/Encodings`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});


// 获取文件扩展名列表
export let filextension = (data) => http.post(`/system/filextension`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 加载节点数据
export let fileexplorer = (data) => http.post(`/system/fileexplorer`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 查询所有数据库
export let getDatabases = (data) => http.post(`/common/getDatabases`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取数据库信息
export let databaseExplorer = (data) => http.post(`database/explorer`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取sql语句变量
export let tableFields = (data) => http.post(`/trans/tableFields`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 预览sql
export let previewData = (data) => http.post(`/trans/previewData`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取字段类型
export let columnType = (data) => http.post(`/ExcelOutput/columnType`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});
// 获取字段格式
export let columnFormats = (data) => http.post(`/ExcelOutput/columnFormats`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 变量活动类型
export let variableType = (data) => http.post(`/system/variableType`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取随机数格式
export let randomValueFunc = (data) => http.post(`/system/randomValueFunc`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});


// 获取字段
export let inputOutputFields = (data) => http.post(`/trans/inputOutputFields`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 初始化运行

export let initRun = (data) => http.post(`/trans/initRun`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 运行
export let thenRun = (data) => http.post(`/trans/run`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取结果
export let thenResult = (data) => http.post(`/trans/result`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取excel时间格式化
export let getFormats = (data) => http.post(`/ExcelOutput/formats`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 查询数据库连接
export let getAllDatabases = (data) => http.get(`/common/getDatabases`, {
    params: data
});

// 新增数据库连接的基础设置
export let addBaseSetting = (data) => http.post(`/trans/database`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

export let getAccessData = (data) => http.post(`database/accessData`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})
// 获取数据库连接方式
export let getAccessMethod = (data) => http.post(`database/accessMethod`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取数据库连接设置
export let getAccessSettings = (data) => http.post(`database/accessSettings`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})


export let databaseTest = (data) => http.post(`database/test`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取数据库连接特征
export let getDatabaseFeatures = (data) => http.post(`database/features`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 删除数据库连接
export let deleteDatabaseConn = (data) => http.post(`common/deleteDatabaseConn`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 检查数据库保存校验
export let checkDatabaseSave = (data) => http.post(`database/check`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})


// 获取字段类型元数据
export let valueMeta = (data) => http.post(`system/valueMeta`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取字段格式元数据
export let valueFormat = (data) => http.post(`system/valueFormat`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取系统数据类型
export let systemDataTypes = (data) => http.post(`system/systemDataTypes`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取系统日期时间格式化
export let systemDateTimeFormats = (data) => http.post(`system/datetimeformat`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取文件格式
export let systemFormatMapperLineTerminator = (data) => http.post(`system/formatMapperLineTerminator`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取系统字符集
export let systemAvailableCharsets = (data) => http.post(`system/availableCharsets`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取系统压缩格式
export let systemFormatMapperCompression = (data) => http.post(`system/compressionProviderNames`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取校验类型
export let checkSumTypes = (data) => http.post(`checksum/types`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取校验结果类型
export let checkSumResultTypes = (data) => http.post(`checksum/resulttype`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let systemLogLevel = (data) => http.post(`system/logLevel`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let getTargetSteps = (data) => http.post(`trans/nextSteps`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let testString = (data) => http.post(`system/valueString?valueMeta=${encodeURIComponent(JSON.stringify(data))}`, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let getScriptTree = (data) => http.post(`script/tree`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let scriptTest = (data) => http.post(`script/testData`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let multijointype = (data) => http.post(`system/multijointype`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 合并记录获取数据源选项
export let previousSteps = (data) => http.post(`/trans/previousSteps`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 记录集连接获取连接类型选项
export let mergejoinTypes = (data) => http.post(`/mergejoin/types`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 校验步骤
export let checkStep = (data) => http.post(`/trans/check`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取预览结果
export let previewResult = (data) => http.post(`/trans/previewResult`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

export let getSlaveSelect = (data) => http.post(`/slave/getSlaveSelect`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

export let stopRun = (data) => http.post(`/trans/stop`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 暂停/恢复运行
export let pauseOrResumeRun = (data) => http.post(`/trans/pause`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});


export let getSQL = (data) => http.post(`/trans/getSQL`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let getHadoopList = (data) => http.post(`/hadoop/allCluster`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let getOneCluster = (data) => http.post(`/hadoop/getOneCluster`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})


export let deleteCluster = (data) => http.post(`/hadoop/deleteCluster`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let addHadoopCluster = (data) => http.post(`/hadoop/addHadoopCluster`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let updateCluster = (data) => http.post(`/hadoop/updateCluster`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let initPreview = (data) => http.post(`/trans/initPreview`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取预览信息
export let previewInfo = (data) => http.post(`/trans/preview`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})


export let runPreviewApi = (data) => http.post(`/trans/previewResult`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})


// 获取作业列表
export let getJobs = (data) => http.post(`/task/getJobs`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 创建作业
export let createJob = (params) => {
    const urlSearchParams = new URLSearchParams();

    for (let key in params) {
        if (Array.isArray(params[key])) {
            if (key === "taskGroupArray") {
                for (let i = 0; i < params[key].length; i++) {
                    urlSearchParams.append(key, params[key][i]);
                }
            } else {
                let arrList = [];
                for (let i = 0; i < params[key].length; i++) {
                    arrList.push(params[key][i]);
                }
                urlSearchParams.append(key, JSON.stringify(arrList));
            }
        } else {
            urlSearchParams.append(key, params[key]);
        }
    }

    return http.post(`/repository/createJob`, urlSearchParams, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};

// 新增作业节点
export let newJobEntry = (data) => http.post(`/job/newJobEntry`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});


export let saveJobs = (data) => http.post(`/job/save`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 获取作业/转换文件列表
export let getJobOrTransList = (data) => http.post(`/repository/explorer`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

export let deleteFoldersSuccessCondition = (data) => http.post(`/system/deleteFoldersSuccessCondition`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取时间单位
export let getTimeUnit = (data) => http.post(`/system/timeunit`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})


export let getSuccessNumberCondition = (data) => http.post(`/system/successNumberCondition`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let getTimeUnit2 = (data) => http.post(`/system/timeunit2`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 测试FTP连接
export let testFtpConnection = (data) => http.post(`/job/ftptest`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 测试远程目录
export let testFtpDirectory = (data) => http.post(`/job/ftpdirtest`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})


// 获取连接类型
export let getConnectionType = (data) => http.post(`/system/connectiontype`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 测试SFTP连接
export let testSftpConnection = (data) => http.post(`/sftp/test`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let testSftpDirectory = (data) => http.post(`/sftp/testdir`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 初始化作业运行
export let initJobRun = (data) => http.post(`/job/initRun`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})
export let jobEntries = (data) => http.post(`/job/entries`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 作业运行
export let thenJobRun = (data) => http.post(`/job/run`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 作业运行结果
export let thenJobResult = (data) => http.post(`/job/result`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 作业停止
export let jobStop = (data) => http.post(`/job/stop`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let getData = (data) => http.get(`/viewModule/getData?_dc=${Date.now()}`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取运行中的作业/转换任务
export let getRunningTask = (data) => http.get(`/task/getRunningTask?_dc=${Date.now()}`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取定时任务详情
export let getSchedulerDetails = (data) => http.get(`/scheduler/beforeUpdateScheduler?taskId=${data}`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 更新定时任务
export let updateJobScheduler = (data) => http.post(`/scheduler/updateJobScheduler`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 删除定时任务
export let deleteScheduler = (data) => http.post(`/scheduler/deleteScheduler`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let getTraceById = (data) => http.get(`/log/getTraceById?id=${data}`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

export let getSlaveQuatoByCondition = (data) => http.post(`/slave/slaveQuatoByCondition`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 节点体检
export let slaveTest = (data) => http.post(`/slave/slaveTest`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 新增节点
export let addSlave = (data) => http.post(`/slave/addSlave`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 编辑节点
export let updateSlaveServer = (data) => http.post(`/slave/updateSlaveServer`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 获取所有节点图标数据
export let allSlaveQuato = (data) => http.post(`/slave/allSlaveQuato?_dc=${Date.now()}`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})

// 删除节点
export let deleteSlave = (data) => http.post(`/slave/deleteSlave?slaveId=${data.slaveId}`, data, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
})
