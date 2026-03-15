const formWidth = '200px'
// 关联数据项
export const dataItemFormItems = [
    { label: '数据项名称：', prop: 'dataItemName', component: 'el-input', attrs: { placeholder: '请输入' }, style: { width: formWidth } },
    { label: '关联指标：', prop: 'dataItemIndex', component: 'el-input', attrs: { placeholder: '请选择' }, style: { width: formWidth } },
]

// 上传的token
export const headers = {
    Authorization: sessionStorage.getItem("token"),
};

// 按钮禁用
export const rowDisableFn = (data) => {
    if (data.length == 0) {
        return true
    } else {
        return false
    }
}

// 样式文件结构配置
export const configShowFn = (data, type) => {
    if (type == true) {
        let obj = {
            ...data,
        }
        obj.btnList[0].bind = { style: { 'margin-left': '120px' } }
        return obj
    } else {
        let obj = {
            ...data,
        }
        obj.btnList[0].bind = { style: { 'margin-left': '0px' } }
        return obj
    }
}

// 配置数据项
export const dataItemConfigFormItems = [
    { label: '数据项名称：', prop: 'dataItemName', component: 'el-input', attrs: { placeholder: '请输入' }, style: { width: formWidth } },
    { label: '关联指标：', prop: 'dataItemIndex', component: 'el-input', attrs: { placeholder: '请选择' }, style: { width: formWidth } },
    { label: '绑定脚本名称：', prop: 'bindSciptName', component: 'el-input', attrs: { placeholder: '请选择' }, style: { width: formWidth } },
]



//  脚本库管理
export let tableBindData = {
    pageOpen: "1", //  是否需要分页
    checkBox: "1", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "scriptId",
    apiUrl: '/business/config/page', //  接口地址
    btnList: [
        // { btnType: "add", text: "上传", icon: "Upload",  },
        { btnType: "edit", text: "编辑", bind: { style: { 'margin-left': '120px' } } },
        // { btnType: "edit", text: "替换", icon: "Switch" },
        { btnType: "edit", typeRow: 'selectType', text: "重置顺序", icon: 'Refresh' },
        { btnType: "edit", text: "下载", icon: "Download" },
        { btnType: "edit", text: "配置数据项", icon: "Connection" },
        { btnType: "delete", text: "删除" },
    ], // 表格按钮
    designTableColumns: [
        {
            columnLabel: "脚本名称",
            columnName: "scriptName",
            columnWidth: "300",
            fixed: 'left',
            showOverflowTooltip: true,
        },
        {
            columnLabel: "执行顺序",
            columnName: "scriptSort",
            columnWidth: "100",
            textAlign: "center",
        },
        {
            columnLabel: "上传用户",
            columnName: "userName",
            columnWidth: "100",
            textAlign: "center",
        },
        {
            columnLabel: "上传时间",
            columnName: "upDataTime",
            columnWidth: "220",
            textAlign: "center",
        },
        {
            columnLabel: "关联数据项",
            columnName: "dataItem",
            columnWidth: "120",
            textAlign: "center",
            isClick: true,
            // formatter: (row) => row?.map?.roleName || '',
        },
        {
            columnLabel: "脚本路径",
            columnName: "scriptUrl",
            columnWidth: "120",
            textAlign: "center",
        },
        {
            columnLabel: "脚本描述",
            columnName: "scriptRemarks",
            columnWidth: "",
            textAlign: "left",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "版本管理",
            columnName: "updateTime",
            columnWidth: "120",
            textAlign: "center",
            isClick: true,
            formatter: (row) => `历史版本`,
        }
    ]

}


// 关联数据项
export let tableDataItemBindData = {
    pageOpen: "0", //  是否需要分页
    checkBox: "0", //  是否需要复选框
    light: "0", //  是否需要高亮
    // primaryKey: "userId",
    apiUrl: '', //  接口地址
    designTableColumns: [
        {
            columnLabel: "脚本名称",
            columnName: "scriptName",
            columnWidth: "95",
            fixed: 'left',
            textAlign: "center",
            showOverflowTooltip: true,
        }
    ]
}