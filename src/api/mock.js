// 模拟延迟
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 模拟数据库数据
const db = {
    users: [
        { id: 101, name: '张三', role: 'Developer', dept: '技术部', status: '在职' },
        { id: 102, name: '李四', role: 'Designer', dept: '设计部', status: '在职' },
        { id: 103, name: '王五', role: 'Manager', dept: '产品部', status: '休假' },
        { id: 104, name: '赵六', role: 'Developer', dept: '技术部', status: '离职' },
        { id: 105, name: '钱七', role: 'Tester', dept: '测试部', status: '在职' },
    ],
    stats: {
        '101': [
            { date: '周一', count: 120 },
            { date: '周二', count: 200 },
            { date: '周三', count: 150 },
            { date: '周四', count: 80 },
            { date: '周五', count: 70 }
        ],
        '102': [
            { date: '周一', count: 80 },
            { date: '周二', count: 100 },
            { date: '周三', count: 90 },
            { date: '周四', count: 110 },
            { date: '周五', count: 130 }
        ],
        'default': [
            { date: '周一', count: 50 },
            { date: '周二', count: 50 },
            { date: '周三', count: 50 },
            { date: '周四', count: 50 },
            { date: '周五', count: 50 }
        ]
    }
};

export const mockApi = {
    /**
     * 获取用户列表 (支持按部门 dept 和 姓名 name 过滤)
     * 用于 MyQueryForm -> MyTable 的联动
     */
    getUsers: async (params = {}) => {
        console.log('[MockAPI] getUsers calling with:', params);
        await delay(1500); // 模拟网络延迟

        let res = db.users;

        // 1. 部门筛选
        if (params.dept) {
            res = res.filter(u => u.dept.includes(params.dept));
        }

        // 2. 姓名筛选 (模糊)
        if (params.name) {
            res = res.filter(u => u.name.includes(params.name));
        }

        // 3. 状态筛选
        if (params.status) {
            res = res.filter(u => u.status === params.status);
        }

        return {
            code: 200,
            data: res,
            total: res.length,
            msg: 'success'
        };
    },

    /**
     * 获取用户统计数据 (支持按 userId 查询)
     * 用于 MyTable -> MyChart 的联动
     */
    getStats: async (params = {}) => {
        console.log('[MockAPI] getStats calling with:', params);
        await delay(800);

        // 尝试从各种可能的字段中获取 ID (兼容 bindKey 配置)
        const targetId = String(
            params.targetId || params.id || params.userId || 'default'
        );

        // 获取数据，如果没有对应ID则返回默认数据
        const data = db.stats[targetId] || db.stats['default'];

        return {
            code: 200,
            data: data, // 直接返回数组 [1,2,3]
            title: `用户 ${targetId} 的绩效趋势`,
            msg: 'success'
        };
    },

    /**
     * 模拟登录/提交表单
     */
    submitForm: async (data) => {
        await delay(1000);
        return { code: 200, msg: '提交成功' };
    },

    parseSql: async (params = {}) => {
        console.log('[MockAPI] parseSql calling with:', params.sql);
        await delay(1200); // 模拟后端解析耗时

        const sql = (params.sql || '').trim();

        // 1. 简单校验
        if (!sql.toLowerCase().startsWith('select')) {
            return { code: 500, msg: 'SQL 语法错误: 必须以 SELECT 开头' };
        }

        // 2. 正则提取 SELECT 和 FROM 之间的内容
        const selectRegex = /SELECT\s+(.+?)\s+FROM/is;
        const match = sql.match(selectRegex);

        if (!match || !match[1]) {
            return { code: 500, msg: '无法识别查询字段，请检查 SQL 格式' };
        }

        const rawCols = match[1].split(',');
        const columns = [];

        // 3. 遍历解析每一列
        rawCols.forEach(colStr => {
            colStr = colStr.trim();
            if (!colStr) return;

            let label = '';
            let prop = '';

            // 处理 AS 别名 (忽略大小写)
            const asIndex = colStr.toUpperCase().lastIndexOf(' AS ');

            if (asIndex > -1) {
                // 显式别名: "u.username AS 姓名"
                const part1 = colStr.substring(0, asIndex).trim(); // u.username
                const part2 = colStr.substring(asIndex + 4).trim(); // 姓名
                prop = part1.includes('.') ? part1.split('.')[1] : part1;
                label = part2;
            } else {
                // 隐式别名或无别名: "username 姓名" 或 "username"
                const parts = colStr.split(/\s+/);
                if (parts.length > 1) {
                    const p1 = parts[0];
                    const p2 = parts[parts.length - 1];
                    prop = p1.includes('.') ? p1.split('.')[1] : p1;
                    label = p2;
                } else {
                    prop = colStr.includes('.') ? colStr.split('.')[1] : colStr;
                    label = prop;
                }
            }

            // 清理引号
            prop = prop.replace(/['"`]/g, '');
            label = label.replace(/['"`]/g, '');

            columns.push({
                label: label,
                prop: prop,
                width: '',
                align: 'left',
                fixed: false
            });
        });

        return {
            code: 200,
            msg: '解析成功',
            data: columns // 返回生成的列配置数组
        };
    }
};