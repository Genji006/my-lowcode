// 组件基础配置
export const createComponent = (type) => {
    // 生成唯一ID
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const templates = {
        'MyContainer': {
            name: '布局容器',
            // 容器在根画板时的默认样式
            style: { width: 100, height: 600, left: 10, top: 10, backgroundColor: '#ffffff', border: '1px dashed #ccc' },
            props: {
                // Flex 布局属性
                layout: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexWrap: 'nowrap',
                gap: 0,
                padding: 10,
                children: [] // 核心：存放子组件
            },
            triggerTypes: []
        },
        'MyTable': {
            name: '表格',
            style: { width: 100, height: 'auto', left: 10, top: 10 },
            props: {
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
                columns: [
                    { label: '姓名', prop: 'name', clickable: true },
                    { label: '职位', prop: 'role', clickable: true },
                    { label: '部门', prop: 'dept', clickable: false },
                    { label: '状态', prop: 'status', clickable: false }
                ],
                tableData: [
                ],
            },
            availableTriggers: [
                { label: '整行点击', value: 'rowClick' },
                { label: '多选改变', value: 'selectionChange' },
                { label: '页码切换', value: 'pageChange' }
            ]
        },
        'MyText': {
            name: '文本',
            style: { width: 20, height: 5, left: 0, top: 0, fontSize: 14 },
            props: { text: '普通文本', color: '#666', triggerMode: 'change' },
            availableTriggers: [{ label: '输入', value: 'change' }]
        },
        'MyChart': {
            name: '统计图表',
            style: { width: 100, height: 'auto', left: 0, top: 0 },
            props: {
                title: '用户访问统计',
                chartType: 'bar',    // 默认柱状图
                color: '#409EFF',    // 默认蓝色
                xAxisName: '日期',
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
                // 告诉组件：返回的数组里，哪个字段做X轴，哪个做Y轴
                mapping: {
                    xField: 'name',  // 维度字段 (Dimension)
                    yField: 'value'  // 指标字段 (Metric)
                }
            },
            bindKey: 'id',
            availableTriggers: [],
        },
        'MyForm': {
            name: '表单容器',
            style: { width: 100, height: 100, left: 5, top: 5, backgroundColor: '#fff', border: '1px solid #ddd', padding: '10px' },
            props: {
                model: {}, // 存储表单数据
                labelWidth: '100px',
                children: [], // 存放输入框等
                layout: 'flex',
                flexDirection: 'column', // 表单默认垂直排列
                justifyContent: 'flex-start',
                alignItems: 'stretch',   // 默认拉伸，让输入框占满宽度
                flexWrap: 'wrap',
                gap: 10,
                triggerMode: ''
            },
            availableTriggers: []
        },
        'MyInput': {
            name: '输入框',
            style: { width: 20, height: 10, position: 'relative' },
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
            name: '选择框',
            style: { width: 20, height: 10, position: 'relative' },
            props: {
                label: '选择框',
                fieldName: 'fieldName',
                placeholder: '请选择',
                options: [
                ],
                required: false,
                triggerMode: 'change'
            },
            availableTriggers: [{ label: '选择', value: 'change' }]
        },
        'MyButton': {
            name: '按钮',
            style: { width: 20, height: 10, position: 'relative' },
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
            // 默认宽100%，高度自适应
            style: { width: 100, height: 'auto', position: 'relative' },
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