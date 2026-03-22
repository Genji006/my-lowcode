// 组件基础配置
export const createComponent = (type) => {
    // 生成唯一ID
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const templates = {
        'MyContainer': {
            name: '布局容器',
            // 容器在根画板时的默认样式
            style: { width: 100, height: 100, left: 10, top: 10, backgroundColor: '#efefef', border: '1px dashed #ccc' },
            props: {
                // Flex 布局属性
                layout: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexWrap: 'nowrap',
                gap: 5,
                // padding: 10,
                paddingTop: 10,
                paddingRight: 10,
                paddingBottom: 10,
                paddingLeft: 10,
                children: [] // 核心：存放子组件
            },
            triggerTypes: []
        },
        'MyTable': {
            name: '表格',
            style: { width: 100, height: 50, left: 10, top: 10 },
            props: {
                datasets: [
                    {
                        id: 'ds_1',
                        name: '默认视图',
                        sql: `SELECT 
    id,
    name AS 姓名,
    phone_number AS 手机号,
    role AS 职位,
    dept AS 所属部门,
    createTime AS 创建时间,
    status AS 状态
FROM sys_user u
LEFT JOIN sys_dept d ON dept_id = d.id
WHERE status = 1;`, // 这里存 SQL
                        columns: [
                            { label: '姓名', prop: 'name', clickable: true },
                            { label: '职位', prop: 'role', clickable: true },
                            { label: '部门', prop: 'dept', clickable: false },
                            { label: '状态', prop: 'status', clickable: false }
                        ]
                    }
                ],
                // 2. 当前激活的数据集 ID
                activeDatasetId: 'ds_1',

                triggerMode: 'rowClick',
                stripe: true,          // 斑马纹
                border: true,          // 边框
                size: 'default',       // 尺寸: large / default / small
                showHeader: true,      // 显示表头
                highlightCurrentRow: true, // 高亮当前行
                selection: false,      // 是否开启多选
                pagination: true,      // 是否显示分页
                pageSize: 10,          // 每页条数
                currentPage: 1,        // 当前页
                total: 0,              // 总数
                tableData: [
                ],
                // 【新增】用于存放自定义参数的数组
                customParams: []
            },
            availableTriggers: [
                { label: '整行点击', value: 'rowClick' },
                { label: '多选改变', value: 'selectionChange' },
                { label: '页码切换', value: 'pageChange' }
            ]
        },
        'MyText': {
            name: '文本',
            style: { width: 20, height: 10, left: 0, top: 0, fontSize: 14 },
            props: { text: '普通文本', color: '#666', triggerMode: 'change' },
            availableTriggers: [{ label: '输入', value: 'change' }]
        },
        'MyChart': {
            name: '折线图/柱形图',
            style: { width: 50, height: 30, left: 0, top: 0 },
            props: {
                title: '用户访问统计',
                chartType: 'bar',    // 默认柱状图
                colors: ['#409EFF'],    // 默认蓝色
                xAxisName: '日期',
                yAxisName: '数量',
                unit: '',
                // === 1. 数据源定义 ===
                dataType: 'api',
                // A. API 配置
                apiConf: {
                    url: '',
                    method: 'GET'
                },
                // B. SQL 配置
                sqlConf: {
                    sql: ""
                },
                // === 2. 字段映射 ===
                // // 告诉组件：返回的数组里，哪个字段做X轴，哪个做Y轴
                // mapping: {
                //     xField: 'name',  // 维度字段 (Dimension)
                //     yField: 'value'  // 指标字段 (Metric)
                // }
                designChartConfigList: [
                    {
                        field: 'value',       // 默认Y轴字段名
                        fieldName: '数量',    // 默认Y轴显示名称
                        chartType: 'value',   // 固定标识：值字段 (Y轴/指标)
                        dataFormat: '',
                        barChartType: ''
                    },
                    {
                        field: 'name',        // 默认X轴字段名
                        fieldName: '日期',    // 默认X轴显示名称
                        chartType: 'category',// 固定标识：分类字段 (X轴/维度)
                        dataFormat: '',
                        barChartType: ''
                    }
                ],
                // 【新增】用于存放自定义参数的数组
                customParams: []
            },
            bindKey: 'id',
            availableTriggers: [],
        },

        // === 饼图 ===
        'MyPieChart': {
            name: '饼图',
            style: { width: 100, height: 30, left: 0, top: 0 },
            props: {
                title: '占比分析',
                chartType: 'pie',
                colors: ['#409EFF'],
                unit: '',

                // 复用标准数据源配置
                dataType: 'api', // 默认给个静态方便展示
                apiConf: { url: '', method: 'GET' },
                sqlConf: { sql: "" },

                mapping: {
                    xField: 'name',  // 饼图的“扇区名”
                    yField: 'value'  // 饼图的“数值”
                }
            },
            bindKey: 'id',
            availableTriggers: []
        },

        // === 散点图 ===
        'MyScatterChart': {
            name: '散点图',
            style: { width: 100, height: 30, left: 0, top: 0 },
            props: {
                title: '数据分布',
                chartType: 'scatter',
                colors: ['#409EFF'],
                xAxisName: 'X轴', // 散点图通常需要轴名称
                yAxisName: 'Y轴',
                unit: '',

                dataType: 'api',
                apiConf: { url: '', method: 'GET' },
                sqlConf: { sql: "" },

                mapping: {
                    xField: 'x', // X轴字段
                    yField: 'y'  // Y轴字段
                }
            },
            bindKey: 'id',
            availableTriggers: []
        },

        // === 雷达图 ===
        'MyRadarChart': {
            name: '雷达图',
            style: { width: 100, height: 30, left: 0, top: 0 },
            props: {
                title: '能力评估',
                chartType: 'radar',
                colors: ['#409EFF'],
                unit: '',

                // 雷达图特有：指标配置 (通常是静态的配置)
                radarIndicators: JSON.stringify([
                    { name: '维度1', max: 100 },
                    { name: '维度2', max: 100 },
                    { name: '维度3', max: 100 },
                    { name: '维度4', max: 100 },
                    { name: '维度5', max: 100 }
                ]),

                dataType: 'api',
                apiConf: { url: '', method: 'GET' },
                sqlConf: { sql: "" },
                mapping: {
                    xField: 'name',  // 系列名称 (如：预算分配)
                    yField: 'value'  // 数值数组
                }
            },
            bindKey: 'id',
            availableTriggers: []
        },

        // 'MyForm': {
        //     name: '表单容器',
        //     style: { width: "100%", height: '100px', left: 5, top: 5, backgroundColor: '#fff', border: '1px solid #ddd', padding: '10px' },
        //     props: {
        //         model: {}, // 存储表单数据
        //         labelWidth: '100px',
        //         children: [], // 存放输入框等
        //         layout: 'flex',
        //         flexDirection: 'column', // 表单默认垂直排列
        //         justifyContent: 'flex-start',
        //         alignItems: 'stretch',   // 默认拉伸，让输入框占满宽度
        //         flexWrap: 'wrap',
        //         gap: 10,
        //         triggerMode: ''
        //     },
        //     availableTriggers: []
        // },
        'MyInput': {
            name: '输入框',
            style: { width: 20, height: 5, position: 'relative' },
            props: {
                label: '输入框',
                fieldName: 'username', // 关键：绑定到表单数据的哪个字段
                placeholder: '请输入...',
                defaultValue: '',
                required: false, // 简易开关
                rules: [], // 复杂规则
                triggerMode: 'change',
            },
            availableTriggers: [
                { label: '实时响应 (Change)', value: 'change' },
                { label: '失去焦点 (Blur)', value: 'blur' }
            ]
        },
        'MySelect': {
            name: '下拉选择',
            // 默认高度 auto，宽度 20%
            style: { width: 20, height: 5, position: 'relative' },
            props: {
                label: '部门',
                placeholder: '请选择部门',
                clearable: true,
                filterable: true,
                bindKey: 'id',
                // 数据源默认配置
                dataType: 'static',
                options: [
                    { label: '数据1', value: 'data1' },
                    { label: '数据2', value: 'data2' }
                ],
                apiConf: { url: '', method: 'GET' },
                sqlConf: { sql: '' },
                script: `const start = parseInt(apiParams?.yearStart) || new Date().getFullYear() - 3;
const end = parseInt(apiParams?.yearEnd) || new Date().getFullYear();
console.log('123456',apiParams)
const options = [];

// 2. 容错判断：如果起始大于结束，直接返回空或报错选项
if (start > end) {
    return [{ label: '时间范围错误', value: '' }];
}

// 3. 循环生成年份
for (let year = start; year <= end; year++) {
    options.push({
        label: year + '年',
        value: year.toString() // 保持 value 是字符串，以防后端强校验
    });
}

// 4. 返回数组
return options;`,
                mapping: { label: 'label', value: 'value' },
                triggerAction: 'change',
                defaultFirstOption: false,
            },
            availableTriggers: [{ label: '选择', value: 'change' }]
        },
        'MyButton': {
            name: '按钮',
            style: { width: 10, height: 5, position: 'relative' },
            props: {
                text: '提交表单',
                type: 'primary',
                actionType: 'submit',
                triggerMode: 'click'
            },
            availableTriggers: [{ label: '点击', value: 'click' }]
        },
        'MyQueryForm': {
            name: '查询表单',
            style: { width: 100, height: 5, position: 'relative' },
            props: {
                // 核心数据模型
                model: {
                    timeType: 'year',
                    date: '2023',
                    dept: ''
                },
                inline: true, // 行内表单模式
                labelWidth: '80px',
                triggerMode: 'search',

                // === 模式A: 配置式表单项 ===
                items: [
                    {
                        type: 'radio-group',
                        label: '时间:',
                        fieldName: 'timeType',
                        options: [
                            { label: '年', value: 'year' },
                            { label: '季', value: 'quarter' },
                            { label: '月', value: 'month' }
                        ]
                    },
                    {
                        type: 'date',
                        label: '',
                        fieldName: 'date',
                        dateType: 'year', // year/month/date
                        placeholder: '请选择年份'
                    },
                    {
                        type: 'select',
                        label: '科室名称',
                        fieldName: 'dept',
                        placeholder: '请选择',
                        options: [
                            { label: '内科', value: 'nk' },
                            { label: '外科', value: 'wk' }
                        ]
                    }
                ],

                // === 模式B: 完全自定义插槽代码 ===
                slot: '' // 如果有值，将覆盖 items 的渲染
            },
            availableTriggers: [{ label: '查询', value: 'search' }, { label: '重置', value: 'reset' }]
        },
        'MyDatePicker': {
            name: '日期时间',
            type: 'MyDatePicker',
            icon: 'date', // 假设左侧菜单的图标名
            style: { width: 20, height: 5, position: 'relative' },
            props: {
                label: '时间选择',
                fieldName: 'date_1',
                placeholder: '请选择时间',
                startPlaceholder: '开始时间',
                endPlaceholder: '结束时间',

                // 组件类型：date(单日), datetime(单日+时间), daterange(日期范围), datetimerange(时间范围)
                type: 'date',
                // 绑定的值格式 (发送给后端的格式)
                valueFormat: 'YYYY-MM-DD',

                // 数据源类型: static(固定值), api(接口拉取), script(自定义脚本)
                dataType: 'static',

                // 静态默认值
                defaultValue: null,

                // 脚本默认值 (默认给个示例脚本)
                script: `if(route.query.yearStart && route.query.yearEnd) {
                            return [route.query.yearStart, route.query.yearEnd];
                        }
                        return [];`,

                // 接口配置 (复用您之前的体系)
                apiConf: { url: '', method: 'GET' }
            },
            availableTriggers: [{ label: '值改变', value: 'change' }]
        },
        'DashBoard': {
            name: '指标卡片',
            props: {
                type: 0,       // 0:普通 1:特殊(是否) 2:特殊(优良等级)
                indexId: '',
            },
            style: { width: 20, height: 20, position: 'relative' },
        },
        'calCard': {
            name: '计算规则卡片',
            props: {
            },
            style: { width: 20, height: 10, position: 'relative' },
        },
        'MyTree': {
            name: '树形选择器',
            props: {
                title: '科室',
                showSearch: true,
                showCheckbox: true,
                defaultExpandAll: true,
                nodeKey: 'ksCode',
                labelKey: 'ksName',
                childrenKey: 'childlist',
            },
            style: {
                width: 20,   // 树形面板一般窄一点
                height: 60, // 通常撑满左侧
                position: 'relative'
            }
        },
        'MyDynamicTitle': {
            name: '动态标题',
            props: {
                title: '',
                templateStr: '( {yearStart} )',
            },
            style: {
                width: 15,
                height: 10,
                position: 'relative'
            }
        },
        'MySpChart': {
            name: '指标图表',
            props: {
            },
            style: {
                width: 100,
                height: 100,
                position: 'relative'
            }
        },
    };

    const tpl = templates[type];

    return {
        id,
        type,
        name: tpl.name,
        // 样式分离：style 控制外壳，props 控制内容
        style: { ...tpl.style },
        props: JSON.parse(JSON.stringify(tpl.props)),
        triggerTypes: tpl.triggerTypes || [],
        events: [],
        availableTriggers: tpl.availableTriggers || []
    };
};