// src/api/mock.js

// 模拟延迟
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 模拟数据库数据
const db = {
    users: [
        { id: 101, name: '张三', role: 'Developer', dept: '技术部', status: '在职', createTime: '2023-01-01' },
        { id: 102, name: '李四', role: 'Designer', dept: '设计部', status: '在职', createTime: '2023-01-02' },
        { id: 103, name: '王五', role: 'Manager', dept: '产品部', status: '休假', createTime: '2023-01-03' },
        { id: 104, name: '赵六', role: 'Developer', dept: '技术部', status: '离职', createTime: '2023-01-04' },
        { id: 105, name: '钱七', role: 'Tester', dept: '测试部', status: '在职', createTime: '2023-01-05' },
    ],
    // 专门为不同图表准备的数据源
    chartData: {
        // 1. 折线/柱状图数据 (Key-Value 形式)
        'bar_line': [
            { name: '周一', value: 120 },
            { name: '周二', value: 200 },
            { name: '周三', value: 150 },
            { name: '周四', value: 80 },
            { name: '周五', value: 70 }
        ],
        // 2. 饼图数据 (Name-Value 形式)
        'pie': [
            { name: '技术部', value: 40 },
            { name: '设计部', value: 30 },
            { name: '产品部', value: 20 },
            { name: '市场部', value: 10 }
        ],
        // 3. 雷达图数据 (Name-List 形式)
        'radar': [
            { name: '预算分配', value: [42, 30, 20, 35, 50, 18] },
            { name: '实际开销', value: [50, 14, 28, 26, 42, 21] }
        ],
        // 4. 散点图数据 (X-Y 坐标形式)
        'scatter': [
            { x: 10, y: 8.04 },
            { x: 8, y: 6.95 },
            { x: 13, y: 7.58 },
            { x: 9, y: 8.81 },
            { x: 11, y: 8.33 },
            { x: 14, y: 9.96 },
            { x: 6, y: 7.24 },
            { x: 4, y: 4.26 },
            { x: 12, y: 10.84 },
            { x: 7, y: 4.82 },
            { x: 5, y: 5.68 }
        ]
    }
};

export const mockApi = {
    // 接口A：获取用户列表
    getUsers: async (params = {}) => {
        await delay(800);

        let res = db.users;
        if (params.dept) res = res.filter(u => u.dept.includes(params.dept));
        if (params.name) res = res.filter(u => u.name.includes(params.name));
        if (params.id) res = res.filter(u => u.id === Number(params.id));
        if (params.status) res = res.filter(u => u.status === params.status);

        return { code: 200, data: res, total: res.length, msg: 'success' };
    },

    // 接口B：获取图表统计数据 (智能适配)
    getStats: async (params = {}) => {
        console.log('[MockAPI] getStats calling with:', params);
        await delay(500);

        // 您可以在前端组件的 apiConf.url 中传参来区分请求什么数据
        // 例如: /api/stats?type=radar
        // 这里简单模拟：根据 url 或随机返回，或者默认返回折线图数据

        // 简单策略：如果是为了测试雷达图，我们在组件里手动指定了 url 参数包含 'radar'
        // 或者这里默认返回一个结构，让前端自己去适配

        // 为了方便演示，我这里做一个 hack：
        // 如果 targetId 是 'radar'，返回雷达数据；是 'scatter'，返回散点数据
        // 实际项目中应该是根据 url 或 type 参数

        const type = params.type || 'bar_line'; // 默认为柱状图数据

        // 尝试从 db.chartData 中获取，如果没有则返回默认
        let data = db.chartData[type] || db.chartData['bar_line'];

        // 如果传了 targetId (比如联动)，我们可以稍微改动一下数据，模拟动态效果
        if (params.targetId && type === 'bar_line') {
            data = data.map(item => ({ ...item, value: item.value + Math.floor(Math.random() * 50) }));
        }

        return {
            code: 200,
            data: data,
            msg: 'success'
        };
    },

    // 兼容旧接口名
    getUserStats: async (params) => {
        return mockApi.getStats(params);
    },

    getUsersByQuery: async (params = {}) => {
        return mockApi.getUsers(params);
    },

    submitForm: async (data) => {
        await delay(1000);
        return { code: 200, msg: '提交成功' };
    },

    parseSql: async (params = {}) => {
        await delay(1000);
        const sql = (params.sql || '').trim();
        if (!sql.toLowerCase().startsWith('select')) return { code: 500, msg: 'SQL 语法错误: 必须以 SELECT 开头' };
        const match = sql.match(/SELECT\s+(.+?)\s+FROM/is);
        if (!match || !match[1]) return { code: 500, msg: '无法识别查询字段' };

        const rawCols = match[1].split(',');
        const columns = [];
        rawCols.forEach(colStr => {
            colStr = colStr.trim();
            if (!colStr) return;
            const parts = colStr.split(/\s+/); // 简单处理空格分隔的别名
            const prop = parts[0].replace(/['"`]/g, '');
            const label = parts.length > 1 ? parts[parts.length - 1].replace(/['"`]/g, '') : prop;
            columns.push({ label, prop, width: '', align: 'left' });
        });
        return { code: 200, msg: '解析成功', data: columns };
    }
};