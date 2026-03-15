import { yesOrNoFn, yesOrNoFns, userTypeFn, idcardTypeFn, authTypeFn, sexFn, postFn, medicalTypeFn } from "@/types/dict/index";
import { listHosDptApi, listStandDptApi, listTreeBmksApi } from "@/api/appManage/appRegist";


// 标准科室
const standOption = async () => {
    let res = await listTreeBmksApi({ pageSize: 99999 })
    return res.data
}

// 实际科室
const getOptions = async () => {
    let res = await listHosDptApi({ pageSize: 99999 })
    return res.rows
}

const optionsData = await getOptions()  // 实际科室
const standOptionsData = await standOption()  // 标准科室

// 应用来源(0平台配置，1自研接入，第三方)
export const appType = [{
    label: '平台配置',
    value: '0'
}, {
    label: '自研接入',
    value: '1'
}, {
    label: '第三方',
    value: '2'
}]

// 应用方式
export const sourceApplicationFn = (sourceApplication) => {
    switch (sourceApplication) {
        case "0":
            return {
                backgroundColor: "rgba(238,248,232,1)",
                color: "rgba(122, 199, 86, 1)",
                border: "1px solid rgba(122,199,86,1)",
            };
        case "2":
            return {
                backgroundColor: "rgba(255,126,126,0.26)",
                color: "rgba(255,126,126,1)",
                border: "1px solid rgba(255,74,74,0.41)",
            };
        case "1": {
            return {
                backgroundColor: "",
                color: "#409eff",
                border: "1px solid #409eff",
            }
        }
        default:
            return {};
    }
};

// 新增用户
export const appItems = [
    {
        component: "el-input",
        label: "姓名：",
        prop: "nickName",
        attrs: {
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        component: "el-tree-select",
        label: "标准科室：",
        prop: "dptCode",
        // options: standOptionsData,
        // montageName: true,
        // optionLabel: "standDptname",
        // optionValue: "standDptcode",
        attrs: {
            filterable: true,
            "node-key": 'ksCode',
            data: standOptionsData,
            placeholder: "请输入",
            clearable: true,
            props: {
                children: 'children',
                label: function (data, node) {
                    return data.ksCode + '/' + data.ksName
                }
            }
        },
    },
    {
        component: "el-select",
        label: "实际科室：",
        prop: "hdptCode",
        options: optionsData,
        optionLabel: "hospDptname",
        optionValue: "hospDptcode",
        montageName: true,
        attrs: {
            filterable: true,
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        component: "el-select",
        label: "证件类型：",
        prop: "idCardType",
        options: idcardTypeFn(),
        attrs: {
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        component: "el-input",
        label: "证件号码：",
        prop: "idCode",
        attrs: {
            placeholder: "请输入",
            clearable: true,
            'show-word-limit': false,
        },
    },
    {
        component: "el-select",
        label: "性别：",
        prop: "sex",
        options: sexFn(),
        attrs: {
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        component: "el-input",
        label: "工号：",
        prop: "gh",
        attrs: {
            placeholder: "请输入",
            clearable: true,
            'show-word-limit': false,
        },
    },
    {
        component: "el-input",
        label: "联系电话：",
        prop: "phonenumber",
        attrs: {
            placeholder: "请输入",
            clearable: true,
            'show-word-limit': false,
        },
    },
    {
        component: "el-select",
        label: "人员类型：",
        prop: "medicalType",
        options: medicalTypeFn(),
        attrs: {
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        component: "el-select",
        label: "行政管理职务：",
        prop: "postCode",
        options: postFn(),
        attrs: {
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        component: "el-input",
        label: "邮箱：",
        prop: "email",
        attrs: {
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        component: "el-switch",
        label: "启用否：",
        prop: "status",
        attrs: {
            "active-value": "1",
            "inactive-value": "0",
        },
    },
    {
        component: "el-input",
        label: "备注：",
        prop: "remark",
        attrs: {
            type: "textarea",
            placeholder: "请输入",
            clearable: true,
            rows: 4,
            resize: "none",
        },
    },
]

//  查询表单
export const searchItems = [
    {
        label: "用户姓名：",
        prop: "nickName",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "工号：",
        prop: "gh",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "用户类型：",
        prop: "userType",
        component: "el-select",
        options: userTypeFn(),
        optionLabel: "cpmc",
        optionValue: "uuid",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "联系电话：",
        prop: "phonenumber",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true, 'show-word-limit': false, },
    },
    {
        label: "启用否：",
        prop: "status",
        component: "el-select",
        options: yesOrNoFn(),
        style: { width: "220px" },
        attrs: { placeholder: "请选择", clearable: true },
    },
    {
        component: "el-tree-select",
        label: "标准科室：",
        prop: "dptCode",
        // options: standOptionsData,
        // montageName: true,
        optionLabel: "ksName",
        optionValue: "ksCode",
        style: { width: "220px" },
        attrs: {
            "node-key": 'ksCode',
            data: standOptionsData,
            placeholder: "请输入",
            clearable: true,
            filterable: true,
            props: {
                children: 'children',
                label: function (data, node) {
                    return data.ksCode + '/' + data.ksName
                }
            }
        },
    },
    {
        component: "el-select",
        label: "实际科室：",
        prop: "hdptCode",
        options: optionsData,
        optionLabel: "hospDptname",
        optionValue: "hospDptcode",
        style: { width: "220px" },
        montageName: true,
        attrs: {
            placeholder: "请输入",
            clearable: true,
            filterable: true,
        },
    },
]


// 处里父级菜单组（将菜单组保留）
export const fatherMenuFn = (menuData, childrenKey = 'children') => {
    return Array.isArray(menuData) ? menuData.filter(item => item.menuType === 'M').map(item => ({
        ...item,
        ...(item[childrenKey] && Array.isArray(item[childrenKey]) && item[childrenKey].length > 0
            ? { [childrenKey]: fatherMenuFn(item[childrenKey], childrenKey) }
            : {})
    })).filter(item => item.menuType === 'M' || (item[childrenKey] && item[childrenKey].length > 0)) : [];
}

// 查询菜单项
/**
 * 混合多条件查询方法
 * 支持同时使用模糊查询和精准查询
 * @param {Array} data - 要查询的数据数组
 * @param {Object} conditions - 查询条件对象
 * @param {Array} exactFields - 需要精准查询的字段数组
 * @returns {Array} 符合条件的数据
 */
export const menuListFn = (data, conditions, exactFields = []) => {
    return data.filter(item => {
        return Object.entries(conditions).every(([key, value]) => {
            // 跳过空值条件
            if (value === undefined || value === null || value === '') {
                return true;
            }
            const itemValue = item[key];
            // 判断是否为精准查询字段
            const isExact = exactFields.includes(key);
            if (isExact) {
                // 精准查询：支持数组包含判断
                if (Array.isArray(itemValue)) {
                    return itemValue.includes(value);
                }
                // 非数组类型使用严格相等
                return itemValue === value;
            } else {
                // 模糊查询：字符串包含匹配
                if (typeof itemValue === 'string' && typeof value === 'string') {
                    return itemValue.toLowerCase().includes(value.toLowerCase());
                }
                // 非字符串类型默认使用精准匹配
                if (Array.isArray(itemValue)) {
                    return itemValue.includes(value);
                }
                return itemValue === value;
            }
        });
    });
}

// 用户列表绑定的属性
export const bindData = {
    pageOpen: "1", //  是否需要分页
    checkBox: "1", //  是否需要复选框
    light: "1", //  是否需要高亮
    primaryKey: "userId",
    method: "post",
    btnList: [
        { btnType: "add", text: "批量用户新增" }, //  新增
        { btnType: "add", text: "新增用户" }, //  编辑
        { btnType: "edit", text: "编辑用户" },
        { btnType: "edit", typeRow: 'selectType', text: "权限管理", icon: "", img: "/ItemImg/jssq.svg" },
        { btnType: "edit", typeRow: 'selectType', text: "密码重置", icon: "RefreshRight" }, //  删除
        // {
        //     btnType: "edit",
        //     text: "数据权限配置",
        //     icon: "",
        //     img: "/ItemImg/sjqxpz.svg",
        // }, //  删除
        { btnType: "delete", text: "删除" }, //  删除
    ], // 表格按钮
    apiUrl: "/business/SysUser/page", //  接口地址
    showBorder: true, //  是否需要边框
    designTableColumns: [
        {
            columnLabel: "用户姓名",
            columnName: "nickName",
            columnWidth: "95",
            fixed: 'left',
            textAlign: "center",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "工号",
            columnName: "gh",
            columnWidth: "80",
            fixed: 'left',
            textAlign: "center",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "用户账号",
            columnName: "userName",
            showOverflowTooltip: true,
            textAlign: "center",
            fixed: 'left',
            columnWidth: "120",
        },
        {
            columnLabel: "证件类型",
            columnName: "idCardType",
            columnWidth: "100",
            showOverflowTooltip: true,
            textAlign: "center",
            formatter: (row) => idcardTypeFn(row.idCardType, "formatter"),
        },
        {
            columnLabel: "证件号码",
            columnName: "idCode",
            columnWidth: "200",
            textAlign: "center",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "用户类型",
            columnName: "userType",
            showOverflowTooltip: true,
            columnWidth: "100",
            textAlign: "center",
            formatter: (row) => userTypeFn(row.userType, "formatter"),
        },
        {
            columnLabel: "授权类型",
            columnName: "authType",
            showOverflowTooltip: true,
            columnWidth: "100",
            formatter: (row) => authTypeFn(row.authType, "formatter"),
        },
        {
            columnLabel: "启用否",
            columnName: "status",
            kyf: "1",
            columnWidth: "80",
            textAlign: "center",
            attrs: { "active-value": "1", "inactive-value": "0" },
        },
        {
            columnLabel: "人员类型",
            columnName: "medicalType",
            formatter: (row) => medicalTypeFn(row.medicalType, 'formatter'),
            showOverflowTooltip: true,
            columnWidth: "120",
        },
        {
            columnLabel: "业务/行政管理职务",
            columnName: "postCode",
            columnWidth: "180",
            formatter: (row) => postFn(row.postCode, 'formatter'),
            showOverflowTooltip: true
        },
        {
            columnLabel: "所属角色",
            columnName: "roleIds",
            columnWidth: "200",
            textAlign: "center",
            isClick: true,
            formatter: (row) => row?.map?.roleName || '',
            showOverflowTooltip: true,
        },
        {
            columnLabel: "标准科室名称",
            columnName: "dptName",
            showOverflowTooltip: true,
            columnWidth: "150",
        },
        {
            columnLabel: "标准科室代码",
            columnName: "dptCode",
            showOverflowTooltip: true,
            columnWidth: "140",
        },
        {
            columnLabel: "实际科室名称",
            columnName: "hdptName",
            showOverflowTooltip: true,
            columnWidth: "150",
        },
        {
            columnLabel: "实际科室代码",
            columnName: "hdptCode",
            showOverflowTooltip: true,
            columnWidth: "140",
        },
        {
            columnLabel: "联系电话",
            columnName: "phonenumber",
            showOverflowTooltip: true,
            columnWidth: "120",
            textAlign: "center",
        },
        {
            columnLabel: "E-mail",
            columnName: "email",
            showOverflowTooltip: true,
            columnWidth: "200",
        },
        {
            columnLabel: "创建时间",
            columnName: "createTime",
            showOverflowTooltip: true,
            columnWidth: "180",
            textAlign: "center",
        },

    ],
}


// 人员详情
export const bindDialogTable = {
    primaryKey: "id",
    pageOpen: "0", //  是否需要分页
    checkBox: "1", //  是否需要复选框
    showBorder: true, //  是否需要边框
    btnList: [
        { btnType: "add", text: "添加人员" }, //  新增
        { btnType: "delete", text: "批量删除" }, //  编辑
    ],
    designTableColumns: [
        {
            columnLabel: "用户姓名",
            columnName: "name",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "工号",
            columnName: "jobId",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "证件类型",
            columnName: "idcardType",
            // columnWidth: "95",
            formatter: (row) => idcardTypeFn(row.idcardType, "formatter"),
            showOverflowTooltip: true,
        },
        {
            columnLabel: "证件号码",
            columnName: "idCode",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "人员类型",
            columnName: "medicalType",
            // columnWidth: "95",
            formatter: (row) => medicalTypeFn(row.medicalType, "formatter"),
            showOverflowTooltip: true,
        },
        {
            columnLabel: "标准科室名称",
            columnName: "dptName",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "标准科室代码",
            columnName: "dptCode",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "实际科室名称",
            columnName: "hdptName",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "实际科室代码",
            columnName: "hdptCode",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "联系电话",
            columnName: "phoneNum",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "E-mail",
            columnName: "email",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "行政管理职务",
            columnName: "postCode",
            columnWidth: "140",
            formatter: (row) => postFn(row.postCode, "formatter"),
            showOverflowTooltip: true,
        },
    ]
}


// 人员详情表格配置
export const userInfoBind = {
    pageOpen: "1", //  是否需要分页
    checkBox: "1", //  是否需要复选框
    showBorder: '1',  //
    light: "0", //  是否需要高亮
    primaryKey: "id",
    apiUrl: "/system/resources-management/simple/queryDataList", //  接口地址
    bottomBtnList: [
        { btnType: "cancel", typeRow: 'none', text: "取消", icon: '', style: 'background-color: rgb(236, 241, 255)' }, //  新增
        { btnType: "save", typeRow: 'none', text: "保存", icon: '', }, //  新增
    ],
    designTableColumns: [
        {
            columnLabel: "用户姓名",
            columnName: "name",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "工号",
            columnName: "jobId",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "证件类型",
            columnName: "idcardType",
            // columnWidth: "95",
            formatter: (row) => idcardTypeFn(row.idcardType, "formatter"),
            showOverflowTooltip: true,
        },
        {
            columnLabel: "证件号码",
            columnName: "idCode",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "人员类型",
            columnName: "medicalType",
            // columnWidth: "95",
            formatter: (row) => medicalTypeFn(row.medicalType, "formatter"),
            showOverflowTooltip: true,
        },
        {
            columnLabel: "标准科室名称",
            columnName: "dptName",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "标准科室代码",
            columnName: "dptCode",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "实际科室名称",
            columnName: "hdptName",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "实际科室代码",
            columnName: "hdptCode",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "联系电话",
            columnName: "phoneNum",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "E-mail",
            columnName: "email",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
        {
            columnLabel: "行政管理职务",
            columnName: "postCode",
            // columnWidth: "95",
            formatter: (row) => postFn(row.postCode, "formatter"),
            showOverflowTooltip: true,
        },
        {
            columnLabel: "创建时间",
            columnName: "createTime",
            // columnWidth: "95",
            showOverflowTooltip: true,
        },
    ]

}


// 人员详情
export const userInfoItems = [
    {
        label: "用户姓名：",
        prop: "name",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "工号：",
        prop: "jobId",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "人员类型：",
        prop: "medicalType",
        component: "el-select",
        options: medicalTypeFn(),
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        component: "el-tree-select",
        label: "标准科室：",
        prop: "dptCode",
        // options: standOptionsData,
        // montageName: true,
        optionLabel: "ksName",
        optionValue: "ksCode",
        style: { width: "220px" },
        attrs: {
            "node-key": 'ksCode',
            data: standOptionsData,
            placeholder: "请输入",
            clearable: true,
            filterable: true,
            props: {
                children: 'children',
                label: function (data, node) {
                    return data.ksCode + '/' + data.ksName
                }
            }
        },
    },
    {
        component: "el-select",
        label: "实际科室：",
        prop: "hdptCode",
        options: optionsData,
        style: { width: "220px" },
        optionLabel: "hospDptname",
        optionValue: "hospDptcode",
        montageName: true,
        attrs: {
            placeholder: "请输入",
            clearable: true,
            filterable: true
        },
    },
    {
        label: "行政管理职务：",
        prop: "postCode",
        component: "el-select",
        options: postFn(),
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },

]

// 提交校验
export const addOrEditRules = {
    nickName: [
        { required: true, message: '请输入姓名', trigger: ['blur'] }
    ],
    dptCode: [
        { required: true, message: '请选择标准科室', trigger: ['change'] }
    ],
    hdptCode: [
        { required: true, message: '请选择实际科室', trigger: ['change'] }
    ],
    gh: [
        { required: true, message: '请输入工号', trigger: ['blur'] }
    ],
    phonenumber: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
        }
    ],
    medicalType: [
        { required: true, message: '请选择人员类型', trigger: ['change'] }
    ]
    // postCode: [
    //     { required: true, message: '请选择行政管理职务', trigger: ['change'] }
    // ],
}


// 密码重置
export const passWordItem = [
    {
        label: "验证密码：",
        prop: "password",
        component: "el-input",
        style: { width: "100%" },
        attrs: { placeholder: "请输入", clearable: true },
    }
]

// 密码重置校验
export const resetPwRules = {
    password: [
        { required: true, message: '请输入密码', trigger: ['blur'] }
    ]
}



//  角色管理 ----------
//  角色表格配置
export const bindRoleData = {
    apiUrl: "/business/SysRole/page",
    primaryKey: "roleId",
    checkBox: "1", //  是否需要复选框
    light: "1", //  是否需要高亮
    btnList: [
        { btnType: "add", text: "新增角色" }, //  新增
        { btnType: "edit", text: "编辑角色" }, //  新增
        { btnType: "edit", text: "绑定用户" }, //  新增
        { btnType: "delete", text: "删除" }, //  新增
    ],
    designTableColumns: [
        {
            columnLabel: "角色名称",
            columnName: "roleName",
            columnWidth: "180",
            showOverflowTooltip: true
        },
        {
            columnLabel: "角色英文名",
            columnName: "roleNameEn",
            columnWidth: "180",
            showOverflowTooltip: true
        },
        {
            columnLabel: "角色状态",
            columnName: "roleStatus",
            kyf: "1",
            columnWidth: "100",
            textAlign: "center",
            attrs: { "active-value": "1", "inactive-value": "0" },
        },
        {
            columnLabel: "角色描述",
            columnName: "roleDesc",
            showOverflowTooltip: true
        },
        {
            columnLabel: "创建时间",
            columnName: "createTime",
            columnWidth: "180",
            showOverflowTooltip: true
        }
    ],
}

// 搜索项配置
export const searchRoleItems = [
    {
        label: "角色名称：",
        prop: "roleName",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "角色状态：",
        prop: "roleStatus",
        component: "el-select",
        options: [
            { label: "启用", value: "1" },
            { label: "禁用", value: "0" }
        ],
        attrs: { placeholder: "请选择", style: { width: '220px' }, clearable: true },
    }
];

// 角色提交
export const roleItemsSubmit = [
    {
        label: "角色名称：",
        prop: "roleName",
        component: "el-input",
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "角色英文名：",
        prop: "roleNameEn",
        component: "el-input",
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "显示排序：",
        prop: "roleSort",
        component: "el-input-number",
        attrs: {
            min: 1,
            max: 100,
            placeholder: "请输入",
            clearable: true
        },
    },
    {
        label: "角色状态：",
        prop: "roleStatus",
        component: "el-switch",
        // options: yesOrNoFn(),
        attrs: {
            "active-value": "1",
            "inactive-value": "0",
        },
    },
    {
        label: "角色描述：",
        prop: "roleDesc",
        component: "el-input",
        attrs: { type: "textarea", rows: 8, resize: "none", placeholder: "请输入", clearable: true, maxlength: "100", showWordLimit: true },
    },
]

// 角色提交校验
export const roleRules = {
    roleName: [
        { required: true, message: '请输入角色名称', trigger: ['blur'] }
    ],
    roleNameEn: [
        { required: true, message: '请输入角色名称英文', trigger: ['blur'] }
    ],
}


// 绑定用户查询
export const userItems = [
    {
        label: "用户姓名：",
        prop: "nickName",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "联系电话：",
        prop: "phonenumber",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true, 'show-word-limit': false, },
    },
    {
        component: "el-tree-select",
        label: "标准科室：",
        prop: "dptCode",
        // options: standOptionsData,
        // montageName: true,
        optionLabel: "ksName",
        optionValue: "ksCode",
        style: { width: "220px" },
        attrs: {
            "node-key": 'ksCode',
            data: standOptionsData,
            placeholder: "请输入",
            clearable: true,
            filterable: true,
            props: {
                children: 'children',
                label: function (data, node) {
                    return data.ksCode + '/' + data.ksName
                }
            }
        },
    },
    {
        component: "el-select",
        label: "实际科室：",
        prop: "hdptCode",
        options: optionsData,
        optionLabel: "hospDptname",
        optionValue: "hospDptcode",
        style: { width: "220px" },
        montageName: true,
        attrs: {
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        label: "管理职务：",
        prop: "postCode",
        component: "el-select",
        options: postFn(),
        attrs: { placeholder: "请选择", style: { width: '220px' }, clearable: true },
    }
]
// 绑定用户列表
export const bindUserData = {
    apiUrl: "/business/SysUser/rangeRoles",
    primaryKey: "userId",
    checkBox: "1", //  是否需要复选框
    light: "0", //  是否需要高亮
    btnList: [
        { btnType: "add", text: "添加用户" }, //  新增
        { btnType: "delete", text: "解绑用户", icon: 'Paperclip' }, //  新增
    ],
    designTableColumns: [
        {
            columnLabel: "用户管理",
            columnName: "nickName",
            showOverflowTooltip: true
        },
        {
            columnLabel: "工号",
            columnName: "gh",
            showOverflowTooltip: true
        },
        {
            columnLabel: "标准科室名称",
            columnName: "dptName",
            showOverflowTooltip: true
        },
        {
            columnLabel: "标准科室代码",
            columnName: "dptCode",
            showOverflowTooltip: true
        },
        {
            columnLabel: "实际科室名称",
            columnName: "hdptName",
            showOverflowTooltip: true
        },
        {
            columnLabel: "实际科室代码",
            columnName: "hdptCode",
            showOverflowTooltip: true
        },
        {
            columnLabel: "联系电话",
            columnName: "phonenumber",
            showOverflowTooltip: true
        },
        {
            columnLabel: "人员类型",
            columnName: "medicalType",
            formatter: (row) => medicalTypeFn(row.medicalType, 'formatter'),
            showOverflowTooltip: true
        },
        {
            columnLabel: "业务/行政管理职务",
            columnName: "postCode",
            columnWidth: "180",
            formatter: (row) => postFn(row.postCode, 'formatter'),
            showOverflowTooltip: true
        },
        {
            columnLabel: "E-mail",
            columnName: "email",
            showOverflowTooltip: true
        },
        {
            columnLabel: "启用否",
            columnName: "status",
            kyf: "1",
            columnWidth: "100",
            textAlign: "center",
            attrs: { "active-value": "1", "inactive-value": "0", disabled: true },
        },
    ]
}

// 绑定用户查询
export const userItemsInfo = [
    {
        label: "用户姓名：",
        prop: "nickName",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true },
    },
    {
        label: "联系电话：",
        prop: "phonenumber",
        component: "el-input",
        style: { width: "220px" },
        attrs: { placeholder: "请输入", clearable: true, 'show-word-limit': false, },
    },
    {
        component: "el-tree-select",
        label: "标准科室：",
        prop: "dptCode",
        style: { width: "220px" },
        attrs: {
            "node-key": 'ksCode',
            data: standOptionsData,
            placeholder: "请输入",
            clearable: true,
            props: {
                children: 'children',
                label: function (data, node) {
                    return data.ksCode + '/' + data.ksName
                }
            }
        },
    },
    {
        component: "el-select",
        label: "实际科室：",
        prop: "hdptCode",
        options: optionsData,
        optionLabel: "hospDptname",
        optionValue: "hospDptcode",
        montageName: true,
        attrs: {
            placeholder: "请输入",
            clearable: true,
        },
    },
    {
        label: "管理职务：",
        prop: "postCode",
        component: "el-select",
        options: postFn(),
        attrs: { placeholder: "请选择", style: { width: '220px' }, clearable: true },
    }
]
// 绑定用户列表
export const bindUserDataInfo = {
    apiUrl: "/business/SysUser/rangeRoles",
    primaryKey: "userId",
    checkBox: "1", //  是否需要复选框
    light: "0", //  是否需要高亮
    bottomBtnList: [
        {
            btnType: "cancel",
        },
        {
            text: "保存",
            btnType: "add",
            typeRow: "selectType",
            icon: "",
            img: "",
        },
    ], // 表格按钮
    designTableColumns: [
        {
            columnLabel: "用户管理",
            columnName: "nickName",
            showOverflowTooltip: true
        },
        {
            columnLabel: "工号",
            columnName: "gh",
            showOverflowTooltip: true
        },
        {
            columnLabel: "标准科室",
            columnName: "dptName",
            showOverflowTooltip: true
        },
        {
            columnLabel: "实际科室",
            columnName: "hdptName",
            showOverflowTooltip: true
        },
        {
            columnLabel: "联系电话",
            columnName: "phonenumber",
            showOverflowTooltip: true
        },
        {
            columnLabel: "人员类型",
            columnName: "medicalType",
            formatter: (row) => medicalTypeFn(row.medicalType, 'formatter'),
            showOverflowTooltip: true
        },
        {
            columnLabel: "业务/行政管理职务",
            columnName: "postCode",
            columnWidth: "180",
            formatter: (row) => postFn(row.postCode, 'formatter'),
            showOverflowTooltip: true
        },
        {
            columnLabel: "E-mail",
            columnName: "email",
            showOverflowTooltip: true
        },
    ]
}


// 菜单查询
export const treeDataFn = (data, meunIdKey) => {
    return data.filter(item => item.menuId === meunIdKey)
}