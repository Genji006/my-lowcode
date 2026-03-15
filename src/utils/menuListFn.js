
export const menuListFn = () => {
    return [
        {
            "name": null,
            "path": '/',
            "component": null,
            "redirect": "noRedirect",
            "hidden": false,
            "meta": { "title": "库表结构管理", "icon": "system", "keepAlive": false },
            "children": [
                {
                    "name": "/library",
                    "path": "/library",
                    "component": "dataOps/library/index",
                    "hidden": false,
                    "meta": { "title": "库表结构", "icon": "system", "keepAlive": false },
                    "children": [],
                },
                {
                    "name": "DataSource",
                    "path": "/dataSource",
                    "component": "dataOps/dataSource/index",
                    "hidden": false,
                    "meta": { "title": "数据源管理", "icon": "system", "keepAlive": false },
                    "children": [],
                },
                {
                    "menuName": "医院科室信息管理",
                    "path": "/monitor/depInfoManagement",
                    "component": "monitor/depInfoManagement",
                    "hidden": false,
                    "meta": { "title": "应用项目管理", "icon": "system", "keepAlive": false },
                    "children": [],
                }
            ],
        },
        {
            "name": null,
            "path": null,
            "component": null,
            "meta": { "title": "用户管理", "icon": "system", "keepAlive": false },
            "children": [
                {
                    "name": "UserMange",
                    "path": "/userMange",
                    "component": "monitor/userMange",
                    "meta": { "title": "用户管理", "icon": "system", "keepAlive": false },
                    "children": [],
                }
            ],
        },
    ]
}