import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模拟API响应数据
const res = {
  code: 200,
  msg: "获取用户信息成功",
  data: {
    name: "admin",
    age: 25,
    email: "admin@demo.cn",
    menus: [
      {
        id: 1,
        pid: 0,
        name: "dashboard",
        title: "首页",
        icon: "el-icon-s-home",
        leavel: 1,
        sort: 1,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 2,
        pid: 0,
        name: "system",
        title: "系统管理",
        icon: "el-icon-s-tools",
        leavel: 1,
        sort: 2,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 3,
        pid: 2,
        name: "user",
        title: "用户管理",
        icon: "el-icon-user",
        leavel: 2,
        sort: 1,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 4,
        pid: 2,
        name: "role",
        title: "角色管理",
        icon: "el-icon-s-custom",
        leavel: 2,
        sort: 2,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 5,
        pid: 0,
        name: "monitor",
        title: "系统监控",
        icon: "el-icon-monitor",
        leavel: 1,
        sort: 3,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 6,
        pid: 5,
        name: "online",
        title: "在线用户",
        icon: "el-icon-user",
        leavel: 2,
        sort: 1,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 7,
        pid: 5,
        name: "log",
        title: "操作日志",
        icon: "el-icon-document",
        leavel: 2,
        sort: 2,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 8,
        pid: 0,
        name: "tool",
        title: "系统工具",
        icon: "el-icon-s-operation",
        leavel: 1,
        sort: 4,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 9,
        pid: 8,
        name: "build",
        title: "表单构建",
        icon: "el-icon-edit",
        leavel: 2,
        sort: 1,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 10,
        pid: 8,
        name: "gen",
        title: "代码生成",
        icon: "el-icon-cpu",
        leavel: 2,
        sort: 2,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
      {
        id: 99,
        pid: 10,
        name: "gen",
        title: "代码生成",
        icon: "el-icon-cpu",
        leavel: 2,
        sort: 2,
        hidden: false,
        createTime: "2024-01-01 00:00:00",
      },
    ],
    avatar:
      "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
  },
};

// 将扁平数据转换为树形结构
function buildTree(items) {
  const tree = [];
  const map = {};

  // 首先将所有项放入map中
  items.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  // 构建树形结构
  items.forEach((item) => {
    if (item.pid === 0) {
      tree.push(map[item.id]);
    } else {
      if (map[item.pid]) {
        map[item.pid].children.push(map[item.id]);
      }
    }
  });

  return tree;
}

// 生成Vue文件
function generateVueFiles(tree, baseDir) {
  tree.forEach((item) => {
    if (item.children && item.children.length > 0) {
      // 创建目录
      const dir = path.join(baseDir, item.name);
      fs.mkdirSync(dir, { recursive: true });

      // 为每个子项创建Vue文件
      item.children.forEach((sub) => {
        const filePath = path.join(dir, `${sub.name}.vue`);
        const content = `<template>
  <div class="${sub.name}-container">
    ${sub.title}
  </div>
</template>

<script setup>
// ${sub.title} 页面逻辑
</script>

<style lang="less" scoped>

</style>`;

        fs.writeFileSync(filePath, content, "utf-8");
        console.log(`Created file: ${filePath}`);
      });
    }
  });
}

// 主函数
function main() {
  const baseDir = path.join(__dirname, "src/views");
  const tree = buildTree(res.data.menus);

  // 确保基础目录存在
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  generateVueFiles(tree, baseDir);
  console.log("文件生成完成！");
}

main();
