// 组件事件管理
import { defineStore } from 'pinia';
import { ref } from 'vue';
import router from '@/router';

export const useDesignStore = defineStore('design', () => {
    const components = ref([]); // 树形结构
    const activeId = ref(null);

    const setActive = (id) => activeId.value = id;

    // 递归查找并添加子组件
    const findAndAdd = (list, parentId, newComp) => {
        for (let item of list) {
            // 1. 找到了目标容器
            if (item.id === parentId) {
                if (!item.props.children) item.props.children = [];
                item.props.children.push(newComp);
                return true;
            }
            // 2. 没找到，继续去它的子级里找
            if (item.props.children && item.props.children.length > 0) {
                if (findAndAdd(item.props.children, parentId, newComp)) return true;
            }
        }
        return false;
    };

    // 参数 parentId: 如果有值，说明是拖进容器里的
    const addComponent = (newComp, parentId = null) => {
        if (!parentId) {
            components.value.push(newComp); // 根节点
        } else {
            findAndAdd(components.value, parentId, newComp); // 子节点
        }
    };

    // 更新样式
    const updateComponentStyle = (id, style) => {
        // 简单递归查找更新
        const findAndUpdate = (list) => {
            for (let item of list) {
                if (item.id === id) {
                    Object.assign(item.style, style);
                    return true;
                }
                if (item.props.children) {
                    if (findAndUpdate(item.props.children)) return true;
                }
            }
        };
        findAndUpdate(components.value);
    };

    const findCompById = (list, id) => {
        for (let item of list) {
            if (item.id === id) return item;
            if (item.props.children && item.props.children.length > 0) {
                const found = findCompById(item.props.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const deleteComponent = (id) => {
        // 定义一个递归删除函数
        const removeRecursive = (list) => {
            // 1. 先尝试在当前层级找
            const idx = list.findIndex(item => item.id === id);
            if (idx !== -1) {
                list.splice(idx, 1); // 找到了，删除！
                return true;
            }

            // 2. 没找到，去子容器里找
            for (const item of list) {
                if (item.props && item.props.children && item.props.children.length > 0) {
                    const deleted = removeRecursive(item.props.children);
                    if (deleted) return true; // 子里面删掉了，任务完成
                }
            }
            return false;
        };

        // 执行删除
        removeRecursive(components.value);

        // 如果删除的是当前选中的组件，清空选中状态
        if (activeId.value === id) {
            activeId.value = null;
        }
    };


    // === 移动组件 (支持双向拖拽) ===
    const moveComponent = (srcId, targetId) => {
        if (srcId === targetId) return;

        // 1. 辅助函数：查找节点及其父列表
        const findNodeInfo = (list, id, parentList = null) => {
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                if (item.id === id) {
                    return { item, parentList, index: i };
                }
                if (item.props && item.props.children && item.props.children.length > 0) {
                    const res = findNodeInfo(item.props.children, id, item.props.children);
                    if (res) return res;
                }
            }
            return null;
        };

        const srcInfo = findNodeInfo(components.value, srcId, components.value);
        const targetInfo = findNodeInfo(components.value, targetId, components.value);

        if (!srcInfo || !targetInfo) return;
        if (srcInfo.parentList !== targetInfo.parentList) {
            console.warn('暂不支持跨容器拖拽排序');
            return;
        }

        const list = srcInfo.parentList;

        // 1. 获取要移动的元素
        const storedItem = list[srcInfo.index];
        // 2. 从列表中移除它
        list.splice(srcInfo.index, 1);
        // 3. 计算插入位置
        let insertIndex = targetInfo.index;
        list.splice(insertIndex, 0, storedItem);
    };

    // 导出 JSON：直接导出整个树，包含样式和嵌套结构
    const getJsonString = () => {
        return JSON.stringify(components.value, null, 2);
    };

    return {
        components,
        activeId,
        addComponent,
        setActive,
        getJsonString,
        updateComponentStyle,
        deleteComponent,
        moveComponent
    };
});