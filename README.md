<!-- 安装依赖：

```
npm install
```

运行项目：

```
npm run dev
```

打包项目：

```
npm run build -->






<!-- 模型 -->
name：'新建作业'     path:'/newWork',       component:'dataOps/kettleTool/models/homework',
name：'新建转换'     path:'/newConvert',     component:'dataOps/kettleTool/models/newChange',
<!-- 平台 -->
name：'平台概况'     path:'/platformSurvey',       component:'dataOps/kettleTool/platform/platformSurvey',
<!-- 任务 -->
name：'作业管理'     path:'/homeworkManage',       component:'dataOps/kettleTool/task/homeworkManage',
name：'转换管理'     path:'/changeManage',     component:'dataOps/kettleTool/task/changeManage',
name：'任务组管理'     path:'/taskGroupManage',       component:'dataOps/kettleTool/task/taskGroupManage',
name：'任务监控'     path:'/taskMonitor',     component:'dataOps/kettleTool/task/taskMonitor',
<!-- 定时调度 -->
name：'定时调度管理'     path:'/timedSchedulingManage', component:'dataOps/kettleTool/timedScheduling/timedSchedulingManage',
<!-- 日志 -->
name：'任务历史日志'     path:'/historyLog',     component:'dataOps/kettleTool/logManage/historyLog',
<!-- 节点 -->
name：'节点管理'     path:'/nodeManage',       component:'dataOps/kettleTool/nodes/nodeManage',
name：'节点监控'     path:'/nodeMonitor',     component:'dataOps/kettleTool/nodes/nodeMonitor',
<!-- 用户 -->
name：'用户管理'     path:'/userManage',       component:'dataOps/kettleTool/user/userManage',
name：'用户组管理'     path:'/userGroupManage',     component:'dataOps/kettleTool/user/userGroupManage',

<!-- 表格组件更改专科项目需后续同步记录 -->
一、暴露名称
  1.状态变更事件-暴露名称 statusClick
  2.行点击事件-暴露名称 rowClick
  3.选中行事件-暴露名称 selectionChange
  4.展开收起事件-暴露名称 expandChange
  5.单元格点击事件-暴露名称 cellClick

<!-- 表格组件里面的JS return方法迁移到table.js文件 -->
二、优化
  1.弹窗表格组件分页与已选中条数
    <div
      style="
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
        height: 50px;
      "
    >
      <div v-if="selectShowFlag">已选：{{ selectRowList.length }} 条记录</div>
      <el-pagination
        v-if="booleanFn(pageOpen)"
        class="pSelect pageStyle"
        v-model:current-page="currentPage"
        v-model:page-size="pageSizes"
        :page-sizes="pageArr"
        :total="total"
        :prev-text="'上一页'"
        :next-text="'下一页'"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

  2.按钮优化

    const arrListBtn = [
      {
        text: "新增",
        btnType: "add",
        icon: "Plus",
        img: "/ItemImg/xinzen.svg",
        typeRow: "noneType", // noneType, rowType, selectType ,
        bind: { type: "base" },
      },
      {
        text: "编辑",
        btnType: "edit",
        icon: "Edit",
        img: "/ItemImg/bianji.svg",
        typeRow: "rowType",
        bind: { type: "base" },
      },
      {
        text: "详情",
        btnType: "detail",
        icon: "",
        img: "/ItemImg/zhuanhuanshuxing.svg",
        typeRow: "noneType",
        bind: { type: "base" },
      },
      {
        text: "删除",
        btnType: "delete",
        icon: "Delete",
        img: "/ItemImg/shanchu.svg",
        typeRow: "selectType",
        bind: { type: "delete" },
      },
      {
        // 单个删除
        text: "删除",
        btnType: "deletes",
        icon: "Delete",
        img: "/ItemImg/shanchu.svg",
        typeRow: "rowType",
        bind: { type: "delete" },
      },
      {
        text: "导入",
        btnType: "import",
        icon: "Upload",
        img: "",
        typeRow: "noneType",
        bind: { type: "base" },
      },
      {
        text: "上一步",
        btnType: "last",
        icon: "",
        img: "",
        typeRow: "noneType",
        bind: { type: "base" },
      },
      {
        text: "下一步",
        btnType: "next",
        icon: "",
        img: "",
        typeRow: "noneType",
        bind: { type: "base" },
      },
      {
        text: "取消",
        btnType: "cancel",
        icon: "",
        img: "",
        typeRow: "noneType",
        bind: { type: "cancel" },
      },
      {
        text: "确定",
        btnType: "confirm",
        icon: "",
        img: "",
        typeRow: "noneType",
        bind: { type: "base" },
      },
      {
        text: "确定",
        btnType: "save",
        icon: "",
        img: "",
        typeRow: "noneType",
        bind: { type: "base" },
      },
      {
        text: "回收站",
        btnType: "recycleBin",
        icon: "",
        img: "/ItemImg/huishouzhan.svg",
        typeRow: "noneType",
        bind: { type: "recycleBin" },
      },
      {
        text: '页面配置',
        btnType: 'set',
        icon: 'Setting',
        typeRow: 'rowType',
      },
      {
        text: '复制',
        btnType: 'copy',
        icon: 'DocumentCopy',
        typeRow: 'rowType',
      },
    ]

    // 按钮是否禁用
    export function disabledFn(type, lightRow, selectRow) {
      if (type && type == 'rowType') {
        if (lightRow && Object.keys(lightRow).length > 0) {
          return false
        } else {
          return true
        }
      } else if (type && type == 'selectType') {
        if (selectRow && selectRow.length > 0) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    }

    export function btnFn(data) {
      const btnMap = new Map(arrListBtn.map(item => [item.btnType, item]));
      return data.map(btnItem => ({ ...btnMap.get(btnItem.btnType), ...btnItem }));
    }


